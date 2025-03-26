
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import OwnerCard from '@/components/ui-components/OwnerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOwners, Owner } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';

const Owners: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setIsLoading(true);
        const ownersData = await getOwners();
        setOwners(ownersData);
        setFilteredOwners(ownersData);
      } catch (error) {
        console.error('Error fetching owners:', error);
        toast({
          title: "Error",
          description: "Failed to load owners. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwners();
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter(owner => 
        owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (owner.phone && owner.phone.includes(searchQuery))
      );
      setFilteredOwners(filtered);
    }
  }, [searchQuery, owners]);

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    
    const sorted = [...filteredOwners].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    
    setFilteredOwners(sorted);
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSort}>
              Sort: Name {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOwners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredOwners.map((owner) => (
              <OwnerCard 
                key={owner.id} 
                id={owner.id || ''}
                name={owner.name} 
                email={owner.email} 
                phone={owner.phone || ''} 
                address={owner.address || ''} 
                petCount={0} // We'll update this later
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No Owners Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'No owners match your search criteria.' : 'You haven\'t added any owners yet.'}
            </p>
            <Button onClick={() => navigate('/owners/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Owner
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Owners;
