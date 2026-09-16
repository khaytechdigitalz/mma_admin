"use client";

import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Download, FileText, FileSpreadsheet, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportToExcel, type ExportColumn } from "@/lib/export";
import { cn } from "@/lib/utils";

interface ExportButtonProps<T> {
  /** Columns to include in the export - independent of what the table shows on screen. */
  columns: ExportColumn<T>[];
  /** Rows to export - typically the currently-loaded/filtered page of data. */
  data: T[];
  /** Used to build the downloaded filename, e.g. "products" -> products-2026-09-14.pdf */
  filename: string;
  /** Optional heading printed at the top of the PDF. */
  title?: string;
  /** Optional sheet name for the Excel file. */
  sheetName?: string;
  className?: string;
}

/**
 * Dropdown "Export" button (PDF / Excel) dropped into every table's header
 * next to the existing Add/Create button. Exports whatever rows are
 * currently loaded in the table (the current page/filtered result set), not
 * necessarily the entire unfiltered dataset.
 */
export function ExportButton<T>({
  columns,
  data,
  filename,
  title,
  sheetName,
  className,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!data || data.length === 0) {
      toast.error("There's no data to export.");
      return;
    }

    setExporting(format);
    try {
      if (format === "pdf") {
        await exportToPDF(columns, data, filename, title);
      } else {
        await exportToExcel(columns, data, filename, sheetName);
      }
      toast.success(`Exported ${data.length} row${data.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`);
    } catch (err) {
      console.error(`Failed to export as ${format}:`, err);
      toast.error(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Menu as="div" className={cn("relative inline-block text-left", className)}>
      <MenuButton as="div">
        <Button variant="outline" size="xs" className="flex items-center gap-1.5">
          <Download className="size-3.5" /> Export <ChevronDown className="size-3.5" />
        </Button>
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="z-50 mt-1 w-44 origin-top-right rounded-xl bg-white p-1 shadow-lg ring-1 ring-gray-500/10 focus:outline-none"
      >
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer disabled:opacity-60",
                focus ? "bg-gray-100 text-gray-900" : "text-gray-600",
              )}
            >
              {exporting === "pdf" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              Export as PDF
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={exporting !== null}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer disabled:opacity-60",
                focus ? "bg-gray-100 text-gray-900" : "text-gray-600",
              )}
            >
              {exporting === "excel" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              Export as Excel
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
