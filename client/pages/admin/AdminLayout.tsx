import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="w-64 bg-white shadow rounded p-4">
            <h3 className="font-bold mb-4">Admin</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/admin" className="text-sm text-slate-700">Dashboard</Link>
              <Link to="/admin/products" className="text-sm text-slate-700">Products</Link>
              <Link to="/admin/categories" className="text-sm text-slate-700">Categories</Link>
              <Link to="/admin/orders" className="text-sm text-slate-700">Orders</Link>
              <Link to="/admin/users" className="text-sm text-slate-700">Users</Link>
              <Link to="/admin/integrations" className="text-sm text-slate-700">Integrations</Link>
              <Link to="/admin/payments" className="text-sm text-slate-700">Payments</Link>
              <Link to="/admin/shipments" className="text-sm text-slate-700">Shipments</Link>
              <Link to="/admin/sellers" className="text-sm text-slate-700">Local Sellers</Link>
            </nav>
          </aside>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
