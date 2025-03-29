
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Pets from '@/pages/Pets';
import Owners from '@/pages/Owners';
import NewPet from '@/pages/NewPet';
import NewOwner from '@/pages/NewOwner';
import PetDetails from '@/pages/PetDetails';
import OwnerDetails from '@/pages/OwnerDetails';
import MedicalRecords from '@/pages/MedicalRecords';
import NewMedicalRecord from '@/pages/NewMedicalRecord';
import MedicalRecordDetails from '@/pages/MedicalRecordDetails';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import EditPet from '@/pages/EditPet';
import EditOwner from '@/pages/EditOwner';
import EditMedicalRecord from '@/pages/EditMedicalRecord';
import NewAppointment from '@/pages/NewAppointment';
import EditAppointment from '@/pages/EditAppointment';
import CalendarView from '@/pages/CalendarView';

import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            
            {/* Pets */}
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/new" element={<NewPet />} />
            <Route path="/pets/:id" element={<PetDetails />} />
            <Route path="/pets/:id/edit" element={<EditPet />} />
            
            {/* Owners */}
            <Route path="/owners" element={<Owners />} />
            <Route path="/owners/new" element={<NewOwner />} />
            <Route path="/owners/:id" element={<OwnerDetails />} />
            <Route path="/owners/:id/edit" element={<EditOwner />} />
            
            {/* Medical Records */}
            <Route path="/records" element={<MedicalRecords />} />
            <Route path="/records/new" element={<NewMedicalRecord />} />
            <Route path="/records/:id" element={<MedicalRecordDetails />} />
            <Route path="/records/:id/edit" element={<EditMedicalRecord />} />
            
            {/* Appointments */}
            <Route path="/appointments/new" element={<NewAppointment />} />
            <Route path="/appointments/:id/edit" element={<EditAppointment />} />
            
            {/* Calendar */}
            <Route path="/calendar" element={<CalendarView />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
