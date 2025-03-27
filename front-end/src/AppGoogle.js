import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId = "717512334666-mqmflrr0ke6fq8augilkm6u0fg1psmhj.apps.googleusercontent.com"; // Tu Client ID

function App() {
  const [user, setUser] = useState(null); // Estado para guardar el usuario

  function decodeJWT(token) {
    const base64Url = token.split(".")[1]; // Extraer payload
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)); // Decodificar JWT a JSON
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h2>Iniciar sesión con Google</h2>
        <GoogleLogin
          onSuccess={(response) => {
            const userData = decodeJWT(response.credential); // Decodifica el token
            setUser(userData); // Guarda el usuario en el estado
            localStorage.setItem("user", JSON.stringify(userData)); // Guarda en localStorage
          }}
          onError={() => {
            console.log("Error en el inicio de sesión");
          }}
        />

        {user && (
          <div>
            <h3>Bienvenido, {user.name}</h3>
            <p>Email: {user.email}</p>
            <img src={user.picture} alt="Foto de perfil" width="100" />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
