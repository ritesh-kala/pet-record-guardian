
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { getPetById, getMedicalRecordById, updateMedicalRecord, MedicalRecord, MedicalRecordType } from '@/lib/supabaseService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TagInputProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      const newValue = [...value, inputValue];
      onChange(newValue);
      setInputValue('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="border border-input rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <div key={index} className="bg-primary/10 text-primary rounded-md px-2 py-1 text-sm flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              className="text-primary hover:text-primary/80 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type and press Enter"}
        className="outline-none w-full bg-transparent"
      />
    </div>
  );
};

const EditMedicalRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [petName, setPetName] = useState('');
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [nextAppointment, setNextAppointment] = useState<Date | undefined>(undefined);
  
  const [recordData, setRecordData] = useState<Partial<MedicalRecord>>({
    reason_for_visit: '',
    diagnosis: '',
    treatment: '',
    veterinarian: '',
    prescriptions: [],
    vaccinations_given: [],
    type: 'Health Checkup' as MedicalRecordType,
    notes: '',
  });

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const record = await getMedicalRecordById(id);
        
        // Convert string dates to Date objects
        if (record.visit_date) {
          try {
            const visitDateObj = new Date(record.visit_date);
            setVisitDate(visitDateObj);
          } catch (e) {
            console.error('Error parsing visit date:', e);
          }
        }
        
        if (record.next_appointment) {
          try {
            const nextAppointmentObj = new Date(record.next_appointment);
            setNextAppointment(nextAppointmentObj);
          } catch (e) {
            console.error('Error parsing next appointment date:', e);
          }
        }
        
        // Set record data state
        setRecordData({
          pet_id: record.pet_id,
          reason_for_visit: record.reason_for_visit || '',
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          veterinarian: record.veterinarian || '',
          prescriptions: record.prescriptions || [],
          vaccinations_given: record.vaccinations_given || [],
          type: record.type || 'Health Checkup',
          notes: record.notes || '',
          visit_date: record.visit_date,
          next_appointment: record.next_appointment,
        });
        
        // Fetch pet name
        if (record.pet_id) {
          const pet = await getPetById(record.pet_id);
          setPetName(pet.name);
        }
      } catch (error) {
        console.error('Error fetching medical record:', error);
        toast({
          title: "Error",
          description: "Failed to load medical record data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecord();
  }, [id, toast]);

  const handleVisitDateChange = (date: Date | undefined) => {
    setVisitDate(date);
    if (date) {
      setRecordData(prev => ({ 
        ...prev, 
        visit_date: date.toISOString().split('T')[0] 
      }));
    }
  };

  const handleNextAppointmentChange = (date: Date | undefined) => {
    setNextAppointment(date);
    if (date) {
      setRecordData(prev => ({ 
        ...prev, 
        next_appointment: date.toISOString().split('T')[0] 
      }));
    } else {
      setRecordData(prev => ({ ...prev, next_appointment: undefined }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionsChange = (values: string[]) => {
    setRecordData(prev => ({ ...prev, prescriptions: values }));
  };

  const handleVaccinationsChange = (values: string[]) => {
    setRecordData(prev => ({ ...prev, vaccinations_given: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!recordData.visit_date) {
      toast({
        title: "Missing required fields",
        description: "Please select a visit date.",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Record ID is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update medical record
      await updateMedicalRecord(id, recordData as MedicalRecord);
      
      toast({
        title: "Medical record updated successfully",
        description: "The medical record has been updated.",
      });
      
      // Navigate back to the medical record details
      navigate(`/records/${id}`);
    } catch (error: any) {
      console.error('Error updating medical record:', error);
      toast({
        title: "Error",
        description: "Failed to update medical record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            title="Edit Medical Record" 
            description={petName ? `Medical record for ${petName}` : "Update medical record information"} 
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visit_date">Visit Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !visitDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {visitDate ? format(visitDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={visitDate}
                        onSelect={handleVisitDateChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Record Type</Label>
                  <Select 
                    value={recordData.type as string} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Health Checkup">Health Checkup</SelectItem>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="Allergy">Allergy</SelectItem>
                      <SelectItem value="Diagnostic Test">Diagnostic Test</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason_for_visit">Reason for Visit</Label>
                  <Input 
                    id="reason_for_visit" 
                    name="reason_for_visit" 
                    placeholder="Enter reason for visit" 
                    value={recordData.reason_for_visit || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinarian</Label>
                  <Input 
                    id="veterinarian" 
                    name="veterinarian" 
                    placeholder="Enter veterinarian name" 
                    value={recordData.veterinarian || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea 
                    id="diagnosis" 
                    name="diagnosis" 
                    placeholder="Enter diagnosis details" 
                    value={recordData.diagnosis || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea 
                    id="treatment" 
                    name="treatment" 
                    placeholder="Enter treatment details" 
                    value={recordData.treatment || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescriptions">Prescriptions</Label>
                  <TagInput 
                    value={recordData.prescriptions || []} 
                    onChange={handlePrescriptionsChange}
                    placeholder="Add prescription and press Enter"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Add each prescription separately and press Enter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccinations_given">Vaccinations Given</Label>
                  <TagInput 
                    value={recordData.vaccinations_given || []} 
                    onChange={handleVaccinationsChange}
                    placeholder="Add vaccination and press Enter"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Add each vaccination separately and press Enter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_appointment">Next Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextAppointment && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextAppointment ? format(nextAppointment, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextAppointment}
                        onSelect={handleNextAppointmentChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Additional notes about the visit" 
                    value={recordData.notes || ''}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/records/${id}`)}
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
                    "Update Record"
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditMedicalRecord;
