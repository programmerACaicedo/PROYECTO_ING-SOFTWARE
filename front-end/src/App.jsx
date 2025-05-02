// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Páginas
import Main from "./pages/main";
import Login from "./pages/login";
import Registro from "./pages/registro";
import OlvidoContraseña from "./pages/olvidoContraseña";
import InteriorPropietario from "./pages/InteriorPropietario";
import InteriorInteresado from "./pages/InteriorInteresado";
import InteriorAdmin from "./pages/InteriorAdmin";
import NuevoAviso from "./pages/nuevoAviso";
import Perfil from "./pages/perfil";
import ActualizarPublicacion from "./pages/actualizarPublicacion";
import DetallePublicacion from "./pages/detallePublicacion";
import PublicacionesFiltradas from "./pages/publicacionesFiltradas";
import ConfirmarAvisos from "./pages/confirmarAvisos";
import DetalleAvisoAdmin from "./pages/detalleAvisoAdmin";





// Ahora importas el módulo
import styles from "./styles/App.module.css";

function App() {
  return (
    <BrowserRouter>
      <BackgroundWrapper>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/olvido-contraseña" element={<OlvidoContraseña />} />
          <Route path="/propietario" element={<InteriorPropietario />} />
          <Route path="/interesado" element={<InteriorInteresado />} />
          <Route path="/admin" element={<InteriorAdmin />} />
          <Route path="/nuevo-aviso" element={<NuevoAviso />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/actualizar-publicacion/:id" element={<ActualizarPublicacion />} />
          <Route path="/publicacion/:id" element={<DetallePublicacion />} />
          <Route path="/publicaciones/:tipo" element={<PublicacionesFiltradas />} />
          <Route path="/admin/confirmar-avisos" element={<ConfirmarAvisos />} />
          <Route path="/admin/aviso/:id" element={<DetalleAvisoAdmin />} />
        </Routes>
      </BackgroundWrapper>
    </BrowserRouter>
  );
}

function BackgroundWrapper({ children }) {
  const location = useLocation();
  const isInicio = location.pathname === "/";

  return isInicio ? (
    <div className={styles["App-page"]}>
      {children}
    </div>
  ) : (
    children
  );
}

export default App;
