'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronRight, Folder, HardDrive, FolderPlus, X } from 'lucide-react';
import {
  DriveFolder,
  DriveLocation,
  listFolders,
  listSharedDrives,
  listSharedWithMeFolders,
  setTargetFolder,
  createNewFolder,
} from '@/lib/googleDrive';

interface BreadcrumbItem {
  id: string | undefined;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (folder: DriveFolder | null) => void;
}

export default function DriveFolderPicker({ open, onClose, onSelect }: Props) {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<DriveLocation>('my-drive');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: undefined, name: 'マイドライブ' }]);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentDriveId, setCurrentDriveId] = useState<string | undefined>(undefined);
  const [isSharedDrivesList, setIsSharedDrivesList] = useState(false);

  const currentParentId = breadcrumbs[breadcrumbs.length - 1].id;

  const loadFolderList = useCallback(async (parentId?: string, opts?: { driveId?: string; sharedDrivesList?: boolean }) => {
    setLoading(true);
    try {
      if (opts?.sharedDrivesList) {
        const result = await listSharedDrives();
        setFolders(result);
        setIsSharedDrivesList(true);
      } else if (location === 'shared-with-me' && !parentId) {
        const result = await listSharedWithMeFolders();
        setFolders(result);
        setIsSharedDrivesList(false);
      } else {
        const result = await listFolders(parentId, { driveId: opts?.driveId ?? currentDriveId });
        setFolders(result);
        setIsSharedDrivesList(false);
      }
    } catch (e) {
      console.error(e);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [location, currentDriveId]);

  useEffect(() => {
    if (!open) return;
    setBreadcrumbs([{ id: undefined, name: location === 'my-drive' ? 'マイドライブ' : location === 'shared-drives' ? '共有ドライブ' : '共有アイテム' }]);
    setCurrentDriveId(undefined);
    setIsSharedDrivesList(false);
    if (location === 'shared-drives') {
      loadFolderList(undefined, { sharedDrivesList: true });
    } else {
      loadFolderList(undefined);
    }
  }, [open, location]);

  const handleFolderClick = (folder: DriveFolder) => {
    if (isSharedDrivesList) {
      setCurrentDriveId(folder.id);
      setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
      loadFolderList(folder.id, { driveId: folder.id });
    } else {
      setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
      loadFolderList(folder.id);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    const target = newCrumbs[newCrumbs.length - 1];
    loadFolderList(target.id);
  };

  const handleSelectCurrent = () => {
    const current = breadcrumbs[breadcrumbs.length - 1];
    if (!current.id) {
      setTargetFolder(null);
      onSelect(null);
    } else {
      const folder: DriveFolder = { id: current.id, name: current.name, driveId: currentDriveId };
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
      loadFolderList(currentParentId);
      const folder: DriveFolder = { id: created.id, name: created.name, driveId: currentDriveId };
      setTargetFolder(folder);
      onSelect(folder);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setTargetFolder(null);
    onSelect(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,27,43,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col overflow-hidden border border-ink-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-bold text-[15px] text-ink-900">Driveフォルダを選択</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Location tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-2 border-b border-ink-100">
          {(['my-drive', 'shared-drives', 'shared-with-me'] as DriveLocation[]).map(loc => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={[
                'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors',
                location === loc ? 'bg-accent-soft text-accent-ink' : 'text-ink-500 hover:bg-ink-50',
              ].join(' ')}
            >
              {loc === 'my-drive' ? 'マイドライブ' : loc === 'shared-drives' ? '共有ドライブ' : '共有アイテム'}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-5 py-2 text-[12px] text-ink-500 overflow-x-auto no-scrollbar">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight size={11} className="text-ink-300" />}
              <button
                onClick={() => handleBreadcrumbClick(i)}
                className={i === breadcrumbs.length - 1 ? 'font-semibold text-ink-900' : 'hover:text-ink-700 transition-colors'}
              >
                {i === 0 ? <HardDrive size={13} className="inline" /> : crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {loading ? (
            <div className="py-8 text-center text-[13px] text-ink-400">読み込み中…</div>
          ) : folders.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-ink-400">フォルダがありません</div>
          ) : (
            folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-ink-50 transition-colors text-left"
              >
                <Folder size={16} className="text-ink-400 shrink-0" />
                <span className="text-[13px] text-ink-800 truncate">{folder.name}</span>
                <ChevronRight size={13} className="text-ink-300 ml-auto shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* New folder input */}
        <div className="px-5 py-3 border-t border-ink-100">
          <div className="flex gap-2">
            <input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="新しいフォルダ名"
              className="flex-1 h-8 px-3 text-[12px] border border-ink-200 rounded-lg bg-ink-50 focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleCreateFolder}
              disabled={creating || !newFolderName.trim()}
              className="h-8 px-3 text-[12px] bg-ink-100 hover:bg-ink-200 rounded-lg text-ink-700 font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <FolderPlus size={13} />
              {creating ? '作成中…' : '作成'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-3 border-t border-ink-100">
          <button
            onClick={handleReset}
            className="text-[12px] text-ink-500 hover:text-ink-700 transition-colors"
          >
            リセット
          </button>
          <button
            onClick={handleSelectCurrent}
            disabled={!currentParentId}
            className="ml-auto h-8 px-4 bg-accent hover:bg-accent-ink text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            このフォルダを選択
          </button>
        </div>
      </div>
    </div>
  );
}
