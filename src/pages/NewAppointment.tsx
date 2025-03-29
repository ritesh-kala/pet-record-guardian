
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { Card, CardContent } from '@/components/ui/card';

const NewAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const petId = id || searchParams.get('petId') || '';
  const navigate = useNavigate();

  if (!petId) {
    navigate('/pets');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="New Appointment"
          description="Schedule a new appointment for your pet"
          buttonText="Back to Pet"
          buttonLink={`/pets/${petId}`}
        />

        <Card>
          <CardContent className="pt-6">
            <AppointmentForm petId={petId} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewAppointment;
