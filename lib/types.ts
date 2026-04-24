export type Specialty =
  | 'Oncology'
  | 'Pulmonology'
  | 'Cardiology'
  | 'Internal Medicine'
  | 'Family Medicine';

export type ClinicCity = 'New York' | 'London' | 'Dubai';
export type AppointmentStatus = 'confirmed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  bio: string | null;
  location: ClinicCity;
  avatar_color: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  time_slot: string;
  location: ClinicCity;
  status: AppointmentStatus;
  created_at: string;
  doctor?: Doctor;
}

export interface ClinicLocation {
  city: ClinicCity;
  address: string;
  phone: string;
  hours_weekday: string;
  hours_saturday: string;
  timezone: string;
}

export interface BookingFormData {
  doctor: Doctor | null;
  date: string | null;
  timeSlot: string | null;
  patientPhone: string;
}

export interface DoctorWithFee {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  consultation_fee: number;
  is_available: boolean;
  experience_years: number | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  is_admin?: boolean;
  is_blocked?: boolean;
  push_token?: string | null;
  appointment_count?: number;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  target: string;
  sent_by: string | null;
  sent_at: string;
}
