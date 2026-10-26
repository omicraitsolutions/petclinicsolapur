import React, { useState } from 'react';
import { Plus, Users, Phone, Mail, MapPin, Eye, Edit2, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table, Column } from '../../components/Tables/Table';
import { InputField } from '../../components/Inputs/InputField';
import { Button } from '../../components/Buttons/Button';
import { Owner } from '../../types';

export const OwnerManagement: React.FC = () => {
  const { owners, addOwner, updateOwner, pets, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [viewingOwner, setViewingOwner] = useState<Owner | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [totalPets, setTotalPets] = useState(1);

  const filteredOwners = owners.filter(
    o =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.mobile.includes(searchTerm) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingOwner(null);
    setName('');
    setMobile('');
    setEmail('');
    setAddress('Solapur, Maharashtra');
    setTotalPets(1);
    setIsFormModalOpen(true);
  };

  const openEditModal = (owner: Owner) => {
    setEditingOwner(owner);
    setName(owner.name);
    setMobile(owner.mobile);
    setEmail(owner.email);
    setAddress(owner.address);
    setTotalPets(owner.totalPets);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      showToast('Please fill in owner name and mobile number.', 'warning');
      return;
    }

    if (editingOwner) {
      updateOwner(editingOwner.id, {
        name,
        mobile,
        email,
        address,
        totalPets: Number(totalPets) || 1
      });
    } else {
      addOwner({
        name,
        mobile,
        email,
        address,
        totalPets: Number(totalPets) || 1
      });
    }

    setIsFormModalOpen(false);
  };

  const columns: Column<Owner>[] = [
    {
      header: 'Owner ID',
      accessor: 'id',
      width: '120px',
      render: o => <span className="font-semibold text-slate-700">{o.id}</span>
    },
    {
      header: 'Name',
      accessor: 'name',
      render: o => <span className="font-bold text-slate-800">{o.name}</span>
    },
    {
      header: 'Mobile',
      accessor: 'mobile',
      render: o => <span className="text-slate-600 font-mono">{o.mobile}</span>
    },
    {
      header: 'Email',
      accessor: 'email',
      render: o => <span className="text-slate-600">{o.email}</span>
    },
    {
      header: 'Total Pets',
      accessor: 'totalPets',
      align: 'center',
      render: o => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-xs text-slate-700">
          {o.totalPets}
        </span>
      )
    },
    {
      header: 'Address',
      accessor: 'address',
      render: o => <span className="text-slate-600">{o.address}</span>
    },
    {
      header: 'Action',
      align: 'center',
      width: '160px',
      render: o => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setViewingOwner(o)}
            className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            View
          </button>

          <button
            type="button"
            onClick={() => openEditModal(o)}
            className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Owner Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Registered pet parents, primary contacts, and household records
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-xs md:text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Owner</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search Owner Name / Mobile Number"
          className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2.5 min-h-[42px] focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
        />
      </div>

      {/* Reusable Table */}
      <Table<Owner>
        columns={columns}
        data={filteredOwners}
        emptyMessage="No owners found matching search criteria."
      />

      {/* Add / Edit Owner Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingOwner ? 'Edit Owner Details' : 'Register New Owner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <InputField
                label="Owner Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
              />

              <InputField
                label="Mobile Number"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                required
              />

              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@example.com"
              />

              <InputField
                label="Address / City"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Solapur, Maharashtra"
              />

              <InputField
                label="Total Pets Count"
                type="number"
                min="1"
                value={totalPets}
                onChange={e => setTotalPets(Number(e.target.value))}
              />

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingOwner ? 'Save Changes' : 'Add Owner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Owner Details Modal */}
      {viewingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{viewingOwner.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{viewingOwner.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOwner(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-400 font-semibold block">Phone</span>
                  <span className="text-slate-800 font-bold">{viewingOwner.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Email</span>
                  <span className="text-slate-800 font-bold">{viewingOwner.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block">Location</span>
                  <span className="text-slate-800 font-bold">{viewingOwner.address}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Associated Pets</h4>
                <div className="space-y-2">
                  {pets
                    .filter(
                      p =>
                        p.ownerId === viewingOwner.id ||
                        p.ownerName.toLowerCase() === viewingOwner.name.toLowerCase()
                    )
                    .map(pet => (
                      <div
                        key={pet.id}
                        className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-lg border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-slate-800">{pet.name}</span>
                          <span className="text-slate-400">({pet.breed} - {pet.type})</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button size="sm" variant="secondary" onClick={() => setViewingOwner(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};