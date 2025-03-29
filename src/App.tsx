
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Owners from "./pages/Owners";
import OwnerDetails from "./pages/OwnerDetails";
import NewOwner from "./pages/NewOwner";
import EditOwner from "./pages/EditOwner";
import Pets from "./pages/Pets";
import PetDetails from "./pages/PetDetails";
import NewPet from "./pages/NewPet";
import EditPet from "./pages/EditPet";
import MedicalRecords from "./pages/MedicalRecords";
import MedicalRecordDetails from "./pages/MedicalRecordDetails";
import NewMedicalRecord from "./pages/NewMedicalRecord";
import EditMedicalRecord from "./pages/EditMedicalRecord";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/owners" element={
              <ProtectedRoute>
                <Owners />
              </ProtectedRoute>
            } />
            <Route path="/owners/:id" element={
              <ProtectedRoute>
                <OwnerDetails />
              </ProtectedRoute>
            } />
            <Route path="/owners/new" element={
              <ProtectedRoute>
                <NewOwner />
              </ProtectedRoute>
            } />
            <Route path="/owners/edit/:id" element={
              <ProtectedRoute>
                <EditOwner />
              </ProtectedRoute>
            } />
            <Route path="/pets" element={
              <ProtectedRoute>
                <Pets />
              </ProtectedRoute>
            } />
            <Route path="/pets/:id" element={
              <ProtectedRoute>
                <PetDetails />
              </ProtectedRoute>
            } />
            <Route path="/pets/new" element={
              <ProtectedRoute>
                <NewPet />
              </ProtectedRoute>
            } />
            <Route path="/pets/edit/:id" element={
              <ProtectedRoute>
                <EditPet />
              </ProtectedRoute>
            } />
            <Route path="/records" element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            } />
            <Route path="/records/:id" element={
              <ProtectedRoute>
                <MedicalRecordDetails />
              </ProtectedRoute>
            } />
            <Route path="/records/new" element={
              <ProtectedRoute>
                <NewMedicalRecord />
              </ProtectedRoute>
            } />
            <Route path="/records/edit/:id" element={
              <ProtectedRoute>
                <EditMedicalRecord />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
