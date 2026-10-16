/**
 * Export data to CSV and trigger browser download
 */
export function exportToCSV<T extends object>(
  filename: string,
  data: T[],
  headersMap: Partial<Record<keyof T, string>>
) {
  if (!data || data.length === 0) {
    return;
  }

  const keys = Object.keys(headersMap) as (keyof T)[];
  const headerLabels = keys.map(k => `"${String(headersMap[k] || String(k)).replace(/"/g, '""')}"`);

  const rows = data.map(row => {
    return keys.map(key => {
      const val = (row as any)[key];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headerLabels.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
