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
  Calendar, 
  Stethoscope, 
  PawPrint, 
  User, 
  FileText,
  Download,
  Loader2,
  Image as ImageIcon,
  FileImage,
  File
} from 'lucide-react';
import { 
  getMedicalRecordById, 
  getPetById, 
  getAttachmentsByRecordId,
  MedicalRecord, 
  Pet, 
  Attachment 
} from '@/lib/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MedicalRecordDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  
  useEffect(() => {
    const fetchRecordDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const recordData = await getMedicalRecordById(id);
        setRecord(recordData);
        
        if (recordData.pet_id) {
          const petData = await getPetById(recordData.pet_id);
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
        }
        
        const attachmentData = await getAttachmentsByRecordId(id);
        setAttachments(attachmentData);
        
      } catch (error) {
        console.error('Error fetching record details:', error);
        toast({
          title: "Error",
          description: "Failed to load record details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecordDetails();
  }, [id, toast]);
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
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

  const getAttachmentIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const isImageFile = (fileType: string) => {
    return fileType.toLowerCase().includes('image');
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
  
  if (!record || !pet) {
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
            title={record.reason_for_visit || 'Medical Record'} 
            description={`${formatDate(record.visit_date)}`}
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
                  {getRecordTypeBadge(record.type)}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(record.visit_date)}</span>
                  </div>
                </div>
                
                <div 
                  className="flex items-center gap-3 p-3 bg-accent/50 rounded-md cursor-pointer mb-4"
                  onClick={() => navigate(`/pets/${pet.id}`)}
                >
                  <div 
                    className="w-12 h-12 rounded-md bg-cover bg-center"
                    style={{ 
                      backgroundImage: pet.image_url ? `url(${pet.image_url})` : 'none',
                      backgroundColor: !pet.image_url ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    {!pet.image_url && (
                      <div className="flex items-center justify-center h-full">
                        <PawPrint className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-primary" />
                      <p className="font-medium">{pet.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{pet.species} · {pet.breed}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
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
                  
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Veterinarian</p>
                      <p>{record.veterinarian || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {record.next_appointment && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Next Appointment</p>
                        <p>{formatDate(record.next_appointment)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Attachments</h3>
                {attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div 
                        key={attachment.id}
                        className="p-3 border border-border rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedAttachment(attachment)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getAttachmentIcon(attachment.file_type)}
                            <p className="font-medium truncate max-w-[180px]">{attachment.file_name}</p>
                          </div>
                          <a 
                            href={attachment.file_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                        {attachment.description && (
                          <p className="text-sm text-muted-foreground ml-6">{attachment.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No attachments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Medical Details</h3>
                
                <div className="space-y-6">
                  {record.reason_for_visit && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Reason for Visit</h4>
                      <p>{record.reason_for_visit}</p>
                    </div>
                  )}
                  
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
                  
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Prescriptions</h4>
                      <ul className="list-disc pl-5">
                        {record.prescriptions.map((prescription, index) => (
                          <li key={index}>{prescription}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {record.vaccinations_given && record.vaccinations_given.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Vaccinations Given</h4>
                      <ul className="list-disc pl-5">
                        {record.vaccinations_given.map((vaccination, index) => (
                          <li key={index}>{vaccination}</li>
                        ))}
                      </ul>
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

            {attachments.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Attachment Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {attachments.map((attachment) => (
                      isImageFile(attachment.file_type) ? (
                        <div 
                          key={attachment.id}
                          className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedAttachment(attachment)}
                        >
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div 
                          key={attachment.id}
                          className="aspect-square rounded-md overflow-hidden border border-border bg-accent/30 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => setSelectedAttachment(attachment)}
                        >
                          {getAttachmentIcon(attachment.file_type)}
                          <p className="text-xs text-center mt-2 px-2 truncate w-full">{attachment.file_name}</p>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog 
        open={selectedAttachment !== null} 
        onOpenChange={(open) => !open && setSelectedAttachment(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAttachment?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex justify-center items-center">
            {selectedAttachment && isImageFile(selectedAttachment.file_type) ? (
              <img
                src={selectedAttachment.file_url}
                alt={selectedAttachment.file_name}
                className="max-h-[70vh] max-w-full rounded-md"
              />
            ) : (
              <div className="p-10 text-center">
                {selectedAttachment && getAttachmentIcon(selectedAttachment.file_type)}
                <p className="mt-2">{selectedAttachment?.file_name}</p>
                <a 
                  href={selectedAttachment?.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                  className="mt-4 inline-block"
                >
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MedicalRecordDetails;
