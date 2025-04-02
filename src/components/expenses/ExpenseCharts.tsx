
import React, { useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PetExpense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseChartsProps {
  expenses: PetExpense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B'];
const CATEGORY_NAMES: Record<string, string> = {
  veterinary: 'Veterinary',
  medication: 'Medication',
  food: 'Food',
  supplies: 'Supplies',
  grooming: 'Grooming',
  other: 'Other',
};

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses }) => {
  // Monthly expenses for the last 6 months
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months with 0 values
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'MMM yyyy');
      months[monthKey] = 0;
    }
    
    // Sum expenses for each month
    expenses.forEach(expense => {
      const expenseDate = parseISO(expense.expense_date);
      const monthKey = format(expenseDate, 'MMM yyyy');
      if (months[monthKey] !== undefined) {
        months[monthKey] += Number(expense.amount);
      }
    });
    
    // Convert to array for chart
    return Object.entries(months).map(([month, amount]) => ({
      month,
      amount: parseFloat(amount.toFixed(2)),
    }));
  }, [expenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {
      veterinary: 0,
      medication: 0,
      food: 0,
      supplies: 0,
      grooming: 0,
      other: 0,
    };
    
    // Sum expenses by category
    expenses.forEach(expense => {
      if (categories[expense.category] !== undefined) {
        categories[expense.category] += Number(expense.amount);
      }
    });
    
    // Convert to array for chart
    return Object.entries(categories)
      .map(([name, value]) => ({
        name: CATEGORY_NAMES[name],
        value: parseFloat(value.toFixed(2)),
      }))
      .filter(item => item.value > 0); // Only include categories with expenses
  }, [expenses]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [expenses]);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.month}</p>
          <p className="text-sm">
            <span className="font-medium">Total:</span> ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span> {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly expenses chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;
