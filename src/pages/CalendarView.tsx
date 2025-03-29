
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  getAppointments, 
  Appointment, 
  getMedicalRecords, 
  MedicalRecord 
} from '@/lib/supabaseService';
import { Loader2, CalendarClock, FilePlus, PenSquare, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [dayMetadata, setDayMetadata] = useState<Map<string, DayMetadata>>(new Map());
  const [selectedDay, setSelectedDay] = useState<DayMetadata | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
        
        const [appointmentsData, medicalRecordsData] = await Promise.all([
          getAppointments(undefined, startDate, endDate),
          getMedicalRecords()
        ]);
        
        setAppointments(appointmentsData);
        setMedicalRecords(medicalRecordsData);
        
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
  }, [date, toast]);

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

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader 
          title="Calendar" 
          description="View appointments and medical records" 
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
                  Click on a date to view details
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
                    }
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
                      fontWeight: 'bold'
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
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Next 10 scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 10)
                  .map(appointment => (
                    <div
                      key={appointment.id}
                      className="mb-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                        <Badge variant={
                          appointment.status === 'scheduled' ? 'outline' :
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'canceled' ? 'destructive' : 'secondary'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(new Date(appointment.date), 'PPP')}
                        {appointment.time && ` at ${appointment.time}`}
                      </div>
                    </div>
                  ))}
                {appointments.filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date()).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarClock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate('/pets')}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Schedule New Appointment
                </Button>
              </CardFooter>
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
                      <p className="text-muted-foreground">No events on this day</p>
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
                                <Badge variant={
                                  appointment.status === 'scheduled' ? 'outline' :
                                  appointment.status === 'completed' ? 'success' :
                                  appointment.status === 'canceled' ? 'destructive' : 'secondary'
                                }>
                                  {appointment.status}
                                </Badge>
                              </div>
                              {appointment.time && (
                                <div className="text-sm text-muted-foreground">
                                  Time: {appointment.time}
                                </div>
                              )}
                              {appointment.notes && (
                                <div className="text-sm mt-1">
                                  {appointment.notes}
                                </div>
                              )}
                              <div className="flex justify-end mt-2">
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
                              {record.veterinarian && (
                                <div className="text-sm text-muted-foreground">
                                  Vet: {record.veterinarian}
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
                      <p className="text-muted-foreground">No appointments on this day</p>
                    </div>
                  ) : (
                    selectedDay.appointments.map(appointment => (
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
                          <Badge variant={
                            appointment.status === 'scheduled' ? 'outline' :
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'canceled' ? 'destructive' : 'secondary'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.time && (
                          <div className="text-sm text-muted-foreground">
                            Time: {appointment.time}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="text-sm mt-1">
                            {appointment.notes}
                          </div>
                        )}
                        <div className="flex justify-end mt-2">
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
                    ))
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
                        {record.veterinarian && (
                          <div className="text-sm text-muted-foreground">
                            Vet: {record.veterinarian}
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
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarView;
