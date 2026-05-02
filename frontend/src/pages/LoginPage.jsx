import api from "../api/axios";
import { saveToken, saveUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
  if (!username || !password) {
    setError("Please fill in all fields");
    return;
  }

  try {
    const res = await api.post(`${API}/api/v1/users/login`, { username, password });
    const { token, user } = res.data;

    if (token) {
      saveToken(token);
      saveUser(user);
      setError("");

      // conditional routing
      const dept = user.department?.toUpperCase();

      if (dept === "ADMIN") {
     
        navigate("/admin", { replace: true });
      } else {
   
        navigate("/dashboard", { replace: true });
      }
            
    } else {
      setError("Login failed: no token returned");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Invalid username or password");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      
    
      <div className="admin-card w-full max-w-md text-center animate-fade-in">

     
        <h2 className="text-3xl font-black text-[var(--color-primary)] uppercase">
          Professor Login
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 mb-6">
          Enter your credentials to continue
        </p>

      
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 mb-4 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}

     
        <div className="space-y-4 text-left">

          <div>
            <label className="text-xs font-bold uppercase text-gray-500">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-500">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            />
          </div>

        </div>

     
        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-[var(--color-primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all"
        >
          Login
        </button>

      
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>

      </div>
    </div>
  );
}

export default Login;