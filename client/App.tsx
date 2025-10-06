import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { ShopProvider } from "./context/ShopContext";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/Products";
import AdminDashboard from "./pages/admin/Dashboard";
import { Users, Categories, Orders, Payments, Sellers, Integrations } from "./pages/admin/Placeholders";
import AdminShipments from "./pages/admin/Shipments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ShopProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Index />
                </Layout>
              }
            />
            <Route
              path="/marketplace"
              element={
                <Layout>
                  <Marketplace />
                </Layout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <Layout>
                  <ProductDetail />
                </Layout>
              }
            />
            <Route
              path="/favorites"
              element={
                <Layout>
                  <Favorites />
                </Layout>
              }
            />
            <Route
              path="/cart"
              element={
                <Layout>
                  <Cart />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <Layout>
                  {/* Admin landing will redirect or show a link to /admin */}
                  <div style={{ padding: 20 }}>
                    <h2 className="text-2xl font-bold">Admin</h2>
                    <p>Open /admin/products for product management.</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/admin/*"
              element={
                <Layout>
                  {/* Admin subroutes render inside AdminLayout */}
                  {/* Importing admin routes lazily is preferable but simple sync import used for now */}
                  <div style={{ padding: 20 }}>
                    {/* The Admin app is mounted on nested routes under /admin via React Router in the client/pages/admin directory */}
                    {/* For direct admin pages use absolute paths like /admin/products */}
                  </div>
                </Layout>
              }
            />

            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminLayout />
                </Layout>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="shipments" element={<AdminShipments />} />
              <Route path="sellers" element={<Sellers />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>

            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </ShopProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
