export type PetStatus = 'Healthy' | 'Treatment' | 'Critical' | 'Done' | 'Recovered';

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: 'Male' | 'Female';
  dob?: string;
  age: string;
  weight: string;
  color: string;
  status: PetStatus;
  vaccinated: 'Yes' | 'No';
  spayedNeutered?: 'Yes' | 'No' | '';
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  disease?: string;
  symptoms?: string;
  notes?: string;
  registrationDate: string;
}

export interface Owner {
  id: string;
  name: string;
  mobile: string;
  email: string;
  totalPets: number;
  address: string;
  petsList?: string[];
}

export interface MedicalVisit {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  date: string;
  disease: string;
  symptoms?: string;
  treatment: string;
  medicines: string;
  doctor: string;
  doctorNotes?: string;
  nextVisit?: string;
  invoiceId?: string; // set once a bill has been generated for this visit
  appointmentId?: string; // set when this visit fulfilled a booked appointment
}

export interface Appointment {
  id: string;
  petId?: string; // set when booked against an existing pet, for real tracking
  time: string;
  date: string;
  petName: string;
  ownerName: string;
  mobileNumber: string;
  doctor: string;
  status: 'Confirmed' | 'Pending' | 'Arrived' | 'Completed' | 'Cancelled';
}

export type LabReportType = 'Blood Test' | 'X-Ray' | 'Ultrasound' | 'Other';

export interface LabReport {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  reportType: LabReportType;
  reportDate: string;
  notes: string;
  filePath: string; // path inside the private 'lab-reports' storage bucket
  fileName: string; // original filename, for display/download
  fileType: string; // mime type, e.g. image/jpeg, application/pdf
  createdAt: string;
}

export interface PetForm {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  formType: string; // matches a FormTemplateDef id, e.g. 'surgery-consent'
  formTitle: string;
  data: Record<string, string>;
  createdAt: string;
}

export interface MonthlyReportItem {
  month: string;
  patients: number;
  treatments: number;
  revenue: number;
}

export interface CommonDiseaseItem {
  disease: string;
  totalCases: number;
}

export interface InvoiceLineItem {
  label: string;
  amount: number;
}

export const BILL_ITEM_LABELS: string[] = [
  'Consultation',
  'General Check-Up',
  'Vaccination',
  'Deworming',
  'Treatment',
  'Surgery',
  'Blood Test',
  'X-ray / Sonography',
  'Grooming',
  'Medicine',
  'Admission',
  'House Call',
  'Emergency',
  'Other'
];

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  petName: string;
  ownerName: string;
  date: string;
  items: InvoiceLineItem[];
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Net Banking';
  visitId?: string; // set when this invoice was generated from a specific visit
}

export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  doctorQualification: string;
  regNo: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  smtpEmail: string;
  smtpPassword: string;
  smtpHost: string;
  smtpPort: string;
}