
import { supabase } from '@/integrations/supabase/client';
import { PetExpense } from '@/lib/types';

// Get all expenses for a specific pet
export const getPetExpenses = async (petId: string): Promise<PetExpense[]> => {
  const { data, error } = await supabase
    .from('pet_expenses')
    .select('*')
    .eq('pet_id', petId)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching pet expenses:', error);
    throw error;
  }

  return data as PetExpense[] || [];
};

// Get all expenses across all pets
export const getAllExpenses = async (): Promise<PetExpense[]> => {
  const { data, error } = await supabase
    .from('pet_expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching all expenses:', error);
    throw error;
  }

  return data as PetExpense[] || [];
};

// Add a new expense
export const addExpense = async (expense: PetExpense): Promise<PetExpense> => {
  const { data, error } = await supabase
    .from('pet_expenses')
    .insert({
      pet_id: expense.pet_id,
      expense_date: expense.expense_date,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      receipt_url: expense.receipt_url,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding expense:', error);
    throw error;
  }

  return data as PetExpense;
};

// Update an existing expense
export const updateExpense = async (expense: PetExpense): Promise<PetExpense> => {
  const { data, error } = await supabase
    .from('pet_expenses')
    .update({
      pet_id: expense.pet_id,
      expense_date: expense.expense_date,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      receipt_url: expense.receipt_url,
    })
    .eq('id', expense.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }

  return data as PetExpense;
};

// Delete an expense
export const deleteExpense = async (expenseId: string): Promise<void> => {
  const { error } = await supabase
    .from('pet_expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Upload a receipt image
export const uploadReceipt = async (
  file: File,
  petId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${petId}/${Date.now()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('pet-expenses')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading receipt:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('pet-expenses')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Get expenses by date range
export const getExpensesByDateRange = async (
  petId: string | null,
  startDate: string,
  endDate: string
): Promise<PetExpense[]> => {
  let query = supabase
    .from('pet_expenses')
    .select('*')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }

  return data as PetExpense[] || [];
};

// Get expenses by category
export const getExpensesByCategory = async (
  petId: string | null,
  category: string
): Promise<PetExpense[]> => {
  let query = supabase
    .from('pet_expenses')
    .select('*')
    .eq('category', category);

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by category:', error);
    throw error;
  }

  return data as PetExpense[] || [];
};

// Export expenses to CSV
export const exportExpensesToCSV = (expenses: PetExpense[]): string => {
  const headers = ['Date', 'Amount', 'Category', 'Description', 'Created At'];
  
  const csvRows = [
    headers.join(','),
    ...expenses.map(expense => {
      return [
        expense.expense_date,
        expense.amount,
        expense.category,
        `"${expense.description?.replace(/"/g, '""') || ''}"`,
        expense.created_at
      ].join(',');
    })
  ];

  return csvRows.join('\n');
};
