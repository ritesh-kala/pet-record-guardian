
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PetExpense, Pet } from '@/lib/types';
import ExpenseEntryForm from './ExpenseEntryForm';

interface ExpenseDialogsProps {
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  editingExpense: PetExpense | undefined;
  pets: Pet[];
  isPetsLoading: boolean;
  handleExpenseSubmitSuccess: () => void;
  defaultPetId?: string;
}

const ExpenseDialogs: React.FC<ExpenseDialogsProps> = ({
  isAddExpenseOpen,
  setIsAddExpenseOpen,
  editingExpense,
  pets,
  isPetsLoading,
  handleExpenseSubmitSuccess,
  defaultPetId,
}) => {
  return (
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
            defaultPetId={defaultPetId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialogs;
