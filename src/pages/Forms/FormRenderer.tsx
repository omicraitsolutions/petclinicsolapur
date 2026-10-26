import React, { useEffect, useState } from 'react';
import { Printer, Share2, RotateCcw, Save, AlertTriangle, PenLine } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InputField } from '../../components/Inputs/InputField';
import { SelectField } from '../../components/Inputs/SelectField';
import { TextareaField } from '../../components/Inputs/TextareaField';
import { Button } from '../../components/Buttons/Button';
import { PetPicker } from '../../components/PetPicker/PetPicker';
import { FormTemplateDef, FormValues } from '../../types/forms';
import { Pet } from '../../types';
import { resolveAutoFillValue } from '../../utils/formAutoFill';
import { exportFormToPDF, generateFormPdfFile } from '../../utils/pdfExport';

interface FormRendererProps {
  template: FormTemplateDef;
  initialPet?: Pet | null;
}

function buildAutoFillValues(template: FormTemplateDef, pet: Pet | null, clinicSettings: any): FormValues {
  const values: FormValues = {};
  for (const section of template.sections) {
    for (const field of section.fields) {
      if (field.autoFill) {
        values[field.key] = resolveAutoFillValue(field.autoFill, pet, clinicSettings);
      }
    }
  }
  return values;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ template, initialPet = null }) => {
  const { clinicSettings, savePetForm, showToast } = useApp();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(initialPet);
  const [values, setValues] = useState<FormValues>(() => buildAutoFillValues(template, initialPet, clinicSettings));
  const [isSaving, setIsSaving] = useState(false);

  // Re-apply autofill whenever the template changes or a pet is picked,
  // without clobbering anything the user has already typed manually.
  useEffect(() => {
    setValues(prev => ({ ...buildAutoFillValues(template, selectedPet, clinicSettings), ...prev, ...buildAutoFillValues(template, selectedPet, clinicSettings) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    // A newly picked pet should override any stale autofilled values from
    // a previous pet, but must not wipe out fields the user typed by hand
    // (those have no autoFill key, so buildAutoFillValues never touches them).
    setValues(prev => ({ ...prev, ...buildAutoFillValues(template, pet, clinicSettings) }));
  };

  const setField = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleChecklistItem = (key: string, option: string) => {
    const current = (values[key] || '').split(',').map(s => s.trim()).filter(Boolean);
    const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
    setField(key, next.join(', '));
  };

  const handleReset = () => {
    setValues(buildAutoFillValues(template, selectedPet, clinicSettings));
  };

  const handlePrint = () => {
    exportFormToPDF(template, values, clinicSettings);
  };

  const handleShare = async () => {
    try {
      const file = generateFormPdfFile(template, values, clinicSettings);
      const shareData = { title: template.title, text: `${template.title} for ${values.petName || 'pet'}`, files: [file] };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Fall through to the clipboard fallback below.
    }

    // Fallback for browsers without file-sharing support: copy a plain
    // text summary so it can be pasted into WhatsApp/email/etc.
    const summaryLines: string[] = [template.title];
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (values[field.key]) summaryLines.push(`${field.label}: ${values[field.key]}`);
      }
    }
    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      showToast('Sharing isn\'t supported on this browser — copied a text summary to your clipboard instead.', 'info');
    } catch {
      showToast('Could not share or copy this form.', 'error');
    }
  };

  const handleSave = async () => {
    if (!selectedPet) {
      showToast('Select a pet before saving this form.', 'error');
      return;
    }
    setIsSaving(true);
    await savePetForm({
      petId: selectedPet.id,
      petName: selectedPet.name,
      ownerName: selectedPet.ownerName,
      formType: template.id,
      formTitle: template.title,
      data: values
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {template.internalWarning && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{template.internalWarning}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <PetPicker selectedPet={selectedPet} onSelect={handlePetSelect} />
      </div>

      {template.sections.map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0F6B63] uppercase tracking-wider mb-4">{section.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {section.fields.map(field => {
              const colSpan = field.span === 2 ? 'md:col-span-2' : '';

              if (field.type === 'textarea') {
                return (
                  <div key={field.key} className={colSpan}>
                    <TextareaField
                      label={field.label}
                      value={values[field.key] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows || 3}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.key} className={colSpan}>
                    <SelectField
                      label={field.label}
                      value={values[field.key] || field.options?.[0] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      options={field.options || []}
                    />
                  </div>
                );
              }

              if (field.type === 'yesno') {
                return (
                  <div key={field.key} className={`flex flex-col gap-1.5 ${colSpan}`}>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="flex gap-2">
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setField(field.key, opt)}
                          className={`flex-1 text-sm font-semibold rounded-lg py-2.5 border transition-colors cursor-pointer ${
                            values[field.key] === opt
                              ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                              : 'bg-[#F8FAFC] text-slate-600 border-slate-200 hover:border-[#0F6B63]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (field.type === 'checkboxGroup') {
                const selected = (values[field.key] || '').split(',').map(s => s.trim()).filter(Boolean);
                return (
                  <div key={field.key} className={colSpan}>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {field.label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(field.options || []).map(opt => {
                        const active = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleChecklistItem(field.key, opt)}
                            className={`text-xs font-semibold rounded-full px-3.5 py-1.5 border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                                : 'bg-[#F8FAFC] text-slate-600 border-slate-200 hover:border-[#0F6B63]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // text / date / time
              return (
                <div key={field.key} className={colSpan}>
                  <InputField
                    label={field.label}
                    type={field.type}
                    value={values[field.key] || ''}
                    onChange={e => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {template.noticeText && (
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-600 italic leading-relaxed">{template.noticeText}</p>
        </div>
      )}

      {(template.signatures.owner || template.signatures.veterinarian || template.signatures.groomer) && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#0F6B63] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Signatures
          </h3>
          <p className="text-xs text-slate-500 mb-1">
            Signature lines are added automatically on the printed / downloaded form — to be signed by hand once
            printed.
          </p>
          <div className="flex flex-wrap gap-6 mt-3">
            {template.signatures.owner && (
              <div className="text-xs text-slate-400 border-t border-slate-200 pt-2 w-48">Owner / Guardian Signature</div>
            )}
            {template.signatures.veterinarian && (
              <div className="text-xs text-slate-400 border-t border-slate-200 pt-2 w-48">Veterinarian Signature</div>
            )}
            {template.signatures.groomer && (
              <div className="text-xs text-slate-400 border-t border-slate-200 pt-2 w-48">Groomer Signature</div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
          Print / Download PDF
        </Button>
        <Button variant="secondary" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
          Share
        </Button>
        <Button variant="success" icon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
          Save to Pet Record
        </Button>
        <Button variant="danger" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};