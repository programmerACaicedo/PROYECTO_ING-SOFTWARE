// Perfil.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/perfil.css';

const Perfil = () => {
  const navigate = useNavigate();

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    foto: null,
  });

  // Estado para errores de validación
  const [errores, setErrores] = useState({});

  // Estado para mensajes y confirmación
  const [mensaje, setMensaje] = useState('');
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  // Manejar cambios en los campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambio en la foto de perfil
  const handleFotoChange = (e) => {
    setFormData({ ...formData, foto: e.target.files[0] });
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrores = {};
    if (!formData.nombre) newErrores.nombre = 'El nombre es obligatorio';
    if (!formData.apellidos) newErrores.apellidos = 'Los apellidos son obligatorios';
    if (!formData.telefono) newErrores.telefono = 'El teléfono es obligatorio';
    setErrores(newErrores);
    return Object.keys(newErrores).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setMensaje('Perfil actualizado con éxito');
      setErrores({});
      // Aquí puedes agregar una llamada al backend
    } else {
      setMensaje('');
    }
  };

  // Manejar la eliminación de la cuenta
  const handleEliminarCuenta = () => {
    setConfirmarEliminar(true);
  };

  const confirmarEliminacion = () => {
    setMensaje('Cuenta eliminada con éxito');
    setConfirmarEliminar(false);
    navigate('/'); // Redirige a la página principal
  };

  return (
    <div className="perfil-container">
      <header className="header">
        <h1 className="title">Mi Perfil👤</h1>
      </header>
      <main className="main-content">
        <img src=".." alt="" />
        <div className="perfil-form">
          {/* Sección de la foto de perfil */}
          <div className="foto-perfil">
            <img
              src={
                formData.foto
                  ? URL.createObjectURL(formData.foto)
                  : '/assets/pictograma-persona.png' // Imagen predeterminada
              }
              alt="Foto de Perfil"
            />
            <label htmlFor="foto-upload" className="btn-seleccionar-archivo">
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

          {/* Formulario de actualización */}
          <div className="datos-personales">
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
                {errores.nombre && <p className="error">{errores.nombre}</p>}
              </label>
              <label>
                Apellidos:
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                />
                {errores.apellidos && <p className="error">{errores.apellidos}</p>}
              </label>
              <label>
                Teléfono:
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                {errores.telefono && <p className="error">{errores.telefono}</p>}
              </label>
              <button type="submit" className="btn-guardar">
                Guardar Cambios
              </button>
            </form>

            {/* Botón de eliminar cuenta */}
            <button className="btn-eliminar" onClick={handleEliminarCuenta}>
              Eliminar Cuenta
            </button>

            {/* Confirmación de eliminación */}
            {confirmarEliminar && (
              <div className="confirmacion">
                <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
                <button onClick={confirmarEliminacion}>Confirmar</button>
                <button onClick={() => setConfirmarEliminar(false)}>Cancelar</button>
              </div>
            )}

            {/* Mensaje de éxito */}
            {mensaje && <p className="mensaje-exito">{mensaje}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;