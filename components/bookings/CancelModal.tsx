'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Appointment } from '@/lib/types';
import { formatDate } from '@/lib/data';

interface CancelModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function CancelModal({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: CancelModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment?">
      <div className="space-y-4">
        <p className="text-sm text-[#64748b]">
          Are you sure you want to cancel your appointment with{' '}
          <span className="font-medium text-[#1a202c]">{appointment.doctor?.name}</span>{' '}
          on <span className="font-medium text-[#1a202c]">{formatDate(appointment.appointment_date)}</span>{' '}
          at <span className="font-medium text-[#1a202c]">{appointment.time_slot}</span>?
        </p>
        <p className="text-xs text-[#64748b] bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          This action cannot be undone. To reschedule, you will need to book a new appointment.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Keep Appointment
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Cancelling…' : 'Yes, Cancel It'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
