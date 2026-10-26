import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Plus, Eye, Stethoscope, CalendarClock, AlertTriangle, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { InputField } from '../../components/Inputs/InputField';
import { PetPicker } from '../../components/PetPicker/PetPicker';
import { Table, Column } from '../../components/Tables/Table';
import { StatusBadge } from '../../components/Tables/StatusBadge';
import { Button } from '../../components/Buttons/Button';
import { Appointment, Pet } from '../../types';

type QueueFilter = 'today' | 'upcoming' | 'all';
type CompletedFilter = 'all' | 'Completed' | 'Cancelled';

const todayStr = () => new Date().toISOString().split('T')[0];

export const AppointmentManagement: React.FC = () => {
  const { appointments, addAppointment, updateAppointmentStatus, updateAppointment, pets, clinicSettings, showToast } =
    useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Booking form states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('09:30');

  // Modals
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Today / Upcoming / All -- a worklist by default, not a full archive.
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('today');

  // Completed section filters
  const [completedSearch, setCompletedSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>('all');

  // Arriving from a saved treatment's "Book Follow-up" carries the pet and the
  // chosen date straight into the booking form.
  useEffect(() => {
    const petIdParam = searchParams.get('petId');
    const dateParam = searchParams.get('date');
    if (petIdParam) {
      const foundPet = pets.find(p => p.id === petIdParam);
      if (foundPet) handlePetSelect(foundPet);
    }
    if (dateParam) setDate(dateParam);
    if (petIdParam || dateParam) {
      setSearchParams({}, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets.length]);

  // Selecting a pet (existing or quick-added) auto-fills the owner's contact details.
  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setOwnerName(pet.ownerName);
    setMobileNumber(pet.ownerPhone);
  };

  // There is only one doctor at this clinic, so any other active appointment
  // at the exact same date and time is a double-booking.
  const bookingConflict = useMemo(() => {
    if (!date || !time) return null;
    return (
      appointments.find(
        a => a.date === date && a.time === time && ['Confirmed', 'Pending', 'Arrived'].includes(a.status)
      ) || null
    );
  }, [appointments, date, time]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !ownerName || !date || !time) {
      showToast('Please select a pet, and fill in owner name, date and time.', 'warning');
      return;
    }

    if (bookingConflict) {
      const confirmed = window.confirm(
        `${bookingConflict.petName} (${bookingConflict.ownerName}) is already booked at ${time} on ${date}. Book this appointment for the same slot anyway?`
      );
      if (!confirmed) return;
    }

    addAppointment({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerName,
      mobileNumber,
      date,
      time,
      doctor: clinicSettings.doctorName || '',
      status: 'Confirmed'
    });

    // Reset form
    setSelectedPet(null);
    setOwnerName('');
    setMobileNumber('');
    setDate(todayStr());
  };

  // "Start Visit" marks the patient as Arrived and carries the pet and
  // appointment straight into the treatment form.
  const handleStartVisit = (apt: Appointment) => {
    if (apt.status === 'Confirmed' || apt.status === 'Pending') {
      updateAppointmentStatus(apt.id, 'Arrived');
    }
    navigate(`/treatments?petId=${apt.petId || ''}&appointmentId=${apt.id}`);
  };

  const openReschedule = (apt: Appointment) => {
    setReschedulingAppointment(apt);
    setRescheduleDate(apt.date >= todayStr() ? apt.date : todayStr());
    setRescheduleTime(apt.time);
  };

  const rescheduleConflict = useMemo(() => {
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleTime) return null;
    return (
      appointments.find(
        a =>
          a.id !== reschedulingAppointment.id &&
          a.date === rescheduleDate &&
          a.time === rescheduleTime &&
          ['Confirmed', 'Pending', 'Arrived'].includes(a.status)
      ) || null
    );
  }, [appointments, reschedulingAppointment, rescheduleDate, rescheduleTime]);

  // Moves a booked appointment to a new date/time while keeping its pet link.
  const handleConfirmReschedule = () => {
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleTime) return;

    if (rescheduleConflict) {
      const confirmed = window.confirm(
        `${rescheduleConflict.petName} (${rescheduleConflict.ownerName}) is already booked at ${rescheduleTime} on ${rescheduleDate}. Move this appointment into the same slot anyway?`
      );
      if (!confirmed) return;
    }

    updateAppointment(reschedulingAppointment.id, {
      date: rescheduleDate,
      time: rescheduleTime,
      status: 'Confirmed'
    });
    showToast(
      `Appointment for ${reschedulingAppointment.petName} rescheduled to ${rescheduleDate} at ${rescheduleTime}.`,
      'success'
    );
    setReschedulingAppointment(null);
  };

  const today = todayStr();

  // Main worklist: only appointments that are still ahead of (or on)
  // today and not yet resolved. Anything in the past that's still open
  // moves to "Uncompleted" below instead of cluttering this list, and
  // anything Completed/Cancelled moves to its own section.
  const activeAppointments = useMemo(
    () => appointments.filter(a => ['Confirmed', 'Pending', 'Arrived'].includes(a.status) && a.date >= today),
    [appointments, today]
  );

  const filteredAppointments = useMemo(() => {
    let list = activeAppointments;
    if (queueFilter === 'today') {
      list = activeAppointments.filter(a => a.date === today);
    } else if (queueFilter === 'upcoming') {
      list = activeAppointments.filter(a => a.date > today);
    }
    return [...list].sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  }, [activeAppointments, queueFilter, today]);

  // Appointments whose date has already passed but were never marked
  // Completed or Cancelled -- i.e. the patient never actually came in,
  // or the visit was never logged. These need a decision (reschedule or
  // cancel), so they get their own section instead of hiding among
  // future bookings.
  const uncompletedAppointments = useMemo(
    () =>
      appointments
        .filter(a => ['Confirmed', 'Pending', 'Arrived'].includes(a.status) && a.date < today)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [appointments, today]
  );

  const completedAppointments = useMemo(() => {
    let list = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
    if (completedFilter !== 'all') {
      list = list.filter(a => a.status === completedFilter);
    }
    const term = completedSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(a => a.petName.toLowerCase().includes(term) || a.ownerName.toLowerCase().includes(term));
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, completedFilter, completedSearch]);

  const columns: Column<Appointment>[] = [
    {
      header: 'Time',
      accessor: 'time',
      width: '110px',
      render: apt => (
        <div>
          <span className="font-mono font-bold text-slate-800">{apt.time}</span>
          {queueFilter !== 'today' && <p className="text-[10px] text-slate-400">{apt.date}</p>}
        </div>
      )
    },
    {
      header: 'Pet',
      accessor: 'petName',
      render: apt => <span className="font-semibold text-slate-800 capitalize">{apt.petName}</span>
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: apt => <span className="text-slate-600 capitalize">{apt.ownerName}</span>
    },
    {
      header: 'Doctor',
      accessor: 'doctor',
      render: apt => <span className="text-slate-700 font-medium">{apt.doctor}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: apt => <StatusBadge status={apt.status} />
    },
    {
      header: 'Action',
      align: 'center',
      width: '210px',
      render: apt => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStartVisit(apt)}
            title="Start recording this visit"
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0F6B63] hover:bg-[#0c5750] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3 h-3" />
            Start Visit
          </button>
          <button
            type="button"
            onClick={() => openReschedule(apt)}
            title="Reschedule"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
          >
            <CalendarClock className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewingAppointment(apt)}
            title="View details"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const uncompletedColumns: Column<Appointment>[] = [
    {
      header: 'Date',
      accessor: 'date',
      width: '110px',
      render: apt => (
        <div>
          <span className="font-semibold text-slate-700">{apt.date}</span>
          <p className="text-[10px] text-slate-400 font-mono">{apt.time}</p>
        </div>
      )
    },
    {
      header: 'Pet',
      accessor: 'petName',
      render: apt => <span className="font-semibold text-slate-800 capitalize">{apt.petName}</span>
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: apt => <span className="text-slate-600 capitalize">{apt.ownerName}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: apt => <StatusBadge status={apt.status} />
    },
    {
      header: 'Action',
      align: 'center',
      width: '190px',
      render: apt => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => openReschedule(apt)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0F6B63] hover:bg-[#0c5750] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <CalendarClock className="w-3 h-3" />
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
            className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )
    }
  ];

  const completedColumns: Column<Appointment>[] = [
    {
      header: 'Date',
      accessor: 'date',
      width: '160px',
      render: apt => (
        <div>
          <span className="font-semibold text-slate-700">{apt.date}</span>
          <p className="text-[10px] text-slate-400 font-mono">{apt.time}</p>
        </div>
      )
    },
    {
      header: 'Pet',
      accessor: 'petName',
      render: apt => <span className="font-semibold text-slate-800 capitalize">{apt.petName}</span>
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: apt => <span className="text-slate-600 capitalize">{apt.ownerName}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: apt => <StatusBadge status={apt.status} />
    },
    {
      header: 'Action',
      align: 'center',
      width: '90px',
      render: apt => (
        <button
          type="button"
          onClick={() => setViewingAppointment(apt)}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  const queueTitle =
    queueFilter === 'today'
      ? "Today's Appointments"
      : queueFilter === 'upcoming'
      ? 'Upcoming Appointments'
      : 'All Upcoming Appointments';

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Appointment Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Schedule visits, consultations, routine checkups, and vaccinations
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-xs md:text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Appointment Booking Form Card */}
      <form onSubmit={handleBookAppointment}>
        <SectionCard bodyClassName="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <PetPicker selectedPet={selectedPet} onSelect={handlePetSelect} />
            </div>

            <InputField
              label="Owner Name"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="Auto-filled from selected pet"
              required
            />

            <InputField
              label="Mobile Number"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              placeholder="Auto-filled from selected pet"
            />

            <InputField
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />

            <InputField
              label="Time"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />

            <InputField
              label="Doctor"
              value={clinicSettings.doctorName || 'Dr. Dipak Shivadas Kadam'}
              onChange={() => {}}
              disabled
            />
          </div>

          {bookingConflict && (
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">
                <strong className="capitalize">{bookingConflict.petName}</strong> ({bookingConflict.ownerName}) is
                already booked at <strong>{time}</strong> on <strong>{date}</strong>. You can still book this
                appointment, but you'll be asked to confirm the double-booking.
              </p>
            </div>
          )}

          <div className="pt-6">
            <Button type="submit" variant="primary">
              Book Appointment
            </Button>
          </div>
        </SectionCard>
      </form>

      {/* Appointments Queue -- Today by default, so it's a worklist, not an archive */}
      <SectionCard
        title={queueTitle}
        icon={<Calendar className="w-5 h-5 text-[#0F6B63]" />}
        headerAction={
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['today', 'upcoming', 'all'] as QueueFilter[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setQueueFilter(f)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer capitalize ${
                  queueFilter === f ? 'bg-white text-[#0F6B63] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
        bodyClassName="p-0"
      >
        <Table<Appointment>
          columns={columns}
          data={filteredAppointments}
          emptyMessage={
            queueFilter === 'today'
              ? 'No appointments scheduled for today.'
              : queueFilter === 'upcoming'
              ? 'No upcoming appointments booked.'
              : 'No appointments booked yet.'
          }
        />
      </SectionCard>

      {/* Uncompleted Appointments -- past date, never marked done, so the
          patient may not have shown up or the visit was never logged. */}
      <SectionCard
        title="Uncompleted Appointments"
        icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        bodyClassName="p-0"
      >
        <Table<Appointment>
          columns={uncompletedColumns}
          data={uncompletedAppointments}
          emptyMessage="Nothing here — every past appointment has been completed or cancelled."
        />
      </SectionCard>

      {/* Completed Appointments -- with search + status filter */}
      <SectionCard
        title="Completed Appointments"
        icon={<CheckCircle2 className="w-5 h-5 text-sky-600" />}
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={completedSearch}
              onChange={e => setCompletedSearch(e.target.value)}
              placeholder="Search by pet or owner…"
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'Completed', 'Cancelled'] as CompletedFilter[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setCompletedFilter(f)}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors cursor-pointer ${
                  completedFilter === f
                    ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F6B63]'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
        <Table<Appointment>
          columns={completedColumns}
          data={completedAppointments}
          emptyMessage="No completed or cancelled appointments match your filters."
        />
      </SectionCard>

      {/* View Appointment Details Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Appointment Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                <div>
                  <span className="text-slate-400 font-semibold block">Pet Name</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">
                    {viewingAppointment.petName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Owner Name</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">
                    {viewingAppointment.ownerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Time & Date</span>
                  <span className="text-slate-800 font-bold">
                    {viewingAppointment.time}, {viewingAppointment.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Doctor In Charge</span>
                  <span className="text-slate-800 font-bold">{viewingAppointment.doctor}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={viewingAppointment.status} />
                  </div>
                </div>
              </div>

              {/* Status change actions */}
              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-2">Update Status:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(viewingAppointment.id, 'Confirmed');
                      setViewingAppointment(prev => (prev ? { ...prev, status: 'Confirmed' } : null));
                    }}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs hover:bg-emerald-200 cursor-pointer"
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(viewingAppointment.id, 'Completed');
                      setViewingAppointment(prev => (prev ? { ...prev, status: 'Completed' } : null));
                    }}
                    className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs hover:bg-blue-200 cursor-pointer"
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(viewingAppointment.id, 'Pending');
                      setViewingAppointment(prev => (prev ? { ...prev, status: 'Pending' } : null));
                    }}
                    className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-xs hover:bg-amber-200 cursor-pointer"
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(viewingAppointment.id, 'Arrived');
                      setViewingAppointment(prev => (prev ? { ...prev, status: 'Arrived' } : null));
                    }}
                    className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-semibold text-xs hover:bg-purple-200 cursor-pointer"
                  >
                    Arrived
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(viewingAppointment.id, 'Cancelled');
                      setViewingAppointment(prev => (prev ? { ...prev, status: 'Cancelled' } : null));
                    }}
                    className="px-2.5 py-1 bg-red-100 text-red-800 rounded font-semibold text-xs hover:bg-red-200 cursor-pointer"
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button size="sm" variant="secondary" onClick={() => setViewingAppointment(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<CalendarClock className="w-3.5 h-3.5" />}
                onClick={() => {
                  const apt = viewingAppointment;
                  setViewingAppointment(null);
                  openReschedule(apt);
                }}
              >
                Reschedule
              </Button>
              {viewingAppointment.status !== 'Completed' && viewingAppointment.status !== 'Cancelled' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Stethoscope className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const apt = viewingAppointment;
                    setViewingAppointment(null);
                    handleStartVisit(apt);
                  }}
                >
                  Start Visit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-sm w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Reschedule Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Moving <strong className="text-slate-700 capitalize">{reschedulingAppointment.petName}</strong>'s
              appointment (currently {reschedulingAppointment.date} at {reschedulingAppointment.time}).
            </p>

            <div className="space-y-4">
              <InputField
                label="New Date"
                type="date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                required
              />
              <InputField
                label="New Time"
                type="time"
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                required
              />
            </div>

            {rescheduleConflict && (
              <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  <strong className="capitalize">{rescheduleConflict.petName}</strong> ({rescheduleConflict.ownerName}
                  ) is already booked at <strong>{rescheduleTime}</strong> on <strong>{rescheduleDate}</strong>.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button size="sm" variant="secondary" onClick={() => setReschedulingAppointment(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmReschedule}>
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};