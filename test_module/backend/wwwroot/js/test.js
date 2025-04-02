// Funciones de utilidad
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('d-none');
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Función para crear el encabezado de la tabla
function createTableHeader(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    return `
        <thead>
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
    `;
}

// Función para crear una fila de la tabla
function createTableRow(item) {
    const cells = Object.entries(item).map(([key, value]) => {
        let displayValue = value;
        
        // Formatear fechas si el campo contiene 'fecha' o 'date'
        if (key.toLowerCase().includes('fecha') || key.toLowerCase().includes('date')) {
            try {
                displayValue = formatDate(value);
            } catch (e) {
                // Si no es una fecha válida, mostrar el valor original
            }
        }
        
        return `<td>${displayValue}</td>`;
    });
    
    return `<tr>${cells.join('')}</tr>`;
}

// Función para cargar los despachos
async function loadDespachos() {
    try {
        showLoading();
        hideError();
        
        const response = await fetch('http://localhost:5080/api/despachos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const table = document.querySelector('.table');
        
        // Actualizar la estructura de la tabla
        table.innerHTML = createTableHeader(data);
        
        // Crear el tbody si no existe
        let tbody = table.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
        }
        
        // Limpiar y llenar el tbody
        tbody.innerHTML = data.map(item => createTableRow(item)).join('');
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los despachos: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Cargar los despachos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadDespachos);

document.addEventListener('DOMContentLoaded', function() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const tablasTabs = document.getElementById('tablasTabs');
    const tablasContent = document.getElementById('tablasContent');

    // Función para mostrar el spinner de carga
    function showLoading() {
        loadingSpinner.classList.remove('d-none');
        errorMessage.classList.add('d-none');
    }

    // Función para ocultar el spinner de carga
    function hideLoading() {
        loadingSpinner.classList.add('d-none');
    }

    // Función para mostrar errores
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        hideLoading();
    }

    // Función para formatear fechas
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    // Función para crear una tabla HTML
    function createTable(data, columns) {
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover';
        
        // Crear encabezados
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Crear cuerpo de la tabla
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                let value = row[column];
                
                // Formatear fechas si el campo contiene 'fecha' o 'date'
                if (column.toLowerCase().includes('fecha') || column.toLowerCase().includes('date')) {
                    value = formatDate(value);
                }
                
                td.textContent = value !== null ? value : '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    }

    // Función para cargar datos de una tabla
    async function loadTableData(tableName) {
        try {
            const response = await fetch(`/api/tablas/${tableName}`);
            if (!response.ok) {
                throw new Error(`Error al cargar datos de ${tableName}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error al cargar ${tableName}:`, error);
            throw error;
        }
    }

    // Función para crear una pestaña y su contenido
    async function createTab(tableName) {
        try {
            const data = await loadTableData(tableName);
            if (!data || data.length === 0) {
                return;
            }

            // Crear pestaña
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.role = 'presentation';
            const button = document.createElement('button');
            button.className = 'nav-link';
            button.id = `${tableName}-tab`;
            button.setAttribute('data-bs-toggle', 'tab');
            button.setAttribute('data-bs-target', `#${tableName}`);
            button.type = 'button';
            button.role = 'tab';
            button.textContent = tableName;
            li.appendChild(button);
            tablasTabs.appendChild(li);

            // Crear contenido de la pestaña
            const div = document.createElement('div');
            div.className = 'tab-pane fade';
            div.id = tableName;
            div.role = 'tabpanel';
            
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive';
            const columns = Object.keys(data[0]);
            const table = createTable(data, columns);
            tableContainer.appendChild(table);
            
            div.appendChild(tableContainer);
            tablasContent.appendChild(div);

            // Activar la primera pestaña
            if (tablasTabs.children.length === 1) {
                button.classList.add('active');
                div.classList.add('show', 'active');
            }
        } catch (error) {
            console.error(`Error al crear pestaña para ${tableName}:`, error);
        }
    }

    // Función principal para cargar todas las tablas
    async function loadAllTables() {
        showLoading();
        try {
            const response = await fetch('/api/tablas/tables');
            if (!response.ok) {
                throw new Error('Error al obtener la lista de tablas');
            }
            const tables = await response.json();
            
            for (const table of tables) {
                await createTab(table);
            }
        } catch (error) {
            showError('Error al cargar las tablas: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Iniciar la carga de datos
    loadAllTables();
}); 