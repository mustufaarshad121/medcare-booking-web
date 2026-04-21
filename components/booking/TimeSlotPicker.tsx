import { getTimeSlots } from '@/lib/data';

interface TimeSlotPickerProps {
  date: string;
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}

export default function TimeSlotPicker({ date, selectedSlot, onSelect }: TimeSlotPickerProps) {
  const slots = getTimeSlots(date);

  if (slots.length === 0) {
    return (
      <p className="text-[#64748b] text-sm py-4">
        No appointments available on Sundays. Please select another date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            selectedSlot === slot
              ? 'bg-[#16a085] text-white border-[#16a085]'
              : 'bg-white text-[#0f3460] border-gray-200 hover:border-[#16a085] hover:text-[#16a085]'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
