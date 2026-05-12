import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const INACTIVITY_LIMIT = 60 * 1000; // 10 minutes

function App() {
  const [auth, setAuth] = useState(
    !!localStorage.getItem("token")
  );

  // ================= UPDATE ACTIVITY =================
  const updateActivity = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  // ================= CHECK INACTIVITY =================
  const checkInactivity = () => {
    const last = localStorage.getItem("lastActivity");

    if (!last) return;

    const diff = Date.now() - Number(last);

    if (diff > INACTIVITY_LIMIT) {
      logout();
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    localStorage.removeItem("lastActivity");

    setAuth(false);
  };

  // ================= LOGIN LISTENER =================
  useEffect(() => {
    if (auth) {
      updateActivity();

      const events = [
        "mousemove",
        "mousedown",
        "keydown",
        "touchstart",
        "scroll",
      ];

      events.forEach((event) =>
        window.addEventListener(event, updateActivity)
      );

      const interval = setInterval(checkInactivity, 10000); // every 10 sec

      return () => {
        events.forEach((event) =>
          window.removeEventListener(event, updateActivity)
        );
        clearInterval(interval);
      };
    }
  }, [auth]);

  return auth ? (
    <Dashboard logout={logout} />
  ) : (
    <Login setAuth={setAuth} />
  );
}

export default App;