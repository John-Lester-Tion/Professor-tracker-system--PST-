import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import AddFacultyModal from "../components/AddFacultyModal";
import EditFacultyModal from "../components/EditFacultyModal";
import Toast from "../components/Toast";
import api, { deleteProfessor } from "../api/axios";
import { clearToken, clearUser, getUser } from "../utils/auth";
import { Trash2, Pencil, LogOut, Search, Filter } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { professors, loading, refresh } = useUsers();

  const [open, setOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const departmentMap = {
    ccs: "College of Computer Studies",
    engineering: "College of Engineering",
    arts_sciences: "College of Arts & Sciences",
    medicine: "School of Medicine",
    nursing: "College of Nursing",
    agriculture: "College of Agriculture",
    education: "College of Education",
    law: "School of Law",
    ADMIN: "ADMIN"
  };

  const filteredProfessors = professors.filter((prof) => {
    const fullName = `${prof.firstName} ${prof.lastName}`.toLowerCase();
    const username = prof.username?.toLowerCase() || "";

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase());

    const matchesDept =
      deptFilter === "all" || prof.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  useEffect(() => {
    if (!user || user.department?.toUpperCase() !== "ADMIN") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await api.post(`${API}/api/v1/users/logout`, { username: user?.username });
    } finally {
      clearToken();
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  const handleRemove = async () => {
    try {
      await deleteProfessor(selectedProf._id);
      showToast("Faculty deleted successfully");
      refresh();
      setIsRemoveOpen(false);
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const welcomeName = user?.firstName || "Admin";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="p-6 max-w-7xl mx-auto space-y-10 min-h-screen">

     
        <header className="bg-white rounded-[25px] p-4 flex justify-between shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center font-black text-blue-600 bg-gray-100 rounded-full">
              {welcomeName.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">System Role</span>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-600">
              <LogOut size={24} />
            </button>
          </div>
        </header>

       
        <div className="flex justify-between items-end">
          <div>
            <p className="font-bold opacity-60 uppercase text-sm">Faculty Management</p>
            <h2 className="text-5xl font-black mt-2">
              Welcome Back,<br /> {welcomeName}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase opacity-70">Total Accounts</p>
            <h2 className="text-5xl font-black">
              {loading ? "..." : professors.length}
            </h2>
            <button
              onClick={() => setOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-3 font-bold"
            >
              Add Faculty
            </button>
          </div>
        </div>

      
        <div className="flex flex-col md:flex-row gap-3 items-center">

        
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

      
          <div className="relative">
            <Filter className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white outline-none font-medium"
            >
              <option value="all">All Departments</option>
              <option value="ccs">College of Computer Studies</option>
              <option value="engineering">College of Engineering</option>
              <option value="arts_sciences">College of Arts & Sciences</option>
              <option value="medicine">School of Medicine</option>
              <option value="nursing">College of Nursing</option>
              <option value="agriculture">College of Agriculture</option>
              <option value="education">College of Education</option>
              <option value="law">School of Law</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

        </div>

    
        <section className="bg-white rounded-[35px] p-8 shadow-2xl overflow-hidden border border-gray-50">
          <h3 className="font-black text-2xl mb-6 text-gray-800">
            Active Faculty Accounts
          </h3>

          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b">
                <th className="text-left pb-4">Username</th>
                <th className="text-left pb-4">Full Name</th>
                <th className="text-center pb-4">Department</th>
                <th className="text-right pb-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredProfessors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400">
                    No faculty found
                  </td>
                </tr>
              ) : (
                filteredProfessors.map((prof) => (
                  <tr key={prof._id} className="hover:bg-gray-50">
                    <td className="py-5 text-blue-600 font-bold">{prof.username}</td>

                    <td className="py-5 font-bold">
                      {prof.firstName} {prof.lastName}
                    </td>

                    <td className="py-5 text-center">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs uppercase">
                        {departmentMap[prof.department] || prof.department}
                      </span>
                    </td>

                    <td className="py-5 text-right space-x-3">
                      <button onClick={() => { setSelectedProf(prof); setIsEditOpen(true); }}>
                        <Pencil size={18} />
                      </button>

                      <button onClick={() => { setSelectedProf(prof); setIsRemoveOpen(true); }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

   
      <AddFacultyModal open={open} onClose={() => setOpen(false)} onSuccess={refresh} showToast={showToast} />
      <EditFacultyModal open={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={refresh} selectedProf={selectedProf} showToast={showToast} />

    
      {isRemoveOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold">Delete Faculty?</h3>
            <p className="text-gray-500 mt-2">
              This will remove {selectedProf?.firstName} {selectedProf?.lastName}
            </p>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setIsRemoveOpen(false)} className="flex-1 py-2 bg-gray-200 rounded-xl">
                Cancel
              </button>
              <button onClick={handleRemove} className="flex-1 py-2 bg-red-500 text-white rounded-xl">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
