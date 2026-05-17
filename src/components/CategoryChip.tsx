import { getCategoryDisplay } from '@/lib/categoryRegistry';

interface Props {
  raw: string | undefined | null;
  size?: 'sm' | 'md';
}

export default function CategoryChip({ raw, size = 'sm' }: Props) {
  const { label, official, color } = getCategoryDisplay(raw);

  const base =
    size === 'sm'
      ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold'
      : 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold';

  if (official) {
    return (
      <span
        className={base}
        style={{
          background: color + '22',
          color: color,
          border: `1px solid ${color}55`,
        }}
      >
        <span
          className="w-[6px] h-[6px] rounded-full shrink-0"
          style={{ background: color }}
        />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`${base} border border-dashed`}
      style={{
        background: 'var(--color-pending-bg)',
        color: 'var(--color-pending-text)',
        borderColor: 'var(--color-pending-border)',
      }}
    >
      {label}
    </span>
  );
}
