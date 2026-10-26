import { Pet } from '../types';

// Pets created through the quick-add drawer (from Appointments or
// Treatments) only capture a handful of fields on purpose, so booking
// or logging a visit stays fast. This flags the ones that still need a
// full profile filled in, without adding a new database column --
// it's just "does this pet have the fields a proper registration would
// have collected".
export function isPetProfileIncomplete(pet: Pet): boolean {
  return !pet.age || !pet.weight || !pet.color || !pet.ownerEmail || !pet.ownerAddress;
}