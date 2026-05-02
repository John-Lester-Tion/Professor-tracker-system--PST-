import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";
import { getUser, saveUser } from "../utils/auth";
import { STATUSES } from "../constants/statuses";

const API = import.meta.env.VITE_API_URL;
const StatusModal = ({ onClose, onSuccess, currentStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || null);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      const user = getUser();
      const userId = user?.id || user?._id;
      
      if (!user || !userId) {
        console.error("User not found or missing ID", user);
        return;
      }

      const response = await api.patch(`${API}/api/v1/users/updateUser/${userId}`, {
        status: status
      });

      if (response.status === 200) {
        const updatedUser = { ...user, status: status };
        saveUser(updatedUser);
        onSuccess();
        // onClose();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#14234b]">Change Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setSelectedStatus(status.value);
                handleStatusUpdate(status.value);
              }}
              disabled={status.value === "ON" && loading}
              className={`w-full p-4 rounded-xl border-2 font-semibold transition-all flex items-center gap-3 ${
                selectedStatus === status.value? `${status.bg} ${status.text} border-current`: "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}
            >
              <div className={`w-3 h-3 rounded-full ${selectedStatus === status.value ? status.dot : "bg-gray-300"}`}></div>
              <span>{status.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusModal;