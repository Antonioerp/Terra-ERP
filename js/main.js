$(document).ready(function() {
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Función para mostrar mensaje de carga
    function showLoading() {
        Swal.fire({
            title: 'Cargando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Función para mostrar mensaje de éxito
    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    // Función para mostrar mensaje de error
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }

    // Manejar clics en las tarjetas
    $('.card').click(function() {
        var href = $(this).find('a').attr('href');
        if (href) {
            window.location.href = href;
        }
    });

    // Función para actualizar la tabla de faenas
    function actualizarTablaFaenas() {
        $.ajax({
            url: '/api/faenas',
            method: 'GET',
            success: function(response) {
                var tbody = $('.table tbody');
                tbody.empty();
                
                response.forEach(function(faena) {
                    var row = `
                        <tr>
                            <td>${faena.nombre}</td>
                            <td>${faena.ubicacion}</td>
                            <td>
                                <span class="badge bg-${faena.estado === 'Activa' ? 'success' : 'secondary'}">
                                    ${faena.estado}
                                </span>
                            </td>
                            <td>${parseFloat(faena.produccion_mensual).toFixed(2)} ton</td>
                            <td>$${parseFloat(faena.costo_operacional).toFixed(2)}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error al actualizar la tabla:', error);
            }
        });
    }

    // Actualizar la tabla cada 5 minutos
    setInterval(actualizarTablaFaenas, 300000);
}); 