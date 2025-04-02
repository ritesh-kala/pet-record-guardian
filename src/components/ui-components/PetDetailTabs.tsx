
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, Pill, Activity, IndianRupee } from 'lucide-react';

interface PetDetailTabsProps {
  petId: string;
  activeTab: string;
}

const PetDetailTabs: React.FC<PetDetailTabsProps> = ({ petId, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger 
          value="info" 
          onClick={() => handleTabChange('overview')}
          data-state={activeTab === 'info' ? 'active' : 'inactive'}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="health" 
          onClick={() => handleTabChange('records')}
          data-state={activeTab === 'health' ? 'active' : 'inactive'}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Records</span>
        </TabsTrigger>
        <TabsTrigger 
          value="medications" 
          onClick={() => handleTabChange('medications')}
          data-state={activeTab === 'medications' ? 'active' : 'inactive'}
          className="flex items-center gap-2"
        >
          <Pill className="h-4 w-4" />
          <span className="hidden sm:inline">Medications</span>
        </TabsTrigger>
        <TabsTrigger 
          value="appointments" 
          onClick={() => handleTabChange('appointments')}
          data-state={activeTab === 'appointments' ? 'active' : 'inactive'}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Appointments</span>
        </TabsTrigger>
        <TabsTrigger 
          value="expenses" 
          onClick={() => handleTabChange('expenses')}
          data-state={activeTab === 'expenses' ? 'active' : 'inactive'}
          className="flex items-center gap-2"
        >
          <IndianRupee className="h-4 w-4" />
          <span className="hidden sm:inline">Expenses</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default PetDetailTabs;
