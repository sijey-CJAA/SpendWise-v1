import { ExpenseData } from '../services/expenseService';

export interface DayData {
  date: string; // YYYY-MM-DD
  dateStr: string; // e.g., "August 2, 2028"
  items: any[];
  total: number;
}

export interface WeekData {
  id: string;
  days: DayData[];
  total: number;
}

export const groupExpensesByMonth = (expenses: any[], targetMonth: number, targetYear: number): WeekData[] => {
  // targetMonth is 0-indexed (0 = Jan, 11 = Dec)
  
  // Filter expenses for the specific month and year
  const monthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date || exp.createdAt);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  // Get the number of days in the month
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  
  // Initialize weeks
  const weeks: WeekData[] = [];
  let currentWeek: WeekData = { id: `week-1`, days: [], total: 0 };
  let weekCounter = 1;
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(targetYear, targetMonth, i);
    const dateString = date.toISOString().split('T')[0];
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    
    const dayExpenses = monthExpenses.filter(exp => {
        const d = new Date(exp.date || exp.createdAt);
        return d.getDate() === i;
    });
    
    const dayTotal = dayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    
    currentWeek.days.push({
      date: dateString,
      dateStr,
      items: dayExpenses,
      total: dayTotal
    });
    currentWeek.total += dayTotal;
    
    // Group into chunks of 7 days
    if (currentWeek.days.length === 7 || i === daysInMonth) {
      weeks.push(currentWeek);
      weekCounter++;
      currentWeek = { id: `week-${weekCounter}`, days: [], total: 0 };
    }
  }

  return weeks;
};
