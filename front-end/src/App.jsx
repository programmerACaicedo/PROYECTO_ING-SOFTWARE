import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas
import Main from "./pages/main";
import Login from "./pages/login";
import Registro from "./pages/registro";
import OlvidoContraseña from "./pages/olvidoContraseña";
import Interior from "./pages/mainInterior";


import "./styles/App.css";

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvido-contraseña" element={<OlvidoContraseña />} />
        <Route path="/interior" element={<Interior />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



