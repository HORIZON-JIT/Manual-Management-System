'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Pin } from 'lucide-react';
import { WorkInstruction } from '@/types/instruction';
import { getAllInstructions } from '@/lib/storage';
import { isGoogleConfigured, getAuthState } from '@/lib/googleAuth';
import DriveJsonFilePicker from '@/components/DriveJsonFilePicker';
import { setTempData } from '@/lib/tempStorage';
import CategoryChip from '@/components/CategoryChip';

const POPULAR_QUERIES = ['VPN', '経費精算', 'PC初期設定', 'プロジェクター', '入退室カード'];

const ROLE_OPTIONS = ['現場担当者', '管理者'] as const;
type Role = typeof ROLE_OPTIONS[number];

function today() {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
}

export default function HomePage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState<Role>('現場担当者');
  const [query, setQuery] = useState('');
  const [instructions, setInstructions] = useState<WorkInstruction[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [showJsonPicker, setShowJsonPicker] = useState(false);
  const [showPreviewPicker, setShowPreviewPicker] = useState(false);

  useEffect(() => {
    setInstructions(getAllInstructions());
  }, []);

  useEffect(() => {
    if (!importError) return;
    const t = setTimeout(() => setImportError(null), 5000);
    return () => clearTimeout(t);
  }, [importError]);

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
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleUpdateClick = () => {
    const auth = getAuthState();
    if (isGoogleConfigured() && auth.isSignedIn) {
      setShowJsonPicker(true);
    } else {
      setImportError('Googleドライブに接続してください。サイドバーからサインインできます。');
    }
  };

  const handlePreviewClick = () => {
    const auth = getAuthState();
    if (isGoogleConfigured() && auth.isSignedIn) {
      setShowPreviewPicker(true);
    } else {
      setImportError('Googleドライブに接続してください。サイドバーからサインインできます。');
    }
  };

  const handlePreviewFileLoaded = async (content: string, fileName: string) => {
    try {
      const json = JSON.parse(content);
      if (!json.id || !json.title || !json.steps) throw new Error('無効な手順書データです。');
      await setTempData('preview_instruction', JSON.stringify(json));
      router.push('/instructions/view?source=preview');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : `${fileName}の読み込みに失敗しました。`);
    }
  };

  const handleJsonFileLoaded = async (content: string, fileName: string) => {
    try {
      const json = JSON.parse(content);
      if (!json.id || !json.title || !json.steps) throw new Error('無効な手順書データです。');
      const instruction = json as WorkInstruction;
      instruction.status = 'completed';
      await setTempData('drive_import_instruction', JSON.stringify(instruction));
      router.push('/instructions/edit?source=drive');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : `${fileName}の読み込みに失敗しました。`);
    }
  };

  const recents = instructions.filter(i => i.status !== 'draft').slice(0, 3);
  const recommended = instructions.slice(0, 4);

  return (
    <div className="px-12 py-8 pb-10 max-w-[960px]">
      {/* Role toggle + create */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-surface border border-ink-200 rounded-[10px] p-[3px]">
          {ROLE_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={[
                'px-4 py-[7px] rounded-[7px] text-[12px] font-semibold transition-colors duration-150',
                role === r
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-600 hover:text-ink-900',
              ].join(' ')}
            >
              {r}
            </button>
          ))}
        </div>
        <Link
          href="/instructions/new"
          className="flex items-center gap-1.5 h-9 px-3.5 bg-accent hover:bg-accent-ink text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          作成
        </Link>
      </div>

      {/* Hero search */}
      <div className="mb-8">
        <p className="text-[12px] text-ink-500 mb-1.5">{today()}</p>
        <h1 className="text-[32px] font-bold font-display text-ink-900 tracking-tight leading-tight mb-2">
          こんにちは
        </h1>
        <p className="text-[14px] text-ink-500 mb-5">
          探したい手順書のキーワードを入力 — タイトル・本文・タグから探せます。
        </p>

        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 bg-surface border border-ink-200 rounded-[14px] px-[18px] py-[14px] shadow-2"
        >
          <Search size={20} className="text-ink-400 shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="例: VPN 接続できない、月次経費、新入社員"
            className="flex-1 bg-transparent border-0 outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
          />
          <span className="font-mono text-[10px] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded shrink-0">
            ⌘ K
          </span>
        </form>

        <div className="flex items-center gap-2 mt-3.5 flex-wrap">
          <span className="text-[11px] text-ink-500">よく検索される:</span>
          {POPULAR_QUERIES.map(t => (
            <button
              key={t}
              onClick={() => { setQuery(t); router.push(`/search?q=${encodeURIComponent(t)}`); }}
              className="px-3 py-1 rounded-full text-[12px] text-ink-600 border border-ink-200 hover:border-ink-400 hover:text-ink-900 bg-surface transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {importError && (
        <div className="mb-6 px-4 py-3 bg-warn-soft border border-warn/20 rounded-xl text-sm text-warn">
          {importError}
        </div>
      )}

      {/* 続きから */}
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="text-[18px] font-bold text-ink-900">続きから</h2>
        <Link href="/manuals" className="text-[12px] text-ink-500 hover:text-ink-700 transition-colors">
          すべて表示 →
        </Link>
      </div>

      {recents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
          {recents.map(inst => (
            <Link
              key={inst.id}
              href={`/instructions/view?id=${inst.id}`}
              className="bg-surface border border-ink-200 rounded-[14px] overflow-hidden flex flex-col hover:shadow-2 transition-shadow"
            >
              <div className="h-[84px] bg-ink-50 border-b border-ink-200 flex items-center justify-center text-ink-300 text-xs">
                表紙画像
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CategoryChip raw={inst.category} />
                  <span className="ml-auto font-mono text-[10px] text-ink-400">
                    {inst.updatedAt?.slice(0, 10)}
                  </span>
                </div>
                <p className="font-bold text-[14px] text-ink-900 leading-snug line-clamp-2">
                  {inst.title}
                </p>
                <p className="text-[11px] text-ink-500">
                  途中: ステップ — / {inst.steps.length}
                </p>
                <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mb-8 py-10 bg-surface border border-dashed border-ink-200 rounded-xl text-center text-[13px] text-ink-400">
          完了済みの手順書がありません。
          <Link href="/instructions/new" className="ml-1 text-accent-ink font-semibold hover:underline">
            新規作成 →
          </Link>
        </div>
      )}

      {/* おすすめ */}
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="text-[18px] font-bold text-ink-900">あなたの部署でよく見られる</h2>
        <span className="text-[11px] text-ink-500">情シス · 今月</span>
      </div>

      {recommended.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recommended.map(inst => (
            <Link
              key={inst.id}
              href={`/instructions/view?id=${inst.id}`}
              className="bg-surface border border-ink-200 rounded-xl p-3.5 hover:shadow-2 transition-shadow flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <CategoryChip raw={inst.category} />
                {inst.keywords?.length ? <Pin size={12} className="text-ink-400" /> : null}
              </div>
              <p className="font-bold text-[13px] text-ink-900 leading-snug line-clamp-2 min-h-[36px]">
                {inst.title}
              </p>
              <p className="text-[11px] text-ink-500">{inst.updatedAt?.slice(0, 10)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-10 bg-surface border border-dashed border-ink-200 rounded-xl text-center text-[13px] text-ink-400">
          手順書がまだ登録されていません。
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-10 pt-6 border-t border-ink-100 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUpdateClick}
          className="px-4 py-2 text-[13px] text-ink-600 border border-ink-200 rounded-lg hover:border-ink-400 transition-colors"
        >
          Drive JSON から更新
        </button>
        <button
          type="button"
          onClick={handlePreviewClick}
          className="px-4 py-2 text-[13px] text-ink-600 border border-ink-200 rounded-lg hover:border-ink-400 transition-colors"
        >
          Drive JSON をプレビュー
        </button>
      </div>

      {/* Modals */}
      <DriveJsonFilePicker open={showJsonPicker} onClose={() => setShowJsonPicker(false)} onFileLoaded={handleJsonFileLoaded} />
      <DriveJsonFilePicker open={showPreviewPicker} onClose={() => setShowPreviewPicker(false)} onFileLoaded={handlePreviewFileLoaded} />
    </div>
  );
}
