
import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Types
export interface Owner {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  user_id: string;
  created_at?: string;
}

export interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight: string;
  date_of_birth?: string;
  microchip_id: string;
  insurance_provider: string;
  policy_number: string;
  notes: string;
  owner_id: string;
  user_id: string;
  created_at?: string;
}

export interface MedicalRecord {
  id?: string;
  type: string;
  date: string;
  description: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  status: string;
  pet_id: string;
  user_id: string;
  created_at?: string;
}

// Error handler
const handleError = (error: PostgrestError | null) => {
  if (error) {
    console.error('Database error:', error);
    throw new Error(error.message);
  }
};

// Owners
export const createOwner = async (ownerData: Omit<Owner, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('owners')
    .insert([ownerData])
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const getOwners = async (userId: string) => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  handleError(error);
  return data || [];
};

export const getOwnerById = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', ownerId)
    .single();
  
  handleError(error);
  
  if (!data) {
    throw new Error('Owner not found');
  }
  
  return data;
};

export const updateOwner = async (ownerId: string, ownerData: Partial<Owner>) => {
  const { data, error } = await supabase
    .from('owners')
    .update(ownerData)
    .eq('id', ownerId)
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const deleteOwner = async (ownerId: string) => {
  const { error } = await supabase
    .from('owners')
    .delete()
    .eq('id', ownerId);
  
  handleError(error);
  return true;
};

// Pets
export const createPet = async (petData: Omit<Pet, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('pets')
    .insert([petData])
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const getPets = async (userId: string, ownerId?: string) => {
  let query = supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId);
  
  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  handleError(error);
  return data || [];
};

export const getPetById = async (petId: string) => {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();
  
  handleError(error);
  
  if (!data) {
    throw new Error('Pet not found');
  }
  
  return data;
};

export const updatePet = async (petId: string, petData: Partial<Pet>) => {
  const { data, error } = await supabase
    .from('pets')
    .update(petData)
    .eq('id', petId)
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const deletePet = async (petId: string) => {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);
  
  handleError(error);
  return true;
};

// Medical Records
export const createMedicalRecord = async (recordData: Omit<MedicalRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('medical_records')
    .insert([recordData])
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const getMedicalRecords = async (userId: string, petId?: string) => {
  let query = supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userId);
  
  if (petId) {
    query = query.eq('pet_id', petId);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  handleError(error);
  return data || [];
};

export const getMedicalRecordById = async (recordId: string) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', recordId)
    .single();
  
  handleError(error);
  
  if (!data) {
    throw new Error('Medical record not found');
  }
  
  return data;
};

export const updateMedicalRecord = async (recordId: string, recordData: Partial<MedicalRecord>) => {
  const { data, error } = await supabase
    .from('medical_records')
    .update(recordData)
    .eq('id', recordId)
    .select()
    .single();
  
  handleError(error);
  return data;
};

export const deleteMedicalRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('medical_records')
    .delete()
    .eq('id', recordId);
  
  handleError(error);
  return true;
};
