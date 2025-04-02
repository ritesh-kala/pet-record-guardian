import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  Clock, 
  Edit, 
  FileText, 
  Loader2, 
  MoreVertical, 
  Plus, 
  PlusCircle, 
  Trash2,
  Info,
  Heart,
  Calendar,
  Pill,
  IndianRupee
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPetById, getMedicalRecords, getAppointments, deleteAppointment, Appointment, getOwnerById } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import PetDetailTabs from '@/components/ui-components/PetDetailTabs';

const PawPrint = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="4" r="2"/>
    <circle cx="18" cy="8" r="2"/>
    <circle cx="4" cy="18" r="2"/>
    <circle cx="18" cy="18" r="2"/>
    <circle cx="4" cy="8" r="2"/>
    <path d="M13 10l7 10"/>
    <path d="M4 10l7 10"/>
  </svg>
);

const Trash = () => <Trash2 />;

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pet, setPet] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch pet data
        const petData = await getPetById(id);
        setPet(petData);
        
        // Fetch pet owner
        if (petData.owner_id) {
          const ownerData = await getOwnerById(petData.owner_id);
          setOwner(ownerData);
        }
        
        // Fetch medical records
        const records = await getMedicalRecords(id);
        setMedicalRecords(records);
        
        // Fetch appointments
        const appointmentsData = await getAppointments(id);
        setAppointments(appointmentsData);
        
      } catch (error) {
        console.error('Error fetching pet details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pet details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);
  
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
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
    }
  };
  
  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'completed':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      case 'missed':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (!pet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Pet Not Found</h2>
          <p className="mt-2 text-muted-foreground">The pet you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate('/pets')}>
            Back to Pets
          </Button>
        </div>
      </Layout>
    );
  }
  
  const petAge = pet.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(pet.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : pet.age || 'Unknown';
    
  const sortedMedicalRecords = [...medicalRecords].sort((a, b) => 
    new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
  );
  
  const upcomingAppointments = appointments
    .filter(appointment => appointment.status === 'scheduled' && new Date(appointment.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const pastAppointments = appointments
    .filter(appointment => appointment.status !== 'scheduled' || new Date(appointment.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              {pet.image_url ? (
                <AvatarImage src={pet.image_url} alt={pet.name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-muted">
                  <PawPrint />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold">{pet.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Badge variant="outline">{pet.species}</Badge>
                {pet.breed && <Badge variant="outline">{pet.breed}</Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none"
              onClick={() => navigate(`/pets/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Pet
            </Button>
            <Button 
              className="flex-1 md:flex-none"
              onClick={() => navigate(`/records/new?petId=${id}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>
        
        <PetDetailTabs petId={id || ''} activeTab={activeTab} />
        
        {/* Pet Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Pet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Species</p>
                    <p className="font-medium">{pet.species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Breed</p>
                    <p className="font-medium">{pet.breed || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{petAge} {petAge === 1 ? 'year' : 'years'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{pet.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Birth Date</p>
                    <p className="font-medium">
                      {pet.date_of_birth ? format(new Date(pet.date_of_birth), 'PP') : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Microchip ID</h3>
                  <p className="font-medium">{pet.microchip_id || 'No microchip information'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Insurance</h3>
                  {pet.insurance_provider ? (
                    <div>
                      <p className="font-medium">{pet.insurance_provider}</p>
                      {pet.policy_number && <p className="text-sm">Policy: {pet.policy_number}</p>}
                    </div>
                  ) : (
                    <p>No insurance information</p>
                  )}
                </div>
                
                {pet.notes && (
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Additional Notes</h3>
                    <p>{pet.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {owner ? (
                  <>
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-1">Name</h3>
                      <p className="font-medium">{owner.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-1">Contact</h3>
                      <p className="font-medium">{owner.email}</p>
                      {owner.phone && <p>{owner.phone}</p>}
                    </div>
                    
                    {owner.address && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Address</h3>
                        <p>{owner.address}</p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {(owner.emergency_contact_name || owner.emergency_contact_phone) && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Emergency Contact</h3>
                        {owner.emergency_contact_name && (
                          <p className="font-medium">{owner.emergency_contact_name}</p>
                        )}
                        {owner.emergency_contact_phone && (
                          <p>{owner.emergency_contact_phone}</p>
                        )}
                      </div>
                    )}
                    
                    {(owner.preferred_vet_name || owner.preferred_vet_contact) && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Preferred Veterinarian</h3>
                        {owner.preferred_vet_name && (
                          <p className="font-medium">{owner.preferred_vet_name}</p>
                        )}
                        {owner.preferred_vet_contact && (
                          <p>{owner.preferred_vet_contact}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No owner information available</p>
                  </div>
                )}
              </CardContent>
              {owner && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/owners/${owner.id}`)}>
                    View Owner Profile
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
        
        {/* Health Records Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <Button onClick={() => navigate(`/records/new?petId=${id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Record
            </Button>
          </div>
          
          {sortedMedicalRecords.length > 0 ? (
            <div className="space-y-4">
              {sortedMedicalRecords.map(record => (
                <Card key={record.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/records/${record.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{record.reason_for_visit || 'Medical Visit'}</CardTitle>
                        <CardDescription>
                          {format(new Date(record.visit_date), 'PPP')}
                          {record.veterinarian && ` • Dr. ${record.veterinarian}`}
                        </CardDescription>
                      </div>
                      {record.type && <Badge>{record.type}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {record.diagnosis && (
                      <div className="mb-2">
                        <h4 className="text-sm font-medium">Diagnosis</h4>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div className="mb-2">
                        <h4 className="text-sm font-medium">Treatment</h4>
                        <p className="text-sm text-muted-foreground">{record.treatment}</p>
                      </div>
                    )}
                    
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-sm font-medium">Prescriptions</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.prescriptions.map((prescription: string, index: number) => (
                            <Badge key={index} variant="outline">{prescription}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      Medical Record
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Medical Records</h3>
              <p className="text-muted-foreground mb-6">
                You haven't added any medical records for this pet yet.
              </p>
              <Button onClick={() => navigate(`/records/new?petId=${id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Record
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Medications</h2>
            <Button onClick={() => navigate(`/medications/new?petId=${id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
          
          <iframe 
            src={`/medications?petId=${id}&embedded=true`} 
            className="w-full min-h-[500px] border-none"
            title="Pet Medications"
          />
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Appointments</h2>
            <Button onClick={() => navigate(`/appointments/new?petId=${id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>
          
          {/* Upcoming Appointments */}
          <div>
            <h3 className="text-lg font-medium mb-3">Upcoming Appointments</h3>
            
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment: any) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date), 'PPP')}
                            {appointment.time && ` at ${appointment.time}`}
                          </p>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-2 text-sm">
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this appointment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, keep it</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(`/appointments/new?petId=${id}`)}>
                  Schedule an Appointment
                </Button>
              </div>
            )}
          </div>
          
          {/* Past Appointments */}
          {pastAppointments && pastAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Past Appointments</h3>
              <div className="space-y-3">
                {pastAppointments.slice(0, 5).map((appointment: any) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.reason || 'Appointment'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date), 'PPP')}
                            {appointment.time && ` at ${appointment.time}`}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-2 text-sm">
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {pastAppointments.length > 5 && (
                  <div className="text-center">
                    <Button variant="link" onClick={() => navigate('/calendar')}>
                      View All Past Appointments
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Expenses</h2>
            <Button onClick={() => navigate(`/pets/${id}/expenses`)}>
              <IndianRupee className="mr-2 h-4 w-4" />
              Manage Expenses
            </Button>
          </div>
          
          <iframe 
            src={`/pets/${id}/expenses?embedded=true`} 
            className="w-full min-h-[500px] border-none"
            title="Pet Expenses"
          />
        </TabsContent>
      </div>
    </Layout>
  );
};

export default PetDetails;
