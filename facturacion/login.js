/* ============================================
   SERVITECBAQ · LOGIN
   Valida el usuario y contraseña contra Google Sheets
   vía Apps Script.
   ============================================ */

// ⚠️ Reemplaza esta URL con la de tu Apps Script de login
const LOGIN_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4LdnLYG0e0EpdwPf2C0JvD9KzE2ML3FhgbcYfdshsGgTMKsM7rWGMf1YkjxFNwhUS/exec';

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión activa, redirigir al módulo
    if (sessionStorage.getItem('sb_autenticado') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', manejarLogin);
});

// ===== MANEJAR LOGIN =====
async function manejarLogin(evento) {
    evento.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoading = btnLogin.querySelector('.btn-loading');
    const mensajeError = document.getElementById('mensajeError');

    // Ocultar error previo
    mensajeError.style.display = 'none';

    // Validar que los campos no estén vacíos
    if (!usuario || !password) {
        mostrarError('Por favor completa usuario y contraseña.');
        return;
    }

    // Mostrar estado de carga
    btnLogin.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        // Construir URL con parámetros
        const url = `${LOGIN_SCRIPT_URL}?usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}`;

        // Hacer la petición
        const respuesta = await fetch(url);
        const data = await respuesta.json();

        if (data.result === 'success') {
            // Guardar sesión
            sessionStorage.setItem('sb_autenticado', 'true');
            sessionStorage.setItem('sb_usuario', usuario);
            sessionStorage.setItem('sb_login_time', Date.now().toString());

            // Redirigir al módulo
            window.location.href = 'index.html';
        } else {
            mostrarError(data.message || 'Usuario o contraseña incorrectos.');
            btnLogin.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }

    } catch (error) {
        console.error('Error al validar login:', error);
        mostrarError('No se pudo conectar con el servidor. Intenta de nuevo.');
        btnLogin.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// ===== MOSTRAR ERROR =====
function mostrarError(texto) {
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.textContent = texto;
    mensajeError.style.display = 'block';

    // Sacudir el campo de contraseña
    const passwordInput = document.getElementById('password');
    passwordInput.focus();
    passwordInput.select();
}