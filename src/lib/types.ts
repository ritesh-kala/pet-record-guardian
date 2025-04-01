
import { supabase } from '@/integrations/supabase/client';

export interface Owner {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
  address?: string | null;
  notes?: string;
  createdAt?: Date;
  user_id?: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  preferred_vet_name?: string | null;
  preferred_vet_contact?: string | null;
}

export interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: string | null;
  date_of_birth?: Timestamp | string | null;
  microchip_id?: string | null;
  insurance_provider?: string | null;
  policy_number?: string | null;
  notes?: string | null;
  createdAt?: Date;
  owner_id: string;
  image_url?: string | null;
}

export type MedicalRecordType = 
  | 'Vaccination' 
  | 'Health Checkup' 
  | 'Treatment' 
  | 'Prescription' 
  | 'Allergy' 
  | 'Diagnostic Test'
  | 'Other';

export interface MedicalRecord {
  id?: string;
  pet_id: string;
  visit_date: string;
  reason_for_visit?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  prescriptions?: string[] | null;
  next_appointment?: string | null;
  veterinarian?: string | null;
  notes?: string | null;
  createdAt?: Date;
  vaccinations_given?: string[] | null;
  type?: MedicalRecordType | null;
}

export interface Appointment {
  id?: string;
  pet_id: string;
  date: string;
  time?: string | null;
  reason?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_end_date?: string | null;
  status?: 'scheduled' | 'completed' | 'canceled' | 'missed';
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id?: string;
  record_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number | null;
  description?: string | null;
  uploaded_at?: string | null;
}

export interface Medication {
  id?: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  instructions?: string | null;
  prescribing_vet?: string | null;
  refill_date?: string | null;
  refill_reminder?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  active?: boolean;
}

export interface MedicationLog {
  id?: string;
  medication_id: string;
  given_at: string;
  given_by?: string | null;
  notes?: string | null;
  skipped?: boolean;
  skip_reason?: string | null;
  created_at?: string;
}

export interface MedicationImage {
  id?: string;
  medication_id: string;
  image_url: string;
  description?: string | null;
  created_at?: string;
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000);
  }

  static now(): Timestamp {
    const now = Date.now();
    return new Timestamp(Math.floor(now / 1000), 0);
  }

  static fromDate(date: Date): Timestamp {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
}

export function timestampToISOString(timestamp: Timestamp | string): string {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return timestamp.toDate().toISOString();
}

export function isoStringToTimestamp(isoString: string): Timestamp {
  const date = new Date(isoString);
  return Timestamp.fromDate(date);
}
