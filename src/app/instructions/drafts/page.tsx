'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileEdit, Trash2, Upload } from 'lucide-react';
import { WorkInstruction } from '@/types/instruction';
import { getAllInstructions, deleteInstruction } from '@/lib/storage';
import { setTempData } from '@/lib/tempStorage';
import CategoryChip from '@/components/CategoryChip';

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<WorkInstruction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const all = getAllInstructions();
    const draftList = all
      .filter(inst => !inst.status || inst.status === 'draft')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setDrafts(draftList);
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    deleteInstruction(id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleDeleteAll = () => {
    if (!confirm(`下書き ${drafts.length} 件をすべて削除しますか？`)) return;
    drafts.forEach(d => deleteInstruction(d.id));
    setDrafts([]);
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string) as WorkInstruction;
        if (!json.id || !json.title || !Array.isArray(json.steps)) {
          alert('有効な手順書JSONファイルではありません。');
          return;
        }
        await setTempData('drive_import_instruction', JSON.stringify(json));
        router.push('/instructions/edit?source=drive');
      } catch {
        alert('JSONファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="px-8 py-6 pb-10">
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonFileChange} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-[24px] font-bold font-display text-ink-900 tracking-tight">下書き</h1>
        <span className="text-[13px] text-ink-400">{drafts.length} 件</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-ink-600 border border-ink-200 rounded-lg hover:border-ink-400 transition"
          >
            <Upload size={12} /> JSON から読み込む
          </button>
          {drafts.length >= 2 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-warn border border-warn/30 rounded-lg hover:bg-warn-soft transition"
            >
              <Trash2 size={12} /> すべて削除
            </button>
          )}
          <Link
            href="/instructions/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold bg-accent hover:bg-accent-ink text-white rounded-lg transition"
          >
            <Plus size={14} strokeWidth={2.5} /> 新規作成
          </Link>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="py-20 text-center bg-surface border border-dashed border-ink-200 rounded-xl">
          <div className="w-14 h-14 bg-ink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileEdit size={24} className="text-ink-400" />
          </div>
          <p className="text-ink-500 text-[16px] mb-1.5">下書きがありません</p>
          <p className="text-ink-400 text-[13px] mb-6">新規作成で手順書を作り始めましょう</p>
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/instructions/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-ink text-white rounded-xl font-semibold text-[13px] transition"
            >
              <Plus size={14} strokeWidth={2.5} /> 新規作成
            </Link>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[13px] px-5 py-2 text-accent-ink border border-accent/30 rounded-xl hover:bg-accent-soft transition"
            >
              JSON から読み込む
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drafts.map(inst => (
            <DraftCard
              key={inst.id}
              inst={inst}
              onDelete={() => handleDelete(inst.id, inst.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftCard({ inst, onDelete }: { inst: WorkInstruction; onDelete: () => void }) {
  const stepsTotal = inst.steps.length;
  const stepsWithTitle = inst.steps.filter(s => s.title.trim()).length;
  const progress = stepsTotal > 0 ? (stepsWithTitle / stepsTotal) * 100 : 0;

  return (
    <div className="bg-surface border border-ink-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-2 transition-shadow">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryChip raw={inst.category} />
          </div>
          <h2 className="font-bold text-[14px] text-ink-900 line-clamp-2 leading-snug">
            {inst.title || '無題の手順書'}
          </h2>
        </div>
      </div>

      <div className="text-[11px] text-ink-500 flex gap-3">
        <span>{stepsTotal} ステップ</span>
        <span>更新: {new Date(inst.updatedAt).toLocaleDateString('ja-JP')}</span>
        {inst.createdBy && <span>{inst.createdBy}</span>}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-ink-400 mb-1">
          <span>入力済み</span>
          <span>{stepsWithTitle} / {stepsTotal}</span>
        </div>
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/instructions/edit?id=${inst.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-accent hover:bg-accent-ink text-white text-[12px] font-semibold rounded-lg transition"
        >
          <FileEdit size={12} /> 編集を再開
        </Link>
        <button
          onClick={onDelete}
          className="h-8 px-2.5 text-[12px] text-ink-400 hover:text-warn border border-ink-200 hover:border-warn/30 rounded-lg transition flex items-center justify-center"
          title="削除"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
