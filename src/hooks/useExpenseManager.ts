
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { PetExpense, Pet } from '@/lib/types';
import { getExpensesByDateRange } from '@/lib/services/expenseService';
import { getPets } from '@/lib/services/petService';

interface UseExpenseManagerProps {
  petId?: string;
  initialActiveTab?: string;
}

export function useExpenseManager({ petId, initialActiveTab = 'list' }: UseExpenseManagerProps) {
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
    queryFn: () => getPets(),
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

  return {
    activeTab,
    setActiveTab,
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    editingExpense,
    setEditingExpense,
    selectedPetFilter,
    setSelectedPetFilter,
    dateRange,
    setDateRange,
    expenses,
    isExpensesLoading,
    pets,
    isPetsLoading,
    refetchExpenses,
    handleExpenseSubmitSuccess,
    handleEditExpense,
    handleExpenseDeleted,
    formatDateRange,
    handleSelectAllPets,
  };
}
