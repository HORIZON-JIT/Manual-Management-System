'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronRight, Folder, HardDrive, FolderPlus, X } from 'lucide-react';
import {
  DriveFolder,
  DriveLocation,
  listFolders,
  listSharedDrives,
  listSharedWithMeFolders,
  createNewFolder,
  getTargetFolder,
  setTargetFolder,
} from '@/lib/googleDrive';

interface DriveFolderPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (folder: DriveFolder | null) => void;
}

interface BreadcrumbItem {
  id: string | undefined;
  name: string;
}

const LOCATION_LABELS: Record<DriveLocation, string> = {
  'my-drive': 'マイドライブ',
  'shared-drives': '共有ドライブ',
  'shared-with-me': '共有アイテム',
};

export default function DriveFolderPicker({ open, onClose, onSelect }: DriveFolderPickerProps) {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<DriveLocation>('my-drive');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: undefined, name: 'マイドライブ' }]);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentDriveId, setCurrentDriveId] = useState<string | undefined>(undefined);
  const [isSharedDrivesList, setIsSharedDrivesList] = useState(false);
  const currentParentId = breadcrumbs[breadcrumbs.length - 1].id;

  const loadFolderList = useCallback(async (parentId?: string, driveId?: string) => {
    setLoading(true);
    try {
      const result = await listFolders(parentId, driveId ? { driveId } : undefined);
      setFolders(result);
    } catch (err) {
      console.error('Failed to list folders:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSharedDrives = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSharedDrives();
      setFolders(result);
    } catch (err) {
      console.error('Failed to list shared drives:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSharedWithMe = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSharedWithMeFolders();
      setFolders(result);
    } catch (err) {
      console.error('Failed to list shared folders:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchLocation = useCallback((loc: DriveLocation) => {
    setLocation(loc);
    setCurrentDriveId(undefined);
    setIsSharedDrivesList(false);
    setBreadcrumbs([{ id: undefined, name: LOCATION_LABELS[loc] }]);
    if (loc === 'shared-drives') setIsSharedDrivesList(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLocation('my-drive');
    setCurrentDriveId(undefined);
    setIsSharedDrivesList(false);
    setBreadcrumbs([{ id: undefined, name: 'マイドライブ' }]);
    loadFolderList(undefined);
  }, [open, loadFolderList]);

  useEffect(() => {
    if (!open) return;
    if (location === 'my-drive') loadFolderList(undefined);
    else if (location === 'shared-drives') loadSharedDrives();
    else if (location === 'shared-with-me') loadSharedWithMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const navigateInto = (folder: DriveFolder) => {
    if (isSharedDrivesList) {
      setIsSharedDrivesList(false);
      setCurrentDriveId(folder.id);
      setBreadcrumbs([
        { id: undefined, name: LOCATION_LABELS['shared-drives'] },
        { id: folder.id, name: folder.name },
      ]);
      loadFolderList(folder.id, folder.id);
      return;
    }
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    loadFolderList(folder.id, currentDriveId);
  };

  const navigateTo = (index: number) => {
    const next = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(next);
    const targetId = next[next.length - 1].id;
    if (location === 'shared-drives' && index === 0) {
      setIsSharedDrivesList(true);
      setCurrentDriveId(undefined);
      loadSharedDrives();
    } else if (location === 'shared-with-me' && index === 0) {
      loadSharedWithMe();
    } else {
      loadFolderList(targetId, currentDriveId);
    }
  };

  const handleSelectCurrent = () => {
    const current = breadcrumbs[breadcrumbs.length - 1];
    if (!current.id) {
      setTargetFolder(null);
      onSelect(null);
    } else {
      const folder: DriveFolder = { id: current.id, name: current.name };
      setTargetFolder(folder);
      onSelect(folder);
    }
    onClose();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    try {
      const created = await createNewFolder(newFolderName.trim(), currentParentId);
      setNewFolderName('');
      if (isSharedDrivesList) await loadSharedDrives();
      else if (location === 'shared-with-me' && !currentParentId) await loadSharedWithMe();
      else await loadFolderList(currentParentId, currentDriveId);
      navigateInto(created);
    } catch (err) {
      console.error('Failed to create folder:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setTargetFolder(null);
    onSelect(null);
    onClose();
  };

  const currentTarget = getTargetFolder();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,27,43,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-ink-200 rounded-[14px] w-full max-w-lg max-h-[85vh] flex flex-col" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-[22px] py-4 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="font-bold text-[16px] text-ink-900">保存先フォルダを選択</h2>
            {currentTarget && (
              <p className="text-[12px] text-ink-500 mt-0.5">
                現在の保存先: <span className="font-semibold text-accent-ink">{currentTarget.name}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="ml-4 text-ink-400 hover:text-ink-700 transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Location tabs */}
        <div className="px-[22px] py-2 border-b border-ink-100 flex gap-1 shrink-0">
          {(['my-drive', 'shared-drives', 'shared-with-me'] as DriveLocation[]).map(loc => (
            <button
              key={loc}
              onClick={() => switchLocation(loc)}
              className={[
                'px-3 py-1 rounded-full text-[12px] font-semibold transition-colors',
                location === loc
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700',
              ].join(' ')}
            >
              {LOCATION_LABELS[loc]}
            </button>
          ))}
        </div>

        {/* Breadcrumbs */}
        <div className="px-[22px] py-2 border-b border-ink-100 flex items-center gap-1 text-[12px] overflow-x-auto shrink-0">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight size={11} className="text-ink-300" />}
              <button
                onClick={() => navigateTo(i)}
                className={i === breadcrumbs.length - 1
                  ? 'font-semibold text-ink-900'
                  : 'text-ink-500 hover:text-ink-700 hover:underline'}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-[13px] text-ink-400">
              読み込み…
            </div>
          ) : folders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[13px] text-ink-400">
              {isSharedDrivesList ? '共有ドライブがありません' : 'フォルダがありません'}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {folders.map(folder => (
                <li key={folder.id}>
                  <button
                    onClick={() => navigateInto(folder)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-ink-50 flex items-center gap-2.5 text-[13px] transition-colors"
                  >
                    {isSharedDrivesList
                      ? <HardDrive size={15} className="text-accent shrink-0" />
                      : <Folder size={15} className="text-ink-400 shrink-0" />
                    }
                    <span className="text-ink-700 truncate">{folder.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New folder */}
        {!isSharedDrivesList && (
          <div className="px-[22px] py-2 border-t border-ink-100 shrink-0">
            <div className="flex items-center gap-2">
              <FolderPlus size={14} className="text-ink-400 shrink-0" />
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                placeholder="新しいフォルダ名…"
                className="flex-1 border border-ink-200 rounded-lg px-2.5 py-1.5 text-[13px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:border-accent bg-surface"
              />
              <button
                onClick={handleCreateFolder}
                disabled={creating || !newFolderName.trim()}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-[12px] font-semibold hover:bg-accent-ink transition-colors disabled:opacity-40"
              >
                {creating ? '作成中…' : '作成'}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-[22px] py-3.5 border-t border-ink-100 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="text-[12px] text-ink-400 hover:text-ink-700 underline transition-colors"
          >
            デフォルトに戻す
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 text-[13px] text-ink-600 hover:text-ink-900 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSelectCurrent}
              disabled={isSharedDrivesList}
              className="h-9 px-4 bg-accent text-white rounded-lg text-[13px] font-semibold hover:bg-accent-ink transition-colors disabled:opacity-40"
            >
              このフォルダを選択
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
