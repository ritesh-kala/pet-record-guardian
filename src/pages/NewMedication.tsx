
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Pill, ArrowLeft, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getPets, createMedication } from '@/lib/supabaseService';
import { format } from 'date-fns';

const NewMedication = () => {
  const [searchParams] = useSearchParams();
  const initialPetId = searchParams.get('petId');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(initialPetId || '');

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    refillDate: '',
    refillReminder: true,
    prescribingVet: '',
    instructions: '',
    notes: ''
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const petsData = await getPets();
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast({
          title: "Error",
          description: "Failed to load pets",
          variant: "destructive"
        });
      }
    };
    
    fetchPets();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPetId) {
      toast({
        title: "Error",
        description: "Please select a pet",
        variant: "destructive"
      });
      return;
    }

    if (!formState.name || !formState.dosage || !formState.frequency || !formState.startDate) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const medicationData = {
        pet_id: selectedPetId,
        name: formState.name,
        dosage: formState.dosage,
        frequency: formState.frequency,
        start_date: formState.startDate,
        end_date: formState.endDate || null,
        refill_date: formState.refillDate || null,
        refill_reminder: formState.refillReminder,
        prescribing_vet: formState.prescribingVet || null,
        instructions: formState.instructions || null,
        notes: formState.notes || null,
        active: true
      };

      const { id } = await createMedication(medicationData);
      
      toast({
        title: "Success",
        description: "Medication has been added",
        variant: "default"
      });
      
      navigate(`/medications?petId=${selectedPetId}`);
    } catch (error) {
      console.error('Error creating medication:', error);
      toast({
        title: "Error",
        description: "Failed to create medication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4 p-0 h-auto">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-medium">Add New Medication</h2>
            <p className="text-muted-foreground">Create a new medication record</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medication Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet">Pet <span className="text-destructive">*</span></Label>
                  <Select 
                    value={selectedPetId} 
                    onValueChange={setSelectedPetId}
                  >
                    <SelectTrigger id="pet" className="w-full">
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} - {pet.species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Medication Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      placeholder="E.g., Amoxicillin"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage <span className="text-destructive">*</span></Label>
                    <Input
                      id="dosage"
                      name="dosage"
                      value={formState.dosage}
                      onChange={handleInputChange}
                      placeholder="E.g., 50mg twice daily"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency <span className="text-destructive">*</span></Label>
                  <Input
                    id="frequency"
                    name="frequency"
                    value={formState.frequency}
                    onChange={handleInputChange}
                    placeholder="E.g., Every 12 hours"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formState.startDate}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formState.endDate}
                        onChange={handleInputChange}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="refillDate">Refill Date (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="refillDate"
                        name="refillDate"
                        type="date"
                        value={formState.refillDate}
                        onChange={handleInputChange}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="refillReminder" 
                    checked={formState.refillReminder}
                    onCheckedChange={(checked) => 
                      setFormState(prev => ({ ...prev, refillReminder: checked === true }))
                    }
                  />
                  <Label htmlFor="refillReminder">
                    Enable refill reminders
                  </Label>
                </div>

                <div>
                  <Label htmlFor="prescribingVet">Prescribing Veterinarian (Optional)</Label>
                  <Input
                    id="prescribingVet"
                    name="prescribingVet"
                    value={formState.prescribingVet}
                    onChange={handleInputChange}
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Administration Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={formState.instructions}
                    onChange={handleInputChange}
                    placeholder="How to administer this medication"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formState.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information about this medication"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Medication'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewMedication;
