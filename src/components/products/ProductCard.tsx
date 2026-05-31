'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    addItem(product);
    await new Promise(r => setTimeout(r, 800));
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-gray-50" style={{ height: '240px' }}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-200">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {discount && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || adding}
            className="bg-white text-gray-900 font-semibold text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 disabled:opacity-50 translate-y-2 group-hover:translate-y-0 transition-transform"
          >
            {adding ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Adding...
              </span>
            ) : product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1.5">{product.category_name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {product.avg_rating && Number(product.avg_rating) > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(product.avg_rating)) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>
        ) : <div className="mb-3" />}

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">${Number(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through">${Number(product.compare_price).toFixed(2)}</span>
            )}
          </div>
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-orange-500 font-semibold">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
