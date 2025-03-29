
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getOwnerById, updateOwner } from '@/lib/supabaseService';

const EditOwner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    preferred_vet_name: '',
    preferred_vet_contact: '',
  });

  useEffect(() => {
    const fetchOwner = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const owner = await getOwnerById(id);
        setOwnerData({
          name: owner.name || '',
          email: owner.email || '',
          phone: owner.phone || '',
          address: owner.address || '',
          notes: owner.notes || '',
          emergency_contact_name: owner.emergency_contact_name || '',
          emergency_contact_phone: owner.emergency_contact_phone || '',
          preferred_vet_name: owner.preferred_vet_name || '',
          preferred_vet_contact: owner.preferred_vet_contact || '',
        });
      } catch (error) {
        console.error('Error fetching owner:', error);
        toast({
          title: "Error",
          description: "Failed to load owner data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOwner();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!ownerData.name || !ownerData.email || !ownerData.phone) {
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
        description: "Owner ID is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update owner in Supabase
      await updateOwner(id, ownerData);
      
      toast({
        title: "Owner updated successfully",
        description: `${ownerData.name}'s information has been updated.`,
      });
      
      // Navigate back to owner details
      navigate(`/owners/${id}`);
    } catch (error: any) {
      console.error('Error updating owner:', error);
      toast({
        title: "Error",
        description: "Failed to update owner. Please try again.",
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
            title="Edit Owner" 
            description="Update owner information" 
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter full name" 
                    value={ownerData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="Enter email address" 
                    value={ownerData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="Enter phone number" 
                    value={ownerData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="Enter address" 
                    value={ownerData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input 
                    id="emergency_contact_name" 
                    name="emergency_contact_name" 
                    placeholder="Emergency contact name" 
                    value={ownerData.emergency_contact_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input 
                    id="emergency_contact_phone" 
                    name="emergency_contact_phone" 
                    placeholder="Emergency contact phone" 
                    value={ownerData.emergency_contact_phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_vet_name">Preferred Veterinarian</Label>
                  <Input 
                    id="preferred_vet_name" 
                    name="preferred_vet_name" 
                    placeholder="Preferred veterinarian name" 
                    value={ownerData.preferred_vet_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_vet_contact">Veterinarian Contact</Label>
                  <Input 
                    id="preferred_vet_contact" 
                    name="preferred_vet_contact" 
                    placeholder="Veterinarian contact information" 
                    value={ownerData.preferred_vet_contact}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Additional information about the owner" 
                  value={ownerData.notes}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/owners/${id}`)}
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

export default EditOwner;
