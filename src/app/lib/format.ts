export function formatDate(
  isoString: string,
  locale: string = 'pt-BR'
): { date: string; time: string } {
  const d = new Date(isoString);
  const loc = locale.startsWith('en') ? 'en-US' : 'pt-BR';
  const date = d
    .toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/\./g, '');
  const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}
