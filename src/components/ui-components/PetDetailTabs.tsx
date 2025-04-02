
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, Pill, Activity, IndianRupee } from 'lucide-react';

interface PetDetailTabsProps {
  petId: string;
  activeTab: string;
}

const PetDetailTabs: React.FC<PetDetailTabsProps> = ({ petId, activeTab }) => {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'overview':
        navigate(`/pets/${petId}`);
        break;
      case 'records':
        navigate(`/records?petId=${petId}`);
        break;
      case 'medications':
        navigate(`/medications?petId=${petId}`);
        break;
      case 'appointments':
        navigate(`/calendar?petId=${petId}`);
        break;
      case 'expenses':
        navigate(`/pets/${petId}/expenses`);
        break;
      default:
        navigate(`/pets/${petId}`);
    }
  };

  return (
    <div className="w-full mb-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger 
            value="info" 
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="health" 
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Records</span>
          </TabsTrigger>
          <TabsTrigger 
            value="medications" 
            className="flex items-center gap-2"
          >
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Medications</span>
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expenses" 
            className="flex items-center gap-2"
          >
            <IndianRupee className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PetDetailTabs;
