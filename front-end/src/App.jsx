// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Páginas
import Main from "./pages/main";
import Login from "./pages/login";
import Registro from "./pages/registro";
import OlvidoContraseña from "./pages/olvidoContraseña";
import Interior from "./pages/mainInterior";

import "./styles/App.css"; // 👈 Importa el CSS

function App() {
  return (
    <BrowserRouter>
      <BackgroundWrapper>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/olvido-contraseña" element={<OlvidoContraseña />} />
          <Route path="/interior" element={<Interior />} />
        </Routes>
      </BackgroundWrapper>
    </BrowserRouter>
  );
}

function BackgroundWrapper({ children }) {
  const location = useLocation();
  const isInicio = location.pathname === "/";

  return isInicio ? (
    <div className="App-page">
      {children}
    </div>
  ) : (
    children
  );
}

export default App;


