import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/main.module.css"; // Import with a variable 'styles'

const Main = () => {
  console.log("Main.jsx está renderizando"); // Verificación de renderizado

  return (
    <div className={styles.hero}>
      <header className={styles.mainHeader}>
        <div className={styles.title}>
          <h1>¡Bienvenido a Servicio de Arrendamientos! 🏡</h1>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/registro">Registrar Usuario</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <h2>Tu plataforma confiable para la gestión de arrendamientos de inmuebles</h2>
        <p>Administra propiedades, contratos y pagos de manera eficiente y segura.</p>
        <p>¡Inicia sesión y simplifica la gestión de tus arrendamientos! 🚀</p>
      </main>
    </div>
  );
};

export default Main;
