import React, { useEffect, useState } from 'react';
import { FlaskConical, Download, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { PreviewModal } from '../Modal/PreviewModal';
import { Button } from '../Buttons/Button';
import { downloadLabReportBlob } from '../../lib/storage';
import { LabReport } from '../../types';

type FileKind = 'image' | 'pdf' | 'other';

function detectKind(report: LabReport): FileKind {
  const type = (report.fileType || '').toLowerCase();
  const name = (report.fileName || '').toLowerCase();
  if (type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|heic)$/.test(name)) return 'image';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  return 'other';
}

interface LabReportViewerProps {
  report: LabReport;
  onClose: () => void;
}

export const LabReportViewer: React.FC<LabReportViewerProps> = ({ report, onClose }) => {
  const kind = detectKind(report);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      try {
        const raw = await downloadLabReportBlob(report.filePath);
        // Re-type the blob so the browser renders it inline instead of
        // offering a download when storage returns a generic type.
        const mime = kind === 'pdf' ? 'application/pdf' : report.fileType || raw.type;
        const blob = kind === 'other' ? raw : new Blob([raw], { type: mime });
        createdUrl = URL.createObjectURL(blob);
        if (!cancelled) setObjectUrl(createdUrl);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not open this file.');
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [report.filePath, report.fileType, kind]);

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = report.fileName || 'lab-report';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <PreviewModal
      title={`${report.reportType} — ${report.fileName}`}
      subtitle={`${report.petName} • ${report.ownerName} • ${report.reportDate}`}
      icon={<FlaskConical className="w-4 h-4" />}
      onClose={onClose}
      footer={
        <>
          {objectUrl && kind !== 'other' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() => window.open(objectUrl, '_blank', 'noopener')}
              className="mr-auto"
            >
              Open full screen
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleDownload} disabled={!objectUrl}>
            Download
          </Button>
        </>
      }
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-semibold text-slate-700">This file could not be opened</p>
          <p className="text-xs text-slate-500 max-w-sm">{error}</p>
        </div>
      ) : !objectUrl ? (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : kind === 'image' ? (
        <div className="absolute inset-0 flex items-center justify-center p-3 bg-slate-900/5">
          <img src={objectUrl} alt={report.fileName} className="max-w-full max-h-full object-contain rounded-md shadow-sm bg-white" />
        </div>
      ) : kind === 'pdf' ? (
        <iframe src={objectUrl} title={report.fileName} className="absolute inset-0 w-full h-full border-0 bg-white" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <p className="text-sm font-semibold text-slate-700">Preview isn't available for this file type</p>
          <p className="text-xs text-slate-500">Use Download to open it on your device.</p>
        </div>
      )}
    </PreviewModal>
  );
};
