export function getScoreTheme(score: number) {
  if (score >= 8) {
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Excellent'
    };
  }
  if (score >= 4) {
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Average'
    };
  }
  return {
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'Needs Work'
  };
}

