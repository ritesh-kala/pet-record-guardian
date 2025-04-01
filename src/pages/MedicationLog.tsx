
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Calendar, Pill, Clock, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  getMedicationById, 
  createMedicationLog, 
  getMedicationLogsByMedicationId 
} from '@/lib/services/medicationService';
import { Separator } from '@/components/ui/separator';
import { Medication, MedicationLog as MedicationLogType } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MedicationLog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [medication, setMedication] = useState<Medication | null>(null);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('log');

  // Form state
  const [formState, setFormState] = useState({
    givenAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    givenBy: '',
    notes: '',
    skipped: false,
    skipReason: ''
  });

  useEffect(() => {
    const fetchMedicationData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const medicationData = await getMedicationById(id);
        setMedication(medicationData);
        
        const logsData = await getMedicationLogsByMedicationId(id);
        setMedicationLogs(logsData);
      } catch (error) {
        console.error('Error fetching medication data:', error);
        toast({
          title: "Error",
          description: "Failed to load medication data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedicationData();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSkippedChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, skipped: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setIsSaving(true);
    
    try {
      const logData = {
        medication_id: id,
        given_at: formState.givenAt,
        given_by: formState.givenBy || null,
        notes: formState.notes || null,
        skipped: formState.skipped,
        skip_reason: formState.skipped ? formState.skipReason || null : null
      };
      
      await createMedicationLog(logData);
      
      toast({
        title: "Success",
        description: formState.skipped ? "Dose skip recorded" : "Dose administration recorded",
        variant: "default"
      });
      
      // Refresh logs
      const logsData = await getMedicationLogsByMedicationId(id);
      setMedicationLogs(logsData);
      
      // Reset form
      setFormState({
        givenAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        givenBy: '',
        notes: '',
        skipped: false,
        skipReason: ''
      });
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      console.error('Error creating medication log:', error);
      toast({
        title: "Error",
        description: "Failed to record dose administration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!medication) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Medication Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested medication could not be found.</p>
          <Button onClick={() => navigate('/medications')}>Back to Medications</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/medications')} className="mr-4 p-0 h-auto">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-medium">{medication.name}</h2>
            <p className="text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Log Dose
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Log Medication Dose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="givenAt">Date & Time</Label>
                      <div className="relative">
                        <Input
                          id="givenAt"
                          name="givenAt"
                          type="datetime-local"
                          value={formState.givenAt}
                          onChange={handleInputChange}
                          required
                        />
                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="givenBy">Given By (Optional)</Label>
                      <Input
                        id="givenBy"
                        name="givenBy"
                        value={formState.givenBy}
                        onChange={handleInputChange}
                        placeholder="E.g., John Smith"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="skipped"
                        checked={formState.skipped}
                        onCheckedChange={handleSkippedChange}
                      />
                      <Label htmlFor="skipped">
                        Dose was skipped
                      </Label>
                    </div>

                    {formState.skipped && (
                      <div>
                        <Label htmlFor="skipReason">Reason for Skipping (Optional)</Label>
                        <Textarea
                          id="skipReason"
                          name="skipReason"
                          value={formState.skipReason}
                          onChange={handleInputChange}
                          placeholder="Why was this dose skipped?"
                          rows={2}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formState.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional notes"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : formState.skipped ? 'Record Skip' : 'Record Dose'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Medication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicationLogs.length > 0 ? (
                  <div className="space-y-4">
                    {medicationLogs.map((log, index) => (
                      <div key={log.id} className="p-4 border rounded-md">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {format(new Date(log.given_at), 'PPP')} at {format(new Date(log.given_at), 'h:mm a')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.given_by ? `Given by ${log.given_by}` : 'Administrator not specified'}
                            </div>
                          </div>
                          {log.skipped ? (
                            <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Skipped
                            </div>
                          ) : (
                            <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Administered
                            </div>
                          )}
                        </div>
                        
                        {(log.notes || log.skip_reason) && (
                          <>
                            <Separator className="my-3" />
                            {log.skip_reason && (
                              <div className="mt-2">
                                <span className="text-sm font-medium">Skip reason:</span>
                                <p className="text-sm mt-1">{log.skip_reason}</p>
                              </div>
                            )}
                            {log.notes && (
                              <div className="mt-2">
                                <span className="text-sm font-medium">Notes:</span>
                                <p className="text-sm mt-1">{log.notes}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No History</h3>
                    <p className="text-muted-foreground mb-6">
                      No medication doses have been recorded yet.
                    </p>
                    <Button onClick={() => setActiveTab('log')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Log Dose
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MedicationLog;
