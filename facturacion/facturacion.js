/* ============================================
   SERVITEC.BAQ · GENERADOR DE CUENTAS DE COBRO
   
   Este módulo NO es facturación electrónica.
   Genera cuentas de cobro en PDF, que son el
   documento correcto para personas naturales
   no responsables de IVA según la DIAN.
   
   Guarda un registro automático en Google Sheets
   a través de Google Apps Script.
   ============================================ */

// ===== CONFIGURACIÓN =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJjXoPmpuN5fHB_uE1rA7AJXplPA7-z0MoKqPh8Qu0XX8j3BtfpkXhAvFZPqeR0XDpIw/exec';

// ===== DATOS POR DEFECTO DEL EMISOR =====
const EMISOR_DEFAULT = {
    nombre: 'David Fragozo',
    cedula: '1143260112',
    telefono: '315 850 5020',
    email: 'servitecbaq@gmail.com',
    ciudad: 'Barranquilla, Atlántico',
    website: 'https://servitecbaq.com'
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fechaActual = document.getElementById('fechaActual');
    if (fechaActual) fechaActual.textContent = fechaFormateada;

    const fechaStat = document.getElementById('fechaStat');
    if (fechaStat) {
        fechaStat.textContent = hoy.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    const emisorDoc = document.getElementById('emisor_documento');
    if (emisorDoc && emisorDoc.value === 'TU_CEDULA_AQUI') {
        emisorDoc.value = EMISOR_DEFAULT.cedula;
    }

    agregarFila();

    const form = document.getElementById('formFactura');
    if (form) form.addEventListener('submit', manejarEnvio);
});

// ===== AGREGAR FILA DE SERVICIO =====
function agregarFila(descripcion = '', cantidad = 1, valor = 0, iva = 0) {
    const tbody = document.getElementById('cuerpoServicios');
    if (!tbody) return;

    const fila = document.createElement('tr');

    fila.innerHTML = `
        <td>
            <input type="text" name="descripcion[]"
                   value="${descripcion}"
                   placeholder="Ej: Mantenimiento preventivo" required>
        </td>
        <td>
            <input type="number" name="cantidad[]"
                   value="${cantidad}" min="0.01" step="0.01"
                   onchange="calcularTotales()" oninput="calcularTotales()">
        </td>
        <td>
            <input type="number" name="valor[]"
                   value="${valor}" min="0" step="0.01"
                   onchange="calcularTotales()" oninput="calcularTotales()">
        </td>
        <td>
            <input type="number" name="iva[]"
                   value="${iva}" min="0" max="100" step="0.01"
                   onchange="calcularTotales()" oninput="calcularTotales()">
        </td>
        <td class="total-linea">$0</td>
        <td>
            <button type="button" class="btn-eliminar"
                    onclick="eliminarFila(this)">✖</button>
        </td>
    `;

    tbody.appendChild(fila);
    calcularTotales();
}

// ===== ELIMINAR FILA =====
function eliminarFila(boton) {
    const filas = document.querySelectorAll('#cuerpoServicios tr');
    if (filas.length === 1) {
        alert('Debe haber al menos un servicio.');
        return;
    }
    boton.closest('tr').remove();
    calcularTotales();
}

// ===== CALCULAR TOTALES =====
function calcularTotales() {
    let subtotal = 0;
    let ivaTotal = 0;

    const filas = document.querySelectorAll('#cuerpoServicios tr');

    filas.forEach(fila => {
        const cantidad = parseFloat(fila.querySelector('[name="cantidad[]"]').value) || 0;
        const valor    = parseFloat(fila.querySelector('[name="valor[]"]').value) || 0;
        const iva      = parseFloat(fila.querySelector('[name="iva[]"]').value) || 0;

        const base       = cantidad * valor;
        const ivaLinea   = base * (iva / 100);
        const totalLinea = base + ivaLinea;

        fila.querySelector('.total-linea').textContent = formatearMoneda(totalLinea);

        subtotal += base;
        ivaTotal += ivaLinea;
    });

    const total = subtotal + ivaTotal;

    document.getElementById('subtotal').textContent = formatearMoneda(subtotal);
    document.getElementById('iva').textContent      = formatearMoneda(ivaTotal);
    document.getElementById('total').textContent    = formatearMoneda(total);

    const totalLetras = document.getElementById('totalLetras');
    if (totalLetras) {
        totalLetras.textContent = total > 0 ? numeroALetras(total) : '—';
    }

    const totalStat = document.getElementById('totalStat');
    if (totalStat) totalStat.textContent = formatearMoneda(total);

    const contador = document.getElementById('contadorServicios');
    if (contador) {
        const n = filas.length;
        contador.textContent = `${n} ${n === 1 ? 'item' : 'items'}`;
    }
}

