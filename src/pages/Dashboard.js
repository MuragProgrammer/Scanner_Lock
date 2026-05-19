import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import "./Dashboard.css";
import client from "../services/mqtt";

// ===== TOAST =====
import {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning,
} from "../utils/toast";

export default function Dashboard() {
  const [status, setStatus] = useState("SEARCHING");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUser, setLastUser] = useState("No User Yet");

  // ===== COOLDOWN =====
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const lastUIDRef = useRef("");

  // ================= STORAGE =================
  const getSavedCards = () => {
    return JSON.parse(
      localStorage.getItem("cardNames") || "{}"
    );
  };

  // ================= NORMALIZE =================
  const normalizeUID = (uid) => {
    return uid
      .toString()
      .replace(/\s/g, "")
      .toUpperCase();
  };

  // ================= ACTIVE USER =================
  const getActiveUser = () => {
    return (
      localStorage.getItem("activeUser") || "ADMIN"
    ).toUpperCase();
  };

  // ================= UNLOCK =================
  const unlock = () => {
    // ===== BLOCK SPAM =====
    if (isCoolingDown) return;

    setIsCoolingDown(true);

    const uid = lastUIDRef.current;
    const cards = getSavedCards();

    // BLOCK INVALID CARD
    if (uid && !cards[uid]) {
      setLastUser("INVALID ACCESS (BLOCKED)");
      setLastUpdated(new Date().toLocaleTimeString());

      notifyError("Access denied! Invalid RFID card.");

      setTimeout(() => {
        setIsCoolingDown(false);
      }, 3000);

      return;
    }

    client.publish("lock/door1/control", "UNLOCK");

    setLastUser(getActiveUser());
    setLastUpdated(new Date().toLocaleTimeString());

    notifySuccess("Door unlocked");

    // ===== ENABLE AGAIN =====
    setTimeout(() => {
      setIsCoolingDown(false);
    }, 3000);
  };

  // ================= LOCK =================
  const lock = () => {
    // ===== BLOCK SPAM =====
    if (isCoolingDown) return;

    setIsCoolingDown(true);

    const uid = lastUIDRef.current;
    const cards = getSavedCards();

    if (uid && !cards[uid]) {
      setLastUser("INVALID ACCESS (BLOCKED)");
      setLastUpdated(new Date().toLocaleTimeString());

      notifyError("Access denied! Invalid RFID card.");

      setTimeout(() => {
        setIsCoolingDown(false);
      }, 3000);

      return;
    }

    client.publish("lock/door1/control", "LOCK");

    setLastUser(getActiveUser());
    setLastUpdated(new Date().toLocaleTimeString());

    notifyInfo("Door locked");

    // ===== ENABLE AGAIN =====
    setTimeout(() => {
      setIsCoolingDown(false);
    }, 3000);
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

        const user = cards[uid] || "Unknown User";

        setLastUser(user);
        setLastUpdated(
          new Date().toLocaleTimeString()
        );

        if (cards[uid]) {
          notifySuccess(`RFID Detected: ${user}`);
        } else {
          notifyWarning("Unknown RFID card scanned");
        }
      }

      if (topic === "lock/door1/status") {
        setStatus(raw);
        setLastUpdated(
          new Date().toLocaleTimeString()
        );
      }
    };

    client.on("message", handler);

    return () =>
      client.removeListener("message", handler);
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="card">
          <div
            className={`status ${status.toLowerCase()}`}
          >
            {status}
          </div>

          <div className="user-info">
            <p>by</p>
            <h3>{lastUser}</h3>
          </div>

          <p>
            Last updated:{" "}
            {lastUpdated || "No activity yet"}
          </p>

          <div className="buttons">
            <button
              onClick={unlock}
              disabled={isCoolingDown}
            >
              {isCoolingDown
                ? "Unlock"
                : "Unlock"}
            </button>

            <button
              onClick={lock}
              disabled={isCoolingDown}
            >
              {isCoolingDown
                ? "Lock"
                : "Lock"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}