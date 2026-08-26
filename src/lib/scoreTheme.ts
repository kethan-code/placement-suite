export function getScoreTheme(score: number) {
  if (score >= 8) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'Excellent'
    };
  }
  if (score >= 4) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Average'
    };
  }
  return {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    label: 'Needs Work'
  };
}
