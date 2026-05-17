'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { List, LayoutGrid, Pin } from 'lucide-react';
import { WorkInstruction } from '@/types/instruction';
import { getAllInstructions } from '@/lib/storage';
import { OFFICIAL_CATEGORIES, resolveCategory } from '@/lib/categoryRegistry';
import CategoryChip from '@/components/CategoryChip';

type View = 'grid' | 'list';

export default function ManualsPage() {
  const params = useSearchParams();
  const initialCategory = params.get('category') ?? 'すべて';

  const [instructions, setInstructions] = useState<WorkInstruction[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [view, setView] = useState<View>('grid');

  useEffect(() => {
    setInstructions(getAllInstructions().filter(i => i.status !== 'draft'));
  }, []);

  const categories = ['すべて', ...OFFICIAL_CATEGORIES.map(c => c.id)];

  const filtered = useMemo(() => {
    if (activeCategory === 'すべて') return instructions;
    return instructions.filter(i => resolveCategory(i.category) === activeCategory);
  }, [instructions, activeCategory]);

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-ink-200 px-8 py-3.5">
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'shrink-0 h-7 px-3 rounded-full text-[12px] font-semibold transition-colors',
                activeCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-ink-50 text-ink-600 hover:bg-ink-100 border border-ink-200',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meta + view toggle */}
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          <span>
            <b className="text-ink-900">{filtered.length}</b> 件 · 更新日順
          </span>
          <span className="ml-auto flex items-center gap-1">
            表示
          </span>
          <div className="inline-flex border border-ink-200 rounded-[7px] p-0.5">
            <button
              onClick={() => setView('list')}
              className={[
                'p-1 rounded-[5px] transition-colors',
                view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-700',
              ].join(' ')}
              aria-label="リスト表示"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={[
                'p-1 rounded-[5px] transition-colors',
                view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-700',
              ].join(' ')}
              aria-label="グリッド表示"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-5">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[13px] text-ink-400 border border-dashed border-ink-200 rounded-xl bg-surface">
            該当する手順書がありません。
            <Link href="/instructions/new" className="ml-1 text-accent-ink font-semibold hover:underline">
              新規作成 →
            </Link>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(inst => (
              <GridCard key={inst.id} inst={inst} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(inst => (
              <ListCard key={inst.id} inst={inst} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({ inst }: { inst: WorkInstruction }) {
  return (
    <Link
      href={`/instructions/view?id=${inst.id}`}
      className="bg-surface border border-ink-200 rounded-[14px] overflow-hidden flex flex-col hover:shadow-2 transition-shadow"
    >
      <div className="h-[120px] bg-ink-50 border-b border-ink-200 flex items-center justify-center text-ink-300 text-xs">
        表紙画像
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <CategoryChip raw={inst.category} />
          {inst.keywords?.length ? <Pin size={12} className="text-ink-400" /> : null}
          <span className="ml-auto font-mono text-[10px] text-ink-400">
            {inst.updatedAt?.slice(0, 10)}
          </span>
        </div>
        <p className="font-bold text-[14px] text-ink-900 leading-snug line-clamp-2 min-h-[40px]">
          {inst.title}
        </p>
        <div className="flex justify-between text-[11px] text-ink-500 mt-auto">
          <span>{inst.createdBy ?? '—'}</span>
          <span>{inst.steps.length} ステップ</span>
        </div>
      </div>
    </Link>
  );
}

function ListCard({ inst }: { inst: WorkInstruction }) {
  return (
    <Link
      href={`/instructions/view?id=${inst.id}`}
      className="bg-surface border border-ink-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-1 transition-shadow"
    >
      <div className="w-16 h-16 bg-ink-50 rounded-lg border border-ink-200 shrink-0 flex items-center justify-center text-ink-300 text-[10px]">
        表紙
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <CategoryChip raw={inst.category} />
          <span className="font-mono text-[10px] text-ink-400">{inst.updatedAt?.slice(0, 10)}</span>
        </div>
        <p className="font-bold text-[14px] text-ink-900 truncate">{inst.title}</p>
        <p className="text-[11px] text-ink-500 mt-0.5">
          {inst.createdBy ?? '—'} · {inst.steps.length} ステップ
        </p>
      </div>
      {inst.keywords?.length ? <Pin size={14} className="text-ink-400 shrink-0" /> : null}
    </Link>
  );
}
