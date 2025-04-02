
import React, { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfYear, format, parseISO } from 'date-fns';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PetExpense } from '@/lib/types';

interface ExpenseSummaryProps {
  expenses: PetExpense[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  // Calculate various expense metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    
    // Filter expenses for current month and year-to-date
    const currentMonthExpenses = expenses.filter(expense => {
      const date = parseISO(expense.expense_date);
      return date >= currentMonthStart && date <= currentMonthEnd;
    });
    
    const yearToDateExpenses = expenses.filter(expense => {
      const date = parseISO(expense.expense_date);
      return date >= yearStart && date <= now;
    });
    
    // Calculate totals
    const totalAll = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalCurrentMonth = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalYearToDate = yearToDateExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate category breakdown for current month
    const categoryBreakdown: Record<string, { amount: number; percentage: number }> = {};
    
    if (currentMonthExpenses.length > 0) {
      // Count expenses by category
      currentMonthExpenses.forEach(expense => {
        if (!categoryBreakdown[expense.category]) {
          categoryBreakdown[expense.category] = { amount: 0, percentage: 0 };
        }
        categoryBreakdown[expense.category].amount += Number(expense.amount);
      });
      
      // Calculate percentages
      Object.keys(categoryBreakdown).forEach(category => {
        categoryBreakdown[category].percentage = 
          (categoryBreakdown[category].amount / totalCurrentMonth) * 100;
      });
    }
    
    // Get top category for current month
    let topCategory = { name: 'None', amount: 0, percentage: 0 };
    
    if (Object.keys(categoryBreakdown).length > 0) {
      const topCategoryName = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1].amount - a[1].amount)[0][0];
      
      topCategory = {
        name: topCategoryName.charAt(0).toUpperCase() + topCategoryName.slice(1),
        amount: categoryBreakdown[topCategoryName].amount,
        percentage: categoryBreakdown[topCategoryName].percentage,
      };
    }
    
    return {
      totalAll,
      totalCurrentMonth,
      totalYearToDate,
      currentMonthName: format(now, 'MMMM yyyy'),
      topCategory,
    };
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Monthly Spending Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              {metrics.currentMonthName} Spending
            </CardTitle>
            <CardDescription>Total for this month</CardDescription>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.totalCurrentMonth.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From {format(startOfMonth(new Date()), 'MMM d')} to {format(endOfMonth(new Date()), 'MMM d')}
          </p>
        </CardContent>
      </Card>
      
      {/* Year-to-Date Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Year-to-Date
            </CardTitle>
            <CardDescription>Total spending this year</CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.totalYearToDate.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Since {format(startOfYear(new Date()), 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
      
      {/* Top Category Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Top Expense Category
            </CardTitle>
            <CardDescription>This month's biggest expense</CardDescription>
          </div>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.topCategory.name}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ${metrics.topCategory.amount.toFixed(2)} ({metrics.topCategory.percentage.toFixed(1)}% of monthly spending)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSummary;
