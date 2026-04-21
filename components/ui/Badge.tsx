import { AppointmentStatus } from '@/lib/types';

interface BadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const styles: Record<AppointmentStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
