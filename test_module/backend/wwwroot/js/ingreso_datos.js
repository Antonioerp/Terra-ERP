document.addEventListener('DOMContentLoaded', function() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const tablaSelector = document.getElementById('tablaSelector');
    const formularioContainer = document.getElementById('formularioContainer');
    const formularioIngreso = document.getElementById('formularioIngreso');

    console.log('DOM Content Loaded');
    console.log('Elementos encontrados:', {
        loadingSpinner: !!loadingSpinner,
        errorMessage: !!errorMessage,
        successMessage: !!successMessage,
        tablaSelector: !!tablaSelector,
        formularioContainer: !!formularioContainer,
        formularioIngreso: !!formularioIngreso
    });

    // Ocultar el formulario inicialmente
    if (formularioContainer) {
        formularioContainer.classList.add('hidden');
    }

    // Función para mostrar el spinner de carga
    function showLoading() {
        console.log('Mostrando spinner de carga');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        if (errorMessage) errorMessage.classList.add('d-none');
        if (successMessage) successMessage.classList.add('d-none');
    }

    // Función para ocultar el spinner de carga
    function hideLoading() {
        console.log('Ocultando spinner de carga');
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
    }

    // Función para mostrar errores
    function showError(message) {
        console.error('Error:', message);
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('d-none');
        }
        hideLoading();
    }

    // Función para mostrar mensaje de éxito
    function showSuccess(message) {
        console.log('Éxito:', message);
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.remove('d-none');
        }
        hideLoading();
    }

    // Función para mostrar el formulario
    function showForm() {
        console.log('Mostrando formulario');
        if (formularioContainer) {
            formularioContainer.classList.remove('hidden');
            formularioContainer.style.display = 'block';
        }
    }

    // Función para ocultar el formulario
    function hideForm() {
        console.log('Ocultando formulario');
        if (formularioContainer) {
            formularioContainer.classList.add('hidden');
            formularioContainer.style.display = 'none';
        }
    }

    // Función para crear un campo de formulario
    function createFormField(columna, esClaveForanea = false) {
        console.log('Creando campo de formulario:', columna);
        const div = document.createElement('div');
        div.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.htmlFor = columna.nombre;
        label.textContent = columna.nombre;

        let input;
        if (esClaveForanea) {
            // Crear select para clave foránea
            input = document.createElement('select');
            input.className = 'form-select select2';
            input.id = columna.nombre;
            input.name = columna.nombre;
            input.required = columna.nulo === false;
            
            // Agregar opción vacía
            const optionVacia = document.createElement('option');
            optionVacia.value = '';
            optionVacia.textContent = 'Seleccione...';
            input.appendChild(optionVacia);
        } else {
            // Crear input normal
            if (columna.tipo.includes('text')) {
                input = document.createElement('textarea');
                input.rows = 3;
            } else {
                input = document.createElement('input');
            }
            
            input.className = 'form-control';
            input.id = columna.nombre;
            input.name = columna.nombre;
            input.required = columna.nulo === false;

            // Configurar tipo de input según el tipo de columna
            if (columna.tipo.includes('int')) {
                input.type = 'number';
                if (columna.extra && columna.extra.includes('auto_increment')) {
                    input.disabled = true;
                }
            } else if (columna.tipo.includes('decimal') || columna.tipo.includes('float')) {
                input.type = 'number';
                input.step = 'any';
            } else if (columna.tipo.includes('date')) {
                input.type = 'date';
            } else if (columna.tipo.includes('datetime')) {
                input.type = 'datetime-local';
            } else if (!columna.tipo.includes('text')) {
                input.type = 'text';
            }

            // Agregar valor por defecto si existe
            if (columna.valorPorDefecto !== null) {
                input.value = columna.valorPorDefecto;
            }
        }

        div.appendChild(label);
        div.appendChild(input);

        return div;
    }

    // Función para cargar datos de una tabla referenciada
    async function loadReferencedData(tabla, columna) {
        try {
            console.log(`Cargando datos de tabla referenciada: ${tabla}`);
            const response = await fetch(`/api/Tablas/${tabla}`);
            if (!response.ok) {
                throw new Error(`Error al cargar datos de ${tabla}: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`Datos cargados de ${tabla}:`, data);
            return data;
        } catch (error) {
            console.error(`Error al cargar datos de ${tabla}:`, error);
            throw error;
        }
    }

    // Función para crear el formulario
    async function createForm(tabla) {
        try {
            console.log(`Creando formulario para tabla: ${tabla}`);
            showLoading();
            hideForm();
            
            const response = await fetch(`/api/Tablas/${tabla}/structure`);
            if (!response.ok) {
                throw new Error(`Error al obtener estructura de ${tabla}: ${response.status} ${response.statusText}`);
            }
            const estructura = await response.json();
            console.log('Estructura de la tabla:', estructura);

            // Limpiar formulario existente
            formularioIngreso.innerHTML = '';

            if (!estructura.columnas || estructura.columnas.length === 0) {
                throw new Error('La tabla no tiene columnas definidas');
            }

            // Crear campos para cada columna
            for (const columna of estructura.columnas) {
                console.log('Procesando columna:', columna);
                
                // Verificar si es clave foránea
                const esClaveForanea = estructura.clavesForaneas && estructura.clavesForaneas.some(
                    cf => cf.columna === columna.nombre
                );

                const campo = createFormField(columna, esClaveForanea);
                formularioIngreso.appendChild(campo);

                if (esClaveForanea) {
                    const claveForanea = estructura.clavesForaneas.find(
                        cf => cf.columna === columna.nombre
                    );

                    try {
                        // Cargar datos de la tabla referenciada
                        const datos = await loadReferencedData(
                            claveForanea.tablaReferenciada,
                            claveForanea.columnaReferenciada
                        );

                        // Llenar el select con los datos
                        const select = campo.querySelector('select');
                        if (datos && datos.length > 0) {
                            datos.forEach(dato => {
                                const option = document.createElement('option');
                                option.value = dato[claveForanea.columnaReferenciada];
                                option.textContent = Object.values(dato).join(' - ');
                                select.appendChild(option);
                            });

                            // Inicializar Select2 para este campo
                            $(select).select2({
                                placeholder: 'Seleccione...',
                                allowClear: true
                            });
                        } else {
                            console.warn(`No se encontraron datos para la tabla referenciada: ${claveForanea.tablaReferenciada}`);
                        }
                    } catch (error) {
                        console.error(`Error al cargar datos de la tabla referenciada: ${claveForanea.tablaReferenciada}`, error);
                    }
                }
            }

            // Agregar botón de envío
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.className = 'btn btn-primary mt-3';
            submitButton.textContent = 'Guardar';
            formularioIngreso.appendChild(submitButton);

            hideLoading();
            showForm();
        } catch (error) {
            console.error('Error al crear el formulario:', error);
            showError('Error al crear el formulario: ' + error.message);
            hideForm();
        }
    }

    // Event listener para cambio de tabla
    $(tablaSelector).on('change', function() {
        const tabla = this.value;
        console.log('Tabla seleccionada:', tabla);
        if (tabla) {
            createForm(tabla);
        } else {
            hideForm();
        }
    });

    // Event listener para envío del formulario
    formularioIngreso.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        const tabla = tablaSelector.value;
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        try {
            showLoading();
            console.log('Enviando datos:', data);
            const response = await fetch(`/api/Tablas/${tabla}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error al guardar los datos: ${response.status} ${response.statusText}`);
            }

            showSuccess('Datos guardados correctamente');
            this.reset();
            this.classList.remove('was-validated');
        } catch (error) {
            showError('Error al guardar los datos: ' + error.message);
        }
    });

    // Cargar lista de tablas
    async function loadTables() {
        try {
            console.log('Cargando lista de tablas...');
            showLoading();
            const response = await fetch('/api/Tablas/tables');
            if (!response.ok) {
                throw new Error(`Error al obtener la lista de tablas: ${response.status} ${response.statusText}`);
            }
            const tables = await response.json();
            console.log('Tablas cargadas:', tables);
            
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                tablaSelector.appendChild(option);
            });

            // Inicializar Select2 después de cargar las tablas
            $(tablaSelector).select2({
                placeholder: 'Seleccione una tabla...',
                allowClear: true
            });

            hideLoading();
        } catch (error) {
            console.error('Error al cargar las tablas:', error);
            showError('Error al cargar las tablas: ' + error.message);
        }
    }

    // Cargar las tablas al iniciar
    loadTables();
}); 