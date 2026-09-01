import { ExpenseData } from '../services/expenseService';

export interface DayData {
  date: string; // YYYY-MM-DD
  dateStr: string; // e.g., "August 2, 2028"
  dateNum: number;
  weekday: string;
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
  
  const parseLocal = (exp: any) => {
    if (exp.date && exp.date.includes('-')) {
      const parts = exp.date.split('T')[0].split('-');
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        date: parseInt(parts[2], 10)
      };
    }
    const d = new Date(exp.createdAt || exp.date);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate()
    };
  };

  // Filter expenses for the specific month and year
  const monthExpenses = expenses.filter(exp => {
    const d = parseLocal(exp);
    return d.month === targetMonth && d.year === targetYear;
  });

  // Get the number of days in the month
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  
  // Initialize weeks
  const weeks: WeekData[] = [];
  let currentWeek: WeekData = { id: `week-1`, days: [], total: 0 };
  let weekCounter = 1;
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(targetYear, targetMonth, i);
    // Build date string safely in local time to avoid toISOString UTC shift
    const yearStr = targetYear;
    const monthStr = String(targetMonth + 1).padStart(2, '0');
    const dayStr = String(i).padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayExpenses = monthExpenses.filter(exp => {
        const d = parseLocal(exp);
        return d.date === i;
    });
    
    const dayTotal = dayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    
    currentWeek.days.push({
      date: dateString,
      dateStr,
      dateNum: i,
      weekday,
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
