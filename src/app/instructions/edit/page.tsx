'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WorkInstruction } from '@/types/instruction';
import { getInstruction } from '@/lib/storage';
import { getTempData, removeTempData } from '@/lib/tempStorage';
import InstructionForm from '@/components/InstructionForm';

function EditToolbar({ instruction }: { instruction: WorkInstruction | null }) {
  return (
    <div className="flex items-center gap-3 px-6 py-2 border-b border-ink-100 bg-ink-50 text-[12px] text-ink-500 no-print">
      <span className="font-mono text-[11px] text-ink-400">
        {instruction?.id?.slice(0, 8) ?? 'new'}
      </span>
      <span className="text-ink-300">·</span>
      <span>下書き</span>
      {instruction && (
        <>
          <span className="text-ink-300">·</span>
          <Link
            href={`/instructions/view?id=${instruction.id}`}
            className="text-accent-ink hover:underline"
          >
            プレビュー →
          </Link>
        </>
      )}
    </div>
  );
}

function EditInstructionContent() {
  const searchParams = useSearchParams();
  const [instruction, setInstruction] = useState<WorkInstruction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'drive') {
      getTempData('drive_import_instruction').then((raw) => {
        if (raw) {
          removeTempData('drive_import_instruction');
          try { setInstruction(JSON.parse(raw) as WorkInstruction); } catch { /* fall through */ }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      const id = searchParams.get('id');
      if (id) setInstruction(getInstruction(id) || null);
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-500">読み込み中…</p>
      </div>
    );
  }

  if (!instruction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-ink-500 text-lg">手順書が見つかりません</p>
        <Link href="/manuals" className="text-accent-ink hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <EditToolbar instruction={instruction} />
      <InstructionForm initialData={instruction} />
    </>
  );
}

export default function EditInstructionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-500">読み込み中…</p>
      </div>
    }>
      <EditInstructionContent />
    </Suspense>
  );
}
