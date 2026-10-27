import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Edit, User, HeartPulse, FlaskConical, Upload, FileText, Eye, Download, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PetProfileCard } from '../../components/Cards/PetProfileCard';
import { SectionCard } from '../../components/Cards/SectionCard';
import { Table, Column } from '../../components/Tables/Table';
import { Button } from '../../components/Buttons/Button';
import { LabReportRow } from '../../components/LabReports/LabReportRow';
import { LabReportUploadModal } from '../../components/LabReports/LabReportUploadModal';
import { exportFormToPDF } from '../../utils/pdfExport';
import { formatDate } from '../../utils/formatters';
import { FORM_TEMPLATES } from '../../data/formTemplates';
import { PreviewModal } from '../../components/Modal/PreviewModal';
import { SavedFormView } from '../../components/Forms/SavedFormView';
import { MedicalVisit, Pet, PetForm } from '../../types';

export const PetProfile: React.FC = () => {
  const { pets, invoices, clinicSettings, getVisitsByPetId, getLabReportsByPetId, getFormsByPetId } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState<PetForm | null>(null);

  // Get active pet
  const requestedId = searchParams.get('id');
  const [selectedPetId, setSelectedPetId] = useState<string>(
    requestedId || (pets[0] ? pets[0].id : 'P001')
  );

  const currentPet: Pet = pets.find(p => p.id === selectedPetId) || pets[0];
  const petVisits = currentPet ? getVisitsByPetId(currentPet.id) : [];
  const petLabReports = currentPet ? getLabReportsByPetId(currentPet.id) : [];
  const petForms = currentPet ? getFormsByPetId(currentPet.id) : [];

  const visitColumns: Column<MedicalVisit>[] = [
    {
      header: 'Date',
      accessor: 'date',
      width: '180px',
      render: visit => <span className="font-semibold text-slate-700">{visit.date}</span>
    },
    {
      header: 'Disease',
      accessor: 'disease',
      render: visit => <span className="text-slate-700 font-medium">{visit.disease}</span>
    },
    {
      header: 'Treatment',
      accessor: 'treatment',
      render: visit => <span className="text-slate-600">{visit.treatment}</span>
    },
    {
      header: 'Billing',
      accessor: 'invoiceId',
      width: '130px',
      render: visit => {
        if (!visit.invoiceId) {
          return (
            <button
              type="button"
              onClick={() => navigate(`/billing?petId=${currentPet.id}&visitId=${visit.id}`)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Receipt className="w-3 h-3" /> Bill
            </button>
          );
        }
        const linkedInvoice = invoices.find(inv => inv.id === visit.invoiceId);
        const badgeColor =
          linkedInvoice?.status === 'Paid'
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : linkedInvoice?.status === 'Overdue'
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-amber-50 text-amber-700 hover:bg-amber-100';
        return (
          <button
            type="button"
            onClick={() => navigate(`/billing?viewInvoiceId=${visit.invoiceId}`)}
            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer ${badgeColor}`}
          >
            View {linkedInvoice ? linkedInvoice.status : 'Invoice'}
          </button>
        );
      }
    }
  ];

  const handleDownloadFormPDF = (formType: string, data: Record<string, string>) => {
    const template = FORM_TEMPLATES.find(t => t.id === formType);
    if (!template) return;
    exportFormToPDF(template, data, clinicSettings);
  };

  if (!currentPet) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-500">No pet record available.</p>
        <Button onClick={() => navigate('/register-pet')} className="mt-4">
          Register a Pet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header with Pet Quick-Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Pet Information
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Complete veterinary profile and historical medical records
          </p>
        </div>

        {/* Pet Switcher dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Select Pet:</span>
          <select
            value={currentPet.id}
            onChange={e => setSelectedPetId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 cursor-pointer shadow-2xs"
          >
            {pets.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.breed}) - {p.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Pet Profile Card */}
      <PetProfileCard pet={currentPet} />

      {/* 2. Owner Information Card */}
      <SectionCard
        title="Owner Information"
        icon={<User className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Owner Name
            </span>
            <span className="text-sm font-bold text-slate-800">{currentPet.ownerName}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Phone
            </span>
            <span className="text-sm font-bold text-slate-800">{currentPet.ownerPhone}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Email
            </span>
            <span className="text-sm font-bold text-slate-800">{currentPet.ownerEmail}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Address
            </span>
            <span className="text-sm font-bold text-slate-800">{currentPet.ownerAddress}</span>
          </div>
        </div>
      </SectionCard>

      {/* 3. Medical History Table */}
      <SectionCard
        title="Medical History"
        icon={<HeartPulse className="w-5 h-5 text-[#0F6B63]" />}
        headerAction={
          <button
            type="button"
            onClick={() => navigate(`/treatments?petId=${currentPet.id}`)}
            className="text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
          >
            + Add Visit Record
          </button>
        }
        bodyClassName="p-0"
      >
        <Table<MedicalVisit>
          columns={visitColumns}
          data={petVisits}
          emptyMessage="No previous visit records found for this pet."
        />
      </SectionCard>

      {/* Lab Reports (blood tests, X-rays, ultrasounds) */}
      <SectionCard
        title="Lab Reports"
        icon={<FlaskConical className="w-5 h-5 text-[#0F6B63]" />}
        headerAction={
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Report
          </button>
        }
        bodyClassName="p-0"
      >
        {petLabReports.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No lab reports uploaded for this pet yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {petLabReports.map(report => (
              <LabReportRow key={report.id} report={report} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Saved Forms (Consent / Admission / Certificate / Vaccination, etc.) */}
      <SectionCard
        title="Saved Forms"
        icon={<FileText className="w-5 h-5 text-[#0F6B63]" />}
        headerAction={
          <button
            type="button"
            onClick={() => navigate(`/forms?petId=${currentPet.id}`)}
            className="text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
          >
            + Fill a Form
          </button>
        }
        bodyClassName="p-0"
      >
        {petForms.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No forms saved for this pet yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {petForms.map(form => {
              return (
                <div
                  key={form.id}
                  className="w-full flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setViewingForm(form)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <p className="text-sm font-bold text-slate-800">{form.formTitle}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(form.createdAt)}</p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingForm(form)}
                      className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="View form"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFormPDF(form.formType, form.data)}
                      className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Send Email Report */}
        <Button
          variant="info"
          onClick={() =>
            navigate(
              `/email-report?petId=${currentPet.id}&email=${encodeURIComponent(
                currentPet.ownerEmail
              )}&name=${encodeURIComponent(currentPet.name)}`
            )
          }
          icon={<Mail className="w-4 h-4" />}
        >
          Send Email Report
        </Button>

        {/* Edit Profile */}
        <Button
          variant="warning"
          onClick={() => navigate(`/register-pet?editId=${currentPet.id}`)}
          icon={<Edit className="w-4 h-4" />}
        >
          Edit Profile
        </Button>
      </div>

      {viewingForm && (
        <PreviewModal
          title={viewingForm.formTitle}
          subtitle={`${viewingForm.petName} • ${viewingForm.ownerName} • ${formatDate(viewingForm.createdAt)}`}
          icon={<FileText className="w-4 h-4" />}
          onClose={() => setViewingForm(null)}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setViewingForm(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleDownloadFormPDF(viewingForm.formType, viewingForm.data)}
              >
                Download
              </Button>
            </>
          }
        >
          <div className="absolute inset-0 overflow-y-auto">
            <SavedFormView
              template={FORM_TEMPLATES.find(t => t.id === viewingForm.formType)}
              values={viewingForm.data}
            />
          </div>
        </PreviewModal>
      )}

      {currentPet && (
        <LabReportUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} fixedPet={currentPet} />
      )}
    </div>
  );
};