import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MapPin, Edit, PawPrint, Plus, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOwnerById, getPets, getAppointments, Owner, Pet, Appointment } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const OwnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserOwner, setIsUserOwner] = useState(false);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const ownerData = await getOwnerById(id);
        setOwner(ownerData);
        
        // Check if this owner belongs to the current user
        const isCurrentUserOwner = currentUser && ownerData.user_id === currentUser.id;
        setIsUserOwner(isCurrentUserOwner);
        
        // Fetch pets for this owner - passing just the owner ID
        const petsData = await getPets(id);
        setPets(petsData);
        
        // Fetch upcoming appointments for all pets belonging to this owner
        if (petsData.length > 0) {
          const petIds = petsData.map(pet => pet.id);
          const now = new Date();
          const allAppointments: Appointment[] = [];
          
          for (const petId of petIds) {
            if (petId) {
              const petAppointments = await getAppointments(petId);
              const upcomingAppointments = petAppointments.filter(
                app => app.status === 'scheduled' && new Date(app.date) >= now
              );
              allAppointments.push(...upcomingAppointments);
            }
          }
          
          // Sort appointments by date (newest first)
          allAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setAppointments(allAppointments);
        }
      } catch (error) {
        console.error('Error fetching owner details:', error);
        setError('Failed to load owner details');
        toast({
          title: "Error",
          description: "Failed to load owner details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerDetails();
  }, [id, currentUser, toast]);

  const handleEditOwner = () => {
    if (id) {
      navigate(`/owners/edit/${id}`);
    }
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };
  
  const getAppointmentBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      case 'missed': return 'default';
      default: return 'outline';
    }
  };
  
  const formatAppointmentDateTime = (date: string, time?: string | null) => {
    return `${format(new Date(date), 'PPP')}${time ? ` at ${time}` : ''}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !owner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Owner Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "The owner you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate('/owners')}>
            Go Back to Owners
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/owners')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionHeader 
            title={owner?.name || ''} 
            description="Owner Profile"
            buttonText="Edit Owner"
            buttonIcon={<Edit className="h-4 w-4" />}
            onButtonClick={handleEditOwner}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{owner.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>{owner.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p>{owner.address}</p>
                    </div>
                  </div>

                  {(owner.emergency_contact_name || owner.emergency_contact_phone) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="text-sm font-medium mb-3">Emergency Contact</h4>
                      {owner.emergency_contact_name && (
                        <p className="text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">Name:</span> {owner.emergency_contact_name}
                        </p>
                      )}
                      {owner.emergency_contact_phone && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Phone:</span> {owner.emergency_contact_phone}
                        </p>
                      )}
                    </div>
                  )}

                  {(owner.preferred_vet_name || owner.preferred_vet_contact) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="text-sm font-medium mb-3">Preferred Veterinarian</h4>
                      {owner.preferred_vet_name && (
                        <p className="text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">Name:</span> {owner.preferred_vet_name}
                        </p>
                      )}
                      {owner.preferred_vet_contact && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Contact:</span> {owner.preferred_vet_contact}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {owner.notes && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-muted-foreground">{owner.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Pets</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                    onClick={() => navigate(`/pets/new?ownerId=${owner.id}`)}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
                
                {pets.length > 0 ? (
                  <div className="space-y-3">
                    {pets.map(pet => (
                      <div 
                        key={pet.id}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/pets/${pet.id}`)}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <PawPrint className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-muted-foreground">{pet.species} · {pet.breed}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <PawPrint className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No pets added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {appointments.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Upcoming Appointments</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/calendar')}
                  className="gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
              </div>
              
              <div className="space-y-4">
                {appointments.slice(0, 5).map(appointment => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{appointment.reason || 'Appointment'}</span>
                      <Badge variant={getAppointmentBadgeVariant(appointment.status || 'scheduled')}>
                        {appointment.status || 'scheduled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pet: {getPetName(appointment.pet_id)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        {formatAppointmentDateTime(appointment.date, appointment.time)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {appointments.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => navigate('/calendar')}
                  >
                    View {appointments.length - 5} more
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OwnerDetails;