// ===== FORMATEAR MONEDA =====
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function formatearMonedaPDF(valor) {
    return '$' + Math.round(valor).toLocaleString('es-CO');
}

// ===== CONVERTIR NÚMERO A LETRAS =====
function numeroALetras(numero) {
    const entero = Math.floor(numero);
    const centavos = Math.round((numero - entero) * 100);

    let letras = convertirEntero(entero);

    if (centavos > 0) {
        letras += ` CON ${centavos.toString().padStart(2, '0')}/100`;
    }

    return letras + ' PESOS';
}

function convertirEntero(numero) {
    if (numero === 0) return 'CERO';

    const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const DECENAS   = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const ESPECIALES = {
        11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
        16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
        21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
        25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
    };
    const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
                      'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    function convertirGrupo(n) {
        if (n === 0) return '';
        if (n === 100) return 'CIEN';

        let resultado = '';
        const centena = Math.floor(n / 100);
        const resto = n % 100;

        if (centena > 0) {
            resultado += CENTENAS[centena];
            if (resto > 0) resultado += ' ';
        }

        if (resto > 0) {
            if (ESPECIALES[resto]) {
                resultado += ESPECIALES[resto];
            } else if (resto < 10) {
                resultado += UNIDADES[resto];
            } else {
                const decena = Math.floor(resto / 10);
                const unidad = resto % 10;
                resultado += DECENAS[decena];
                if (unidad > 0) {
                    resultado += ' Y ' + UNIDADES[unidad];
                }
            }
        }
        return resultado;
    }

    if (numero >= 1000000) {
        const millones = Math.floor(numero / 1000000);
        const resto = numero % 1000000;

        let textoMillones;
        if (millones === 1) {
            textoMillones = 'UN MILLÓN';
        } else {
            textoMillones = convertirGrupo(millones) + ' MILLONES';
        }

        if (resto > 0) {
            return textoMillones + ' ' + convertirEntero(resto);
        }
        return textoMillones;
    }

    if (numero >= 1000) {
        const miles = Math.floor(numero / 1000);
        const resto = numero % 1000;

        let textoMiles;
        if (miles === 1) {
            textoMiles = 'MIL';
        } else {
            textoMiles = convertirGrupo(miles) + ' MIL';
        }

        if (resto > 0) {
            return textoMiles + ' ' + convertirGrupo(resto);
        }
        return textoMiles;
    }

    return convertirGrupo(numero);
}

