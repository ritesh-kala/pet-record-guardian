
import { supabase } from '@/integrations/supabase/client';
import { Pet, timestampToISOString } from '../types';

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
  const petData = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age ? Number(pet.age) : null,
    weight: pet.weight ? Number(pet.weight) : null,
    gender: pet.gender,
    date_of_birth: pet.date_of_birth ? timestampToISOString(pet.date_of_birth) : null,
    microchip_id: pet.microchip_id,
    insurance_provider: pet.insurance_provider,
    policy_number: pet.policy_number,
    notes: pet.notes,
    owner_id: pet.owner_id,
    created_at: new Date().toISOString(),
    image_url: pet.image_url
  };

  console.log("Creating pet with data:", petData);

  const { data, error } = await supabase
    .from('pets')
    .insert([petData])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating pet:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create pet');
  return { id: data.id };
}

export async function updatePet(id: string, pet: Partial<Pet>): Promise<void> {
  const petData = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age !== undefined ? Number(pet.age) : undefined,
    weight: pet.weight !== undefined ? Number(pet.weight) : undefined,
    gender: pet.gender,
    date_of_birth: pet.date_of_birth ? timestampToISOString(pet.date_of_birth) : undefined,
    microchip_id: pet.microchip_id,
    insurance_provider: pet.insurance_provider,
    policy_number: pet.policy_number,
    notes: pet.notes,
    updated_at: new Date().toISOString()
  };

  Object.keys(petData).forEach(key => {
    if (petData[key as keyof typeof petData] === undefined) {
      delete petData[key as keyof typeof petData];
    }
  });

  const { error } = await supabase
    .from('pets')
    .update(petData)
    .eq('id', id);

  if (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
}
