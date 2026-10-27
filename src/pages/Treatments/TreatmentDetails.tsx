import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Stethoscope, Save, Mail, HeartPulse, Receipt, CalendarPlus, FlaskConical, FileText, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { InputField } from '../../components/Inputs/InputField';
import { SelectField } from '../../components/Inputs/SelectField';
import { TextareaField } from '../../components/Inputs/TextareaField';
import { PetPicker } from '../../components/PetPicker/PetPicker';
import { LabReportUploadModal } from '../../components/LabReports/LabReportUploadModal';
import { Table, Column } from '../../components/Tables/Table';
import { Button } from '../../components/Buttons/Button';
import { InvoiceFormModal } from '../../components/Billing/InvoiceFormModal';
import { MedicalVisit, Pet } from '../../types';

export const TreatmentDetails: React.FC = () => {
  const {
    pets,
    invoices,
    getVisitsByPetId,
    addMedicalVisit,
    updateAppointmentStatus,
    updatePet,
    clinicSettings,
    showToast
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [disease, setDisease] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState<'Yes' | 'No'>('No');
  const [lastSavedVisitId, setLastSavedVisitId] = useState<string | null>(null);
  const [linkedAppointmentId, setLinkedAppointmentId] = useState<string | null>(null);
  const [isLabUploadOpen, setIsLabUploadOpen] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState<{ petId: string; visitId?: string } | null>(null);

  // Arriving from a Pet Profile's "Add Visit Record" link, or from "Start Visit"
  // on a booked appointment, lands with that pet already selected.
  useEffect(() => {
    const petIdParam = searchParams.get('petId');
    const appointmentIdParam = searchParams.get('appointmentId');
    if (petIdParam) {
      const found = pets.find(p => p.id === petIdParam);
      if (found) handlePetSelect(found);
    }
    if (appointmentIdParam) setLinkedAppointmentId(appointmentIdParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pets.length]);

  // Selecting a real pet auto-fills owner details, so the doctor is
  // updating from the pet's actual current record, not typing a name
  // and hoping it matches an existing one.
  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setOwnerName(pet.ownerName);
    if (pet.disease) setDisease(pet.disease);
    if (pet.symptoms) setSymptoms(pet.symptoms);
    setVaccinationStatus(pet.vaccinated || 'No');
    setLastSavedVisitId(null);
  };

  const petVisits = selectedPet ? getVisitsByPetId(selectedPet.id) : [];

  const handleSaveTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) {
      showToast('Please select a pet first.', 'warning');
      return;
    }

    const newVisit = addMedicalVisit({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerName: ownerName || selectedPet.ownerName,
      date: new Date(visitDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      disease: disease || 'Routine Consultation',
      symptoms,
      treatment: treatmentGiven || 'Prescribed therapy',
      medicines: medicines || 'Standard prescription',
      doctor: clinicSettings.doctorName || '',
      doctorNotes,
      nextVisit,
      appointmentId: linkedAppointmentId || undefined
    });

    // A visit that came from a booked appointment (via "Start Visit")
    // completes that appointment when it is saved.
    if (linkedAppointmentId) {
      updateAppointmentStatus(linkedAppointmentId, 'Completed');
    }

    // Vaccination status is recorded here, at the visit where it is learned or updated.
    if (vaccinationStatus !== selectedPet.vaccinated) {
      updatePet(selectedPet.id, { vaccinated: vaccinationStatus });
    }

    // Enables "Generate Invoice for This Visit" so billing links back to this visit.
    setLastSavedVisitId(newVisit.id);
  };

  // Available as soon as a pet is selected -- not just after saving --
  // so a quick consultation fee can be billed even before/without a full
  // treatment write-up. Once a visit has just been saved, the invoice is
  // linked to it automatically.
  const handleGenerateInvoice = () => {
    if (!selectedPet) return;
    setInvoiceTarget({ petId: selectedPet.id, visitId: lastSavedVisitId || undefined });
  };

  // Turns a typed "Next Visit" date into an actual booked appointment
  // instead of text nobody ever acts on.
  const handleBookFollowUp = () => {
    if (!selectedPet || !nextVisit) return;
    navigate(`/appointments?petId=${selectedPet.id}&date=${nextVisit}`);
  };

  const handleEmailReport = () => {
    if (!selectedPet) {
      showToast('Please select a pet first.', 'warning');
      return;
    }
    const params = new URLSearchParams({
      petName: selectedPet.name,
      ownerName: ownerName || selectedPet.ownerName,
      email: selectedPet.ownerEmail || '',
      visitDate: new Date(visitDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      disease,
      symptoms,
      treatment: treatmentGiven,
      medicines,
      notes: doctorNotes,
      nextVisit
    });
    navigate(`/email-report?${params.toString()}`);
  };

  // Previous Visits Table columns
  const previousVisitColumns: Column<MedicalVisit>[] = [
    {
      header: 'Date',
      accessor: 'date',
      width: '160px',
      render: v => <span className="font-semibold text-slate-700">{v.date}</span>
    },
    {
      header: 'Disease',
      accessor: 'disease',
      render: v => <span className="text-slate-700 font-medium">{v.disease}</span>
    },
    {
      header: 'Medicine',
      accessor: 'medicines',
      render: v => <span className="text-slate-600">{v.medicines || v.treatment}</span>
    },
    {
      header: 'Billing',
      accessor: 'invoiceId',
      width: '130px',
      render: v => {
        if (!v.invoiceId) {
          return (
            <button
              type="button"
              onClick={() => setInvoiceTarget({ petId: v.petId, visitId: v.id })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Receipt className="w-3 h-3" /> Bill
            </button>
          );
        }
        const linkedInvoice = invoices.find(inv => inv.id === v.invoiceId);
        const badgeColor =
          linkedInvoice?.status === 'Paid'
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : linkedInvoice?.status === 'Overdue'
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-amber-50 text-amber-700 hover:bg-amber-100';
        return (
          <button
            type="button"
            onClick={() => navigate(`/billing?viewInvoiceId=${v.invoiceId}`)}
            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer ${badgeColor}`}
          >
            View {linkedInvoice ? linkedInvoice.status : 'Invoice'}
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Treatment Details
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/treatment-history')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span>Treatment History</span>
        </button>
      </div>

      {linkedAppointmentId && (
        <div className="flex items-center gap-2.5 bg-[#F3E8FF] border border-purple-200 text-purple-700 text-xs rounded-lg px-4 py-2.5">
          <Stethoscope className="w-4 h-4 shrink-0" />
          <p>
            This visit is linked to a booked appointment — saving it will automatically mark that appointment{' '}
            <strong>Completed</strong>.
          </p>
        </div>
      )}

      {/* Main Treatment Form Card */}
      <form onSubmit={handleSaveTreatment} className="space-y-6">
        <SectionCard bodyClassName="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <PetPicker selectedPet={selectedPet} onSelect={handlePetSelect} />
              {selectedPet && (
                <div className="flex flex-wrap gap-3 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setIsLabUploadOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" /> Upload Lab Report for {selectedPet.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/forms?petId=${selectedPet.id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Fill a Form for {selectedPet.name}
                  </button>
                </div>
              )}
            </div>

            {/* Owner Name */}
            <InputField
              label="Owner Name"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="Auto-filled from selected pet"
              required
            />

            {/* Visit Date */}
            <InputField
              label="Visit Date"
              type="date"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              required
            />

            {/* Symptoms */}
            <InputField
              label="Symptoms"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Fever, loss of appetite, vomiting"
            />

            {/* Disease / Diagnosis */}
            <InputField
              label="Disease / Diagnosis"
              value={disease}
              onChange={e => setDisease(e.target.value)}
              placeholder="fever"
            />

            {/* Treatment Given */}
            <InputField
              label="Treatment Given"
              value={treatmentGiven}
              onChange={e => setTreatmentGiven(e.target.value)}
              placeholder="injection"
            />

            {/* Medicines */}
            <InputField
              label="Medicines"
              value={medicines}
              onChange={e => setMedicines(e.target.value)}
              placeholder="fever medicine"
            />

            {/* Next Visit */}
            <InputField
              label="Next Visit"
              type="date"
              value={nextVisit}
              onChange={e => setNextVisit(e.target.value)}
            />

            {/* Vaccination Status */}
            <SelectField
              label="Vaccination Status"
              value={vaccinationStatus}
              onChange={e => setVaccinationStatus(e.target.value as 'Yes' | 'No')}
              options={['Yes', 'No']}
            />

            {/* Doctor Notes */}
            <div className="md:col-span-2">
              <TextareaField
                label="Doctor Notes"
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                placeholder="take good care"
                rows={3}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-100 mt-6">
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
            >
              Save Treatment
            </Button>

            <Button
              type="button"
              variant="info"
              onClick={handleEmailReport}
              icon={<Mail className="w-4 h-4" />}
            >
              Email Report
            </Button>

            {selectedPet && (
              <Button
                type="button"
                variant="warning"
                onClick={handleGenerateInvoice}
                icon={<Receipt className="w-4 h-4" />}
              >
                {lastSavedVisitId ? 'Generate Invoice for This Visit' : 'Generate Invoice'}
              </Button>
            )}

            {lastSavedVisitId && nextVisit && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBookFollowUp}
                icon={<CalendarPlus className="w-4 h-4" />}
              >
                Book Follow-up ({nextVisit})
              </Button>
            )}
          </div>
        </SectionCard>
      </form>

      {/* Previous Visits Table -- scoped to the selected pet, not every
          pet's visits mixed together */}
      <SectionCard
        title={selectedPet ? `Previous Visits — ${selectedPet.name}` : 'Previous Visits'}
        icon={<HeartPulse className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-0"
      >
        <Table<MedicalVisit>
          columns={previousVisitColumns}
          data={petVisits}
          emptyMessage={selectedPet ? 'No previous visits recorded for this pet.' : 'Select a pet to see their visit history.'}
        />
      </SectionCard>

      {selectedPet && (
        <LabReportUploadModal isOpen={isLabUploadOpen} onClose={() => setIsLabUploadOpen(false)} fixedPet={selectedPet} />
      )}

      <InvoiceFormModal
        isOpen={!!invoiceTarget}
        onClose={() => setInvoiceTarget(null)}
        petId={invoiceTarget?.petId}
        visitId={invoiceTarget?.visitId}
      />
    </div>
  );
};