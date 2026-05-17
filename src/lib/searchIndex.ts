import { WorkInstruction } from '@/types/instruction';

export interface SearchResult {
  instruction: WorkInstruction;
  score: number;
  matchLocations: ('title' | 'body' | 'tag')[];
  snippet: string;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[\s　]+/g, ' ').trim();
}

function highlight(text: string, terms: string[]): string {
  let out = text;
  for (const t of terms) {
    out = out.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`);
  }
  return out;
}

function buildSnippet(instruction: WorkInstruction, terms: string[]): string {
  const haystack = instruction.steps
    .map(s => `${s.title} ${s.description}`)
    .join(' ');
  const norm = normalize(haystack);
  const termNorm = terms.map(normalize);
  const firstIdx = Math.max(0, termNorm.reduce((min, t) => {
    const idx = norm.indexOf(t);
    return idx >= 0 ? Math.min(min, idx) : min;
  }, norm.length));
  const raw = haystack.slice(Math.max(0, firstIdx - 40), firstIdx + 100);
  return highlight(raw, terms);
}

export function search(instructions: WorkInstruction[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  const terms = normalize(query).split(' ').filter(Boolean);

  const results: SearchResult[] = [];

  for (const inst of instructions) {
    const titleNorm = normalize(inst.title);
    const bodyNorm = normalize(
      inst.steps.map(s => `${s.title} ${s.description} ${s.caution ?? ''}`).join(' ')
    );
    const tagNorm = normalize((inst.keywords ?? []).join(' '));

    let score = 0;
    const matchLocations: ('title' | 'body' | 'tag')[] = [];

    for (const term of terms) {
      if (titleNorm.includes(term)) { score += 3; if (!matchLocations.includes('title')) matchLocations.push('title'); }
      if (bodyNorm.includes(term))  { score += 1; if (!matchLocations.includes('body'))  matchLocations.push('body'); }
      if (tagNorm.includes(term))   { score += 2; if (!matchLocations.includes('tag'))   matchLocations.push('tag'); }
    }

    if (score > 0) {
      const maxScore = terms.length * 3;
      results.push({
        instruction: inst,
        score: Math.round((score / maxScore) * 100),
        matchLocations,
        snippet: buildSnippet(inst, terms),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
