
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Stethoscope, PawPrint, User } from 'lucide-react';

// Mock data for demonstration
const getRecordById = (id: string) => {
  const records = [
    {
      id: '1',
      type: 'Vaccination',
      date: '2022-02-10',
      description: 'Rabies Vaccination',
      diagnosis: '',
      treatment: 'Rabies vaccine administered',
      medications: 'None',
      notes: 'Due for next vaccination in 1 year',
      status: 'Completed',
      pet: {
        id: '1',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924'
      },
      owner: {
        id: '1',
        name: 'John Smith'
      },
      veterinarian: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      type: 'Check-up',
      date: '2022-06-15',
      description: 'Annual wellness examination',
      diagnosis: 'Healthy with minor dental plaque',
      treatment: 'Dental cleaning recommended within 6 months',
      medications: 'None',
      notes: 'Weight: 34.2 kg. Overall good health.',
      status: 'Completed',
      pet: {
        id: '1',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924'
      },
      owner: {
        id: '1',
        name: 'John Smith'
      },
      veterinarian: 'Dr. Michael Brown'
    },
    {
      id: '3',
      type: 'Dental',
      date: '2022-08-20',
      description: 'Dental cleaning',
      diagnosis: 'Moderate tartar buildup',
      treatment: 'Full dental cleaning and polishing performed',
      medications: 'Antibiotics for 5 days',
      notes: 'No complications during procedure. Follow-up in 6 months recommended.',
      status: 'Completed',
      pet: {
        id: '2',
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Maine Coon',
        imageUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?q=80&w=2011'
      },
      owner: {
        id: '2',
        name: 'Emily Johnson'
      },
      veterinarian: 'Dr. Sarah Johnson'
    }
  ];
  
  return records.find(record => record.id === id);
};

const MedicalRecordDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = getRecordById(id || '');
  
  if (!record) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Medical Record Not Found</h2>
          <p className="text-muted-foreground mb-6">The record you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/records')}>
            Go Back to Records
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
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionHeader 
            title={record.type} 
            description={record.description}
            buttonText="Edit Record"
            buttonIcon={<Edit className="h-4 w-4" />}
            onButtonClick={() => console.log('Edit record clicked')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant={record.status === 'Completed' ? 'secondary' : 'outline'}>
                    {record.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(record.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
                
                <div 
                  className="flex items-center gap-3 p-3 bg-accent/50 rounded-md cursor-pointer mb-4"
                  onClick={() => navigate(`/pets/${record.pet.id}`)}
                >
                  <div 
                    className="w-12 h-12 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${record.pet.imageUrl})` }}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-primary" />
                      <p className="font-medium">{record.pet.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.pet.species} · {record.pet.breed}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p 
                        className="text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/owners/${record.owner.id}`)}
                      >
                        {record.owner.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Veterinarian</p>
                      <p>{record.veterinarian}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Medical Details</h3>
                
                <div className="space-y-6">
                  {record.diagnosis && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Diagnosis</h4>
                      <p>{record.diagnosis}</p>
                    </div>
                  )}
                  
                  {record.treatment && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Treatment</h4>
                      <p>{record.treatment}</p>
                    </div>
                  )}
                  
                  {record.medications && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
                      <p>{record.medications}</p>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</h4>
                      <p>{record.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecordDetails;
