// src/pages/ActualizarPublicacion.jsx
import React, { useState, useEffect } from "react";
import "../styles/actualizarPublicacion.css";

const ActualizarPublicacion = () => {
  // Estado que simula la lista de publicaciones del propietario
  const [publicaciones, setPublicaciones] = useState([]);
  // ID de la publicación seleccionada
  const [selectedId, setSelectedId] = useState("");
  // Datos editables de la publicación seleccionada
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    condiciones: "",
    ciudad: "",
    estado: "disponible",
    imagenes: [],
  });

  // Estado para mensajes y errores
  const [mensajeExito, setMensajeExito] = useState("");
  const [errores, setErrores] = useState({});

  // Simulamos cargar las publicaciones del propietario
  useEffect(() => {
    const dataSimulada = [
      {
        id: "1",
        titulo: "Apartamento en el centro",
        descripcion: "Un apartamento amplio y luminoso",
        precio: "1500000",
        condiciones: "No se permiten mascotas",
        ciudad: "Cali",
        estado: "disponible",
        imagenes: [],
      },
      {
        id: "2",
        titulo: "Bodega industrial",
        descripcion: "Espacio para almacenamiento",
        precio: "2000000",
        condiciones: "",
        ciudad: "Palmira",
        estado: "en proceso",
        imagenes: [],
      },
    ];
    setPublicaciones(dataSimulada);
  }, []);

  // Cuando cambia el select, cargamos la publicación seleccionada
  const handleSelectChange = (e) => {
    const pubId = e.target.value;
    setSelectedId(pubId);
    setMensajeExito("");
    setErrores({});

    if (pubId) {
      const pubSeleccionada = publicaciones.find((pub) => pub.id === pubId);
      if (pubSeleccionada) {
        setFormData({
          titulo: pubSeleccionada.titulo,
          descripcion: pubSeleccionada.descripcion,
          precio: pubSeleccionada.precio,
          condiciones: pubSeleccionada.condiciones,
          ciudad: pubSeleccionada.ciudad,
          estado: pubSeleccionada.estado,
          imagenes: pubSeleccionada.imagenes || [],
        });
      }
    } else {
      // Si el usuario elige la opción vacía, limpiamos el form
      setFormData({
        titulo: "",
        descripcion: "",
        precio: "",
        condiciones: "",
        ciudad: "",
        estado: "disponible",
        imagenes: [],
      });
    }
  };

  // Manejo de cambios en los inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMensajeExito("");
  };

  // Manejo del cambio de imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    // Agregamos las imágenes al arreglo existente
    setFormData({ ...formData, imagenes: files });
    setMensajeExito("");
  };

  // Validaciones
  const validarFormulario = () => {
    const newErrores = {};

    // Título: no exceder 100 caracteres
    if (!formData.titulo) {
      newErrores.titulo = "El título es obligatorio";
    } else if (formData.titulo.length > 100) {
      newErrores.titulo = "El título no puede exceder 100 caracteres";
    }

    // Descripción: no exceder 500 caracteres
    if (formData.descripcion.length > 500) {
      newErrores.descripcion = "La descripción no puede exceder 500 caracteres";
    }

    // Precio: solo números
    if (!/^\d*$/.test(formData.precio)) {
      newErrores.precio = "El precio debe contener solo números";
    }

    // Validar imágenes (PNG/JPG, máximo 5MB)
    formData.imagenes.forEach((img, idx) => {
      const ext = img.name.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        newErrores[`imagen-${idx}`] = `La imagen debe ser PNG o JPG: ${img.name}`;
      }
      if (img.size > 5 * 1024 * 1024) {
        newErrores[`imagen-${idx}`] = `La imagen no puede superar los 5MB: ${img.name}`;
      }
    });

    setErrores(newErrores);
    return Object.keys(newErrores).length === 0;
  };

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setMensajeExito("");
    if (!selectedId) {
      // Si no se ha seleccionado ninguna publicación
      setErrores({ select: "Debes seleccionar un aviso para editar" });
      return;
    }

    if (validarFormulario()) {
      // Actualizar la publicación en la lista (solo local, simulación)
      const nuevasPublicaciones = publicaciones.map((pub) =>
        pub.id === selectedId
          ? { ...pub, ...formData }
          : pub
      );
      setPublicaciones(nuevasPublicaciones);

      // Mostrar mensaje de éxito
      setMensajeExito("¡Los cambios se han guardado exitosamente!");
    }
  };

  return (
    <div className="actualizar-publicacion-container">
      {/* Menú desplegable (ejemplo simple) */}
      <header className="header-actualizar">
        <button className="menu-btn">☰</button>
        <h1>Servicio de Arrendamientos</h1>
      </header>

      <h2 className="titulo-seccion">Actualizar Publicación</h2>

      {/* Select para elegir la publicación */}
      <div className="select-publicacion">
        <label>Selecciona aviso a modificar: </label>
        <select value={selectedId} onChange={handleSelectChange}>
          <option value="">-- Selecciona --</option>
          {publicaciones.map((pub) => (
            <option key={pub.id} value={pub.id}>
              {pub.titulo}
            </option>
          ))}
        </select>
        {errores.select && <p className="error">{errores.select}</p>}
      </div>

      {/* Formulario de edición */}
      <form className="form-actualizar" onSubmit={handleSubmit}>
        <div className="campo-form">
          <label>Título del aviso:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            maxLength={100}
          />
          {errores.titulo && <p className="error">{errores.titulo}</p>}
        </div>

        <div className="campo-form">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            maxLength={500}
          />
          {errores.descripcion && <p className="error">{errores.descripcion}</p>}
        </div>

        <div className="campo-form">
          <label>Precio:</label>
          <input
            type="text"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
          />
          {errores.precio && <p className="error">{errores.precio}</p>}
        </div>

        <div className="campo-form">
          <label>Condiciones Adicionales:</label>
          <input
            type="text"
            name="condiciones"
            value={formData.condiciones}
            onChange={handleChange}
          />
        </div>

        <div className="campo-form">
          <label>Ciudad:</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
          />
        </div>

        <div className="campo-form">
          <label>Estado:</label>
          <select name="estado" value={formData.estado} onChange={handleChange}>
            <option value="disponible">Disponible</option>
            <option value="en proceso">En proceso de arrendamiento</option>
            <option value="arrendado">Arrendado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* Subida de imágenes */}
        <div className="campo-form">
          <label>Imágenes asociadas:</label>
          <input
            type="file"
            multiple
            accept="image/png, image/jpg, image/jpeg"
            onChange={handleImagenesChange}
          />
          {/* Mostramos errores de imágenes si existen */}
          {Object.keys(errores).map((key) => {
            if (key.startsWith("imagen-")) {
              return <p key={key} className="error">{errores[key]}</p>;
            }
            return null;
          })}
        </div>

        <button type="submit" className="btn-guardar-cambios">
          Guardar Cambios
        </button>
      </form>

      {/* Mensaje de éxito */}
      {mensajeExito && <p className="exito">{mensajeExito}</p>}
    </div>
  );
};

export default ActualizarPublicacion;
