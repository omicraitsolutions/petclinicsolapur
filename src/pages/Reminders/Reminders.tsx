import React, { useEffect, useRef, useState } from 'react';
import {
  BellRing,
  CalendarClock,
  CalendarCheck,
  Receipt,
  Stethoscope,
  Mail,
  Send,
  Settings as SettingsIcon,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { StatusBadge } from '../../components/Tables/StatusBadge';
import { Button } from '../../components/Buttons/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { notificationsSupported, requestNotificationPermission } from '../../components/Reminders/ReminderAlerts';
import { useReminders, ReminderItem, ReminderKind, localDateStr, daysFromToday } from '../../hooks/useReminders';

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------
type FilterKey = 'all' | ReminderKind;

interface ReminderTemplate {
  subject: string;
  body: string;
}
type TemplateMap = Record<ReminderKind, ReminderTemplate>;


const TEMPLATE_STORAGE_KEY = 'reminder_templates_v1';
const SENT_STORAGE_KEY = 'reminder_sent_v1';

const DEFAULT_TEMPLATES: TemplateMap = {
  followup: {
    subject: 'Follow-up Visit Reminder - {pet_name}',
    body: `Dear {owner_name},

{pet_name} is due for a follow-up visit at {clinic_name} on {date}. Last visit: {last_visit}{diagnosis}.

Please book a time that suits you by calling {clinic_phone}. Regular follow-ups help {pet_name} recover fully.

Best regards,
{doctor_name}
{clinic_name}
{clinic_address}`
  },
  appointment: {
    subject: 'Appointment Reminder - {pet_name}',
    body: `Dear {owner_name},

This is a friendly reminder that {pet_name} has an appointment at {clinic_name} on {date} at {time}.

Please arrive a few minutes early. If you need to change the time, call us at {clinic_phone}.

Best regards,
{doctor_name}
{clinic_name}
{clinic_address}`
  },
  rescheduled: {
    subject: 'Appointment Rescheduled - {pet_name}',
    body: `Dear {owner_name},

{pet_name}'s appointment at {clinic_name} (earlier: {old_date}) has been rescheduled to {date} at {time}.

If this new time does not suit you, please call us at {clinic_phone}.

Best regards,
{doctor_name}
{clinic_name}
{clinic_address}`
  },
  fee: {
    subject: 'Pending Payment Reminder - {pet_name}',
    body: `Dear {owner_name},

Our records show a pending payment of {amount} for {pet_name} (Invoice {invoice_no}, dated {invoice_date}).

Kindly clear the amount on your next visit or contact us at {clinic_phone} if you have already paid.

Thank you,
{doctor_name}
{clinic_name}
{clinic_address}`
  }
};

const KIND_META: Record<ReminderKind, { label: string; tabLabel: string; badge: string }> = {
  followup: { label: 'Follow-up Visit', tabLabel: 'Follow-ups', badge: 'bg-[#E8F8F0] text-[#1E8E5A] border-[#bbf0d7]' },
  rescheduled: { label: 'Rescheduled', tabLabel: 'Rescheduled', badge: 'bg-[#F3E8FF] text-[#7E22CE] border-[#e9d5ff]' },
  appointment: { label: 'Upcoming Appointment', tabLabel: 'Appointments', badge: 'bg-[#E0F2FE] text-[#0284C7] border-[#bae6fd]' },
  fee: { label: 'Pending Fees', tabLabel: 'Pending Fees', badge: 'bg-[#FEF6E6] text-[#D97706] border-[#fde68a]' }
};

const PLACEHOLDERS: { token: string; hint: string; kinds: ReminderKind[] }[] = [
  { token: 'owner_name', hint: 'Pet owner name', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] },
  { token: 'pet_name', hint: 'Pet name', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] },
  { token: 'date', hint: 'Appointment / follow-up date', kinds: ['followup', 'rescheduled', 'appointment'] },
  { token: 'time', hint: 'Appointment time', kinds: ['rescheduled', 'appointment'] },
  { token: 'last_visit', hint: 'Date of the last treatment visit', kinds: ['followup'] },
  { token: 'diagnosis', hint: 'Diagnosis (shown as " for X")', kinds: ['followup'] },
  { token: 'old_date', hint: 'Previous date & time', kinds: ['rescheduled'] },
  { token: 'amount', hint: 'Pending amount', kinds: ['fee'] },
  { token: 'invoice_no', hint: 'Invoice number', kinds: ['fee'] },
  { token: 'invoice_date', hint: 'Invoice date', kinds: ['fee'] },
  { token: 'clinic_name', hint: 'Clinic name', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] },
  { token: 'doctor_name', hint: 'Doctor name', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] },
  { token: 'clinic_phone', hint: 'Clinic phone', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] },
  { token: 'clinic_address', hint: 'Clinic address', kinds: ['followup', 'rescheduled', 'appointment', 'fee'] }
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const dueLabel = (dateStr: string): string => {
  const n = daysFromToday(dateStr);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1) return `In ${n} days`;
  return `${Math.abs(n)} ${Math.abs(n) === 1 ? 'day' : 'days'} overdue`;
};

