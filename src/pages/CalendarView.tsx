
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isBefore, isAfter, isToday, addDays } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Plus, 
  ArrowLeft
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { supabase } from '@/integrations/supabase/client';

// Define the types locally since they're not available in types.ts
interface Owner {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  image_url?: string;
}

interface Appointment {
  id: string;
  pet_id: string;
  owner_id?: string;
  appointment_date: string;
  appointment_time?: string;
  reason?: string;
  notes?: string;
  status?: string;
}

type AppointmentWithDetails = Appointment & {
  pet?: Pet;
  owner?: Owner;
};

type AppointmentFilter = 'upcoming' | 'past' | 'all';

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const [appointmentCounts, setAppointmentCounts] = useState<{
    upcoming: number;
    past: number;
    all: number;
  }>({
    upcoming: 0,
    past: 0,
    all: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all pets 
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .order('name');

        if (petsError) throw petsError;
        setPets(petsData);

        // Fetch appointments with related data
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            pet:pet_id (id, name, species, breed, image_url),
            owner:owner_id (id, name, email, phone)
          `)
          .order('appointment_date', { ascending: false })
          .order('appointment_time', { ascending: false });

        if (error) throw error;

        // Cast the data to the correct type
        const appointmentsWithDetails = data as unknown as AppointmentWithDetails[];
        
        // Sort - newest first
        appointmentsWithDetails.sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00:00'}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00:00'}`);
          return dateB.getTime() - dateA.getTime();
        });
        
        setAppointments(appointmentsWithDetails);
        
        // Calculate appointment counts
        const now = new Date();
        const upcoming = appointmentsWithDetails.filter(app => {
          const appDate = parseISO(`${app.appointment_date}T${app.appointment_time || '00:00:00'}`);
          return isAfter(appDate, now) || isToday(appDate);
        }).length;
        
        const past = appointmentsWithDetails.filter(app => {
          const appDate = parseISO(`${app.appointment_date}T${app.appointment_time || '00:00:00'}`);
          return isBefore(appDate, now) && !isToday(appDate);
        }).length;
        
        setAppointmentCounts({
          upcoming,
          past,
          all: appointmentsWithDetails.length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAppointments = appointments
    .filter(appointment => {
      // Filter by pet if a specific pet is selected
      if (selectedPet !== 'all' && appointment.pet_id !== selectedPet) {
        return false;
      }
      
      // Filter by date status
      const appDate = parseISO(`${appointment.appointment_date}T${appointment.appointment_time || '00:00:00'}`);
      const now = new Date();
      
      if (filter === 'upcoming') {
        return isAfter(appDate, now) || isToday(appDate);
      } else if (filter === 'past') {
        return isBefore(appDate, now) && !isToday(appDate);
      }
      
      return true;
    });

  const getAppointmentsForDate = (selectedDate: Date) => {
    return appointments.filter(appointment => {
      const appDate = parseISO(appointment.appointment_date);
      return (
        appDate.getDate() === selectedDate.getDate() &&
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const selectedDateAppointments = getAppointmentsForDate(date);

  const getStatusBadge = (appointment: AppointmentWithDetails) => {
    const appDate = parseISO(`${appointment.appointment_date}T${appointment.appointment_time || '00:00:00'}`);
    const now = new Date();
    
    if (appointment.status === 'completed') {
      return <Badge variant="outline" className="bg-green-100">Completed</Badge>;
    } else if (appointment.status === 'cancelled') {
      return <Badge variant="outline" className="bg-red-100">Cancelled</Badge>;
    } else if (isBefore(appDate, now) && !isToday(appDate)) {
      return <Badge variant="outline" className="bg-amber-100">Overdue</Badge>;
    } else if (isToday(appDate)) {
      return <Badge variant="outline" className="bg-blue-100">Today</Badge>;
    } else if (isAfter(appDate, now) && isBefore(appDate, addDays(now, 3))) {
      return <Badge variant="outline" className="bg-purple-100">Soon</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getAppointmentTime = (appointment: AppointmentWithDetails) => {
    if (!appointment.appointment_time) return 'No time set';
    return format(parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`), 'h:mm a');
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as AppointmentFilter);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="gap-1 px-2" 
          onClick={() => navigate('/records')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <SectionHeader 
          title="Appointment Calendar" 
          description="Manage and view all scheduled appointments"
        />
        <Button 
          className="gap-1"
          onClick={() => navigate('/appointments/new')}
        >
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
            />
            
            <div className="mt-6 space-y-4">
              <div className="font-medium">
                {selectedDateAppointments.length > 0 ? (
                  <h3>
                    {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''} on {format(date, 'MMMM d, yyyy')}
                  </h3>
                ) : (
                  <h3>No appointments on {format(date, 'MMMM d, yyyy')}</h3>
                )}
              </div>
              
              {selectedDateAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-3 bg-accent/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{appointment.pet?.name || 'Unknown Pet'}</div>
                      <div className="text-sm text-muted-foreground">{getAppointmentTime(appointment)}</div>
                      <div className="text-sm text-muted-foreground">{appointment.reason}</div>
                    </div>
                    {getStatusBadge(appointment)}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>View and manage upcoming and past appointments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 pb-3">
              <div className="flex justify-between items-center">
                <Tabs 
                  value={filter} 
                  onValueChange={handleFilterChange} 
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">
                      Upcoming ({appointmentCounts.upcoming})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({appointmentCounts.past})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All ({appointmentCounts.all})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2 items-center">
                  <span className="text-sm">Filter by pet:</span>
                  <Select 
                    value={selectedPet} 
                    onValueChange={(value) => setSelectedPet(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Pets</SelectItem>
                        {pets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="border-t">
              {loading ? (
                <div className="p-6 text-center">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No appointments found with the current filters.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-accent/5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-accent/30 border">
                            {appointment.pet?.image_url ? (
                              <img 
                                src={appointment.pet.image_url} 
                                alt={appointment.pet?.name || 'Pet'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <CalendarIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{appointment.pet?.name || 'Unknown Pet'}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy')} · {getAppointmentTime(appointment)}
                            </div>
                            <div className="text-sm">{appointment.reason}</div>
                            {appointment.notes && (
                              <div className="text-sm text-muted-foreground mt-1">{appointment.notes}</div>
                            )}
                            <div className="flex gap-1 mt-2">
                              {getStatusBadge(appointment)}
                              {appointment.owner && (
                                <Badge variant="outline">
                                  Owner: {appointment.owner.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/appointments/${appointment.id}`)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                            >
                              Edit Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
