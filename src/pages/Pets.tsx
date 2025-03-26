
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import PetCard from '@/components/ui-components/PetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { getPets, getMedicalRecords, Pet } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';

const Pets: React.FC = () => {
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [petAppointments, setPetAppointments] = useState<Record<string, { date: string, reason: string }>>({});
  
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        // Fetch all pets from Supabase
        const petsData = await getPets();
        setPets(petsData);
        
        // Fetch upcoming appointments for each pet
        const appointments: Record<string, { date: string, reason: string }> = {};
        
        for (const pet of petsData) {
          if (pet.id) {
            const records = await getMedicalRecords(pet.id);
            // Find the nearest upcoming appointment
            const upcomingAppointment = records
              .filter(record => record.next_appointment)
              .sort((a, b) => {
                const dateA = new Date(a.next_appointment || '');
                const dateB = new Date(b.next_appointment || '');
                return dateA.getTime() - dateB.getTime();
              })[0];
              
            if (upcomingAppointment && upcomingAppointment.next_appointment) {
              const appointmentDate = new Date(upcomingAppointment.next_appointment);
              
              if (appointmentDate > new Date()) {
                appointments[pet.id] = {
                  date: appointmentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }),
                  reason: upcomingAppointment.reason_for_visit || 'Check-up'
                };
              }
            }
          }
        }
        
        setPetAppointments(appointments);
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast({
          title: "Error",
          description: "Failed to load pets. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [toast]);
  
  const sortPets = (a: Pet, b: Pet) => {
    switch (sortOrder) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'age-asc':
        return (a.age || 0) - (b.age || 0);
      case 'age-desc':
        return (b.age || 0) - (a.age || 0);
      default:
        return 0;
    }
  };
  
  const filteredPets = pets
    .filter(pet => {
      // Search by name
      if (searchTerm && !pet.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by species
      if (filters.species && pet.species !== filters.species) {
        return false;
      }
      
      // Filter by gender
      if (filters.gender && pet.gender !== filters.gender) {
        return false;
      }
      
      return true;
    })
    .sort(sortPets);
  
  const clearFilters = () => {
    setFilters({
      species: '',
      gender: '',
    });
    setSearchTerm('');
  };
  
  const hasActiveFilters = filters.species || filters.gender || searchTerm;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        <SectionHeader 
          title="Pet Profiles" 
          description="Manage your pets information" 
          buttonText="Add New Pet"
          buttonLink="/pets/new"
        />
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search pets..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              size="icon"
              className={showFilters ? "bg-accent" : ""}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {hasActiveFilters && (
              <Badge 
                variant="outline" 
                className="gap-1 cursor-pointer"
                onClick={clearFilters}
              >
                {Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)} Filters
                <X className="h-3 w-3" />
              </Badge>
            )}
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="age-asc">Age (Youngest First)</SelectItem>
                <SelectItem value="age-desc">Age (Oldest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-accent/50 border border-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-sm font-medium">Species</label>
              <Select 
                value={filters.species} 
                onValueChange={(value) => setFilters({...filters, species: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Species</SelectItem>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Bird">Bird</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select 
                value={filters.gender} 
                onValueChange={(value) => setFilters({...filters, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredPets.map((pet) => (
            <PetCard 
              key={pet.id} 
              id={pet.id || ''}
              name={pet.name}
              species={pet.species}
              breed={pet.breed || 'Unknown'}
              age={pet.age || 0}
              gender={pet.gender as 'Male' | 'Female' || 'Unknown'}
              imageUrl={pet.image_url}
              upcomingAppointment={pet.id && petAppointments[pet.id] ? petAppointments[pet.id] : undefined}
            />
          ))}
        </div>
        
        {filteredPets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No pets match your search criteria.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pets;
