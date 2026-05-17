import { WorkInstruction } from '@/types/instruction';
import { importInstruction } from '@/lib/storage';

const DEFAULT_FOLDER_NAME = 'WorkInstructions';
const FILE_NAME = 'work_instructions.json';
const STORAGE_KEY_FOLDER = 'drive_target_folder';

export interface DriveFolder {
  id: string;
  name: string;
}

export type DriveLocation = 'my-drive' | 'shared-drives' | 'shared-with-me';

export function getTargetFolder(): DriveFolder | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setTargetFolder(folder: DriveFolder | null) {
  if (folder) {
    localStorage.setItem(STORAGE_KEY_FOLDER, JSON.stringify(folder));
  } else {
    localStorage.removeItem(STORAGE_KEY_FOLDER);
  }
}

interface DriveFileList {
  files: { id: string; name: string }[];
}

async function findDefaultFolder(): Promise<string | null> {
  const res = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: `name='${DEFAULT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
      pageSize: '1',
    },
  });
  return res.result.files[0]?.id ?? null;
}

async function createDefaultFolder(): Promise<string> {
  const res = await gapi.client.request<{ id: string }>({
    path: 'https://www.googleapis.com/drive/v3/files',
    method: 'POST',
    body: JSON.stringify({
      name: DEFAULT_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  return res.result.id;
}

async function getTargetFolderId(): Promise<string> {
  const target = getTargetFolder();
  if (target) return target.id;
  const existing = await findDefaultFolder();
  if (existing) return existing;
  return createDefaultFolder();
}

async function findFile(folderId: string): Promise<string | null> {
  const escapedName = FILE_NAME.replace(/'/g, "\\''");
  const res = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: `name='${escapedName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
      pageSize: '1',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    },
  });
  return res.result.files[0]?.id ?? null;
}

