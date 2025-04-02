// Función para manejar el login
function login(username) {
    // Guardar el estado de la sesión
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    
    // Guardar la preferencia de "Recordar sesión"
    const rememberMe = document.getElementById('rememberMe').checked;
    localStorage.setItem('rememberMe', rememberMe);
}

// Función para verificar si el usuario está logueado
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    // Si no está logueado y no está en la página de login, redirigir al login
    if (!isLoggedIn && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
    
    // Si está logueado y está en la página de login, redirigir al dashboard
    if (isLoggedIn && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    window.location.href = 'index.html';
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth); 