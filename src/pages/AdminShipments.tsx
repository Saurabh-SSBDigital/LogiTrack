// import React, { useEffect, useState, useCallback } from "react";
// import { format } from "date-fns";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
//   XCircle,
//   RefreshCcw,
//   Download,
// } from "lucide-react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

// import { supabase } from "../lib/supabase";

// interface Shipment {
//   id: string;
//   package_id: string;
//   to_address: string;
//   from_address: string;
//   sender_name: string;
//   image_url: string;
//   note: string;
//   created_at: string;
//   user_id: string;
//   profiles: {
//     first_name: string;
//     last_name: string;
//   };
// }

// export default function AdminShipments() {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [pageSize, setPageSize] = useState(5);
//   const [gotoPage, setGotoPage] = useState("");
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [selectedSender, setSelectedSender] = useState("");
//   const [selectedFrom, setSelectedFrom] = useState("");
//   const [selectedTo, setSelectedTo] = useState("");

//   // 📥 Generate & Download PDF Report
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     const reportDate = format(new Date(), "PPP");

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(18);
//     doc.text("Shipment Report", 15, 15);

//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Date of Report: ${reportDate}`, 15, 25);

//     let yPosition = 35;
//     if (startDate && endDate) {
//       doc.text(`Date Range: ${startDate} to ${endDate}`, 15, yPosition);
//       yPosition += 10;
//     }

//     if (selectedUser || selectedSender || selectedFrom || selectedTo) {
//       let filterText = "Filters: ";
//       if (selectedUser) filterText += `User: ${selectedUser} `;
//       if (selectedSender) filterText += `Sender: ${selectedSender} `;
//       if (selectedFrom) filterText += `From: ${selectedFrom} `;
//       if (selectedTo) filterText += `To: ${selectedTo}`;

//       doc.text(filterText, 15, yPosition);
//       yPosition += 10;
//     }

//     const tableData = shipments.map((shipment) => [
//       shipment.package_id,
//       `${shipment.profiles?.first_name} ${shipment.profiles?.last_name}`,
//       shipment.sender_name,
//       shipment.from_address,
//       shipment.to_address,
//       format(new Date(shipment.created_at), "PPP"),
//     ]);

//     doc.autoTable({
//       startY: yPosition,
//       head: [["Package ID", "User", "Sender", "From", "To", "Date"]],
//       body: tableData,
//       theme: "striped",
//     });

//     doc.save(`Shipment_Report_${reportDate}.pdf`);
//   };

//   const fetchShipments = useCallback(async () => {
//     setLoading(true);

//     try {
//       let query = supabase
//         .from("shipments")
//         .select(
//           `
//           *,
//           profiles(id, first_name, last_name)
//         `,
//           { count: "exact" }
//         )
//         .order("created_at", { ascending: false })
//         .range((page - 1) * pageSize, page * pageSize - 1);

//       if (search) {
//         query = query.or(
//           `package_id.ilike.%${search}%,sender_name.ilike.%${search}%`
//         );
//       }

//       if (startDate && endDate) {
//         query = query
//           .gte("created_at", `${startDate}T00:00:00`)
//           .lte("created_at", `${endDate}T23:59:59`);
//       }

//       if (selectedUser) {
//         query = query.or(
//           `profiles.first_name.ilike.%${selectedUser}%,profiles.last_name.ilike.%${selectedUser}%`
//         );
//       }

//       if (selectedSender) {
//         query = query.ilike("sender_name", `%${selectedSender}%`);
//       }

//       if (selectedFrom) {
//         query = query.ilike("from_address", `%${selectedFrom}%`);
//       }

//       if (selectedTo) {
//         query = query.ilike("to_address", `%${selectedTo}%`);
//       }

//       const { data, count, error } = await query;
//       if (error) throw error;

//       setShipments(data || []);
//       setTotalPages(Math.ceil((count || 0) / pageSize));
//     } catch (error) {
//       console.error("Error fetching shipments:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     search,
//     startDate,
//     endDate,
//     page,
//     pageSize,
//     selectedUser,
//     selectedSender,
//     selectedFrom,
//     selectedTo,
//   ]);

//   useEffect(() => {
//     fetchShipments();
//   }, [fetchShipments]);

//   useEffect(() => {
//     setPage(1);
//   }, [search, startDate, endDate, selectedUser, selectedSender, selectedFrom, selectedTo]);

