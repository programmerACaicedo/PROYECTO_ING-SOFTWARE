// src/pages/ActualizarPublicacion.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/actualizarPublicacion.module.css";

const ActualizarPublicacion = () => {
  const navigate = useNavigate();

  // Menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(o => !o);
  const closeMenu = () => setIsMenuOpen(false);

  // Publicaciones originales y filtrado
  const [publicaciones, setPublicaciones] = useState([]);
  const [filteredPubs, setFilteredPubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [imageError, setImageError] = useState("");
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (src) => {
    setSelectedPreview(src);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPreview(null);
  };

  // Carga simulada de datos
  useEffect(() => {
    const dataSimulada = [
      {
        id: "1",
        titulo: "Apartamento en el centro",
        descripcionEspacio: "Un apartamento amplio y luminoso",
        precio: "1500000",
        condiciones: "No se permiten mascotas",
        estado: "disponible",
        imagenes: [],
      },
      {
        id: "2",
        titulo: "Bodega industrial",
        descripcionEspacio: "Espacio para almacenamiento",
        precio: "2000000",
        condiciones: "",
        estado: "en proceso",
        imagenes: [],
      },
    ];
    setPublicaciones(dataSimulada);
    setFilteredPubs(dataSimulada);
  }, []);

  // Búsqueda tipo autocomplete
  const handleSearchChange = e => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredPubs(
      publicaciones.filter(pub =>
        pub.titulo.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  // Selección de aviso
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descripcionEspacio: "",
    precio: "",
    condiciones: "",
    estado: "disponible",
    imagenes: [],
  });
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");

  const handleSelectPub = id => {
    setSelectedId(id);
    setErrores({});
    setMensajeExito("");
    if (!id) {
      return setFormData({
        titulo: "",
        descripcionEspacio: "",
        precio: "",
        condiciones: "",
        estado: "disponible",
        imagenes: [],
      });
    }
    const pub = publicaciones.find(p => p.id === id);
    if (pub) setFormData({ ...pub });
    setSearchTerm(pub.titulo);
    setFilteredPubs([]);
  };

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
         // No actualizamos las imágenes inválidas
       } else {
         setImageError("");
         setFormData(f => ({
             ...f,
             imagenes: [...f.imagenes, ...validFiles].slice(0, 10)
           }));       }
       setMensajeExito("");
     };
    

  // Validaciones
  const validarFormulario = () => {
    const newErr = {};
    // Título
    if (!formData.titulo) newErr.titulo = "El título es obligatorio";
    else if (formData.titulo.length > 100)
      newErr.titulo = "Máx. 100 caracteres";
    // Precio
    if (!/^\d+$/.test(formData.precio))
      newErr.precio = "El precio debe contener solo dígitos";
    // Descripción del espacio
    if (!formData.descripcionEspacio)
      newErr.descripcionEspacio = "La descripción es obligatoria";
    else if (formData.descripcionEspacio.length > 500)
      newErr.descripcionEspacio =
        "Máx. 500 caracteres";
    // Imágenes
    if (formData.imagenes.length < 3) {
      newErr.imagenes = "Debes subir al menos 3 imágenes.";
    } else if (formData.imagenes.length > 10) {
      newErr.imagenes = "No puedes subir más de 10 imágenes.";
    }
  
    // Validación de formato y tamaño de cada imagen
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
  const handleSubmit = e => {
    e.preventDefault();
    setMensajeExito("");
    if (!selectedId) {
      setErrores({ select: "Selecciona un aviso" });
      return;
    }
    if (!validarFormulario()) return;
    // Simular actualización
    setPublicaciones(list =>
      list.map(p =>
        p.id === selectedId ? { ...formData, id: p.id } : p
      )
    );
    setMensajeExito("¡Cambios guardados con éxito!");
  };

  // Preview de imágenes
  const previewUrls = formData.imagenes.map(f =>
    URL.createObjectURL(f)
  );

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

      <h2 className={styles.seccionTitulo}>Actualizar Publicación</h2>

      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar aviso por título..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setTimeout(() => setIsSearchActive(false), 150)}
          className={styles.searchInput}
        />
        {isSearchActive && filteredPubs.length > 0 && (
          <ul className={styles.suggestionsList}>
            {filteredPubs.map(pub => (
             <li
             key={pub.id}
             onClick={() => {
               handleSelectPub(pub.id);
               setIsSearchActive(false);
             }}
             className={styles.suggestionItem}
           >
             {pub.titulo}
           </li>
           
            ))}
          </ul>
        )}
        {errores.select && <p className={styles.error}>{errores.select}</p>}
      </div>

      <div className={styles.contenidoActualizar}>
        <div className={styles.imagenPreview}>
          {previewUrls.length > 0 ? (
            <div className={styles.imageGallery}>
{previewUrls.map((src, i) => (
  <img
    key={i}
    src={src}
    alt={`Vista previa ${i + 1}`}
    className={styles.modalImage}
    onClick={() => openModal(src)}
  />
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
          />
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
                name="titulo"
                type="text"
                value={formData.titulo}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="Ingrese el título"
                required
              />
              {errores.titulo && (
                <p className={styles.error}>{errores.titulo}</p>
              )}
            </div>
            <div className={styles.campoForm}>
              <label>Precio (mensual): $</label>
              <input
                name="precio"
                type="text"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="Ingrese el precio"
                required
              />
              {errores.precio && (
                <p className={styles.error}>{errores.precio}</p>
              )}
            </div>
          </div>

          <div className={styles.campoForm}>
            <label>Descripción del espacio:</label>
            <textarea
              name="descripcionEspacio"
              value={formData.descripcionEspacio}
              onChange={handleInputChange}
              maxLength={500}
              placeholder="Describe tu espacio (máx. 500 caract.)"
              required
            />
            {errores.descripcionEspacio && (
              <p className={styles.error}>{errores.descripcionEspacio}</p>
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
              <option value="disponible">Disponible</option>
              <option value="en proceso">En proceso de arrendamiento</option>
              <option value="arrendado">Arrendado</option>
              <option value="inactivo">Inactivo</option>
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img src={selectedPreview} alt="Ampliada" className={styles.modalImageLarge} />
            <button className={styles.modalCloseButton} onClick={closeModal}>×</button>
          </div>
  </div>
)}

    </div>
  );
};

export default ActualizarPublicacion;
