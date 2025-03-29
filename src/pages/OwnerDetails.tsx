
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MapPin, Edit, PawPrint, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOwnerById, getPets, Owner, Pet } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';

const OwnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
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
      </div>
    </Layout>
  );
};

export default OwnerDetails;
