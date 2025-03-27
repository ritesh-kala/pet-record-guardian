
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CalendarIcon, ArrowLeft, Loader2, Upload, ImageIcon } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { createPet, getOwners, Owner, Timestamp } from '@/lib/supabaseService';
import { supabase } from '@/integrations/supabase/client';

const NewPet: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId');
  const { currentUser } = useAuth();

  const [date, setDate] = useState<Date>();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(ownerId ? false : true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    microchipId: '',
    insuranceProvider: '',
    policyNumber: '',
    notes: '',
    ownerId: ownerId || '',
  });

  useEffect(() => {
    const fetchOwners = async () => {
      if (!currentUser || ownerId) return;
      
      try {
        setLoadingOwners(true);
        const ownersData = await getOwners();
        setOwners(ownersData);
      } catch (error) {
        console.error('Error fetching owners:', error);
        toast({
          title: "Error",
          description: "Failed to load owners. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingOwners(false);
      }
    };

    fetchOwners();
  }, [currentUser, ownerId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPhotoFile(file);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (e.target?.result) {
        setPhotoPreview(e.target.result as string);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const uploadPhoto = async (petId: string): Promise<string | null> => {
    if (!photoFile) return null;
    
    try {
      // Create a unique filename
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${petId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, photoFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Warning",
        description: "Pet was created but photo could not be uploaded. You can add it later.",
        variant: "default"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!petData.name || !petData.species || !petData.breed) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!petData.ownerId) {
      toast({
        title: "Owner Required",
        description: "Please select an owner for this pet.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add a pet.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First create the pet to get an ID
      const { id } = await createPet({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age ? Number(petData.age) : null,
        weight: petData.weight ? Number(petData.weight) : null,
        gender: petData.gender || null,
        date_of_birth: date ? Timestamp.fromDate(date) : null,
        microchip_id: petData.microchipId || null,
        insurance_provider: petData.insuranceProvider || null,
        policy_number: petData.policyNumber || null,
        notes: petData.notes || null,
        owner_id: petData.ownerId,
        image_url: null // We'll update this after upload
      });
      
      // Now upload the photo if one was provided
      if (photoFile) {
        const imageUrl = await uploadPhoto(id);
        
        // Update the pet with the image URL
        if (imageUrl) {
          await supabase
            .from('pets')
            .update({ image_url: imageUrl })
            .eq('id', id);
        }
      }
      
      toast({
        title: "Pet added successfully",
        description: `${petData.name} has been added to your pet list.`,
      });
      
      // Navigate back to pets page or owner details
      if (ownerId) {
        navigate(`/owners/${ownerId}`);
      } else {
        navigate('/pets');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      toast({
        title: "Error",
        description: "Failed to add pet. Please try again.",
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
            title="Add New Pet" 
            description="Enter your pet's information below" 
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!ownerId && (
                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Owner <span className="text-destructive">*</span></Label>
                    {loadingOwners ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading owners...</span>
                      </div>
                    ) : (
                      <Select 
                        value={petData.ownerId} 
                        onValueChange={(value) => handleSelectChange('ownerId', value)}
                      >
                        <SelectTrigger id="ownerId">
                          <SelectValue placeholder="Select an owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner.id} value={owner.id || ''}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

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
                      value={petData.species} 
                      onValueChange={(value) => handleSelectChange('species', value)}
                    >
                      <SelectTrigger id="species">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed <span className="text-destructive">*</span></Label>
                    <Input 
                      id="breed" 
                      name="breed" 
                      placeholder="Enter breed" 
                      value={petData.breed}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={petData.gender} 
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <Input 
                        id="photo" 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    {photoPreview && (
                      <div className="mt-2 relative w-24 h-24 rounded-md overflow-hidden border border-input">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      name="age" 
                      type="number" 
                      min="0"
                      placeholder="Enter age (years)" 
                      value={petData.age}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      name="weight" 
                      type="number" 
                      min="0"
                      step="0.1"
                      placeholder="Enter weight" 
                      value={petData.weight}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
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
                    <Label htmlFor="microchipId">Microchip ID</Label>
                    <Input 
                      id="microchipId" 
                      name="microchipId" 
                      placeholder="Enter microchip ID" 
                      value={petData.microchipId}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input 
                      id="insuranceProvider" 
                      name="insuranceProvider" 
                      placeholder="Enter insurance provider" 
                      value={petData.insuranceProvider}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input 
                      id="policyNumber" 
                      name="policyNumber" 
                      placeholder="Enter policy number" 
                      value={petData.policyNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Additional information about your pet" 
                    value={petData.notes}
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
                      "Save Pet"
                    }
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewPet;
