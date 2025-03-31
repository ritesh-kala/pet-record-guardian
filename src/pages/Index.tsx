import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hero from '@/components/ui-components/Hero';
import PetCard from '@/components/ui-components/PetCard';
import MedicalRecordCard from '@/components/ui-components/MedicalRecordCard';
import StatsCard from '@/components/ui-components/StatsCard';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { PawPrint, Stethoscope, User, CalendarClock, Loader2 } from 'lucide-react';
import { getPets, getOwners, getMedicalRecords, getAppointments } from '@/lib/supabaseService';

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [statistics, setStatistics] = useState([
    {
      title: 'Total Pets',
      value: 0,
      icon: PawPrint,
      trend: { value: 0, isPositive: true },
      color: 'primary' as const
    },
    {
      title: 'Owners',
      value: 0,
      icon: User,
      trend: { value: 0, isPositive: true },
      color: 'warning' as const
    },
    {
      title: 'Medical Records',
      value: 0,
      icon: Stethoscope,
      trend: { value: 0, isPositive: true },
      color: 'success' as const
    },
    {
      title: 'Upcoming Appointments',
      value: 0,
      icon: CalendarClock,
      description: 'Next: None scheduled',
      color: 'info' as const
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch pets
        const petsData = await getPets();
        setPets(petsData.slice(0, 3)); // Display up to 3 pets
        
        // Fetch medical records
        const recordsData = await getMedicalRecords();
        setRecords(recordsData.slice(0, 3)); // Display up to 3 records
        
        // Fetch owners
        const ownersData = await getOwners();
        
        // Fetch upcoming appointments
        const today = new Date().toISOString().split('T')[0];
        const appointmentsData = await getAppointments(undefined, today);
        
        // Get next appointment date if any
        let nextAppointmentDate = 'None scheduled';
        if (appointmentsData.length > 0) {
          // Sort appointments by date
          appointmentsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const nextAppointment = appointmentsData[0];
          nextAppointmentDate = new Date(nextAppointment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
        
        // Update statistics
        setStatistics([
          {
            title: 'Total Pets',
            value: petsData.length,
            icon: PawPrint,
            trend: { value: 0, isPositive: true },
            color: 'primary' as const
          },
          {
            title: 'Owners',
            value: ownersData.length,
            icon: User,
            trend: { value: 0, isPositive: true },
            color: 'warning' as const
          },
          {
            title: 'Medical Records',
            value: recordsData.length,
            icon: Stethoscope,
            trend: { value: 0, isPositive: true },
            color: 'success' as const
          },
          {
            title: 'Upcoming Appointments',
            value: appointmentsData.length,
            icon: CalendarClock,
            description: `Next: ${nextAppointmentDate}`,
            color: 'info' as const
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <Hero />
      
      <div className="mt-10 space-y-12">
        <section>
          <SectionHeader 
            title="Dashboard" 
            description="Overview of your pet care statistics"
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {statistics.map((stat, index) => (
                <Link 
                  key={index} 
                  to={index === 0 ? '/pets' : index === 1 ? '/owners' : index === 2 ? '/records' : '/calendar'}
                  className="block hover:no-underline"
                >
                  <StatsCard 
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    description={stat.description}
                    trend={stat.trend}
                    color={stat.color}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <SectionHeader 
            title="Recent Pets" 
            description="Quick access to your pet profiles" 
            buttonText="View All Pets"
            buttonLink="/pets"
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No pets found. Add a pet to get started.</p>
              <Link to="/pets/new" className="text-primary hover:underline mt-2 inline-block">
                Add Your First Pet
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pets.map((pet) => (
                <Link key={pet.id} to={`/pets/${pet.id}`} className="block hover:no-underline">
                  <PetCard {...pet} />
                </Link>
              ))}
            </div>
          )}
        </section>
        
        <section>
          <SectionHeader 
            title="Recent Medical Records" 
            description="Latest vet visits and treatments" 
            buttonText="View All Records"
            buttonLink="/records"
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No medical records found. Add a record to get started.</p>
              <Link to="/records/new" className="text-primary hover:underline mt-2 inline-block">
                Add Your First Medical Record
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {records.map((record) => (
                <Link key={record.id} to={`/records/${record.id}`} className="block hover:no-underline">
                  <MedicalRecordCard 
                    recordId={record.id}
                    petId={record.pet_id}
                    petName={record.pet_name || record.pet?.name || 'Unknown'}
                    date={new Date(record.visit_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    veterinarian={record.veterinarian || 'Unknown'}
                    reason={record.reason_for_visit || 'Check-up'}
                    diagnosis={record.diagnosis}
                    treatment={record.treatment}
                    hasAttachments={false}
                    status="completed"
                    type={record.type || 'Visit'}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
