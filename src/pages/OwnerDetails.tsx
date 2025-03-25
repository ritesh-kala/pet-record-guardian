
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MapPin, Edit, PawPrint, Plus } from 'lucide-react';

// Mock data for demonstration
const getOwnerById = (id: string) => {
  const owners = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, USA 12345',
      notes: 'Prefers appointment reminders via text message.',
      pets: [
        { id: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever' },
        { id: '2', name: 'Max', species: 'Dog', breed: 'German Shepherd' }
      ]
    },
    {
      id: '2',
      name: 'Emily Johnson',
      email: 'emily.johnson@example.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, Somewhere, USA 67890',
      notes: 'Has multiple pets with different vaccination schedules.',
      pets: [
        { id: '3', name: 'Whiskers', species: 'Cat', breed: 'Maine Coon' },
        { id: '4', name: 'Mittens', species: 'Cat', breed: 'Siamese' },
        { id: '5', name: 'Fluffy', species: 'Cat', breed: 'Persian' }
      ]
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '(555) 456-7890',
      address: '789 Pine Rd, Nowhere, USA 54321',
      notes: '',
      pets: [
        { id: '6', name: 'Rex', species: 'Dog', breed: 'German Shepherd' }
      ]
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      phone: '(555) 321-0987',
      address: '321 Elm St, Anywhere, USA 10293',
      notes: 'Allergic to certain medications, check medical records before prescribing.',
      pets: [
        { id: '7', name: 'Luna', species: 'Cat', breed: 'Siamese' },
        { id: '8', name: 'Charlie', species: 'Dog', breed: 'Beagle' }
      ]
    }
  ];
  
  return owners.find(owner => owner.id === id);
};

const OwnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const owner = getOwnerById(id || '');
  
  if (!owner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Owner Not Found</h2>
          <p className="text-muted-foreground mb-6">The owner you're looking for doesn't exist or has been removed.</p>
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
            title={owner.name} 
            description="Owner Profile"
            buttonText="Edit Owner"
            buttonIcon={<Edit className="h-4 w-4" />}
            onButtonClick={() => console.log('Edit owner clicked')}
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
                
                {owner.pets.length > 0 ? (
                  <div className="space-y-3">
                    {owner.pets.map(pet => (
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
