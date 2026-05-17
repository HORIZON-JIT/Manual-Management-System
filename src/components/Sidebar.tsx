'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, Search, Pin, FileEdit, Clock,
  AlertTriangle, Folder, LogOut,
} from 'lucide-react';
import { getAllInstructions } from '@/lib/storage';
import { getOfficialCounts, getPendingCategories } from '@/lib/categoryRegistry';
import GoogleSignInButton from './GoogleSignInButton';
import DriveFolderPicker from './DriveFolderPicker';
import { getTargetFolder, DriveFolder, bulkImportFromDrive } from '@/lib/googleDrive';
import {
  isGoogleConfigured, getAuthState, addAuthListener,
  initGoogleAuth, signOut, GoogleAuthState,
} from '@/lib/googleAuth';

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
  const [auth, setAuth] = useState<GoogleAuthState>(getAuthState());

  useEffect(() => {
    const items = getAllInstructions();
    setCategoryCounts(getOfficialCounts(items));
    setPendingCount(getPendingCategories(items).length);
    setCurrentFolder(getTargetFolder());

    if (isGoogleConfigured()) {
      initGoogleAuth();
      return addAuthListener(setAuth);
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleFolderSelected = async (folder: DriveFolder | null) => {
    setCurrentFolder(folder ?? getTargetFolder());
    if (folder) {
      try {
        const { imported } = await bulkImportFromDrive();
        if (imported > 0) alert(`${imported}件の手順書を読み込みました`);
      } catch {
        // ignore
      }
    }
  };

  const handleFolderClick = () => {
    if (!isGoogleConfigured()) {
      alert('Google Drive連携を使用するには、管理者がGoogleクライアントIDを設定する必要があります。\n\nGitHubリポジトリのSettings → Secrets and variables → Actions → Variables に\nNEXT_PUBLIC_GOOGLE_CLIENT_ID を追加してください。');
      return;
    }
    if (auth.isSignedIn) {
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
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors duration-150"
            title={currentFolder ? `保存先: ${currentFolder.name}` : 'Driveフォルダを指定（要ログイン）'}
          >
            <Folder size={13} className="shrink-0" />
            <span className="truncate">
              {currentFolder ? currentFolder.name : 'Drive 未設定'}
            </span>
          </button>

          {/* Auth section: shows user + logout when signed in, login button when not */}
          {isGoogleConfigured() && (
            auth.isSignedIn ? (
              <button
                onClick={signOut}
                title="クリックしてログアウト"
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/8 transition-colors duration-150 group"
              >
                {auth.userPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={auth.userPhoto}
                    alt={auth.userName ?? ''}
                    className="w-7 h-7 rounded-full ring-1 ring-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                    {(auth.userName ?? auth.userEmail ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-semibold text-white truncate">
                    {auth.userName ?? auth.userEmail ?? ''}
                  </div>
                  <div className="text-[10px] text-white/50 truncate">
                    {auth.userName ? auth.userEmail : 'ログイン済み'}
                  </div>
                </div>
                <LogOut size={13} className="text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
              </button>
            ) : (
              <GoogleSignInButton variant="dark" />
            )
          )}
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
