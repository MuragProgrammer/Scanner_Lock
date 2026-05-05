import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [auth, setAuth] = useState(
    !!localStorage.getItem("token")
  );

  return auth ? (
    <Dashboard />
  ) : (
    <Login setAuth={setAuth} />
  );
}

export default App;