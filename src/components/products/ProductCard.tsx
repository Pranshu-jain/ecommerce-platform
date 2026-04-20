'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <div className="card group hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>
        {product.avg_rating && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-sm">
              {'★'.repeat(Math.round(product.avg_rating))}
              {'☆'.repeat(5 - Math.round(product.avg_rating))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through">${product.compare_price.toFixed(2)}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="w-full mt-3 btn-primary text-sm py-2 disabled:opacity-50"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
