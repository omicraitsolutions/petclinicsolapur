import { supabase } from './supabaseClient';
import {
  Pet,
  Owner,
  MedicalVisit,
  Appointment,
  InvoiceItem,
  ClinicSettings,
  LabReport,
  PetForm
} from '../types';

// =====================================================================
// Row <-> App-type mappers (DB is snake_case, app types are camelCase)
// =====================================================================

const toPet = (r: any): Pet => ({
  id: r.id,
  name: r.name,
  type: r.type,
  breed: r.breed,
  gender: r.gender,
  dob: r.dob || '',
  age: r.age,
  weight: r.weight,
  color: r.color,
  status: r.status,
  vaccinated: r.vaccinated,
  spayedNeutered: r.spayed_neutered || '',
  ownerId: r.owner_id || '',
  ownerName: r.owner_name || '',
  ownerPhone: r.owner_phone || '',
  ownerEmail: r.owner_email || '',
  ownerAddress: r.owner_address || '',
  disease: r.disease || '',
  symptoms: r.symptoms || '',
  notes: r.medical_history || '',
  registrationDate: r.registration_date
});

const fromPet = (p: Partial<Pet>, userId: string) => ({
  ...(p.id !== undefined && { id: p.id }),
  user_id: userId,
  ...(p.name !== undefined && { name: p.name }),
  ...(p.type !== undefined && { type: p.type }),
  ...(p.breed !== undefined && { breed: p.breed }),
  ...(p.gender !== undefined && { gender: p.gender }),
  ...(p.dob !== undefined && { dob: p.dob || null }),
  ...(p.age !== undefined && { age: p.age }),
  ...(p.weight !== undefined && { weight: p.weight }),
  ...(p.color !== undefined && { color: p.color }),
  ...(p.status !== undefined && { status: p.status }),
  ...(p.vaccinated !== undefined && { vaccinated: p.vaccinated }),
  ...(p.spayedNeutered !== undefined && { spayed_neutered: p.spayedNeutered }),
  ...(p.ownerId !== undefined && { owner_id: p.ownerId }),
  ...(p.ownerName !== undefined && { owner_name: p.ownerName }),
  ...(p.ownerPhone !== undefined && { owner_phone: p.ownerPhone }),
  ...(p.ownerEmail !== undefined && { owner_email: p.ownerEmail }),
  ...(p.ownerAddress !== undefined && { owner_address: p.ownerAddress }),
  ...(p.disease !== undefined && { disease: p.disease }),
  ...(p.symptoms !== undefined && { symptoms: p.symptoms }),
  ...(p.notes !== undefined && { medical_history: p.notes }),
  ...(p.registrationDate !== undefined && { registration_date: p.registrationDate })
});

const toOwner = (r: any): Owner => ({
  id: r.id,
  name: r.name,
  mobile: r.mobile || '',
  email: r.email || '',
  totalPets: r.total_pets || 0,
  address: r.address || '',
  petsList: r.pets_list || []
});

const fromOwner = (o: Partial<Owner>, userId: string) => ({
  ...(o.id !== undefined && { id: o.id }),
  user_id: userId,
  ...(o.name !== undefined && { name: o.name }),
  ...(o.mobile !== undefined && { mobile: o.mobile }),
  ...(o.email !== undefined && { email: o.email }),
  ...(o.totalPets !== undefined && { total_pets: o.totalPets }),
  ...(o.address !== undefined && { address: o.address }),
  ...(o.petsList !== undefined && { pets_list: o.petsList })
});

const toVisit = (r: any): MedicalVisit => ({
  id: r.id,
  petId: r.pet_id,
  petName: r.pet_name || '',
  ownerName: r.owner_name || '',
  date: r.date || '',
  disease: r.disease || '',
  symptoms: r.symptoms || '',
  treatment: r.treatment || '',
  medicines: r.medicines || '',
  doctor: r.doctor || '',
  doctorNotes: r.doctor_notes || '',
  nextVisit: r.next_visit || '',
  invoiceId: r.invoice_id || '',
  appointmentId: r.appointment_id || ''
});

const fromVisit = (v: Partial<MedicalVisit>, userId: string) => ({
  ...(v.id !== undefined && { id: v.id }),
  user_id: userId,
  ...(v.petId !== undefined && { pet_id: v.petId }),
  ...(v.petName !== undefined && { pet_name: v.petName }),
  ...(v.ownerName !== undefined && { owner_name: v.ownerName }),
  ...(v.date !== undefined && { date: v.date }),
  ...(v.disease !== undefined && { disease: v.disease }),
  ...(v.symptoms !== undefined && { symptoms: v.symptoms }),
  ...(v.treatment !== undefined && { treatment: v.treatment }),
  ...(v.medicines !== undefined && { medicines: v.medicines }),
  ...(v.doctor !== undefined && { doctor: v.doctor }),
  ...(v.doctorNotes !== undefined && { doctor_notes: v.doctorNotes }),
  ...(v.nextVisit !== undefined && { next_visit: v.nextVisit }),
  ...(v.invoiceId !== undefined && { invoice_id: v.invoiceId }),
  ...(v.appointmentId !== undefined && { appointment_id: v.appointmentId })
});

