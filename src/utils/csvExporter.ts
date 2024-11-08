export function exportToCSV(data: any[], filename: string) {
  // Get headers from the first item's keys
  const headers = Object.keys(data[0] || {});
  
  // Convert data to CSV format
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle nested objects (like report_data)
        const cellContent = typeof value === 'object' ? 
          JSON.stringify(value).replace(/,/g, ';') : 
          value;
        // Escape quotes and wrap in quotes if contains comma
        return `"${String(cellContent).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create object URL
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}