const fillTemplate = (text: string, vars: Record<string, string>): string =>
  text
    .replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match))
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toHtml = (text: string) =>
  text
    .split('\n')
    .map(line => (line.trim() === '' ? '<br/>' : `<p style="margin:0 0 6px 0;">${escapeHtml(line)}</p>`))
    .join('');

const loadTemplates = (): TemplateMap => {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const saved = JSON.parse(raw) as Partial<TemplateMap>;
    return {
      followup: { ...DEFAULT_TEMPLATES.followup, ...saved.followup },
      appointment: { ...DEFAULT_TEMPLATES.appointment, ...saved.appointment },
      rescheduled: { ...DEFAULT_TEMPLATES.rescheduled, ...saved.rescheduled },
      fee: { ...DEFAULT_TEMPLATES.fee, ...saved.fee }
    };
  } catch {
    return DEFAULT_TEMPLATES;
  }
};

const loadSent = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(SENT_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const Reminders: React.FC = () => {
  const { clinicSettings, sendEmail, showToast } = useApp();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [templates, setTemplates] = useState<TemplateMap>(loadTemplates);
  const [sent, setSent] = useState<Record<string, string>>(loadSent);
  const [sendingKey, setSendingKey] = useState<string | null>(null);

  // Settings panel (message format)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported() ? Notification.permission : 'unsupported'
  );
  const [showSettings, setShowSettings] = useState(false);
  const [editKind, setEditKind] = useState<ReminderKind>('appointment');
  const [draft, setDraft] = useState<TemplateMap>(templates);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showSettings) setDraft(templates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSettings]);

  const today = localDateStr();

  const clinicVars = {
    clinic_name: clinicSettings.clinicName || 'Pet Hospital Solapur',
    doctor_name: clinicSettings.doctorName || '',
    clinic_phone: clinicSettings.phone || '',
    clinic_address: clinicSettings.address || ''
  };

  const { reminders, counts, pendingTotal } = useReminders();

  const visible = filter === 'all' ? reminders : reminders.filter(r => r.kind === filter);

  // ---- sending ----
  const handleSend = async (item: ReminderItem) => {
    if (!item.email) {
      showToast(`No email saved for ${item.ownerName || 'this owner'}. Add it in the pet or owner record first.`, 'warning');
      return;
    }
    const tpl = templates[item.kind];
    const vars = { ...clinicVars, ...item.vars };
    const subject = fillTemplate(tpl.subject, vars);
    const text = fillTemplate(tpl.body, vars);

    setSendingKey(item.key);
    const result = await sendEmail({
      to: item.email,
      subject,
      text,
      html: toHtml(text),
      successMessage: `Reminder emailed to ${item.email}!`
    });
    setSendingKey(null);

    if (result.success) {
      const next = { ...sent, [item.key]: new Date().toISOString() };
      setSent(next);
      try {
        localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable: the badge just won't persist */
      }
    }
  };

  // ---- settings ----
  const insertToken = (token: string) => {
    const el = bodyRef.current;
    const text = `{${token}}`;
    const current = draft[editKind].body;
    if (!el) {
      setDraft({ ...draft, [editKind]: { ...draft[editKind], body: current + text } });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const nextBody = current.slice(0, start) + text + current.slice(end);
    setDraft({ ...draft, [editKind]: { ...draft[editKind], body: nextBody } });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const saveTemplates = () => {
    setTemplates(draft);
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    showToast('Reminder message format saved.', 'success');
    setShowSettings(false);
  };

  const resetCurrent = () => setDraft({ ...draft, [editKind]: DEFAULT_TEMPLATES[editKind] });

  const sampleVars: Record<string, string> = {
    ...clinicVars,
    owner_name: 'Rahul Patil',
    pet_name: 'Bruno',
    date: formatDate(today),
    time: '10:30 AM',
    old_date: '10 Nov 2026 at 9:30 AM',
    last_visit: '05 Nov 2026',
    diagnosis: ' for skin allergy',
    amount: formatCurrency(1500),
    invoice_no: 'INV-0012',
    invoice_date: formatDate(today)
  };

  const tabs: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: reminders.length },
    { key: 'followup', label: 'Follow-ups', count: counts.followup },
    { key: 'rescheduled', label: 'Rescheduled', count: counts.rescheduled },
    { key: 'appointment', label: 'Appointments', count: counts.appointment },
    { key: 'fee', label: 'Pending Fees', count: counts.fee }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Reminders</h1>
            <p className="text-xs text-slate-500">What needs attention, and a one-click way to remind the owner.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {notifPermission === 'default' && (
            <Button
              type="button"
              variant="info"
              icon={<BellRing className="w-4 h-4" />}
              onClick={async () => setNotifPermission(await requestNotificationPermission())}
            >
              Enable Alerts
            </Button>
          )}
          {notifPermission === 'granted' && (
            <span className="inline-flex items-center gap-1 text-xs text-[#16A34A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Alerts on
            </span>
          )}
          {notifPermission === 'denied' && (
            <span className="text-xs text-slate-500">Alerts blocked in browser settings</span>
          )}
          <Button
            type="button"
            variant="outline"
            icon={<SettingsIcon className="w-4 h-4" />}
            onClick={() => setShowSettings(true)}
          >
            Message Settings
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8F8F0] text-[#1E8E5A] flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{counts.followup}</div>
            <div className="text-xs text-slate-500">Follow-up visits due</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{counts.rescheduled}</div>
            <div className="text-xs text-slate-500">Rescheduled appointments</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{counts.appointment}</div>
            <div className="text-xs text-slate-500">Upcoming appointments</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FEF6E6] text-[#D97706] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{formatCurrency(pendingTotal)}</div>
            <div className="text-xs text-slate-500">Pending fees ({counts.fee} {counts.fee === 1 ? 'invoice' : 'invoices'})</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              filter === t.key
                ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Reminder list */}
      <SectionCard bodyClassName="p-0">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
            Nothing to remind right now. You're all caught up.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map(item => {
              const meta = KIND_META[item.kind];
              const sentAt = sent[item.key];
              const isFee = item.kind === 'fee';
              const dateStr = item.sortKey.split(' ')[0];
              return (
                <li key={item.key} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      {isFee && item.status && <StatusBadge status={item.status} />}
                      {!isFee && dueLabel(dateStr) && (
                        <span
                          className={`text-xs font-semibold ${daysFromToday(dateStr) < 0 ? 'text-[#DC2626]' : 'text-[#0F6B63]'}`}
                        >
                          {dueLabel(dateStr)}
                        </span>
                      )}
                      {sentAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sent {formatDate(sentAt)}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-800 truncate">
                      {item.petName} <span className="font-medium text-slate-500">· {item.ownerName}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      {isFee ? (
                        <>
                          <span className="font-bold text-slate-800">{item.vars.amount}</span> pending · Invoice{' '}
                          {item.vars.invoice_no} · {item.vars.invoice_date}
                        </>
                      ) : (
                        item.kind === 'followup' ? (
                        <>
                          <span className="font-semibold text-slate-800">Follow-up on {item.vars.date}</span>
                          <span className="text-slate-500">
                            {' '}
                            (last visit {item.vars.last_visit}
                            {item.vars.diagnosis})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-800">
                            {item.vars.date} at {item.vars.time}
                          </span>
                          {item.kind === 'rescheduled' && item.vars.old_date && (
                            <span className="text-slate-500"> (was {item.vars.old_date})</span>
                          )}
                        </>
                      )
                      )}
                    </div>

                    <div className="text-xs">
                      {item.email ? (
                        <span className="text-slate-500">{item.email}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#D97706]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          No email saved for this owner
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="success"
                      icon={<Send className="w-3.5 h-3.5" />}
                      isLoading={sendingKey === item.key}
                      disabled={!item.email || sendingKey !== null}
                      onClick={() => handleSend(item)}
                    >
                      {sentAt ? 'Send Again' : 'Send Email'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* Message settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0F6B63]" />
                <h3 className="text-base font-bold text-slate-800">Reminder Message Format</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(KIND_META) as ReminderKind[]).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEditKind(k)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                      editKind === k
                        ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {KIND_META[k].tabLabel}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Subject</label>
                <input
                  type="text"
                  value={draft[editKind].subject}
                  onChange={e => setDraft({ ...draft, [editKind]: { ...draft[editKind], subject: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B63]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Message</label>
                <textarea
                  ref={bodyRef}
                  rows={10}
                  value={draft[editKind].body}
                  onChange={e => setDraft({ ...draft, [editKind]: { ...draft[editKind], body: e.target.value } })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0F6B63] resize-y"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-slate-500 mr-1">Tap to insert:</span>
                  {PLACEHOLDERS.filter(p => p.kinds.includes(editKind)).map(p => (
                    <button
                      key={p.token}
                      type="button"
                      title={p.hint}
                      onClick={() => insertToken(p.token)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 cursor-pointer"
                    >
                      {`{${p.token}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Preview (sample data)
                </label>
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 text-xs text-slate-700">
                  <div className="font-bold mb-2">{fillTemplate(draft[editKind].subject, sampleVars)}</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{fillTemplate(draft[editKind].body, sampleVars)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
              <Button type="button" size="sm" variant="secondary" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetCurrent}>
                Reset this message
              </Button>
              <div className="flex gap-3">
                <Button type="button" size="sm" variant="secondary" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" variant="primary" onClick={saveTemplates}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};