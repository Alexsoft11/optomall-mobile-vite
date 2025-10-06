import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { downloadCSV, printHTML } from "@/lib/export";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
};

import BucketChecker from "@/components/admin/BucketChecker";

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (error) console.warn(error);
      if (data) setItems(data as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const exportCSV = () => {
    const rows = items.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price }));
    downloadCSV(`products_${Date.now()}.csv`, rows, ["id", "name", "description", "price"]);
  };

  const printList = () => {
    const html = `
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th></tr></thead>
        <tbody>
          ${items.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${(p.description||'').replace(/</g,'&lt;')}</td><td>${p.price}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    printHTML('Products', html);
  };

  async function uploadFile(file: File) {
    if (!supabase) throw new Error("Supabase not configured");
    setUploading(true);
    try {
      const filePath = `public/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: false });
      if (uploadError) {
        // If bucket doesn't exist or other error, propagate
        throw uploadError;
      }
      const { publicURL } = supabase.storage.from("product-images").getPublicUrl(filePath);
      return publicURL;
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    if (!supabase) return;
    try {
      const { error } = await supabase.from("products").insert([{ name, description: desc, price, images: [] }]);
      if (error) throw error;
      setName("");
      setDesc("");
      setPrice(0);
      await load();
    } catch (err: any) {
      console.error(err);
      alert(err.message || String(err));
    }
  }

  async function handleDelete(id: number) {
    if (!supabase) return;
    if (!confirm("Delete product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  }

  async function handleImageUpload(productId: number, file: File) {
    if (!supabase) {
      alert("Supabase is not configured");
      return;
    }
    try {
      const url = await uploadFile(file);
      if (!url) throw new Error("No URL returned");
      // fetch existing images and append
      const prod = items.find((p) => p.id === productId);
      const newImages = Array.isArray(prod?.images) ? [...prod!.images!, url] : [url];
      const { error } = await supabase.from("products").update({ images: newImages }).eq("id", productId);
      if (error) throw error;
      await load();
      alert("Image uploaded");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed. Make sure a public bucket named 'product-images' exists in Supabase Storage.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV()} className="px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
          <button onClick={() => printList()} className="px-3 py-1 bg-slate-700 text-white rounded">Print</button>
        </div>
      </div>

      <BucketChecker bucket="product-images" label="Product Images (product-images)" />

      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-3 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
        <input value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" className="p-2 border rounded" />
        <button className="p-2 bg-blue-600 text-white rounded">Add</button>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="p-2 border rounded col-span-3" />
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.id} className="p-4 bg-white shadow rounded">
              {it.images && it.images.length > 0 ? (
                <img src={it.images[0]} alt={it.name} className="w-full h-40 object-cover rounded mb-2" />
              ) : (
                <div className="w-full h-40 bg-slate-100 rounded mb-2 flex items-center justify-center text-slate-400">No image</div>
              )}
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-slate-500">${Number(it.price).toFixed(2)}</div>
              <div className="mt-2 text-sm">{it.description}</div>

              <div className="mt-3 flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(it.id, f);
                    }}
                  />
                  <span className="px-3 py-1 bg-green-600 text-white rounded text-sm">Upload Image</span>
                </label>

                <button onClick={() => handleDelete(it.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
              </div>

              {it.images && it.images.length > 0 && (
                <div className="mt-3 text-xs text-slate-500">
                  {it.images.map((u, idx) => (
                    <div key={idx} className="truncate">{u}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
