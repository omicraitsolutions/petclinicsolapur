import { Pet, ClinicSettings } from '../types';
import { AutoFillKey } from '../types/forms';

export function resolveAutoFillValue(
  key: AutoFillKey,
  pet: Pet | null,
  clinicSettings: ClinicSettings
): string {
  switch (key) {
    case 'clinicName':
      return clinicSettings.clinicName || '';
    case 'doctorName':
      return clinicSettings.doctorName || '';
    case 'regNo':
      return clinicSettings.regNo || '';
    case 'clinicPhone':
      return clinicSettings.phone || '';
    case 'clinicAddress':
      return clinicSettings.address || '';
    case 'petName':
      return pet?.name || '';
    case 'species':
      return pet?.type || '';
    case 'breed':
      return pet?.breed || '';
    case 'age':
      return pet?.age || '';
    case 'dob':
      return pet?.dob || '';
    case 'gender':
      return pet?.gender || '';
    case 'weight':
      return pet?.weight || '';
    case 'color':
      return pet?.color || '';
    case 'ownerName':
      return pet?.ownerName || '';
    case 'ownerPhone':
      return pet?.ownerPhone || '';
    case 'ownerEmail':
      return pet?.ownerEmail || '';
    case 'ownerAddress':
      return pet?.ownerAddress || '';
    case 'spayedNeutered':
      return pet?.spayedNeutered || '';
    case 'today':
      return new Date().toISOString().split('T')[0];
    case 'now': {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    default:
      return '';
  }
}