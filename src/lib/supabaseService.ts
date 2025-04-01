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

export async function getAppointments(petId?: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select('*');

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  const appointments: Appointment[] = data?.map(item => ({
    id: item.id,
    pet_id: item.pet_id || '',
    date: item.date,
    time: item.time,
    reason: item.reason,
    notes: item.notes,
    is_recurring: item.is_recurring || false,
    recurrence_pattern: (item.recurrence_pattern as 'daily' | 'weekly' | 'monthly' | 'yearly' | null) || null,
    recurrence_end_date: item.recurrence_end_date,
    status: (item.status as 'scheduled' | 'completed' | 'canceled' | 'missed'),
    created_at: item.created_at,
    updated_at: item.updated_at
  })) || [];
  
  return appointments;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Appointment not found');
  
  return data as Appointment;
}

export async function createAppointment(appointment: Appointment): Promise<{ id: string }> {
  const appointmentData = {
    pet_id: appointment.pet_id,
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
    notes: appointment.notes,
    is_recurring: appointment.is_recurring || false,
    recurrence_pattern: appointment.recurrence_pattern,
    recurrence_end_date: appointment.recurrence_end_date,
    status: appointment.status || 'scheduled',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select('id')
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
  
  if (!data) throw new Error('Failed to create appointment');
  return { id: data.id };
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
  const appointmentData = {
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
    notes: appointment.notes,
    is_recurring: appointment.is_recurring,
    recurrence_pattern: appointment.recurrence_pattern,
    recurrence_end_date: appointment.recurrence_end_date,
    status: appointment.status,
    updated_at: new Date().toISOString()
  };

  Object.keys(appointmentData).forEach(key => {
    if (appointmentData[key as keyof typeof appointmentData] === undefined) {
      delete appointmentData[key as keyof typeof appointmentData];
    }
  });

  const { error } = await supabase
    .from('appointments')
    .update(appointmentData)
    .eq('id', id);

  if (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting appointment:", error);
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
