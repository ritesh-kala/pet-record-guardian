
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Phone, MapPin, Eye, PawPrint, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPets } from '@/lib/supabaseService';

interface OwnerCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const OwnerCard: React.FC<OwnerCardProps> = ({
  id,
  name,
  email,
  phone,
  address,
}) => {
  const navigate = useNavigate();
  const [petCount, setPetCount] = useState(0);
  
  useEffect(() => {
    const fetchPetCount = async () => {
      try {
        const pets = await getPets(id);
        setPetCount(pets.length);
      } catch (error) {
        console.error('Error fetching pet count:', error);
      }
    };
    
    fetchPetCount();
  }, [id]);
  
  return (
    <Card className="hover-lift">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="text-xl font-medium">{name}</h3>
          
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[230px]">{address}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 py-1">
            <PawPrint className="h-3 w-3" />
            {petCount} Pet{petCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-border py-3 px-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/owners/${id}`)}
        >
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/pets/new?ownerId=${id}`)}
        >
          <Plus className="h-4 w-4" /> Add Pet
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OwnerCard;
