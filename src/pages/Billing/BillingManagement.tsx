import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Receipt, Plus, Printer, CheckCircle, Clock, FileText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/Cards/StatCard';
import { Table, Column } from '../../components/Tables/Table';
import { StatusBadge } from '../../components/Tables/StatusBadge';
import { InputField } from '../../components/Inputs/InputField';
import { SelectField } from '../../components/Inputs/SelectField';
import { Button } from '../../components/Buttons/Button';
import { formatCurrency } from '../../utils/formatters';
import { exportInvoiceToPDF } from '../../utils/pdfExport';
import { InvoiceItem, InvoiceLineItem, BILL_ITEM_LABELS } from '../../types';

const emptyItems = (): InvoiceLineItem[] => BILL_ITEM_LABELS.map(label => ({ label, amount: 0 }));

export const BillingManagement: React.FC = () => {
  const { invoices, addInvoice, updateInvoiceStatus, updateMedicalVisit, medicalVisits, pets, clinicSettings, showToast } =
    useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<InvoiceItem | null>(null);
  const [linkedVisitId, setLinkedVisitId] = useState<string | null>(null);
  const [pendingViewInvoiceId, setPendingViewInvoiceId] = useState<string | null>(null);

  // New invoice form
  const [petName, setPetName] = useState(pets[0]?.name || '');
  const [ownerName, setOwnerName] = useState(pets[0]?.ownerName || '');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(emptyItems());
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'Net Banking'>('Cash');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');

  // Arriving from Treatments' "Generate Invoice for This Visit" opens the
  // create-invoice form with the pet already chosen.
  useEffect(() => {
    const petIdParam = searchParams.get('petId');
    const visitIdParam = searchParams.get('visitId');
    const viewInvoiceIdParam = searchParams.get('viewInvoiceId');
    if (petIdParam) {
      const foundPet = pets.find(p => p.id === petIdParam);
      if (foundPet) {
        setPetName(foundPet.name);
        setOwnerName(foundPet.ownerName);
      }
    }
    if (visitIdParam) {
      setLinkedVisitId(visitIdParam);
      setIsInvoiceModalOpen(true);
    }
    if (viewInvoiceIdParam) {
      setPendingViewInvoiceId(viewInvoiceIdParam);
    }
    // Clear the query params once consumed so refreshing/navigating back
    // doesn't keep re-triggering this.
    if (petIdParam || visitIdParam || viewInvoiceIdParam) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets.length]);

  // Resolved separately (rather than inline above) because invoices can
  // still be loading when this page first mounts -- this re-checks every
  // time the invoices list changes instead of only on the initial render.
  useEffect(() => {
    if (!pendingViewInvoiceId) return;
    const found = invoices.find(inv => inv.id === pendingViewInvoiceId);
    if (found) {
      setReceiptPreview(found);
      setPendingViewInvoiceId(null);
    }
  }, [pendingViewInvoiceId, invoices]);

  const linkedVisit = linkedVisitId ? medicalVisits.find(v => v.id === linkedVisitId) : null;

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // When pet changes
  const handlePetSelect = (name: string) => {
    setPetName(name);
    const p = pets.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (p) setOwnerName(p.ownerName);
  };

  const handleItemAmountChange = (label: string, amount: string) => {
    setLineItems(prev => prev.map(item => (item.label === label ? { ...item, amount: Number(amount) || 0 } : item)));
  };

  const resetForm = () => {
    setLineItems(emptyItems());
    setPaymentMethod('Cash');
    setStatus('Pending');
    setLinkedVisitId(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !ownerName) {
      showToast('Please select a pet and enter the owner name.', 'warning');
      return;
    }
    const items = lineItems.filter(item => item.amount > 0);
    if (items.length === 0) {
      showToast('Enter an amount for at least one service.', 'warning');
      return;
    }

    const newInvoice = addInvoice({
      petName,
      ownerName,
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      totalAmount,
      paymentMethod,
      status,
      visitId: linkedVisitId || undefined
    });

    // Completes the link back the other way -- the visit itself now
    // shows "Billed" instead of being a dead end.
    if (linkedVisitId) {
      updateMedicalVisit(linkedVisitId, { invoiceId: newInvoice.id });
    }

    setIsInvoiceModalOpen(false);
    resetForm();
  };

  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPending = invoices
    .filter(i => i.status === 'Pending')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Payment methods are captured on every invoice but were never actually
  // surfaced anywhere -- this breaks collected revenue down by how it
  // came in (Cash / Card / UPI / Net Banking).
  const paymentMethodBreakdown = ['Cash', 'UPI', 'Card', 'Net Banking'].map(method => {
    const methodInvoices = invoices.filter(i => i.paymentMethod === method);
    return {
      method,
      count: methodInvoices.length,
      amount: methodInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
    };
  });

  const filteredInvoices = invoices.filter(
    i =>
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintInvoice = (inv: InvoiceItem) => {
    exportInvoiceToPDF(inv, clinicSettings);
  };

  const columns: Column<InvoiceItem>[] = [
    {
      header: 'Invoice ID',
      accessor: 'invoiceNumber',
      render: inv => <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
    },
    {
      header: 'Pet Name',
      accessor: 'petName',
      render: inv => <span className="font-semibold text-slate-800 capitalize">{inv.petName}</span>
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: inv => <span className="text-slate-600 capitalize">{inv.ownerName}</span>
    },
    {
      header: 'Date',
      accessor: 'date',
      render: inv => <span className="text-slate-600 font-mono">{inv.date}</span>
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      align: 'right',
      render: inv => (
        <span className="font-bold text-[#0F6B63] font-mono">
          {formatCurrency(inv.totalAmount)}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      render: inv => <span className="text-slate-600">{inv.paymentMethod}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: inv => <StatusBadge status={inv.status} />
    },
    {
      header: 'Action',
      align: 'center',
      width: '160px',
      render: inv => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setReceiptPreview(inv)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="View Bill Receipt"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handlePrintInvoice(inv)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download / Print Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          {inv.status === 'Pending' && (
            <>
              <button
                type="button"
                onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                className="px-2 py-1 rounded-md bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-semibold"
              >
                Mark Paid
              </button>
              <button
                type="button"
                onClick={() => updateInvoiceStatus(inv.id, 'Overdue')}
                className="px-2 py-1 rounded-md bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold"
              >
                Mark Overdue
              </button>
            </>
          )}
          {inv.status === 'Overdue' && (
            <button
              type="button"
              onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
              className="px-2 py-1 rounded-md bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-semibold"
            >
              Mark Paid
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Billing & Invoices
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Manage treatment billing, consultation fees, receipts, and payment records
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInvoiceModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-xs md:text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          value={formatCurrency(totalBilled)}
          label="Total Billed"
          icon={<Receipt className="w-6 h-6" />}
        />
        <StatCard
          value={formatCurrency(totalPaid)}
          label="Total Collected"
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatCard
          value={formatCurrency(totalPending)}
          label="Pending Payments"
          icon={<Clock className="w-6 h-6" />}
        />
      </div>

      {/* Payment Method Breakdown -- how revenue is actually coming in */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">By Payment Method</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {paymentMethodBreakdown.map(({ method, count, amount }) => (
            <div key={method} className="bg-[#F8FAFC] border border-slate-100 rounded-lg px-3.5 py-3">
              <p className="text-xs font-semibold text-slate-600">{method}</p>
              <p className="text-base font-bold text-[#0F6B63] font-mono mt-0.5">{formatCurrency(amount)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {count} invoice{count === 1 ? '' : 's'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="w-full max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by invoice number, pet, or owner"
          className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
        />
      </div>

      {/* Invoices Table */}
      <Table<InvoiceItem>
        columns={columns}
        data={filteredInvoices}
        emptyMessage="No billing records found."
      />

      {/* Generate Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Generate Treatment Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {linkedVisit && (
                <div className="flex items-start gap-2.5 bg-[#E8F8F0] border border-[#0F6B63]/20 rounded-lg px-3.5 py-2.5 text-xs text-[#0F6B63]">
                  <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Linked to the visit on <strong>{linkedVisit.date}</strong> — {linkedVisit.disease || 'Routine Consultation'}
                    {linkedVisit.treatment ? ` (${linkedVisit.treatment})` : ''}.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Select Pet"
                  value={petName}
                  onChange={e => handlePetSelect(e.target.value)}
                  options={pets.map(p => p.name)}
                />
                <InputField
                  label="Owner Name"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Bill Items (leave blank / 0 for items not applicable)
                </label>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {lineItems.map((item, idx) => (
                    <div key={item.label} className="flex items-center gap-3 px-3 py-2">
                      <span className="text-xs text-slate-500 w-5 text-right">{idx + 1})</span>
                      <span className="text-xs font-medium text-slate-700 flex-1">{item.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={item.amount || ''}
                        onChange={e => handleItemAmountChange(item.label, e.target.value)}
                        placeholder="0"
                        className="w-24 text-right bg-[#F8FAFC] border border-slate-200 text-slate-800 text-xs rounded-md px-2 py-1.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#E8F8F0] rounded-lg flex items-center justify-between text-xs font-bold text-[#0F6B63]">
                <span>Total Amount:</span>
                <span className="text-base">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as 'UPI' | 'Card' | 'Cash' | 'Net Banking')}
                  options={['UPI', 'Card', 'Cash', 'Net Banking']}
                />
                <SelectField
                  label="Payment Status"
                  value={status}
                  onChange={e => setStatus(e.target.value as 'Paid' | 'Pending' | 'Overdue')}
                  options={['Paid', 'Pending', 'Overdue']}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsInvoiceModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Receipt Preview Modal — mirrors the clinic's physical bill book */}
      {receiptPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Bill Receipt Preview</h3>
              <button
                type="button"
                onClick={() => setReceiptPreview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-serif">
              {/* Header: logo (left) — clinic name (center) — doctor details (right) */}
              <div className="flex items-start gap-2 border-b-2 border-slate-800 pb-2 mb-2">
                {clinicSettings.logoUrl && (
                  <img
                    src={clinicSettings.logoUrl}
                    alt="Clinic Logo"
                    className="w-14 h-14 rounded-full object-contain bg-white border border-slate-200 shrink-0 p-0.5"
                  />
                )}
                <div className="flex-1 text-center px-1">
                  <h2 className="text-lg font-bold text-red-700 leading-tight uppercase">
                    {clinicSettings.clinicName}
                  </h2>
                  {clinicSettings.regNo && (
                    <p className="text-[9px] text-slate-500">MSVC Reg. No- {clinicSettings.regNo}</p>
                  )}
                </div>
                <div className="text-right shrink-0 w-32">
                  <p className="text-xs font-bold text-purple-800 leading-tight">{clinicSettings.doctorName}</p>
                  {clinicSettings.doctorQualification && (
                    <p className="text-[9px] text-slate-500 leading-tight">{clinicSettings.doctorQualification}</p>
                  )}
                  {clinicSettings.phone && (
                    <p className="text-[9px] text-slate-500 leading-tight">Mob. : {clinicSettings.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Bill Receipt</span>
                <div className="text-right font-normal">
                  <p className="text-slate-700">Invoice No: {receiptPreview.invoiceNumber}</p>
                  <p className="text-slate-500">Date : {receiptPreview.date}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Pet: {receiptPreview.petName} &nbsp;•&nbsp; Owner: {receiptPreview.ownerName}
              </p>

              <div className="space-y-1 mb-3">
                {receiptPreview.items.map((item, idx) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-xs text-slate-700 border-b border-dotted border-slate-300 pb-1"
                  >
                    <span>
                      {idx + 1}) {item.label}
                    </span>
                    <span className="font-semibold">{item.amount > 0 ? formatCurrency(item.amount) : ''}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-red-700 border-t-2 border-slate-800 pt-2">
                <span>Total =</span>
                <span>{formatCurrency(receiptPreview.totalAmount)}</span>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-[10px] text-slate-500">
                  {receiptPreview.paymentMethod} • {receiptPreview.status}
                </span>
                <span className="text-xs italic text-slate-600">Signature</span>
              </div>

              {clinicSettings.address && (
                <p className="text-[9px] text-slate-400 mt-4 text-center">({clinicSettings.address})</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-5 pb-5">
              <Button size="sm" variant="secondary" onClick={() => setReceiptPreview(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => handlePrintInvoice(receiptPreview)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};