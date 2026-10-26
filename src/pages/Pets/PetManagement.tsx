import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table, Column } from '../../components/Tables/Table';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmModal } from '../../components/Modal/ConfirmModal';
import { isPetProfileIncomplete } from '../../utils/petProfile';
import { Pet } from '../../types';

export const PetManagement: React.FC = () => {
  const { pets, deletePet } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Extract unique breeds
  const breedsList = ['All Breeds', ...Array.from(new Set(pets.map(p => p.breed))).filter(Boolean)];

  // Filter
  const filteredPets = pets.filter(pet => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBreed = selectedBreed === 'All Breeds' || pet.breed === selectedBreed;

    return matchesSearch && matchesBreed;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage) || 1;
  const paginatedPets = filteredPets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Pet>[] = [
    {
      header: 'ID',
      accessor: 'id',
      width: '80px',
      render: pet => <span className="font-semibold text-slate-700">{pet.id}</span>
    },
    {
      header: 'Pet Name',
      accessor: 'name',
      render: pet => (
        <span className="font-bold text-slate-800 hover:text-[#0F6B63] transition-colors cursor-pointer"
          onClick={() => navigate(`/pet-profile?id=${pet.id}`)}>
          {pet.name}
        </span>
      )
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
      render: pet => <span className="text-slate-600">{pet.ownerName}</span>
    },
    {
      header: 'Breed',
      accessor: 'breed',
      render: pet => <span className="text-slate-600">{pet.breed}</span>
    },
    {
      header: 'Gender',
      accessor: 'gender',
      render: pet => <span className="text-slate-600">{pet.gender}</span>
    },
    {
      header: 'Age',
      accessor: 'age',
      render: pet => <span className="text-slate-600">{pet.age}</span>
    },
    {
      header: 'Profile',
      accessor: 'id',
      align: 'center',
      render: pet =>
        isPetProfileIncomplete(pet) ? (
          <button
            type="button"
            onClick={() => navigate(`/register-pet?editId=${pet.id}`)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 hover:bg-amber-100 cursor-pointer"
            title="Quick-added with some details missing"
          >
            <AlertCircle className="w-3 h-3" /> Incomplete
          </button>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )
    },
    {
      header: 'Action',
      align: 'center',
      width: '160px',
      render: pet => (
        <div className="flex items-center justify-center gap-1.5">
          {/* View Button */}
          <button
            type="button"
            onClick={() => navigate(`/pet-profile?id=${pet.id}`)}
            className="px-2.5 py-1 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            View
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => navigate(`/register-pet?editId=${pet.id}`)}
            className="px-2.5 py-1 bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setDeleteTargetId(pet.id)}
            className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header with Register Pet button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Pet Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Total {pets.length} registered pets in the clinic registry
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/register-pet')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-xs md:text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Pet</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Pet / Owner"
            className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2 min-h-[40px] focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedBreed}
            onChange={e => {
              setSelectedBreed(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2 min-h-[40px] focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none cursor-pointer"
          >
            {breedsList.map((breed, idx) => (
              <option key={idx} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <Table<Pet>
        columns={columns}
        data={paginatedPets}
        emptyMessage="No pets found matching criteria."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deletePet(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Pet Record"
        message="Are you sure you want to remove this pet from the clinic registry? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};