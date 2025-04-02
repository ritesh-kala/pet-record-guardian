
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ExpensesTable from './ExpensesTable';
import ExpenseCharts from './ExpenseCharts';
import ExpenseSummary from './ExpenseSummary';
import { PetExpense } from '@/lib/types';

interface TabsManagerProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  expenses: PetExpense[];
  isExpensesLoading: boolean;
  handleEditExpense: (expense: PetExpense) => void;
  handleExpenseDeleted: () => void;
  petList: Array<{ id: string; name: string }>;
}

const TabsManager: React.FC<TabsManagerProps> = ({
  activeTab,
  setActiveTab,
  expenses,
  isExpensesLoading,
  handleEditExpense,
  handleExpenseDeleted,
  petList,
}) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            pets={petList}
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
                pets={petList}
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
  );
};

export default TabsManager;
