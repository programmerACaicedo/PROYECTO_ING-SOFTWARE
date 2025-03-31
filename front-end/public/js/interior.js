// Simula la información de las propiedades para demostración
const properties = {
    apartamento: [
      {
        image: "image-placeholder.jpg",
        price: "1.500.000",
        state: "Disponible",
        rooms: 3,
        bathrooms: 2
      }
    ],
    bodega: [
      {
        image: "image-placeholder.jpg",
        price: "2.000.000",
        state: "Disponible",
        rooms: 0,
        bathrooms: 0
      }
    ],
    // Agregar más tipos de propiedades según sea necesario
  };
  
  // Función para mostrar propiedades basadas en el tipo seleccionado
  function showProperties(tipo) {
    const propertyList = document.getElementById('property-list');
    propertyList.innerHTML = ""; // Limpiar las publicaciones actuales
  
    const selectedProperties = properties[tipo] || [];
  
    selectedProperties.forEach(property => {
      const propertyCard = document.createElement('div');
      propertyCard.classList.add('property-card');
  
      propertyCard.innerHTML = `
        <img src="${property.image}" alt="Imagen de propiedad">
        <p>Precio: ${property.price}</p>
        <p>Estado: ${property.state}</p>
        <p>Habitaciones: ${property.rooms}</p>
        <p>Baños: ${property.bathrooms}</p>
      `;
  
      propertyList.appendChild(propertyCard);
    });
  }
  
  // Simulación de visibilidad del "Nuevo Aviso" solo para propietarios
  let isPropietario = true; // Cambiar a false si el usuario no es propietario
  
  if (isPropietario) {
    document.getElementById('nuevo-aviso').style.display = 'block';
  } else {
    document.getElementById('nuevo-aviso').style.display = 'none';
  }
  
  