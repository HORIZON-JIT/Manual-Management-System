'use client';

import { useEffect, useState, Suspense, Fragment } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Pin, Share2, Printer, FileEdit, ChevronDown,
  Check, AlertTriangle, ExternalLink, GitBranch,
} from 'lucide-react';
import { WorkInstruction, InstructionSnapshot, getStepImages, getImageCaption } from '@/types/instruction';
import { getInstruction, importInstruction } from '@/lib/storage';
import { parseShareData } from '@/lib/shareLink';
import { downloadDriveFile } from '@/lib/googleDrive';
import { isGoogleConfigured, getAuthState, addAuthListener, GoogleAuthState, signIn, initGoogleAuth } from '@/lib/googleAuth';
import { getTempData } from '@/lib/tempStorage';
import ViewHistoryModal from '@/components/ViewHistoryModal';
import FlowchartModal from '@/components/FlowchartModal';
import CategoryChip from '@/components/CategoryChip';

const TABS = ['手順', 'フローチャート', '更新履歴', '添付ファイル', '関連手順'] as const;
type Tab = typeof TABS[number];

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtube.com')) videoId = parsed.searchParams.get('v');
    else if (parsed.hostname === 'youtu.be') videoId = parsed.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch { return null; }
}

function InstructionViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [instruction, setInstruction] = useState<WorkInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isPreviewView, setIsPreviewView] = useState(false);
  const [auth, setAuth] = useState<GoogleAuthState>(getAuthState());
  const [checkStates, setCheckStates] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedConditions, setSelectedConditions] = useState<Record<string, string | null>>({});
  const [revealedCount, setRevealedCount] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<InstructionSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('手順');
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isGoogleConfigured()) return;
    return addAuthListener(setAuth);
  }, []);

  useEffect(() => {
    setCheckStates({});

    if (window.location.hash) {
      const shared = parseShareData(window.location.hash);
      if (shared) {
        setInstruction(shared);
        setIsSharedView(true);
        setLoading(false);
        return;
      }
    }

    if (searchParams.get('source') === 'preview') {
      getTempData('preview_instruction').then((raw) => {
        if (raw) {
          try { setInstruction(JSON.parse(raw) as WorkInstruction); setIsPreviewView(true); } catch { /* fall through */ }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
      return;
    }

    const driveFileId = searchParams.get('driveFileId');
    if (driveFileId) {
      initGoogleAuth().then(() => {
        const state = getAuthState();
        if (!state.isSignedIn) { setLoading(false); return; }
        return downloadDriveFile(driveFileId)
          .then(text => { setInstruction(JSON.parse(text) as WorkInstruction); })
          .catch(() => setInstruction(null));
      }).finally(() => setLoading(false));
      return;
    }

    const id = searchParams.get('id');
    if (id) setInstruction(getInstruction(id) || null);
    setLoading(false);
  }, [searchParams, auth.isSignedIn]);

  const handleImport = () => {
    if (!instruction) return;
    const newId = importInstruction(instruction);
    window.location.hash = '';
    router.push(`/instructions/view?id=${newId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-500 text-[14px]">読み込み中…</p>
      </div>
    );
  }

  if (!instruction) {
    const driveFileId = searchParams.get('driveFileId');
    if (driveFileId && !auth.isSignedIn) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
          <p className="text-ink-700 font-medium">この手順書を閲覧するには Google ログインが必要です</p>
          {isGoogleConfigured() && (
            <button onClick={() => signIn()} className="px-6 py-3 bg-accent hover:bg-accent-ink text-white font-bold rounded-xl transition">
              Google でログイン
            </button>
          )}
          <Link href="/" className="text-sm text-accent-ink hover:underline">一覧に戻る</Link>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-ink-500 text-lg">手順書が見つかりません</p>
        <Link href="/manuals" className="text-accent-ink hover:underline">一覧に戻る</Link>
      </div>
    );
  }

  const sortedSteps = [...(viewingSnapshot?.steps ?? instruction.steps)].sort((a, b) => a.orderIndex - b.orderIndex);
  const displayTitle = viewingSnapshot?.title ?? instruction.title;
  const displayDescription = viewingSnapshot?.description ?? instruction.description;
  const displayCategory = viewingSnapshot?.category ?? instruction.category;
  const displayKeywords = viewingSnapshot?.keywords ?? instruction.keywords;
  const hasConditions = !!(instruction.conditions && instruction.conditions.length > 0);

  const condGroupMap = new Map<string, string>();
  const groupConditions = new Map<string, typeof instruction.conditions>();
  if (hasConditions && instruction.conditions) {
    for (const c of instruction.conditions) {
      const g = c.group || '__default';
      condGroupMap.set(c.id, g);
      if (!groupConditions.has(g)) groupConditions.set(g, []);
      groupConditions.get(g)!.push(c);
    }
  }

  const groupMetaMap = new Map<string, { parentConditionId?: string }>();
  for (const g of instruction.conditionGroups ?? []) groupMetaMap.set(g.id, g);

  const isGroupVisible = (groupId: string, visited = new Set<string>()): boolean => {
    if (visited.has(groupId)) return true;
    visited.add(groupId);
    const meta = groupMetaMap.get(groupId);
    if (!meta?.parentConditionId) return true;
    const parentGroup = condGroupMap.get(meta.parentConditionId);
    if (!parentGroup) return true;
    if (!isGroupVisible(parentGroup, visited)) return false;
    const parentSel = selectedConditions[parentGroup];
    if (parentSel === null || parentSel === undefined) {
      const firstCond = groupConditions.get(parentGroup)?.[0];
      return firstCond ? firstCond.id === meta.parentConditionId : true;
    }
    return parentSel === meta.parentConditionId;
  };

  const getStepGroup = (s: { conditionId?: string }) =>
    s.conditionId ? condGroupMap.get(s.conditionId) : undefined;

  const visibleSteps = hasConditions
    ? sortedSteps.filter(s => {
        const group = getStepGroup(s);
        if (!group) return true;
        if (!isGroupVisible(group)) return false;
        const sel = selectedConditions[group];
        if (sel === undefined || sel === null) {
          const firstCond = groupConditions.get(group)?.[0];
          return firstCond ? s.conditionId === firstCond.id : true;
        }
        return s.conditionId === sel;
      })
    : sortedSteps;

  const stepNumbers: number[] = [];
  {
    let num = 0;
    const seenGroups = new Set<string>();
    for (const s of visibleSteps) {
      const group = getStepGroup(s);
      if (group) { if (!seenGroups.has(group)) { num++; seenGroups.add(group); } }
      else num++;
      stepNumbers.push(num);
    }
  }

  const isSequential = !!instruction.sequential;
  const totalSteps = stepNumbers[stepNumbers.length - 1] ?? 0;
  const doneCount = completedSteps.size;
  const progressPct = totalSteps > 0 ? (doneCount / totalSteps) * 100 : 0;

  // Open first non-completed step on mount
  if (openStepId === null && visibleSteps.length > 0) {
    const firstOpen = visibleSteps.find(s => !completedSteps.has(s.id));
    if (firstOpen) setOpenStepId(firstOpen.id);
  }

  return (
    <div>
      {/* Banners */}
      {(isPreviewView || isSharedView || viewingSnapshot) && (
        <div className={[
          'px-8 py-3 text-sm flex items-center justify-between no-print',
          isPreviewView ? 'bg-info-soft text-info' :
          isSharedView  ? 'bg-accent-soft text-accent-ink' :
          'bg-warn-soft text-warn',
        ].join(' ')}>
          <span>
            {isPreviewView ? 'Drive の JSON をプレビュー表示しています' :
             isSharedView  ? '共有された手順書を閲覧しています' :
             '過去バージョンを表示中'}
          </span>
          <button
            onClick={viewingSnapshot ? () => setViewingSnapshot(null) : handleImport}
            className="px-3 py-1.5 rounded-lg border border-current font-semibold text-[12px] hover:opacity-80 transition"
          >
            {viewingSnapshot ? '現在のバージョンに戻る' : 'インポートして保存'}
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="px-12 pt-6 pb-[18px] border-b border-ink-200 bg-surface">
        <div className="flex items-center gap-2 mb-2.5">
          <CategoryChip raw={displayCategory} size="md" />
          {(displayKeywords ?? []).slice(0, 3).map(kw => (
            <span key={kw} className="px-2.5 py-0.5 rounded-full text-[11px] border border-ink-200 text-ink-500 bg-ink-50">
              #{kw}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_220px] gap-6 items-start">
          <div>
            <h1 className="text-[28px] font-bold font-display text-ink-900 tracking-tight leading-tight mb-2.5">
              {displayTitle}
            </h1>
            {displayDescription && (
              <p className="text-[14px] text-ink-500 leading-relaxed max-w-[640px]">
                {displayDescription}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3.5 text-[12px]">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[11px] font-bold">
                  {(instruction.createdBy ?? '?')[0]}
                </div>
                <span>
                  <b className="text-ink-800">{instruction.createdBy ?? '不明'}</b>
                </span>
              </div>
              <span className="text-ink-400">
                最終更新 {instruction.updatedAt?.slice(0, 10)}
              </span>
              <span className="font-mono text-[11px] font-bold text-ink-600">
                {instruction.id?.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Progress card */}
          <div className="bg-ink-50 border border-ink-200 rounded-xl p-3.5 no-print">
            <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-1">進捗</p>
            <p className="text-[22px] font-bold font-display text-ink-900">
              {doneCount}{' '}
              <span className="text-ink-400 font-normal text-base">/ {totalSteps}</span>
            </p>
            <div className="h-[5px] bg-ink-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="flex-1 h-8 text-[12px] font-semibold rounded-lg border border-ink-200 bg-surface text-ink-600 hover:border-ink-400 hover:text-ink-900 transition flex items-center justify-center gap-1">
                <Pin size={12} /> ピン
              </button>
              <button
                className="flex-1 h-8 text-[12px] font-semibold rounded-lg border border-ink-200 bg-surface text-ink-600 hover:border-ink-400 hover:text-ink-900 transition flex items-center justify-center"
                onClick={() => setShowHistory(true)}
              >
                <Share2 size={12} />
              </button>
              <button
                className="h-8 px-2.5 text-[12px] font-semibold rounded-lg border border-ink-200 bg-surface text-ink-600 hover:border-ink-400 hover:text-ink-900 transition flex items-center justify-center"
                onClick={() => window.print()}
              >
                <Printer size={12} />
              </button>
            </div>
            {!isSharedView && !isPreviewView && (
              <Link
                href={`/instructions/edit?id=${instruction.id}`}
                className="mt-2 flex items-center justify-center gap-1.5 h-[34px] w-full bg-accent hover:bg-accent-ink text-white text-[12px] font-semibold rounded-lg transition"
              >
                <FileEdit size={13} /> 編集する
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-12 border-b border-ink-200 bg-surface gap-0 no-print">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'フローチャート') setShowFlowchart(true);
              if (tab === '更新履歴') setShowHistory(true);
            }}
            className={[
              'px-4 py-3 text-[13px] font-semibold transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'border-accent text-accent-ink'
                : 'border-transparent text-ink-500 hover:text-ink-700',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="px-12 py-6 bg-bg">
        <div className="max-w-[780px] space-y-2.5">

          {/* Snapshot banner */}
          {viewingSnapshot && (
            <div className="bg-warn-soft border border-warn/20 rounded-xl px-4 py-3 text-sm text-warn flex items-center justify-between mb-4">
              <span>過去バージョンを表示中</span>
              <button onClick={() => setViewingSnapshot(null)} className="font-semibold hover:underline">
                現在のバージョンに戻る
              </button>
            </div>
          )}

          {(isSequential ? visibleSteps.slice(0, revealedCount) : visibleSteps).map((step, index) => {
            const prevStep = index > 0 ? visibleSteps[index - 1] : null;
            const group = getStepGroup(step);
            const prevGroup = prevStep ? getStepGroup(prevStep) : undefined;
            const showInlineTabs = hasConditions && !!group && group !== prevGroup;
            const zoneConds = group ? groupConditions.get(group) ?? [] : [];
            const zoneSel = group ? (selectedConditions[group] ?? null) : null;
            const isLastRevealed = isSequential && index === Math.min(revealedCount, visibleSteps.length) - 1;
            const isDone = completedSteps.has(step.id);
            const isOpen = openStepId === step.id;

            return (
              <Fragment key={step.id}>
                {showInlineTabs && group && (
                  <div className="bg-surface border border-ink-200 rounded-xl px-5 py-3 no-print">
                    <p className="text-[11px] text-ink-500 mb-2 font-semibold">▼ 条件で表示を切り替え</p>
                    <div className="flex gap-2 flex-wrap">
                      {zoneConds.map((cond, condIdx) => {
                        const active = zoneSel === cond.id || (zoneSel === null && condIdx === 0);
                        return (
                          <button
                            key={cond.id}
                            onClick={() => { setSelectedConditions(prev => ({ ...prev, [group]: cond.id })); setRevealedCount(1); }}
                            className={[
                              'px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors',
                              active ? 'bg-ink-900 text-white' : 'bg-surface text-ink-600 border border-ink-200 hover:border-ink-400',
                            ].join(' ')}
                          >
                            {cond.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Accordion card */}
                <div className="bg-surface border border-ink-200 rounded-[14px] overflow-hidden">
                  {/* Header (clickable) */}
                  <button
                    onClick={() => setOpenStepId(isOpen ? null : step.id)}
                    className="w-full flex items-center gap-3 px-[22px] py-4 text-left bg-transparent hover:bg-ink-50 transition-colors"
                  >
                    {/* Step indicator */}
                    <div className={[
                      'w-7 h-7 rounded-[8px] flex items-center justify-center text-[12px] font-bold shrink-0',
                      isDone
                        ? 'bg-accent text-white'
                        : isOpen
                          ? 'bg-ink-900 text-white'
                          : 'bg-ink-100 text-ink-700',
                    ].join(' ')}>
                      {isDone ? <Check size={14} strokeWidth={2.5} /> : String(stepNumbers[index]).padStart(2, '0')}
                    </div>
                    <h2 className="flex-1 text-[15px] font-bold text-ink-900">{step.title}</h2>
                    <span className="text-[11px] text-ink-400 shrink-0">
                      {stepNumbers[index]} / {totalSteps}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div className="px-[22px] pb-[22px] pt-1 border-t border-ink-100 pl-[62px]">
                      <div className="space-y-4 pt-3.5">
                        {step.description && (
                          <p className="text-ink-700 whitespace-pre-wrap leading-relaxed text-[14px]">
                            {step.description}
                          </p>
                        )}

                        {getStepImages(step).map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="rounded-lg border border-ink-200 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`ステップ ${stepNumbers[index]} の画像 ${imgIdx + 1}`} className="max-w-full h-auto mx-auto" />
                            {getImageCaption(step, imgIdx) && (
                              <p className="px-3 py-2 text-[12px] text-ink-500 bg-ink-50 border-t border-ink-200">
                                {getImageCaption(step, imgIdx)}
                              </p>
                            )}
                          </div>
                        ))}

                        {step.videoUrl && (
                          getYouTubeEmbedUrl(step.videoUrl) ? (
                            <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={getYouTubeEmbedUrl(step.videoUrl)!}
                                title={`ステップ ${stepNumbers[index]} の動画`}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <a href={step.videoUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-accent-ink hover:underline text-[14px]">
                              <ExternalLink size={14} /> 動画を再生
                            </a>
                          )
                        )}

                        {step.caution && (
                          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] text-warn border-l-[3px] border-warn"
                            style={{ background: 'var(--color-warn-soft)' }}>
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <div><b>注意:</b> {step.caution}</div>
                          </div>
                        )}

                        {step.links && step.links.length > 0 && (
                          <div className="bg-info-soft border border-info/20 rounded-lg px-4 py-3 space-y-1.5">
                            <p className="text-[11px] font-bold text-info mb-1">関連リンク</p>
                            {step.links.map(link => {
                              const href = link.type === 'instruction'
                                ? link.driveFileId ? `/instructions/view?driveFileId=${link.driveFileId}` : `/instructions/view?id=${link.instructionId}`
                                : link.url;
                              return (
                                <a key={link.id} href={href} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[13px] text-info hover:underline">
                                  <ExternalLink size={12} className="shrink-0" /> {link.label}
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {step.jumps && step.jumps.length > 0 && (
                          <div className="bg-accent-soft border border-accent/20 rounded-lg px-4 py-3 space-y-1.5">
                            <p className="text-[11px] font-bold text-accent-ink mb-1">条件付きジャンプ</p>
                            {step.jumps.map(jump => {
                              const targetIdx = sortedSteps.findIndex(s => s.id === jump.targetStepId);
                              const targetStep = sortedSteps.find(s => s.id === jump.targetStepId);
                              return (
                                <p key={jump.id} className="text-[13px] text-accent-ink flex items-center gap-1.5">
                                  <GitBranch size={12} />
                                  {jump.label} → ステップ {targetIdx >= 0 ? targetIdx + 1 : '?'}
                                  {targetStep ? `. ${targetStep.title}` : ''}
                                </p>
                              );
                            })}
                            {step.jumpDefaultLabel && (
                              <p className="text-[13px] text-accent">{step.jumpDefaultLabel} → 次のステップへ</p>
                            )}
                          </div>
                        )}

                        {step.checkItems && step.checkItems.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">チェック</p>
                            <div className="space-y-1.5">
                              {step.checkItems.map(item => (
                                <label key={item.id} className="flex items-center gap-2 text-[13px] py-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checkStates[step.id]?.[item.id] ?? false}
                                    onChange={e => {
                                      setCheckStates(prev => ({
                                        ...prev,
                                        [step.id]: { ...(prev[step.id] ?? {}), [item.id]: e.target.checked },
                                      }));
                                    }}
                                    className="accent-accent w-4 h-4"
                                  />
                                  <span className={checkStates[step.id]?.[item.id] ? 'line-through opacity-50' : ''}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete / Next button */}
                        <div className="flex justify-end pt-2 no-print">
                          {isDone ? (
                            <button
                              onClick={() => setCompletedSteps(prev => { const s = new Set(prev); s.delete(step.id); return s; })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-ok-soft text-ok border border-ok/20"
                            >
                              <Check size={13} /> 完了済み
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCompletedSteps(prev => new Set([...prev, step.id]));
                                if (isSequential) {
                                  setRevealedCount(c => c + 1);
                                  const nextStep = visibleSteps[index + 1];
                                  if (nextStep) setOpenStepId(nextStep.id);
                                } else {
                                  const nextStep = visibleSteps[index + 1];
                                  if (nextStep) setOpenStepId(nextStep.id);
                                }
                              }}
                              className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded-lg bg-accent hover:bg-accent-ink text-white transition-colors"
                            >
                              完了して次へ →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isLastRevealed && !isDone && revealedCount < visibleSteps.length && (
                  <div className="flex justify-end no-print">
                    <button
                      onClick={() => setRevealedCount(c => c + 1)}
                      className="px-6 py-2.5 bg-accent hover:bg-accent-ink text-white font-bold rounded-xl transition text-[13px]"
                    >
                      次へ →
                    </button>
                  </div>
                )}
              </Fragment>
            );
          })}

          {doneCount > 0 && doneCount >= totalSteps && (
            <div className="text-center py-6 bg-ok-soft border border-ok/20 rounded-xl">
              <p className="font-semibold text-ok">全ステップ完了 ✓</p>
            </div>
          )}
        </div>
      </div>

      {showHistory && instruction.updateHistory && (
        <ViewHistoryModal
          history={instruction.updateHistory}
          currentTitle={instruction.title}
          currentStepCount={instruction.steps.length}
          createdAt={instruction.createdAt}
          onView={snapshot => { setViewingSnapshot(snapshot); setShowHistory(false); setActiveTab('手順'); }}
          onClose={() => { setShowHistory(false); setActiveTab('手順'); }}
        />
      )}

      {showFlowchart && (
        <FlowchartModal
          instruction={instruction}
          onClose={() => { setShowFlowchart(false); setActiveTab('手順'); }}
        />
      )}
    </div>
  );
}

export default function InstructionViewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-500">読み込み中…</p>
      </div>
    }>
      <InstructionViewContent />
    </Suspense>
  );
}
