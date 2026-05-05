import { useState } from "react";
import "./Login.css";

export default function Login({ setAuth }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

    const login = (e) => {
    e.preventDefault();

    if (user === "admin" && password === "1234") {
        localStorage.setItem("token", "fake-token");
        setAuth(true);
    } else {
        alert("Invalid credentials");
    }
    };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 RFID Lock</h2>
        <p className="subtitle">Secure Access Control</p>

        <form onSubmit={login}>
          <input
            type="user"
            placeholder="User"
            onChange={(e) => setUser(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}