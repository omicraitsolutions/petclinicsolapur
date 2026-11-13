import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, X } from 'lucide-react';
import { useReminders, summarize, localDateStr } from '../../hooks/useReminders';
import { Button } from '../Buttons/Button';

const POPUP_SEEN_KEY = 'reminder_popup_seen';
const NOTIFIED_KEY = 'reminder_notified_v1';

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!notificationsSupported()) return 'denied';
  return Notification.requestPermission();
};

// Mounted once in the main layout. On login it shows a summary popup of what is
// due; if the doctor has allowed browser notifications it also raises one when
// the app is open and the urgent count rises during the day.
export const ReminderAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { urgentCount, urgentCounts, pendingTotal } = useReminders();
  const [open, setOpen] = useState(false);

  const lines = summarize(urgentCounts, pendingTotal);

  // Popup: once per browser session.
  useEffect(() => {
    if (urgentCount === 0) return;
    try {
      if (sessionStorage.getItem(POPUP_SEEN_KEY)) return;
      sessionStorage.setItem(POPUP_SEEN_KEY, '1');
    } catch {
      /* storage unavailable: just show it */
    }
    setOpen(true);
  }, [urgentCount]);

  // Browser notification: at most once per rise in today's count.
  useEffect(() => {
    if (urgentCount === 0 || !notificationsSupported() || Notification.permission !== 'granted') return;
    const today = localDateStr();
    let last = 0;
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
      if (saved.date === today) last = Number(saved.count) || 0;
    } catch {
      /* ignore */
    }
    if (urgentCount <= last) return;
    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify({ date: today, count: urgentCount }));
    } catch {
      /* ignore */
    }
    const n = new Notification(`${urgentCount} reminder${urgentCount === 1 ? '' : 's'} need attention`, {
      body: lines.join('\n'),
      icon: '/icon-192.png',
      tag: 'clinic-reminders'
    });
    n.onclick = () => {
      window.focus();
      navigate('/reminders');
      n.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urgentCount]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full p-6 font-['Poppins']">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FEF6E6] text-[#D97706] flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Today's reminders</h3>
              <p className="text-xs text-slate-500">
                {urgentCount} {urgentCount === 1 ? 'item needs' : 'items need'} your attention
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2 mb-5">
          {lines.map(line => (
            <li key={line} className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              {line}
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-3">
          <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
            Later
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setOpen(false);
              navigate('/reminders');
            }}
          >
            View Reminders
          </Button>
        </div>
      </div>
    </div>
  );
};
