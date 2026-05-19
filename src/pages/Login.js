import { useState } from "react";
import "./Login.css";

// ===== TOAST =====
import {
  notifySuccess,
  notifyError,
} from "../utils/toast";

export default function Login({ setAuth }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // ================= LOGIN =================
  const login = (e) => {
    e.preventDefault();

    if (user === "admin" && password === "1234") {
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("activeUser", user);

      notifySuccess("Login successful!");

      setAuth(true);
    } else {
      notifyError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 RFID Lock</h2>

        <p className="subtitle">
          Secure Access Control
        </p>

        <form onSubmit={login}>
          <input
            type="text"
            placeholder="User"
            value={user}
            onChange={(e) =>
              setUser(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}