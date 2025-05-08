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
      if (value === "" || (/^[0-9]*$/.test(value) && parseInt(value, 10) >= 0)) {
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
    const file = e.target.files[0]; // Solo permite seleccionar una imagen a la vez
    console.log("Archivo seleccionado:", file);

    if (!file) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "No se seleccionó ninguna imagen.", tipo: "error" },
      ]);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "La imagen debe ser JPG/PNG y no superar los 5MB.", tipo: "error" },
      ]);
      return;
    }

    if (form.imagenes.length >= 5) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Solo puedes subir un máximo de 5 imágenes.", tipo: "error" },
      ]);
      return;
    }

    // Validar si la imagen ya fue subida
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      if (form.imagenes.includes(base64Image)) {
        setMensajes((prevMensajes) => [
          ...prevMensajes,
          { texto: "Esta imagen ya fue subida.", tipo: "error" },
        ]);
        return;
      }

      try {
        const urlImagen = await subirImagenACloudinary(file);

        // Agregar la nueva URL al estado
        setForm((prevForm) => ({
          ...prevForm,
          imagenes: [...prevForm.imagenes, urlImagen],
        }));

        // Generar URL para la vista previa
        setPreviewImage((prevPreview) => [...prevPreview, urlImagen]);

        setMensajes((prevMensajes) => [
          ...prevMensajes,
          { texto: "Imagen subida exitosamente", tipo: "success" },
        ]);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        setMensajes((prevMensajes) => [
          ...prevMensajes,
          { texto: "Error al subir la imagen", tipo: "error" },
        ]);
      }
    };
    reader.readAsDataURL(file);

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
    
    if (!usuarioSesion) {
      setMensajes((prevMensajes) => [
      ...prevMensajes,
      { texto: "No se pudo obtener la información del usuario.", tipo: "error" },
      ]);
      return;
    }

    if (parseInt(form.precio_mensual, 10) < 0) {
      setMensajes((prevMensajes) => [
      ...prevMensajes,
      { texto: "El precio mensual debe ser un valor positivo.", tipo: "error" },
      ]);
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
      precio_mensual: parseInt(form.precio_mensual, 10), // Asegúrate de que sea un número
    };
    
    try {
      const respuesta = await registrarAviso(aviso);
      setMensajes((prevMensajes) => [
      ...prevMensajes,
      { texto: "¡Aviso creado exitosamente!", tipo: "success" },
      ]);
      setTimeout(() => navigate("/propietario"), 2000);
    } catch (error) {
      console.error("Error al crear el aviso:", error);
      setMensajes((prevMensajes) => [
      ...prevMensajes,
      { texto: "Error al crear el aviso.", tipo: "error" },
      ]);
    }

    if (form.imagenes.length > 0) { 
      setMensajes((prevMensajes) => [
      ...prevMensajes,
      { texto: "Imágenes subidas exitosamente", tipo: "success" },
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

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""} ${styles.menu} ${isMenuClosed ? styles.isMenuClosed : ""}`}>
        <button onClick={() => { navigate("/propietario"); closeMenu(); }}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
      </nav>

      <h2 className={styles.seccionTitulo}>Datos del inmueble</h2>

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
                    ×
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
                value={form.precio}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
            </div>
          </div>

          <div className={styles.campoForm}>
          <label>Edificio:</label>
          <input
            name="edificio"
            type="text"
            value={form.ubicacion.edificio}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre del edificio"
            required
          />
        </div>
        <div className={styles.campoForm}>
          <label>Piso:</label>
          <input
            name="piso"
            type="text"
            value={form.ubicacion.piso}
            onChange={handleInputChange}
            placeholder="Ingrese el piso"
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
                <option value="Parqueo">Parqueo</option>
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