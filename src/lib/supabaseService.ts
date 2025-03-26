
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
  dateOfBirth?: Timestamp | string | null;
  microchipId?: string | null;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  notes?: string | null;
  createdAt?: Date;
  ownerId: string;
}

export interface MedicalRecord {
  id?: string;
  petId: string;
  visitDate: string;
  reasonForVisit?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  prescriptions?: string[] | null;
  nextAppointment?: string | null;
  veterinarian?: string | null;
  notes?: string | null;
  createdAt?: Date;
  vaccinationsGiven?: string[] | null;
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

export async function createOwner(owner: Owner): Promise<{ id: string }> {
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
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) throw error;
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
  
  // Convert database fields to our interface
  return data?.map(pet => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: pet.weight,
    gender: pet.gender,
    dateOfBirth: pet.date_of_birth ? isoStringToTimestamp(pet.date_of_birth) : null,
    microchipId: pet.microchip_id,
    insuranceProvider: pet.insurance_provider,
    policyNumber: pet.policy_number,
    notes: pet.notes,
    createdAt: pet.created_at ? new Date(pet.created_at) : undefined,
    ownerId: pet.owner_id
  })) || [];
}

export async function getPetById(id: string): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pet not found');
  
  // Convert database fields to our interface
  return {
    id: data.id,
    name: data.name,
    species: data.species,
    breed: data.breed,
    age: data.age,
    weight: data.weight,
    gender: data.gender,
    dateOfBirth: data.date_of_birth ? isoStringToTimestamp(data.date_of_birth) : null,
    microchipId: data.microchip_id,
    insuranceProvider: data.insurance_provider,
    policyNumber: data.policy_number,
    notes: data.notes,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    ownerId: data.owner_id
  };
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
    date_of_birth: pet.dateOfBirth ? timestampToISOString(pet.dateOfBirth) : null,
    microchip_id: pet.microchipId,
    insurance_provider: pet.insuranceProvider,
    policy_number: pet.policyNumber,
    notes: pet.notes,
    owner_id: pet.ownerId,
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
  
  // Map database fields to our interface
  return data?.map(record => ({
    id: record.id,
    petId: record.pet_id,
    visitDate: record.visit_date,
    reasonForVisit: record.reason_for_visit,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescriptions: record.prescriptions,
    nextAppointment: record.next_appointment,
    veterinarian: record.veterinarian,
    notes: record.additional_notes,
    vaccinationsGiven: record.vaccinations_given,
    createdAt: record.created_at ? new Date(record.created_at) : undefined
  })) || [];
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Medical record not found');
  
  // Map database fields to our interface
  return {
    id: data.id,
    petId: data.pet_id,
    visitDate: data.visit_date,
    reasonForVisit: data.reason_for_visit,
    diagnosis: data.diagnosis,
    treatment: data.treatment,
    prescriptions: data.prescriptions,
    nextAppointment: data.next_appointment,
    veterinarian: data.veterinarian,
    notes: data.additional_notes,
    vaccinationsGiven: data.vaccinations_given,
    createdAt: data.created_at ? new Date(data.created_at) : undefined
  };
}

export async function createMedicalRecord(record: MedicalRecord): Promise<{ id: string }> {
  // Map our interface to database fields
  const recordData = {
    pet_id: record.petId,
    visit_date: record.visitDate,
    reason_for_visit: record.reasonForVisit,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescriptions: record.prescriptions,
    next_appointment: record.nextAppointment,
    veterinarian: record.veterinarian,
    additional_notes: record.notes,
    vaccinations_given: record.vaccinationsGiven,
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