const toAppointment = (r: any): Appointment => ({
  id: r.id,
  petId: r.pet_id || '',
  time: r.time || '',
  date: r.date || '',
  petName: r.pet_name || '',
  ownerName: r.owner_name || '',
  mobileNumber: r.mobile_number || '',
  doctor: r.doctor || '',
  status: r.status
});

const fromAppointment = (a: Partial<Appointment>, userId: string) => ({
  ...(a.id !== undefined && { id: a.id }),
  user_id: userId,
  ...(a.petId !== undefined && { pet_id: a.petId }),
  ...(a.time !== undefined && { time: a.time }),
  ...(a.date !== undefined && { date: a.date }),
  ...(a.petName !== undefined && { pet_name: a.petName }),
  ...(a.ownerName !== undefined && { owner_name: a.ownerName }),
  ...(a.mobileNumber !== undefined && { mobile_number: a.mobileNumber }),
  ...(a.doctor !== undefined && { doctor: a.doctor }),
  ...(a.status !== undefined && { status: a.status })
});

const toInvoice = (r: any): InvoiceItem => ({
  id: r.id,
  invoiceNumber: r.invoice_number,
  petName: r.pet_name || '',
  ownerName: r.owner_name || '',
  date: r.date || '',
  items: Array.isArray(r.items) ? r.items : [],
  totalAmount: Number(r.total_amount) || 0,
  status: r.status,
  paymentMethod: r.payment_method,
  visitId: r.visit_id || ''
});

const fromInvoice = (i: Partial<InvoiceItem>, userId: string) => ({
  ...(i.id !== undefined && { id: i.id }),
  user_id: userId,
  ...(i.invoiceNumber !== undefined && { invoice_number: i.invoiceNumber }),
  ...(i.petName !== undefined && { pet_name: i.petName }),
  ...(i.ownerName !== undefined && { owner_name: i.ownerName }),
  ...(i.date !== undefined && { date: i.date }),
  ...(i.items !== undefined && { items: i.items }),
  ...(i.totalAmount !== undefined && { total_amount: i.totalAmount }),
  ...(i.status !== undefined && { status: i.status }),
  ...(i.paymentMethod !== undefined && { payment_method: i.paymentMethod }),
  ...(i.visitId !== undefined && { visit_id: i.visitId })
});

const toClinicSettings = (r: any): ClinicSettings => ({
  clinicName: r.clinic_name,
  doctorName: r.doctor_name,
  doctorQualification: r.doctor_qualification || '',
  regNo: r.reg_no || '',
  email: r.email || '',
  phone: r.phone || '',
  address: r.address || '',
  logoUrl: r.logo_url || '',
  smtpEmail: r.smtp_email || '',
  smtpPassword: r.smtp_password || '',
  smtpHost: r.smtp_host || '',
  smtpPort: r.smtp_port || ''
});

const fromClinicSettings = (s: ClinicSettings, userId: string) => ({
  user_id: userId,
  clinic_name: s.clinicName,
  doctor_name: s.doctorName,
  doctor_qualification: s.doctorQualification,
  reg_no: s.regNo,
  email: s.email,
  phone: s.phone,
  address: s.address,
  logo_url: s.logoUrl,
  smtp_email: s.smtpEmail,
  smtp_password: s.smtpPassword,
  smtp_host: s.smtpHost,
  smtp_port: s.smtpPort,
  updated_at: new Date().toISOString()
});

const toLabReport = (r: any): LabReport => ({
  id: r.id,
  petId: r.pet_id,
  petName: r.pet_name || '',
  ownerName: r.owner_name || '',
  reportType: r.report_type,
  reportDate: r.report_date,
  notes: r.notes || '',
  filePath: r.file_path,
  fileName: r.file_name,
  fileType: r.file_type || '',
  createdAt: r.created_at
});

const fromLabReport = (r: Omit<LabReport, 'id' | 'createdAt'>, userId: string) => ({
  user_id: userId,
  pet_id: r.petId,
  pet_name: r.petName,
  owner_name: r.ownerName,
  report_type: r.reportType,
  report_date: r.reportDate,
  notes: r.notes,
  file_path: r.filePath,
  file_name: r.fileName,
  file_type: r.fileType
});

const toPetForm = (r: any): PetForm => ({
  id: r.id,
  petId: r.pet_id,
  petName: r.pet_name || '',
  ownerName: r.owner_name || '',
  formType: r.form_type,
  formTitle: r.form_title,
  data: r.data || {},
  createdAt: r.created_at
});

// =====================================================================
// Public data-access API used by AppContext
// =====================================================================

