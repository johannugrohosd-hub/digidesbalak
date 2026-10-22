// Utility Formatters for Digital Desa Pro (SIM Desa)

export function formatDateIndo(dateStr?: string | Date, withDay = false): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (!withDay) {
    return `${day}-${month}-${year}`;
  }

  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `${daysIndo[d.getDay()]}, ${d.getDate()} ${monthsIndo[d.getMonth()]} ${year}`;
}

export function formatDateTimeIndo(dateTimeStr?: string): string {
  if (!dateTimeStr) return '-';
  const d = new Date(dateTimeStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateTimeStr;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${mins} WIB`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

// Download CSV helper
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? '').replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Excel Spreadsheet (.xls XML format with formatting)
export function downloadExcel(filename: string, headers: string[], rows: (string | number)[][]): void {
  let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Laporan Desa</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
  </head>
  <body>
    <table border="1">
      <thead>
        <tr style="background-color: #15803d; color: white; font-weight: bold; height: 30px;">
          ${headers.map(h => `<th style="padding: 6px 12px;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, idx) => `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
            ${row.map(cell => `<td style="padding: 4px 8px;">${cell ?? ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
