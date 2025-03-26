import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { createMedicalRecord, getPetById } from '@/lib/supabaseService';
import { Pet } from '@/lib/supabaseService';

const NewMedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>();
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);

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
    const fetchPet = async () => {
      if (!petId) return;
      try {
        const petData = await getPetById(petId);
        setPet(petData);
      } catch (error) {
        console.error('Error fetching pet:', error);
        toast({
          title: "Error",
          description: "Failed to load pet details. Please try again.",
          variant: "destructive"
        });
        navigate('/pets');
      }
    };

    fetchPet();
  }, [petId, toast, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (name: string, value: string) => {
    setMedicalData(prev => {
      // Split the input value by commas to create an array
      const newValueArray = value.split(',').map(item => item.trim());
      return { ...prev, [name]: newValueArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!petId) {
      toast({
        title: "Pet ID Required",
        description: "Pet ID is missing. Please try again.",
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
      // Save data to Supabase
      await createMedicalRecord({
        pet_id: petId || '',
        visit_date: date ? format(date, 'yyyy-MM-dd') : '',
        reason_for_visit: medicalData.reasonForVisit || null,
        diagnosis: medicalData.diagnosis || null,
        treatment: medicalData.treatment || null,
        prescriptions: medicalData.prescriptions.length > 0 ? medicalData.prescriptions : null,
        next_appointment: nextAppointmentDate ? format(nextAppointmentDate, 'yyyy-MM-dd') : null,
        veterinarian: medicalData.veterinarian || null,
        notes: medicalData.additionalNotes || null,
        vaccinations_given: medicalData.vaccinationsGiven.length > 0 ? medicalData.vaccinationsGiven : null
      });
      
      toast({
        title: "Medical record added",
        description: "The medical record has been added successfully.",
      });
      
      navigate(`/pets/${petId}`);
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
            description={`Enter medical information for ${pet?.name || 'this pet'}`}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
