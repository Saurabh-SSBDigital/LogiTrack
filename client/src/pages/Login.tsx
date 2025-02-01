import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate User
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error("Invalid email or password");

      const user = data.user;
      if (!user) throw new Error("Authentication failed");

      // Fetch User Role from `profiles`
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw new Error("User profile not found");

      const userRole = profile?.role || "user";

      // Redirect Based on Role
      navigate(userRole === "admin" ? "/dashboard" : "/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">SSBI LogiTrack</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition duration-150 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-gray-800 hover:underline">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
