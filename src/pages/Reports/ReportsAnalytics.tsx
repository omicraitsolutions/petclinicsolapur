import React from 'react';
import { PawPrint, Calendar, Syringe, IndianRupee, Download, FileText, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/Cards/StatCard';
import { SectionCard } from '../../components/Cards/SectionCard';
import { Table, Column } from '../../components/Tables/Table';
import { formatCurrency } from '../../utils/formatters';
import { exportReportToPDF } from '../../utils/pdfExport';
import { MonthlyReportItem, CommonDiseaseItem } from '../../types';

export const ReportsAnalytics: React.FC = () => {
  const { pets, appointments, invoices, monthlyReportData, commonDiseaseData, clinicSettings } = useApp();

  const totalPets = pets.length;
  const totalAppointments = appointments.length;
  const totalVaccinations = pets.filter(p => p.vaccinated === 'Yes').length;
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Payment methods are captured on every invoice but were never actually
  // shown anywhere -- this breaks total billed down by how it came in.
  const paymentMethodBreakdown = ['Cash', 'UPI', 'Card', 'Net Banking'].map(method => {
    const methodInvoices = invoices.filter(i => i.paymentMethod === method);
    return {
      method,
      count: methodInvoices.length,
      amount: methodInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
    };
  });

  const monthlyColumns: Column<MonthlyReportItem>[] = [
    {
      header: 'Month',
      accessor: 'month',
      render: r => <span className="font-semibold text-slate-800">{r.month}</span>
    },
    {
      header: 'Patients',
      accessor: 'patients',
      align: 'center',
      render: r => <span className="font-mono text-slate-700">{r.patients}</span>
    },
    {
      header: 'Treatments',
      accessor: 'treatments',
      align: 'center',
      render: r => <span className="font-mono text-slate-700">{r.treatments}</span>
    },
    {
      header: 'Revenue',
      accessor: 'revenue',
      align: 'right',
      render: r => (
        <span className="font-bold text-[#0F6B63] font-mono">
          {formatCurrency(r.revenue)}
        </span>
      )
    }
  ];

  const diseaseColumns: Column<CommonDiseaseItem>[] = [
    {
      header: 'Disease',
      accessor: 'disease',
      render: d => <span className="font-semibold text-slate-800">{d.disease}</span>
    },
    {
      header: 'Total Cases',
      accessor: 'totalCases',
      align: 'center',
      render: d => (
        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-slate-100 font-bold text-xs text-slate-800 font-mono">
          {d.totalCases}
        </span>
      )
    }
  ];

  const handleExportPDF = () => {
    exportReportToPDF('Clinical & Financial Analytics Report', [
      {
        title: 'High-Level Clinic Performance Metrics',
        content: [
          ['Total Pets Registered', `${totalPets} pets`],
          ['Scheduled Appointments', `${totalAppointments} visits`],
          ['Vaccination Administered', `${totalVaccinations} pets vaccinated`],
          ['Gross Clinic Revenue (Paid Invoices)', formatCurrency(totalRevenue)]
        ]
      },
      {
        title: 'Monthly Patient Volume and Financial Trends',
        content:
          monthlyReportData.length > 0
            ? monthlyReportData.map(
                m => `${m.month}: ${m.patients} Patients | ${m.treatments} Treatments | ${formatCurrency(m.revenue)}`
              )
            : ['No visit or invoice history yet.']
      },
      {
        title: 'Disease Prevalence & Clinical Diagnosis Breakdown',
        content:
          commonDiseaseData.length > 0
            ? commonDiseaseData.map(d => `${d.disease}: ${d.totalCases} confirmed diagnoses`)
            : ['No treatment records yet.']
      },
      {
        title: 'Revenue by Payment Method',
        content:
          invoices.length > 0
            ? paymentMethodBreakdown.map(
                p => `${p.method}: ${p.count} invoice${p.count === 1 ? '' : 's'} — ${formatCurrency(p.amount)}`
              )
            : ['No billing records yet.']
      }
    ], clinicSettings.clinicName);
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Operational summaries, disease frequencies, and financial metrics
          </p>
        </div>

        {/* Export PDF Button */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-xs md:text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          value={String(totalPets)}
          label="Total Pets"
          icon={<PawPrint className="w-6 h-6" />}
        />
        <StatCard
          value={String(totalAppointments)}
          label="Appointments"
          icon={<Calendar className="w-6 h-6" />}
        />
        <StatCard
          value={String(totalVaccinations)}
          label="Vaccinations"
          icon={<Syringe className="w-6 h-6" />}
        />
        <StatCard
          value={formatCurrency(totalRevenue)}
          label="Total Revenue"
          icon={<IndianRupee className="w-6 h-6" />}
        />
      </div>

      {/* 1. Monthly Report Table */}
      <SectionCard
        title="Monthly Report"
        icon={<TrendingUp className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-0"
      >
        <Table<MonthlyReportItem>
          columns={monthlyColumns}
          data={monthlyReportData}
          emptyMessage="No visits or invoices recorded yet. Numbers will appear here as you use the app."
        />
      </SectionCard>

      {/* 2. Most Common Diseases Table */}
      <SectionCard
        title="Most Common Diseases"
        icon={<FileText className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-0"
      >
        <Table<CommonDiseaseItem>
          columns={diseaseColumns}
          data={commonDiseaseData}
          emptyMessage="No treatment records yet."
        />
      </SectionCard>
      {/* 3. Payment Method Breakdown -- shows where revenue is actually coming from */}
      <SectionCard
        title="Revenue by Payment Method"
        icon={<IndianRupee className="w-5 h-5 text-[#0F6B63]" />}
        bodyClassName="p-5"
      >
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No billing records yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethodBreakdown.map(({ method, count, amount }) => (
              <div key={method} className="bg-[#F8FAFC] border border-slate-100 rounded-lg px-4 py-3.5">
                <p className="text-xs font-semibold text-slate-600">{method}</p>
                <p className="text-lg font-bold text-[#0F6B63] font-mono mt-0.5">{formatCurrency(amount)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {count} invoice{count === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};