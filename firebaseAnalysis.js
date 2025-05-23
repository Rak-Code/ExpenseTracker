// Analysis Utilities for Expense Data

export const getMonthlySummary = (expenses) => {
  const summary = {};
  expenses.forEach(exp => {
    const month = exp.createdAt.toDate().toLocaleString('default', { month: 'short', year: 'numeric' });
    summary[month] = (summary[month] || 0) + exp.amount;
  });
  return summary;
};

export const getCategoryBreakdown = (expenses) => {
  const breakdown = {};
  expenses.forEach(exp => {
    const category = exp.category || "Others";
    breakdown[category] = (breakdown[category] || 0) + exp.amount;
  });
  return breakdown;
};
