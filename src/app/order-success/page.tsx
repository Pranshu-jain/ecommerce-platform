'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-100 px-4 py-2 rounded-lg inline-block">
          Order ID: {orderId}
        </p>
      )}
      <p className="text-gray-600 mb-8">
        You will receive a confirmation email shortly. Your order is being processed and will be shipped soon.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
        <Link href="/orders" className="btn-secondary">View Orders</Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
