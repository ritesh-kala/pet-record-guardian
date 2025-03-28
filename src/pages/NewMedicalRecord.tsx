import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ArrowLeft, Upload, X, FileText, ChevronDown } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { 
  createMedicalRecord, 
  getPetById, 
  getPets,
  Pet, 
  MedicalRecordType, 
  uploadAttachmentFile, 
  createAttachment, 
  getUserOwner 
} from '@/lib/supabaseService';
import { Card, CardContent } from '@/components/ui/card';

const NewMedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { petId: paramPetId } = useParams<{ petId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryPetId = queryParams.get('petId');
  
  const initPetId = paramPetId || queryPetId;
  
  const { toast } = useToast();

  const [date, setDate] = useState<Date>();
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [recordType, setRecordType] = useState<MedicalRecordType>('Health Checkup');
  const [files, setFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<{ [key: string]: string }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>(initPetId);
  const [isLoadingPets, setIsLoadingPets] = useState(false);

  const [medicalData, setMedicalData] = useState({
    reasonForVisit: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [] as string[],
    nextAppointment: '',
    veterinarian: '',
    additionalNotes: '',
    vaccinationsGiven: [] as string[]
  });

  useEffect(() => {
    const fetchUserPets = async () => {
      setIsLoadingPets(true);
      try {
        const owner = await getUserOwner();
        if (!owner) {
          console.log("No owner found for current user");
          setIsLoadingPets(false);
          return;
        }
        
        const userPets = await getPets(owner.id);
        setPets(userPets);
        
        if (userPets.length === 1 && !selectedPetId) {
          setSelectedPetId(userPets[0].id);
        }
      } catch (error) {
        console.error('Error fetching user pets:', error);
        toast({
          title: "Error",
          description: "Failed to load your pets. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPets(false);
      }
    };

    fetchUserPets();
  }, [toast]);

  useEffect(() => {
    const fetchPet = async () => {
      if (!selectedPetId) {
        setPet(null);
        return;
      }
      
      try {
        console.log("Fetching pet with ID:", selectedPetId);
        const petData = await getPetById(selectedPetId);
        setPet(petData);
      } catch (error) {
        console.error('Error fetching pet:', error);
        toast({
          title: "Error",
          description: "Failed to load pet details. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchPet();
  }, [selectedPetId, toast]);

  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (name: string, value: string) => {
    setMedicalData(prev => {
      const newValueArray = value.split(',').map(item => item.trim());
      return { ...prev, [name]: newValueArray };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newProgress = { ...uploadProgress };
      const newDescriptions = { ...fileDescriptions };
      
      newFiles.forEach(file => {
        newProgress[file.name] = 0;
        newDescriptions[file.name] = '';
      });
      
      setUploadProgress(newProgress);
      setFileDescriptions(newDescriptions);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    
    const newProgress = { ...uploadProgress };
    const newDescriptions = { ...fileDescriptions };
    
    delete newProgress[fileName];
    delete newDescriptions[fileName];
    
    setUploadProgress(newProgress);
    setFileDescriptions(newDescriptions);
  };

  const handleFileDescriptionChange = (fileName: string, description: string) => {
    setFileDescriptions(prev => ({
      ...prev,
      [fileName]: description
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPetId) {
      toast({
        title: "Pet Selection Required",
        description: "Please select a pet for this medical record.",
        variant: "destructive"
      });
      return;
    }

    if (!date) {
      toast({
        title: "Visit Date Required",
        description: "Please select a visit date.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { id: recordId } = await createMedicalRecord({
        pet_id: selectedPetId,
        visit_date: date ? format(date, 'yyyy-MM-dd') : '',
        reason_for_visit: medicalData.reasonForVisit || null,
        diagnosis: medicalData.diagnosis || null,
        treatment: medicalData.treatment || null,
        prescriptions: medicalData.prescriptions.length > 0 ? medicalData.prescriptions : null,
        next_appointment: nextAppointmentDate ? format(nextAppointmentDate, 'yyyy-MM-dd') : null,
        veterinarian: medicalData.veterinarian || null,
        notes: medicalData.additionalNotes || null,
        vaccinations_given: medicalData.vaccinationsGiven.length > 0 ? medicalData.vaccinationsGiven : null,
        type: recordType
      });
      
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const description = fileDescriptions[file.name] || '';
          
          try {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 10
            }));
            
            const fileUrl = await uploadAttachmentFile(file, recordId);
            
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 50
            }));
            
            await createAttachment({
              record_id: recordId,
              file_name: file.name,
              file_url: fileUrl,
              file_type: file.type,
              file_size: file.size,
              description: description
            });
            
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast({
              title: "Upload Error",
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: "destructive"
            });
          }
        }
      }
      
      toast({
        title: "Medical record added",
        description: "The medical record has been added successfully.",
      });
      
      navigate(`/pets/${selectedPetId}`);
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast({
        title: "Error",
        description: "Failed to add medical record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            title="Add New Medical Record" 
            description="Enter medical information for your pet"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Pet</Label>
            {isLoadingPets ? (
              <div className="h-10 w-full rounded-md border border-input bg-background flex items-center px-3">
                <div className="animate-pulse text-sm text-muted-foreground">Loading pets...</div>
              </div>
            ) : pets.length > 0 ? (
              <Select value={selectedPetId} onValueChange={handleSelectPet}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Your Pets</SelectLabel>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id || ''}>
                        {pet.name} ({pet.species}{pet.breed ? `, ${pet.breed}` : ''})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 border rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  No pets found. Please add a pet first.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate('/pets/new')}
                >
                  Add Pet
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Record Type</Label>
              <Select value={recordType} onValueChange={(value) => setRecordType(value as MedicalRecordType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Record Types</SelectLabel>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Health Checkup">Health Checkup</SelectItem>
                    <SelectItem value="Treatment">Treatment / Procedure</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Allergy">Allergic Reaction</SelectItem>
                    <SelectItem value="Diagnostic Test">Diagnostic Test / Lab Result</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinarian</Label>
              <Input 
                id="veterinarian" 
                name="veterinarian" 
                placeholder="Enter veterinarian's name" 
                value={medicalData.veterinarian}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonForVisit">Reason for Visit</Label>
              <Input 
                id="reasonForVisit" 
                name="reasonForVisit" 
                placeholder="Enter reason for visit" 
                value={medicalData.reasonForVisit}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input 
                id="diagnosis" 
                name="diagnosis" 
                placeholder="Enter diagnosis" 
                value={medicalData.diagnosis}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Input 
                id="treatment" 
                name="treatment" 
                placeholder="Enter treatment" 
                value={medicalData.treatment}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptions">Prescriptions (comma-separated)</Label>
              <Input
                id="prescriptions"
                name="prescriptions"
                placeholder="Enter prescriptions"
                value={medicalData.prescriptions.join(', ')}
                onChange={(e) => handleArrayInputChange('prescriptions', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Next Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextAppointmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextAppointmentDate ? format(nextAppointmentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextAppointmentDate}
                    onSelect={setNextAppointmentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccinationsGiven">Vaccinations Given (comma-separated)</Label>
              <Input
                id="vaccinationsGiven"
                name="vaccinationsGiven"
                placeholder="Enter vaccinations given"
                value={medicalData.vaccinationsGiven.join(', ')}
                onChange={(e) => handleArrayInputChange('vaccinationsGiven', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea 
              id="additionalNotes" 
              name="additionalNotes" 
              placeholder="Additional information about the visit" 
              value={medicalData.additionalNotes}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Attachments</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload prescription documents, diagnostic reports, or images
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center justify-center">
                    <label className="w-full flex flex-col items-center justify-center cursor-pointer py-4">
                      <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-center text-muted-foreground">
                        Click to upload files
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                    </label>
                  </CardContent>
                </Card>
                
                {files.length > 0 && (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <Card key={file.name}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm font-medium truncate max-w-[180px]">
                                {file.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(file.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Input
                            placeholder="Add a description for this file"
                            value={fileDescriptions[file.name] || ''}
                            onChange={(e) => handleFileDescriptionChange(file.name, e.target.value)}
                            className="mb-2 text-xs"
                          />
                          
                          {uploadProgress[file.name] > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div> : 
                "Save Record"
              }
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewMedicalRecord;
