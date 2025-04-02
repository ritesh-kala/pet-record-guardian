
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PetExpense, ExpenseCategory, Pet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addExpense, updateExpense, uploadReceipt } from '@/lib/services/expenseService';

const expenseFormSchema = z.object({
  pet_id: z.string().min(1, { message: 'Please select a pet' }),
  expense_date: z.date({
    required_error: 'Please select a date',
  }),
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be positive' })
    .min(0.01, { message: 'Amount must be at least 0.01' }),
  category: z.enum(['veterinary', 'medication', 'food', 'supplies', 'grooming', 'other'], {
    required_error: 'Please select a category',
  }),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseEntryFormProps {
  pets: Pet[];
  expense?: PetExpense;
  onSuccess: () => void;
  defaultPetId?: string;
}

const ExpenseEntryForm: React.FC<ExpenseEntryFormProps> = ({
  pets,
  expense,
  onSuccess,
  defaultPetId,
}) => {
  const { toast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get default values for form
  const defaultValues: Partial<ExpenseFormValues> = {
    pet_id: expense?.pet_id || defaultPetId || '',
    expense_date: expense?.expense_date ? new Date(expense.expense_date) : new Date(),
    amount: expense?.amount || undefined,
    category: (expense?.category as ExpenseCategory) || (localStorage.getItem('lastUsedCategory') as ExpenseCategory || 'other'),
    description: expense?.description || '',
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  });

  // Display receipt preview if available
  useEffect(() => {
    if (expense?.receipt_url) {
      setPreviewUrl(expense.receipt_url);
    }
  }, [expense]);

  // Handle receipt file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear receipt file
  const clearReceiptFile = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
  };

  // Handle form submission
  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Save last used category to localStorage
      localStorage.setItem('lastUsedCategory', data.category);
      
      let receiptUrl = expense?.receipt_url || null;
      
      // Upload receipt if selected
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile, data.pet_id);
      }
      
      // Prepare expense data
      const expenseData: PetExpense = {
        ...expense,
        pet_id: data.pet_id,
        expense_date: format(data.expense_date, 'yyyy-MM-dd'),
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        receipt_url: receiptUrl,
      };
      
      // Update or add expense
      if (expense?.id) {
        await updateExpense(expenseData);
        toast({
          title: 'Expense updated',
          description: 'The expense has been updated successfully.',
        });
      } else {
        await addExpense(expenseData);
        toast({
          title: 'Expense added',
          description: 'The expense has been added successfully.',
        });
      }
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pet_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id || ''}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    ₹
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="veterinary">Veterinary</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best fits this expense.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description of the expense"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about what this expense was for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Receipt (Optional)</FormLabel>
          <div className="border border-dashed border-input rounded-md p-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="max-h-48 mx-auto rounded-md object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearReceiptFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload a receipt image
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
              </div>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : expense?.id ? 'Update Expense' : 'Add Expense'}
        </Button>
      </form>
    </Form>
  );
};

export default ExpenseEntryForm;
