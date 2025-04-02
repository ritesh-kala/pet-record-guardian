
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Plus, FileDown, Calendar } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PetExpense, Pet } from '@/lib/types';
import { getPetExpenses, getAllExpenses, getExpensesByDateRange } from '@/lib/services/expenseService';
import { getAllPets } from '@/lib/services/petService';
import ExpenseEntryForm from './ExpenseEntryForm';
import ExpensesTable from './ExpensesTable';
import ExpenseCharts from './ExpenseCharts';
import ExpenseSummary from './ExpenseSummary';

interface ExpenseManagerProps {
  petId?: string;
  initialActiveTab?: string;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  petId,
  initialActiveTab = 'list',
}) => {
  // State
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PetExpense | undefined>(undefined);
  const [selectedPetFilter, setSelectedPetFilter] = useState<string | undefined>(petId);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date()),
  });

  // Fetch pets data
  const {
    data: pets = [],
    isLoading: isPetsLoading,
  } = useQuery({
    queryKey: ['pets'],
    queryFn: getAllPets,
  });

  // Fetch expenses data
  const {
    data: expenses = [],
    isLoading: isExpensesLoading,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ['expenses', selectedPetFilter, dateRange],
    queryFn: async () => {
      if (selectedPetFilter) {
        return getExpensesByDateRange(
          selectedPetFilter,
          format(dateRange.from, 'yyyy-MM-dd'),
          format(dateRange.to, 'yyyy-MM-dd')
        );
      } else {
        return getExpensesByDateRange(
          null,
          format(dateRange.from, 'yyyy-MM-dd'),
          format(dateRange.to, 'yyyy-MM-dd')
        );
      }
    },
  });

  // Reset selected pet filter when petId prop changes
  useEffect(() => {
    setSelectedPetFilter(petId);
  }, [petId]);

  // Handle expense form submission success
  const handleExpenseSubmitSuccess = () => {
    setIsAddExpenseOpen(false);
    setEditingExpense(undefined);
    refetchExpenses();
  };

  // Handle expense edit
  const handleEditExpense = (expense: PetExpense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  // Handle expense delete
  const handleExpenseDeleted = () => {
    refetchExpenses();
  };

  // Format date range for display
  const formatDateRange = () => {
    return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  // Handle all pets selection
  const handleSelectAllPets = () => {
    setSelectedPetFilter(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {!petId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
              <Select
                value={selectedPetFilter || 'all'}
                onValueChange={(value) => setSelectedPetFilter(value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pets</SelectItem>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id || ''}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({
                          from: range.from,
                          to: range.to,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {isExpensesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ExpensesTable
              expenses={expenses}
              onEdit={handleEditExpense}
              onDeleted={handleExpenseDeleted}
              pets={pets}
            />
          )}
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-6">
          {isExpensesLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, index) => (
                  <Skeleton key={index} className="h-72 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <ExpenseSummary expenses={expenses} />
              <ExpenseCharts expenses={expenses} />
              
              <div className="bg-accent/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Recent Expenses</h3>
                <ExpensesTable
                  expenses={expenses.slice(0, 5)}
                  onEdit={handleEditExpense}
                  onDeleted={handleExpenseDeleted}
                  pets={pets}
                />
                {expenses.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setActiveTab('list')}>
                      View All Expenses
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update expense details below.'
                : 'Enter the details for the new expense.'}
            </DialogDescription>
          </DialogHeader>
          
          {isPetsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ExpenseEntryForm
              pets={pets}
              expense={editingExpense}
              onSuccess={handleExpenseSubmitSuccess}
              defaultPetId={petId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManager;
