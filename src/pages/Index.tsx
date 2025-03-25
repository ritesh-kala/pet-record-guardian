
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hero from '@/components/ui-components/Hero';
import PetCard from '@/components/ui-components/PetCard';
import MedicalRecordCard from '@/components/ui-components/MedicalRecordCard';
import StatsCard from '@/components/ui-components/StatsCard';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { PawPrint, Stethoscope, User, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const recentPets = [
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
  }
];

const recentRecords = [
  {
    id: '1',
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
    date: 'May 20, 2023',
    veterinarian: 'Johnson',
    reason: 'Vaccination',
    status: 'upcoming' as const
  },
  {
    id: '3',
    date: 'March 5, 2023',
    veterinarian: 'Williams',
    reason: 'Skin Condition',
    diagnosis: 'Allergic Dermatitis',
    treatment: 'Prescribed antihistamines and medicated shampoo',
    status: 'completed' as const
  }
];

const statistics = [
  {
    title: 'Total Pets',
    value: 12,
    icon: PawPrint,
    trend: { value: 8, isPositive: true },
    color: 'primary' as const
  },
  {
    title: 'Owners',
    value: 5,
    icon: User,
    trend: { value: 2, isPositive: true },
    color: 'warning' as const
  },
  {
    title: 'Medical Records',
    value: 24,
    icon: Stethoscope,
    trend: { value: 12, isPositive: true },
    color: 'success' as const
  },
  {
    title: 'Upcoming Appointments',
    value: 3,
    icon: CalendarClock,
    description: 'Next: May 20, 2023',
    color: 'info' as const
  }
];

const Index: React.FC = () => {
  return (
    <Layout>
      <Hero />
      
      <div className="mt-10 space-y-12">
        <section>
          <SectionHeader 
            title="Dashboard" 
            description="Overview of your pet care statistics"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {statistics.map((stat, index) => (
              <StatsCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
                color={stat.color}
              />
            ))}
          </div>
        </section>
        
        <section>
          <SectionHeader 
            title="Recent Pets" 
            description="Quick access to your pet profiles" 
            buttonText="View All Pets"
            buttonLink="/pets"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {recentPets.map((pet) => (
              <PetCard key={pet.id} {...pet} />
            ))}
          </div>
        </section>
        
        <section>
          <SectionHeader 
            title="Recent Medical Records" 
            description="Latest vet visits and treatments" 
            buttonText="View All Records"
            buttonLink="/records"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {recentRecords.map((record, index) => (
              <MedicalRecordCard key={index} {...record} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
