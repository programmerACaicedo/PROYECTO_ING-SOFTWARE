// Selección de elementos
const sendCodeBtn = document.getElementById("send-code-btn");
const verificationForm = document.getElementById("verification-form");
const emailForm = document.getElementById("email-form");
const validateCodeBtn = document.getElementById("validate-code-btn");

// Evento de clic para "Validar y Enviar Código"
sendCodeBtn.addEventListener("click", function() {
    const email = document.getElementById("email").value;
    const securityWord = document.getElementById("security-word").value;

    // Validación simple
    if (email && securityWord) {
        // Muestra el formulario de verificación
        emailForm.style.display = "none";
        verificationForm.style.display = "block";
        alert("Te hemos enviado un código de verificación a tu correo.");
    } else {
        alert("Por favor, ingresa todos los campos.");
    }
});

// Evento de clic para "Validar" el código
validateCodeBtn.addEventListener("click", function() {
    const verificationCode = document.getElementById("verification-code").value;

    if (verificationCode) {
        alert("Código validado correctamente. Ahora puedes actualizar tu contraseña.");
        // Aquí podrías redirigir a otra página para cambiar la contraseña
    } else {
        alert("Por favor, ingresa el código de verificación.");
    }
});
