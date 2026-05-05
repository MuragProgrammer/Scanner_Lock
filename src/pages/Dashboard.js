import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/Dashboard.css";
import client from "../services/mqtt";

export default function Dashboard() {
  const [status, setStatus] = useState("SEARCHING");
  const [lastUpdated, setLastUpdated] = useState(null);

  const unlock = () => {
    client.publish("lock/door1/control", "UNLOCK");
  };

  const lock = () => {
    client.publish("lock/door1/control", "LOCK");
  };

  useEffect(() => {
    client.subscribe("lock/door1/status");
    client.subscribe("lock/door1/rfid");

    client.on("message", (topic, message) => {
      const msg = message.toString();

      if (topic === "lock/door1/status") {
        setStatus(msg);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    });

    return () => client.removeAllListeners("message");
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="card">
          <div className={`status ${status.toLowerCase()}`}>
            {status}
          </div>

          <p>Last updated: {lastUpdated}</p>

          <div className="buttons">
            <button onClick={unlock}>Unlock</button>
            <button onClick={lock}>Lock</button>
          </div>
        </div>
      </div>
    </>
  );
}