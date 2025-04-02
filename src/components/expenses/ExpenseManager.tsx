
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpenseManager } from '@/hooks/useExpenseManager';
import FilterSection from './FilterSection';
import ExpenseDialogs from './ExpenseDialogs';
import TabsManager from './TabsManager';

interface ExpenseManagerProps {
  petId?: string;
  initialActiveTab?: string;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  petId,
  initialActiveTab = 'list',
}) => {
  const {
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
    handleExpenseSubmitSuccess,
    handleEditExpense,
    handleExpenseDeleted,
    formatDateRange
  } = useExpenseManager({ petId, initialActiveTab });

  // Create pet list for rendering
  const petList = pets.map(pet => ({
    id: pet.id || '',  // Ensure id is always a string
    name: pet.name
  }));

  // Handle CSV export
  const handleExport = () => {
    const headers = ['Date', 'Amount (₹)', 'Category', 'Description', 'Pet'];
    
    const csvRows = [
      headers.join(','),
      ...expenses.map(expense => {
        const petName = petList.find(p => p.id === expense.pet_id)?.name || 'Unknown Pet';
        return [
          expense.expense_date,
          expense.amount.toFixed(2),
          expense.category,
          `"${expense.description?.replace(/"/g, '""') || ''}"`,
          petName
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pet-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <FilterSection
          selectedPetFilter={selectedPetFilter}
          onPetFilterChange={(value) => setSelectedPetFilter(value === 'all' ? undefined : value)}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          formatDateRange={formatDateRange}
          onExport={handleExport}
          petList={petList}
          petId={petId}
        />
        
        <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>
      
      <TabsManager
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expenses={expenses}
        isExpensesLoading={isExpensesLoading}
        handleEditExpense={handleEditExpense}
        handleExpenseDeleted={handleExpenseDeleted}
        petList={petList}
      />
      
      <ExpenseDialogs
        isAddExpenseOpen={isAddExpenseOpen}
        setIsAddExpenseOpen={setIsAddExpenseOpen}
        editingExpense={editingExpense}
        pets={pets}
        isPetsLoading={isPetsLoading}
        handleExpenseSubmitSuccess={handleExpenseSubmitSuccess}
        defaultPetId={petId}
      />
    </div>
  );
};

export default ExpenseManager;
