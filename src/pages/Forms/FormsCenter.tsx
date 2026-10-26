import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Stethoscope,
  ScissorsLineDashed,
  BedDouble,
  BadgeCheck,
  Syringe,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FORM_TEMPLATES } from '../../data/formTemplates';
import { FormTemplateDef } from '../../types/forms';
import { FormRenderer } from './FormRenderer';

const CATEGORY_ICON: Record<FormTemplateDef['category'], React.ReactNode> = {
  Consultation: <Stethoscope className="w-5 h-5" />,
  Consent: <ScissorsLineDashed className="w-5 h-5" />,
  Admission: <BedDouble className="w-5 h-5" />,
  Certificate: <BadgeCheck className="w-5 h-5" />,
  Vaccination: <Syringe className="w-5 h-5" />
};

export const FormsCenter: React.FC = () => {
  const { pets } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplateDef | null>(null);

  // Arriving from a pet's Treatment page (or elsewhere) with ?petId=
  // should skip re-picking the pet inside the form -- it's already
  // known which pet this is for.
  const petIdParam = searchParams.get('petId');
  const initialPet = petIdParam ? pets.find(p => p.id === petIdParam) || null : null;

  if (selectedTemplate) {
    return (
      <div className="space-y-6 font-['Poppins']">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedTemplate(null)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="inline-block text-lg md:text-xl font-extrabold text-slate-800 tracking-tight border-2 border-slate-800 rounded-md px-3 py-1">
              {selectedTemplate.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">{selectedTemplate.shortDescription}</p>
          </div>
        </div>

        <FormRenderer template={selectedTemplate} initialPet={initialPet} />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Poppins']">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#0F6B63]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Forms</h1>
          <p className="text-xs md:text-sm text-slate-500">
            Fill, print, share, or save any of the clinic's medical form templates for a pet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORM_TEMPLATES.map(template => (
          <button
            key={template.id}
            type="button"
            onClick={() => setSelectedTemplate(template)}
            className="text-left bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0F6B63]/40 transition-all p-5 flex flex-col gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
              {CATEGORY_ICON[template.category]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{template.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{template.shortDescription}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0F6B63] bg-[#E8F8F0] rounded-full px-2.5 py-1 w-fit">
              {template.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};