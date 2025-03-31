
import { supabase } from '@/integrations/supabase/client';

export interface NotificationOptions {
  recipient: string;
  subject?: string;
  message: string;
  appointmentId?: string;
  petName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentReason?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  appointment_id?: string;
  pet_id?: string;
  owner_id?: string;
  record_id?: string;
  appointment_date?: string;
}

// Function to fetch all notifications for the current user
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    // Simulating notifications for demo purposes
    // In a real implementation, this would fetch from a database
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: 'Appointment Reminder',
        message: 'You have an appointment for Max tomorrow at 10:00 AM',
        type: 'reminder',
        read: false,
        created_at: new Date().toISOString(),
        appointment_id: 'app123',
        pet_id: 'pet123',
        appointment_date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      },
      {
        id: '2',
        title: 'Vaccination Due',
        message: 'Bella is due for her annual vaccinations',
        type: 'update',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        pet_id: 'pet456',
      },
      {
        id: '3',
        title: 'Medical Record Updated',
        message: 'Charlie\'s medical record has been updated with new test results',
        type: 'update',
        read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        pet_id: 'pet789',
        record_id: 'rec123',
      }
    ];
    
    return demoNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would update a database record
    console.log(`Marking notification ${notificationId} as read`);
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
};

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
