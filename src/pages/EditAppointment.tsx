
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getAppointmentById, deleteAppointment, getPetById } from '@/lib/supabaseService';
import { Loader2, Trash2, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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

const EditAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<any>(null);
  const [petName, setPetName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const appointmentData = await getAppointmentById(id);
        setAppointment(appointmentData);
        
        // Fetch pet name
        if (appointmentData.pet_id) {
          const pet = await getPetById(appointmentData.pet_id);
          setPetName(pet.name);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointment details',
          variant: 'destructive',
        });
        navigate('/pets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id, navigate, toast]);

  const handleDeleteAppointment = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteAppointment(id);
      
      toast({
        title: 'Success',
        description: 'Appointment has been deleted successfully',
      });
      
      // If we have pet_id, navigate to pet page, otherwise to calendar
      if (appointment?.pet_id) {
        navigate(`/pets/${appointment.pet_id}`);
      } else {
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete appointment',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReschedule = () => {
    if (!appointment?.pet_id) return;
    
    // Navigate to new appointment page with the pet_id
    navigate(`/appointments/new?petId=${appointment.pet_id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Appointment Not Found</h2>
          <p className="mt-2 text-muted-foreground">The appointment you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate('/calendar')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Button>
        </div>
      </Layout>
    );
  }

  const isPastAppointment = new Date(appointment.date) < new Date();

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title={isPastAppointment ? "View Past Appointment" : "Edit Appointment"}
          description={`${isPastAppointment ? "View" : "Update"} appointment details for ${petName}`}
          buttonText="Back to Pet"
          buttonLink={`/pets/${appointment.pet_id}`}
        />

        <Card>
          <CardContent className="pt-6">
            <AppointmentForm 
              petId={appointment.pet_id} 
              appointment={appointment} 
              isEditing={true}
              readOnly={isPastAppointment && appointment.status !== 'scheduled'}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/calendar')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calendar
            </Button>
            
            <div className="flex gap-2">
              {(!isPastAppointment || appointment.status === 'scheduled') && (
                <Button 
                  variant="outline"
                  onClick={handleReschedule}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAppointment}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default EditAppointment;
