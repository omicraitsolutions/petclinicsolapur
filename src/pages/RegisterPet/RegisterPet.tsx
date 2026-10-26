import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PawPrint, Save, RotateCcw, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { InputField } from '../../components/Inputs/InputField';
import { SelectField } from '../../components/Inputs/SelectField';
import { TextareaField } from '../../components/Inputs/TextareaField';
import { Button } from '../../components/Buttons/Button';
import { SuccessModal } from '../../components/Modal/SuccessModal';
import { PET_TYPES, getBreedsForPetType } from '../../utils/petBreeds';
import { calculateAgeFromDob } from '../../utils/petAge';
import { PetStatus } from '../../types';

// Adds the unit when only a number was typed; leaves empty values empty.
const formatAge = (value: string): string => {
  const v = value.trim();
  if (!v) return '';
  return /year|month|week|day/i.test(v) ? v : `${v} Years`;
};

const formatWeight = (value: string): string => {
  const v = value.trim();
  if (!v) return '';
  return /kg/i.test(v) ? v : `${v} Kg`;
};

export const RegisterPet: React.FC = () => {
  const { addPet, updatePet, getPetById, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Form states
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [breedOptions, setBreedOptions] = useState<string[]>(getBreedsForPetType('Dog'));
  const [breed, setBreed] = useState(getBreedsForPetType('Dog')[0] || '');
  const [customBreed, setCustomBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');

  // Owner states
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');

  const [notes, setNotes] = useState('');
  // Medical details are recorded from Treatment Details, not at registration:
  // vaccination starts as 'No' and is updated from a visit, and every new pet
  // starts with a 'Healthy' status.
  const vaccinated: 'Yes' | 'No' = 'No';
  const status: PetStatus = 'Healthy';

  // Success modal
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [registeredPetId, setRegisteredPetId] = useState<string>('P001');

  // Load pet for edit if editId is provided
  useEffect(() => {
    if (editId) {
      const existing = getPetById(editId);
      if (existing) {
        setPetName(existing.name);
        setPetType(existing.type);
        const options = getBreedsForPetType(existing.type);
        setBreedOptions(options);
        if (existing.breed && !options.includes(existing.breed)) {
          setBreed('Other');
          setCustomBreed(existing.breed);
        } else {
          setBreed(existing.breed || options[0]);
        }
        setGender(existing.gender);
        setDob(existing.dob || '');
        setAge(existing.age);
        setWeight(existing.weight.replace(/[^\d.]/g, ''));
        setColor(existing.color);
        setOwnerName(existing.ownerName);
        setOwnerEmail(existing.ownerEmail);
        setOwnerPhone(existing.ownerPhone);
        setOwnerAddress(existing.ownerAddress);
        setNotes(existing.notes || '');
      }
    }
  }, [editId]);

  // Cascading Pet Type -> Breed suggestions
  const handlePetTypeChange = (newType: string) => {
    setPetType(newType);
    const options = getBreedsForPetType(newType);
    setBreedOptions(options);
    setBreed(options[0] || 'Other');
    setCustomBreed('');
  };

  // Auto-calculate Age from Date of Birth; Age stays manually editable if
  // no DOB is provided (or if the doctor wants to override it afterward).
  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const computedAge = calculateAgeFromDob(value);
      if (computedAge) setAge(computedAge);
    }
  };

  const handleReset = () => {
    setPetName('');
    setPetType('Dog');
    setBreedOptions(getBreedsForPetType('Dog'));
    setBreed('');
    setCustomBreed('');
    setGender('Male');
    setDob('');
    setAge('');
    setWeight('');
    setColor('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
    setOwnerAddress('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!petName || !ownerName) {
      showToast('Please provide pet name and owner name.', 'warning');
      return;
    }

    const resolvedBreed = breed === 'Other' ? customBreed || 'Mixed Breed' : breed || 'Mixed Breed';

    if (editId) {
      updatePet(editId, {
        name: petName,
        type: petType,
        breed: resolvedBreed,
        gender,
        dob,
        age: formatAge(age),
        weight: formatWeight(weight),
        color,
        ownerName,
        ownerEmail,
        ownerPhone,
        ownerAddress,
        notes,
        status
      });
      setRegisteredPetId(editId);
      setIsSuccessOpen(true);
    } else {
      const newPet = addPet({
        name: petName,
        type: petType,
        breed: resolvedBreed,
        gender,
        dob,
        age: formatAge(age),
        weight: formatWeight(weight),
        color,
        status,
        vaccinated,
        ownerId: 'OWN' + Math.floor(100 + Math.random() * 900),
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerAddress,
        notes
      });
      setRegisteredPetId(newPet.id);
      setIsSuccessOpen(true);
    }
  };

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-[#F97316]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          {editId ? 'Edit Pet Profile' : 'Register New Pet'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Pet Information */}
        <SectionCard
          title="Pet Information"
          icon={<PawPrint className="w-5 h-5 text-[#0F6B63]" />}
          bodyClassName="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Pet Name"
              value={petName}
              onChange={e => setPetName(e.target.value)}
              placeholder="e.g. Bruno"
              required
            />

            <SelectField
              label="Pet Type"
              value={petType}
              onChange={e => handlePetTypeChange(e.target.value)}
              options={PET_TYPES}
            />

            <SelectField
              label="Breed"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              options={breedOptions}
            />

            {breed === 'Other' && (
              <InputField
                label="Specify Breed"
                value={customBreed}
                onChange={e => setCustomBreed(e.target.value)}
                placeholder="e.g. Local Mixed Breed"
              />
            )}

            <SelectField
              label="Gender"
              value={gender}
              onChange={e => setGender(e.target.value as 'Male' | 'Female')}
              options={['Male', 'Female']}
            />

            <InputField
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={e => handleDobChange(e.target.value)}
            />

            <InputField
              label="Age"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="Auto-filled from DOB, or enter manually e.g. 3 Years"
            />

            <InputField
              label="Weight (kg)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 15"
            />

            <InputField
              label="Pet Color"
              value={color}
              onChange={e => setColor(e.target.value)}
              placeholder="e.g. Brown"
            />

            <div className="md:col-span-2">
              <TextareaField
                label="Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anything worth remembering about this pet: temperament, allergies, owner preferences, etc."
                rows={2}
              />
            </div>
          </div>
        </SectionCard>

        {/* 2. Owner Details */}
        <SectionCard
          title="Owner Details"
          icon={<User className="w-5 h-5 text-[#0F6B63]" />}
          bodyClassName="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Owner Name"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder="e.g. Rahul Patil"
              required
            />

            <InputField
              label="Email"
              type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              placeholder="owner@example.com"
            />

            <InputField
              label="Mobile"
              value={ownerPhone}
              onChange={e => setOwnerPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              required
            />

            <InputField
              label="Address"
              value={ownerAddress}
              onChange={e => setOwnerAddress(e.target.value)}
              placeholder="House / street, area, city"
            />
          </div>
        </SectionCard>

        {/* Buttons at bottom */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            Save Pet
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Success Modal Alert */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate(`/pet-profile?id=${registeredPetId}`);
        }}
        title="127.0.0.1:5500 says"
        message="Pet Registered Successfully!"
        buttonText="OK"
      />
    </div>
  );
};