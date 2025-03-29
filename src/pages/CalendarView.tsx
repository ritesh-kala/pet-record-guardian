
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Calendar } from '@/components/ui/calendar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  getAppointments, 
  Appointment, 
  getMedicalRecords, 
  MedicalRecord,
  deleteAppointment,
  getPets,
  Pet
} from '@/lib/supabaseService';
import { 
  Loader2, 
  CalendarClock, 
  FilePlus, 
  PenSquare, 
  Calendar as CalendarIcon, 
  Trash2,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [dayMetadata, setDayMetadata] = useState<Map<string, DayMetadata>>(new Map());
  const [selectedDay, setSelectedDay] = useState<DayMetadata | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);
  const [petFilter, setPetFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'past'>('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
        
        const [appointmentsData, medicalRecordsData, petsData] = await Promise.all([
          getAppointments(petFilter || undefined),
          getMedicalRecords(),
          getPets()
        ]);
        
        setAppointments(appointmentsData);
        setMedicalRecords(medicalRecordsData);
        setPets(petsData);
        
        // Create day metadata
        const metadata = new Map<string, DayMetadata>();
        
        appointmentsData.forEach(appointment => {
          const dateKey = appointment.date;
          if (!metadata.has(dateKey)) {
            metadata.set(dateKey, {
              date: new Date(dateKey),
              appointments: [],
              medicalRecords: []
            });
          }
          metadata.get(dateKey)?.appointments.push(appointment);
        });
        
        medicalRecordsData.forEach(record => {
          const dateKey = record.visit_date;
          if (!metadata.has(dateKey)) {
            metadata.set(dateKey, {
              date: new Date(dateKey),
              appointments: [],
              medicalRecords: []
            });
          }
          metadata.get(dateKey)?.medicalRecords.push(record);
        });
        
        setDayMetadata(metadata);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load calendar data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [date, toast, petFilter]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayData = dayMetadata.get(dateKey);
    
    if (dayData) {
      setSelectedDay(dayData);
      setIsDialogOpen(true);
    } else {
      setSelectedDay({
        date: selectedDate,
        appointments: [],
        medicalRecords: []
      });
      setIsDialogOpen(true);
    }
  };

  const getDayMetadata = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return dayMetadata.get(dateKey);
  };

  const handleDeleteAppointment = async () => {
    if (!deleteAppointmentId) return;

    try {
      await deleteAppointment(deleteAppointmentId);
      
      // Update local state
      setAppointments(appointments.filter(a => a.id !== deleteAppointmentId));
      
      // If we're in the day view dialog, update the selected day's appointments as well
      if (selectedDay) {
        setSelectedDay({
          ...selectedDay,
          appointments: selectedDay.appointments.filter(a => a.id !== deleteAppointmentId)
        });
      }

      // Update the day metadata
      const updatedMetadata = new Map(dayMetadata);
      for (const [key, value] of updatedMetadata.entries()) {
        value.appointments = value.appointments.filter(a => a.id !== deleteAppointmentId);
        updatedMetadata.set(key, value);
      }
      setDayMetadata(updatedMetadata);

      toast({
        title: 'Appointment deleted',
        description: 'The appointment has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the appointment.',
        variant: 'destructive'
      });
    } finally {
      setDeleteAppointmentId(null);
    }
  };

  const handleScheduleNewAppointment = (petId: string | undefined, date: Date | undefined) => {
    if (!petId && pets.length > 0) {
      petId = pets[0].id;
    }
    
    if (!petId) {
      toast({
        title: 'No pets found',
        description: 'Please add a pet before scheduling appointments.',
        variant: 'destructive'
      });
      return;
    }
    
    let path = `/appointments/new?petId=${petId}`;
    if (date) {
      path += `&date=${format(date, 'yyyy-MM-dd')}`;
    }
    
    setIsDialogOpen(false);
    navigate(path);
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  const getBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      case 'missed': return 'default';
      default: return 'outline';
    }
  };

  // Filter appointments based on view mode
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (viewMode === 'upcoming') {
      return appointmentDate >= today && appointment.status === 'scheduled';
    } else if (viewMode === 'past') {
      return appointmentDate < today || appointment.status === 'completed' || appointment.status === 'canceled' || appointment.status === 'missed';
    }
    
    return true; // 'all' view
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader 
          title="Calendar" 
          description="View and manage appointments and medical records" 
          buttonText="Back"
          buttonLink="/medical-records"
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Click on a date to view details or schedule appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                      handleDateSelect(selectedDate);
                    }
                  }}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: (date) => {
                      const metadata = getDayMetadata(date);
                      return !!metadata && (
                        metadata.appointments.length > 0 || 
                        metadata.medicalRecords.length > 0
                      );
                    },
                    today: (date) => isToday(date)
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
                      fontWeight: 'bold'
                    },
                    today: {
                      border: '1px solid currentColor',
                      borderRadius: '100%'
                    }
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const metadata = getDayMetadata(date);
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {date.getDate()}
                          <div className="absolute bottom-0 flex gap-1 justify-center">
                            {metadata?.appointments.length ? (
                              <div className="h-1 w-1 bg-blue-500 rounded-full" />
                            ) : null}
                            {metadata?.medicalRecords.length ? (
                              <div className="h-1 w-1 bg-green-500 rounded-full" />
                            ) : null}
                          </div>
                        </div>
                      );
                    }
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-xs">Appointments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs">Medical Records</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                  Today
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Appointments</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleScheduleNewAppointment(undefined, undefined)}
                    >
                      <FilePlus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button 
                      size="sm" 
                      variant={viewMode === 'upcoming' ? 'default' : 'outline'} 
                      onClick={() => setViewMode('upcoming')}
                      className="whitespace-nowrap"
                    >
                      Upcoming
                    </Button>
                    <Button 
                      size="sm" 
                      variant={viewMode === 'past' ? 'default' : 'outline'} 
                      onClick={() => setViewMode('past')}
                      className="whitespace-nowrap"
                    >
                      Past
                    </Button>
                    <Button 
                      size="sm" 
                      variant={viewMode === 'all' ? 'default' : 'outline'} 
                      onClick={() => setViewMode('all')}
                      className="whitespace-nowrap"
                    >
                      All
                    </Button>
                  </div>
                </div>
                {pets.length > 1 && (
                  <Select value={petFilter} onValueChange={setPetFilter}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Filter by pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All pets</SelectItem>
                      {pets.map(pet => (
                        <SelectItem key={pet.id} value={pet.id || ''}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pr-1">
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all"
                        onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                          <Badge variant={getBadgeVariant(appointment.status)}>
                            {appointment.status || 'scheduled'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(new Date(appointment.date), 'PPP')}
                          {appointment.time && ` at ${appointment.time}`}
                        </div>
                        <div className="text-sm mt-1">
                          {getPetName(appointment.pet_id)}
                          {appointment.is_recurring && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild onClick={(e) => {
                              e.stopPropagation();
                              setDeleteAppointmentId(appointment.id);
                            }}>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this appointment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteAppointmentId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteAppointment();
                                }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/appointments/${appointment.id}/edit`);
                            }}
                          >
                            <PenSquare className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarClock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-muted-foreground">
                      {viewMode === 'upcoming' ? "No upcoming appointments" : 
                        viewMode === 'past' ? "No past appointments" : "No appointments found"}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleScheduleNewAppointment(undefined, undefined)}
                    >
                      Schedule New Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDay && format(selectedDay.date, 'PPPP')}
              </DialogTitle>
              <DialogDescription>
                Appointments and medical records for this day
              </DialogDescription>
            </DialogHeader>
            
            {selectedDay && (
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="appointments">
                    Appointments ({selectedDay.appointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="records">
                    Medical Records ({selectedDay.medicalRecords.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedDay.appointments.length === 0 && selectedDay.medicalRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No events on this day</p>
                      <Button 
                        onClick={() => handleScheduleNewAppointment(undefined, selectedDay.date)}
                      >
                        <FilePlus className="mr-2 h-4 w-4" />
                        Schedule Appointment
                      </Button>
                    </div>
                  ) : (
                    <>
                      {selectedDay.appointments.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Appointments</h3>
                          {selectedDay.appointments.map(appointment => (
                            <div
                              key={appointment.id}
                              className="mb-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => {
                                setIsDialogOpen(false);
                                navigate(`/appointments/${appointment.id}/edit`);
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                                <Badge variant={getBadgeVariant(appointment.status)}>
                                  {appointment.status || 'scheduled'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Pet:</span> {getPetName(appointment.pet_id)}
                              </div>
                              {appointment.time && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Time:</span> {appointment.time}
                                </div>
                              )}
                              {appointment.notes && (
                                <div className="text-sm mt-1">
                                  {appointment.notes}
                                </div>
                              )}
                              {appointment.is_recurring && (
                                <div className="mt-1">
                                  <Badge variant="outline">
                                    Recurring: {appointment.recurrence_pattern || 'custom'}
                                  </Badge>
                                </div>
                              )}
                              <div className="flex justify-end gap-2 mt-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteAppointmentId(appointment.id);
                                  }}>
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this appointment? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setDeleteAppointmentId(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteAppointment();
                                      }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDialogOpen(false);
                                    navigate(`/appointments/${appointment.id}/edit`);
                                  }}
                                >
                                  <PenSquare className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-center mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleScheduleNewAppointment(undefined, selectedDay.date)}
                            >
                              <FilePlus className="h-4 w-4 mr-1" />
                              Add Appointment
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {selectedDay.medicalRecords.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Medical Records</h3>
                          {selectedDay.medicalRecords.map(record => (
                            <div
                              key={record.id}
                              className="mb-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => {
                                setIsDialogOpen(false);
                                navigate(`/records/${record.id}`);
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium">{record.reason_for_visit || 'Medical Visit'}</h4>
                                {record.type && <Badge>{record.type}</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Pet:</span> {getPetName(record.pet_id)}
                              </div>
                              {record.veterinarian && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Vet:</span> {record.veterinarian}
                                </div>
                              )}
                              {record.diagnosis && (
                                <div className="text-sm mt-1">
                                  <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                </div>
                              )}
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDialogOpen(false);
                                    navigate(`/records/${record.id}/edit`);
                                  }}
                                >
                                  <PenSquare className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="appointments" className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedDay.appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No appointments on this day</p>
                      <Button onClick={() => handleScheduleNewAppointment(undefined, selectedDay.date)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Schedule Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDay.appointments.map(appointment => (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setIsDialogOpen(false);
                            navigate(`/appointments/${appointment.id}/edit`);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                            <Badge variant={getBadgeVariant(appointment.status)}>
                              {appointment.status || 'scheduled'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Pet:</span> {getPetName(appointment.pet_id)}
                          </div>
                          {appointment.time && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Time:</span> {appointment.time}
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="text-sm mt-1">
                              {appointment.notes}
                            </div>
                          )}
                          {appointment.is_recurring && (
                            <div className="mt-1">
                              <Badge variant="outline">
                                Recurring: {appointment.recurrence_pattern || 'custom'}
                              </Badge>
                            </div>
                          )}
                          <div className="flex justify-end gap-2 mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDialogOpen(false);
                                navigate(`/appointments/${appointment.id}/edit`);
                              }}
                            >
                              <PenSquare className="h-4 w-4 mr-1" />
                              Edit
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild onClick={(e) => {
                                e.stopPropagation();
                                setDeleteAppointmentId(appointment.id);
                              }}>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this appointment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteAppointmentId(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAppointment();
                                  }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center">
                        <Button 
                          variant="outline"
                          onClick={() => handleScheduleNewAppointment(undefined, selectedDay.date)}
                        >
                          <FilePlus className="mr-2 h-4 w-4" />
                          Add Appointment
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="records" className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedDay.medicalRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No medical records on this day</p>
                    </div>
                  ) : (
                    selectedDay.medicalRecords.map(record => (
                      <div
                        key={record.id}
                        className="mb-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setIsDialogOpen(false);
                          navigate(`/records/${record.id}`);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{record.reason_for_visit || 'Medical Visit'}</h4>
                          {record.type && <Badge>{record.type}</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Pet:</span> {getPetName(record.pet_id)}
                        </div>
                        {record.veterinarian && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Vet:</span> {record.veterinarian}
                          </div>
                        )}
                        {record.diagnosis && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </div>
                        )}
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDialogOpen(false);
                              navigate(`/records/${record.id}/edit`);
                            }}
                          >
                            <PenSquare className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              {selectedDay && (
                <Button 
                  onClick={() => handleScheduleNewAppointment(undefined, selectedDay.date)}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarView;
