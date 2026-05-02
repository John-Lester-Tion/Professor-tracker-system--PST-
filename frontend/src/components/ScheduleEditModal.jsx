import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";
import { buildScheduleTimeRange, parseScheduleTimeRange } from "../utils/scheduleTime";

const API = import.meta.env.VITE_API_URL;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = [
  { label: "Lab", value: "lab" },
  { label: "Lecture", value: "lecture" },
];

const ScheduleEditModal = ({ schedule, onClose, onSuccess }) => {
  const [form, setForm] = useState({ subject: "", room: "", startTime: "", endTime: "", day: "", type: "lecture" });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!schedule) return;
    const parsedTime = parseScheduleTimeRange(schedule.time || "");
    setForm({
      subject: schedule.subject || "",
      room: schedule.room || "",
      startTime: parsedTime.startTime,
      endTime: parsedTime.endTime,
      day: schedule.day || "",
      type: String(schedule.type || "").trim().toLowerCase() === "lab" ? "lab" : "lecture",
    });
  }, [schedule]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!schedule?._id) {
      setError("Schedule ID is missing");
      return;
    }
    if (!form.subject || !form.room || !form.startTime || !form.endTime || !form.day || !form.type) {
      setError("All fields are required");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time");
      return;
    }

    const timeRange = buildScheduleTimeRange(form.startTime, form.endTime);
    if (!timeRange) {
      setError("Please enter valid start and end times");
      return;
    }

    setLoadingEdit(true);
    setError("");
    try {
      await api.patch(`/schedules/update/${schedule._id}`, {
        subject: form.subject,
        room: form.room,
        day: form.day,
        time: timeRange,
        type: form.type,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update schedule");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDeleteClick = () => {
    if (!schedule?._id) {
      setError("Schedule ID is missing");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    setError("");
    try {
      await api.delete(`/schedules/delete/${schedule._id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete schedule");
      setShowDeleteConfirm(false);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Manage Schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 mb-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Microbiology II"
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Room</label>
            <input
              name="room"
              value={form.room}
              onChange={handleChange}
              placeholder="e.g. FH201"
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              min={"7:00"}
              max={"20:00"}
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              min={"7:00"}
              max={"20:00"}
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Day</label>
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">Select a day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">Select a type</option>
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={loadingDelete || loadingEdit}
              className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {loadingDelete ? "Deleting..." : "Delete"}
            </button>
            <button
              type="submit"
              disabled={loadingEdit || loadingDelete}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
            >
              {loadingEdit ? "Saving..." : "Edit"}
            </button>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/45 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Delete Schedule?</h4>
            <p className="text-sm text-gray-600 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loadingDelete}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loadingDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
              >
                {loadingDelete ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditModal;
