import { useEffect, useState, useCallback } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import "./utils/toast.css";

// ===== TOAST =====
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notifyWarning } from "./utils/toast";

const INACTIVITY_LIMIT = 60 * 1000; // 1 minute

function App() {
  const [auth, setAuth] = useState(
    !!localStorage.getItem("token")
  );

  // ================= UPDATE ACTIVITY =================
  const updateActivity = useCallback(() => {
    localStorage.setItem("lastActivity", Date.now().toString());
  }, []);

  // ================= LOGOUT =================
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeUser");
    localStorage.removeItem("lastActivity");

    notifyWarning("Logged out due to inactivity");

    setAuth(false);
  }, []);

  // ================= CHECK INACTIVITY =================
  const checkInactivity = useCallback(() => {
    const last = localStorage.getItem("lastActivity");

    if (!last) return;

    const diff = Date.now() - Number(last);

    if (diff > INACTIVITY_LIMIT) {
      logout();
    }
  }, [logout]);

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

      const interval = setInterval(checkInactivity, 10000);

      return () => {
        events.forEach((event) =>
          window.removeEventListener(event, updateActivity)
        );

        clearInterval(interval);
      };
    }
  }, [auth, updateActivity, checkInactivity]);

  return (
    <>
      {auth ? (
        <Dashboard logout={logout} />
      ) : (
        <Login setAuth={setAuth} />
      )}

      {/* ===== TOAST CONTAINER ===== */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;