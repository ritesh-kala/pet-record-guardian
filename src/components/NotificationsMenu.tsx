
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format, isBefore, addDays } from 'date-fns';
import { getAppointments, Appointment } from '@/lib/supabaseService';

const NotificationsMenu: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'upcoming' | 'overdue';
    title: string;
    description: string;
    date: Date;
    petId: string;
    appointmentId?: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all upcoming appointments
        const appointmentsData = await getAppointments();
        const now = new Date();
        const tomorrow = addDays(now, 1);
        const nextWeek = addDays(now, 7);
        
        const notificationsList: {
          id: string;
          type: 'upcoming' | 'overdue';
          title: string;
          description: string;
          date: Date;
          petId: string;
          appointmentId?: string;
        }[] = [];
        
        appointmentsData.forEach(appointment => {
          const appointmentDate = new Date(appointment.date);
          
          if (appointment.status === 'scheduled') {
            // Overdue appointments
            if (isBefore(appointmentDate, now) && appointment.status !== 'completed') {
              notificationsList.push({
                id: `overdue-${appointment.id}`,
                type: 'overdue',
                title: 'Missed Appointment',
                description: `Appointment for ${appointment.reason || 'checkup'} was missed`,
                date: appointmentDate,
                petId: appointment.pet_id,
                appointmentId: appointment.id,
              });
            }
            
            // Today's appointments
            else if (
              appointmentDate.getDate() === now.getDate() &&
              appointmentDate.getMonth() === now.getMonth() &&
              appointmentDate.getFullYear() === now.getFullYear()
            ) {
              notificationsList.push({
                id: `today-${appointment.id}`,
                type: 'upcoming',
                title: 'Appointment Today',
                description: `${appointment.reason || 'Appointment'} ${appointment.time ? `at ${appointment.time}` : 'today'}`,
                date: appointmentDate,
                petId: appointment.pet_id,
                appointmentId: appointment.id,
              });
            }
            
            // Tomorrow's appointments
            else if (
              appointmentDate.getDate() === tomorrow.getDate() &&
              appointmentDate.getMonth() === tomorrow.getMonth() &&
              appointmentDate.getFullYear() === tomorrow.getFullYear()
            ) {
              notificationsList.push({
                id: `tomorrow-${appointment.id}`,
                type: 'upcoming',
                title: 'Appointment Tomorrow',
                description: `${appointment.reason || 'Appointment'} ${appointment.time ? `at ${appointment.time}` : ''}`,
                date: appointmentDate,
                petId: appointment.pet_id,
                appointmentId: appointment.id,
              });
            }
            
            // Next 7 days appointments
            else if (
              appointmentDate > now &&
              appointmentDate <= nextWeek
            ) {
              notificationsList.push({
                id: `upcoming-${appointment.id}`,
                type: 'upcoming',
                title: 'Upcoming Appointment',
                description: `${appointment.reason || 'Appointment'} on ${format(appointmentDate, 'MMM d')}`,
                date: appointmentDate,
                petId: appointment.pet_id,
                appointmentId: appointment.id,
              });
            }
          }
        });
        
        // Sort notifications with overdue first, then by date
        notificationsList.sort((a, b) => {
          if (a.type === 'overdue' && b.type !== 'overdue') return -1;
          if (a.type !== 'overdue' && b.type === 'overdue') return 1;
          return a.date.getTime() - b.date.getTime();
        });
        
        setNotifications(notificationsList);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const navigateToAppointment = (appointmentId?: string) => {
    if (appointmentId) {
      navigate(`/appointments/${appointmentId}/edit`);
    } else {
      navigate('/calendar');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-medium">Notifications</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="h-3.5 w-3.5" />
            Calendar
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-pointer p-3 focus:bg-accent"
                onClick={() => navigateToAppointment(notification.appointmentId)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{notification.title}</span>
                    <Badge 
                      variant={notification.type === 'overdue' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {notification.type === 'overdue' ? 'Overdue' : 'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{notification.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(notification.date, 'PPP')}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-center text-muted-foreground"
              onClick={() => navigate('/calendar')}
            >
              View all in calendar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
