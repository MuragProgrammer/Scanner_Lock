import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import "./Dashboard.css";
import client from "../services/mqtt";

export default function Dashboard() {
  const [status, setStatus] = useState("SEARCHING");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUser, setLastUser] = useState("No User Yet");

  const lastUIDRef = useRef("");

  // ================= STORAGE =================
  const getSavedCards = () => {
    return JSON.parse(localStorage.getItem("cardNames") || "{}");
  };

  // ================= NORMALIZE =================
  const normalizeUID = (uid) => {
    return uid.toString().replace(/\s/g, "").toUpperCase();
  };

  // ================= ACTIVE USER =================
  const getActiveUser = () => {
    return (localStorage.getItem("activeUser") || "ADMIN").toUpperCase();
  };

  // ================= CONTROL =================
  const unlock = () => {
    const uid = lastUIDRef.current;
    const cards = getSavedCards();

    // ❗ BLOCK IF NOT VALID CARD
    if (uid && !cards[uid]) {
      setLastUser("INVALID ACCESS (BLOCKED)");
      setLastUpdated(new Date().toLocaleTimeString());
      return;
    }

    client.publish("lock/door1/control", "UNLOCK");

    setLastUser(getActiveUser());
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const lock = () => {
    const uid = lastUIDRef.current;
    const cards = getSavedCards();

    if (uid && !cards[uid]) {
      setLastUser("INVALID ACCESS (BLOCKED)");
      setLastUpdated(new Date().toLocaleTimeString());
      return;
    }

    client.publish("lock/door1/control", "LOCK");

    setLastUser(getActiveUser());
    setLastUpdated(new Date().toLocaleTimeString());
  };

  // ================= MQTT =================
  useEffect(() => {
    client.subscribe("lock/door1/status");
    client.subscribe("lock/door1/rfid");

    const handler = (topic, message) => {
      const raw = message.toString().trim();
      const cards = getSavedCards();

      if (topic === "lock/door1/rfid") {
        const uid = normalizeUID(raw);
        lastUIDRef.current = uid;

        setLastUser(cards[uid] || "Unknown User");
        setLastUpdated(new Date().toLocaleTimeString());
      }

      if (topic === "lock/door1/status") {
        setStatus(raw);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    };

    client.on("message", handler);

    return () => client.removeListener("message", handler);
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="card">

          <div className={`status ${status.toLowerCase()}`}>
            {status}
          </div>

          <div className="user-info">
            <p>by</p>
            <h3>{lastUser}</h3>
          </div>

          <p>Last updated: {lastUpdated || "No activity yet"}</p>

          <div className="buttons">
            <button onClick={unlock}>Unlock</button>
            <button onClick={lock}>Lock</button>
          </div>

        </div>
      </div>
    </>
  );
}