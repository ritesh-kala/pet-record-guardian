
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPetById } from '@/lib/supabaseService';

const NewAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const petId = id || searchParams.get('petId') || '';
  const dateParam = searchParams.get('date');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [petName, setPetName] = useState<string>('');

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (!petId) {
        navigate('/pets');
        return;
      }
      
      try {
        setIsLoading(true);
        const pet = await getPetById(petId);
        if (pet) {
          setPetName(pet.name);
        } else {
          toast({
            title: 'Error',
            description: 'Pet not found',
            variant: 'destructive'
          });
          navigate('/pets');
        }
      } catch (error) {
        console.error('Error fetching pet details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pet details',
          variant: 'destructive'
        });
        navigate('/pets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPetDetails();
  }, [petId, toast, navigate]);

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="New Appointment"
          description={`Schedule a new appointment for ${petName || 'your pet'}`}
          buttonText="Back to Pet"
          buttonLink={`/pets/${petId}`}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <AppointmentForm 
                petId={petId} 
                initialDate={dateParam ? new Date(dateParam) : undefined} 
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default NewAppointment;
