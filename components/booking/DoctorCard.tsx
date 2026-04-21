import { Check } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { getInitials } from '@/lib/data';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-[#16a085] bg-[#16a085]/5 shadow-md'
          : 'border-gray-200 bg-white hover:border-[#16a085]/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: doctor.avatar_color }}
        >
          {getInitials(doctor.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-[#0f3460] text-sm truncate">{doctor.name}</p>
            {isSelected && (
              <span className="shrink-0 bg-[#16a085] text-white rounded-full p-0.5">
                <Check size={12} />
              </span>
            )}
          </div>
          <p className="text-[#16a085] text-xs font-medium mt-0.5">{doctor.specialty}</p>
          <p className="text-[#64748b] text-xs mt-0.5">{doctor.location}</p>
          {doctor.bio && (
            <p className="text-[#64748b] text-xs mt-1.5 line-clamp-2">{doctor.bio}</p>
          )}
        </div>
      </div>
    </button>
  );
}
