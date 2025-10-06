import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
};

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);

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
    } catch (err) {
      console.error(err);
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
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
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
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-slate-500">${Number(it.price).toFixed(2)}</div>
              <div className="mt-2 text-sm">{it.description}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleDelete(it.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
