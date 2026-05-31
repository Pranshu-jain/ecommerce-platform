'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProduct(data); setLoading(false); });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="shimmer rounded-3xl h-[480px]" />
          <div className="space-y-4 pt-4">
            <div className="shimmer h-5 w-24 rounded-full" />
            <div className="shimmer h-9 w-3/4 rounded-xl" />
            <div className="shimmer h-6 w-32 rounded-xl" />
            <div className="shimmer h-20 rounded-xl" />
            <div className="shimmer h-12 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const discount = product.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : null;

  const images: string[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images as string[]
    : product.image_url ? [product.image_url] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link href={`/products?category=${(product as Record<string, unknown>).category_slug as string}`} className="hover:text-indigo-600 transition-colors capitalize">
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-3xl overflow-hidden bg-gray-50 shadow-sm"
            style={{ height: '460px' }}
          >
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                -{discount}% OFF
              </div>
            )}
            {product.featured && (
              <div className="absolute top-4 right-4 bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                Featured
              </div>
            )}
          </motion.div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-indigo-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          {product.category_name && (
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-2">{product.category_name}</p>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating && Number(product.avg_rating) > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-4 h-4 ${s <= Math.round(Number(product.avg_rating)) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">{Number(product.avg_rating).toFixed(1)} ({product.review_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-gray-900">${Number(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-xl text-gray-400 line-through font-medium">${Number(product.compare_price).toFixed(2)}</span>
            )}
            {discount && (
              <span className="bg-red-50 text-red-600 font-bold text-sm px-2.5 py-0.5 rounded-full">
                Save ${(Number(product.compare_price) - Number(product.price)).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">{product.description}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity + Add to cart */}
          {product.stock > 0 ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors text-xl font-medium">−</button>
                  <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors text-xl font-medium">+</button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} available</span>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 rounded-full font-bold text-base transition-all duration-300 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                }`}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    Added to Cart!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart · ${(Number(product.price) * quantity).toFixed(2)}
                  </span>
                )}
              </motion.button>

              <Link href="/cart" className="w-full flex items-center justify-center py-3.5 rounded-full border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 font-semibold transition-all text-sm">
                View Cart
              </Link>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl text-center text-gray-500 font-medium">
              This product is currently out of stock
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            {[
              { icon: '🚀', label: 'Fast Shipping' },
              { icon: '🔒', label: 'Secure Payment' },
              { icon: '↩️', label: '30-Day Returns' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-xl">{b.icon}</span>
                <span className="text-xs text-gray-600 font-semibold">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {(product.tags as string[]).map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full font-medium capitalize">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