// ===== RECOLECTAR DATOS =====
function recolectarDatos() {
    const servicios = [];

    document.querySelectorAll('#cuerpoServicios tr').forEach(fila => {
        const cantidad = parseFloat(fila.querySelector('[name="cantidad[]"]').value) || 0;
        const valor    = parseFloat(fila.querySelector('[name="valor[]"]').value) || 0;
        const iva      = parseFloat(fila.querySelector('[name="iva[]"]').value) || 0;
        const base     = cantidad * valor;

        servicios.push({
            descripcion: fila.querySelector('[name="descripcion[]"]').value.trim(),
            cantidad: cantidad,
            valor_unitario: valor,
            iva_porcentaje: iva,
            total_linea: base + (base * iva / 100)
        });
    });

    return {
        emisor: {
            nombre:   document.getElementById('emisor_nombre').value,
            cedula:   document.getElementById('emisor_documento').value,
            telefono: document.getElementById('emisor_telefono').value,
            email:    document.getElementById('emisor_email').value,
            ciudad:   document.getElementById('emisor_ciudad').value,
            website:  document.getElementById('emisor_website').value
        },
        cliente: {
            nombre:    document.getElementById('cliente_nombre').value.trim(),
            tipoDoc:   document.getElementById('cliente_tipo_doc').value,
            documento: document.getElementById('cliente_documento').value.trim(),
            email:     document.getElementById('cliente_email').value.trim(),
            telefono:  document.getElementById('cliente_telefono').value.trim(),
            direccion: document.getElementById('cliente_direccion').value.trim()
        },
        servicios: servicios,
        totales: {
            subtotal: parsearMoneda(document.getElementById('subtotal').textContent),
            iva:      parsearMoneda(document.getElementById('iva').textContent),
            total:    parsearMoneda(document.getElementById('total').textContent)
        },
        totalLetras: document.getElementById('totalLetras').textContent,
        observaciones: document.getElementById('observaciones').value.trim(),
        fecha: new Date().toLocaleDateString('es-CO')
    };
}

function parsearMoneda(texto) {
    return parseFloat(texto.replace(/[^0-9.-]/g, '')) || 0;
}

// ===== MANEJAR ENVÍO =====
function manejarEnvio(evento) {
    evento.preventDefault();

    const filas = document.querySelectorAll('#cuerpoServicios tr');
    let serviciosValidos = 0;

    filas.forEach(fila => {
        const desc  = fila.querySelector('[name="descripcion[]"]').value.trim();
        const valor = parseFloat(fila.querySelector('[name="valor[]"]').value) || 0;
        if (desc && valor > 0) serviciosValidos++;
    });

    if (serviciosValidos === 0) {
        alert('Debes agregar al menos un servicio con descripción y valor.');
        return;
    }

    const nombreCliente = document.getElementById('cliente_nombre').value.trim();
    const docCliente = document.getElementById('cliente_documento').value.trim();
    const emailCliente = document.getElementById('cliente_email').value.trim();

    if (!nombreCliente || !docCliente || !emailCliente) {
        alert('Por favor completa los datos obligatorios del cliente (nombre, documento y correo).');
        return;
    }

    const datos = recolectarDatos();
    const numeroDocumento = `CC-${Date.now().toString().slice(-6)}`;

    const numeroStat = document.getElementById('numeroStat');
    if (numeroStat) numeroStat.textContent = numeroDocumento;

    // ===== ENVIAR DATOS A GOOGLE SHEETS =====
    enviarDatosAGoogle(datos, numeroDocumento);

    // ===== GENERAR PDF =====
    try {
        generarPDF(datos, numeroDocumento);
        alert(`✅ Cuenta de cobro generada correctamente.\n\nNúmero: ${numeroDocumento}\nTotal: ${formatearMoneda(datos.totales.total)}`);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Hubo un error al generar el PDF. Revisa la consola para más detalles.');
    }
}

// ===== ENVIAR DATOS A GOOGLE SHEETS =====
function enviarDatosAGoogle(datos, numeroDocumento) {
    // Prepara los datos que se enviarán al script de Google
    const formData = new URLSearchParams();

    formData.append('NumeroCuenta', numeroDocumento);
    formData.append('Fecha', datos.fecha);
    formData.append('ClienteNombre', datos.cliente.nombre);
    formData.append('ClienteTipoDoc', datos.cliente.tipoDoc);
    formData.append('ClienteDocumento', datos.cliente.documento);
    formData.append('ClienteEmail', datos.cliente.email);
    formData.append('ClienteTelefono', datos.cliente.telefono || '');
    formData.append('ClienteDireccion', datos.cliente.direccion || '');
    formData.append('Subtotal', datos.totales.subtotal);
    formData.append('IVA', datos.totales.iva);
    formData.append('Total', datos.totales.total);
    formData.append('TotalLetras', datos.totalLetras);
    formData.append('Observaciones', datos.observaciones || '');
    formData.append('Servicios', JSON.stringify(datos.servicios));

    // Envía los datos al script de Google
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necesario para evitar bloqueos CORS con Apps Script
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(() => {
        console.log('✅ Datos enviados a Google Sheets:', numeroDocumento);
    })
    .catch(error => {
        console.error('❌ Error al enviar a Google Sheets:', error);
    });
}