//   return (
//     <div className="space-y-8 p-4 max-w-6xl mx-auto">
//       <div className="bg-white shadow-lg rounded-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//           📦 All Shipments
//         </h2>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-4 mb-4 justify-center">
//           <input
//             type="text"
//             placeholder="🔍 Search by Package ID or Sender"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-72"
//           />
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//           <input
//             type="text"
//             placeholder="👤 User"
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//           <input
//             type="text"
//             placeholder="📨 Sender"
//             value={selectedSender}
//             onChange={(e) => setSelectedSender(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//           <input
//             type="text"
//             placeholder="📍 From"
//             value={selectedFrom}
//             onChange={(e) => setSelectedFrom(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//           <input
//             type="text"
//             placeholder="📍 To"
//             value={selectedTo}
//             onChange={(e) => setSelectedTo(e.target.value)}
//             className="border p-2 rounded-md w-full sm:w-48"
//           />
//   <button
//     onClick={() => {
//       setStartDate("");
//       setEndDate("");
//       setSearch("");
//       setSelectedUser("");
//       setSelectedSender("");
//       setSelectedFrom("");
//       setSelectedTo("");
//     }}
//     className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center"
//   >
//     <RefreshCcw className="w-5 h-5 mr-2" /> Reset
//   </button>

//           {/* 📥 Download Report Button */}
//           <button
//             onClick={downloadPDF}
//             className="border p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
//           >
//             <Download className="w-5 h-5 mr-2" /> Download Report
//           </button>

import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import Select from "react-select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  XCircle,
  RefreshCcw,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
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

export default function AdminShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [gotoPage, setGotoPage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const reportDate = format(new Date(), "PPP");

    // 📄 HEADER SECTION
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Shipment Report", 140, 15, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date of Report: ${reportDate}`, 15, 25);
    let yPosition = 35;

    // 🎯 FILTERS SECTION
    if (
      startDate ||
      endDate ||
      search ||
      selectedUsers.length ||
      selectedSender ||
      selectedFrom ||
      selectedTo
    ) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Applied Filters:", 15, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      if (startDate && endDate) {
        doc.text(`Date Range: ${startDate} → ${endDate}`, 20, yPosition);
        yPosition += 7;
      }
      if (search) {
        doc.text(`Search Query: ${search}`, 20, yPosition);
        yPosition += 7;
      }
      if (selectedUsers.length) {
        doc.text(
          `Users: ${selectedUsers
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", ")}`,
          20,
          yPosition
        );
        yPosition += 7;
      }
      if (selectedSender) {
        doc.text(`Sender: ${selectedSender}`, 20, yPosition);
        yPosition += 7;
      }
      if (selectedFrom) {
        doc.text(`From: ${selectedFrom}`, 20, yPosition);
        yPosition += 7;
      }
      if (selectedTo) {
        doc.text(`To: ${selectedTo}`, 20, yPosition);
        yPosition += 7;
      }

      yPosition += 5;
    }

    // 📊 TABLE HEADERS (Image Column Removed)
    const tableColumnHeaders = [
      "Package ID",
      "User",
      "Sender",
      "From",
      "To",
      "Date",
      "Note",
    ];
    const tableRows = shipments.map((shipment) => [
      shipment.package_id,
      `${shipment.profiles?.first_name} ${shipment.profiles?.last_name}`,
      shipment.sender_name,
      shipment.from_address,
      shipment.to_address,
      format(new Date(shipment.created_at), "PPP"),
      shipment.note,
    ]);

    // 🏗️ Render Table with Custom Column Widths
    doc.autoTable({
      startY: yPosition,
      head: [tableColumnHeaders],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [22, 38, 74], textColor: [255, 255, 255] }, // Dark blue header with white text
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 10 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 35 },
        6: { cellWidth: 50 }, // Increases width for the "Note" column (index 6)
      },
    });

    doc.save(`Shipment_Report_${reportDate}.pdf`);
};


//   const downloadPDF = () => {
//     const doc = new jsPDF({ orientation: "landscape" });
//     const reportDate = format(new Date(), "PPP");
  
