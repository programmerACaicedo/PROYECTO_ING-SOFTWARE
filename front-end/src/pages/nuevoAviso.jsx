import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/nuevoAviso.module.css";
import { subirImagenACloudinary } from "../services/conexiones";

const PublicarAviso = () => {
  const navigate = useNavigate();

  // Detectar si es un dispositivo móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [form, setForm] = useState({
    titulo: "",
    direccion: "",
    precio: "",
    ciudad: "",
    tipo: "",
    condiciones: "",
    descripcion: "",
    imagenes: [], // Ahora almacenará URLs de Cloudinary
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "precio") {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
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
    if (form.titulo.length > 100)
      errores.push({ texto: "El título no puede exceder 100 caracteres", tipo: "error" });
    if (!form.descripcion)
      errores.push({ texto: "La descripción es obligatoria", tipo: "error" });
    if (form.descripcion.length > 500)
      errores.push({ texto: "La descripción no puede exceder 500 caracteres", tipo: "error" });
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) {
      errores.push({ texto: "El precio debe ser un número positivo mayor a 0", tipo: "error" });
    }
    if (form.imagenes.length < 3)
      errores.push({ texto: "Debes subir al menos 3 imágenes.", tipo: "error" });
    if (form.imagenes.length > 10)
      errores.push({ texto: "No puedes subir más de 10 imágenes.", tipo: "error" });

    if (errores.length > 0) {
      setMensajes((prevMensajes) => [...prevMensajes, ...errores]);
      return;
    }

    try {
      const response = await fetch("/api/avisos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        setMensajes((prevMensajes) => [
          ...prevMensajes,
          { texto: "¡Aviso creado exitosamente!", tipo: "success" },
        ]);
        setTimeout(() => navigate("/mis-avisos"), 2000);
      } else {
        setMensajes((prevMensajes) => [
          ...prevMensajes,
          { texto: data.error || "Error al crear el aviso", tipo: "error" },
        ]);
      }
    } catch (error) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "Error de conexión con el servidor", tipo: "error" },
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
        </div>

        <form className={styles.formPublicar} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.campoForm}>
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
            </div>
            <div className={styles.campoForm}>
              <label>Precio: $</label>
              <input
                name="precio"
                type="text"
                value={form.precio}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
            </div>
          </div>

          <div className={styles.campoForm}>
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
            <div className={styles.campoForm}>
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