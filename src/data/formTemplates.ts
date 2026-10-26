import { FormFieldDef, FormTemplateDef } from '../types/forms';

// Shared field block used by all 4 templates -- these are modeled
// directly on the clinic's own paper forms, which all open with this
// exact same client + patient block. Defined once here to keep every
// template consistent and avoid drift.
const CLIENT_PATIENT_FIELDS: FormFieldDef[] = [
  { key: 'ownerName', label: "Client's Name", type: 'text', autoFill: 'ownerName' },
  { key: 'ownerAddress', label: 'Address', type: 'text', autoFill: 'ownerAddress', span: 2 },
  { key: 'ownerPhone', label: 'Mobile No.', type: 'text', autoFill: 'ownerPhone' },
  { key: 'ownerEmail', label: 'Email', type: 'text', autoFill: 'ownerEmail' },
  { key: 'petName', label: "Patient's Name", type: 'text', autoFill: 'petName' },
  { key: 'age', label: 'DOB / Age', type: 'text', autoFill: 'age' },
  { key: 'species', label: 'Species', type: 'text', autoFill: 'species' },
  { key: 'breed', label: 'Breed', type: 'text', autoFill: 'breed' },
  { key: 'sex', label: 'Sex', type: 'text', autoFill: 'gender' },
  { key: 'spayedNeutered', label: 'Spayed / Neutered', type: 'yesno', autoFill: 'spayedNeutered' },
  { key: 'colour', label: 'Colour', type: 'text', autoFill: 'color' },
  { key: 'weight', label: 'Body Wt.', type: 'text', autoFill: 'weight' }
];

