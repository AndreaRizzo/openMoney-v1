import type { ExpenseEntry, IncomeEntry } from "@/repositories/types";
import { listOccurrencesInRange } from "./recurrence";
import { addDays } from "@/utils/recurrence";

export type MonthlyTotals = {
  income: number;
  expense: number;
  net: number;
};

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const nextStart = `${nextMonth.y}-${String(nextMonth.m).padStart(2, "0")}-01`;
  const end = addDays(nextStart, -1);
  return { start, end };
}

export function totalsForMonth(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  year: number,
  month: number
): MonthlyTotals {
  const range = monthRange(year, month);
  const incomeTotal = incomes.reduce((sum, entry) => {
    const dates = listOccurrencesInRange(entry, range.start, range.end);
    return sum + dates.length * entry.amount;
  }, 0);
  const expenseTotal = expenses.reduce((sum, entry) => {
    const dates = listOccurrencesInRange(entry, range.start, range.end);
    return sum + dates.length * entry.amount;
  }, 0);
  return { income: incomeTotal, expense: expenseTotal, net: incomeTotal - expenseTotal };
}

export function averageMonthlyTotals(
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  year: number,
  month: number,
  months: number
): MonthlyTotals {
  const annualize = (entry: IncomeEntry | ExpenseEntry): number => {
    const interval = entry.recurrence_interval && entry.recurrence_interval > 0 ? entry.recurrence_interval : 1;
    if (!entry.recurrence_frequency || entry.one_shot === 1) {
      return entry.amount;
    }
    const perYear =
      entry.recurrence_frequency === "WEEKLY"
        ? 52 / interval
        : entry.recurrence_frequency === "MONTHLY"
          ? 12 / interval
          : 1 / interval;
    return entry.amount * perYear;
  };

  const annualIncome = incomes.reduce((sum, entry) => sum + annualize(entry), 0);
  const annualExpense = expenses.reduce((sum, entry) => sum + annualize(entry), 0);
  const avgIncome = annualIncome / 12;
  const avgExpense = annualExpense / 12;
  return {
    income: avgIncome,
    expense: avgExpense,
    net: avgIncome - avgExpense,
  };
}
