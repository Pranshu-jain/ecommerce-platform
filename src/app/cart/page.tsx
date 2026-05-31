'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;
  const freeShippingProgress = Math.min((subtotal / 100) * 100, 100);
  const amountToFreeShipping = Math.max(100 - subtotal, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-14 h-14 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven&apos;t added anything yet. Explore our products and find something you love!</p>
          <Link href="/products" className="btn-primary px-8 py-3 text-base">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Your Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/products" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence initial={false}>
            {items.map(({ product, quantity }) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <Link href={`/products/${product.slug}`} className="shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {product.category_name && (
                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-0.5">{product.category_name}</p>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty stepper */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg font-medium"
                      >−</button>
                      <span className="w-8 text-center font-semibold text-sm text-gray-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-lg font-medium"
                      >+</button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-base">${(Number(product.price) * quantity).toFixed(2)}</p>
                      {quantity > 1 && (
                        <p className="text-xs text-gray-400">${Number(product.price).toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear cart */}
          <button
            onClick={clearCart}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 mb-5">Order Summary</h2>

            {/* Free shipping progress */}
            <div className="mb-5 p-3.5 bg-indigo-50 rounded-xl">
              {shipping === 0 ? (
                <p className="text-indigo-700 font-semibold text-sm flex items-center gap-1.5">
                  <span>🎉</span> You qualify for free shipping!
                </p>
              ) : (
                <>
                  <p className="text-sm text-indigo-700 font-medium mb-2">
                    Add <span className="font-bold">${amountToFreeShipping.toFixed(2)}</span> for free shipping
                  </p>
                  <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Line items */}
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-black text-xl text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 text-sm"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              {[
                { icon: '🔒', text: 'Secure' },
                { icon: '↩️', text: '30-day returns' },
                { icon: '🚀', text: 'Fast shipping' },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
