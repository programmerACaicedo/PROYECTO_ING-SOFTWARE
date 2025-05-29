import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/actualizarPublicacion.module.css";
import { listarSinReportes, actualizarAviso, subirImagenACloudinary } from "../services/conexiones";

const ActualizarPublicacion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(o => !o);
  const closeMenu = () => setIsMenuOpen(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio_mensual: "",
    condiciones: "",
    estado: "Disponible",
    imagenes: [], // Archivos nuevos
  });
  const [imagenesExistentes, setImagenesExistentes] = useState([]); // URLs ya subidas
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");
  const [imageError, setImageError] = useState("");
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos del aviso por id
  useEffect(() => {
    const fetchAviso = async () => {
      try {
        const avisos = await listarSinReportes();
        const aviso = avisos.find(a => String(a.id) === String(id));
        if (aviso) {
          setFormData({
            nombre: aviso.nombre || "",
            descripcion: aviso.descripcion || "",
            precio_mensual: aviso.precio_mensual || "",
            condiciones: aviso.condiciones || "",
            estado: aviso.estado || "Disponible",
            imagenes: [], // Solo archivos nuevos aquí
          });
          setImagenesExistentes(aviso.imagenes || []); // URLs de imágenes ya subidas
        }
      } catch (error) {
        setMensajeExito("No se pudo cargar el aviso.");
      }
    };
    fetchAviso();
  }, [id]);

  // Inputs genéricos
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setMensajeExito("");
  };

  const handleImagenesChange = e => {
    const files = Array.from(e.target.files);
    let validFiles = [];
    let errorMsg = "";

    // Suma total de imágenes seleccionadas + nuevas + existentes
    const totalImagenes = imagenesExistentes.length + formData.imagenes.length + files.length;
    if (totalImagenes > 5) {
      setImageError("Solo puedes subir un máximo de 5 imágenes.");
      return;
    }

    files.forEach(file => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        errorMsg = "Solo se permiten imágenes PNG o JPG.";
      } else if (file.size > 5 * 1024 * 1024) {
        errorMsg = "Cada imagen no puede superar los 5 MB.";
      } else {
        validFiles.push(file);
      }
    });

    if (errorMsg) {
      setImageError(errorMsg);
    } else {
      setImageError("");
      setFormData(f => ({
        ...f,
        imagenes: [...f.imagenes, ...validFiles]
      }));
    }
    setMensajeExito("");
  };

  // Eliminar imagen (diferenciar entre existente y nueva)
  const handleEliminarImagen = (index) => {
    if (index < imagenesExistentes.length) {
      // Eliminar de las existentes
      setImagenesExistentes(imgs => imgs.filter((_, i) => i !== index));
    } else {
      // Eliminar de las nuevas
      const newIndex = index - imagenesExistentes.length;
      setFormData(f => ({
        ...f,
        imagenes: f.imagenes.filter((_, i) => i !== newIndex)
      }));
    }
    setImageError("");
  };

  // Validaciones
  const validarFormulario = () => {
    const newErr = {};
    if (!formData.nombre) newErr.nombre = "El título es obligatorio";
    else if (formData.nombre.length > 100)
      newErr.nombre = "Máx. 100 caracteres";
    if (!/^\d+$/.test(formData.precio_mensual))
      newErr.precio_mensual = "El precio debe contener solo dígitos";
    if (!formData.descripcion)
      newErr.descripcion = "La descripción es obligatoria";
    else if (formData.descripcion.length > 500)
      newErr.descripcion = "Máx. 500 caracteres";
    const totalImagenes = imagenesExistentes.length + formData.imagenes.length;
    if (totalImagenes < 3) {
      newErr.imagenes = "Debes tener al menos 3 imágenes.";
    } else if (totalImagenes > 5) {
      newErr.imagenes = "No puedes tener más de 5 imágenes.";
    }
    formData.imagenes.forEach((img, i) => {
      const ext = img.name.split(".").pop().toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        newErr[`imagen-${i}`] = `Formato inválido: ${img.name}`;
      }
      if (img.size > 5 * 1024 * 1024) {
        newErr[`imagen-${i}`] = `Máx. 5MB: ${img.name}`;
      }
    });
    setErrores(newErr);
    return Object.keys(newErr).length === 0;
  };

  // Submit
  const handleSubmit = async e => {
    e.preventDefault();
    setMensajeExito("");
    if (!validarFormulario()) {
      return;
    }

    try {
      // Subir solo las nuevas imágenes a Cloudinary
      const imagenesUrls = [];
      for (const file of formData.imagenes) {
        const url = await subirImagenACloudinary(file);
        imagenesUrls.push(url);
      }

      // Combina las existentes (no eliminadas) y las nuevas
      const todasLasImagenes = [...imagenesExistentes, ...imagenesUrls];

      // Preparar datos para actualizar
      const datosActualizados = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_mensual: formData.precio_mensual,
        condiciones: formData.condiciones,
        estado: formData.estado,
        imagenes: todasLasImagenes,
      };

      const respuesta = await actualizarAviso(id, datosActualizados);
      setMensajeExito("¡Cambios guardados con éxito!");
      setFormData(f => ({ ...f, imagenes: [] })); // Limpiar imágenes nuevas
      setTimeout(() => {
        navigate(`/publicacion/${id}`);
      }, 1500); // Redirige después de 1.5 segundos
    } catch (error) {
      setMensajeExito("Error al actualizar el aviso.");
    }
  };

  // Preview de imágenes (existentes + nuevas)
  const previewUrls = [
    ...imagenesExistentes,
    ...formData.imagenes.map(f => URL.createObjectURL(f))
  ];

  return (
    <div className={styles.actualizarPublicacionContainer}>
      <header className={styles.headerActualizar}>
        <span className={styles.iconMenu} onClick={toggleMenu}>☰</span>
        <h1 className={styles.titulo}>Servicios de Arrendamientos</h1>
      </header>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}>
        <button onClick={() => { navigate("/propietario"); closeMenu(); }}>Inicio</button>
        <button onClick={() => { navigate("/perfil"); closeMenu(); }}>Perfil</button>
        <button onClick={() => { navigate("/nuevo-aviso"); closeMenu(); }}>Nuevo Aviso</button>
      </nav>

      <br /><h2 className={styles.seccionTitulo}>Actualizar Publicación</h2>

      <div className={styles.contenidoActualizar}>
        <div className={styles.imagenPreview}>
          {previewUrls.length > 0 ? (
            <div className={styles.imageGallery}>
              {previewUrls.map((src, i) => (
                <div key={i} className={styles.imageContainer}>
                  <img
                    src={src}
                    alt={`Vista previa ${i + 1}`}
                    className={styles.modalImage}
                    onClick={() => {
                      setSelectedPreview(src);
                      setIsModalOpen(true);
                    }}
                  />
                  <button
                    type="button"
                    className={styles.btnEliminarImagen}
                    onClick={() => handleEliminarImagen(i)}
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.imagenVacia}>
              <p>No hay imagen seleccionada</p>
            </div>
          )}
          <label htmlFor="imagenes-upload" className={styles.btnSubirImagen}>
            Subir Imagen
          </label>
          <input
            id="imagenes-upload"
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={handleImagenesChange}
            style={{ display: "none" }}
          /><br></br>
          {errores.imagenes && (
            <p className={styles.error}>{errores.imagenes}</p>
          )}
          {Object.keys(errores)
            .filter(key => key.startsWith("imagen-"))
            .map(key => (
              <p key={key} className={styles.error}>
                {errores[key]}
              </p>
            ))}
        </div>

        <form className={styles.formActualizar} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.campoForm}>
              <label>Título del aviso:</label>
              <input
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="Ingrese el título"
                required
              />
              {errores.nombre && (
                <p className={styles.error}>{errores.nombre}</p>
              )}
            </div>
            <div className={styles.campoForm}>
              <label>Precio (mensual): $</label>
              <input
                name="precio_mensual"
                type="text"
                value={formData.precio_mensual}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
              {errores.precio_mensual && (
                <p className={styles.error}>{errores.precio_mensual}</p>
              )}
            </div>
          </div>

          <div className={styles.campoForm}>
            <label>Descripción del espacio:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              maxLength={500}
              placeholder="Describe tu espacio (máx. 500 caract.)"
              required
            />
            {errores.descripcion && (
              <p className={styles.error}>{errores.descripcion}</p>
            )}
          </div>

          <div className={styles.campoForm}>
            <label>Estado del aviso:</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              required
            >
              <option value="Disponible">Disponible</option>
              <option value="EnProceso">En proceso de arrendamiento</option>
              <option value="Arrendado">Arrendado</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className={styles.campoForm}>
            <label>Condiciones adicionales:</label>
            <input
              name="condiciones"
              type="text"
              value={formData.condiciones}
              onChange={handleInputChange}
              placeholder="Ingrese condiciones adicionales"
            />
          </div>

          <button type="submit" className={styles.btnActualizar}>
            Guardar Cambios
          </button>
        </form>
      </div>

      {mensajeExito && (
        <p className={styles.mensajeExito}>{mensajeExito}</p>
      )}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img src={selectedPreview} alt="Ampliada" className={styles.modalImageLarge} />
            <button className={styles.modalCloseButton} onClick={() => setIsModalOpen(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActualizarPublicacion;