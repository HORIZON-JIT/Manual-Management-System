'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WorkInstruction } from '@/types/instruction';
import { getAllInstructions } from '@/lib/storage';
import { search, SearchResult } from '@/lib/searchIndex';
import { OFFICIAL_CATEGORIES, resolveCategory } from '@/lib/categoryRegistry';
import CategoryChip from '@/components/CategoryChip';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><p className="text-ink-500">読み込み中…</p></div>}>
      <SearchContent />
    </Suspense>
  );
}

function Highlight({ html }: { html: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className="[&_mark]:bg-[#FEF08A] [&_mark]:text-inherit [&_mark]:px-[2px] [&_mark]:py-[1px] [&_mark]:rounded-[3px]"
    />
  );
}

function SearchContent() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';

  const [instructions, setInstructions] = useState<WorkInstruction[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>(['title', 'body', 'tag']);

  useEffect(() => {
    setInstructions(getAllInstructions().filter(i => i.status !== 'draft'));
  }, []);

  const allResults = useMemo(() => search(instructions, q), [instructions, q]);

  const filtered = useMemo(() => {
    return allResults.filter(r => {
      if (categoryFilter.length > 0) {
        const resolved = resolveCategory(r.instruction.category);
        if (!resolved || !categoryFilter.includes(resolved)) return false;
      }
      if (locationFilter.length > 0) {
        if (!r.matchLocations.some(loc => locationFilter.includes(loc))) return false;
      }
      return true;
    });
  }, [allResults, categoryFilter, locationFilter]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of allResults) {
      const cat = resolveCategory(r.instruction.category);
      if (cat) map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return map;
  }, [allResults]);

  // Count by match location
  const locationCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of allResults) {
      for (const loc of r.matchLocations) {
        map.set(loc, (map.get(loc) ?? 0) + 1);
      }
    }
    return map;
  }, [allResults]);

  const toggleCategory = (id: string) => {
    setCategoryFilter(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleLocation = (loc: string) => {
    setLocationFilter(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="px-8 py-6 pb-10">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-[24px] font-bold text-ink-900 tracking-tight leading-tight">
          「<span className="text-accent-ink">{q}</span>」の検索結果
        </h1>
        <p className="text-[12px] text-ink-500 mt-1">
          {filtered.length} 件 · 全 {allResults.length} 件中
        </p>
      </div>
      <p className="text-[12px] text-ink-400 mb-5">
        関連度が高い順に表示しています。検索対象: タイトル / 本文 / タグ / キーワード
      </p>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Facet rail */}
        <aside className="space-y-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500">絞り込み</p>

          {/* Category */}
          <div>
            <p className="text-[12px] font-bold text-ink-700 mb-2">カテゴリ</p>
            {OFFICIAL_CATEGORIES.map(c => {
              const count = categoryCounts.get(c.id) ?? 0;
              if (count === 0) return null;
              return (
                <label key={c.id} className="flex items-center gap-2 py-[5px] text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                    className="accent-accent"
                  />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-[11px] text-ink-400">{count}</span>
                </label>
              );
            })}
          </div>

          {/* Match location */}
          <div>
            <p className="text-[12px] font-bold text-ink-700 mb-2">マッチ箇所</p>
            {([['body', '本文に含む'], ['title', 'タイトルに含む'], ['tag', 'タグに含む']] as const).map(([loc, label]) => {
              const count = locationCounts.get(loc) ?? 0;
              if (count === 0) return null;
              return (
                <label key={loc} className="flex items-center gap-2 py-[5px] text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locationFilter.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                    className="accent-accent"
                  />
                  <span className="flex-1">{label}</span>
                  <span className="text-[11px] text-ink-400">{count}</span>
                </label>
              );
            })}
          </div>

          <div className="border-t border-ink-100 pt-3 text-[11px] text-ink-400 leading-relaxed">
            検索のコツ — スペース区切りで AND 検索できます。
          </div>
        </aside>

        {/* Results */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[13px] text-ink-400 bg-surface border border-ink-200 rounded-xl">
              「{q}」に一致する手順書が見つかりませんでした。
            </div>
          )}

          {filtered.map((r, idx) => (
            <ResultCard key={r.instruction.id} result={r} rank={idx} q={q} />
          ))}

          {/* Create CTA */}
          <div className="mt-2 p-5 bg-surface border border-dashed border-ink-300 rounded-xl text-[13px] text-ink-600 text-center">
            この検索キーワードで関連する手順書がないですか？{' '}
            <Link
              href={`/instructions/new?q=${encodeURIComponent(q)}`}
              className="text-accent-ink font-bold hover:underline"
            >
              「{q}」で新規作成 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, rank, q }: { result: SearchResult; rank: number; q: string }) {
  const { instruction: inst, score, matchLocations, snippet } = result;
  const matchLabels: Record<string, string> = { title: 'タイトル', body: '本文', tag: 'タグ' };
  void rank;

  return (
    <Link
      href={`/instructions/view?id=${inst.id}`}
      className="bg-surface border border-ink-200 rounded-xl px-[22px] py-[18px] flex gap-[18px] hover:shadow-2 transition-shadow"
    >
      <div className="w-[88px] h-[88px] bg-ink-50 rounded-lg border border-ink-200 shrink-0 flex items-center justify-center text-ink-300 text-[10px]">
        表紙
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <CategoryChip raw={inst.category} />
          <span className="font-mono text-[10px] text-ink-400">{inst.updatedAt?.slice(0, 10)}</span>
          {matchLocations.map(loc => (
            <span
              key={loc}
              className="px-2 py-0.5 rounded-full text-[10px] border border-ink-200 text-ink-500 bg-ink-50"
            >
              {matchLabels[loc]}
            </span>
          ))}
          <span className="ml-auto text-[11px] text-ink-400">関連度 {score}%</span>
        </div>
        <p className="font-bold text-[15px] text-ink-900 leading-snug mb-1.5">
          <HighlightText text={inst.title} q={q} />
        </p>
        {snippet && (
          <p className="text-[13px] text-ink-700 leading-relaxed mb-2">
            …<Highlight html={snippet} />…
          </p>
        )}
        <p className="text-[11px] text-ink-500">
          {inst.createdBy ?? '—'} · {inst.updatedAt?.slice(0, 10)}
        </p>
      </div>
    </Link>
  );
}

function HighlightText({ text, q }: { text: string; q: string }) {
  if (!q.trim()) return <>{text}</>;
  const terms = q.trim().split(/\s+/);
  const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-[#FEF08A] text-inherit px-[2px] py-[1px] rounded-[3px]">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
