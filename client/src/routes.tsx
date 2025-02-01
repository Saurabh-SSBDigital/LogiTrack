// src/Routes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NewShipment = lazy(() => import("./pages/NewShipment"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminShipments = lazy(() => import("./pages/AdminShipments"));

// Loading Component
const LoadingScreen = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== "admin")
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Redirect logged-in users away from login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected Routes for Authenticated Users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="new-shipment"
            element={
              <ProtectedRoute>
                <NewShipment />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard - Only for Admins */}
          <Route
            path="admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="shipments"
            element={
              <ProtectedRoute>
                <AdminShipments />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect all unknown routes to login if not logged in, otherwise dashboard */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
