
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, Calendar, Stethoscope, ImageIcon, Pill, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PetCardProps {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  imageUrl?: string;
  gender: 'Male' | 'Female' | 'Unknown';
  upcomingAppointment?: {
    date: string;
    reason: string;
  };
}

const PetCard: React.FC<PetCardProps> = ({
  id,
  name,
  species,
  breed,
  age,
  imageUrl,
  gender,
  upcomingAppointment,
}) => {
  const navigate = useNavigate();
  
  const defaultImage = species.toLowerCase() === 'dog' 
    ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' 
    : species.toLowerCase() === 'cat'
    ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'
    : 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca';
  
  return (
    <Card className="overflow-hidden hover-lift">
      <div className="relative h-48 overflow-hidden">
        {imageUrl || defaultImage ? (
          <img 
            src={imageUrl || defaultImage} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-accent/20">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="font-medium">
            {species}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="mb-2">
          <h3 className="text-xl font-medium">{name}</h3>
          <p className="text-muted-foreground text-sm">{breed} · {age} years · {gender}</p>
        </div>
        
        {upcomingAppointment && (
          <div className="mt-3 p-2 rounded-md bg-secondary flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="text-xs">
              <p className="font-medium">Upcoming: {upcomingAppointment.date}</p>
              <p className="text-muted-foreground">{upcomingAppointment.reason}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-border py-3 px-4 flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/pets/${id}`)}
        >
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/records?petId=${id}`)}
        >
          <Stethoscope className="h-4 w-4" /> Records
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/medications?petId=${id}`)}
        >
          <Pill className="h-4 w-4" /> Meds
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => navigate(`/pets/${id}/expenses`)}
        >
          <DollarSign className="h-4 w-4" /> Expenses
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PetCard;
