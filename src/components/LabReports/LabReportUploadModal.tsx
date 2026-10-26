import React, { useState } from 'react';
import { X, Upload, FileText as FileIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PetPicker } from '../PetPicker/PetPicker';
import { InputField } from '../Inputs/InputField';
import { SelectField } from '../Inputs/SelectField';
import { TextareaField } from '../Inputs/TextareaField';
import { Button } from '../Buttons/Button';
import { Pet, LabReportType } from '../../types';

const REPORT_TYPES: LabReportType[] = ['Blood Test', 'X-Ray', 'Ultrasound', 'Other'];

interface LabReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // When provided (e.g. opened from a Pet Profile page), the pet picker
  // is skipped and every upload is scoped to this pet.
  fixedPet?: Pet;
}

export const LabReportUploadModal: React.FC<LabReportUploadModalProps> = ({ isOpen, onClose, fixedPet }) => {
  const { addLabReport, showToast } = useApp();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(fixedPet || null);
  const [reportType, setReportType] = useState<LabReportType>('Blood Test');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const pet = fixedPet || selectedPet;

  const resetForm = () => {
    setSelectedPet(fixedPet || null);
    setReportType('Blood Test');
    setReportDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUpload = async () => {
    if (!pet) {
      showToast('Please select a pet first.', 'warning');
      return;
    }
    if (!file) {
      showToast('Please choose a photo or PDF to upload.', 'warning');
      return;
    }

    setIsUploading(true);
    const result = await addLabReport({
      petId: pet.id,
      petName: pet.name,
      ownerName: pet.ownerName,
      reportType,
      reportDate,
      notes,
      file
    });
    setIsUploading(false);

    if (result.success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Upload Lab Report</h3>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {fixedPet ? (
            <div className="flex items-center gap-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg px-3.5 py-2.5">
              <span className="text-sm font-semibold text-slate-800">{fixedPet.name}</span>
              <span className="text-xs text-slate-500">• Owner: {fixedPet.ownerName}</span>
            </div>
          ) : (
            <PetPicker selectedPet={selectedPet} onSelect={setSelectedPet} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Report Type"
              value={reportType}
              onChange={e => setReportType(e.target.value as LabReportType)}
              options={REPORT_TYPES}
            />
            <InputField
              label="Report Date"
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
            />
          </div>

          <TextareaField
            label="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Fasting blood work, left leg X-ray"
            rows={2}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Photo or PDF
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5"
            />
            {file && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <FileIcon className="w-3.5 h-3.5" />
                <span className="truncate">{file.name}</span>
                <span>({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Accepted: images or PDF, up to 15MB.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 pb-5">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={<Upload className="w-4 h-4" />} onClick={handleUpload} isLoading={isUploading}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