// ===== GENERAR PDF =====
function generarPDF(datos, numeroDocumento) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const paginaAncho = doc.internal.pageSize.getWidth();
    const paginaAlto  = doc.internal.pageSize.getHeight();
    const margen = 18;
    let y = 20;

    // ===== ENCABEZADO =====
    doc.setFillColor(10, 37, 64);
    doc.rect(0, 0, paginaAncho, 34, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVITEC.BAQ', margen, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Reparación, Mantenimiento y Soporte Tecnológico', margen, 20);
    doc.text('Barranquilla, Atlántico · Colombia', margen, 25);

    doc.setTextColor(100, 181, 246);
    doc.setFontSize(8.5);
    doc.text('www.servitecbaq.com', margen, 30);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CUENTA DE COBRO', paginaAncho - margen, 14, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. ${numeroDocumento}`, paginaAncho - margen, 20, { align: 'right' });
    doc.text(`Fecha: ${datos.fecha}`, paginaAncho - margen, 26, { align: 'right' });

    y = 48;

    // ===== DATOS DEL EMISOR =====
    doc.setTextColor(21, 101, 192);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL EMISOR', margen, y);
    y += 2;
    doc.setDrawColor(30, 136, 229);
    doc.setLineWidth(0.5);
    doc.line(margen, y, margen + 50, y);
    y += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const anchoCol = (paginaAncho - margen * 2) / 2;

    doc.text(`Nombre: ${datos.emisor.nombre}`, margen, y);
    doc.text(`Correo: ${datos.emisor.email}`, margen + anchoCol, y);
    y += 5;
    doc.text(`Cédula: ${datos.emisor.cedula}`, margen, y);
    doc.text(`Sitio web: ${datos.emisor.website}`, margen + anchoCol, y);
    y += 5;
    doc.text(`Teléfono: ${datos.emisor.telefono}`, margen, y);
    doc.text(`Ciudad: ${datos.emisor.ciudad}`, margen + anchoCol, y);
    y += 14;

    // ===== DATOS DEL CLIENTE =====
    doc.setTextColor(21, 101, 192);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', margen, y);
    y += 2;
    doc.line(margen, y, margen + 50, y);
    y += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text(`Nombre: ${datos.cliente.nombre}`, margen, y);
    doc.text(`Correo: ${datos.cliente.email}`, margen + anchoCol, y);
    y += 5;
    doc.text(`${datos.cliente.tipoDoc}: ${datos.cliente.documento}`, margen, y);
    if (datos.cliente.telefono) doc.text(`Teléfono: ${datos.cliente.telefono}`, margen + anchoCol, y);
    y += 5;
    if (datos.cliente.direccion) {
        doc.text(`Dirección: ${datos.cliente.direccion}`, margen, y);
        y += 5;
    }
    y += 8;

    // ===== TABLA DE SERVICIOS =====
    doc.setTextColor(21, 101, 192);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE SERVICIOS', margen, y);
    y += 7;

    const colDesc = margen + 3;
    const colCant = margen + 105;
    const colValor = margen + 125;
    const colTotal = paginaAncho - margen - 3;

    doc.setFillColor(30, 136, 229);
    doc.rect(margen, y, paginaAncho - margen * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción', colDesc, y + 5.5);
    doc.text('Cant.', colCant, y + 5.5);
    doc.text('Valor Unit.', colValor, y + 5.5);
    doc.text('Total', colTotal, y + 5.5, { align: 'right' });
    y += 8;

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    datos.servicios.forEach((servicio, idx) => {
        if (y > paginaAlto - 60) {
            doc.addPage();
            y = 25;
        }

        if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margen, y, paginaAncho - margen * 2, 8, 'F');
        }

        const descCorta = servicio.descripcion.length > 48
            ? servicio.descripcion.substring(0, 45) + '...'
            : servicio.descripcion;

        doc.text(descCorta, colDesc, y + 5.5);
        doc.text(servicio.cantidad.toString(), colCant, y + 5.5);
        doc.text(formatearMonedaPDF(servicio.valor_unitario), colValor, y + 5.5);
        doc.text(formatearMonedaPDF(servicio.total_linea), colTotal, y + 5.5, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(margen, y + 8, paginaAncho - margen, y + 8);
        y += 8;
    });

    y += 8;

    // ===== TOTALES =====
    if (y > paginaAlto - 80) {
        doc.addPage();
        y = 25;
    }

    const totalesX = paginaAncho - margen - 60;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    doc.text('Subtotal:', totalesX, y);
    doc.text(formatearMonedaPDF(datos.totales.subtotal), colTotal, y, { align: 'right' });
    y += 5;

    doc.text('IVA:', totalesX, y);
    doc.text(formatearMonedaPDF(datos.totales.iva), colTotal, y, { align: 'right' });
    y += 8;

    doc.setFillColor(10, 37, 64);
    doc.rect(totalesX - 3, y - 5, 63, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalesX, y + 2);
    doc.text(formatearMonedaPDF(datos.totales.total), colTotal, y + 2, { align: 'right' });
    y += 18;

    // ===== MONTO EN LETRAS =====
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const totalLetrasTexto = `Son: ${datos.totalLetras}`;
    const lineasLetras = doc.splitTextToSize(totalLetrasTexto, paginaAncho - margen * 2);
    doc.text(lineasLetras, margen, y);
    y += lineasLetras.length * 4 + 8;

    // ===== OBSERVACIONES =====
    if (datos.observaciones) {
        if (y > paginaAlto - 60) {
            doc.addPage();
            y = 25;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(21, 101, 192);
        doc.text('OBSERVACIONES', margen, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const obsLineas = doc.splitTextToSize(datos.observaciones, paginaAncho - margen * 2);
        doc.text(obsLineas, margen, y);
        y += obsLineas.length * 4 + 10;
    }

    // ===== FIRMA =====
    if (y > paginaAlto - 50) {
        doc.addPage();
        y = 40;
    }

    y += 10;
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.3);
    doc.line(margen, y, margen + 60, y);
    y += 5;
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.emisor.nombre, margen, y);
    y += 4;
    doc.text(`C.C. ${datos.emisor.cedula}`, margen, y);
    y += 4;
    doc.text('Firma del Prestador', margen, y);

    // ===== PIE DE PÁGINA =====
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Servitec.baq · ${datos.emisor.email} · ${datos.emisor.telefono} · www.servitecbaq.com`,
            paginaAncho / 2,
            paginaAlto - 8,
            { align: 'center' }
        );
        doc.text(
            `Página ${i} de ${totalPaginas}`,
            paginaAncho - margen,
            paginaAlto - 8,
            { align: 'right' }
        );
    }

    // ===== GUARDAR =====
    const nombreArchivo = `CuentaCobro_${numeroDocumento}_${datos.cliente.nombre.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
}

// ===== LIMPIAR FORMULARIO =====
function limpiarFormulario() {
    if (!confirm('¿Seguro que quieres limpiar todo el formulario?')) return;

    document.getElementById('formFactura').reset();
    document.getElementById('cuerpoServicios').innerHTML = '';
    document.getElementById('emisor_documento').value = EMISOR_DEFAULT.cedula;
    document.getElementById('emisor_website').value = EMISOR_DEFAULT.website;

    agregarFila();
    calcularTotales();
}

// ===== EXPONER FUNCIONES GLOBALES =====
window.agregarFila = agregarFila;
window.eliminarFila = eliminarFila;
window.calcularTotales = calcularTotales;
window.limpiarFormulario = limpiarFormulario;