
import { supabase } from './supabase';

// Types
export interface Owner {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Pet {
  id?: string;
  userId: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age?: string;
  weight?: string;
  gender?: string;
  dateOfBirth?: Timestamp | string;
  microchipId?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  notes?: string;
  createdAt?: Date;
}

export interface MedicalRecord {
  id?: string;
  userId: string;
  petId: string;
  type: string;
  description: string;
  date: Timestamp | string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  notes?: string;
  status: string;
  createdAt?: Date;
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
export async function getOwners(userId: string): Promise<Owner[]> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('userId', userId);

  if (error) throw error;
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
    .insert([{ ...owner, createdAt: new Date().toISOString() }])
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create owner');
  return { id: data.id };
}

// Pets
export async function getPets(userId: string, ownerId?: string): Promise<Pet[]> {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('userId', userId);

  if (ownerId) {
    query = query.eq('ownerId', ownerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Convert ISO string dates to Timestamp objects
  const petsWithTimestamps = data?.map(pet => {
    if (pet.dateOfBirth) {
      return {
        ...pet,
        dateOfBirth: isoStringToTimestamp(pet.dateOfBirth as string)
      };
    }
    return pet;
  }) || [];
  
  return petsWithTimestamps;
}

export async function getPetById(id: string): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pet not found');
  
  // Convert ISO string dates to Timestamp objects
  if (data.dateOfBirth) {
    data.dateOfBirth = isoStringToTimestamp(data.dateOfBirth as string);
  }
  
  return data;
}

export async function createPet(pet: Pet): Promise<{ id: string }> {
  // Convert Timestamp to ISO string
  let petData = { ...pet, createdAt: new Date().toISOString() };
  if (petData.dateOfBirth) {
    petData = {
      ...petData,
      dateOfBirth: timestampToISOString(petData.dateOfBirth)
    };
  }

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
export async function getMedicalRecords(userId: string, petId?: string): Promise<MedicalRecord[]> {
  let query = supabase
    .from('medical_records')
    .select('*')
    .eq('userId', userId);

  if (petId) {
    query = query.eq('petId', petId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Convert ISO string dates to Timestamp objects
  const recordsWithTimestamps = data?.map(record => {
    return {
      ...record,
      date: isoStringToTimestamp(record.date as string)
    };
  }) || [];
  
  return recordsWithTimestamps;
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Medical record not found');
  
  // Convert ISO string dates to Timestamp objects
  data.date = isoStringToTimestamp(data.date as string);
  
  return data;
}

export async function createMedicalRecord(record: MedicalRecord): Promise<{ id: string }> {
  // Convert Timestamp to ISO string
  const recordData = {
    ...record,
    date: timestampToISOString(record.date),
    createdAt: new Date().toISOString()
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
