import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";
import { buildScheduleTimeRange } from "../utils/scheduleTime";

const API = import.meta.env.VITE_API_URL;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = [
  { label: "Lab", value: "lab" },
  { label: "Lecture", value: "lecture" },
];

const ScheduleModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ subject: "", room: "", startTime: "", endTime: "", day: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    setLoading(true);
    setError("");
    try {
      await api.post(`${API}/api/v1/schedules/create`, {
        subject: form.subject,
        room: form.room,
        day: form.day,
        time: timeRange,
        type: form.type,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add Schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-3 mb-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
