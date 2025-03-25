
import React, { useState } from 'react';
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
import { ArrowLeft } from 'lucide-react';

const NewOwner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // TODO: Save data to backend
    console.log('Owner form submitted:', ownerData);
    
    toast({
      title: "Owner added successfully",
      description: `${ownerData.name} has been added to your owner list.`,
    });
    
    // Navigate back to owners page
    navigate('/owners');
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
            title="Add New Owner" 
            description="Enter the owner's information below" 
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
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Owner
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
