import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, addWeeks, addMonths, addYears, isAfter } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Appointment, createAppointment, updateAppointment } from '@/lib/supabaseService';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  pet_id: z.string().min(1, 'Pet is required'),
  date: z.date({
    required_error: 'Appointment date is required',
  }),
  time: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional().nullable(),
  recurrence_end_date: z.date().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'canceled', 'missed']).default('scheduled'),
});

type FormData = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  petId: string;
  appointment?: Appointment;
  isEditing?: boolean;
  initialDate?: Date;
  readOnly?: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  petId, 
  appointment, 
  isEditing = false,
  initialDate,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRecurring, setIsRecurring] = useState(appointment?.is_recurring || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  const calculateSuggestedEndDate = (startDate: Date, pattern: string | null): Date | null => {
    if (!pattern || !startDate) return null;
    
    switch (pattern) {
      case 'daily':
        return addDays(startDate, 14); // 2 weeks for daily
      case 'weekly':
        return addWeeks(startDate, 12); // 12 weeks for weekly
      case 'monthly':
        return addMonths(startDate, 6); // 6 months for monthly
      case 'yearly':
        return addYears(startDate, 2); // 2 years for yearly
      default:
        return null;
    }
  };

  const defaultValues: Partial<FormData> = {
    pet_id: petId,
    date: initialDate || new Date(),
    is_recurring: false,
    status: 'scheduled',
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: appointment
      ? {
          ...defaultValues,
          pet_id: appointment.pet_id,
          date: appointment.date ? new Date(appointment.date) : new Date(),
          time: appointment.time || '',
          reason: appointment.reason || '',
          notes: appointment.notes || '',
          is_recurring: appointment.is_recurring || false,
          recurrence_pattern: appointment.recurrence_pattern || null,
          recurrence_end_date: appointment.recurrence_end_date ? new Date(appointment.recurrence_end_date) : null,
          status: appointment.status || 'scheduled',
        }
      : defaultValues,
  });

  useEffect(() => {
    setIsRecurring(form.watch('is_recurring'));
    
    const subscription = form.watch((value, { name }) => {
      if (name === 'recurrence_pattern' && value.recurrence_pattern && value.date) {
        const suggestedEndDate = calculateSuggestedEndDate(
          value.date as Date, 
          value.recurrence_pattern as string
        );
        
        if (suggestedEndDate && (!value.recurrence_end_date || isAfter(value.date as Date, value.recurrence_end_date as Date))) {
          form.setValue('recurrence_end_date', suggestedEndDate);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  const onSubmit = async (data: FormData) => {
    if (readOnly) {
      navigate(`/pets/${petId}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formattedData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        recurrence_end_date: data.recurrence_end_date ? format(data.recurrence_end_date, 'yyyy-MM-dd') : null,
      };
      
      if (isEditing && appointment?.id) {
        await updateAppointment(appointment.id, formattedData);
        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        await createAppointment({
          ...formattedData,
          pet_id: petId,
        });
        toast({
          title: 'Success',
          description: 'Appointment created successfully',
        });
      }
      navigate(`/pets/${petId}`);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'canceled': return 'text-red-600';
      case 'missed': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = appointment ? new Date(appointment.date) < today : false;
  const canChangeStatus = isEditing;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {readOnly && (
          <Alert className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a {appointment?.status} appointment and cannot be modified.
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Appointment Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                      disabled={readOnly}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => !isEditing && date < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {isPastDate && !readOnly && (
                <FormDescription className="text-amber-500">
                  This is a past date. Consider updating to a future date.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time (optional)</FormLabel>
              <FormControl>
                <div className="flex">
                  <Clock className="mr-2 h-4 w-4 opacity-50 self-center" />
                  <Input 
                    placeholder="eg. 10:00 AM" 
                    {...field} 
                    disabled={readOnly} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Reason for appointment" 
                  {...field} 
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes" 
                  {...field} 
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recurring Appointment</FormLabel>
                <FormDescription>
                  Set this appointment to repeat at regular intervals
                </FormDescription>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && (
          <>
            <FormField
              control={form.control}
              name="recurrence_pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence Pattern</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often this appointment should repeat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence_end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          disabled={readOnly}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick an end date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < (form.watch('date') || today)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date when this recurring appointment will stop repeating
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isEditing && canChangeStatus && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Status</FormLabel>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => setShowStatusInfo(!showStatusInfo)}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
                {showStatusInfo && (
                  <Alert className="mb-2 bg-muted">
                    <AlertDescription>
                      <ul className="text-sm list-disc pl-4 space-y-1">
                        <li><span className="text-blue-600 font-medium">Scheduled</span>: Upcoming appointment</li>
                        <li><span className="text-green-600 font-medium">Completed</span>: Pet attended the appointment</li>
                        <li><span className="text-red-600 font-medium">Canceled</span>: Appointment was canceled</li>
                        <li><span className="text-amber-600 font-medium">Missed</span>: Pet missed the appointment</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue className={getStatusColor(field.value)}>
                        {field.value.charAt(0).toUpperCase() + field.value.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled" className="text-blue-600">Scheduled</SelectItem>
                    <SelectItem value="completed" className="text-green-600">Completed</SelectItem>
                    <SelectItem value="canceled" className="text-red-600">Canceled</SelectItem>
                    <SelectItem value="missed" className="text-amber-600">Missed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || readOnly}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {readOnly ? 'Close' : isEditing ? 'Update Appointment' : 'Create Appointment'}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AppointmentForm;
