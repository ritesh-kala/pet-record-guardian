
import { supabase } from '@/integrations/supabase/client';
import { Medication, MedicationLog, MedicationImage } from '../types';

export async function getMedicationsByPetId(petId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching medications:", error);
    throw error;
  }
  
  return data || [];
}

export async function getActiveMedicationsByPetId(petId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('pet_id', petId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching active medications:", error);
    throw error;
  }
  
  return data || [];
}

export async function getMedicationById(id: string): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching medication:", error);
    throw error;
  }
  
  if (!data) throw new Error('Medication not found');
  return data;
}

export async function createMedication(medication: Medication): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('medications')
    .insert([{
      pet_id: medication.pet_id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date,
      end_date: medication.end_date,
      instructions: medication.instructions,
      prescribing_vet: medication.prescribing_vet,
      refill_date: medication.refill_date,
      refill_reminder: medication.refill_reminder || false,
      notes: medication.notes,
      active: medication.active || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating medication:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create medication');
  return { id: data.id };
}

export async function updateMedication(id: string, medication: Partial<Medication>): Promise<void> {
  const updateData = {
    ...medication,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('medications')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
}

export async function getMedicationLogsByMedicationId(medicationId: string): Promise<MedicationLog[]> {
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .order('given_at', { ascending: false });

  if (error) {
    console.error("Error fetching medication logs:", error);
    throw error;
  }
  
  return data || [];
}

export async function createMedicationLog(log: MedicationLog): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('medication_logs')
    .insert([{
      medication_id: log.medication_id,
      given_at: log.given_at || new Date().toISOString(),
      given_by: log.given_by,
      notes: log.notes,
      skipped: log.skipped || false,
      skip_reason: log.skip_reason,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating medication log:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create medication log');
  return { id: data.id };
}

export async function updateMedicationLog(id: string, log: Partial<MedicationLog>): Promise<void> {
  const { error } = await supabase
    .from('medication_logs')
    .update(log)
    .eq('id', id);

  if (error) {
    console.error("Error updating medication log:", error);
    throw error;
  }
}

export async function deleteMedicationLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('medication_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting medication log:", error);
    throw error;
  }
}

export async function getMedicationImagesByMedicationId(medicationId: string): Promise<MedicationImage[]> {
  const { data, error } = await supabase
    .from('medication_images')
    .select('*')
    .eq('medication_id', medicationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching medication images:", error);
    throw error;
  }
  
  return data || [];
}

export async function createMedicationImage(image: MedicationImage): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('medication_images')
    .insert([{
      medication_id: image.medication_id,
      image_url: image.image_url,
      description: image.description,
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating medication image:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create medication image');
  return { id: data.id };
}

export async function deleteMedicationImage(id: string): Promise<void> {
  const { error } = await supabase
    .from('medication_images')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting medication image:", error);
    throw error;
  }
}

export async function uploadMedicationImage(file: File, medicationId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${medicationId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('medication_images')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading medication image:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('medication_images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function getRecentMedicationLogsByPetId(petId: string, limit: number = 5): Promise<any[]> {
  const { data, error } = await supabase
    .from('medication_logs')
    .select(`
      id,
      given_at,
      given_by,
      notes,
      skipped,
      skip_reason,
      medications (
        id,
        name,
        dosage,
        pet_id
      )
    `)
    .eq('medications.pet_id', petId)
    .order('given_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent medication logs:", error);
    throw error;
  }
  
  return data || [];
}

export async function getDueMedicationsByPetId(petId: string): Promise<Medication[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('pet_id', petId)
    .eq('active', true)
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  if (error) {
    console.error("Error fetching due medications:", error);
    throw error;
  }
  
  return data || [];
}

export async function getMedicationsNeedingRefill(petId: string, daysThreshold: number = 7): Promise<Medication[]> {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);
  
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('pet_id', petId)
    .eq('active', true)
    .lte('refill_date', thresholdDate.toISOString().split('T')[0])
    .gte('refill_date', today.toISOString().split('T')[0]);

  if (error) {
    console.error("Error fetching medications needing refill:", error);
    throw error;
  }
  
  return data || [];
}
