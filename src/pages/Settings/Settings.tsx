import React, { useState } from 'react';
import { Building2, Mail, Save, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { InputField } from '../../components/Inputs/InputField';
import { Button } from '../../components/Buttons/Button';

export const Settings: React.FC = () => {
  const {
    clinicSettings,
    updateClinicSettings,
    showToast,
    pets,
    owners,
    appointments,
    medicalVisits,
    invoices,
    labReports,
    petForms
  } = useApp();

  // Clinic info state
  const [clinicName, setClinicName] = useState(clinicSettings.clinicName);
  const [doctorName, setDoctorName] = useState(clinicSettings.doctorName);
  const [doctorQualification, setDoctorQualification] = useState(clinicSettings.doctorQualification || '');
  const [regNo, setRegNo] = useState(clinicSettings.regNo || '');
  const [email, setEmail] = useState(clinicSettings.email);
  const [phone, setPhone] = useState(clinicSettings.phone);
  const [address, setAddress] = useState(clinicSettings.address);
  const [logoUrl, setLogoUrl] = useState(clinicSettings.logoUrl || '');

  // Email sending configuration (Service ID / Template ID / Public Key)
  const [smtpEmail, setSmtpEmail] = useState(clinicSettings.smtpEmail);
  const [smtpPassword, setSmtpPassword] = useState(clinicSettings.smtpPassword);
  const [smtpHost, setSmtpHost] = useState(clinicSettings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(clinicSettings.smtpPort);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast('Logo image is too large. Please use an image under 1MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Downloads everything in the account as one JSON file the clinic can keep as its own backup.
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      clinicSettings,
      pets,
      owners,
      appointments,
      medicalVisits,
      invoices,
      labReports,
      petForms
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(clinicSettings.clinicName || 'petclinic').replace(/\s+/g, '-').toLowerCase()}-data-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Data export downloaded.', 'success');
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    updateClinicSettings({
      clinicName,
      doctorName,
      doctorQualification,
      regNo,
      email,
      phone,
      address,
      logoUrl,
      smtpEmail,
      smtpPassword,
      smtpHost,
      smtpPort
    });
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Clinic Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Manage your veterinary clinic information.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => handleSaveAll()}
          icon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* SECTION 1: CLINIC INFORMATION */}
        <SectionCard
          title="Clinic Information"
          icon={<Building2 className="w-5 h-5 text-[#0F6B63]" />}
          bodyClassName="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Clinic Name"
              value={clinicName}
              onChange={e => setClinicName(e.target.value)}
              placeholder="Pet Hospital Solapur"
              required
            />

            <InputField
              label="Doctor Name"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              placeholder="Dr. Full Name"
              required
            />

            <InputField
              label="Doctor Qualification"
              value={doctorQualification}
              onChange={e => setDoctorQualification(e.target.value)}
              placeholder="MVSc (Veterinary Surgery & Radiology)"
            />

            <InputField
              label="Registration Number"
              value={regNo}
              onChange={e => setRegNo(e.target.value)}
              placeholder="7717"
            />

            <InputField
              label="Clinic Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="clinic@example.com"
            />

            <InputField
              label="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXXX"
              required
            />

            <InputField
              label="Clinic Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Solapur, Maharashtra, India"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Clinic Logo
              </label>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Clinic logo preview"
                    className="w-12 h-12 rounded-full object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Appears on the sidebar and on printed bill receipts. Saved with the rest of this form.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* SECTION 2: EMAIL CONFIGURATION */}
        <SectionCard
          title="Email Configuration"
          icon={<Mail className="w-5 h-5 text-[#0F6B63]" />}
          bodyClassName="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="Service ID"
              value={smtpHost}
              onChange={e => setSmtpHost(e.target.value)}
              placeholder="service_xxxxxxx"
              required
            />

            <InputField
              label="Template ID"
              value={smtpEmail}
              onChange={e => setSmtpEmail(e.target.value)}
              placeholder="template_xxxxxxx"
              required
            />

            <InputField
              label="Public Key"
              type="password"
              value={smtpPassword}
              onChange={e => setSmtpPassword(e.target.value)}
              placeholder="XXXXXXXXXXXXXXXX"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            These details connect the clinic's email account so treatment reports can be emailed to pet owners
            directly from this app.
          </p>
        </SectionCard>

        {/* Bottom Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
            Save Settings
          </Button>
        </div>
      </form>

      {/* SECTION 3: DATA EXPORT -- outside the form since it's an immediate
          action, not a field being saved */}
      <SectionCard
        title="Data Export"
        icon={<Download className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-6"
      >
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Download every pet, owner, appointment, treatment, invoice, and form currently in this account as one
          file, right now. Keep it somewhere safe as your own copy of the clinic's records.
        </p>
        <Button type="button" variant="secondary" onClick={handleExportData} icon={<Download className="w-4 h-4" />}>
          Export All Data
        </Button>
      </SectionCard>
    </div>
  );
};