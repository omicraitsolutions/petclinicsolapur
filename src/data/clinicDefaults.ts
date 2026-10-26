import { ClinicSettings } from '../types';
import { DEFAULT_CLINIC_LOGO_DATA_URL } from '../utils/defaultLogo';

// Default clinic settings, saved to the account the first time it logs in.

export const initialClinicSettings: ClinicSettings = {
  clinicName: 'Pet Hospital Solapur',
  doctorName: 'Dr. Dipak Shivadas Kadam',
  doctorQualification: 'MVSc (Veterinary Surgery & Radiology)',
  regNo: '7717',
  email: '',
  phone: '9860113267',
  address: 'Plot no 35/289 Venkateshwara complex, New Pacha Peth Ashok Chowk Solapur 413006',
  logoUrl: DEFAULT_CLINIC_LOGO_DATA_URL,
  smtpEmail: '',
  smtpPassword: '',
  smtpHost: '',
  smtpPort: ''
};