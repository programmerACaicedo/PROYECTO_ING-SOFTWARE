import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/nuevoAviso.module.css";

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
    imagenes: [],
  });
  const [mensajes, setMensajes] = useState([]); // Cola de mensajes
  const [previewImage, setPreviewImage] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const[isMenuClosed, setIsMenuClosed] = useState(false);
  // Limpiar URLs de vista previa al desmontar el componente
  useEffect(() => {
    return () => {
      previewImage.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImage]);

  // Mostrar mensajes de la cola, cada uno durante 2 segundos
  useEffect(() => {
    if (mensajes.length > 0) {
      const timer = setTimeout(() => {
        setMensajes((prevMensajes) => prevMensajes.slice(1)); // Eliminar el primer mensaje
      }, 5000); // 5 segundos
      return () => clearTimeout(timer); // Limpiar el temporizador
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

  const handleImageChange = (e) => {
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

    // Verificar duplicados
    const newImages = [];
    const duplicates = [];

    files.forEach((file) => {
      const isDuplicate = form.imagenes.some(
        (existingFile) => existingFile.name === file.name && existingFile.size === file.size
      );
      if (isDuplicate) {
        duplicates.push(file.name);
      } else {
        newImages.push(file);
      }
    });

    if (duplicates.length > 0) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: `Imágenes duplicadas no permitidas: ${duplicates.join(", ")}`, tipo: "error" },
      ]);
      return;
    }

    const updatedImages = [...form.imagenes, ...newImages];
    const totalImages = updatedImages.length;

    if (totalImages > 10) {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { texto: "No puedes subir más de 10 imágenes.", tipo: "error" },
      ]);
      return;
    }

    // Generar URLs para la vista previa
    const newPreviewImages = updatedImages.map((file) => URL.createObjectURL(file));
    setForm({ ...form, imagenes: updatedImages });
    setPreviewImage(newPreviewImages);
    console.log("URLs de vista previa:", newPreviewImages);

    // Limpiar el input
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    const newImages = form.imagenes.filter((_, i) => i !== index);
    const newPreviewImages = previewImage.filter((_, i) => i !== index);
    setForm({ ...form, imagenes: newImages });
    setPreviewImage(newPreviewImages);
    URL.revokeObjectURL(previewImage[index]);
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
      errores.push({ texto: " de subir al menos 3 imágenes.", tipo: "error" });
    if (form.imagenes.length > 10)
      errores.push({ texto: "No puedes subir más de 10 imágenes.", tipo: "error" });

    if (errores.length > 0) {
      setMensajes((prevMensajes) => [...prevMensajes, ...errores]);
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "imagenes") {
        form.imagenes.forEach((file) => formData.append("imagenes", file));
      } else {
        formData.append(key, form[key]);
      }
    });

    try {
      const response = await fetch("/api/avisos", {
        method: "POST",
        body: formData,
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

    <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen  :  ""} ${styles.menu} ${isMenuClosed ? styles.isMenuClosed : ""}`}>
       <button onClick={() => { navigate("/interior"); closeMenu(); }}>Inicio</button>
       <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
       <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
       <button onClick={() => { navigate("/publicacion/1"); closeMenu(); }}>Ver Publicación 1</button>
      <button onClick={() => { navigate("/publicacion/2"); closeMenu(); }}>Ver Publicación 2</button>
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
          {/* Mostrar el primer mensaje de la cola */}
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

      {/* Modal para la imagen ampliada */}
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