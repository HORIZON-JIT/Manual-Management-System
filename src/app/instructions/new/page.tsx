'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileEdit, FileText, ShieldCheck, Settings, Users, Upload } from 'lucide-react';
import InstructionForm from '@/components/InstructionForm';

const TEMPLATES = [
  { icon: FileText,    label: '作業手順',       desc: '一般的な作業ステップ形式' },
  { icon: ShieldCheck, label: '安全チェック',    desc: '確認チェックリスト形式' },
  { icon: Settings,    label: 'IT サポート',     desc: 'トラブルシューティング形式' },
  { icon: Users,       label: 'オンボーディング', desc: '新入社員向けガイド形式' },
  { icon: FileEdit,    label: '条件分岐フロー',   desc: '状況別の分岐手順形式' },
  { icon: FileText,    label: '定期点検',        desc: '定期作業チェック形式' },
];

export default function NewInstructionPage() {
  const [started, setStarted] = useState(false);
  const router = useRouter();

  if (started) return <InstructionForm />;

  return (
    <div className="px-8 py-8 pb-12 max-w-[860px]">
      <h1 className="text-[24px] font-bold font-display text-ink-900 tracking-tight mb-1.5">
        新しい手順書を作成
      </h1>
      <p className="text-[14px] text-ink-500 mb-8">
        テンプレートから始めるか、空白から作成してください。
      </p>

      {/* Blank start */}
      <button
        onClick={() => setStarted(true)}
        className="w-full flex items-center gap-4 p-5 bg-surface border-2 border-accent/30 hover:border-accent rounded-xl mb-6 transition-colors group"
      >
        <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          <FileEdit size={22} className="text-accent" />
        </div>
        <div className="text-left">
          <p className="font-bold text-[15px] text-ink-900 group-hover:text-accent-ink transition-colors">
            空白から作成
          </p>
          <p className="text-[13px] text-ink-500">タイトル・ステップを自由に入力して作成</p>
        </div>
        <span className="ml-auto text-[13px] font-semibold text-accent">開始 →</span>
      </button>

      {/* Templates */}
      <p className="text-[11px] font-bold tracking-widest uppercase text-ink-500 mb-3">テンプレートから始める</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {TEMPLATES.map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            onClick={() => setStarted(true)}
            className="flex flex-col items-start gap-2.5 p-4 bg-surface border border-ink-200 hover:border-accent/40 hover:shadow-2 rounded-xl transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center">
              <Icon size={18} className="text-ink-600" />
            </div>
            <div>
              <p className="font-semibold text-[13px] text-ink-900">{label}</p>
              <p className="text-[11px] text-ink-500 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* JSON import */}
      <div className="flex items-center gap-3 pt-5 border-t border-ink-100">
        <Upload size={14} className="text-ink-400 shrink-0" />
        <span className="text-[13px] text-ink-500">既存の JSON ファイルから読み込む場合は</span>
        <Link href="/instructions/drafts" className="text-[13px] text-accent-ink font-semibold hover:underline">
          下書き一覧 →
        </Link>
      </div>
    </div>
  );
}
