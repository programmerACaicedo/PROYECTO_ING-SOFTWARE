import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Asegúrate de que la ruta sea correcta
import "./styles/index.css"; // Si hay un archivo de estilos, revisa que existe

const root = ReactDOM.createRoot(document.getElementById("root"));


root.render(
  <div className="index-page">
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </div>
);
