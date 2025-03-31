
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format, isPast, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getAllNotifications, markNotificationAsRead } from '@/lib/notificationService';
import { Notification } from '@/integrations/supabase/types';

const NotificationsMenu: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await getAllNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Navigate based on notification type
      if (notification.appointment_id) {
        // For appointment-related notifications
        if (notification.type === 'scheduled') {
          navigate(`/calendar`);
        } else if (notification.type === 'reminder') {
          navigate(`/calendar`);
        } else {
          navigate(`/calendar`);
        }
      } else if (notification.pet_id) {
        // Pet-related notifications
        navigate(`/pets/${notification.pet_id}`);
      } else if (notification.owner_id) {
        // Owner-related notifications
        navigate(`/owners/${notification.owner_id}`);
      } else if (notification.record_id) {
        // Medical record notifications
        navigate(`/records/${notification.record_id}`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process notification",
      });
    }
  };

  const getNotificationIcon = (type: string, date?: string) => {
    if (date && isPast(parseISO(date))) {
      return '⏰';
    }
    
    switch (type) {
      case 'scheduled':
        return '📅';
      case 'reminder':
        return '🔔';
      case 'update':
        return '📝';
      default:
        return '📌';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${!notification.read ? 'bg-secondary/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-2 w-full">
                  <div className="flex-shrink-0 text-xl">
                    {getNotificationIcon(notification.type, notification.appointment_date)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    {notification.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(notification.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
