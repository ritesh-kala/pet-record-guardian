
import { supabase } from '@/integrations/supabase/client';
import { MedicalRecord, Attachment } from '../types';

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
    created_at: new Date().toISOString(),
    record_type: record.type
  };

  console.log("Creating medical record with data:", recordData);

  const { data, error } = await supabase
    .from('medical_records')
    .insert([recordData])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating medical record:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create medical record');
  return { id: data.id };
}

export async function updateMedicalRecord(id: string, record: Partial<MedicalRecord>): Promise<void> {
  const recordData = {
    visit_date: record.visit_date,
    reason_for_visit: record.reason_for_visit,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    prescriptions: record.prescriptions,
    next_appointment: record.next_appointment,
    veterinarian: record.veterinarian,
    additional_notes: record.notes,
    vaccinations_given: record.vaccinations_given,
    updated_at: new Date().toISOString(),
    record_type: record.type
  };

  Object.keys(recordData).forEach(key => {
    if (recordData[key as keyof typeof recordData] === undefined) {
      delete recordData[key as keyof typeof recordData];
    }
  });

  const { error } = await supabase
    .from('medical_records')
    .update(recordData)
    .eq('id', id);

  if (error) {
    console.error("Error updating medical record:", error);
    throw error;
  }
}

export async function getAttachmentsByRecordId(recordId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('record_id', recordId);

  if (error) throw error;
  
  const attachments: Attachment[] = data?.map(item => {
    const attachment: Attachment = {
      id: item.id,
      record_id: item.record_id,
      file_name: 'Unknown file',
      file_url: item.file_url,
      file_type: 'application/octet-stream',
      file_size: null,
      description: item.description,
      uploaded_at: item.created_at
    };
    
    return attachment;
  }) || [];
  
  return attachments;
}

export async function createAttachment(attachment: Attachment): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('attachments')
    .insert([{
      record_id: attachment.record_id,
      file_name: attachment.file_name,
      file_url: attachment.file_url,
      file_type: attachment.file_type,
      file_size: attachment.file_size,
      description: attachment.description
    }])
    .select('id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create attachment');
  return { id: data.id };
}

export async function deleteAttachment(id: string): Promise<void> {
  const { error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadAttachmentFile(file: File, recordId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${recordId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('medical_attachments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('medical_attachments')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
