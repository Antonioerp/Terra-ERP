// Funciones de utilidad
const utils = {
    // Formatear fecha
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(date));
    },

    // Mostrar mensaje de error
    showError: (message) => {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    },

    // Ocultar mensaje de error
    hideError: () => {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.classList.add('d-none');
    },

    // Mostrar spinner de carga
    showLoading: () => {
        document.getElementById('loadingSpinner').classList.remove('d-none');
    },

    // Ocultar spinner de carga
    hideLoading: () => {
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
};

// Función para cargar los despachos
async function loadDespachos() {
    try {
        utils.showLoading();
        utils.hideError();

        const response = await fetch('/api/despachos');
        if (!response.ok) {
            throw new Error('Error al cargar los despachos');
        }

        const despachos = await response.json();
        const tableBody = document.getElementById('despachosTableBody');
        tableBody.innerHTML = '';

        despachos.forEach(despacho => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${despacho.id}</td>
                <td>${utils.formatDate(despacho.fecha)}</td>
                <td>${despacho.cliente}</td>
                <td>${despacho.producto}</td>
                <td>${despacho.cantidad}</td>
                <td>${despacho.estado}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        utils.showError(error.message);
    } finally {
        utils.hideLoading();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadDespachos();
}); 