
import React from 'react';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import OwnerCard from '@/components/ui-components/OwnerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

// Mock data
const owners = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA 12345',
    petCount: 2
  },
  {
    id: '2',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Somewhere, USA 67890',
    petCount: 3
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine Rd, Nowhere, USA 54321',
    petCount: 1
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '(555) 321-0987',
    address: '321 Elm St, Anywhere, USA 10293',
    petCount: 2
  }
];

const Owners: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <SectionHeader 
          title="Owner Profiles" 
          description="Manage pet owners information" 
          buttonText="Add New Owner"
          buttonLink="/owners/new"
        />
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search owners..." 
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Sort: Name A-Z
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {owners.map((owner) => (
            <OwnerCard key={owner.id} {...owner} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Owners;
