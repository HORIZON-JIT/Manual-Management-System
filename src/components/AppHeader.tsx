'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, Plus, ChevronRight, Home, Folder, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import DriveFolderPicker from './DriveFolderPicker';
import GoogleSignInButton from './GoogleSignInButton';
import { getTargetFolder, DriveFolder } from '@/lib/googleDrive';
import { isGoogleConfigured, getAuthState, signIn } from '@/lib/googleAuth';

function useBreadcrumb(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [
    { label: 'ホーム', href: '/' },
  ];
  if (pathname.startsWith('/manuals')) {
    crumbs.push({ label: '手順書を探す', href: '/manuals' });
  }
  if (pathname.startsWith('/search')) {
    crumbs.push({ label: '手順書を探す', href: '/manuals' });
    crumbs.push({ label: '検索結果' });
  }
  if (pathname.startsWith('/instructions/drafts')) {
    crumbs.push({ label: '下書き' });
  }
  if (pathname.startsWith('/instructions/new')) {
    crumbs.push({ label: '新規作成' });
  }
  if (pathname.startsWith('/instructions/edit')) {
    crumbs.push({ label: '手順書を探す', href: '/manuals' });
    crumbs.push({ label: '編集中' });
  }
  if (pathname.startsWith('/instructions/view')) {
    crumbs.push({ label: '手順書を探す', href: '/manuals' });
    crumbs.push({ label: '詳細' });
  }
  if (pathname.startsWith('/admin/categories')) {
    crumbs.push({ label: 'カテゴリ承認キュー' });
  }
  return crumbs;
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const crumbs = useBreadcrumb(pathname);

  useEffect(() => {
    setCurrentFolder(getTargetFolder());
  }, []);

  // ⌘K / Ctrl+K global search hotkey
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleFolderClick = () => {
    if (!isGoogleConfigured()) {
      alert('Google Drive連携を使用するには、管理者がGoogleクライアントIDを設定する必要があります。\n\nGitHubリポジトリのSettings → Secrets and variables → Actions → Variables に\nNEXT_PUBLIC_GOOGLE_CLIENT_ID を追加してください。');
      return;
    }
    const auth = getAuthState();
    if (auth.isSignedIn) {
      setShowFolderPicker(true);
    } else {
      signIn();
    }
  };

  const handleFolderSelected = (folder: DriveFolder | null) => {
    setCurrentFolder(folder ?? getTargetFolder());
  };

  if (pathname === '/') return null;

  return (
    <>
      <header className="flex items-center gap-2 px-7 h-[60px] border-b border-ink-200 bg-surface shrink-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-ink-500 shrink-0">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={11} className="text-ink-300" />}
              {crumb.href && i < crumbs.length - 1 ? (
                i === 0 ? (
                  <Link href={crumb.href} className="hover:text-ink-700 transition-colors">
                    <Home size={13} />
                  </Link>
                ) : (
                  <Link href={crumb.href} className="hover:text-ink-700 transition-colors">
                    {crumb.label}
                  </Link>
                )
              ) : (
                <span className={i === crumbs.length - 1 ? 'text-ink-900 font-semibold' : ''}>
                  {i === 0 ? <Home size={13} /> : crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-[560px] ml-auto flex items-center gap-2.5 h-9 bg-ink-50 rounded-[9px] px-3.5 border border-ink-200 focus-within:border-accent focus-within:bg-white transition-colors"
        >
          <Search size={14} className="text-ink-400 shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="タイトル・本文・タグで検索"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-ink-700 placeholder:text-ink-400"
          />
          <span className="font-mono text-[10px] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded shrink-0">
            ⌘ K
          </span>
        </form>

        {/* Drive folder selector */}
        <button
          onClick={handleFolderClick}
          title={currentFolder ? `保存先: ${currentFolder.name}` : 'Driveフォルダを指定'}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 border border-ink-200 rounded-lg text-[12px] text-ink-600 hover:border-ink-400 hover:text-ink-900 transition-colors max-w-[160px] shrink-0"
        >
          <Folder size={14} className="text-ink-400 shrink-0" />
          <span className="truncate">{currentFolder ? currentFolder.name : '未設定'}</span>
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelp(true)}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-700 transition-colors shrink-0"
          title="使い方ガイド"
        >
          <HelpCircle size={16} />
        </button>

        {/* Google Sign-In */}
        <div className="shrink-0">
          <GoogleSignInButton />
        </div>

        {/* Create button */}
        <Link
          href="/instructions/new"
          className="flex items-center gap-1.5 h-9 px-3.5 bg-accent hover:bg-accent-ink text-white text-[13px] font-semibold rounded-lg transition-colors duration-150 shrink-0"
        >
          <Plus size={14} strokeWidth={2.5} />
          作成
        </Link>
      </header>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      <DriveFolderPicker
        open={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleFolderSelected}
      />
    </>
  );
}
