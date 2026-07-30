export function formatPercentage(decimalScore: number): string {
  const score = Math.max(0, Math.min(1, decimalScore ?? 0));
  return `${(score * 100).toFixed(1)}%`;
}

export function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
