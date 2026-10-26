import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Eye, Send, Download, CheckCircle2, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { InputField } from '../../components/Inputs/InputField';
import { Button } from '../../components/Buttons/Button';
import { exportReportToPDF } from '../../utils/pdfExport';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const EmailReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { pets, clinicSettings, sendEmail, showToast } = useApp();

  const paramEmail = searchParams.get('email');
  const paramPetName = searchParams.get('petName') || searchParams.get('name') || pets[0]?.name || '';
  const paramOwner = searchParams.get('ownerName') || pets[0]?.ownerName || '';

  // Present only when arriving from Treatments' "Email Report" button.
  const paramVisitDate = searchParams.get('visitDate') || '';
  const paramDisease = searchParams.get('disease') || '';
  const paramSymptoms = searchParams.get('symptoms') || '';
  const paramTreatment = searchParams.get('treatment') || '';
  const paramMedicines = searchParams.get('medicines') || '';
  const paramNotes = searchParams.get('notes') || '';
  const paramNextVisit = searchParams.get('nextVisit') || '';
  const hasTreatmentDetails = !!(paramDisease || paramSymptoms || paramTreatment || paramMedicines || paramNotes);

  const activePet = pets.find(p => p.name.toLowerCase() === paramPetName.toLowerCase()) || pets[0];

  const [ownerEmail, setOwnerEmail] = useState(paramEmail || activePet?.ownerEmail || '');
  const [subject, setSubject] = useState(
    hasTreatmentDetails && paramDisease
      ? `Treatment Summary - ${activePet?.name || paramPetName || 'Your Pet'} (${paramDisease})`
      : `Treatment Summary - ${activePet?.name || paramPetName || 'Your Pet'}`
  );

  const defaultBody = hasTreatmentDetails
    ? `Dear ${activePet ? activePet.ownerName : paramOwner || 'Pet Owner'},

Thank you for visiting ${clinicSettings.clinicName || 'our clinic'}${paramVisitDate ? ` on ${paramVisitDate}` : ''}.

----------------------------------------
Pet Name : ${activePet ? activePet.name : paramPetName || 'N/A'}
Breed : ${activePet ? activePet.breed : 'N/A'}
----------------------------------------

Diagnosis: ${paramDisease || 'N/A'}
Symptoms: ${paramSymptoms || 'N/A'}
Treatment Given: ${paramTreatment || 'N/A'}
Medicines Prescribed: ${paramMedicines || 'N/A'}
${paramNotes ? `Doctor's Notes: ${paramNotes}\n` : ''}${paramNextVisit ? `Next Visit: ${paramNextVisit}\n` : ''}
Please continue the prescribed care and reach us at ${clinicSettings.phone || ''} for any concerns.

Best regards,
${clinicSettings.doctorName || ''}
${clinicSettings.clinicName || ''}
${clinicSettings.address || ''}`
    : `Dear ${activePet ? activePet.ownerName : paramOwner || 'Pet Owner'},

Thank you for visiting ${clinicSettings.clinicName || 'our clinic'}.

----------------------------------------
Pet Name : ${activePet ? activePet.name : paramPetName || 'N/A'}
Breed : ${activePet ? activePet.breed : 'N/A'}
Age : ${activePet ? activePet.age : 'N/A'}
----------------------------------------

Diagnosis & Care Instructions:
- Continue prescribed medications on time.
- Ensure clean drinking water and a calm resting area.
- In case of acute discomfort, reach us at ${clinicSettings.phone || ''}.

Best regards,
${clinicSettings.doctorName || ''}
${clinicSettings.clinicName || ''}
${clinicSettings.address || ''}`;

  const [emailBody, setEmailBody] = useState(defaultBody);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!ownerEmail) {
      showToast('Please provide a recipient email address.', 'warning');
      return;
    }

    setIsSending(true);
    const html = emailBody
      .split('\n')
      .map(line => (line.trim() === '' ? '<br/>' : `<p style="margin:0 0 6px 0;">${escapeHtml(line)}</p>`))
      .join('');

    await sendEmail({ to: ownerEmail, subject, text: emailBody, html });
    setIsSending(false);
  };

  const handleDownloadPDF = () => {
    exportReportToPDF(`Treatment_Report_${paramPetName}`, [
      {
        title: subject,
        content: emailBody.split('\n').filter(Boolean)
      }
    ], clinicSettings.clinicName);
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          Email Treatment Report
        </h1>
      </div>

      <SectionCard bodyClassName="p-6">
        <div className="space-y-5">
          {/* Owner Email */}
          <InputField
            label="Owner Email"
            type="email"
            list="owner-email-suggestions"
            value={ownerEmail}
            onChange={e => setOwnerEmail(e.target.value)}
            placeholder="owner@example.com"
            helperText="Type a pet or owner name to pick from a saved email."
            required
          />
          <datalist id="owner-email-suggestions">
            {pets
              .filter(p => p.ownerEmail)
              .map(p => (
                <option key={p.id} value={p.ownerEmail}>
                  {p.name} — {p.ownerName} ({p.ownerEmail})
                </option>
              ))}
          </datalist>

          {/* Subject */}
          <InputField
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Treatment Summary - Bruno"
            required
          />

          {/* Email Preview Card */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Email Preview
            </label>
            <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-5 text-xs md:text-sm text-slate-700 font-sans leading-relaxed">
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={12}
                className="w-full bg-transparent border-0 outline-none resize-y font-mono text-xs leading-relaxed text-slate-800"
              />
            </div>
          </div>

          {/* 3 Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {/* Preview Button (Blue) */}
            <Button
              type="button"
              variant="info"
              onClick={() => setIsPreviewModalOpen(true)}
              icon={<Eye className="w-4 h-4" />}
            >
              Preview
            </Button>

            {/* Send Email Button (Green) */}
            <Button
              type="button"
              variant="success"
              isLoading={isSending}
              onClick={handleSendEmail}
              icon={<Send className="w-4 h-4" />}
            >
              Send Email
            </Button>

            {/* Download PDF Button (Red) */}
            <Button
              type="button"
              variant="danger"
              onClick={handleDownloadPDF}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-xl w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0F6B63]" />
                <h3 className="text-base font-bold text-slate-800">Email Dispatch Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2 mb-4">
              <div>
                <span className="font-semibold text-slate-400">To:</span>{' '}
                <span className="text-slate-800 font-bold">{ownerEmail}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Subject:</span>{' '}
                <span className="text-slate-800 font-bold">{subject}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-wrap text-slate-700 max-h-72 overflow-y-auto">
              {emailBody}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button size="sm" variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleSendEmail();
                }}
              >
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};