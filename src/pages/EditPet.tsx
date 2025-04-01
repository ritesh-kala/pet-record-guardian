
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import PetDetailTabs from '@/components/ui-components/PetDetailTabs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Pet, getPetById, updatePet } from '@/lib/supabaseService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const EditPet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [petData, setPetData] = useState<Partial<Pet>>({
    name: '',
    species: '',
    breed: '',
    age: undefined,
    weight: undefined,
    gender: '',
    date_of_birth: '',
    microchip_id: '',
    insurance_provider: '',
    policy_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const pet = await getPetById(id);
        setPetData({
          name: pet.name || '',
          species: pet.species || '',
          breed: pet.breed || '',
          age: pet.age,
          weight: pet.weight,
          gender: pet.gender || '',
          microchip_id: pet.microchip_id || '',
          insurance_provider: pet.insurance_provider || '',
          policy_number: pet.policy_number || '',
          notes: pet.notes || '',
          owner_id: pet.owner_id,
          image_url: pet.image_url
        });
        
        // Convert date_of_birth string to Date object for the datepicker
        if (pet.date_of_birth) {
          try {
            const dob = new Date(pet.date_of_birth.toString());
            setDate(dob);
          } catch (e) {
            console.error('Error parsing date:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching pet:', error);
        toast({
          title: "Error",
          description: "Failed to load pet data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPet();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? undefined : Number(value);
    setPetData(prev => ({ ...prev, [name]: numberValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setPetData(prev => ({ 
        ...prev, 
        date_of_birth: date.toISOString().split('T')[0] 
      }));
    } else {
      setPetData(prev => ({ ...prev, date_of_birth: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!petData.name || !petData.species) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Pet ID is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update pet in Supabase
      await updatePet(id, petData as Pet);
      
      toast({
        title: "Pet updated successfully",
        description: `${petData.name}'s information has been updated.`,
      });
      
      // Navigate back to pet details
      navigate(`/pets/${id}`);
    } catch (error: any) {
      console.error('Error updating pet:', error);
      toast({
        title: "Error",
        description: "Failed to update pet. Please try again.",
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
            title="Edit Pet" 
            description="Update pet information" 
          />
        </div>

        {id && <PetDetailTabs petId={id} activeTab="overview" />}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Pet Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter pet name" 
                    value={petData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species <span className="text-destructive">*</span></Label>
                  <Select 
                    name="species"
                    value={petData.species} 
                    onValueChange={(value) => handleSelectChange('species', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Bird">Bird</SelectItem>
                      <SelectItem value="Fish">Fish</SelectItem>
                      <SelectItem value="Rabbit">Rabbit</SelectItem>
                      <SelectItem value="Hamster">Hamster</SelectItem>
                      <SelectItem value="Guinea Pig">Guinea Pig</SelectItem>
                      <SelectItem value="Reptile">Reptile</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input 
                    id="breed" 
                    name="breed" 
                    placeholder="Enter breed" 
                    value={petData.breed || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <RadioGroup 
                    className="flex gap-4" 
                    value={petData.gender || ''}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Unknown" id="unknown" />
                      <Label htmlFor="unknown">Unknown</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input 
                    id="age" 
                    name="age" 
                    type="number"
                    min="0"
                    placeholder="Enter age" 
                    value={petData.age === undefined ? '' : petData.age}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    name="weight" 
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Enter weight" 
                    value={petData.weight === undefined ? '' : petData.weight}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microchip_id">Microchip ID</Label>
                  <Input 
                    id="microchip_id" 
                    name="microchip_id" 
                    placeholder="Enter microchip ID" 
                    value={petData.microchip_id || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">Insurance Provider</Label>
                  <Input 
                    id="insurance_provider" 
                    name="insurance_provider" 
                    placeholder="Enter insurance provider" 
                    value={petData.insurance_provider || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input 
                    id="policy_number" 
                    name="policy_number" 
                    placeholder="Enter policy number" 
                    value={petData.policy_number || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Additional information about the pet" 
                  value={petData.notes || ''}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/pets/${id}`)}
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
                    "Save Changes"
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

export default EditPet;
