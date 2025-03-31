
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import MedicalRecordCard from '@/components/ui-components/MedicalRecordCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Loader2, FilePlus, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getMedicalRecords, getAppointments, getPets, MedicalRecord, Appointment, Pet } from '@/lib/supabaseService';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petFilter, setPetFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [medicalRecordsData, appointmentsData, petsData] = await Promise.all([
          getMedicalRecords(),
          getAppointments(),
          getPets()
        ]);
        
        setRecords(medicalRecordsData);
        setFilteredRecords(medicalRecordsData);
        setAppointments(appointmentsData);
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    let filtered = records;
    
    if (searchQuery) {
      filtered = filtered.filter(record => 
        (record.reason_for_visit && record.reason_for_visit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (record.diagnosis && record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (record.veterinarian && record.veterinarian.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (petFilter) {
      filtered = filtered.filter(record => record.pet_id === petFilter);
    }
    
    if (activeTab === 'recent') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter(record => new Date(record.visit_date) >= thirtyDaysAgo);
    }
    
    setFilteredRecords(filtered);
  }, [searchQuery, petFilter, activeTab, records]);

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePetFilterChange = (value: string) => {
    setPetFilter(value);
  };

  // Sort appointments from newest to oldest (upcoming first)
  const sortedUpcomingAppointments = appointments
    .filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Badge variants based on appointment status
  const getAppointmentBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      case 'missed': return 'default';
      default: return 'outline';
    }
  };

  // Format date with time if available
  const formatAppointmentDateTime = (date: string, time?: string | null) => {
    return `${format(new Date(date), 'PPP')}${time ? ` at ${time}` : ''}`;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <SectionHeader 
          title="Medical Records" 
          description="Track your pets' health history"
          buttonText="Add New Record"
          buttonLink="/records/new"
        />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search records..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={petFilter} onValueChange={handlePetFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Pets" />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Pets</SelectItem>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id || ''}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map(record => (
                  <MedicalRecordCard 
                    key={record.id}
                    recordId={record.id!}
                    petId={record.pet_id}
                    petName={getPetName(record.pet_id)}
                    date={format(new Date(record.visit_date), 'PPP')}
                    type={record.type || 'Other'}
                    reason={record.reason_for_visit}
                    diagnosis={record.diagnosis || ''}
                    veterinarian={record.veterinarian || ''}
                    onClick={() => navigate(`/records/${record.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Records Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || petFilter ? 'No records match your search criteria.' : 'You haven\'t added any medical records yet.'}
                </p>
                <Button onClick={() => navigate('/records/new')}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add New Record
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map(record => (
                  <MedicalRecordCard 
                    key={record.id}
                    recordId={record.id!}
                    petId={record.pet_id}
                    petName={getPetName(record.pet_id)}
                    date={format(new Date(record.visit_date), 'PPP')}
                    type={record.type || 'Other'}
                    reason={record.reason_for_visit}
                    diagnosis={record.diagnosis || ''}
                    veterinarian={record.veterinarian || ''}
                    onClick={() => navigate(`/records/${record.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Recent Records</h3>
                <p className="text-muted-foreground mb-6">
                  No medical records in the last 30 days.
                </p>
                <Button onClick={() => navigate('/records/new')}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add New Record
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 border-t pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
            <Button onClick={() => navigate('/calendar')} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedUpcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedUpcomingAppointments.slice(0, 6).map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                >
                  <div className="mb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{appointment.reason || 'Appointment'}</h3>
                      <Badge variant={getAppointmentBadgeVariant(appointment.status || 'scheduled')}>
                        {appointment.status || 'scheduled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pet: {getPetName(appointment.pet_id)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 inline" />
                      {formatAppointmentDateTime(appointment.date, appointment.time)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                  {appointment.is_recurring && (
                    <Badge variant="outline" className="mt-2">
                      Recurring: {appointment.recurrence_pattern || 'custom'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground mb-4">No upcoming appointments scheduled</p>
              <Button onClick={() => navigate('/appointments/new')}>
                Schedule an Appointment
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
