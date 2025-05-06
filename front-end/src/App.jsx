import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import RutaProtegida from "./pages/RutaProtegida";
import { AuthProvider } from "./services/AuthContext";
import { SocketProvider } from "./context/SocketContext";

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
import Mensajes from "./pages/mensajes";
import RestablecerContraseña from "./pages/RestablecerContrasena";





// Ahora importas el módulo
import styles from "./styles/App.module.css";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <BackgroundWrapper>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/olvido-contraseña" element={<OlvidoContraseña />} />
              <Route path="/mensajes" element={<RutaProtegida><Mensajes /></RutaProtegida>} /> {/* Nueva ruta */}

              {/* Rutas protegidas */}
              <Route path="/propietario" element={<RutaProtegida><InteriorPropietario /></RutaProtegida>} />
              <Route path="/interesado" element={<RutaProtegida><InteriorInteresado /></RutaProtegida>} />
              <Route path="/admin" element={<RutaProtegida><InteriorAdmin /></RutaProtegida>} />
              <Route path="/nuevo-aviso" element={<RutaProtegida><NuevoAviso /></RutaProtegida>} />
              <Route path="/restablecer-contraseña/:token" element={<RestablecerContraseña />} />
              <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
              <Route path="/actualizar-publicacion/:id" element={<RutaProtegida><ActualizarPublicacion /></RutaProtegida>} />
              <Route path="/publicacion/:id" element={<RutaProtegida><DetallePublicacion /></RutaProtegida>} />
              <Route path="/publicaciones/:tipo" element={<RutaProtegida><PublicacionesFiltradas /></RutaProtegida>} />
              <Route path="/admin/confirmar-avisos" element={<RutaProtegida><ConfirmarAvisos /></RutaProtegida>} />
              <Route path="/admin/aviso/:id" element={<RutaProtegida><DetalleAvisoAdmin /></RutaProtegida>} />
            </Routes>
          </BackgroundWrapper>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
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