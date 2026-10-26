// Config-driven medical forms: each template describes its own sections
// and fields; a single FormRenderer component turns that config into a
// working, printable form for any of the 6 templates. This keeps every
// template consistent (same look, same autofill/print/share behavior)
// without hand-building 6 separate page layouts.

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select'
  | 'checkboxGroup'
  | 'yesno';

// Keys the renderer knows how to auto-fill from the selected pet /
// clinic settings / current date-time. Fields without an autoFill stay
// blank until the user types something.
export type AutoFillKey =
  | 'clinicName'
  | 'doctorName'
  | 'regNo'
  | 'clinicPhone'
  | 'clinicAddress'
  | 'petName'
  | 'species'
  | 'breed'
  | 'age'
  | 'dob'
  | 'gender'
  | 'weight'
  | 'color'
  | 'ownerName'
  | 'ownerPhone'
  | 'ownerEmail'
  | 'ownerAddress'
  | 'spayedNeutered'
  | 'today'
  | 'now';

export interface FormFieldDef {
  key: string;
  label: string;
  type: FormFieldType;
  options?: string[]; // for 'select' and 'checkboxGroup'
  placeholder?: string;
  autoFill?: AutoFillKey;
  span?: 1 | 2; // grid columns out of 2
  rows?: number; // for textarea
}

export interface FormSectionDef {
  title: string;
  fields: FormFieldDef[];
}

export interface FormTemplateDef {
  id: string;
  title: string;
  shortDescription: string;
  category: 'Consultation' | 'Consent' | 'Admission' | 'Certificate' | 'Vaccination';
  sections: FormSectionDef[];
  // A block of static consent/certification wording shown (and printed)
  // above any consent checkboxes -- not user-editable.
  noticeText?: string;
  // Internal-only heads-up shown in the app but deliberately left out of
  // the printed/PDF/shared version.
  internalWarning?: string;
  signatures: {
    owner?: boolean;
    veterinarian?: boolean;
    groomer?: boolean;
  };
}

// Free-form values keyed by field key; checkboxGroup values are stored
// as a single comma-separated string for simplicity everywhere else
// (printing, saving, sharing).
export type FormValues = Record<string, string>;