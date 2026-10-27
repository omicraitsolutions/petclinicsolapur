import React from 'react';
import { PenLine } from 'lucide-react';
import { FormTemplateDef } from '../../types/forms';

// Read-only rendering of a saved form, laid out exactly like the form page
// (same sections, same field order, same yes/no and checklist look) but with
// the saved answers locked in.

interface SavedFormViewProps {
  template?: FormTemplateDef;
  values: Record<string, string>;
}

const valueBox = 'w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2.5 min-h-[42px] whitespace-pre-wrap break-words';
const labelCls = 'text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5';

export const SavedFormView: React.FC<SavedFormViewProps> = ({ template, values }) => {
  if (!template) {
    // Template no longer exists: still show every saved answer.
    return (
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(values)
          .filter(([, v]) => v)
          .map(([key, v]) => (
            <div key={key}>
              <span className={labelCls}>{key}</span>
              <div className={valueBox}>{v}</div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-4 pb-6">
      {template.sections.map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0F6B63] uppercase tracking-wider mb-4">{section.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(field => {
              const colSpan = field.span === 2 || field.type === 'textarea' ? 'md:col-span-2' : '';
              const value = values[field.key] || '';

              if (field.type === 'yesno') {
                return (
                  <div key={field.key} className={colSpan}>
                    <span className={labelCls}>{field.label}</span>
                    <div className="flex gap-2">
                      {['Yes', 'No'].map(opt => (
                        <span
                          key={opt}
                          className={`flex-1 text-center text-sm font-semibold rounded-lg py-2.5 border ${
                            value === opt
                              ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                              : 'bg-[#F8FAFC] text-slate-400 border-slate-200'
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (field.type === 'checkboxGroup') {
                const selected = value.split(',').map(s => s.trim()).filter(Boolean);
                return (
                  <div key={field.key} className={colSpan}>
                    <span className={labelCls}>{field.label}</span>
                    <div className="flex flex-wrap gap-2">
                      {(field.options || []).map(opt => (
                        <span
                          key={opt}
                          className={`text-xs font-semibold rounded-full px-3.5 py-1.5 border ${
                            selected.includes(opt)
                              ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                              : 'bg-[#F8FAFC] text-slate-400 border-slate-200'
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.key} className={colSpan}>
                  <span className={labelCls}>{field.label}</span>
                  <div className={`${valueBox} ${field.type === 'textarea' ? 'min-h-[84px]' : ''}`}>
                    {value || <span className="text-slate-300">—</span>}
                  </div>
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#0F6B63] uppercase tracking-wider mb-3 flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Signatures
          </h3>
          <div className="flex flex-wrap gap-6 mt-3">
            {template.signatures.owner && (
              <div className="text-xs text-slate-400 border-t border-slate-300 pt-2 w-48">Owner / Guardian Signature</div>
            )}
            {template.signatures.veterinarian && (
              <div className="text-xs text-slate-400 border-t border-slate-300 pt-2 w-48">Veterinarian Signature</div>
            )}
            {template.signatures.groomer && (
              <div className="text-xs text-slate-400 border-t border-slate-300 pt-2 w-48">Groomer Signature</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
