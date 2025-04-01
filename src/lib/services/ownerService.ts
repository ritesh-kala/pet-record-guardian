
import { supabase } from '@/integrations/supabase/client';
import { Owner } from '../types';

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

export async function updateOwner(id: string, owner: Partial<Owner>): Promise<void> {
  const updateData = {
    name: owner.name,
    email: owner.email,
    phone: owner.phone,
    address: owner.address,
    notes: owner.notes,
    emergency_contact_name: owner.emergency_contact_name,
    emergency_contact_phone: owner.emergency_contact_phone,
    preferred_vet_name: owner.preferred_vet_name,
    preferred_vet_contact: owner.preferred_vet_contact,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('owners')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Error updating owner:", error);
    throw error;
  }
}
