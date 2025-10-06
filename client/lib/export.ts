export function arrayToCSV(rows: any[], columns?: string[]) {
  if (!rows || rows.length === 0) return "";
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const header = cols.join(",") + "\n";
  const lines = rows.map((r) =>
    cols
      .map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return "";
        if (Array.isArray(v)) return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
        const s = String(v);
        // escape quotes
        if (s.includes(",") || s.includes("\n") || s.includes('"')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(","),
  );
  return header + lines.join("\n");
}

export function downloadCSV(filename: string, rows: any[], columns?: string[]) {
  const csv = arrayToCSV(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function printHTML(title: string, htmlContent: string) {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8"/><style>body{font-family:Arial,Helvetica,sans-serif;padding:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>${title}</h1>${htmlContent}</body></html>`);
  w.document.close();
  w.focus();
  // Delay to allow rendering
  setTimeout(() => {
    w.print();
  }, 500);
}
