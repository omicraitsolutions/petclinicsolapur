import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pet } from '../../types';
import { isPetProfileIncomplete } from '../../utils/petProfile';
import { PawPrint, AlertCircle } from 'lucide-react';

export interface PetProfileCardProps {
  pet: Pet;
}

export const PetProfileCard: React.FC<PetProfileCardProps> = ({ pet }) => {
  const navigate = useNavigate();
  const incomplete = isPetProfileIncomplete(pet);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
      {/* Left Avatar block */}
      <div className="flex flex-col items-center text-center shrink-0">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
            <PawPrint className="w-12 h-12 text-[#0F6B63]/40" />
          </div>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
            <PawPrint className="w-3.5 h-3.5" />
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mt-2.5">{pet.name}</h3>
        <p className="text-xs text-slate-500">{pet.breed} {pet.type !== 'Dog' ? `(${pet.type})` : ''}</p>
        {incomplete && (
          <button
            type="button"
            onClick={() => navigate(`/register-pet?editId=${pet.id}`)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 hover:bg-amber-100 cursor-pointer"
          >
            <AlertCircle className="w-3 h-3" /> Complete Profile
          </button>
        )}
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 flex-1 w-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pet ID</span>
          <span className="text-sm font-bold text-slate-800">{pet.id}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Age</span>
          <span className="text-sm font-bold text-slate-800">{pet.age}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Gender</span>
          <span className="text-sm font-bold text-slate-800">{pet.gender}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Weight</span>
          <span className="text-sm font-bold text-slate-800">{pet.weight}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Color</span>
          <span className="text-sm font-bold text-slate-800">{pet.color}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Vaccinated</span>
          <span className="text-sm font-bold text-slate-800">{pet.vaccinated}</span>
        </div>
        {pet.notes && (
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Notes</span>
            <span className="text-sm text-slate-700">{pet.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};