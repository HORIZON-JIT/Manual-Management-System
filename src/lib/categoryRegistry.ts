export type OfficialCategoryId = string;

export interface OfficialCategory {
  id: OfficialCategoryId;
  label: string;
  color: string;
  description?: string;
}

export const OFFICIAL_CATEGORIES: OfficialCategory[] = [
  { id: '事務作業',     label: '事務作業',     color: '#7DD3FC', description: '経費・受発注・社内事務' },
  { id: '情報システム', label: '情報システム', color: '#A78BFA', description: 'IT サポート / インフラ' },
  { id: '現場作業',     label: '現場作業',     color: '#FB923C', description: '設備・機材・安全' },
];

// 旧 ID や日本語ゆれを公式 ID にマップ
export const CATEGORY_ALIASES: Record<string, OfficialCategoryId> = {
  'pc_work':    '事務作業',
  'packing':    '現場作業',
  'PC事務作業': '事務作業',
  '梱包作業':   '現場作業',
};

export function resolveCategory(raw: string | undefined | null): OfficialCategoryId | null {
  if (!raw) return null;
  if (OFFICIAL_CATEGORIES.find(c => c.id === raw)) return raw;
  if (CATEGORY_ALIASES[raw]) return CATEGORY_ALIASES[raw];
  return null;
}

export interface CategoryDisplay {
  label: string;
  official: boolean;
  color: string;
}

export function getCategoryDisplay(raw: string | undefined | null): CategoryDisplay {
  const resolved = resolveCategory(raw);
  if (resolved) {
    const cat = OFFICIAL_CATEGORIES.find(c => c.id === resolved)!;
    return { label: resolved, official: true, color: cat.color };
  }
  return { label: raw || '(未分類)', official: false, color: '#EAB308' };
}

export function getPendingCategories(items: { category?: string }[]): { id: string; count: number }[] {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!resolveCategory(it.category)) {
      const key = it.category || '(未分類)';
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return [...map.entries()].map(([id, count]) => ({ id, count }));
}

export function getOfficialCounts(items: { category?: string }[]) {
  return OFFICIAL_CATEGORIES.map(c => ({
    ...c,
    count: items.filter(it => resolveCategory(it.category) === c.id).length,
  }));
}
