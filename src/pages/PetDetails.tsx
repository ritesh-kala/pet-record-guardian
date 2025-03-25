
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Info, Calendar, User, Stethoscope, Plus } from 'lucide-react';

// Mock data for demonstration
const getPetById = (id: string) => {
  const pets = [
    {
      id: '1',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      weight: '34.5',
      microchipId: '985121056478526',
      dateOfBirth: '2020-03-15',
      ownerId: '1',
      ownerName: 'John Smith',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924',
      upcomingAppointment: {
        date: 'May 20, 2023',
        reason: 'Annual Checkup'
      },
      medicalRecords: [
        { id: '1', date: '2022-02-10', type: 'Vaccination', description: 'Rabies Vaccination', status: 'Completed' },
        { id: '2', date: '2022-06-15', type: 'Check-up', description: 'Annual wellness examination', status: 'Completed' }
      ]
    },
    {
      id: '2',
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 2,
      gender: 'Female',
      weight: '12.3',
      microchipId: '985136547895423',
      dateOfBirth: '2021-05-20',
      ownerId: '2',
      ownerName: 'Emily Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?q=80&w=2011',
      upcomingAppointment: {
        date: 'June 5, 2023',
        reason: 'Vaccination'
      },
      medicalRecords: [
        { id: '3', date: '2022-08-20', type: 'Dental', description: 'Dental cleaning', status: 'Completed' }
      ]
    }
  ];
  
  return pets.find(pet => pet.id === id);
};

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pet = getPetById(id || '');
  
  if (!pet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Pet Not Found</h2>
          <p className="text-muted-foreground mb-6">The pet you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/pets')}>
            Go Back to Pets
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
            onClick={() => navigate('/pets')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionHeader 
            title={pet.name} 
            description={`${pet.breed} · ${pet.age} years old`}
            buttonText="Edit Pet"
            buttonIcon={<Edit className="h-4 w-4" />}
            onButtonClick={() => console.log('Edit pet clicked')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div 
                className="h-48 w-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${pet.imageUrl})`,
                }}
              ></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={pet.gender === 'Male' ? 'default' : 'secondary'}>
                    {pet.gender}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{pet.weight} kg</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Microchip ID</p>
                      <p>{pet.microchipId || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p>{new Date(pet.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p 
                        className="text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/owners/${pet.ownerId}`)}
                      >
                        {pet.ownerName}
                      </p>
                    </div>
                  </div>
                </div>
                
                {pet.upcomingAppointment && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Upcoming Appointment</h4>
                    <div className="bg-accent/50 rounded-md p-3">
                      <p className="font-medium">{pet.upcomingAppointment.date}</p>
                      <p className="text-sm text-muted-foreground">{pet.upcomingAppointment.reason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Medical Records</h3>
                  </div>
                  <Button 
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate(`/records/new?petId=${pet.id}`)}
                  >
                    <Plus className="h-3 w-3" />
                    Add Record
                  </Button>
                </div>
                
                {pet.medicalRecords && pet.medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {pet.medicalRecords.map(record => (
                      <div 
                        key={record.id}
                        className="p-4 border border-border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/records/${record.id}`)}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{record.type}</p>
                          <Badge variant={record.status === 'Completed' ? 'secondary' : 'outline'}>
                            {record.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{record.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No medical records yet</p>
                    <p className="text-sm">Add the first medical record by clicking the "Add Record" button</p>
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

export default PetDetails;