//     // 📄 HEADER SECTION
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(22);
//     doc.text("Shipment Report", 140, 15, { align: "center" });
  
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Date of Report: ${reportDate}`, 15, 25);
//     let yPosition = 35;
  
//     // 🎯 FILTERS SECTION
//     if (
//       startDate ||
//       endDate ||
//       search ||
//       selectedUsers.length ||
//       selectedSender ||
//       selectedFrom ||
//       selectedTo
//     ) {
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.text("Applied Filters:", 15, yPosition);
//       yPosition += 8;
  
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "normal");
  
//       if (startDate && endDate) {
//         doc.text(`Date Range: ${startDate} → ${endDate}`, 20, yPosition);
//         yPosition += 7;
//       }
//       if (search) {
//         doc.text(`Search Query: ${search}`, 20, yPosition);
//         yPosition += 7;
//       }
//       if (selectedUsers.length) {
//         doc.text(
//           `Users: ${selectedUsers
//             .map((u) => `${u.first_name} ${u.last_name}`)
//             .join(", ")}`,
//           20,
//           yPosition
//         );
//         yPosition += 7;
//       }
//       if (selectedSender) {
//         doc.text(`Sender: ${selectedSender}`, 20, yPosition);
//         yPosition += 7;
//       }
//       if (selectedFrom) {
//         doc.text(`From: ${selectedFrom}`, 20, yPosition);
//         yPosition += 7;
//       }
//       if (selectedTo) {
//         doc.text(`To: ${selectedTo}`, 20, yPosition);
//         yPosition += 7;
//       }
  
//       yPosition += 5;
//     }
  
//     // 📊 TABLE HEADERS
//     const tableColumnHeaders = [
//       "Package ID",
//       "User",
//       "Sender",
//       "From",
//       "To",
//       "Date",
//     ];
//     const tableRows = shipments.map((shipment) => [
//       shipment.package_id,
//       `${shipment.profiles?.first_name} ${shipment.profiles?.last_name}`,
//       shipment.sender_name,
//       shipment.from_address,
//       shipment.to_address,
//       format(new Date(shipment.created_at), "PPP"),
//     ]);
  
//     // 🏗️ Render Table
//     doc.autoTable({
//       startY: yPosition,
//       head: [tableColumnHeaders],
//       body: tableRows,
//       theme: "striped",
//       headStyles: { fillColor: [22, 38, 74], textColor: [255, 255, 255] },
//       alternateRowStyles: { fillColor: [240, 240, 240] },
//       margin: { top: 10 },
//     });
  
//     // ✅ Convert PDF to Blob
//     const pdfBlob = doc.output("blob");

//     // ✅ Convert Blob to File URL (WebView-Safe)
//     const file = new File([pdfBlob], `Shipment_Report_${reportDate}.pdf`, { type: "application/pdf" });
//     const fileURL = URL.createObjectURL(file);

//     // ✅ Create Hidden <a> Tag to Trigger Download
//     const link = document.createElement("a");
//     link.href = fileURL;
//     link.download = `Shipment_Report_${reportDate}.pdf`;
//     document.body.appendChild(link);
//     link.click();

//     // ✅ Cleanup
//     document.body.removeChild(link);
//     URL.revokeObjectURL(fileURL);
// };
  

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);

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
        .order("created_at", { ascending: false })
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

      if (selectedUsers.length) {
        query = query.in(
          "user_id",
          selectedUsers.map((u) => u.id)
        );
      }

      if (selectedSender) {
        query = query.ilike("sender_name", `%${selectedSender}%`);
      }

      if (selectedFrom) {
        query = query.ilike("from_address", `%${selectedFrom}%`);
      }

      if (selectedTo) {
        query = query.ilike("to_address", `%${selectedTo}%`);
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
  }, [
    search,
    startDate,
    endDate,
    page,
    pageSize,
    selectedUsers,
    selectedSender,
    selectedFrom,
    selectedTo,
  ]);

  useEffect(() => {
    fetchUsers();
    fetchShipments();
  }, [fetchShipments]);

  return (
    <div className="space-y-8 p-4 max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          📦 All Shipments
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          <input
            type="text"
            placeholder="🔍 Search by Package ID or Sender"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-72"
          />
          <label className="block text-gray-700 text-sm font-bold mt-3">
            From Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-48"
          />
          <label className="block text-gray-700 text-sm font-bold mt-3">
            To Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-48"
          />
          <Select
            isMulti
            options={users.map((user) => ({
              value: user.id,
              label: `${user.first_name} ${user.last_name}`,
            }))}
            onChange={(selected) =>
              setSelectedUsers(
                selected.map((s) => ({
                  id: s.value,
                  first_name: s.label.split(" ")[0],
                  last_name: s.label.split(" ")[1],
                }))
              )
            }
            placeholder="👤 Select Users"
            className="w-full sm:w-64"
          />
          <input
            type="text"
            placeholder="📨 Sender"
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-32"
          />
          <input
            type="text"
            placeholder="📍 From"
            value={selectedFrom}
            onChange={(e) => setSelectedFrom(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-20"
          />
          <input
            type="text"
            placeholder="📍 To"
            value={selectedTo}
            onChange={(e) => setSelectedTo(e.target.value)}
            className="border p-2 rounded-md w-full sm:w-20"
          />
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSearch("");
              setSelectedUsers([]);
              setSelectedSender("");
              setSelectedFrom("");
              setSelectedTo("");
            }}
            className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center"
          >
            <RefreshCcw className="w-5 h-5 mr-2" /> Reset
          </button>
          <button
            onClick={downloadPDF}
            className="border p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
          >
            <Download className="w-5 h-5 mr-2" /> Download Report
          </button>
        </div>

        {/* Loading Animation */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
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
                  <tr
                    key={shipment.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
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
                          className="h-12 w-12 rounded cursor-pointer transition-transform hover:scale-110"
                          onClick={() => setSelectedImage(shipment.image_url)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
          {/* Go to Page & Page Size Selector */}
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              className="border p-2 rounded-md w-20"
              placeholder="Go to.."
            />
            <button
              onClick={() => {
                if (Number(gotoPage) >= 1 && Number(gotoPage) <= totalPages)
                  setPage(Number(gotoPage));
              }}
              className="border p-2 rounded-md bg-indigo-500 text-white"
            >
              Go
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border p-2 rounded-md"
            >
              {[5, 10, 50, 500, 5000].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-2 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="border p-2 rounded-md"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border p-2 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="p-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border p-2 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              className="border p-2 rounded-md"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-1 shadow-md"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
