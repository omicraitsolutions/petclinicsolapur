import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Calendar, Stethoscope, IndianRupee, Check, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/Cards/StatCard';
import { SectionCard } from '../../components/Cards/SectionCard';
import { Table, Column } from '../../components/Tables/Table';
import { SearchBar } from '../../components/Inputs/SearchBar';
import { isPetProfileIncomplete } from '../../utils/petProfile';
import { formatCurrency } from '../../utils/formatters';
import { Pet } from '../../types';

export const Dashboard: React.FC = () => {
  const { pets, appointments, medicalVisits, invoices, clinicSettings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Visits are stamped with a "D MMM YYYY" string (see TreatmentDetails), so
  // walk-in patients without an appointment still count toward today's total.
  const todayFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const todaysVisitsCount = medicalVisits.filter(v => v.date === todayFormatted).length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newPatientsCount = pets.filter(p => p.registrationDate && new Date(p.registrationDate) >= sevenDaysAgo).length;

  // Real, actionable items instead of static counts -- a follow-up that's
  // actually due today or overdue, a visit nobody has billed yet, and an
  // invoice that's gone Overdue. Each links straight to where it's fixed.
  const today = new Date();
  const followUpsDueCount = medicalVisits.filter(v => {
    if (!v.nextVisit) return false;
    const next = new Date(v.nextVisit);
    return !isNaN(next.getTime()) && next <= today;
  }).length;
  const unbilledVisitsCount = medicalVisits.filter(v => !v.invoiceId).length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;

  // Replaces the old "Emails Sent" stat, which was just a vanity counter
  // with no action attached to it. Invoice dates are stored as ISO
  // strings (see BillingManagement), so a plain Date parse is reliable.
  const thisMonthRevenue = invoices
    .filter(i => {
      if (i.status !== 'Paid') return false;
      const invDate = new Date(i.date);
      return (
        !isNaN(invDate.getTime()) &&
        invDate.getMonth() === today.getMonth() &&
        invDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Today's appointments only (excluding cancelled), matching the
  // Appointments page's "Today" tab.
  const todayIso = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments
    .filter(a => a.date === todayIso && a.status !== 'Cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));


  // Filter recent patients based on search
  const filteredPets = pets.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.disease && p.disease.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const recentPatientsColumns: Column<Pet>[] = [
    {
      header: 'Pet',
      accessor: 'name',
      render: pet => (
        <span className="font-semibold text-slate-800 hover:text-[#0F6B63] transition-colors">
          {pet.name}
        </span>
      )
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: pet => <span className="text-slate-600">{pet.ownerName}</span>
    },
    {
      header: 'Disease',
      accessor: 'disease',
      render: pet => (
        <span className="text-slate-600 font-medium">
          {pet.disease || 'General Consultation'}
        </span>
      )
    },
    {
      header: 'Profile',
      accessor: 'id',
      align: 'center',
      render: pet =>
        isPetProfileIncomplete(pet) ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            Incomplete
          </span>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )
    }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            {clinicSettings.clinicName} {clinicSettings.address ? `- ${clinicSettings.address.split(',')[0]}` : 'Solapur'}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          value={String(pets.length)}
          label="Total Pets"
          icon={<PawPrint className="w-6 h-6" />}
          onClick={() => navigate('/pets')}
        />
        <StatCard
          value={String(todaysVisitsCount)}
          label="Today's Visits"
          icon={<Calendar className="w-6 h-6" />}
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          value={String(medicalVisits.length)}
          label="Treatments"
          icon={<Stethoscope className="w-6 h-6" />}
          onClick={() => navigate('/treatment-history')}
        />
        <StatCard
          value={formatCurrency(thisMonthRevenue)}
          label="Revenue This Month"
          icon={<IndianRupee className="w-6 h-6" />}
          onClick={() => navigate('/billing')}
        />
      </div>

      {/* Middle & Right Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Patients Table */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title="Recent Patients"
            headerAction={
              <button
                type="button"
                onClick={() => navigate('/pets')}
                className="text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
              >
                View All Pets →
              </button>
            }
            bodyClassName="p-0"
          >
            <Table<Pet>
              columns={recentPatientsColumns}
              data={filteredPets.slice(0, 5)}
              onRowClick={pet => navigate(`/pet-profile?id=${pet.id}`)}
              emptyMessage="No recent patient records found"
            />
          </SectionCard>
        </div>

        {/* Right Column: Today's Appointments & Notifications */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <SectionCard
            title="Today's Appointments"
            headerAction={
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="text-xs font-semibold text-[#0F6B63] hover:underline cursor-pointer"
              >
                Manage
              </button>
            }
            bodyClassName="p-4"
          >
            <div className="space-y-2.5">
              {todaysAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No appointments booked for today.</p>
              ) : (
                todaysAppointments.slice(0, 5).map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => navigate('/appointments')}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E8F8F0]/40 border border-slate-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          apt.status === 'Arrived'
                            ? 'bg-purple-500'
                            : apt.status === 'Completed'
                            ? 'bg-sky-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {apt.time}
                      </span>
                      <span className="text-xs text-slate-400">-</span>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0F6B63] capitalize">
                        {apt.petName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium capitalize">
                      {apt.ownerName}
                    </span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" bodyClassName="p-4">
            <div className="space-y-2.5 text-xs font-medium text-slate-700">
              <div
                onClick={() => navigate('/appointments')}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-purple-50/70 text-purple-800 border border-purple-100 cursor-pointer hover:bg-purple-100/70 transition-colors"
              >
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {followUpsDueCount} Follow-up{followUpsDueCount === 1 ? '' : 's'} Due
                </span>
              </div>
              <div
                onClick={() => navigate('/treatment-history')}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-50/70 text-amber-800 border border-amber-100 cursor-pointer hover:bg-amber-100/70 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {unbilledVisitsCount} Visit{unbilledVisitsCount === 1 ? '' : 's'} Awaiting Billing
                </span>
              </div>
              <div
                onClick={() => navigate('/billing')}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50/70 text-red-800 border border-red-100 cursor-pointer hover:bg-red-100/70 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {overdueInvoicesCount} Overdue Invoice{overdueInvoicesCount === 1 ? '' : 's'}
                </span>
              </div>
              <div
                onClick={() => navigate('/pets')}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50/70 text-blue-800 border border-blue-100 cursor-pointer hover:bg-blue-100/70 transition-colors"
              >
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {newPatientsCount} New Patient{newPatientsCount === 1 ? '' : 's'} (Last 7 Days)
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};