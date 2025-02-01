import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  UserCog,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pencil,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  role: "admin" | "user";
  created_at: string;
  first_name: string;
  last_name: string;
}

interface Shipment {
  id: string;
  package_id: string;
  to_address: string;
  from_address: string;
  sender_name: string;
  image_url: string;
  note: string;
  created_at: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [sorting, setSorting] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const pageSize = 5;

    try {
      let query = supabase
        .from("shipments")
        .select(
          `
          *,
          profiles(id, first_name, last_name)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: sorting === "asc" })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (search) {
        query = query.or(
          `package_id.ilike.%${search}%,sender_name.ilike.%${search}%`
        );
      }

      if (startDate && endDate) {
        query = query
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`);
      }

      if (selectedUser) {
        query = query.eq("user_id", selectedUser);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setShipments(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, selectedUser, sorting, page]);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [search, startDate, endDate, selectedUser, sorting, page]);

  return (
    <div className="space-y-8 p-4">
      {/* Users Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <UserCog className="h-6 w-6 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{`${user.first_name} ${user.last_name}`}</td>
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
                  <td className="p-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipments Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Shipments</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Package ID</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Sender</th>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Image</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-t">
                    <td className="p-3">{shipment.package_id}</td>
                    <td className="p-3">{`${shipment.profiles?.first_name} ${shipment.profiles?.last_name}`}</td>
                    <td className="p-3">{shipment.sender_name}</td>
                    <td className="p-3">{shipment.from_address}</td>
                    <td className="p-3">{shipment.to_address}</td>
                    <td className="p-3">
                      {format(new Date(shipment.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-3">
                      {shipment.image_url && (
                        <img
                          src={shipment.image_url}
                          alt="Shipment"
                          className="h-12 w-12 rounded cursor-pointer"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
