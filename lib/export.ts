// lib/export.ts
//
// Shared PDF/Excel export used by every data table in the dashboard (see
// components/ui/export-button.tsx for the UI). Libraries are dynamically
// imported inside each function so they're only pulled into the bundle when
// someone actually clicks "Export" - not on every page load.

export interface ExportColumn<T = any> {
  /** Column header text shown in the exported file. */
  header: string;
  /** Key on each row object, OR a function to derive the cell value. */
  accessor: keyof T | ((row: T) => string | number | null | undefined);
}

function getCellValue<T>(row: T, column: ExportColumn<T>): string {
  const raw =
    typeof column.accessor === "function"
      ? column.accessor(row)
      : (row as any)[column.accessor];

  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function timestampedFilename(base: string, ext: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${base}-${stamp}.${ext}`;
}

/** Exports rows to a formatted table PDF (landscape, auto-paged). */
export async function exportToPDF<T>(
  columns: ExportColumn<T>[],
  rows: T[],
  filenameBase: string,
  title?: string,
) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });

  if (title) {
    doc.setFontSize(14);
    doc.text(title, 14, 15);
  }

  autoTable(doc, {
    startY: title ? 20 : 10,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => getCellValue(row, c))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 118, 110] }, // teal-700, matches the dashboard's accent color
    margin: { left: 10, right: 10 },
  });

  doc.save(timestampedFilename(filenameBase, "pdf"));
}

/** Exports rows to a .xlsx workbook. */
export async function exportToExcel<T>(
  columns: ExportColumn<T>[],
  rows: T[],
  filenameBase: string,
  sheetName = "Sheet1",
) {
  const XLSX = await import("xlsx");

  const data = rows.map((row) => {
    const record: Record<string, string> = {};
    columns.forEach((c) => {
      record[c.header] = getCellValue(row, c);
    });
    return record;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, timestampedFilename(filenameBase, "xlsx"));
}
