import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Upload, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionCard } from '../../components/Cards/SectionCard';
import { StatCard } from '../../components/Cards/StatCard';
import { Button } from '../../components/Buttons/Button';
import { LabReportRow } from '../../components/LabReports/LabReportRow';
import { LabReportUploadModal } from '../../components/LabReports/LabReportUploadModal';

const FILTER_TYPES = ['All', 'Blood Test', 'X-Ray', 'Ultrasound', 'Other'] as const;

export const LabReportsOverview: React.FC = () => {
  const { labReports } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof FILTER_TYPES)[number]>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return labReports.filter(r => {
      const matchesSearch =
        !term || r.petName.toLowerCase().includes(term) || r.ownerName.toLowerCase().includes(term);
      const matchesType = typeFilter === 'All' || r.reportType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [labReports, search, typeFilter]);

  const bloodCount = labReports.filter(r => r.reportType === 'Blood Test').length;
  const xrayCount = labReports.filter(r => r.reportType === 'X-Ray').length;
  const otherCount = labReports.length - bloodCount - xrayCount;

  return (
    <div className="space-y-6 font-['Poppins']">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-[#0F6B63]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Lab Reports</h1>
            <p className="text-xs md:text-sm text-slate-500">
              Blood tests, X-rays, and ultrasound reports across all pets.
            </p>
          </div>
        </div>
        <Button variant="primary" icon={<Upload className="w-4 h-4" />} onClick={() => setIsUploadOpen(true)}>
          Upload Report
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard value={String(labReports.length)} label="Total Reports" icon={<FlaskConical className="w-6 h-6" />} />
        <StatCard value={String(bloodCount)} label="Blood Tests" icon={<FlaskConical className="w-6 h-6" />} />
        <StatCard value={String(xrayCount)} label="X-Rays" icon={<FlaskConical className="w-6 h-6" />} />
        <StatCard value={String(otherCount)} label="Other" icon={<FlaskConical className="w-6 h-6" />} />
      </div>

      <SectionCard title="All Reports" icon={<FlaskConical className="w-5 h-5 text-[#0F6B63]" />} bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by pet or owner…"
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-[#0F6B63] text-white border-[#0F6B63]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F6B63]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No lab reports {search || typeFilter !== 'All' ? 'match your filters' : 'uploaded yet'}.
            </p>
          ) : (
            filtered.map(report => (
              <LabReportRow
                key={report.id}
                report={report}
                showPetColumn
                onViewPet={petId => navigate(`/pet-profile?id=${petId}`)}
              />
            ))
          )}
        </div>
      </SectionCard>

      <LabReportUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};
