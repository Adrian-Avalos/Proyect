// © 2025 Ramón Adrian Avalos Verá (GitHub: Adrian-Avalos)
// Prohibida la copia o uso comercial sin autorización.
// js/Calculadora-Ncompl.js

// — Exponer la variable de selección de alimentos como global —
window.alimentosSeleccionados = {
  desayuno: [],
  media_manana: [],
  almuerzo: [],
  merienda: [],
  cena: [],
  colacion: []
};

let graficoMacros = null;

window.addEventListener('DOMContentLoaded', async () => {
  // Inicializar cliente Supabase
  const client = supabase.createClient(
    'https://djbuwtemavldytssbicb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYnV3dGVtYXZsZHl0c3NiaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODIxOTMsImV4cCI6MjA1OTI1ODE5M30.VBwS5W5qEFaBVeXXITpGLZa5JSvXkZuaEIiYd33-oy4'
  );

  // Columnas a mostrar en la tabla
  const columnas = [
    "valor_energetico", "agua", "proteinas", "lipidos_totales", "colesterol",
    "ac_grasos_saturados", "ac_grasos_monoinsaturados", "ac_grasos_poliinsaturados", "ac_grasos_trans",
    "ac_linoleico", "ac_alfalinolenico", "ac_araquidonico", "ac_epa", "ac_dha",
    "carbohidratos_disponibles", "carbohidratos_totales", "azucar_total", "azucar_agregado", "fibra",
    "alcohol", "cenizas", "sodio", "potasio", "calcio", "cobre", "fosforo", "hierro",
    "magnesio", "zinc", "niacina", "folato_efd", "acido_folico", "vitamina_a_rae", "retinol",
    "tiamina", "riboflavina", "vitamina_b12", "vitamina_c", "vitamina_d"
  ];

  // Objetivos de macronutrientes
  const macrosObjetivo = { calorias: 2488, hc: 311, proteinas: 124, grasas: 82 };

  // Convierte cadenas numéricas con coma o punto a Number
  function convertirANumero(valor) {
    return parseFloat((valor ?? '0').toString().replace(',', '.')) || 0;
  }

  // Evento para filtrar alimentos
  document.getElementById('buscador').addEventListener('input', cargarAlimentos);

  // Carga los alimentos desde Supabase y llena el <select>
  async function cargarAlimentos() {
    const buscar = document.getElementById('buscador').value.trim().toLowerCase();
    const select = document.getElementById('alimento-select');
    select.innerHTML = '<option value="">Seleccioná un alimento</option>';

    let query = client
      .from('alimentos_detallados')
      .select('id, alimento, valor_energetico, carbohidratos_disponibles, proteinas, lipidos_totales')
      .order('alimento', { ascending: true });

    if (buscar) query = query.ilike('alimento', `%${buscar}%`);

    const { data, error } = await query;
    if (error) return console.error('Error al cargar alimentos:', error);

    data.forEach(({ id, alimento, valor_energetico, carbohidratos_disponibles, proteinas, lipidos_totales }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${alimento} (por 100g) | ${convertirANumero(valor_energetico).toFixed(0)} cal | ${convertirANumero(carbohidratos_disponibles).toFixed(1)} HC | ${convertirANumero(proteinas).toFixed(1)} Prot | ${convertirANumero(lipidos_totales).toFixed(1)} Grasas`;
      select.appendChild(opt);
    });
  }

  // Muestra todos los datos del alimento seleccionado
  window.mostrarDatosAlimento = async function () {
    const id = document.getElementById('alimento-select').value;
    const contenedor = document.getElementById('detalle-alimento');
    contenedor.innerHTML = '';
    if (!id) return;

    const { data, error } = await client.from('alimentos_detallados').select('*').eq('id', id).single();
    if (error) return console.error(error);
    window.alimentoActual = data;

    Object.entries(data).forEach(([clave, valor]) => {
      if (clave === 'id') return;
      const col = document.createElement('div');
      col.className = 'col-md-3';
      col.innerHTML = `<label class="form-label">${clave.replace(/_/g, ' ').toUpperCase()}</label><input class="form-control" value="${valor}" disabled>`;
      contenedor.appendChild(col);
    });
  };

  // Agrega el alimento seleccionado a su grupo
  window.agregarAlimento = function () {
    const tipo = document.getElementById('tipo-comida').value;
    const a = window.alimentoActual;
    const cantidad = parseFloat(document.getElementById('gramos').value);
    if (!cantidad || cantidad <= 0 || !a || !tipo) return alert('Completá todos los campos.');

    const factor = cantidad / 100;
    window.alimentosSeleccionados[tipo].push({ ...a, cantidad, unidad: 'g', factor });
    actualizarTabla(tipo);
  };

  // Actualiza la tabla de un grupo de comida
  function actualizarTabla(tipo) {
    const contenedor = document.getElementById(`lista-${tipo}`);
    contenedor.innerHTML = `
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead><tr id="header-${tipo}"></tr></thead>
          <tbody id="body-${tipo}"></tbody>
        </table>
      </div>
    `;

    // Header
    const headerRow = document.getElementById(`header-${tipo}`);
    headerRow.innerHTML = '<th>Acciones</th><th>ALIMENTO</th><th>CANTIDAD</th>';
    columnas.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.replace(/_/g, ' ').toUpperCase();
      headerRow.appendChild(th);
    });

    // Body
    const cuerpo = document.getElementById(`body-${tipo}`);
    window.alimentosSeleccionados[tipo].forEach((a, i) => {
      let fila = `<tr>
        <td>
          <button class='btn btn-warning btn-sm me-1' onclick='modificarCantidad("${tipo}", ${i})'>✏️</button>
          <button class='btn btn-danger btn-sm' onclick='eliminarAlimento("${tipo}", ${i})'>❌</button>
        </td>
        <td title="${a.alimento}">${a.alimento}</td>
        <td>${a.cantidad} ${a.unidad}</td>`;
      columnas.forEach(k => {
        const valorNumerico = convertirANumero(a[k]) * a.factor;
        fila += `<td>${isNaN(valorNumerico) ? '-' : valorNumerico.toFixed(1)}</td>`;
      });
      fila += '</tr>';
      cuerpo.innerHTML += fila;
    });

    // Subtotal y botón PDF
    const subtotal = { calorias:0, hc:0, proteinas:0, grasas:0 };
    window.alimentosSeleccionados[tipo].forEach(a => {
      subtotal.calorias += convertirANumero(a.valor_energetico) * a.factor;
      subtotal.hc       += convertirANumero(a.carbohidratos_disponibles) * a.factor;
      subtotal.proteinas+= convertirANumero(a.proteinas) * a.factor;
      subtotal.grasas   += convertirANumero(a.lipidos_totales) * a.factor;
    });

    contenedor.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mt-2">
        <div class="fw-bold">
          Subtotal: ${subtotal.calorias.toFixed(1)} cal |
          ${subtotal.hc.toFixed(1)}g HC |
          ${subtotal.proteinas.toFixed(1)}g Prot |
          ${subtotal.grasas.toFixed(1)}g Grasas
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="exportarGrupoAPDF('${tipo}')">📄 Exportar a PDF</button>
      </div>
    `;

    calcularTotales();
  }

  // Calcula totales generales y actualiza gráfico
  function calcularTotales() {
    const t = { calorias:0, hc:0, proteinas:0, grasas:0 };
    Object.values(window.alimentosSeleccionados).forEach(lista => {
      lista.forEach(a => {
        t.calorias   += convertirANumero(a.valor_energetico) * a.factor;
        t.hc         += convertirANumero(a.carbohidratos_disponibles) * a.factor;
        t.proteinas  += convertirANumero(a.proteinas) * a.factor;
        t.grasas     += convertirANumero(a.lipidos_totales) * a.factor;
      });
    });

    document.getElementById('totales').textContent =
      `Totales: ${t.calorias.toFixed(1)} cal | ${t.hc.toFixed(1)}g HC | ${t.proteinas.toFixed(1)}g Prot | ${t.grasas.toFixed(1)}g Grasas`;
    actualizarGrafico(t);
  }

  // Exporta un grupo a PDF
  window.exportarGrupoAPDF = function (tipo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text(`Listado de alimentos – ${tipo.toUpperCase()}`, 10, y);
    y += 10;

    const headers = ["Alimento", "Cantidad (g)", "Calorías", "HC", "Proteínas", "Grasas"];
    doc.setFontSize(10);
    doc.text(headers.join(" | "), 10, y);
    y += 7;

    window.alimentosSeleccionados[tipo].forEach(a => {
      const linea = [
        a.alimento.length > 30 ? a.alimento.slice(0,30)+'...' : a.alimento,
        a.cantidad,
        (convertirANumero(a.valor_energetico)*a.factor).toFixed(1),
        (convertirANumero(a.carbohidratos_disponibles)*a.factor).toFixed(1),
        (convertirANumero(a.proteinas)*a.factor).toFixed(1),
        (convertirANumero(a.lipidos_totales)*a.factor).toFixed(1)
      ].join(' | ');
      doc.text(linea, 10, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 10; }
    });

    const subtotal = { cal:0, hc:0, prot:0, grasa:0 };
    window.alimentosSeleccionados[tipo].forEach(a => {
      subtotal.cal   += convertirANumero(a.valor_energetico)*a.factor;
      subtotal.hc    += convertirANumero(a.carbohidratos_disponibles)*a.factor;
      subtotal.prot  += convertirANumero(a.proteinas)*a.factor;
      subtotal.grasa += convertirANumero(a.lipidos_totales)*a.factor;
    });

    y += 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${subtotal.cal.toFixed(1)} cal | ${subtotal.hc.toFixed(1)}g HC | ${subtotal.prot.toFixed(1)}g Prot | ${subtotal.grasa.toFixed(1)}g Grasas`, 10, y);
    doc.save(`${tipo}_nutricion.pdf`);
  };

  // Elimina un alimento de un grupo
  window.eliminarAlimento = function (tipo, index) {
    window.alimentosSeleccionados[tipo].splice(index, 1);
    actualizarTabla(tipo);
  };

  // Modifica la cantidad de un alimento
  window.modificarCantidad = function (tipo, index) {
    const nueva = prompt("Ingresá nueva cantidad:", window.alimentosSeleccionados[tipo][index].cantidad);
    if (nueva && !isNaN(nueva) && nueva > 0) {
      window.alimentosSeleccionados[tipo][index].cantidad = parseFloat(nueva);
      window.alimentosSeleccionados[tipo][index].factor = nueva / 100;
      actualizarTabla(tipo);
    }
  };

  // Toggle de detalles nutricionales
  const toggleBtn = document.getElementById('toggle-detalle');
  const detalleAlimento = document.getElementById('detalle-alimento');
  toggleBtn.addEventListener('click', () => {
    const activo = detalleAlimento.classList.toggle('activo');
    toggleBtn.textContent = activo ? 'Ocultar detalles nutricionales' : 'Mostrar detalles nutricionales';
  });

  // Actualiza el gráfico circular
  function actualizarGrafico(t) {
    const ctx = document.getElementById('graficoCircular').getContext('2d');
    if (graficoMacros) graficoMacros.destroy();
    graficoMacros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Carbohidratos','Proteínas','Grasas'],
        datasets: [{ data: [t.hc, t.proteinas, t.grasas], backgroundColor: ['#ffc107','#198754','#dc3545'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });

    document.getElementById('pctCarbs').textContent      = Math.round(t.hc / macrosObjetivo.hc * 100) + '%';
    document.getElementById('pctProteinas').textContent  = Math.round(t.proteinas / macrosObjetivo.proteinas * 100) + '%';
    document.getElementById('pctGrasas').textContent     = Math.round(t.grasas / macrosObjetivo.grasas * 100) + '%';
    document.getElementById('carbsRestantes').textContent= (macrosObjetivo.hc - t.hc).toFixed(1) + 'g restantes';
    document.getElementById('proteinasRestantes').textContent = (macrosObjetivo.proteinas - t.proteinas).toFixed(1) + 'g restantes';
    document.getElementById('grasasRestantes').textContent    = (macrosObjetivo.grasas - t.grasas).toFixed(1) + 'g restantes';
    document.getElementById('calorias-restantes').innerHTML   = `Todavía puedes comer <strong>${(macrosObjetivo.calorias - t.calorias).toFixed(0)}</strong> calorías`;
  }

  // — Exponer actualizarTabla globalmente para el menú flotante —
  window.actualizarTabla = actualizarTabla;

  // Ejecuta la primera carga de alimentos
  cargarAlimentos();
});

// — Funciones globales de interacción con los grupos fuera del DOMContentLoaded —
function toggleGrupo(tipo) {
  document.getElementById(`lista-${tipo}`).classList.toggle('d-none');
}

function toggleTodosLosGrupos() {
  ['desayuno','media_manana','almuerzo','merienda','cena','colacion'].forEach(g =>
    document.getElementById(`lista-${g}`).classList.toggle('d-none')
  );
}

// — Menú flotante — 

function toggleMenu() {
  const menu = document.getElementById("menu-flotante");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

function guardarDietaPrompt() {
  const nombre = prompt("¿Nombre de la dieta?");
  if (nombre) {
    localStorage.setItem(nombre, JSON.stringify(window.alimentosSeleccionados));
    alert("Dieta guardada.");
  }
}

function cargarDietaPrompt() {
  const nombre = prompt("¿Nombre de la dieta a cargar?");
  const data = localStorage.getItem(nombre);
  if (!data) {
    alert("No se encontró esa dieta.");
    return;
  }
  window.alimentosSeleccionados = JSON.parse(data);
  // Actualizar cada tabla ya expuesta globalmente
  Object.keys(window.alimentosSeleccionados).forEach(tipo => {
    window.actualizarTabla(tipo);
  });
  alert("Dieta cargada.");
}

function verDietas() {
  const claves = Object.keys(localStorage);
  if (claves.length === 0) {
    alert("No hay dietas guardadas.");
    return;
  }
  alert("Dietas guardadas:\n" + claves.join("\n"));
}

function eliminarDietaPrompt() {
  const nombre = prompt("¿Nombre de la dieta a eliminar?");
  if (!nombre) return;
  if (localStorage.getItem(nombre)) {
    localStorage.removeItem(nombre);
    alert(`Dieta "${nombre}" eliminada.`);
  } else {
    alert("No se encontró esa dieta.");
  }
}
