
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { Card, CardContent } from '@/components/ui/card';
import { getAppointmentById } from '@/lib/supabaseService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EditAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const appointmentData = await getAppointmentById(id);
        setAppointment(appointmentData);
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Edit Appointment"
          description="Update appointment details"
          buttonText="Back to Pet"
          buttonLink={`/pets/${appointment.pet_id}`}
        />

        <Card>
          <CardContent className="pt-6">
            <AppointmentForm petId={appointment.pet_id} appointment={appointment} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditAppointment;
