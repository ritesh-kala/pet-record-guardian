
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Owner {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
  address?: string | null;
  notes?: string;
  createdAt?: Date;
  user_id?: string;
  // These fields match columns from the Supabase database
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
}

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
}

// Timestamp helper class to mimic Firebase's Timestamp
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

// Converting Timestamp to string for Supabase and vice versa
function timestampToISOString(timestamp: Timestamp | string): string {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return timestamp.toDate().toISOString();
}

function isoStringToTimestamp(isoString: string): Timestamp {
  const date = new Date(isoString);
  return Timestamp.fromDate(date);
}

// Owners
export async function getOwners(): Promise<Owner[]> {
  const { data, error } = await supabase
    .from('owners')
    .select('*');

  if (error) {
    console.error("Error fetching owners:", error);
    throw error;
  }
  return data || [];
}

export async function getOwnerById(id: string): Promise<Owner> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Owner not found');
  return data;
}

export async function getUserOwner(): Promise<Owner | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;
  
  const userId = sessionData.session.user.id;
  
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching user owner:", error);
    throw error;
  }
  
  return data;
}

export async function createOwner(owner: Owner): Promise<{ id: string }> {
  // Get the current user ID if not provided
  if (!owner.user_id) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      owner.user_id = sessionData.session.user.id;
    }
  }

  const { data, error } = await supabase
    .from('owners')
    .insert([{ 
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      emergency_contact_name: owner.emergency_contact_name,
      emergency_contact_phone: owner.emergency_contact_phone,
      preferred_vet_name: owner.preferred_vet_name,
      preferred_vet_contact: owner.preferred_vet_contact,
      user_id: owner.user_id,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create owner');
  return { id: data.id };
}

// Pets
export async function getPets(ownerId?: string): Promise<Pet[]> {
  let query = supabase
    .from('pets')
    .select('*');

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
}

export async function getPetById(id: string): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pet not found');
  
  return data as Pet;
}

export async function createPet(pet: Pet): Promise<{ id: string }> {
  // Map our interface to database fields
  const petData = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    gender: pet.gender,
    date_of_birth: pet.date_of_birth ? timestampToISOString(pet.date_of_birth) : null,
    microchip_id: pet.microchip_id,
    insurance_provider: pet.insurance_provider,
    policy_number: pet.policy_number,
    notes: pet.notes,
    owner_id: pet.owner_id,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('pets')
    .insert([petData])
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create pet');
  return { id: data.id };
}

// Medical Records
export async function getMedicalRecords(petId?: string): Promise<MedicalRecord[]> {
  let query = supabase
    .from('medical_records')
    .select('*');

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data || [];
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Medical record not found');
  
  return data as MedicalRecord;
}

export async function createMedicalRecord(record: MedicalRecord): Promise<{ id: string }> {
  // Map our interface to database fields
  const recordData = {
    pet_id: record.pet_id,
    visit_date: record.visit_date,
    reason_for_visit: record.reason_for_visit,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescriptions: record.prescriptions,
    next_appointment: record.next_appointment,
    veterinarian: record.veterinarian,
    additional_notes: record.notes,
    vaccinations_given: record.vaccinations_given,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('medical_records')
    .insert([recordData])
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create medical record');
  return { id: data.id };
}
