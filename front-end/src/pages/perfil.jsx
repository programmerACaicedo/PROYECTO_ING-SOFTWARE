import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/perfil.module.css'; // Import with a variable 'styles'

const Perfil = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    foto: null,
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFotoChange = (e) => {
    setFormData({ ...formData, foto: e.target.files[0] });
  };

  const validateForm = () => {
    const newErrores = {};
    if (!formData.nombre) newErrores.nombre = 'El nombre es obligatorio';
    if (!formData.apellidos) newErrores.apellidos = 'Los apellidos son obligatorios';
    if (!formData.telefono) newErrores.telefono = 'El teléfono es obligatorio';
    setErrores(newErrores);
    return Object.keys(newErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setMensaje('Perfil actualizado con éxito');
      setErrores({});
    } else {
      setMensaje('');
    }
  };

  const handleEliminarCuenta = () => {
    setConfirmarEliminar(true);
  };

  const confirmarEliminacion = () => {
    setMensaje('Cuenta eliminada con éxito');
    setConfirmarEliminar(false);
    navigate('/');
  };

  return (
    <div className={styles.perfilContainer}>
      <header className={styles.header}>
        <div className={styles.containerPerfil}>
          {/* Menú hamburguesa */}
          <input type="checkbox" id="menu-bar" />
          <label htmlFor="menu-bar" className={styles.iconMenu}>☰</label>

          <nav className={styles.menu}>
            <button onClick={() => navigate("/interior")}>Inicio</button>
            <button onClick={() => navigate("/perfil")}>Perfil</button>
            <button onClick={() => navigate("/nuevo-aviso")}>Nuevo Aviso</button>
            <button onClick={() => navigate("/publicacion/1")}>Ver Publicación 1</button>
            <button onClick={() => navigate("/publicacion/2")}>Ver Publicación 2</button>
          </nav>

          <div className={styles.titulo}>
            <h1>Servicios de Arrendamientos</h1>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.perfilForm}>
          <div className={styles.fotoPerfil}>
            <img
              src={
                formData.foto
                  ? URL.createObjectURL(formData.foto)
                  : '/assets/pictograma-persona.png'
              }
              alt="Foto de Perfil"
            />
            <label htmlFor="foto-upload" className={styles.btnSeleccionarArchivo}>
              Seleccionar Archivo
            </label>
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.datosPersonales}>
            <h2>Actualiza tus datos</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <p className={styles.error}>{errores.nombre}</p>}
              </label>
              <label>
                Apellidos:
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                />
                {errores.apellidos && <p className={styles.error}>{errores.apellidos}</p>}
              </label>
              <label>
                Teléfono:
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                {errores.telefono && <p className={styles.error}>{errores.telefono}</p>}
              </label>

              <button type="submit">Actualizar</button>
            </form>
            {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

            <div className={styles.eliminarCuenta}>
              <button onClick={handleEliminarCuenta} className={styles.btnEliminar}>
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>

        {confirmarEliminar && (
          <div className={styles.confirmarEliminacion}>
            <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
            <button onClick={confirmarEliminacion}>Sí</button>
            <button onClick={() => setConfirmarEliminar(false)}>No</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Perfil;