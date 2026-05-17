'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, Search, Pin, FileEdit, Clock, Bell,
  AlertTriangle,
} from 'lucide-react';
import { getAllInstructions } from '@/lib/storage';
import { getOfficialCounts, getPendingCategories } from '@/lib/categoryRegistry';
import GoogleSignInButton from './GoogleSignInButton';
import DriveFolderPicker from './DriveFolderPicker';
import { getTargetFolder, DriveFolder } from '@/lib/googleDrive';
import { isGoogleConfigured, getAuthState } from '@/lib/googleAuth';

const NAV_ITEMS = [
  { href: '/',                     label: 'ホーム',       icon: Home },
  { href: '/manuals',              label: '手順書を探す', icon: Search },
  { href: '/pinned',               label: 'ピン留め',     icon: Pin },
  { href: '/instructions/drafts', label: '下書き',       icon: FileEdit },
  { href: '/history',              label: '閲覧履歴',     icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [categoryCounts, setCategoryCounts] = useState<{ id: string; label: string; color: string; count: number }[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);

  useEffect(() => {
    const items = getAllInstructions();
    setCategoryCounts(getOfficialCounts(items));
    setPendingCount(getPendingCategories(items).length);
    setCurrentFolder(getTargetFolder());
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleFolderSelected = (folder: DriveFolder | null) => {
    setCurrentFolder(folder ?? getTargetFolder());
  };

  const handleFolderClick = () => {
    const auth = getAuthState();
    if (isGoogleConfigured() && auth.isSignedIn) {
      setShowFolderPicker(true);
    }
  };

  return (
    <>
      <aside className="hidden md:flex w-[228px] shrink-0 flex-col h-screen sticky top-0 bg-ink-900 text-white/86 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-[18px] py-[18px] pb-4">
          <div className="w-[30px] h-[30px] rounded-[7px] bg-accent text-white flex items-center justify-center font-extrabold font-display text-sm shrink-0">
            M
          </div>
          <div>
            <div className="font-bold text-[13px] tracking-[.02em]">手順書管理</div>
            <div className="text-[10px] text-white/45 font-mono">HORIZON-JIT</div>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="px-2.5 flex flex-col gap-0.5 text-[13px]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2.5 px-2.5 py-[9px] rounded-[7px] transition-colors duration-150',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/8 hover:text-white',
                ].join(' ')}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Category section */}
        <div className="mt-3.5 px-[18px] text-[10px] font-bold tracking-[.1em] text-white/45 uppercase">
          カテゴリ
        </div>
        <div className="px-2.5 mt-1 flex flex-col">
          {categoryCounts.map(c => (
            <Link
              key={c.id}
              href={`/manuals?category=${encodeURIComponent(c.id)}`}
              className="flex items-center gap-2.5 px-2.5 py-[7px] text-[12.5px] text-white/70 hover:text-white hover:bg-white/8 rounded-[7px] transition-colors duration-150"
            >
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: c.color }}
              />
              <span className="flex-1">{c.label}</span>
              <span className="font-mono text-[10px] text-white/40">{c.count}</span>
            </Link>
          ))}

          {/* Pending categories badge */}
          {pendingCount > 0 && (
            <Link
              href="/admin/categories"
              className="flex items-center gap-2.5 px-2.5 py-[7px] mt-1 text-[12.5px] text-[#FDE68A] bg-yellow-500/10 border border-yellow-500/25 rounded-[7px] hover:bg-yellow-500/15 transition-colors duration-150"
            >
              <AlertTriangle size={12} />
              <span className="flex-1">未承認カテゴリ</span>
              <span className="font-mono text-[10px] font-bold">{pendingCount}</span>
            </Link>
          )}
        </div>

        {/* User section */}
        <div className="mt-auto border-t border-white/8 p-3.5 space-y-2">
          {/* Drive folder */}
          <button
            onClick={handleFolderClick}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors duration-150 truncate"
            title={currentFolder ? `保存先: ${currentFolder.name}` : 'Driveフォルダを指定'}
          >
            <span className="truncate">
              {currentFolder ? `📁 ${currentFolder.name}` : '📁 Drive 未設定'}
            </span>
          </button>

          {/* User row */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              YT
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white">谷 友真</div>
              <div className="text-[10px] text-white/50">情シス</div>
            </div>
            <button className="text-white/40 hover:text-white/80 transition-colors">
              <Bell size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* Google sign-in */}
          <div className="pt-1">
            <GoogleSignInButton />
          </div>
        </div>
      </aside>

      <DriveFolderPicker
        open={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleFolderSelected}
      />
    </>
  );
}
