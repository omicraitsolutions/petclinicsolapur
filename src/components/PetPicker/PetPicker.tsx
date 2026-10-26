import React, { useMemo, useState } from 'react';
import { Search, PawPrint, UserPlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InputField } from '../../components/Inputs/InputField';
import { SelectField } from '../../components/Inputs/SelectField';
import { Button } from '../../components/Buttons/Button';
import { Drawer } from '../Drawer/Drawer';
import { PET_TYPES, getBreedsForPetType } from '../../utils/petBreeds';
import { Pet } from '../../types';

interface PetPickerProps {
  selectedPet: Pet | null;
  onSelect: (pet: Pet) => void;
}

export const PetPicker: React.FC<PetPickerProps> = ({ selectedPet, onSelect }) => {
  const { pets, addPet, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Quick-add fields are kept minimal. The pet is flagged "Incomplete" until
  // the rest of its profile is filled in.
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Dog');
  const [newBreed, setNewBreed] = useState(getBreedsForPetType('Dog')[0]);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pets.slice(0, 8);
    return pets
      .filter(p => p.name.toLowerCase().includes(term) || p.ownerName.toLowerCase().includes(term))
      .slice(0, 8);
  }, [pets, search]);

  const handlePick = (pet: Pet) => {
    onSelect(pet);
    setIsOpen(false);
    setSearch('');
  };

  const resetNewPetForm = () => {
    setNewName('');
    setNewType('Dog');
    setNewBreed(getBreedsForPetType('Dog')[0]);
    setNewOwnerName('');
    setNewOwnerPhone('');
  };

  const openAddDrawer = () => {
    // Only one overlay visible at a time -- otherwise the search
    // dropdown and the add-pet panel could stack awkwardly.
    setIsOpen(false);
    setIsAddDrawerOpen(true);
  };

  const handleCreatePet = () => {
    if (!newName || !newOwnerName) {
      showToast('Please provide at least the pet name and owner name.', 'warning');
      return;
    }
    const created = addPet({
      name: newName,
      type: newType,
      breed: newBreed || 'Mixed Breed',
      gender: 'Male',
      age: '',
      weight: '',
      color: '',
      status: 'Healthy',
      vaccinated: 'No',
      ownerId: 'OWN' + Math.floor(100 + Math.random() * 900),
      ownerName: newOwnerName,
      ownerPhone: newOwnerPhone,
      ownerEmail: '',
      ownerAddress: ''
    });
    onSelect(created);
    setIsAddDrawerOpen(false);
    resetNewPetForm();
  };

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
        Select Pet
      </label>

      {selectedPet ? (
        <div className="flex items-center justify-between gap-3 bg-[#F8FAFC] border border-slate-200 rounded-lg px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{selectedPet.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {selectedPet.breed} • Owner: {selectedPet.ownerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-semibold text-[#0F6B63] hover:underline shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2.5 bg-[#F8FAFC] border border-dashed border-slate-300 text-slate-500 text-sm rounded-lg px-3.5 py-2.5 hover:border-[#0F6B63] hover:text-[#0F6B63] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Search or select a pet…
        </button>
      )}

      {/* Search / select existing pet -- a small dropdown is fine here,
          it's short and capped in height. */}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Type a pet or owner name…"
                className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
            {filteredPets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No matching pets found.</p>
            ) : (
              filteredPets.map(pet => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => handlePick(pet)}
                  className="w-full text-left px-2 py-2 hover:bg-[#E8F8F0] rounded-md transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <PawPrint className="w-3.5 h-3.5 text-[#0F6B63] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{pet.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {pet.breed} • Owner: {pet.ownerName}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={openAddDrawer}
            className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#0F6B63] border border-dashed border-[#0F6B63]/40 rounded-lg py-2 hover:bg-[#E8F8F0] transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Pet
          </button>
        </div>
      )}

      {/* Quick-add a new pet -- a full drawer instead of a small overlay,
          so it never visually collides with the rest of the page's form
          fields sitting right below the picker. */}
      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false);
          resetNewPetForm();
        }}
        title="Quick Add Pet"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 -mt-1">
            This adds a new pet to your Pets list right away. It'll be marked as{' '}
            <strong>Incomplete</strong> until you fill in the rest of its profile later.
          </p>

          <InputField
            label="Pet Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Bruno"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Type"
              value={newType}
              onChange={e => {
                setNewType(e.target.value);
                setNewBreed(getBreedsForPetType(e.target.value)[0]);
              }}
              options={PET_TYPES}
            />
            <SelectField
              label="Breed"
              value={newBreed}
              onChange={e => setNewBreed(e.target.value)}
              options={getBreedsForPetType(newType)}
            />
          </div>

          <InputField
            label="Owner Name"
            value={newOwnerName}
            onChange={e => setNewOwnerName(e.target.value)}
            placeholder="e.g. Rahul Patil"
            required
          />

          <InputField
            label="Owner Phone"
            value={newOwnerPhone}
            onChange={e => setNewOwnerPhone(e.target.value)}
            placeholder="e.g. 98XXXXXXXX"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddDrawerOpen(false);
                resetNewPetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleCreatePet}>
              Create & Use This Pet
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};