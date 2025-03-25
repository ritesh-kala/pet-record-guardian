
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import PetCard from '@/components/ui-components/PetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

// Mock data
const pets = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male' as const,
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924',
    upcomingAppointment: {
      date: 'May 20, 2023',
      reason: 'Annual Checkup'
    }
  },
  {
    id: '2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Maine Coon',
    age: 2,
    gender: 'Female' as const,
    imageUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?q=80&w=2011',
    upcomingAppointment: {
      date: 'June 5, 2023',
      reason: 'Vaccination'
    }
  },
  {
    id: '3',
    name: 'Rex',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    gender: 'Male' as const,
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1974'
  },
  {
    id: '4',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 1,
    gender: 'Female' as const,
    imageUrl: 'https://images.unsplash.com/photo-1618159493171-3cefbdebd911?q=80&w=1964'
  },
  {
    id: '5',
    name: 'Charlie',
    species: 'Dog',
    breed: 'Beagle',
    age: 5,
    gender: 'Male' as const,
    imageUrl: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?q=80&w=1989'
  },
  {
    id: '6',
    name: 'Daisy',
    species: 'Dog',
    breed: 'Labrador',
    age: 2,
    gender: 'Female' as const,
    imageUrl: 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?q=80&w=1974'
  }
];

const Pets: React.FC = () => {
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredPets = pets.filter(pet => {
    if (filters.species && pet.species !== filters.species) return false;
    if (filters.gender && pet.gender !== filters.gender) return false;
    return true;
  });
  
  const clearFilters = () => {
    setFilters({
      species: '',
      gender: '',
    });
  };
  
  const hasActiveFilters = filters.species || filters.gender;
  
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
                {Object.values(filters).filter(Boolean).length} Filters
                <X className="h-3 w-3" />
              </Badge>
            )}
            
            <Select value={"name-asc"}>
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
            <PetCard key={pet.id} {...pet} />
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
