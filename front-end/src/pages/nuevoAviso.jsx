import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/nuevoAviso.module.css";
import { subirImagenACloudinary, registrarAviso, obtenerUsuario } from "../services/conexiones";

const PublicarAviso = () => {
  const navigate = useNavigate();

  // Detectar si es un dispositivo móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [usuarioSesion, setUsuarioSesion] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    descripcion: "",
    condiciones: "",
    imagenes: [],
    ubicacion: {
      edificio: "",
      piso: "",
    },
    precio_mensual: "",
  });
  const [mensajes, setMensajes] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosed, setIsMenuClosed] = useState(false);

  // Mostrar mensajes de la cola, cada uno durante 5 segundos
  useEffect(() => {
    if (mensajes.length > 0) {
      const timer = setTimeout(() => {
        setMensajes((prevMensajes) => prevMensajes.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajes]);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuario = await obtenerUsuario();
        setUsuarioSesion(usuario);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };
    cargarUsuario();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "precio_mensual") {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else if (name === "edificio" || name === "piso") {
      setForm({
        ...form,
        ubicacion: { ...form.ubicacion, [name]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log("Archivos seleccionados:", files);

    if (files.length === 0) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "No se seleccionaron imágenes.", tipo: "error" },
      ]);
      return;
    }

    const validFormat = files.every(
      (file) => ["image/jpeg", "image/png"].includes(file.type) && file.size <= 5 * 1024 * 1024
    );

    if (!validFormat) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Las imágenes deben ser JPG/PNG y no superar los 5MB.", tipo: "error" },
      ]);
      return;
    }

    if (form.imagenes.length + files.length > 10) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "No puedes subir más de 10 imágenes.", tipo: "error" },
      ]);
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const urlImagen = await subirImagenACloudinary(file);
        return urlImagen;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Agregar las nuevas URLs al estado
      setForm((prevForm) => ({
        ...prevForm,
        imagenes: [...prevForm.imagenes, ...uploadedUrls],
      }));

      // Generar URLs para la vista previa
      setPreviewImage((prevPreview) => [...prevPreview, ...uploadedUrls]);

      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Imágenes subidas exitosamente", tipo: "success" },
      ]);
    } catch (error) {
      console.error("Error al subir las imágenes:", error);
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Error al subir las imágenes", tipo: "error" },
      ]);
    }

    // Limpiar el input
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    const newImages = form.imagenes.filter((_, i) => i !== index);
    const newPreviewImages = previewImage.filter((_, i) => i !== index);
    setForm({ ...form, imagenes: newImages });
    setPreviewImage(newPreviewImages);
  };

  const handleImageDoubleClick = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = [];

    if (!usuarioSesion) {
      errores.push({ texto: "No se pudo obtener la información del usuario.", tipo: "error" });
    }
    if (form.nombre.length > 100) {
      errores.push({ texto: "El título no puede exceder 100 caracteres", tipo: "error" });
    }
    if (!form.descripcion) {
      errores.push({ texto: "La descripción es obligatoria", tipo: "error" });
    }
    if (form.descripcion.length > 500) {
      errores.push({ texto: "La descripción no puede exceder 500 caracteres", tipo: "error" });
    }
    if (!form.precio_mensual || isNaN(form.precio_mensual) || Number(form.precio_mensual) <= 0) {
      errores.push({ texto: "El precio debe ser un número positivo mayor a 0", tipo: "error" });
    }
    if (form.imagenes.length < 3) {
      errores.push({ texto: "Debes subir al menos 3 imágenes.", tipo: "error" });
    }
    if (form.imagenes.length > 10) {
      errores.push({ texto: "No puedes subir más de 10 imágenes.", tipo: "error" });
    }
    if (!form.ubicacion.edificio) {
      errores.push({ texto: "El nombre del edificio es obligatorio", tipo: "error" });
    }
    if (!form.ubicacion.piso) {
      errores.push({ texto: "El piso es obligatorio", tipo: "error" });
    }
    if (!form.tipo) {
      errores.push({ texto: "El tipo de inmueble es obligatorio", tipo: "error" });
    }

    if (errores.length > 0) {
      setMensajes((prevMensajes) => [...prevMensajes, ...errores]);
      return;
    }

    const aviso = {
      nombre: form.nombre,
      propietarioId: {
        usuarioId: usuarioSesion.id,
        nombre: usuarioSesion.nombre,
      },
      tipo: form.tipo,
      descripcion: form.descripcion,
      condiciones: form.condiciones,
      imagenes: form.imagenes,
      ubicacion: {
        edificio: form.ubicacion.edificio,
        piso: form.ubicacion.piso,
      },
      precio_mensual: parseInt(form.precio_mensual, 10),
    };

    try {
      const respuesta = await registrarAviso(aviso);
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "¡Aviso creado exitosamente!", tipo: "success" },
      ]);
      setTimeout(() => navigate("/misAvisos"), 2000);
    } catch (error) {
      console.error("Error al crear el aviso:", error);
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Ya existe un aviso en esa ubicacion.", tipo: "error" },
      ]);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuClosed(!isMenuClosed);
  };

  return (
    <div className={styles.publicarAvisoContainer}>
      <header className={styles.headerPublicar}>
        <span className={styles.iconMenu} onClick={toggleMenu}>☰</span>
        <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""} ${isMenuClosed ? styles.isMenuClosed : ""}`}>
        <button onClick={() => { navigate("/propietario"); closeMenu(); }}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
      </nav>

      <h2 className={styles.seccionTitulo}>Datos del Aviso</h2>

      <div className={styles.contenidoPublicar}>
        <div className={styles.imagenPreview}>
          {previewImage.length > 0 ? (
            <div className={styles.imageGallery}>
              {previewImage.map((img, index) => (
                <div key={index} className={styles.imageContainer}>
                  <img
                    src={img}
                    alt={`Vista previa ${index + 1}`}
                    onClick={() => handleImageDoubleClick(img)}
                  />
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={() => handleRemoveImage(index)}
                  >
                  x  
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.imagenVacia}>
              <p>No hay imágenes seleccionadas</p>
            </div>
          )}
          <label htmlFor="input-imagen" className={styles.btnSubirImagen}>
            {isMobile ? "Subir Imágenes (3-10)" : "Subir Imagen"}
          </label>
          <input
            id="input-imagen"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            multiple={isMobile}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {mensajes.length > 0 && (
            <p
              className={
                mensajes[0].tipo === "success" ? styles.mensajeExito : styles.error
              }
            >
              {mensajes[0].texto}
            </p>
          )}
        </div>

        <form className={styles.formPublicar} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.campoForm}>
              <label>Título del aviso:</label>
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="Ingrese el título"
                required
              />
            </div>
            <div className={styles.campoForm}>
              <label>Precio: $</label>
              <input
                name="precio_mensual"
                type="text"
                value={form.precio_mensual}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
            </div>
          </div>

          <div className={styles.campoForm}>
            <label>Bloque:</label>
            <input
              name="edificio"
              type="text"
              value={form.ubicacion.edificio}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre del bloque"
              required
            />
          </div>
          <div className={styles.campoForm}>
            <label>Numero:</label>
            <input
              name="piso"
              type="text"
              value={form.ubicacion.piso}
              onChange={handleInputChange}
              placeholder="Ingrese el numero"
              required
            />
          </div>
          <div className={styles.campoForm}>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleInputChange}
              maxLength={500}
              placeholder="Ingrese la descripción del inmueble"
              required
            />
            <p className={styles.textoDescripcion}>Ingrese la descripción del inmueble</p>
          </div>
          <div className={styles.campoForm}>
            <label>Condiciones adicionales:</label>
            <input
              name="condiciones"
              type="text"
              value={form.condiciones}
              onChange={handleInputChange}
              placeholder="Ingrese condiciones adicionales"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.campoForm}>
              <label>Tipo:</label>
              <select name="tipo" value={form.tipo} onChange={handleInputChange} required>
                <option value="">Seleccione</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Habitacion">Habitación</option>
                <option value="Parqueadero">Parqueadero</option>
                <option value="Bodega">Bodega</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.btnPublicar}>
            Publicar aviso
          </button>
        </form>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Imagen ampliada" className={styles.modalImage} />
            <button className={styles.modalCloseButton} onClick={closeModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicarAviso;