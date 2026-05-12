import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import client from "../services/mqtt";

export default function Navbar() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  // ================= FETCH =================
  const fetchCards = () => {
    client.publish("lock/door1/control", "GET_CARDS");
  };

  const openCards = () => {
    setShowModal(true);
    fetchCards();
  };

  // ================= STORAGE =================
  const getSavedNames = () => {
    return JSON.parse(localStorage.getItem("cardNames") || "{}");
  };

  const saveNamesToStorage = (data) => {
    localStorage.setItem("cardNames", JSON.stringify(data));
  };

  // ================= UID =================
  const normalizeUID = (uid) =>
    uid.replace(/\s/g, "").toUpperCase();

  const formatUID = (uid) =>
    uid.match(/.{1,2}/g)?.join(" ") || uid;

  // ================= DELETE CARD (FIXED) =================
  const deleteCard = (uid) => {
    const cleanUID = normalizeUID(uid);

    // 1. update localStorage
    const saved = getSavedNames();
    delete saved[cleanUID];
    saveNamesToStorage(saved);

    // 2. update UI instantly
    setCards(prev => prev.filter(c => c.uid !== cleanUID));

    // 3. send to ESP32
    client.publish("lock/door1/control", `DELETE:${cleanUID}`);

    setIsDirty(true);

    console.log("Deleted card:", cleanUID);
  };

  // ================= ADD MODE =================
  const addCard = () => {
    client.publish("lock/door1/control", "ADD_MODE");
    alert("Scan new card on device...");
  };

  // ================= EDIT =================
  const editCard = (uid) => {
    const cleanUID = normalizeUID(uid);

    const newName = prompt("Enter new name:");
    if (!newName?.trim()) return;

    const saved = getSavedNames();
    saved[cleanUID] = newName.trim();
    saveNamesToStorage(saved);

    setCards(prev =>
      prev.map(c =>
        c.uid === cleanUID
          ? { ...c, name: newName.trim() }
          : c
      )
    );

    setIsDirty(true);
  };

  // ================= SAVE =================
  const saveChanges = () => {
    const map = {};

    cards.forEach(c => {
      map[normalizeUID(c.uid)] = c.name;
    });

    saveNamesToStorage(map);
    setIsDirty(false);

    alert("Saved successfully!");
  };

  // ================= MQTT =================
  useEffect(() => {
    client.subscribe("lock/door1/cards");

    const handler = (topic, message) => {
      if (topic !== "lock/door1/cards") return;

      const msg = message.toString();
      const saved = getSavedNames();

      const list = msg
        .split(",")
        .filter(Boolean)
        .map(uid => {
          const cleanUID = normalizeUID(uid);

          return {
            uid: cleanUID,
            displayUID: formatUID(cleanUID),
            name: saved[cleanUID] || "Unknown"
          };
        });

      setCards(list);
      setIsDirty(false);
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cards</h3>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UID</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {cards.length === 0 ? (
                  <tr>
                    <td colSpan="3">No cards found</td>
                  </tr>
                ) : (
                  cards.map((card, i) => (
                    <tr key={i}>
                      <td>{card.name}</td>
                      <td>{card.displayUID}</td>

                      <td>
                        <button onClick={() => editCard(card.uid)}>Edit</button>
                        <button onClick={() => deleteCard(card.uid)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="modal-actions">
              <button onClick={addCard}>Add Card</button>

              {isDirty && (
                <button onClick={saveChanges}>Save Changes</button>
              )}

              <button onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}