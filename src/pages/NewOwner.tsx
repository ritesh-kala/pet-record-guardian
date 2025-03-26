
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createOwner, getUserOwner } from '@/lib/supabaseService';
import { useAuth } from '@/contexts/AuthContext';

const NewOwner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserProfile, setIsUserProfile] = useState(false);
  
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const checkUserOwner = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Check if the user already has an owner profile
        const userOwner = await getUserOwner();
        
        if (userOwner) {
          // If the user is creating their first owner profile
          navigate(`/owners/${userOwner.id}`);
          return;
        }
        
        // Pre-fill name and email from the user's auth profile
        setOwnerData(prev => ({
          ...prev, 
          name: currentUser.user_metadata?.full_name || '',
          email: currentUser.email || ''
        }));
        setIsUserProfile(true);
      } catch (error) {
        console.error('Error checking user owner:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserOwner();
  }, [currentUser, navigate]);

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

    if (!currentUser) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to add an owner.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save data to Supabase
      const ownerToCreate = {
        ...ownerData,
        user_id: isUserProfile ? currentUser.id : undefined
      };
      
      const result = await createOwner(ownerToCreate);
      
      toast({
        title: "Owner added successfully",
        description: `${ownerData.name} has been added to your owner list.`,
      });
      
      // Navigate back to owners page
      navigate('/owners');
    } catch (error: any) {
      console.error('Error adding owner:', error);
      toast({
        title: "Error",
        description: "Failed to add owner. Please try again.",
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
            title={isUserProfile ? "Complete Your Profile" : "Add New Owner"} 
            description={isUserProfile ? "Add your contact information" : "Enter the owner's information below"} 
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
                    readOnly={isUserProfile}
                    className={isUserProfile ? "bg-muted" : ""}
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
                    readOnly={isUserProfile}
                    className={isUserProfile ? "bg-muted" : ""}
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
                  onClick={() => navigate('/owners')}
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
                    isUserProfile ? "Complete Profile" : "Save Owner"
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

export default NewOwner;
