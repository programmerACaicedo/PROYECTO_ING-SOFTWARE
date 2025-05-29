import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/crearAcuerdo.module.css";
import { obtenerAcuerdoPorId, modificarAcuerdo, cancelarAcuerdo } from "../services/conexiones";
import api from "../services/conexiones";

export default function ModificarAcuerdo() {
  const navigate = useNavigate();
  const { idAcuerdo } = useParams();
  const [acuerdo, setAcuerdo] = useState(null);
  const [form, setForm] = useState({ fechaInicio: "", fechaFin: "", archivoContrato: "" });
  const [archivoContratoFile, setArchivoContratoFile] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar acuerdo
  useEffect(() => {
    const cargarAcuerdo = async () => {
      try {
        const data = await obtenerAcuerdoPorId(idAcuerdo);
        setAcuerdo(data);
        setForm({
          fechaInicio: "",
          fechaFin: data.fechaFin ? data.fechaFin.slice(0, 10) : "",
          archivoContrato: data.archivoContrato || "",
        });
      } catch {
        setMensajes([{ texto: "No se pudo cargar el acuerdo.", tipo: "error" }]);
      } finally {
        setIsLoading(false);
      }
    };
    cargarAcuerdo();
  }, [idAcuerdo]);

  // Validaciones y restricciones
  const esModificable = acuerdo && acuerdo.estado !== "Cancelado" && acuerdo.estado !== "Finalizado";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Manejo de campos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de archivo PDF
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setArchivoContratoFile(file);
      setForm((prev) => ({ ...prev, archivoContrato: file.name }));
    } else {
      setMensajes([{ texto: "El contrato debe ser un archivo PDF.", tipo: "error" }]);
    }
  };

  // Guardar cambios
const handleSubmit = async (e) => {
  e.preventDefault();
  setMensajes([]);
  if (!esModificable) {
    setMensajes([{ texto: "No se puede modificar un acuerdo cancelado o finalizado.", tipo: "error" }]);
    return;
  }
  if (!form.fechaInicio || !form.fechaFin) {
    setMensajes([{ texto: "Ambas fechas son obligatorias.", tipo: "error" }]);
    return;
  }
  const fechaInicio = new Date(form.fechaInicio + "T00:00:00");
  const fechaFin = new Date(form.fechaFin + "T00:00:00");
  if (fechaFin <= fechaInicio) {
    setMensajes([{ texto: "La fecha de finalización debe ser posterior a la de inicio.", tipo: "error" }]);
    return;
  }
  try {
    const extension = {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      archivoContrato: form.archivoContrato,
    };
    console.log("Enviando extensión:", extension);
    await modificarAcuerdo(acuerdo.id, extension);
    setMensajes([{ texto: "Acuerdo actualizado correctamente.", tipo: "success" }]);
    setTimeout(() => navigate("/misAcuerdos"), 2000);
  } catch (error) {
    setMensajes([{ texto: "Error al actualizar el acuerdo.", tipo: "error" }]);
    console.error(error);
  }
};

  // Cancelar acuerdo
  const handleCancelar = async (e) => {
    e.preventDefault();
    if (motivoCancelacion.length < 20) {
      setMensajes([{ texto: "El motivo debe tener al menos 20 caracteres.", tipo: "error" }]);
      return;
    }
    if (acuerdo.estado === "Finalizado") {
      setMensajes([{ texto: "No se puede cancelar un acuerdo finalizado.", tipo: "error" }]);
      return;
    }
    try {
      await cancelarAcuerdo(acuerdo.id, motivoCancelacion);
      setMensajes([{ texto: "Acuerdo cancelado correctamente.", tipo: "success" }]);
      setMostrarModal(false);
      setTimeout(() => navigate("/misAcuerdos"), 2000);
    } catch {
      setMensajes([{ texto: "Error al cancelar el acuerdo.", tipo: "error" }]);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (!acuerdo) return <div>No se encontró el acuerdo.</div>;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);


  return (
    <div className={styles.acuerdoContainer}>
      <header className={styles.headerAcuerdo}>
      <span className={styles.iconMenu} onClick={toggleMenu}>☰</span>
        <h1 className={styles.titulo}>Servicio de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
      <button onClick={() => { navigate("/propietario"); }}>Inicio</button>
      <button onClick={() => { navigate("/perfil"); }}>Perfil</button>
      <button onClick={() => { navigate("/MisAvisos"); }}>Mis Avisos</button>
    </nav>

      <h2 className={styles.seccionTitulo}>Actualizar Acuerdo</h2>
      {acuerdo && (acuerdo.estado === "Finalizado" || acuerdo.estado === "Cancelado") && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {acuerdo.estado === "Finalizado"
            ? "Este acuerdo ya está finalizado y no puede ser modificado."
            : "Este acuerdo ha sido cancelado y no puede ser modificado."}
        </div>
      )}


      <form className={styles.formAcuerdo} onSubmit={handleSubmit}>
        <div className={styles.campoForm}>
          <label>Fecha de inicio de extensión:</label>
          <input
            type="date"
            name="fechaInicio"
            value={form.fechaInicio}
            onChange={handleInputChange}
            required
            min={acuerdo.fechaFin ? acuerdo.fechaFin.slice(0, 10) : ""}
            disabled={!esModificable}
          />
          <label>Fecha de finalización:</label>
          <input
            type="date"
            name="fechaFin"
            value={form.fechaFin}
            onChange={handleInputChange}
            required
            min={form.fechaInicio || acuerdo.fechaFin ? (form.fechaInicio || acuerdo.fechaFin.slice(0, 10)) : ""}
            disabled={!esModificable}
          />
        </div>
        <div className={styles.campoForm}>
          <label>Contrato (PDF):</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={!esModificable}
          />
          {form.archivoContrato && (
            <span className={styles.archivoNombre}>{form.archivoContrato}</span>
          )}
        </div>
        <button type="submit" className={styles.btnRegistrar} disabled={!esModificable}>
          Guardar Cambios
        </button>
        <button
          type="button"
          className={styles.btnCancelar}
          onClick={() => setMostrarModal(true)}
          disabled={!esModificable}
        >
          Cancelar Acuerdo
        </button>
        {mensajes.length > 0 && (
          <p className={mensajes[0].tipo === "success" ? styles.mensajeExito : styles.error}>
            {mensajes[0].texto}
          </p>
        )}
      </form>

      {/* Modal de cancelación */}
      {mostrarModal && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Cancelar Acuerdo</h3>
            <form onSubmit={handleCancelar}>
              <textarea
                placeholder="Motivo de cancelación (mínimo 20 caracteres)"
                value={motivoCancelacion}
                onChange={e => setMotivoCancelacion(e.target.value)}
                minLength={20}
                required
                style={{ width: "100%", minHeight: "80px" }}
              />
              <div className={styles.modalActions}>
                <button type="submit">Confirmar Cancelación</button>
                <button type="button" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

