import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LabReportViewer } from './LabReportViewer';
import { LabReport } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  'Blood Test': 'bg-red-50 text-red-700 border-red-200',
  'X-Ray': 'bg-blue-50 text-blue-700 border-blue-200',
  Ultrasound: 'bg-purple-50 text-purple-700 border-purple-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200'
};

interface LabReportRowProps {
  report: LabReport;
  showPetColumn?: boolean;
  onViewPet?: (petId: string) => void;
}

export const LabReportRow: React.FC<LabReportRowProps> = ({ report, showPetColumn, onViewPet }) => {
  const { deleteLabReport } = useApp();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isImage = report.fileType.startsWith('image/');

  const handleDelete = () => {
    if (window.confirm(`Delete this ${report.reportType} report? This cannot be undone.`)) {
      deleteLabReport(report.id);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
        {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border ${TYPE_COLORS[report.reportType] || TYPE_COLORS.Other}`}>
            {report.reportType}
          </span>
          <span className="text-xs text-slate-500">{report.reportDate}</span>
          {showPetColumn && (
            <button
              type="button"
              onClick={() => onViewPet?.(report.petId)}
              className="text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
            >
              {report.petName} • {report.ownerName}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-700 truncate mt-0.5">{report.fileName}</p>
        {report.notes && <p className="text-xs text-slate-400 truncate">{report.notes}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="View report"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {isViewerOpen && <LabReportViewer report={report} onClose={() => setIsViewerOpen(false)} />}
    </div>
  );
};
