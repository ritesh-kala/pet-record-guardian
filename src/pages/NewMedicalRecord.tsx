
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

// Mock data for demonstration
const getPetById = (id: string) => {
  if (!id) return null;
  
  const pets = [
    { id: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever' },
    { id: '2', name: 'Whiskers', species: 'Cat', breed: 'Maine Coon' },
    { id: '3', name: 'Rex', species: 'Dog', breed: 'German Shepherd' },
    { id: '4', name: 'Luna', species: 'Cat', breed: 'Siamese' },
    { id: '5', name: 'Charlie', species: 'Dog', breed: 'Beagle' },
    { id: '6', name: 'Daisy', species: 'Dog', breed: 'Labrador' }
  ];
  
  return pets.find(pet => pet.id === id);
};

const NewMedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const petId = searchParams.get('petId');
  const pet = getPetById(petId || '');
  
  const [date, setDate] = useState<Date>(new Date());
  
  const [recordData, setRecordData] = useState({
    type: '',
    description: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    status: 'Completed'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!recordData.type || !recordData.description || !date) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Save data to backend
    console.log('Medical record submitted:', { ...recordData, date, petId });
    
    toast({
      title: "Medical record added successfully",
      description: `The ${recordData.type} record has been added.`,
    });
    
    // Navigate back to records page
    if (petId) {
      navigate(`/pets/${petId}`);
    } else {
      navigate('/records');
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
            title="Add Medical Record" 
            description={pet ? `For ${pet.name} (${pet.breed})` : "Enter medical record details"} 
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!petId && (
                <div className="space-y-2">
                  <Label htmlFor="petId">Pet <span className="text-destructive">*</span></Label>
                  <Select 
                    value={petId || ''} 
                    onValueChange={(value) => navigate(`/records/new?petId=${value}`)}
                  >
                    <SelectTrigger id="petId">
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Buddy (Golden Retriever)</SelectItem>
                      <SelectItem value="2">Whiskers (Maine Coon)</SelectItem>
                      <SelectItem value="3">Rex (German Shepherd)</SelectItem>
                      <SelectItem value="4">Luna (Siamese)</SelectItem>
                      <SelectItem value="5">Charlie (Beagle)</SelectItem>
                      <SelectItem value="6">Daisy (Labrador)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Record Type <span className="text-destructive">*</span></Label>
                  <Select 
                    value={recordData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Check-up">Check-up</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Dental">Dental</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date <span className="text-destructive">*</span></Label>
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
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Input 
                    id="description" 
                    name="description" 
                    placeholder="Brief description of the record" 
                    value={recordData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={recordData.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea 
                  id="diagnosis" 
                  name="diagnosis" 
                  placeholder="Enter diagnosis details" 
                  value={recordData.diagnosis}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Textarea 
                  id="treatment" 
                  name="treatment" 
                  placeholder="Enter treatment details" 
                  value={recordData.treatment}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea 
                  id="medications" 
                  name="medications" 
                  placeholder="Enter prescribed medications" 
                  value={recordData.medications}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Any additional notes or observations" 
                  value={recordData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewMedicalRecord;
