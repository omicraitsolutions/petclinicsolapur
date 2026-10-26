import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Search, Receipt, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { Table, Column } from '../../components/Tables/Table';
import { Pagination } from '../../components/Pagination/Pagination';
import { MedicalVisit } from '../../types';

type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

// Visit dates are stored as free-text (e.g. "27 Sep 2026"), so parse
// each one through Date -- consistent with how the rest of the app
// (formatters.ts) already treats these strings.
function parseVisitDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const TreatmentHistory: React.FC = () => {
  const { medicalVisits, invoices } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
  const itemsPerPage = 10;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  // Newest first, regardless of insertion order.
  const sortedVisits = useMemo(() => {
    return [...medicalVisits].sort((a, b) => {
      const da = parseVisitDate(a.date)?.getTime() ?? 0;
      const db = parseVisitDate(b.date)?.getTime() ?? 0;
      return db - da;
    });
  }, [medicalVisits]);

  const filteredVisits = sortedVisits.filter(visit => {
    const matchesSearch =
      !searchTerm ||
      visit.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.disease.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (dateFilter === 'all') return true;

    const visitDate = parseVisitDate(visit.date);
    if (!visitDate) return false;

    if (dateFilter === 'today') return isSameDay(visitDate, today);
    if (dateFilter === 'yesterday') return isSameDay(visitDate, yesterday);
    if (dateFilter === 'week') return visitDate >= weekAgo && visitDate <= today;
    if (dateFilter === 'month') return visitDate >= monthAgo && visitDate <= today;
    return true;
  });

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage) || 1;
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<MedicalVisit>[] = [
    {
      header: 'Date',
      accessor: 'date',
      width: '150px',
      render: v => <span className="font-semibold text-slate-700">{v.date}</span>
    },
    {
      header: 'Pet',
      accessor: 'petName',
      render: v => (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            navigate(`/pet-profile?id=${v.petId}`);
          }}
          className="font-bold text-slate-800 hover:text-[#0F6B63] hover:underline cursor-pointer"
        >
          {v.petName}
        </button>
      )
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: v => <span className="text-slate-600">{v.ownerName}</span>
    },
    {
      header: 'Disease',
      accessor: 'disease',
      render: v => <span className="text-slate-700 font-medium">{v.disease}</span>
    },
    {
      header: 'Treatment',
      accessor: 'treatment',
      render: v => <span className="text-slate-600">{v.treatment}</span>
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
              onClick={e => {
                e.stopPropagation();
                navigate(`/billing?petId=${v.petId}&visitId=${v.id}`);
              }}
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
            onClick={e => {
              e.stopPropagation();
              navigate(`/billing?viewInvoiceId=${v.invoiceId}`);
            }}
            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 cursor-pointer ${badgeColor}`}
          >
            View {linkedInvoice ? linkedInvoice.status : 'Invoice'}
          </button>
        );
      }
    }
  ];

  const dateFilterOptions: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Treatment History
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Every treatment logged across all pets — {filteredVisits.length} record
              {filteredVisits.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/treatments')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm rounded-lg shadow-sm transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Treatment Details</span>
        </button>
      </div>

      <SectionCard bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by pet, owner or disease"
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-9 pr-3.5 py-2 min-h-[40px] focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value as DateFilter);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2 min-h-[40px] focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none cursor-pointer"
            >
              {dateFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <Table<MedicalVisit>
        columns={columns}
        data={paginatedVisits}
        onRowClick={visit => setSelectedVisit(visit)}
        emptyMessage="No treatments found for this filter."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => setCurrentPage(page)} />

      {/* Full treatment detail modal */}
      {selectedVisit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectedVisit(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 sticky top-0">
              <h3 className="text-sm font-bold text-slate-800">Treatment Details</h3>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => navigate(`/pet-profile?id=${selectedVisit.petId}`)}
                    className="text-base font-bold text-slate-800 hover:text-[#0F6B63] hover:underline cursor-pointer"
                  >
                    {selectedVisit.petName}
                  </button>
                  <p className="text-xs text-slate-500 mt-0.5">Owner: {selectedVisit.ownerName}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 shrink-0">{selectedVisit.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Diagnosis
                  </span>
                  <span className="text-sm text-slate-800">{selectedVisit.disease || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Symptoms
                  </span>
                  <span className="text-sm text-slate-800">{selectedVisit.symptoms || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Treatment Given
                  </span>
                  <span className="text-sm text-slate-800">{selectedVisit.treatment || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Medicines
                  </span>
                  <span className="text-sm text-slate-800">{selectedVisit.medicines || '—'}</span>
                </div>
                {selectedVisit.nextVisit && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Next Visit
                    </span>
                    <span className="text-sm text-slate-800">{selectedVisit.nextVisit}</span>
                  </div>
                )}
              </div>

              {selectedVisit.doctorNotes && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Doctor's Notes
                  </span>
                  <p className="text-sm text-slate-700 mt-0.5">{selectedVisit.doctorNotes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Billing</span>
                {!selectedVisit.invoiceId ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/billing?petId=${selectedVisit.petId}&visitId=${selectedVisit.id}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    <Receipt className="w-3 h-3" /> Bill
                  </button>
                ) : (
                  (() => {
                    const linkedInvoice = invoices.find(inv => inv.id === selectedVisit.invoiceId);
                    const badgeColor =
                      linkedInvoice?.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : linkedInvoice?.status === 'Overdue'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100';
                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/billing?viewInvoiceId=${selectedVisit.invoiceId}`)}
                        className={`text-[11px] font-semibold rounded-full px-2.5 py-1 cursor-pointer ${badgeColor}`}
                      >
                        View {linkedInvoice ? linkedInvoice.status : 'Invoice'}
                      </button>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};