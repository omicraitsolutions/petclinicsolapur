import React, { useEffect, useState } from 'react';
import { Receipt, X, FileText, CheckCircle, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InputField } from '../Inputs/InputField';
import { Button } from '../Buttons/Button';
import { formatCurrency } from '../../utils/formatters';
import { exportInvoiceToPDF } from '../../utils/pdfExport';
import { InvoiceItem, InvoiceLineItem, BILL_ITEM_LABELS } from '../../types';

// Generates an invoice right where the user is (Appointments, Treatments),
// without sending them to the Billing page. Same fields and saving logic as
// the Billing page's own "Generate Invoice" form.

const emptyItems = (): InvoiceLineItem[] => BILL_ITEM_LABELS.map(label => ({ label, amount: 0 }));
const selectCls =
  'w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none cursor-pointer';
const labelCls = 'text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId?: string;
  petName?: string;
  visitId?: string;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, petId, petName, visitId }) => {
  const { pets, medicalVisits, addInvoice, updateMedicalVisit, clinicSettings, showToast } = useApp();
  const [selectedPetId, setSelectedPetId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(emptyItems());
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'Net Banking'>('Cash');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');
  const [created, setCreated] = useState<InvoiceItem | null>(null);

  // Reset and prefill every time the popup opens.
  useEffect(() => {
    if (!isOpen) return;
    const match =
      pets.find(p => p.id === petId) ||
      (petName ? pets.find(p => p.name.toLowerCase() === petName.toLowerCase()) : undefined);
    setSelectedPetId(match?.id || '');
    setOwnerName(match?.ownerName || '');
    setLineItems(emptyItems());
    setPaymentMethod('Cash');
    setStatus('Pending');
    setCreated(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, petId, petName, visitId]);

  if (!isOpen) return null;

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const linkedVisit = visitId ? medicalVisits.find(v => v.id === visitId) : undefined;
  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handlePetChange = (id: string) => {
    setSelectedPetId(id);
    const p = pets.find(item => item.id === id);
    if (p) setOwnerName(p.ownerName);
  };

  const handleAmountChange = (label: string, amount: string) => {
    setLineItems(prev => prev.map(item => (item.label === label ? { ...item, amount: Number(amount) || 0 } : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !ownerName) {
      showToast('Please select a pet and enter the owner name.', 'warning');
      return;
    }
    if (!lineItems.some(item => item.amount > 0)) {
      showToast('Enter an amount for at least one service.', 'warning');
      return;
    }

    const invoice = addInvoice({
      petName: selectedPet.name,
      ownerName,
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      totalAmount,
      paymentMethod,
      status,
      visitId: visitId || undefined
    });
    if (visitId) updateMedicalVisit(visitId, { invoiceId: invoice.id });
    setCreated(invoice);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Generate Treatment Invoice</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {created ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">Invoice {created.invoiceNumber} created</p>
              <p className="text-xs text-slate-500 mt-1">
                {created.petName} • {created.ownerName} • {created.paymentMethod} • {created.status}
              </p>
              <p className="text-2xl font-extrabold text-[#0F6B63] font-mono mt-3">{formatCurrency(created.totalAmount)}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => exportInvoiceToPDF(created, clinicSettings)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className={labelCls}>Select Pet</label>
                <select value={selectedPetId} onChange={e => handlePetChange(e.target.value)} className={selectCls}>
                  <option value="">Select a pet…</option>
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
              <InputField label="Owner Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Bill Items (leave blank / 0 for items not applicable)</label>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {lineItems.map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-xs text-slate-500 w-5 text-right">{idx + 1})</span>
                    <span className="text-xs font-medium text-slate-700 flex-1">{item.label}</span>
                    <input
                      type="number"
                      min={0}
                      value={item.amount || ''}
                      onChange={e => handleAmountChange(item.label, e.target.value)}
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
              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  className={selectCls}
                >
                  {['UPI', 'Card', 'Cash', 'Net Banking'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Payment Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className={selectCls}>
                  {['Paid', 'Pending', 'Overdue'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Invoice
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
