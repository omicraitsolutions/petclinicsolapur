import { supabase } from './supabaseClient';

// Lab report files (X-rays, blood test photos/PDFs) live in a private storage
// bucket, not the database; only the file's path and metadata are stored in
// the `lab_reports` table. Each file is saved under
// `${userId}/${petId}/${timestamp}_${filename}` so storage access rules can
// restrict it to the owning account's folder.

const BUCKET = 'lab-reports';

export function buildLabReportPath(userId: string, petId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return `${userId}/${petId}/${Date.now()}_${safeName}`;
}

export async function uploadLabReportFile(file: File, userId: string, petId: string): Promise<string> {
  const path = buildLabReportPath(userId, petId, file.name);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false
  });
  if (error) throw error;
  return path;
}

// The bucket is private, so viewing a file uses a short-lived signed link
// generated on demand instead of a permanent public URL.
export async function getLabReportSignedUrl(filePath: string, expiresInSeconds = 300): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteLabReportFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}
