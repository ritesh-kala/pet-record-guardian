
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPetById, getPets } from '@/lib/supabaseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const NewAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const petIdParam = id || searchParams.get('petId') || '';
  const dateParam = searchParams.get('date');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [petName, setPetName] = useState<string>('');
  const [petId, setPetId] = useState<string>(petIdParam);
  const [availablePets, setAvailablePets] = useState<any[]>([]);
  const [showPetSelector, setShowPetSelector] = useState(!petIdParam);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If we have a pet ID, fetch its details
        if (petIdParam) {
          const pet = await getPetById(petIdParam);
          if (pet) {
            setPetName(pet.name);
            setPetId(petIdParam);
            setShowPetSelector(false);
          } else {
            toast({
              title: 'Error',
              description: 'Pet not found',
              variant: 'destructive'
            });
            setShowPetSelector(true);
          }
        }
        
        // Always fetch available pets for the selector
        const petsData = await getPets();
        if (petsData && petsData.length > 0) {
          setAvailablePets(petsData);
          
          // If we don't have a petId and there are pets available, show the selector
          if (!petIdParam && petsData.length > 0) {
            setShowPetSelector(true);
          } else if (!petIdParam && petsData.length === 0) {
            // If no pets are available, redirect to add a pet
            toast({
              title: 'No Pets Found',
              description: 'Please add a pet first before scheduling an appointment.',
              variant: 'destructive'
            });
            navigate('/pets/new');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [petIdParam, toast, navigate]);

  const handlePetChange = (value: string) => {
    setPetId(value);
    const selectedPet = availablePets.find(pet => pet.id === value);
    if (selectedPet) {
      setPetName(selectedPet.name);
    }
  };

  const handleContinue = () => {
    if (petId) {
      setShowPetSelector(false);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a pet',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="New Appointment"
          description={showPetSelector ? 'Select a pet to schedule an appointment' : `Schedule a new appointment for ${petName || 'your pet'}`}
          buttonText="Back"
          buttonLink={petId ? `/pets/${petId}` : '/pets'}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : showPetSelector ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Select a Pet</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose which pet this appointment is for
                  </p>
                </div>
                
                <Select value={petId} onValueChange={handlePetChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.species || 'Pet'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex justify-end">
                  <Button onClick={handleContinue}>
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
