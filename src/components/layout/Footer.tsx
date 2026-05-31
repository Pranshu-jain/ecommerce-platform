import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">ShopHub</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Premium products delivered to your door. Quality you can trust, prices you'll love.
            </p>
            <div className="flex gap-3">
              {['Twitter', 'Instagram', 'Facebook'].map((s) => (
                <div key={s} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <span className="text-xs text-gray-400">{s[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products', href: '/products' },
                { label: 'Electronics', href: '/products?category=electronics' },
                { label: 'Clothing', href: '/products?category=clothing' },
                { label: 'Sports', href: '/products?category=sports' },
                { label: 'Featured', href: '/products?featured=true' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Create Account', href: '/auth/register' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Cart', href: '/cart' },
              ],
            },
            {
              title: 'Benefits',
              links: [
                { label: 'Free shipping on $100+', href: '#' },
                { label: '30-day easy returns', href: '#' },
                { label: 'Secure checkout', href: '#' },
                { label: '24/7 support', href: '#' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">Privacy</span>
            <span className="text-xs text-gray-600">Terms</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Secure Payments
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
