import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';

// Single source of truth for "what needs reminding". The Reminders page, the
// sidebar badge, the dashboard banner and the login popup all read from here,
// so their numbers always agree.

export type ReminderKind = 'followup' | 'rescheduled' | 'appointment' | 'fee';

export interface ReminderItem {
  key: string; // unique + stable, used to remember "already sent"
  kind: ReminderKind;
  petName: string;
  ownerName: string;
  email: string;
  sortKey: string; // YYYY-MM-DD (+ time) for ordering
  vars: Record<string, string>;
  status?: string;
}

export const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatTime = (t: string): string => {
  const match = /^(\d{1,2}):(\d{2})/.exec(t || '');
  if (!match) return t || '';
  const h = Number(match[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${suffix}`;
};

// rescheduledFrom is stored as "YYYY-MM-DD HH:mm"
const formatPrevious = (value: string): string => {
  const [d, t] = value.split(' ');
  return `${formatDate(d)}${t ? ` at ${formatTime(t)}` : ''}`;
};

export const daysFromToday = (dateStr: string): number => {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86400000);
};

export const sameText = (a?: string, b?: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

// Visit dates are saved as "D MMM YYYY" (e.g. "5 Nov 2026"), not ISO.
const visitTime = (s: string): number => {
  const t = new Date(s).getTime();
  return isNaN(t) ? NaN : t;
};

// Dated reminders (follow-ups, appointments) are "urgent" when they fall today,
// tomorrow, or are already overdue. Pending fees are always urgent.
export const isUrgent = (r: ReminderItem): boolean =>
  r.kind === 'fee' ? true : daysFromToday(r.sortKey.split(' ')[0]) <= 1;

export const useReminders = () => {
  const { appointments, invoices, medicalVisits, pets, owners } = useApp();
  const today = localDateStr();

  const reminders = useMemo<ReminderItem[]>(() => {
    const findEmail = (petId: string | undefined, petName: string, ownerName: string): string => {
      const pet =
        (petId ? pets.find(p => p.id === petId) : undefined) ||
        pets.find(p => sameText(p.name, petName) && sameText(p.ownerName, ownerName)) ||
        pets.find(p => sameText(p.name, petName));
      if (pet?.ownerEmail) return pet.ownerEmail;
      const owner = owners.find(o => sameText(o.name, ownerName));
      return owner?.email || '';
    };

    const items: ReminderItem[] = [];

    appointments
      .filter(a => ['Confirmed', 'Pending'].includes(a.status) && a.date >= today)
      .forEach(a => {
        items.push({
          key: `apt-${a.id}-${a.date}-${a.time}`,
          kind: a.rescheduledFrom ? 'rescheduled' : 'appointment',
          petName: a.petName,
          ownerName: a.ownerName,
          email: findEmail(a.petId, a.petName, a.ownerName),
          sortKey: `${a.date} ${a.time}`,
          status: a.status,
          vars: {
            owner_name: a.ownerName || 'Pet Owner',
            pet_name: a.petName,
            date: formatDate(a.date),
            time: formatTime(a.time),
            old_date: a.rescheduledFrom ? formatPrevious(a.rescheduledFrom) : ''
          }
        });
      });

    // Follow-up visits from saved treatments (next visit date). Skipped when the
    // pet already has an active appointment booked, or has been seen again
    // after that visit.
    const activeApts = appointments.filter(a => ['Confirmed', 'Pending', 'Arrived'].includes(a.status));
    medicalVisits.forEach(v => {
      const next = (v.nextVisit || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return;
      const samePet = (id: string | undefined, name: string) =>
        Boolean(id && v.petId && id === v.petId) || sameText(name, v.petName);
      if (activeApts.some(a => samePet(a.petId, a.petName) && a.date >= today && (next < today || a.date <= next))) return;
      if (next < today) {
        if (daysFromToday(next) < -30) return; // very old, no longer useful
        const seenAt = visitTime(v.date);
        if (medicalVisits.some(o => o.id !== v.id && samePet(o.petId, o.petName) && visitTime(o.date) > seenAt)) return;
      }
      items.push({
        key: `fu-${v.id}-${next}`,
        kind: 'followup',
        petName: v.petName,
        ownerName: v.ownerName,
        email: findEmail(v.petId, v.petName, v.ownerName),
        sortKey: next,
        vars: {
          owner_name: v.ownerName || 'Pet Owner',
          pet_name: v.petName,
          date: formatDate(next),
          last_visit: formatDate(v.date),
          diagnosis: v.disease ? ` for ${v.disease}` : ''
        }
      });
    });

    invoices
      .filter(i => i.status === 'Pending' || i.status === 'Overdue')
      .forEach(i => {
        items.push({
          key: `fee-${i.id}-${i.totalAmount}`,
          kind: 'fee',
          petName: i.petName,
          ownerName: i.ownerName,
          email: findEmail(undefined, i.petName, i.ownerName),
          sortKey: i.date || '',
          status: i.status,
          vars: {
            owner_name: i.ownerName || 'Pet Owner',
            pet_name: i.petName,
            amount: formatCurrency(i.totalAmount),
            invoice_no: i.invoiceNumber || i.id,
            invoice_date: formatDate(i.date)
          }
        });
      });

    const rank: Record<ReminderKind, number> = { followup: 0, rescheduled: 1, appointment: 2, fee: 3 };
    return items.sort((a, b) => {
      if (a.kind !== b.kind) return rank[a.kind] - rank[b.kind];
      if (a.kind === 'fee' && a.status !== b.status) return a.status === 'Overdue' ? -1 : 1;
      return a.sortKey.localeCompare(b.sortKey);
    });
  }, [appointments, invoices, medicalVisits, pets, owners, today]);

  return useMemo(() => {
    const urgent = reminders.filter(isUrgent);
    const count = (list: ReminderItem[], kind: ReminderKind) => list.filter(r => r.kind === kind).length;
    const pendingTotal = invoices
      .filter(i => i.status === 'Pending' || i.status === 'Overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    return {
      reminders,
      urgent,
      urgentCount: urgent.length,
      pendingTotal,
      counts: {
        followup: count(reminders, 'followup'),
        rescheduled: count(reminders, 'rescheduled'),
        appointment: count(reminders, 'appointment'),
        fee: count(reminders, 'fee')
      },
      urgentCounts: {
        followup: count(urgent, 'followup'),
        rescheduled: count(urgent, 'rescheduled'),
        appointment: count(urgent, 'appointment'),
        fee: count(urgent, 'fee')
      }
    };
  }, [reminders, invoices]);
};

// One-line summary used by the popup and browser notifications.
export const summarize = (
  c: { followup: number; rescheduled: number; appointment: number; fee: number },
  pendingTotal: number
): string[] => {
  const lines: string[] = [];
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  if (c.followup) lines.push(`${plural(c.followup, 'follow-up visit', 'follow-up visits')} due`);
  if (c.rescheduled) lines.push(`${plural(c.rescheduled, 'rescheduled appointment', 'rescheduled appointments')} coming up`);
  if (c.appointment) lines.push(`${plural(c.appointment, 'appointment', 'appointments')} today or tomorrow`);
  if (c.fee) lines.push(`${formatCurrency(pendingTotal)} pending across ${plural(c.fee, 'invoice', 'invoices')}`);
  return lines;
};