export const FORM_TEMPLATES: FormTemplateDef[] = [
  // ---------------------------------------------------------------
  // 1. Consent for Anesthesia / Surgery
  // ---------------------------------------------------------------
  {
    id: 'surgery-consent',
    title: 'Consent for Anesthesia / Surgery',
    shortDescription: "Owner consent for anesthesia and/or surgery, matching the clinic's paper form.",
    category: 'Consent',
    sections: [
      {
        title: 'Client & Patient Details',
        fields: CLIENT_PATIENT_FIELDS
      },
      {
        title: 'Treatment Plan',
        fields: [
          { key: 'procedureDate', label: 'Date', type: 'date', autoFill: 'today' },
          { key: 'veterinarian', label: 'Veterinarian', type: 'text', autoFill: 'doctorName' },
          {
            key: 'treatmentPlan',
            label: 'Anesthesia is required by the following treatment plan',
            type: 'textarea',
            span: 2,
            rows: 4
          }
        ]
      }
    ],
    noticeText:
      'I am responsible for the above described animal and have the ability to give my permission to receive, prescribe for, treat and/or operate upon my pet. I acknowledge that the use of anesthesia is required by the treatment plan described above. I acknowledge that there are certain risks to anesthesia that could involve serious bodily injury or death to my pet, and that these risks are present in any procedure that requires a general or intravenous anesthetic. I agree to the use of anesthesia as considered necessary and advisable by the Veterinarian. After carefully reading the above, I have signed in agreement.',
    internalWarning: 'The clinic/veterinarian should approve the exact legal wording before this goes live with real clients.',
    signatures: { owner: true }
  },

  // ---------------------------------------------------------------
  // 2. Consent of Euthanasia
  // ---------------------------------------------------------------
  {
    id: 'euthanasia-consent',
    title: 'Consent of Euthanasia',
    shortDescription: 'Owner authorization for humane euthanasia.',
    category: 'Consent',
    sections: [
      {
        title: 'Client & Patient Details',
        fields: CLIENT_PATIENT_FIELDS
      }
    ],
    noticeText:
      'I attest that I am the owner of (or person responsible for) the animal described above. I give the doctor complete authority to euthanize this animal in what manner they deem best. I acknowledge that the animal will be treated humanely. I release the doctor from any liability for euthanizing this animal.',
    internalWarning:
      'This form carries real legal and emotional weight -- have the clinic/a lawyer approve the exact wording before it is used with any real client.',
    signatures: { owner: true }
  },

  // ---------------------------------------------------------------
  // 3. Health and Fitness Certificate
  // ---------------------------------------------------------------
  {
    id: 'fitness-certificate',
    title: 'Health and Fitness Certificate',
    shortDescription: "Certify a pet examined and found healthy, matching the clinic's paper certificate.",
    category: 'Certificate',
    sections: [
      {
        title: 'Client & Patient Details',
        fields: CLIENT_PATIENT_FIELDS
      },
      {
        title: 'Vaccination & Parasite Control',
        fields: [
          { key: 'vaccinationDetails', label: 'Vaccination Details', type: 'text' },
          { key: 'batchNumber', label: 'Batch Number', type: 'text' },
          { key: 'nextVaccineDue', label: 'Next Due for Vaccines', type: 'date' },
          { key: 'dewormingDetails', label: 'Deworming Details', type: 'text' },
          { key: 'nextDewormingDue', label: 'Next Due for Deworming', type: 'date' },
          { key: 'antiTickDetails', label: 'Anti-Tick Treatment Details', type: 'text' }
        ]
      },
      {
        title: 'Travel / Compliance (optional)',
        fields: [
          { key: 'destination', label: 'Destination (if travelling)', type: 'text' },
          { key: 'modeOfTravel', label: 'Mode of Travel', type: 'text', placeholder: 'e.g. Air / Road / Rail' },
          {
            key: 'travelComplianceStatement',
            label: 'Additional Certification Note',
            type: 'textarea',
            span: 2,
            rows: 2,
            placeholder:
              'e.g. It is imperative to state that [Country] is free of Rabies, therefore [pet name] is also bound to be Rabies free and fit to travel by [mode of travel].'
          }
        ]
      },
      {
        title: 'Certification',
        fields: [
          { key: 'certificateDate', label: 'Date', type: 'date', autoFill: 'today' },
          { key: 'place', label: 'Place', type: 'text' }
        ]
      }
    ],
    noticeText:
      'On the date of issue of this certificate of health, I examined the pet described above and it was under observation for the last one month and has been found to be free from signs of any communicable or contagious diseases.',
    signatures: { veterinarian: true }
  },

  // ---------------------------------------------------------------
  // 4. Registration Form
  // ---------------------------------------------------------------
  {
    id: 'registration-form',
    title: 'Registration Form',
    shortDescription: 'New client & patient intake, with owner authorization to treat and bill.',
    category: 'Admission',
    sections: [
      {
        title: 'Registration Details',
        fields: [
          { key: 'registrationNo', label: 'Registration No.', type: 'text', placeholder: 'Optional' },
          { key: 'registrationDate', label: 'Date', type: 'date', autoFill: 'today' }
        ]
      },
      {
        title: 'Client & Patient Details',
        fields: CLIENT_PATIENT_FIELDS
      },
      {
        title: 'Medical Background',
        fields: [
          { key: 'lastVaccine', label: 'Name & Date of Last Vaccine', type: 'text' },
          { key: 'lastDeworming', label: 'Name & Date of Last Deworming', type: 'text' },
          { key: 'regularDiet', label: 'Regular Diet', type: 'text' },
          { key: 'allergies', label: 'Any Allergies', type: 'text' },
          { key: 'previousVeterinarian', label: 'Previous Veterinarian', type: 'text' }
        ]
      }
    ],
    noticeText:
      'I am the Owner or responsible party for the above described Pet and have the authority to consent for treatment. I assume full responsibility for all charges incurred for the care and treatment of my pet. I understand that I am required to pay in full for services rendered and that a deposit may be required for Surgical/Anesthetic procedures.',
    signatures: { owner: true }
  }
];

export function getFormTemplate(id: string): FormTemplateDef | undefined {
  return FORM_TEMPLATES.find(t => t.id === id);
}