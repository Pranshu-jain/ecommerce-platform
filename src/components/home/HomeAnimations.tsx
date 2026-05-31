'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category, Product } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: 'easeOut' as const },
  }),
};

interface Props {
  categories: Category[];
  featuredProducts: Product[];
}

export default function HomeAnimations({ categories }: Props) {
  return (
    <div className="max-w-2xl py-24">
      {/* Badge */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
          </span>
          New arrivals this week
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
      >
        Discover
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          Amazing Products
        </span>
        You'll Love
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="text-lg text-gray-300 mb-10 leading-relaxed max-w-lg"
      >
        Thousands of premium products with fast shipping, easy returns, and unbeatable prices.
      </motion.p>

      {/* CTAs */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-4 mb-14">
        <Link
          href="/products"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          Shop Now
        </Link>
        <Link
          href="/products?featured=true"
          className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all duration-200 text-sm"
        >
          Featured Items
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-8">
        {[
          { value: '10k+', label: 'Products' },
          { value: '50k+', label: 'Customers' },
          { value: '4.9★', label: 'Rating' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
