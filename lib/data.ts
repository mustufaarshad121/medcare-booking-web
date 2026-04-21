import type { ClinicLocation, Specialty } from './types';

export const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    city: 'New York',
    address: '850 Third Avenue, Suite 1200, New York, NY 10022',
    phone: '+1 (212) 555-0192',
    hours_weekday: 'Mon–Fri: 8:00 AM – 6:00 PM',
    hours_saturday: 'Sat: 9:00 AM – 2:00 PM',
    timezone: 'Eastern Time (ET)',
  },
  {
    city: 'London',
    address: '10 Harley Street, London W1G 9PF',
    phone: '+44 20 7580 4400',
    hours_weekday: 'Mon–Fri: 8:00 AM – 6:00 PM',
    hours_saturday: 'Sat: 9:00 AM – 2:00 PM',
    timezone: 'Greenwich Mean Time (GMT)',
  },
  {
    city: 'Dubai',
    address: 'Dubai Healthcare City, Al Razi Medical Complex, Building 64, Level 3',
    phone: '+971 4 362 0000',
    hours_weekday: 'Mon–Fri: 8:00 AM – 6:00 PM',
    hours_saturday: 'Sat: 9:00 AM – 2:00 PM',
    timezone: 'Gulf Standard Time (GST)',
  },
];

const WEEKDAY_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const SATURDAY_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
];

export function getTimeSlots(dateStr: string): string[] {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  if (day === 0) return [];
  if (day === 6) return SATURDAY_SLOTS;
  return WEEKDAY_SLOTS;
}

export const SPECIALTIES: Specialty[] = [
  'Oncology',
  'Pulmonology',
  'Cardiology',
  'Internal Medicine',
  'Family Medicine',
];

export function getInitials(name: string): string {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getMaxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
