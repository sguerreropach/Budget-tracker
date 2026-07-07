'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/transactions', label: 'Transactions', icon: '💸' },
  { href: '/groceries', label: 'Groceries', icon: '🛒' },
  { href: '/savings', label: 'Savings', icon: '💎' },
  { href: '/loans', label: 'Loans', icon: '🎓' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Nav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  const cls = (href) => (pathname === href ? 'active' : '');

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">💰 Personal Budget</span>
          <nav className="topnav">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={cls(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <nav className="bottomnav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={cls(l.href)}>
            <span className="icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
