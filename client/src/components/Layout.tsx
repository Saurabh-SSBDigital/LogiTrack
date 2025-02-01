import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Package, LogOut, User, Plus, Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

export default function Layout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gray-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img className="h-8 w-8 text-indigo-600" src={logo}/>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  LogiTrack
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/new-shipment"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Shipment
              </Link>

              {profile?.role === "admin" && (
                <>
                  <Link
                    to="/users"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Users
                  </Link>
                </>
              )}

              <Link
                to="/shipments"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Package className="h-4 w-4 mr-1" />
                All Shipments
              </Link>
            </div>

            {/* User Info & Logout - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-6 w-6 text-gray-400" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {profile?.first_name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-700 font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 text-sm">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4">
            <Link
              to="/dashboard"
              className="block text-gray-700 hover:text-indigo-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/new-shipment"
              className="block text-gray-700 hover:text-indigo-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              New Shipment
            </Link>

            {profile?.role === "admin" && (
              <>
                <Link
                  to="/users"
                  className="block text-gray-700 hover:text-indigo-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Users
                </Link>
              </>
            )}

            <Link
              to="/shipments"
              className="block text-gray-700 hover:text-indigo-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              All Shipments
            </Link>

            {/* User Info & Logout */}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center">
                <User className="h-6 w-6 text-gray-400" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {profile?.first_name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="mt-2 flex items-center text-red-600 hover:text-red-700 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 text-sm">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
