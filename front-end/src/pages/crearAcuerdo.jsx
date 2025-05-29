import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/crearAcuerdo.module.css";
import { obtenerUsuario, registrarAcuerdo } from "../services/conexiones";
import { obtenerAcuerdoPorId } from "../services/conexiones";
import api from "../services/conexiones"; // Asegúrate de tener tu instancia de axios aquí



export default function CrearAcuerdo() {
  const navigate = useNavigate();
  const { idAcuerdo } = useParams();
  const { idAviso } = useParams();
  const [archivoContratoFile, setArchivoContratoFile] = useState(null);
  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: "",
    archivoContrato: "",
    arrendatarioCorreo: "",
  });
  const [mensajes, setMensajes] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Solo propietario puede acceder
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuario = await obtenerUsuario();
        setUsuarioSesion(usuario);
        if (usuario.tipo !== "propietario") {
          setMensajes([{ texto: "Acceso denegado: solo propietarios.", tipo: "error" }]);
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (error) {
        setMensajes([{ texto: "Error al obtener usuario.", tipo: "error" }]);
        setTimeout(() => navigate("/"), 2000);
      }
    };
    cargarUsuario();
  }, [navigate]);

  // Mensajes temporales
  useEffect(() => {
    if (mensajes.length > 0) {
      const timer = setTimeout(() => setMensajes((prev) => prev.slice(1)), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensajes]);

  useEffect(() => {
  const validarAcuerdo = async () => {
    try {
      const acuerdo = await obtenerAcuerdoPorId (idAcuerdo);
      if (acuerdo) {
        setMensajes([{ texto: "Este aviso ya tiene un acuerdo registrado.", tipo: "error" }]);
        // Opcional: redirige o deshabilita el formulario
        setTimeout(() => navigate(`/acuerdo/modificar/${idAviso}`), 2000);
      }
    } catch (error) {
      // Si no hay acuerdo, puedes continuar normalmente
    }
  };
  validarAcuerdo();
}, [idAviso]);

  // Manejo de campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de archivo contrato (PDF)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMensajes((prev) => [
        ...prev,
        { texto: "El contrato debe ser un archivo PDF.", tipo: "error" },
      ]);
      return;
    }
    setArchivoContratoFile(file);
    setForm((prev) => ({ ...prev, archivoContrato: file.name }));
    // Si necesitas subirlo a un backend, implementa aquí la lógica de subida y guarda la URL
  };

  // Validación y envío
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.fechaInicio || !form.fechaFin || !form.arrendatarioCorreo || !form.archivoContrato) {
      setMensajes((prev) => [
        ...prev,
        { texto: "Todos los campos son obligatorios.", tipo: "error" },
      ]);
      return;
    }
    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      setMensajes((prev) => [
        ...prev,
        { texto: "La fecha de finalización no puede ser anterior a la de inicio.", tipo: "error" },
      ]);
      
      return;
    }
        // Buscar usuario por correo
    let usuarioArrendatario;
    try {
    const res = await api.get(`/usuario/correo/${encodeURIComponent(form.arrendatarioCorreo)}`);
      usuarioArrendatario = res.data; 
      if (!usuarioArrendatario || !(usuarioArrendatario.id || usuarioArrendatario._id)) {
        setMensajes((prev) => [
          ...prev,
          { texto: "No se encontró un usuario con ese correo.", tipo: "error" },
        ]);
        return;
      }
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { texto: "No se encontró un usuario con ese correo.", tipo: "error" },
      ]);
      return;
    }console.log(usuarioArrendatario);

    // Construcción del objeto para el backend
const acuerdo = {
  avisosId: idAviso,
  fechaInicio: new Date(form.fechaInicio + "T00:00:00").toISOString(),
  fechaFin: new Date(form.fechaFin + "T00:00:00").toISOString(),
  archivoContrato: form.archivoContrato,
  arrendatario: {
    usuarioId: usuarioArrendatario.id || usuarioArrendatario._id,
    correo: usuarioArrendatario.correo,
    nombre: usuarioArrendatario.nombre
  }
};
  console.log("Acuerdo a enviar:", acuerdo);
    try {
      await registrarAcuerdo(acuerdo);
      setMensajes((prev) => [
        ...prev,
        { texto: "¡Acuerdo registrado exitosamente!", tipo: "success" },
      ]);
      setTimeout(() => navigate("/misAcuerdos"), 2000);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { texto: "Error al registrar el acuerdo.", tipo: "error" },
      ]);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

return (
  <div className={styles.acuerdoContainer}>
    <header className={styles.headerAcuerdo}>
      <span className={styles.iconMenu} onClick={toggleMenu}>☰</span>
      <h1 className={styles.titulo}>Servicios de arrendamiento</h1>
    </header>

    <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
      <button onClick={() => { navigate("/propietario"); }}>Inicio</button>
      <button onClick={() => { navigate("/perfil"); }}>Perfil</button>
      <button onClick={() => { navigate("/MisAvisos"); }}>Mis Avisos</button>
    </nav>
    
    <h2 className={styles.seccionTitulo}>Registrar Acuerdo de Arrendamiento</h2>

    <form className={styles.formAcuerdo} onSubmit={handleSubmit}>
        <div className={styles.campoForm}>
          <label>Fecha de inicio:</label>
          <input
            type="date"
            name="fechaInicio"
            value={form.fechaInicio}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.campoForm}>
          <label>Fecha de finalización:</label>
          <input
            type="date"
            name="fechaFin"
            value={form.fechaFin}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.campoForm}>
          <label>Correo del arrendatario:</label>
          <input
            type="email"
            name="arrendatarioCorreo"
            value={form.arrendatarioCorreo}
            onChange={handleInputChange}
            placeholder="Correo del arrendatario"
            required
          />
        </div>
        <div className={styles.campoForm}>
          <label>Contrato (PDF):</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {form.archivoContrato && (
            <span className={styles.archivoNombre}></span>
          )}
  {/* Enlace para descargar o ver el PDF */}
  {archivoContratoFile && (
    <a
      href={URL.createObjectURL(archivoContratoFile)}
      target="_blank"
      rel="noopener noreferrer"
      download={form.archivoContrato}
      style={{ marginTop: "0.5rem", display: "inline-block", color: "#0284c7", textDecoration: "underline" }}
    >
      {form.archivoContrato}
    </a>
  )}
</div>
      <button type="submit" className={styles.btnRegistrar}>
        Registrar Acuerdo
      </button>
        {mensajes.length > 0 && (
          <p className={mensajes[0].tipo === "success" ? styles.mensajeExito : styles.error}>
            {mensajes[0].texto}
          </p>
        )}
      </form>
    </div>
  );
}