
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Owners from "./pages/Owners";
import OwnerDetails from "./pages/OwnerDetails";
import NewOwner from "./pages/NewOwner";
import Pets from "./pages/Pets";
import PetDetails from "./pages/PetDetails";
import NewPet from "./pages/NewPet";
import MedicalRecords from "./pages/MedicalRecords";
import MedicalRecordDetails from "./pages/MedicalRecordDetails";
import NewMedicalRecord from "./pages/NewMedicalRecord";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/owners/:id" element={<OwnerDetails />} />
          <Route path="/owners/new" element={<NewOwner />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/pets/new" element={<NewPet />} />
          <Route path="/records" element={<MedicalRecords />} />
          <Route path="/records/:id" element={<MedicalRecordDetails />} />
          <Route path="/records/new" element={<NewMedicalRecord />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
