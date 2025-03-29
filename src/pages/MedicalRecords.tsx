
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import MedicalRecordCard from '@/components/ui-components/MedicalRecordCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, X, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMedicalRecords, getPets, MedicalRecord, Pet } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    pet: '',
    status: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const [medicalRecords, setMedicalRecords] = useState<Array<MedicalRecord & { petName?: string; petSpecies?: string }>>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all pets
        const petsData = await getPets();
        setPets(petsData);
        
        // Fetch all medical records
        const recordsData = await getMedicalRecords();
        
        // Map pet information to medical records
        const recordsWithPetInfo = await Promise.all(
          recordsData.map(async (record) => {
            const relatedPet = petsData.find(pet => pet.id === record.pet_id);
            return {
              ...record,
              petName: relatedPet?.name || 'Unknown Pet',
              petSpecies: relatedPet?.species || 'Unknown'
            };
          })
        );
        
        setMedicalRecords(recordsWithPetInfo);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load medical records. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Get unique pets for filter dropdown
  const uniquePets = pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    species: pet.species
  }));
  
  // Determine record status based on dates
  const getRecordStatus = (record: MedicalRecord): 'upcoming' | 'completed' | 'overdue' => {
    if (!record.visit_date) return 'completed';
    
    const visitDate = new Date(record.visit_date);
    const today = new Date();
    
    // If it's a future date
    if (visitDate > today) return 'upcoming';
    
    // Past visits are completed
    return 'completed';
  };
  
  // Handle filtering
  const getFilteredRecords = () => {
    return medicalRecords.filter(record => {
      // Add status to each record
      const status = getRecordStatus(record);
      
      // Filter by tab
      if (activeTab === 'upcoming' && status !== 'upcoming') return false;
      if (activeTab === 'completed' && status !== 'completed') return false;
      if (activeTab === 'overdue' && status !== 'overdue') return false;
      
      // Filter by search
      if (searchText && 
          !record.reason_for_visit?.toLowerCase().includes(searchText.toLowerCase()) &&
          !record.petName?.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      // Filter by pet
      if (filters.pet && record.pet_id !== filters.pet) return false;
      
      // Filter by status
      if (filters.status && status !== filters.status) return false;
      
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
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
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
                    <SelectItem value="">All Pets</SelectItem>
                    {uniquePets.map(pet => (
                      <SelectItem key={pet.id || 'unknown'} value={pet.id || ''}>
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
                    <SelectItem value="">All Statuses</SelectItem>
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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="animate-slideIn">
                    <div className="mb-2 px-1">
                      <span className="text-sm font-medium">{record.petName}</span>
                      <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <MedicalRecordCard 
                        date={formatDate(record.visit_date)}
                        veterinarian={record.veterinarian || 'Unknown'}
                        reason={record.reason_for_visit || 'Medical Visit'}
                        diagnosis={record.diagnosis || undefined}
                        treatment={record.treatment || undefined}
                        status={getRecordStatus(record)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-muted-foreground">No medical records match your search criteria.</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="animate-slideIn">
                    <div className="mb-2 px-1">
                      <span className="text-sm font-medium">{record.petName}</span>
                      <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <MedicalRecordCard 
                        date={formatDate(record.visit_date)}
                        veterinarian={record.veterinarian || 'Unknown'}
                        reason={record.reason_for_visit || 'Medical Visit'}
                        diagnosis={record.diagnosis || undefined}
                        treatment={record.treatment || undefined}
                        status="upcoming"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-muted-foreground">No upcoming appointments match your search criteria.</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="animate-slideIn">
                    <div className="mb-2 px-1">
                      <span className="text-sm font-medium">{record.petName}</span>
                      <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <MedicalRecordCard 
                        date={formatDate(record.visit_date)}
                        veterinarian={record.veterinarian || 'Unknown'}
                        reason={record.reason_for_visit || 'Medical Visit'}
                        diagnosis={record.diagnosis || undefined}
                        treatment={record.treatment || undefined}
                        status="completed"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-muted-foreground">No completed records match your search criteria.</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="animate-slideIn">
                    <div className="mb-2 px-1">
                      <span className="text-sm font-medium">{record.petName}</span>
                      <span className="text-xs text-muted-foreground ml-2">({record.petSpecies})</span>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/records/${record.id}`)}
                    >
                      <MedicalRecordCard 
                        date={formatDate(record.visit_date)}
                        veterinarian={record.veterinarian || 'Unknown'}
                        reason={record.reason_for_visit || 'Medical Visit'}
                        diagnosis={record.diagnosis || undefined}
                        treatment={record.treatment || undefined}
                        status="overdue"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-muted-foreground">No overdue appointments match your search criteria.</p>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