export async function listFolders(
  parentId?: string,
  options?: { driveId?: string },
): Promise<DriveFolder[]> {
  const parentClause = parentId
    ? `'${parentId}' in parents`
    : "'root' in parents";
  const params: Record<string, string> = {
    q: `${parentClause} and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id,name)',
    orderBy: 'name',
    pageSize: '100',
  };
  if (options?.driveId) {
    params.driveId = options.driveId;
    params.corpora = 'drive';
    params.supportsAllDrives = 'true';
    params.includeItemsFromAllDrives = 'true';
  }
  const res = await gapi.client.request<DriveFileList>({ path: 'https://www.googleapis.com/drive/v3/files', params });
  return res.result.files.map((f) => ({ id: f.id, name: f.name }));
}

export async function listSharedDrives(): Promise<DriveFolder[]> {
  const res = await gapi.client.request<{ drives: { id: string; name: string }[] }>({
    path: 'https://www.googleapis.com/drive/v3/drives',
    params: { pageSize: '50', fields: 'drives(id,name)' },
  });
  return (res.result.drives ?? []).map((d) => ({ id: d.id, name: d.name }));
}

export async function listSharedWithMeFolders(): Promise<DriveFolder[]> {
  const res = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: "sharedWithMe=true and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id,name)',
      orderBy: 'name',
      pageSize: '100',
    },
  });
  return res.result.files.map((f) => ({ id: f.id, name: f.name }));
}

export async function createNewFolder(
  name: string,
  parentId?: string,
): Promise<DriveFolder> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) metadata.parents = [parentId];
  const res = await gapi.client.request<{ id: string; name: string }>({
    path: 'https://www.googleapis.com/drive/v3/files',
    method: 'POST',
    body: JSON.stringify(metadata),
  });
  return { id: res.result.id, name: res.result.name };
}

export interface DriveFileInfo {
  id: string;
  name: string;
}

export async function listJsonFilesInFolder(folderId: string): Promise<DriveFileInfo[]> {
  const res = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      fields: 'files(id,name)',
      orderBy: 'modifiedTime desc',
      pageSize: '100',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    },
  });
  return res.result.files.map((f) => ({ id: f.id, name: f.name }));
}

export async function downloadDriveFile(fileId: string): Promise<string> {
  const token = gapi.client.getToken()?.access_token;
  if (!token) throw new Error('Google認証が必要です');

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Drive API ${res.status}`);
  return res.text();
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Upload an XLSX buffer to Drive and convert it to native Google Sheets format.
 * Returns the Google Sheets spreadsheet ID for subsequent Sheets API calls.
 */
export async function uploadAsGoogleSheet(
  buffer: ArrayBuffer,
  sheetName: string,
): Promise<string> {
  const token = gapi.client.getToken()?.access_token;
  if (!token) throw new Error('Google認証が必要です');

  const folderId = await getTargetFolderId();
  const escapedName = sheetName.replace(/'/g, "\\'");

  // Check for existing Google Sheets file with same name
  const existingRes = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: `name='${escapedName}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id)',
      pageSize: '1',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    },
  });

  const existingId = existingRes.result.files[0]?.id;

  if (existingId) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': XLSX_MIME,
        },
        body: buffer,
      },
    );
    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      throw new Error(`Drive API ${updateRes.status}: ${errorText}`);
    }
    return existingId;
  }

  // Create new file with multipart upload
  const boundary = 'multipart_boundary_' + Math.random().toString(36).slice(2);
  const metadata = JSON.stringify({
    name: sheetName,
    mimeType: 'application/vnd.google-apps.spreadsheet',
    parents: [folderId],
  });

  const encoder = new TextEncoder();
  const metadataPart = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${XLSX_MIME}\r\n\r\n`,
  );
  const closingPart = encoder.encode(`\r\n--${boundary}--`);

  const combined = new Uint8Array(
    metadataPart.byteLength + buffer.byteLength + closingPart.byteLength,
  );
  combined.set(metadataPart, 0);
  combined.set(new Uint8Array(buffer), metadataPart.byteLength);
  combined.set(closingPart, metadataPart.byteLength + buffer.byteLength);

  const uploadRes = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    },
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Drive API ${uploadRes.status}: ${errorText}`);
  }

  const result = await uploadRes.json() as { id: string };
  return result.id;
}

export async function saveFileToDrive(content: string, filename: string, mimeType: string): Promise<void> {
  const token = gapi.client.getToken()?.access_token;
  if (!token) throw new Error('Google認証が必要です');

  const folderId = await getTargetFolderId();
  const escapedFilename = filename.replace(/'/g, "\\'");

  // Check for existing file
  const existingRes = await gapi.client.request<DriveFileList>({
    path: 'https://www.googleapis.com/drive/v3/files',
    params: {
      q: `name='${escapedFilename}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
      pageSize: '1',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    },
  });

  const existingId = existingRes.result.files[0]?.id;

  if (existingId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType },
        body: content,
      },
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Drive API ${res.status}: ${errorText}`);
    }
    return;
  }

  // Create new
  const boundary = 'boundary_' + Math.random().toString(36).slice(2);
  const metadata = JSON.stringify({ name: filename, mimeType, parents: [folderId] });
  const body = [
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    metadata,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Drive API ${res.status}: ${errorText}`);
  }
}

export async function saveInstructionsToDrive(instructions: WorkInstruction[]): Promise<void> {
  const content = JSON.stringify(instructions, null, 2);
  await saveFileToDrive(content, FILE_NAME, 'application/json');
}

export async function bulkImportFromDrive(): Promise<{ imported: number; skipped: number }> {
  const folderId = await getTargetFolderId();
  const files = await listJsonFilesInFolder(folderId);
  let imported = 0, skipped = 0;
  for (const file of files) {
    try {
      const text = await downloadDriveFile(file.id);
      const data = JSON.parse(text);
      const items: WorkInstruction[] = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (!item.id || !item.title || !Array.isArray(item.steps)) { skipped++; continue; }
        if (!item.status) item.status = 'completed';
        importInstruction(item);
        imported++;
      }
    } catch { skipped++; }
  }
  return { imported, skipped };
}

export async function loadInstructionsFromDrive(): Promise<WorkInstruction[] | null> {
  const target = getTargetFolder();
  const folderId = target ? target.id : await findDefaultFolder();
  if (!folderId) return null;

  const fileId = await findFile(folderId);
  if (!fileId) return null;

  const res = await gapi.client.request<WorkInstruction[]>({
    path: `https://www.googleapis.com/drive/v3/files/${fileId}`,
    params: { alt: 'media', supportsAllDrives: 'true' },
  });

  return res.result;
}
