
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Owners from "./pages/Owners";
import Pets from "./pages/Pets";
import NewPet from "./pages/NewPet";
import MedicalRecords from "./pages/MedicalRecords";
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
          <Route path="/owners/:id" element={<NotFound />} />
          <Route path="/owners/new" element={<NotFound />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<NotFound />} />
          <Route path="/pets/new" element={<NewPet />} />
          <Route path="/records" element={<MedicalRecords />} />
          <Route path="/records/:id" element={<NotFound />} />
          <Route path="/records/new" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
