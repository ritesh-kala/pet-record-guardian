
import { supabase } from '@/integrations/supabase/client';

interface NotificationOptions {
  recipient: string;
  subject?: string;
  message: string;
  appointmentId?: string;
  petName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentReason?: string;
}

// This function would connect to a Supabase Edge Function that handles sending emails
export const sendEmailNotification = async (options: NotificationOptions): Promise<boolean> => {
  try {
    // In a real implementation, this would call a Supabase Edge Function
    console.log('Sending email notification:', options);
    
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

// This function would connect to a Supabase Edge Function that handles sending WhatsApp messages
export const sendWhatsAppNotification = async (options: NotificationOptions): Promise<boolean> => {
  try {
    // In a real implementation, this would call a Supabase Edge Function
    console.log('Sending WhatsApp notification:', options);
    
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    return false;
  }
};

// Convenience function to send both email and WhatsApp notifications
export const sendAppointmentReminder = async (options: NotificationOptions): Promise<{email: boolean, whatsapp: boolean}> => {
  const emailResult = await sendEmailNotification(options);
  const whatsappResult = await sendWhatsAppNotification(options);
  
  return {
    email: emailResult,
    whatsapp: whatsappResult
  };
};

// Function to send notification when an appointment is created
export const sendAppointmentCreationNotification = async (options: NotificationOptions): Promise<boolean> => {
  const emailResult = await sendEmailNotification({
    ...options,
    subject: 'New Appointment Scheduled',
    message: `Your appointment for ${options.petName} has been scheduled for ${options.appointmentDate} ${options.appointmentTime ? `at ${options.appointmentTime}` : ''}.`
  });
  
  return emailResult;
};

// Function to send appointment reminder (24 hours before)
export const sendAppointmentReminderNotification = async (options: NotificationOptions): Promise<boolean> => {
  const emailResult = await sendEmailNotification({
    ...options,
    subject: 'Appointment Reminder',
    message: `Reminder: You have an appointment for ${options.petName} tomorrow ${options.appointmentTime ? `at ${options.appointmentTime}` : ''} for ${options.appointmentReason || 'a checkup'}.`
  });
  
  return emailResult;
};

// Function to send missed appointment notification
export const sendMissedAppointmentNotification = async (options: NotificationOptions): Promise<boolean> => {
  const emailResult = await sendEmailNotification({
    ...options,
    subject: 'Missed Appointment',
    message: `You missed your appointment for ${options.petName} on ${options.appointmentDate} ${options.appointmentTime ? `at ${options.appointmentTime}` : ''}. Please contact us to reschedule.`
  });
  
  return emailResult;
};
