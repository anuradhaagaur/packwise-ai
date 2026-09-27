export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatScoreTier(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 90) {
    return {
      label: 'Optimal Match',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
    };
  }
  if (score >= 75) {
    return {
      label: 'High Compatibility',
      color: 'text-cyan-700 dark:text-cyan-300',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      border: 'border-cyan-200 dark:border-cyan-800',
    };
  }
  if (score >= 60) {
    return {
      label: 'Moderate Compatibility',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
    };
  }
  return {
    label: 'Low / Specialized Compatibility',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
  };
}

export function formatBarrierValue(val: number): string {
  const stars = '★'.repeat(val) + '☆'.repeat(5 - val);
  return `${stars} (${val}/5)`;
}
