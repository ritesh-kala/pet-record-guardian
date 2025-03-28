import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Info, 
  Calendar, 
  User, 
  Stethoscope, 
  Plus, 
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPetById, getMedicalRecords, MedicalRecord, Pet } from '@/lib/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  useEffect(() => {
    const fetchPetDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const petData = await getPetById(id);
        setPet(petData);

        if (petData.owner_id) {
          const { data: ownerData } = await supabase
            .from('owners')
            .select('name')
            .eq('id', petData.owner_id)
            .single();
          
          if (ownerData) {
            setOwnerName(ownerData.name);
          }
        }

        const records = await getMedicalRecords(id);
        setMedicalRecords(records);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        toast({
          title: "Error",
          description: "Failed to load pet details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetDetails();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploadingPhoto(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('pet-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('pets')
        .update({ image_url: imageUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      setPet(prev => prev ? { ...prev, image_url: imageUrl } : null);
      
      toast({
        title: "Success",
        description: "Pet photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getRecordTypeBadge = (type: string | null | undefined) => {
    if (!type) return <Badge>General</Badge>;
    
    switch(type) {
      case 'Vaccination':
        return <Badge className="bg-green-500">Vaccination</Badge>;
      case 'Health Checkup':
        return <Badge className="bg-blue-500">Health Checkup</Badge>;
      case 'Treatment':
        return <Badge className="bg-purple-500">Treatment</Badge>;
      case 'Prescription':
        return <Badge className="bg-yellow-500">Prescription</Badge>;
      case 'Allergy':
        return <Badge className="bg-red-500">Allergy</Badge>;
      case 'Diagnostic Test':
        return <Badge className="bg-indigo-500">Diagnostic Test</Badge>;
      default:
        return <Badge>{type}</Badge>;
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
            description={`${pet.breed || 'Unknown breed'} · ${pet.age || '?'} years old`}
            buttonText="Edit Pet"
            buttonIcon={<Edit className="h-4 w-4" />}
            onButtonClick={() => console.log('Edit pet clicked')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative">
                <div 
                  className="h-48 w-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: pet.image_url ? `url(${pet.image_url})` : 'none',
                    backgroundColor: !pet.image_url ? '#f1f5f9' : 'transparent'
                  }}
                >
                  {!pet.image_url && (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Upload className="h-3 w-3" /> Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Pet Photo</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleUploadPhoto}
                          disabled={uploadingPhoto}
                        />
                        {uploadingPhoto && (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={pet.gender === 'Male' ? 'default' : 'secondary'}>
                    {pet.gender || 'Unknown'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{pet.weight ? `${pet.weight} kg` : 'Weight unknown'}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Microchip ID</p>
                      <p>{pet.microchip_id || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p>{pet.date_of_birth ? formatDate(pet.date_of_birth.toString()) : 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p 
                        className="text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/owners/${pet.owner_id}`)}
                      >
                        {ownerName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {medicalRecords.length > 0 && medicalRecords[0].next_appointment && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Upcoming Appointment</h4>
                    <div className="bg-accent/50 rounded-md p-3">
                      <p className="font-medium">{formatDate(medicalRecords[0].next_appointment)}</p>
                      <p className="text-sm text-muted-foreground">{medicalRecords[0].reason_for_visit || 'Check-up'}</p>
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
                
                {medicalRecords && medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecords.map(record => (
                      <div 
                        key={record.id}
                        className="p-4 border border-border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/records/${record.id}`)}
                      >
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{record.reason_for_visit || 'Medical Visit'}</p>
                          <div className="flex items-center gap-2">
                            {getRecordTypeBadge(record.type)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {record.diagnosis || record.treatment || 'No diagnosis recorded'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.visit_date)}
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
