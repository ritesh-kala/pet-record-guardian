
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, DollarSign } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { getPet } from '@/lib/services/petService';
import PetDetailTabs from '@/components/ui-components/PetDetailTabs';
import ExpenseManager from '@/components/expenses/ExpenseManager';
import SectionHeader from '@/components/ui-components/SectionHeader';

const PetExpenses = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch pet data
  const {
    data: pet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => getPet(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-muted rounded"></div>
            <div className="h-6 w-64 bg-muted rounded"></div>
            <div className="h-[500px] bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !pet) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Pet not found</h2>
            <p className="text-muted-foreground mb-6">
              The pet you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/pets')}>Back to Pets</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="gap-1 mb-2 -ml-3"
            onClick={() => navigate(`/pets/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Pet Profile
          </Button>

          <SectionHeader
            title={`${pet.name}'s Expenses`}
            description="Track and manage expenses for your pet"
            icon={<DollarSign />}
          />
        </div>

        <PetDetailTabs petId={id || ''} activeTab="expenses" />

        <div className="mt-8">
          <ExpenseManager petId={id} />
        </div>
      </div>
    </Layout>
  );
};

export default PetExpenses;
