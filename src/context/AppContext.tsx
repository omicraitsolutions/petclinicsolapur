import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Pet,
  Owner,
  MedicalVisit,
  Appointment,
  MonthlyReportItem,
  CommonDiseaseItem,
  InvoiceItem,
  ClinicSettings,
  LabReport,
  LabReportType,
  PetForm
} from '../types';
import { initialClinicSettings } from '../data/clinicDefaults';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { db } from '../lib/database';
import { sendEmailViaEmailJs } from '../lib/emailClient';
import { uploadLabReportFile, deleteLabReportFile } from '../lib/storage';
import { Loader } from '../components/Loader/Loader';
import { friendlyError, friendlyAuthError } from '../utils/errors';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  userEmail: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  passwordRecovery: boolean;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Pets
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id' | 'registrationDate'>) => Pet;
  updatePet: (id: string, updated: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getPetById: (id: string) => Pet | undefined;

  // Owners
  owners: Owner[];
  addOwner: (owner: Omit<Owner, 'id'>) => Owner;
  updateOwner: (id: string, updated: Partial<Owner>, silent?: boolean) => void;
  deleteOwner: (id: string) => void;

  // Visits / Treatments
  medicalVisits: MedicalVisit[];
  addMedicalVisit: (visit: Omit<MedicalVisit, 'id'>) => MedicalVisit;
  updateMedicalVisit: (id: string, updated: Partial<MedicalVisit>) => void;
  getVisitsByPetId: (petId: string) => MedicalVisit[];

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Invoices
  invoices: InvoiceItem[];
  addInvoice: (invoice: Omit<InvoiceItem, 'id' | 'invoiceNumber'>) => InvoiceItem;
  updateInvoiceStatus: (id: string, status: InvoiceItem['status']) => void;

  // Reports
  monthlyReportData: MonthlyReportItem[];
  commonDiseaseData: CommonDiseaseItem[];

  // Settings
  clinicSettings: ClinicSettings;
  updateClinicSettings: (settings: Partial<ClinicSettings>) => void;

  // Email
  emailsSentCount: number;
  sendEmail: (params: { to: string; subject: string; text: string; html?: string }) => Promise<{ success: boolean; error?: string }>;

  // Saved medical forms
  savePetForm: (params: {
    petId: string;
    petName: string;
    ownerName: string;
    formType: string;
    formTitle: string;
    data: Record<string, string>;
  }) => Promise<{ success: boolean; error?: string }>;
  petForms: PetForm[];
  getFormsByPetId: (petId: string) => PetForm[];

  // Lab reports (blood test / X-ray / ultrasound files)
  labReports: LabReport[];
  addLabReport: (params: {
    petId: string;
    petName: string;
    ownerName: string;
    reportType: LabReportType;
    reportDate: string;
    notes: string;
    file: File;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteLabReport: (id: string) => Promise<{ success: boolean; error?: string }>;
  getLabReportsByPetId: (petId: string) => LabReport[];

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Next free sequential id such as P007 / OWN012. Based on the highest existing
// number, not the list length, so ids never collide after records are deleted.
function nextNumber(prefix: string, ids: string[]): number {
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  const highest = ids.reduce((max, id) => {
    const match = pattern.exec(id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return highest + 1;
}

const formatId = (prefix: string, n: number) => `${prefix}${String(n).padStart(3, '0')}`;

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Best-effort month name from the many free-text date formats used across
// the app ("2026-08-07", "10 July 2026", "12 Jul 2026", ...).
function monthNameFromDateString(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return MONTH_ORDER[parsed.getMonth()];
  }
  const match = MONTH_ORDER.find(m => value.toLowerCase().includes(m.slice(0, 3).toLowerCase()));
  return match || null;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(initialClinicSettings);
  const [emailsSentCount, setEmailsSentCount] = useState(0);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [petForms, setPetForms] = useState<PetForm[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keep latest state in refs so callbacks used for optimistic updates /
  // rollbacks always see fresh data without re-subscribing on every change.
  const petsRef = useRef(pets);
  petsRef.current = pets;
  const ownersRef = useRef(owners);
  ownersRef.current = owners;
  const appointmentsRef = useRef(appointments);
  appointmentsRef.current = appointments;
  const invoicesRef = useRef(invoices);
  invoicesRef.current = invoices;
  const visitsRef = useRef(medicalVisits);
  visitsRef.current = medicalVisits;
  const labReportsRef = useRef(labReports);
  labReportsRef.current = labReports;
  const petFormsRef = useRef(petForms);
  petFormsRef.current = petForms;

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ---------------------------------------------------------------
  // Auth bootstrap: restore session, listen for sign in/out changes
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------------
  // Load all clinic data once we know who is logged in
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!session?.user) {
      setDataLoaded(false);
      setPets([]);
      setOwners([]);
      setMedicalVisits([]);
      setAppointments([]);
      setInvoices([]);
      setClinicSettings(initialClinicSettings);
      setLabReports([]);
      setPetForms([]);
      return;
    }

    let cancelled = false;
    const userId = session.user.id;

    (async () => {
      try {
        const data = await db.fetchAll(userId);
        if (cancelled) return;

        setPets(data.pets);
        setOwners(data.owners);
        setMedicalVisits(data.medicalVisits);
        setAppointments(data.appointments);
        setInvoices(data.invoices);
        setLabReports(data.labReports);
        setPetForms(data.petForms);

        if (data.clinicSettings) {
          setClinicSettings(data.clinicSettings);
        } else {
          // First login for this account: seed a default settings row.
          await db.upsertClinicSettings(initialClinicSettings, userId);
          setClinicSettings(initialClinicSettings);
        }

        const emailCount = await db.fetchEmailLogsCount(userId).catch(() => 0);
        if (!cancelled) setEmailsSentCount(emailCount);
      } catch (err: any) {
        showToast(friendlyError(err, 'Could not load your clinic data. Please refresh the page.'), 'error');
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ---------------------------------------------------------------
  // Realtime sync: reflect changes made from other devices/tabs
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!session?.user || !isSupabaseConfigured) return;
    const userId = session.user.id;

    const channel = supabase
      .channel(`petcare-sync-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter: `user_id=eq.${userId}` }, () => {
        db.fetchAll(userId).then(d => setPets(d.pets)).catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owners', filter: `user_id=eq.${userId}` }, () => {
        db.fetchAll(userId).then(d => setOwners(d.owners)).catch(() => {});
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${userId}` },
        () => {
          db.fetchAll(userId).then(d => setAppointments(d.appointments)).catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${userId}` },
        () => {
          db.fetchAll(userId).then(d => setInvoices(d.invoices)).catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medical_visits', filter: `user_id=eq.${userId}` },
        () => {
          db.fetchAll(userId).then(d => setMedicalVisits(d.medicalVisits)).catch(() => {});
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pet_forms', filter: `user_id=eq.${userId}` },
        () => {
          db.fetchAll(userId).then(d => setPetForms(d.petForms)).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const requireUserId = (): string | null => {
    if (!session?.user) {
      showToast('Your session expired. Please log in again.', 'error');
      return null;
    }
    return session.user.id;
  };

  // ---------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'The app is not set up correctly. Please contact support.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { success: false, error: friendlyAuthError(error) };
    }
    setSession(data.session);
    showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: friendlyError(error, 'Could not update the password. Please try again.') };
    }
    setPasswordRecovery(false);
    showToast('Password updated successfully.', 'success');
    return { success: true };
  };

  const logout = () => {
    supabase.auth.signOut();
    setSession(null);
    showToast('Logged out successfully', 'info');
  };

  // ---------------------------------------------------------------
  // Pet actions (optimistic local update + background persistence)
  // ---------------------------------------------------------------
  const addPet = (newPetData: Omit<Pet, 'id' | 'registrationDate'>): Pet => {
    const userId = requireUserId();
    const newId = formatId('P', nextNumber('P', petsRef.current.map(p => p.id)));
    const newPet: Pet = {
      ...newPetData,
      id: newId,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setPets(prev => [newPet, ...prev]);

    if (userId) {
      db.insertPet(newPet, userId).catch(err => {
        setPets(prev => prev.filter(p => p.id !== newPet.id));
        showToast(friendlyError(err, 'Could not save pet. Please try again.'), 'error');
      });
    }

    // Also auto register or update owner
    const existingOwner = ownersRef.current.find(
      o => o.name.toLowerCase() === newPet.ownerName.toLowerCase() || o.mobile === newPet.ownerPhone
    );
    if (existingOwner) {
      updateOwner(existingOwner.id, {
        totalPets: existingOwner.totalPets + 1,
        petsList: [...(existingOwner.petsList || []), `${newPet.name} (${newPet.breed})`]
      });
    } else if (newPet.ownerName) {
      addOwner({
        name: newPet.ownerName,
        mobile: newPet.ownerPhone || '',
        email: newPet.ownerEmail || '',
        totalPets: 1,
        address: newPet.ownerAddress || '',
        petsList: [`${newPet.name} (${newPet.breed})`]
      });
    }

    // Add initial visit if symptoms / disease present
    if (newPet.disease || newPet.symptoms) {
      addMedicalVisit({
        petId: newPet.id,
        petName: newPet.name,
        ownerName: newPet.ownerName,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        disease: newPet.disease || 'Initial Checkup',
        symptoms: newPet.symptoms || '',
        treatment: 'Initial diagnosis noted, treatment plan pending',
        medicines: 'Standard care prescription',
        doctor: clinicSettings.doctorName || '',
        doctorNotes: newPet.notes || 'Registered and initial consultation noted.'
      });
    }

    showToast(`Pet "${newPet.name}" registered successfully!`, 'success');
    return newPet;
  };

  const updatePet = (id: string, updated: Partial<Pet>) => {
    const userId = requireUserId();
    const previous = petsRef.current.find(p => p.id === id);
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));

    if (userId) {
      db.updatePet(id, updated, userId).catch(err => {
        if (previous) setPets(prev => prev.map(p => (p.id === id ? previous : p)));
        showToast(friendlyError(err, 'Could not update pet. Please try again.'), 'error');
      });
    }

    // Keep the matching Owner record in sync with edits made to the pet. The
    // owner is found the same way addPet does (by name/phone), since
    // pet.ownerId is not a reliable foreign key here.
    if (previous) {
      const merged: Pet = { ...previous, ...updated };
      const ownerFieldsChanged = (['ownerName', 'ownerPhone', 'ownerEmail', 'ownerAddress'] as const).some(
        key => updated[key] !== undefined && updated[key] !== previous[key]
      );
      const petLabelChanged =
        (updated.name !== undefined && updated.name !== previous.name) ||
        (updated.breed !== undefined && updated.breed !== previous.breed);

      if (ownerFieldsChanged || petLabelChanged) {
        const oldOwnerMatch = ownersRef.current.find(
          o => o.name.toLowerCase() === previous.ownerName.toLowerCase() || o.mobile === previous.ownerPhone
        );
        const newOwnerMatch = ownersRef.current.find(
          o => o.name.toLowerCase() === merged.ownerName.toLowerCase() || o.mobile === merged.ownerPhone
        );
        const oldLabel = `${previous.name} (${previous.breed})`;
        const newLabel = `${merged.name} (${merged.breed})`;

        if (oldOwnerMatch && newOwnerMatch && oldOwnerMatch.id === newOwnerMatch.id) {
          // Same owner -- just refresh their contact details and the
          // pet's label inside petsList.
          updateOwner(
            oldOwnerMatch.id,
            {
              name: merged.ownerName,
              mobile: merged.ownerPhone,
              email: merged.ownerEmail,
              address: merged.ownerAddress,
              petsList: (oldOwnerMatch.petsList || []).map(entry => (entry === oldLabel ? newLabel : entry))
            },
            true
          );
        } else {
          // The owner identity itself changed (this pet was reassigned
          // to a different person) -- detach from the old owner and
          // attach to the new one, creating them if they don't exist yet.
          if (oldOwnerMatch) {
            updateOwner(
              oldOwnerMatch.id,
              {
                totalPets: Math.max(0, oldOwnerMatch.totalPets - 1),
                petsList: (oldOwnerMatch.petsList || []).filter(entry => entry !== oldLabel)
              },
              true
            );
          }
          if (newOwnerMatch) {
            updateOwner(
              newOwnerMatch.id,
              {
                totalPets: newOwnerMatch.totalPets + 1,
                petsList: [...(newOwnerMatch.petsList || []), newLabel]
              },
              true
            );
          } else if (merged.ownerName) {
            addOwner({
              name: merged.ownerName,
              mobile: merged.ownerPhone || '',
              email: merged.ownerEmail || '',
              totalPets: 1,
              address: merged.ownerAddress || '',
              petsList: [newLabel]
            });
          }
        }
      }
    }

    showToast('Pet profile updated successfully!', 'success');
  };

  const deletePet = (id: string) => {
    const userId = requireUserId();
    const petToDelete = petsRef.current.find(p => p.id === id);
    setPets(prev => prev.filter(p => p.id !== id));

    if (userId) {
      db.deletePet(id, userId).catch(err => {
        if (petToDelete) setPets(prev => [petToDelete, ...prev]);
        showToast(friendlyError(err, 'Could not delete pet. Please try again.'), 'error');
      });
    }

    // Keep the owner's pet count and list accurate after a pet is deleted.
    if (petToDelete) {
      const ownerMatch = ownersRef.current.find(
        o => o.name.toLowerCase() === petToDelete.ownerName.toLowerCase() || o.mobile === petToDelete.ownerPhone
      );
      if (ownerMatch) {
        const label = `${petToDelete.name} (${petToDelete.breed})`;
        updateOwner(
          ownerMatch.id,
          {
            totalPets: Math.max(0, ownerMatch.totalPets - 1),
            petsList: (ownerMatch.petsList || []).filter(entry => entry !== label)
          },
          true
        );
      }
    }

    showToast(`Pet ${petToDelete ? `"${petToDelete.name}"` : ''} deleted.`, 'info');
  };

  const getPetById = (id: string) => {
    return petsRef.current.find(
      p => p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase() === id.toLowerCase()
    );
  };

  // ---------------------------------------------------------------
  // Owner actions
  // ---------------------------------------------------------------
  const addOwner = (ownerData: Omit<Owner, 'id'>): Owner => {
    const userId = requireUserId();
    const newId = formatId('OWN', nextNumber('OWN', ownersRef.current.map(o => o.id)));
    const newOwner: Owner = { ...ownerData, id: newId };
    setOwners(prev => [newOwner, ...prev]);

    if (userId) {
      db.insertOwner(newOwner, userId).catch(err => {
        setOwners(prev => prev.filter(o => o.id !== newOwner.id));
        showToast(friendlyError(err, 'Could not save owner. Please try again.'), 'error');
      });
    }
    showToast(`Owner "${newOwner.name}" added successfully!`, 'success');
    return newOwner;
  };

  const updateOwner = (id: string, updated: Partial<Owner>, silent = false) => {
    const userId = requireUserId();
    const previous = ownersRef.current.find(o => o.id === id);
    setOwners(prev => prev.map(o => (o.id === id ? { ...o, ...updated } : o)));

    if (userId) {
      db.updateOwner(id, updated, userId).catch(err => {
        if (previous) setOwners(prev => prev.map(o => (o.id === id ? previous : o)));
        showToast(friendlyError(err, 'Could not update owner. Please try again.'), 'error');
      });
    }
    if (!silent) showToast('Owner details updated!', 'success');
  };

  const deleteOwner = (id: string) => {
    const userId = requireUserId();
    const previous = ownersRef.current.find(o => o.id === id);
    setOwners(prev => prev.filter(o => o.id !== id));

    if (userId) {
      db.deleteOwner(id, userId).catch(err => {
        if (previous) setOwners(prev => [previous, ...prev]);
        showToast(friendlyError(err, 'Could not delete owner. Please try again.'), 'error');
      });
    }
    showToast('Owner deleted from records.', 'info');
  };

  // ---------------------------------------------------------------
  // Medical visits
  // ---------------------------------------------------------------
  const addMedicalVisit = (visitData: Omit<MedicalVisit, 'id'>): MedicalVisit => {
    const userId = requireUserId();
    const newId = formatId('VIS', nextNumber('VIS', visitsRef.current.map(v => v.id)));
    const newVisit: MedicalVisit = { ...visitData, id: newId };
    setMedicalVisits(prev => [newVisit, ...prev]);

    if (userId) {
      db.insertVisit(newVisit, userId).catch(err => {
        setMedicalVisits(prev => prev.filter(v => v.id !== newVisit.id));
        showToast(friendlyError(err, 'Could not save treatment record. Please try again.'), 'error');
      });
    }
    showToast('Medical record / treatment saved!', 'success');
    return newVisit;
  };

  const getVisitsByPetId = (petIdOrName: string) => {
    return visitsRef.current.filter(
      v => v.petId.toLowerCase() === petIdOrName.toLowerCase() || v.petName.toLowerCase() === petIdOrName.toLowerCase()
    );
  };

  const updateMedicalVisit = (id: string, updated: Partial<MedicalVisit>) => {
    const userId = requireUserId();
    const previous = visitsRef.current.find(v => v.id === id);
    setMedicalVisits(prev => prev.map(v => (v.id === id ? { ...v, ...updated } : v)));

    if (userId) {
      db.updateVisit(id, updated, userId).catch(err => {
        if (previous) setMedicalVisits(prev => prev.map(v => (v.id === id ? previous : v)));
        showToast(friendlyError(err, 'Could not update visit. Please try again.'), 'error');
      });
    }
  };

  // ---------------------------------------------------------------
  // Appointments
  // ---------------------------------------------------------------
  const addAppointment = (aptData: Omit<Appointment, 'id'>): Appointment => {
    const userId = requireUserId();
    const newId = formatId('APT', nextNumber('APT', appointmentsRef.current.map(a => a.id)));
    const newApt: Appointment = { ...aptData, id: newId };
    setAppointments(prev => [newApt, ...prev]);

    if (userId) {
      db.insertAppointment(newApt, userId).catch(err => {
        setAppointments(prev => prev.filter(a => a.id !== newApt.id));
        showToast(friendlyError(err, 'Could not save appointment. Please try again.'), 'error');
      });
    }
    showToast(`Appointment booked for ${newApt.petName}!`, 'success');
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const userId = requireUserId();
    const previous = appointmentsRef.current.find(a => a.id === id);
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));

    if (userId) {
      db.updateAppointment(id, { status }, userId).catch(err => {
        if (previous) setAppointments(prev => prev.map(a => (a.id === id ? previous : a)));
        showToast(friendlyError(err, 'Could not update appointment. Please try again.'), 'error');
      });
    }
    showToast(`Appointment status updated to ${status}`, 'info');
  };

  // Generic update used by Reschedule (date/time changes) and anything
  // else that isn't just a status flip.
  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const userId = requireUserId();
    const previous = appointmentsRef.current.find(a => a.id === id);
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));

    if (userId) {
      db.updateAppointment(id, updates, userId).catch(err => {
        if (previous) setAppointments(prev => prev.map(a => (a.id === id ? previous : a)));
        showToast(friendlyError(err, 'Could not update appointment. Please try again.'), 'error');
      });
    }
  };

  const deleteAppointment = (id: string) => {
    const userId = requireUserId();
    const previous = appointmentsRef.current.find(a => a.id === id);
    setAppointments(prev => prev.filter(a => a.id !== id));

    if (userId) {
      db.deleteAppointment(id, userId).catch(err => {
        if (previous) setAppointments(prev => [previous, ...prev]);
        showToast(friendlyError(err, 'Could not delete appointment. Please try again.'), 'error');
      });
    }
    showToast('Appointment removed.', 'info');
  };

  // ---------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------
  const addInvoice = (invData: Omit<InvoiceItem, 'id' | 'invoiceNumber'>): InvoiceItem => {
    const userId = requireUserId();
    const nextNum = nextNumber('INV', invoicesRef.current.map(i => i.id));
    const newId = formatId('INV', nextNum);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newInv: InvoiceItem = { ...invData, id: newId, invoiceNumber };
    setInvoices(prev => [newInv, ...prev]);

    if (userId) {
      db.insertInvoice(newInv, userId).catch(err => {
        setInvoices(prev => prev.filter(i => i.id !== newInv.id));
        showToast(friendlyError(err, 'Could not save invoice. Please try again.'), 'error');
      });
    }
    showToast(`Invoice ${invoiceNumber} created!`, 'success');
    return newInv;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceItem['status']) => {
    const userId = requireUserId();
    const previous = invoicesRef.current.find(i => i.id === id);
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, status } : inv)));

    if (userId) {
      db.updateInvoice(id, { status }, userId).catch(err => {
        if (previous) setInvoices(prev => prev.map(inv => (inv.id === id ? previous : inv)));
        showToast(friendlyError(err, 'Could not update invoice. Please try again.'), 'error');
      });
    }
    showToast(`Invoice status updated to ${status}`, 'success');
  };

  // ---------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------
  const updateClinicSettings = (settings: Partial<ClinicSettings>) => {
    const userId = requireUserId();
    const merged = { ...clinicSettings, ...settings };
    setClinicSettings(merged);

    if (userId) {
      db.upsertClinicSettings(merged, userId).catch(err =>
        showToast(friendlyError(err, 'Could not save clinic settings. Please try again.'), 'error')
      );
    }
    showToast('Clinic settings saved successfully!', 'success');
  };

  // ---------------------------------------------------------------
  // Email (sent directly from the browser via EmailJS + your own
  // connected Gmail account -- no backend/edge function involved)
  // ---------------------------------------------------------------
  const sendEmail = async (params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const userId = requireUserId();
    if (!userId) return { success: false, error: 'Not authenticated.' };

    try {
      await sendEmailViaEmailJs(params, clinicSettings);

      setEmailsSentCount(prev => prev + 1);
      db.logEmail({ toEmail: params.to, subject: params.subject, status: 'sent' }, userId).catch(() => {});
      showToast(`Treatment summary successfully emailed to ${params.to}!`, 'success');
      return { success: true };
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : friendlyError(err, 'Could not send the email. Please check the email settings and try again.');
      db.logEmail({ toEmail: params.to, subject: params.subject, status: 'failed', error: message }, userId).catch(
        () => {}
      );
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  // ---------------------------------------------------------------
  // Saved medical forms (Consent / Admission / Certificate / Vaccination)
  // ---------------------------------------------------------------
  const savePetForm = async (params: {
    petId: string;
    petName: string;
    ownerName: string;
    formType: string;
    formTitle: string;
    data: Record<string, string>;
  }): Promise<{ success: boolean; error?: string }> => {
    const userId = requireUserId();
    if (!userId) return { success: false, error: 'Not authenticated.' };

    try {
      const saved = await db.insertPetForm(params, userId);
      setPetForms(prev => [saved, ...prev]);
      showToast(`${params.formTitle} saved to ${params.petName}'s record.`, 'success');
      return { success: true };
    } catch (err: any) {
      const message = friendlyError(err, 'Could not save the form. Please try again.');
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const getFormsByPetId = (petId: string) => {
    return petFormsRef.current.filter(f => f.petId === petId);
  };

  // ---------------------------------------------------------------
  // Lab reports (blood test / X-ray / ultrasound files)
  // ---------------------------------------------------------------
  const addLabReport = async (params: {
    petId: string;
    petName: string;
    ownerName: string;
    reportType: LabReportType;
    reportDate: string;
    notes: string;
    file: File;
  }): Promise<{ success: boolean; error?: string }> => {
    const userId = requireUserId();
    if (!userId) return { success: false, error: 'Not authenticated.' };

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (params.file.size > MAX_SIZE) {
      const message = 'File is too large. Please upload a file under 15MB.';
      showToast(message, 'error');
      return { success: false, error: message };
    }

    let uploadedPath: string | null = null;
    try {
      uploadedPath = await uploadLabReportFile(params.file, userId, params.petId);

      const saved = await db.insertLabReport(
        {
          petId: params.petId,
          petName: params.petName,
          ownerName: params.ownerName,
          reportType: params.reportType,
          reportDate: params.reportDate,
          notes: params.notes,
          filePath: uploadedPath,
          fileName: params.file.name,
          fileType: params.file.type
        },
        userId
      );

      setLabReports(prev => [saved, ...prev]);
      showToast(`${params.reportType} uploaded for ${params.petName}.`, 'success');
      return { success: true };
    } catch (err: any) {
      // Roll back the uploaded file if the database insert failed after
      // the upload succeeded, so we don't leave an orphaned file behind.
      if (uploadedPath) {
        deleteLabReportFile(uploadedPath).catch(() => {});
      }
      const message = friendlyError(err, 'Could not upload the report. Please try again.');
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const deleteLabReport = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const userId = requireUserId();
    if (!userId) return { success: false, error: 'Not authenticated.' };

    const report = labReportsRef.current.find(r => r.id === id);
    setLabReports(prev => prev.filter(r => r.id !== id));

    try {
      await db.deleteLabReport(id, userId);
      if (report) deleteLabReportFile(report.filePath).catch(() => {});
      showToast('Report deleted.', 'info');
      return { success: true };
    } catch (err: any) {
      if (report) setLabReports(prev => [report, ...prev]);
      const message = friendlyError(err, 'Could not delete the report. Please try again.');
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const getLabReportsByPetId = (petId: string) => {
    return labReportsRef.current.filter(r => r.petId === petId);
  };

  // ---------------------------------------------------------------
  // Reports — derived live from saved visits and invoices
  // ---------------------------------------------------------------
  const monthlyReportData: MonthlyReportItem[] = MONTH_ORDER.map(month => {
    const treatments = medicalVisits.filter(v => monthNameFromDateString(v.date) === month).length;
    const patientSet = new Set(
      medicalVisits.filter(v => monthNameFromDateString(v.date) === month).map(v => v.petId)
    );
    const revenue = invoices
      .filter(inv => monthNameFromDateString(inv.date) === month)
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    return { month, patients: patientSet.size, treatments, revenue };
  }).filter(m => m.patients > 0 || m.treatments > 0 || m.revenue > 0);

  const diseaseCounts: Record<string, number> = medicalVisits.reduce((acc: Record<string, number>, v) => {
    const disease = (v.disease || '').trim();
    if (!disease) return acc;
    acc[disease] = (acc[disease] || 0) + 1;
    return acc;
  }, {});

  const commonDiseaseData: CommonDiseaseItem[] = Object.keys(diseaseCounts)
    .map((disease): CommonDiseaseItem => ({ disease, totalCases: diseaseCounts[disease] }))
    .sort((a, b) => b.totalCases - a.totalCases)
    .slice(0, 8);

  const isAuthenticated = Boolean(session?.user);
  const userEmail = session?.user?.email || '';

  // Wait for the auth check before rendering routes so a logged-in user
  // isn't briefly bounced to /login on refresh.
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <Loader message="Starting up..." />
      </div>
    );
  }

  // Once authenticated, wait for the clinic's data to load before showing
  // the dashboard so pages never render with an empty dataset.
  if (isAuthenticated && !dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <Loader message="Loading your clinic data..." />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        login,
        logout,
        passwordRecovery,
        updatePassword,
        pets,
        addPet,
        updatePet,
        deletePet,
        getPetById,
        owners,
        addOwner,
        updateOwner,
        deleteOwner,
        medicalVisits,
        addMedicalVisit,
        updateMedicalVisit,
        getVisitsByPetId,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        monthlyReportData,
        commonDiseaseData,
        clinicSettings,
        updateClinicSettings,
        emailsSentCount,
        sendEmail,
        savePetForm,
        petForms,
        getFormsByPetId,
        labReports,
        addLabReport,
        deleteLabReport,
        getLabReportsByPetId,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};