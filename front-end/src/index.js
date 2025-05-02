import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Asegúrate de que la ruta sea correcta
import "./styles/index.module.css"; // Revisa que este archivo exista
import { AuthProvider } from "./services/AuthContext"; // Importa el proveedor de contexto

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider> {/* Envolver la aplicación con el proveedor */}
    <div className="index-page">
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </div>
  </AuthProvider>
);