'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${product.slug}`} className="font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                  {product.name}
                </Link>
                <p className="text-primary-600 font-bold mt-1">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-lg text-sm">−</button>
                    <span className="px-3 py-1 font-medium border-x border-gray-300 text-sm">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-lg text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(product.id)} className="text-red-500 hover:text-red-700 text-sm transition-colors">
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-500">Add ${(100 - subtotal).toFixed(2)} more for free shipping</p>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center mt-4 block">
            Proceed to Checkout
          </Link>
          <Link href="/products" className="btn-secondary w-full text-center mt-2 block text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
