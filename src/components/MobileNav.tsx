'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Pin, Settings } from 'lucide-react';

const TAB_ITEMS = [
  { href: '/',                    label: 'ホーム', icon: Home },
  { href: '/manuals',             label: '探す',   icon: Search },
  { href: '/instructions/new',    label: '作成',   icon: Plus, isFab: true },
  { href: '/pinned',              label: 'ピン',   icon: Pin },
  { href: '/settings',            label: '設定',   icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-surface border-t border-ink-200 flex z-40">
      {TAB_ITEMS.map(({ href, label, icon: Icon, isFab }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
            style={{ color: active ? 'var(--color-accent)' : 'var(--color-ink-500)' }}
          >
            {isFab ? (
              <div
                className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center -mt-3.5"
                style={{ boxShadow: '0 4px 12px rgba(14,163,125,.35)' }}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
            ) : (
              <Icon size={20} strokeWidth={1.8} />
            )}
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
