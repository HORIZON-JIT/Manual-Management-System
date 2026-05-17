'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, MoveRight, X } from 'lucide-react';
import { WorkInstruction } from '@/types/instruction';
import { getAllInstructions, saveInstruction } from '@/lib/storage';
import {
  OFFICIAL_CATEGORIES,
  getPendingCategories,
  resolveCategory,
  CATEGORY_ALIASES,
} from '@/lib/categoryRegistry';
import CategoryChip from '@/components/CategoryChip';

export default function AdminCategoriesPage() {
  const [instructions, setInstructions] = useState<WorkInstruction[]>([]);

  useEffect(() => {
    setInstructions(getAllInstructions());
  }, []);

  const pending = useMemo(() => getPendingCategories(instructions), [instructions]);

  const handleOfficialize = (raw: string, targetId: string) => {
    if (!confirm(`「${raw}」を「${targetId}」として公式化しますか？この操作は取り消せません。`)) return;
    const updated = instructions.map(inst => {
      if (inst.category === raw) return { ...inst, category: targetId };
      return inst;
    });
    updated.forEach(saveInstruction);
    setInstructions(updated);
  };

  const handleDismiss = (raw: string) => {
    if (!confirm(`「${raw}」を無視しますか？手順書のカテゴリは変更されません。`)) return;
    // No-op: just refresh view (real impl would add to an ignore list)
    setInstructions(prev => [...prev]);
  };

  return (
    <div className="px-8 py-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle size={20} className="text-warn shrink-0" />
        <h1 className="text-[24px] font-bold font-display text-ink-900 tracking-tight">
          カテゴリ承認キュー
        </h1>
        {pending.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-pending-bg text-pending-text border border-pending-border">
            {pending.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Pending list */}
        <div>
          {pending.length === 0 ? (
            <div className="py-16 text-center bg-ok-soft border border-ok/20 rounded-xl">
              <CheckCircle size={32} className="text-ok mx-auto mb-3" />
              <p className="font-semibold text-ok text-[15px]">未承認カテゴリはありません</p>
              <p className="text-[13px] text-ink-500 mt-1">すべてのカテゴリが公式化されています。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(({ id: raw, count }) => {
                const affected = instructions.filter(i => i.category === raw);
                return (
                  <PendingCard
                    key={raw}
                    raw={raw}
                    count={count}
                    affected={affected}
                    onOfficialize={handleOfficialize}
                    onDismiss={handleDismiss}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel: official categories */}
        <aside className="space-y-4">
          <div className="bg-surface border border-ink-200 rounded-xl p-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-ink-500 mb-3">公式カテゴリ</p>
            <div className="space-y-2">
              {OFFICIAL_CATEGORIES.map(c => {
                const count = instructions.filter(i => resolveCategory(i.category) === c.id).length;
                return (
                  <div key={c.id} className="flex items-center gap-2.5 py-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="flex-1 text-[13px] text-ink-800 font-medium">{c.label}</span>
                    <span className="font-mono text-[11px] text-ink-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface border border-ink-200 rounded-xl p-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-ink-500 mb-3">エイリアスマップ</p>
            <div className="space-y-1.5">
              {Object.entries(CATEGORY_ALIASES).map(([alias, target]) => (
                <div key={alias} className="flex items-center gap-1.5 text-[12px]">
                  <span className="font-mono text-ink-600">{alias}</span>
                  <MoveRight size={12} className="text-ink-400 shrink-0" />
                  <span className="text-ink-800 font-medium">{target}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PendingCard({
  raw,
  count,
  affected,
  onOfficialize,
  onDismiss,
}: {
  raw: string;
  count: number;
  affected: WorkInstruction[];
  onOfficialize: (raw: string, target: string) => void;
  onDismiss: (raw: string) => void;
}) {
  const [mergeTarget, setMergeTarget] = useState('');

  return (
    <div className="bg-surface border-2 border-dashed border-pending-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryChip raw={raw} />
          <span className="text-[12px] text-ink-500">{count} 件の手順書</span>
        </div>
        <button
          onClick={() => onDismiss(raw)}
          className="text-ink-400 hover:text-ink-600 transition"
          title="無視"
        >
          <X size={16} />
        </button>
      </div>

      {/* Affected instructions */}
      <div className="mb-4 space-y-1">
        {affected.slice(0, 3).map(inst => (
          <Link
            key={inst.id}
            href={`/instructions/view?id=${inst.id}`}
            className="block text-[12px] text-ink-600 hover:text-accent-ink truncate hover:underline"
          >
            {inst.title}
          </Link>
        ))}
        {affected.length > 3 && (
          <p className="text-[11px] text-ink-400">… 他 {affected.length - 3} 件</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {/* Merge to official */}
        <div className="flex gap-2">
          <select
            value={mergeTarget}
            onChange={e => setMergeTarget(e.target.value)}
            className="flex-1 border border-ink-200 rounded-lg px-2 py-1.5 text-[12px] text-ink-800 bg-surface focus:ring-2 focus:ring-accent outline-none"
          >
            <option value="">既存カテゴリに統合…</option>
            {OFFICIAL_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button
            disabled={!mergeTarget}
            onClick={() => onOfficialize(raw, mergeTarget)}
            className="px-3 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-ink text-white rounded-lg transition disabled:opacity-40"
          >
            統合
          </button>
        </div>

        {/* Officialize as-is */}
        <button
          onClick={() => {
            const official = OFFICIAL_CATEGORIES.find(c => c.id === raw);
            if (official) {
              onOfficialize(raw, raw);
            } else {
              alert('このカテゴリ名は公式リストに存在しません。既存カテゴリへの統合をお試しください。');
            }
          }}
          className="w-full py-1.5 text-[12px] font-semibold border border-ok/30 text-ok bg-ok-soft hover:bg-ok/10 rounded-lg transition"
        >
          このまま公式化
        </button>
      </div>
    </div>
  );
}
