import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const linkClass = (isActive: boolean) =>
    `text-sm px-2 py-1 rounded ${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="w-64 bg-white shadow rounded p-4">
            <h3 className="font-bold mb-4">Admin</h3>
            <nav className="flex flex-col gap-2">
              <NavLink to="/admin" className={({ isActive }) => linkClass(isActive)}>Dashboard</NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => linkClass(isActive)}>Products</NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => linkClass(isActive)}>Categories</NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => linkClass(isActive)}>Orders</NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => linkClass(isActive)}>Users</NavLink>
              <NavLink to="/admin/integrations" className={({ isActive }) => linkClass(isActive)}>Integrations</NavLink>
              <NavLink to="/admin/payments" className={({ isActive }) => linkClass(isActive)}>Payments</NavLink>
              <NavLink to="/admin/shipments" className={({ isActive }) => linkClass(isActive)}>Shipments</NavLink>
              <NavLink to="/admin/sellers" className={({ isActive }) => linkClass(isActive)}>Local Sellers</NavLink>
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
