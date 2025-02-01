import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { UserCog, Pencil, Plus, Cross, Delete } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";

interface User {
  id: string;
  role: "admin" | "user";
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📥 Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, role, created_at, first_name, last_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // 🛠 Update User Role
  const updateUserRole = async (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  // 🆕 Create New User
  const createUser = async () => {
    setLoading(true);
    setError(null);

    if (
      !newUser.email ||
      !newUser.password ||
      !newUser.first_name ||
      !newUser.last_name
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const supabaseClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_KEY
      );

      // 1️⃣ Register User in Supabase Auth
      const { data: authData, error: signUpError } =
        await supabaseClient.auth.admin.createUser({
          email: newUser.email,
          password: newUser.password,
          email_confirm: true,
        });

      if (signUpError) throw signUpError;

      // 2️⃣ Insert Into Profiles Table
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert([
          {
            user_id: authData.user?.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
          },
        ]);

      if (profileError) throw profileError;

      setShowCreateForm(false);
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "user",
      });
      fetchUsers(); // Refresh List
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`px-4 py-2 rounded-md flex items-center transition ${
                showCreateForm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {showCreateForm ? (
                <Delete className="h-5 w-5 mr-2" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              {showCreateForm ? "Cancel" : "Create User"}
            </button>
          </div>
        </div>

        {/* New User Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={newUser.first_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.last_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              onClick={createUser}
              disabled={loading}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        )}

        {/* User List */}
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Full Name</th>
                {/* <th className="p-3 text-left">Email</th> */}
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Joined</th>
                {/* <th className="p-3 text-left">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{`${user.first_name} ${user.last_name}`}</td>
                  {/* <td className="p-3">{user.email}</td> */}
                  <td className="p-3">
                    {editingUser === user.id ? (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUserRole(user.id, e.target.value)
                        }
                        className="border rounded-md p-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span>{user.role}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </td>
                  {/* <td className="p-3">
                    <button
                      onClick={() =>
                        setEditingUser(editingUser === user.id ? null : user.id)
                      }
                    >
                      {editingUser === user.id ? (
                        "Save"
                      ) : (
                        <Pencil className="h-5 w-5" />
                      )}
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
