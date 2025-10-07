import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BucketChecker from "@/components/admin/BucketChecker";
import { downloadCSV, printHTML } from "@/lib/export";
import { bulkActions, generateQr } from "@/lib/rpc";

type Shipment = {
  id: number;
  order_id: string;
  status: string;
  tracking_number?: string;
  warehouse?: string;
  carrier?: string;
  documents?: string[];
  photos?: string[];
  notes?: string;
  created_at?: string;
};

const STATUS_OPTIONS = ["pending", "ready", "shipped", "delivered", "cancelled"];

export default function AdminShipments() {
  const [items, setItems] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>(STATUS_OPTIONS[0]);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    try {
      let q = supabase.from("shipments").select("*").order("id", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      if (query) q = q.ilike("order_id", `%${query}%`);
      const { data, error } = await q;
      if (error) console.warn(error);
      if (data) setItems(data as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function updateStatus(id: number, status: string) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  }

  // Bulk actions
  const toggleSelect = (id: number) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) return alert('No items selected');
    try {
      await bulkActions('shipments', 'update_status', selectedIds, { status });
      setSelectedIds([]);
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const bulkExportSelected = () => {
    if (selectedIds.length === 0) return alert('No items selected');
    const rows = items.filter((s) => selectedIds.includes(s.id)).map((s) => ({ id: s.id, order_id: s.order_id, status: s.status, tracking: s.tracking_number, warehouse: s.warehouse, carrier: s.carrier, notes: s.notes, created_at: s.created_at }));
    downloadCSV(`shipments_selected_${Date.now()}.csv`, rows, ["id", "order_id", "status", "tracking", "warehouse", "carrier", "notes", "created_at"]);
  };

  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return alert('No items selected');
    if (!confirm(`Delete ${selectedIds.length} shipments?`)) return;
    try {
      await bulkActions('shipments', 'delete', selectedIds);
      setSelectedIds([]);
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected');
    }
  };

  async function uploadFile(file: File, prefix = "shipments") {
    if (!supabase) throw new Error("Supabase not configured");
    setUploading(true);
    try {
      const filePath = `${prefix}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("shipment-docs").upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { publicURL } = supabase.storage.from("shipment-docs").getPublicUrl(filePath);
      return publicURL;
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(id: number, file: File, type: "documents" | "photos") {
    if (!supabase) {
      alert("Supabase not configured");
      return;
    }
    try {
      const url = await uploadFile(file, `shipment_${id}`);
      if (!url) throw new Error("Upload failed");
      // append to existing
      const it = items.find((s) => s.id === id);
      const existing = Array.isArray((it as any)?.[type]) ? (it as any)[type] : [];
      const newArr = [...existing, url];
      const { error } = await supabase.from("shipments").update({ [type]: newArr }).eq("id", id);
      if (error) throw error;
      await load();
      alert("Uploaded");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    }
  }

  function qrUrl(tracking?: string) {
    if (!tracking) return null;
    // use Google Chart API for QR generation
    return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(tracking)}`;
  }

  // Exports and printing

  const exportCSV = () => {
    const rows = items.map((s) => ({ id: s.id, order_id: s.order_id, status: s.status, tracking: s.tracking_number, warehouse: s.warehouse, carrier: s.carrier, notes: s.notes, created_at: s.created_at }));
    downloadCSV(`shipments_${Date.now()}.csv`, rows, ["id", "order_id", "status", "tracking", "warehouse", "carrier", "notes", "created_at"]);
  };

  const printTable = () => {
    const html = `
      <table>
        <thead><tr><th>ID</th><th>Order</th><th>Status</th><th>Tracking</th><th>Warehouse</th><th>Carrier</th><th>Notes</th><th>Created</th></tr></thead>
        <tbody>
          ${items.map(s => `<tr><td>${s.id}</td><td>${s.order_id}</td><td>${s.status}</td><td>${s.tracking_number||''}</td><td>${s.warehouse||''}</td><td>${s.carrier||''}</td><td>${(s.notes||'').replace(/</g,'&lt;')}</td><td>${s.created_at||''}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    printHTML('Shipments', html);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Shipments</h1>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order_id" className="p-2 border rounded" />
          <select value={statusFilter ?? ""} onChange={(e) => setStatusFilter(e.target.value || null)} className="p-2 border rounded">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => load()} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          <button onClick={() => exportCSV()} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
          <button onClick={() => printTable()} className="px-3 py-1 bg-slate-700 text-white rounded">Print</button>
        </div>
      </div>

      <BucketChecker bucket="shipment-docs" label="Shipment documents & photos (shipment-docs)" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleSelectAll} />
            <span className="text-sm">Select all</span>
          </label>
          <span className="text-sm text-slate-500">{selectedIds.length} selected</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="p-2 border rounded">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => bulkUpdateStatus(bulkStatus)} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={selectedIds.length===0}>Apply status</button>
          <button onClick={() => bulkExportSelected()} className="px-3 py-1 bg-green-600 text-white rounded" disabled={selectedIds.length===0}>Export Selected</button>
          <button onClick={() => bulkDeleteSelected()} className="px-3 py-1 bg-red-600 text-white rounded" disabled={selectedIds.length===0}>Delete Selected</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-white rounded shadow">
            <thead>
              <tr className="text-left">
                <th className="p-2"><input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleSelectAll} /></th>
                <th className="p-2">ID</th>
                <th className="p-2">Order</th>
                <th className="p-2">Status</th>
                <th className="p-2">Tracking</th>
                <th className="p-2">Warehouse</th>
                <th className="p-2">Carrier</th>
                <th className="p-2">Docs / Photos</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 align-top"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                  <td className="p-2 align-top">{s.id}</td>
                  <td className="p-2 align-top">{s.order_id}</td>
                  <td className="p-2 align-top">
                    <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)} className="p-1 border rounded">
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 align-top">
                    <div>{s.tracking_number}</div>
                    {s.tracking_number && (
                      <img src={qrUrl(s.tracking_number) || ""} alt="qr" className="w-16 h-16 mt-1" />
                    )}
                  </td>
                  <td className="p-2 align-top">{s.warehouse}</td>
                  <td className="p-2 align-top">{s.carrier}</td>
                  <td className="p-2 align-top">
                    <div className="flex flex-col gap-1">
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-2">
                          <input type="file" accept="*/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(s.id, f, "documents"); }} className="hidden" />
                          <span className="px-2 py-1 bg-slate-200 rounded text-xs">Upload Doc</span>
                        </label>
                      </div>
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-2">
                          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(s.id, f, "photos"); }} className="hidden" />
                          <span className="px-2 py-1 bg-slate-200 rounded text-xs">Upload Photo</span>
                        </label>
                      </div>
                      <div className="mt-2 text-xs">
                        {s.documents && s.documents.map((d, i) => (
                          <div key={`d-${i}`} className="truncate"><a href={d} target="_blank" rel="noreferrer" className="text-blue-600">Doc {i+1}</a></div>
                        ))}
                        {s.photos && s.photos.map((p, i) => (
                          <div key={`p-${i}`} className="truncate"><a href={p} target="_blank" rel="noreferrer" className="text-blue-600">Photo {i+1}</a></div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 align-top">
                    <button onClick={() => { navigator.clipboard?.writeText(s.tracking_number || ""); alert('Tracking copied'); }} className="px-2 py-1 bg-slate-200 rounded text-sm mb-2">Copy Tracking</button>
                    <div>
                      <button onClick={() => { if (confirm('Delete shipment?')) { supabase?.from('shipments').delete().eq('id', s.id).then(()=>load()); } }} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                    </div>
                    <div className="mt-2">
                      <button onClick={async () => {
                        try {
                          const res = await generateQr(Number(s.order_id));
                          const url = res?.qr_code_url || res?.qr || res?.qr_code_url || res?.qrCodeUrl || null;
                          if (url) {
                            window.open(url, '_blank');
                          } else {
                            alert('QR generated');
                          }
                          await load();
                        } catch (err: any) {
                          console.error(err);
                          alert(err?.message || String(err));
                        }
                      }} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Generate QR</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
