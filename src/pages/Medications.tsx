
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/ui-components/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pill, AlertCircle, Clock, CalendarClock, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { getMedicationsByPetId, getActiveMedicationsByPetId } from '@/lib/supabaseService';

const Medications = () => {
  const [searchParams] = useSearchParams();
  const petId = searchParams.get('petId');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedications = async () => {
      setIsLoading(true);
      try {
        let medicationsData;
        
        if (petId) {
          medicationsData = await getMedicationsByPetId(petId);
        } else {
          // Show all active medications if no pet is selected
          medicationsData = [];
          // In a real app, this might fetch medications for all pets
          toast({
            title: "No pet selected",
            description: "Please select a pet to view their medications",
            variant: "default"
          });
        }
        
        setMedications(medicationsData);
      } catch (error) {
        console.error('Error fetching medications:', error);
        toast({
          title: "Error",
          description: "Failed to load medications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedications();
  }, [petId, toast]);

  const activeMedications = medications.filter(med => med.active);
  const inactiveMedications = medications.filter(med => !med.active);
  
  const needsRefill = (medication: any) => {
    if (!medication.refill_date) return false;
    const refillDate = parseISO(medication.refill_date);
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return isBefore(refillDate, oneWeekFromNow) && isAfter(refillDate, today) || isToday(refillDate);
  };

  const getMedicationStatus = (medication: any) => {
    if (needsRefill(medication)) {
      return { label: "Refill Soon", variant: "warning" as const };
    }
    if (medication.end_date && isBefore(parseISO(medication.end_date), new Date())) {
      return { label: "Completed", variant: "outline" as const };
    }
    return { label: "Active", variant: "success" as const };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SectionHeader
            title="Medications"
            description={petId ? "Manage pet medications and schedule" : "View and manage all pet medications"}
          />
          
          <Button 
            onClick={() => navigate(petId ? `/medications/new?petId=${petId}` : '/medications/new')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeMedications.length > 0 || inactiveMedications.length > 0 ? (
          <div className="space-y-6">
            {activeMedications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Active Medications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMedications.map((medication) => {
                    const status = getMedicationStatus(medication);
                    
                    return (
                      <Card key={medication.id} className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate(`/medications/${medication.id}`)}>
                        <CardHeader className="pb-2 flex flex-row justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Pill className="h-5 w-5 text-primary" />
                              {medication.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{medication.dosage}</p>
                          </div>
                          <Badge variant={
                            needsRefill(medication) ? "destructive" : "outline"
                          }>
                            {status.label}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Frequency:</span>
                              <span className="text-sm">{medication.frequency}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Started:</span>
                              <span className="text-sm">{format(new Date(medication.start_date), 'PPP')}</span>
                            </div>
                            
                            {medication.end_date && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Ends:</span>
                                <span className="text-sm">{format(new Date(medication.end_date), 'PPP')}</span>
                              </div>
                            )}
                            
                            {medication.refill_date && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Refill:</span>
                                <span className="text-sm">{format(new Date(medication.refill_date), 'PPP')}</span>
                              </div>
                            )}
                            
                            {needsRefill(medication) && (
                              <Alert variant="destructive" className="mt-2 py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Refill Needed</AlertTitle>
                                <AlertDescription>
                                  This medication needs to be refilled soon.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/medications/${medication.id}/log`);
                              }}>
                                <Clock className="h-4 w-4" />
                                Log Dose
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            
            {inactiveMedications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Past Medications</h2>
                <div className="space-y-2">
                  {inactiveMedications.map((medication) => (
                    <div 
                      key={medication.id}
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition cursor-pointer"
                      onClick={() => navigate(`/medications/${medication.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{medication.name}</h3>
                          <p className="text-sm text-muted-foreground">{medication.dosage} • Ended: {medication.end_date ? format(new Date(medication.end_date), 'PP') : 'N/A'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Medications</h3>
            <p className="text-muted-foreground mb-6">
              {petId 
                ? "This pet doesn't have any medications yet."
                : "No medications have been added yet."}
            </p>
            <Button onClick={() => navigate(petId ? `/medications/new?petId=${petId}` : '/medications/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Medications;
