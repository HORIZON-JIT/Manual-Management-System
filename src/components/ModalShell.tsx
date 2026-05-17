'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-xl',
}: ModalShellProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,27,43,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-surface border border-ink-200 rounded-[14px] w-full ${width} flex flex-col max-h-[90vh]`}
        style={{ boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-[22px] py-4 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="font-bold text-[16px] text-ink-900">{title}</h2>
            {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-ink-400 hover:text-ink-700 transition-colors mt-0.5"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-[22px] py-[18px] overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-[22px] py-3.5 border-t border-ink-100 flex justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
