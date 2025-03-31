import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Calendar as CalendarIcon, Clock, Edit, Trash2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAppointments, getMedicalRecords, getPets, deleteAppointment, Appointment, MedicalRecord, Pet } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';

interface DayMetadata {
  date: Date;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
}

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayMetadata | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [appointmentView, setAppointmentView] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [appointmentsData, medicalRecordsData, petsData] = await Promise.all([
          getAppointments(),
          getMedicalRecords(),
          getPets()
        ]);
        
        setAppointments(appointmentsData);
        setMedicalRecords(medicalRecordsData);
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    const dayMetadataMap = new Map<string, DayMetadata>();
    
    appointments.forEach(appointment => {
      const appointmentDate = format(new Date(appointment.date), 'yyyy-MM-dd');
      if (!dayMetadataMap.has(appointmentDate)) {
        dayMetadataMap.set(appointmentDate, {
          date: new Date(appointment.date),
          appointments: [],
          medicalRecords: []
        });
      }
      dayMetadataMap.get(appointmentDate)?.appointments.push(appointment);
    });
    
    medicalRecords.forEach(record => {
      const recordDate = format(new Date(record.visit_date), 'yyyy-MM-dd');
      if (!dayMetadataMap.has(recordDate)) {
        dayMetadataMap.set(recordDate, {
          date: new Date(record.visit_date),
          appointments: [],
          medicalRecords: []
        });
      }
      dayMetadataMap.get(recordDate)?.medicalRecords.push(record);
    });
    
    setDayMetadata(dayMetadataMap);
  }, [appointments, medicalRecords]);

  const [dayMetadata, setDayMetadata] = useState(new Map<string, DayMetadata>());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const metadata = dayMetadata.get(dateStr);
    
    if (metadata) {
      setSelectedDay({
        date: selectedDate,
        appointments: metadata.appointments,
        medicalRecords: metadata.medicalRecords
      });
    } else {
      setSelectedDay({
        date: selectedDate,
        appointments: [],
        medicalRecords: []
      });
    }
  };

  const getAppointmentStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      case 'missed': return 'default';
      default: return 'outline';
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentToDelete));
        toast({
          title: 'Success',
          description: 'Appointment deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete appointment',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setAppointmentToDelete(null);
        setSelectedDay(null);
      }
    }
  };

  // Filter appointments based on view mode
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentView === 'upcoming') {
      return appointmentDate >= today;
    } else if (appointmentView === 'past') {
      return appointmentDate < today;
    }
    
    return true; // 'all' view
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader 
          title="Calendar" 
          description="View and manage appointments and medical records" 
          buttonText="Back"
          buttonLink="/records"
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Appointment Calendar</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/calendar?view=month')}
                    className="gap-1"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Month View
                  </Button>
                </div>
                
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return dayMetadata.has(dateStr) && (
                        dayMetadata.get(dateStr)?.appointments.length > 0 ||
                        dayMetadata.get(dateStr)?.medicalRecords.length > 0
                      );
                    },
                    today: isToday
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fontWeight: 'bold'
                    },
                    today: {
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: '2px'
                    }
                  }}
                />
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/appointments/new')}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Appointment
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/records/new')}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Medical Record
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium mb-4">Appointments</h3>
                  
                  <Tabs defaultValue="upcoming" value={appointmentView} onValueChange={setAppointmentView}>
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                      <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming" className="space-y-3">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{appointment.reason || 'Appointment'}</span>
                              <Badge variant={getAppointmentStatusVariant(appointment.status || 'scheduled')}>
                                {appointment.status || 'scheduled'}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {pets.find(p => p.id === appointment.pet_id)?.name || 'Unknown pet'}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1 inline" />
                                {format(new Date(appointment.date), 'MMM d, yyyy')}
                                {appointment.time && ` • ${appointment.time}`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No upcoming appointments</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate('/appointments/new')}
                          >
                            Schedule an appointment
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past" className="space-y-3">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{appointment.reason || 'Appointment'}</span>
                              <Badge variant={getAppointmentStatusVariant(appointment.status || 'scheduled')}>
                                {appointment.status || 'scheduled'}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {pets.find(p => p.id === appointment.pet_id)?.name || 'Unknown pet'}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1 inline" />
                                {format(new Date(appointment.date), 'MMM d, yyyy')}
                                {appointment.time && ` • ${appointment.time}`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No past appointments</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all" className="space-y-3">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{appointment.reason || 'Appointment'}</span>
                              <Badge variant={getAppointmentStatusVariant(appointment.status || 'scheduled')}>
                                {appointment.status || 'scheduled'}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {pets.find(p => p.id === appointment.pet_id)?.name || 'Unknown pet'}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1 inline" />
                                {format(new Date(appointment.date), 'MMM d, yyyy')}
                                {appointment.time && ` • ${appointment.time}`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No appointments found</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate('/appointments/new')}
                          >
                            Schedule an appointment
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Day Dialog */}
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedDay ? format(selectedDay.date, 'PPP') : 'Select a day'}</DialogTitle>
              <DialogDescription>
                {selectedDay ? (
                  <>
                    <h4 className="mb-2 font-semibold">Appointments:</h4>
                    {selectedDay.appointments.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedDay.appointments.map(appointment => (
                          <li key={appointment.id} className="flex items-center justify-between">
                            {appointment.reason || 'Appointment'}
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteAppointment(appointment.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No appointments for this day.</p>
                    )}
                    
                    <h4 className="mt-4 font-semibold">Medical Records:</h4>
                    {selectedDay.medicalRecords.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedDay.medicalRecords.map(record => (
                          <li key={record.id}>
                            {record.reason_for_visit || 'Medical Record'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No medical records for this day.</p>
                    )}
                  </>
                ) : (
                  'Select a day to view appointments and medical records.'
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the appointment from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAppointment}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default CalendarView;
