import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import MedicalRecordCard from '@/components/ui-components/MedicalRecordCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const medicalRecords = [
  {
    id: '1',
    petId: '1',
    petName: 'Buddy',
    petSpecies: 'Dog',
    date: 'April 12, 2023',
    veterinarian: 'Smith',
    reason: 'Annual Checkup',
    diagnosis: 'Healthy',
    treatment: 'None required',
    hasAttachments: true,
    status: 'completed' as const
  },
  {
    id: '2',
    petId: '2',
    petName: 'Whiskers',
    petSpecies: 'Cat',
    date: 'May 20, 2023',
    veterinarian: 'Johnson',
    reason: 'Vaccination',
    status: 'upcoming' as const
  },
  {
    id: '3',
    petId: '1',
    petName: 'Buddy',
    petSpecies: 'Dog',
    date: 'March 5, 2023',
    veterinarian: 'Williams',
    reason: 'Skin Condition',
    diagnosis: 'Allergic Dermatitis',
    treatment: 'Prescribed antihistamines and medicated shampoo',
    status: 'completed' as const
  },
  {
    id: '4',
    petId: '3',
    petName: 'Rex',
    petSpecies: 'Dog',
    date: 'February 18, 2023',
    veterinarian: 'Smith',
    reason: 'Limping',
    diagnosis: 'Mild sprain',
    treatment: 'Rest and anti-inflammatory medication',
    hasAttachments: true,
    status: 'completed' as const
  },
  {
    id: '5',
    petId: '2',
    petName: 'Whiskers',
    petSpecies: 'Cat',
    date: 'June 10, 2023',
    veterinarian: 'Johnson',
    reason: 'Dental Cleaning',
    status: 'upcoming' as const
  },
  {
    id: '6',
    petId: '4',
    petName: 'Luna',
    petSpecies: 'Cat',
    date: 'March 15, 2023',
    veterinarian: 'Williams',
    reason: 'Vomiting',
    diagnosis: 'Hairball',
    treatment: 'Hairball remedy and dietary adjustments',
    status: 'completed' as const
  },
  {
    id: '7',
    petId: '1',
    petName: 'Buddy',
    petSpecies: 'Dog',
    date: 'April 1, 2023',
    veterinarian: 'Smith',
    reason: 'Follow-up',
    diagnosis: 'Improved skin condition',
    treatment: 'Continue medication for another week',
    status: 'completed' as const
  },
  {
    id: '8',
    petId: '6',
    petName: 'Daisy',
    petSpecies: 'Dog',
    date: 'April 30, 2023',
    veterinarian: 'Johnson',
    reason: 'Annual Checkup & Vaccinations',
    diagnosis: 'Healthy',
    treatment: 'Vaccinations administered',
    hasAttachments: true,
    status: 'overdue' as const
  }
];

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    pet: '',
    status: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Get unique pets for filter dropdown
  const uniquePets = Array.from(new Set(medicalRecords.map(record => record.petId)))
    .map(petId => {
      const record = medicalRecords.find(r => r.petId === petId);
      return {
        id: petId,
        name: record?.petName || '',
        species: record?.petSpecies || ''
      };
    });
  
  // Handle filtering
  const getFilteredRecords = () => {
    return medicalRecords.filter(record => {
      // Filter by tab
      if (activeTab === 'upcoming' && record.status !== 'upcoming') return false;
      if (activeTab === 'completed' && record.status !== 'completed') return false;
      if (activeTab === 'overdue' && record.status !== 'overdue') return false;
      
      // Filter by search
      if (searchText && !record.reason.toLowerCase().includes(searchText.toLowerCase()) &&
          !record.petName.toLowerCase().includes(searchText.toLowerCase())) return false;
      
      // Filter by pet
      if (filters.pet && record.petId !== filters.pet) return false;
      
      // Filter by status
      if (filters.status && record.status !== filters.status) return false;
      
      return true;
    });
  };
  
  const filteredRecords = getFilteredRecords();
  
  const clearFilters = () => {
    setFilters({
      pet: '',
      status: '',
    });
    setSearchText('');
  };
  
  const hasActiveFilters = filters.pet || filters.status || searchText;
  
  return (
    <Layout>
      <div className="space-y-8">
        <SectionHeader 
          title="Medical Records" 
          description="Track vet visits, diagnoses, and treatments" 
          buttonText="Add New Record"
          buttonLink="/records/new"
        />
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList className="mb-0">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => navigate('/reports')}
            >
              <Calendar className="h-4 w-4" /> View Calendar
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search records..." 
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
                  Filters Active
                  <X className="h-3 w-3" />
                </Badge>
              )}
              
              <Select defaultValue="date-desc">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="pet">Pet Name</SelectItem>
                  <SelectItem value="vet">Veterinarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {showFilters && (
            <div className="bg-accent/50 border border-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pet</label>
                <Select 
                  value={filters.pet} 
                  onValueChange={(value) => setFilters({...filters, pet: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Pets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_pets">All Pets</SelectItem>
                    {uniquePets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <div key={record.id} className="animate-slideIn">
                  <div className="mb-2 px-1">
                    <span className="text-sm font-medium">{record.petName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                  </div>
                  <MedicalRecordCard 
                    date={record.date}
                    veterinarian={record.veterinarian}
                    reason={record.reason}
                    diagnosis={record.diagnosis}
                    treatment={record.treatment}
                    hasAttachments={record.hasAttachments}
                    status={record.status}
                  />
                </div>
              ))}
            </div>
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No medical records match your search criteria.</p>
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
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <div key={record.id} className="animate-slideIn">
                  <div className="mb-2 px-1">
                    <span className="text-sm font-medium">{record.petName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                  </div>
                  <MedicalRecordCard 
                    date={record.date}
                    veterinarian={record.veterinarian}
                    reason={record.reason}
                    diagnosis={record.diagnosis}
                    treatment={record.treatment}
                    hasAttachments={record.hasAttachments}
                    status={record.status}
                  />
                </div>
              ))}
            </div>
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No upcoming appointments match your search criteria.</p>
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
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <div key={record.id} className="animate-slideIn">
                  <div className="mb-2 px-1">
                    <span className="text-sm font-medium">{record.petName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                  </div>
                  <MedicalRecordCard 
                    date={record.date}
                    veterinarian={record.veterinarian}
                    reason={record.reason}
                    diagnosis={record.diagnosis}
                    treatment={record.treatment}
                    hasAttachments={record.hasAttachments}
                    status={record.status}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <div key={record.id} className="animate-slideIn">
                  <div className="mb-2 px-1">
                    <span className="text-sm font-medium">{record.petName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                  </div>
                  <MedicalRecordCard 
                    date={record.date}
                    veterinarian={record.veterinarian}
                    reason={record.reason}
                    diagnosis={record.diagnosis}
                    treatment={record.treatment}
                    hasAttachments={record.hasAttachments}
                    status={record.status}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
