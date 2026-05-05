import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import client from "../services/mqtt";

export default function Navbar() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState([]);

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  // ================= FETCH CARDS =================
  const fetchCards = () => {
    client.publish("lock/door1/control", "GET_CARDS");
  };

  // ================= OPEN MODAL =================
  const openCards = () => {
    setShowModal(true);
    fetchCards();
  };

  // ================= DELETE =================
  const deleteCard = (uid) => {
    client.publish("lock/door1/control", `DELETE:${uid}`);
  };

  // ================= ADD MODE =================
  const addCard = () => {
    client.publish("lock/door1/control", "ADD_MODE");
    alert("Scan new card on device...");
  };

  // ================= MQTT LISTENER =================
  useEffect(() => {
    client.subscribe("lock/door1/cards");
    client.subscribe("lock/door1/status");

    const handler = (topic, message) => {
      const msg = message.toString();

      // ================= CARDS LIST =================
      if (topic === "lock/door1/cards") {
        const list = msg.split(",").filter(Boolean);
        setCards([...list]);
      }

      // ================= AUTO REFRESH AFTER CHANGE =================
      if (
        msg === "CARD_ADDED" ||
        msg === "CARD_DELETED"
      ) {
        fetchCards(); // 🔥 AUTO REFRESH
      }
    };

    client.on("message", handler);

    return () => {
      client.removeListener("message", handler);
    };
  }, []);

  return (
    <>
      <div className="nav">
        <h3>RFID Lock System</h3>

        <div className="nav-btn">
          <button onClick={openCards}>Cards</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cards</h3>

            <table>
              <thead>
                <tr>
                  <th>UID</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {cards.map((uid, i) => (
                  <tr key={i}>
                    <td>{uid}</td>
                    <td>
                      <button onClick={() => deleteCard(uid)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="modal-actions">
              <button onClick={addCard}>Add Card</button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}