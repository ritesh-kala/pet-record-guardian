
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '../types';

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
