import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoAviso.css";

const PublicarAviso = () => {
  const navigate = useNavigate();
  

  const [form, setForm] = useState({
    titulo: "",
    direccion: "",
    precio: "",
    ciudad: "",
    tipo: "",
    condiciones: "",
    descripcion: "",
    imagenes: [],
  });
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Validamos formato y tamaño
    const valid = files.every(
      (file) =>
        ["image/jpeg", "image/png"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );
    if (!valid) {
      alert("Las imágenes deben ser JPG/PNG y no superar los 5MB.");
      return;
    }
    setForm({ ...form, imagenes: files });
    if (files.length > 0) {
      setPreviewImage(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones básicas:
    if (form.titulo.length > 100) {
      setErrores({ titulo: "El título no puede exceder 100 caracteres" });
      return;
    }
    if (form.descripcion.length > 500) {
      setErrores({ descripcion: "La descripción no puede exceder 500 caracteres" });
      return;
    }
    if (isNaN(form.precio) || Number(form.precio) <= 0) {
      setErrores({ precio: "El precio debe ser un número positivo" });
      return;
    }
    setMensaje("¡Aviso creado exitosamente!");
    // Simulación: redirige después de 1.5 segundos
    setTimeout(() => {
      navigate("/mis-avisos");
    }, 1500);
  };

  return (
    <div class="header-publicar">
    <div className="publicar-aviso-container">
      <header className="header-publicar">
        
        <h1>Servicio de Arrendamientos</h1>
      </header>

      <h2 className="seccion-titulo">Datos del inmueble</h2>

      <div className="contenido-publicar">
        {/* Columna Izquierda: Vista previa de imagen */}
        <div className="imagen-preview">
          {previewImage ? (
            <img src={previewImage} alt="Vista previa" />
          ) : (
            <div className="imagen-vacia">
              <p>No hay imagen seleccionada</p>
            </div>
          )}
          <label htmlFor="input-imagen" className="btn-subir-imagen">
            Subir Imagen
          </label>
          <input
            id="input-imagen"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
            {/* Descripción */}
            <div className="campo-form">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleInputChange}
              maxLength={500}
              placeholder="Ingrese la descripción del inmueble"
              required
            />
            <p className="texto-descripcion">Ingrese la descripción del inmueble</p>
            {errores.descripcion && <p className="error">{errores.descripcion}</p>}
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <form className="form-publicar" onSubmit={handleSubmit}>
          {/* Fila: Título y Precio */}
          <div className="row">
            <div className="campo-form">
              <label>Título del aviso:</label>
              <input
                name="titulo"
                type="text"
                value={form.titulo}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="Ingrese el título"
                required
              />
              {errores.titulo && <p className="error">{errores.titulo}</p>}
            </div>
            <div className="campo-form">
              <label>Precio: $</label>
              <input
                name="precio"
                type="text"
                value={form.precio}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
              {errores.precio && <p className="error">{errores.precio}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div className="campo-form">
            <label>Dirección:</label>
            <input
              name="direccion"
              type="text"
              value={form.direccion}
              onChange={handleInputChange}
              placeholder="Ingrese la dirección"
              required
            />
          </div>

          {/* Condiciones adicionales */}
          <div className="campo-form">
            <label>Condiciones adicionales:</label>
            <input
              name="condiciones"
              type="text"
              value={form.condiciones}
              onChange={handleInputChange}
              placeholder="Ingrese condiciones adicionales"
            />
          </div>

          {/* Fila: Ciudad y Tipo */}
          <div className="row">
            <div className="campo-form">
              <label>Ciudad:</label>
              <input
                name="ciudad"
                type="text"
                value={form.ciudad}
                onChange={handleInputChange}
                placeholder="Ingrese la ciudad"
                required
              />
            </div>
            <div className="campo-form">
              <label>Tipo:</label>
              <select name="tipo" value={form.tipo} onChange={handleInputChange} required>
                <option value="">Seleccione</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="habitacion">Habitación</option>
                <option value="parqueo">Parqueo</option>
                <option value="bodega">Bodega</option>
              </select>
            </div>
          </div>

          {/* Botón para publicar aviso */}
          <button type="submit" className="btn-publicar">
            Publicar aviso
          </button>
        </form>
      </div>

      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
    </div>
    </div>
  );
};

export default PublicarAviso;