export const db = {
  async fetchAll(userId: string) {
    const [petsRes, ownersRes, visitsRes, aptsRes, invRes, settingsRes, labReportsRes, petFormsRes] =
      await Promise.all([
        supabase.from('pets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('owners').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('medical_visits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('clinic_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('lab_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pet_forms').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

    const firstError =
      petsRes.error ||
      ownersRes.error ||
      visitsRes.error ||
      aptsRes.error ||
      invRes.error ||
      settingsRes.error ||
      labReportsRes.error ||
      petFormsRes.error;
    if (firstError) throw firstError;

    return {
      pets: (petsRes.data || []).map(toPet),
      owners: (ownersRes.data || []).map(toOwner),
      medicalVisits: (visitsRes.data || []).map(toVisit),
      appointments: (aptsRes.data || []).map(toAppointment),
      invoices: (invRes.data || []).map(toInvoice),
      clinicSettings: settingsRes.data ? toClinicSettings(settingsRes.data) : null,
      labReports: (labReportsRes.data || []).map(toLabReport),
      petForms: (petFormsRes.data || []).map(toPetForm)
    };
  },

  // Pets
  async insertPet(pet: Pet, userId: string) {
    const { error } = await supabase.from('pets').insert(fromPet(pet, userId));
    if (error) throw error;
  },
  async updatePet(id: string, updates: Partial<Pet>, userId: string) {
    const { error } = await supabase.from('pets').update(fromPet(updates, userId)).eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },
  async deletePet(id: string, userId: string) {
    const { error } = await supabase.from('pets').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Owners
  async insertOwner(owner: Owner, userId: string) {
    const { error } = await supabase.from('owners').insert(fromOwner(owner, userId));
    if (error) throw error;
  },
  async updateOwner(id: string, updates: Partial<Owner>, userId: string) {
    const { error } = await supabase
      .from('owners')
      .update(fromOwner(updates, userId))
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },
  async deleteOwner(id: string, userId: string) {
    const { error } = await supabase.from('owners').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Medical visits
  async insertVisit(visit: MedicalVisit, userId: string) {
    const { error } = await supabase.from('medical_visits').insert(fromVisit(visit, userId));
    if (error) throw error;
  },
  async updateVisit(id: string, updates: Partial<MedicalVisit>, userId: string) {
    const { error } = await supabase
      .from('medical_visits')
      .update(fromVisit(updates, userId))
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Appointments
  async insertAppointment(apt: Appointment, userId: string) {
    const { error } = await supabase.from('appointments').insert(fromAppointment(apt, userId));
    if (error) throw error;
  },
  async updateAppointment(id: string, updates: Partial<Appointment>, userId: string) {
    const { error } = await supabase
      .from('appointments')
      .update(fromAppointment(updates, userId))
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },
  async deleteAppointment(id: string, userId: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // Invoices
  async insertInvoice(inv: InvoiceItem, userId: string) {
    const { error } = await supabase.from('invoices').insert(fromInvoice(inv, userId));
    if (error) throw error;
  },
  async updateInvoice(id: string, updates: Partial<InvoiceItem>, userId: string) {
    const { error } = await supabase
      .from('invoices')
      .update(fromInvoice(updates, userId))
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Settings & preferences (single row per user, upsert)
  async upsertClinicSettings(settings: ClinicSettings, userId: string) {
    const { error } = await supabase.from('clinic_settings').upsert(fromClinicSettings(settings, userId));
    if (error) throw error;
  },

  // Email logs
  async fetchEmailLogsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count || 0;
  },
  async logEmail(entry: { toEmail: string; subject: string; status: 'sent' | 'failed'; error?: string }, userId: string) {
    const { error } = await supabase.from('email_logs').insert({
      user_id: userId,
      to_email: entry.toEmail,
      subject: entry.subject,
      status: entry.status,
      error: entry.error || null
    });
    if (error) throw error;
  },

  // Saved medical forms (Consent, Admission, Certificate, Vaccination, etc.)
  async insertPetForm(
    entry: { petId: string; petName: string; ownerName: string; formType: string; formTitle: string; data: Record<string, string> },
    userId: string
  ): Promise<PetForm> {
    const { data, error } = await supabase
      .from('pet_forms')
      .insert({
        user_id: userId,
        pet_id: entry.petId,
        pet_name: entry.petName,
        owner_name: entry.ownerName,
        form_type: entry.formType,
        form_title: entry.formTitle,
        data: entry.data
      })
      .select()
      .single();
    if (error) throw error;
    return toPetForm(data);
  },

  // Lab reports (blood test / X-ray / ultrasound files)
  async insertLabReport(entry: Omit<LabReport, 'id' | 'createdAt'>, userId: string): Promise<LabReport> {
    const { data, error } = await supabase
      .from('lab_reports')
      .insert(fromLabReport(entry, userId))
      .select()
      .single();
    if (error) throw error;
    return toLabReport(data);
  },
  async deleteLabReport(id: string, userId: string) {
    const { error } = await supabase.from('lab_reports').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  }
};