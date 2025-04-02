
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  MoreHorizontal,
  Edit,
  Trash,
  FileText,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import { PetExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { deleteExpense } from '@/lib/services/expenseService';
import { useToast } from '@/hooks/use-toast';

interface ExpensesTableProps {
  expenses: PetExpense[];
  onEdit: (expense: PetExpense) => void;
  onDeleted: () => void;
  pets?: { id: string; name: string }[];
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onEdit,
  onDeleted,
  pets = [],
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Filter expenses by search query and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      !searchQuery ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle expense deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({
        title: 'Expense deleted',
        description: 'The expense has been deleted successfully.',
      });
      setDeleteConfirm(null);
      onDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format expense category for display
  const formatCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Find pet name by ID
  const getPetName = (petId: string): string => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Unknown Pet';
  };

  // Download all expenses as CSV
  const handleExport = () => {
    const headers = ['Date', 'Amount', 'Category', 'Description', 'Pet'];
    
    const csvRows = [
      headers.join(','),
      ...filteredExpenses.map(expense => {
        return [
          format(parseISO(expense.expense_date), 'yyyy-MM-dd'),
          expense.amount.toFixed(2),
          expense.category,
          `"${expense.description?.replace(/"/g, '""') || ''}"`,
          getPetName(expense.pet_id)
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pet-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[250px]"
            />
          </div>
          
          <Select
            value={categoryFilter || ''}
            onValueChange={(value) => setCategoryFilter(value || null)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="veterinary">Veterinary</SelectItem>
              <SelectItem value="medication">Medication</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="grooming">Grooming</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              {pets.length > 0 && <TableHead className="hidden lg:table-cell">Pet</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(parseISO(expense.expense_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{formatCategory(expense.category)}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {expense.description || '-'}
                  </TableCell>
                  {pets.length > 0 && (
                    <TableCell className="hidden lg:table-cell">
                      {getPetName(expense.pet_id)}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {expense.receipt_url && (
                          <DropdownMenuItem
                            onClick={() => setViewReceipt(expense.receipt_url || null)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteConfirm(expense.id || '')}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={pets.length > 0 ? 6 : 5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>No expenses found</p>
                    {(searchQuery || categoryFilter) && (
                      <p className="text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Receipt viewer dialog */}
      <Dialog open={!!viewReceipt} onOpenChange={() => setViewReceipt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>
              View the uploaded receipt image.
            </DialogDescription>
          </DialogHeader>
          {viewReceipt && (
            <div className="max-h-[70vh] overflow-auto flex justify-center p-2">
              <img
                src={viewReceipt}
                alt="Receipt"
                className="max-w-full object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpensesTable;
