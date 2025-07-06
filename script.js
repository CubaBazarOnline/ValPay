document.addEventListener('DOMContentLoaded', function() {
    // Categorías predeterminadas con íconos
    const categories = [
        { name: 'Productos', icon: '🛍️' },
        { name: 'Servicios', icon: '🛠️' },
        { name: 'Accesorios', icon: '👓' },
        { name: 'Ropas', icon: '👕' },
        { name: 'Rentas', icon: '🏠' },
        { name: 'Comestible', icon: '🍎' },
        { name: 'Empleos', icon: '💼' },
        { name: 'Intercambios', icon: '🔄' },
        { name: 'Viviendas', icon: '🏡' },
        { name: 'Electronicos', icon: '💻' }
    ];
    
    // Elementos del DOM
    const form = document.getElementById('productForm');
    const categorySelector = document.getElementById('categorySelector');
    const categoryInput = document.getElementById('category');
    const pictureUrlInput = document.getElementById('picture_url');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = imagePreview.querySelector('img');
    const resultSection = document.getElementById('resultSection');
    const resultCard = document.getElementById('resultCard');
    const xmlOutput = document.getElementById('xmlOutput');
    const toast = document.getElementById('toast');
    const generateBtn = document.getElementById('generateBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    // Solicitar permisos al cargar la página
    requestPermissions();
    
    // Cargar datos guardados
    loadSavedData();
    
    // Inicializar categorías con íconos
    categories.forEach(category => {
        const option = document.createElement('div');
        option.className = 'category-option';
        option.innerHTML = `<span>${category.icon}</span> ${category.name}`;
        option.dataset.value = category.name;
        option.addEventListener('click', selectCategory);
        categorySelector.appendChild(option);
    });
    
    function selectCategory() {
        document.querySelectorAll('.category-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.classList.add('selected');
        categoryInput.value = this.dataset.value;
        saveFormData();
    }
    
    // Generar referencia automática si está vacío
    document.getElementById('ref').addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.value = 'PROD-' + Math.floor(1000 + Math.random() * 9000);
            saveFormData();
        }
    });
    
    // Validación en tiempo real
    form.addEventListener('input', debounce(() => {
        validateField('ref', /^[A-Za-z0-9\-]+$/, 'Solo letras, números y guiones permitidos');
        saveFormData();
    }, 300));
    
    // Validar URL de imagen
    pictureUrlInput.addEventListener('input', debounce(function() {
        const url = this.value.trim();
        if (url) {
            validateImageUrl(url);
        } else {
            imagePreview.style.display = 'none';
        }
        saveFormData();
    }, 500));
    
    function validateImageUrl(url) {
        // Primero verificar que sea una URL válida
        try {
            new URL(url);
        } catch (e) {
            showToast('La URL de la imagen no es válida', 'error');
            imagePreview.style.display = 'none';
            return false;
        }
        
        // Intentar cargar la imagen para verificar
        previewImg.src = url;
        imagePreview.style.display = 'block';
        
        previewImg.onload = function() {
            showToast('Imagen cargada correctamente', 'success');
            return true;
        };
        
        previewImg.onerror = function() {
            showToast('No se pudo cargar la imagen. Verifica la URL.', 'error');
            imagePreview.style.display = 'none';
            return false;
        };
    }
    
    // Generar XML con estado de carga
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateRequiredFields()) {
            return;
        }
        
        // Mostrar estado de carga
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        
        // Simular procesamiento (en un caso real sería instantáneo)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const formData = getFormData();
        const xml = generateProductXml(formData);
        
        xmlOutput.textContent = xml;
        resultSection.hidden = false;
        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth' });
        
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        showToast('XML generado correctamente', 'success');
    });
    
    function getFormData() {
        return {
            ref: document.getElementById('ref').value.trim(),
            title: document.getElementById('title').value.trim(),
            content: document.getElementById('content').value.trim(),
            category: categoryInput.value,
            subcategory: document.getElementById('subcategory').value.trim(),
            price: document.getElementById('price').value.trim(),
            price_descr: document.getElementById('price_descr').value.trim(),
            year: document.getElementById('year').value.trim(),
            month: document.getElementById('month').value.trim(),
            day: document.getElementById('day').value.trim(),
            detail_url: document.getElementById('detail_url').value.trim(),
            buy_url: document.getElementById('buy_url').value.trim(),
            picture_url: document.getElementById('picture_url').value.trim()
        };
    }
    
    function validateRequiredFields() {
        const requiredFields = [
            { id: 'ref', name: 'Referencia' },
            { id: 'title', name: 'Título' },
            { id: 'category', name: 'Categoría' },
            { id: 'price', name: 'Precio' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                element.focus();
                showToast(`El campo "${field.name}" es requerido`, 'error');
                return false;
            }
        }
        
        return true;
    }
    
    function validateField(fieldId, regex, errorMessage) {
        const field = document.getElementById(fieldId);
        const isValid = regex.test(field.value);
        
        if (field.value && !isValid) {
            field.setCustomValidity(errorMessage);
            showToast(errorMessage, 'error');
        } else {
            field.setCustomValidity('');
        }
        
        return isValid;
    }
    
    function generateProductXml(data) {
        const today = new Date();
        const indent = (level) => '  '.repeat(level);
        
        let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
        xml += `<list>\n\n`;
        xml += `${indent(1)}<product>\n`;
        xml += `${indent(2)}<ref>${escapeXml(data.ref)}</ref>\n`;
        xml += `${indent(2)}<title>${escapeXml(data.title)}</title>\n`;
        xml += `${indent(2)}<content>${escapeXml(data.content)}</content>\n`;
        xml += `${indent(2)}<category>${escapeXml(data.category)}</category>\n`;
        xml += `${indent(2)}<subcategory>${escapeXml(data.subcategory)}</subcategory>\n`;
        xml += `${indent(2)}<price>${escapeXml(data.price)}</price>\n`;
        xml += `${indent(2)}<price_descr>${escapeXml(data.price_descr)}</price_descr>\n`;
        xml += `${indent(2)}<year>${data.year || today.getFullYear()}</year>\n`;
        xml += `${indent(2)}<month>${data.month || String(today.getMonth() + 1).padStart(2, '0')}</month>\n`;
        xml += `${indent(2)}<day>${data.day || String(today.getDate()).padStart(2, '0')}</day>\n`;
        xml += `${indent(2)}<detail_url>${escapeXml(data.detail_url)}</detail_url>\n`;
        xml += `${indent(2)}<buy_url>${escapeXml(data.buy_url)}</buy_url>\n`;
        
        if (data.picture_url) {
            xml += `${indent(2)}<picture_url>${escapeXml(data.picture_url)}</picture_url>\n`;
        }
        
        xml += `${indent(1)}</product>\n\n`;
        xml += `</list>`;
        
        return formatXml(xml);
    }
    
    // Función para solicitar permisos
    function requestPermissions() {
        // Solicitar permiso de notificaciones
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permiso de notificaciones concedido');
                }
            });
        }
        
        // Solicitar permiso de almacenamiento (para localStorage)
        if ('storage' in navigator) {
            navigator.storage.persist().then(granted => {
                if (granted) {
                    console.log('Persistencia de almacenamiento concedida');
                }
            });
        }
    }
    
    // Función para enviar por WhatsApp
    whatsappBtn.addEventListener('click', function() {
        const phoneNumber = '+5350369270';
        const xmlContent = xmlOutput.textContent;
        
        if (!xmlContent) {
            showToast('No hay contenido XML para enviar', 'error');
            return;
        }
        
        // Crear un blob con el contenido XML
        const blob = new Blob([xmlContent], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        
        // Crear un enlace de descarga temporal
        const a = document.createElement('a');
        a.href = url;
        a.download = `producto_${document.getElementById('ref').value.trim() || 'sin_ref'}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Crear el mensaje para WhatsApp
        const productTitle = document.getElementById('title').value.trim() || 'Producto sin título';
        const message = `Hola, te comparto el XML del producto:\n\n*${productTitle}*\n\nPor favor revisa el archivo adjunto.`;
        
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Crear el enlace de WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Abrir en una nueva pestaña
        window.open(whatsappUrl, '_blank');
        
        showToast('Preparando envío por WhatsApp...', 'info');
    });
    
    // Persistencia de datos
    function saveFormData() {
        const formData = getFormData();
        localStorage.setItem('valpayFormData', JSON.stringify(formData));
    }
    
    function loadSavedData() {
        const savedData = localStorage.getItem('valpayFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Llenar campos simples
                Object.keys(data).forEach(key => {
                    if (document.getElementById(key)) {
                        document.getElementById(key).value = data[key] || '';
                    }
                });
                
                // Seleccionar categoría
                if (data.category) {
                    const categoryOption = document.querySelector(`.category-option[data-value="${data.category}"]`);
                    if (categoryOption) {
                        categoryOption.click();
                    }
                }
                
                // Mostrar imagen si existe
                if (data.picture_url) {
                    validateImageUrl(data.picture_url);
                }
                
                showToast('Datos anteriores recuperados', 'info');
            } catch (e) {
                console.error('Error al cargar datos guardados:', e);
            }
        }
    }
    
    // Utilidades
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    function escapeXml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, function(c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }
    
    function formatXml(xml) {
        const PADDING = '  ';
        let formatted = '';
        let indent = 0;
        
        xml.split(/>\s*</).forEach(node => {
            if (node.match(/^\/\w/)) indent--;
            formatted += PADDING.repeat(indent) + '<' + node + '>\n';
            if (node.match(/^<?\w[^>]*[^\/]$/)) indent++;
        });
        
        return formatted.substring(1, formatted.length - 3);
    }
    
    // Eventos para botones
    document.getElementById('copyBtn').addEventListener('click', function() {
        navigator.clipboard.writeText(xmlOutput.textContent)
            .then(() => showToast('XML copiado al portapapeles', 'success'))
            .catch(err => showToast('Error al copiar: ' + err, 'error'));
    });
    
    document.getElementById('downloadBtn').addEventListener('click', function() {
        const blob = new Blob([xmlOutput.textContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `producto_${document.getElementById('ref').value.trim() || 'sin_ref'}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Descarga iniciada', 'success');
    });
    
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.')) {
            form.reset();
            document.querySelectorAll('.category-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            categoryInput.value = '';
            imagePreview.style.display = 'none';
            resultSection.hidden = true;
            localStorage.removeItem('valpayFormData');
            showToast('Formulario limpiado', 'success');
        }
    });
    
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast';
        
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#4bb543';
                break;
            case 'error':
                toast.style.backgroundColor = '#e63946';
                break;
            case 'warning':
                toast.style.backgroundColor = '#ff9500';
                break;
            default:
                toast.style.backgroundColor = '#4361ee';
        }
        
        toast.classList.add('show');
        
        clearTimeout(toast.timeout);
        toast.timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});