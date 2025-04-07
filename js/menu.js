// © 2025 Ramón Adrian Avalos Verá (GitHub: Adrian-Avalos)
// Prohibida la copia o uso comercial sin autorización.
let alimentosSeleccionados = [], grafico = null;
const macrosObjetivo = { calorias: 2488, hc: 311, proteinas: 124, grasas: 82 };

function abrirModal() {
  new bootstrap.Modal(document.getElementById('modalAgregar')).show();
}

function cargarAlimentos() {
  const categoria = document.getElementById('categoria').value;
  const select = document.getElementById('alimento-select');
  select.innerHTML = '<option value="">Seleccioná un alimento</option>';
  if (!categoria || !baseDatos[categoria]) return;
  Object.keys(baseDatos[categoria]).forEach(nombre => {
    const opt = document.createElement('option');
    opt.value = nombre;
    opt.textContent = nombre;
    select.appendChild(opt);
  });
}

function filtrarAlimentos() {
  cargarAlimentos();
}

function mostrarDatosAlimento() {
  const categoria = document.getElementById('categoria').value;
  const nombre = document.getElementById('alimento-select').value;
  const contenedor = document.getElementById('detalle-alimento');
  contenedor.innerHTML = '';
  if (!categoria || !nombre) return;
  const a = baseDatos[categoria][nombre];
  Object.entries(a).forEach(([k, v]) => {
    const col = document.createElement('div');
    col.className = 'col-md-3';
    col.innerHTML = `<label class="form-label">${k.toUpperCase()}</label><input class="form-control" value="${v}" disabled>`;
    contenedor.appendChild(col);
  });
}

function agregarAlimento() {
  const categoria = document.getElementById('categoria').value;
  const nombre = document.getElementById('alimento-select').value;
  const cantidad = parseFloat(document.getElementById('gramos').value);
  if (!cantidad || cantidad <= 0 || !nombre) return alert('Completá todos los campos.');
  const a = baseDatos[categoria][nombre];
  const factor = cantidad / a.medida;
  alimentosSeleccionados.push({ nombre, cantidad, unidad: a.unidad, ...a, factor });
  actualizarTabla();
}

function eliminarAlimento(index) {
  alimentosSeleccionados.splice(index, 1);
  actualizarTabla();
}

function modificarCantidad(index) {
  const nueva = prompt("Ingresá nueva cantidad:", alimentosSeleccionados[index].cantidad);
  if (nueva && !isNaN(nueva) && nueva > 0) {
    alimentosSeleccionados[index].cantidad = parseFloat(nueva);
    alimentosSeleccionados[index].factor = nueva / alimentosSeleccionados[index].medida;
    actualizarTabla();
  }
}

function actualizarTabla() {
  const tabla = document.getElementById('tabla-alimentos');
  tabla.innerHTML = '';
  alimentosSeleccionados.forEach((a, i) => {
    tabla.innerHTML += `<tr>
      <td>${a.nombre}</td><td>${a.cantidad} ${a.unidad}</td><td>${(a.calorias*a.factor).toFixed(1)}</td><td>${(a.hc*a.factor).toFixed(1)}</td><td>${(a.proteinas*a.factor).toFixed(1)}</td><td>${(a.grasas*a.factor).toFixed(1)}</td>
      <td>${(a.na*a.factor).toFixed(1)}</td><td>${(a.k*a.factor).toFixed(1)}</td><td>${(a.p*a.factor).toFixed(1)}</td><td>${(a.ca*a.factor).toFixed(1)}</td><td>${(a.fe*a.factor).toFixed(1)}</td><td>${(a.colest*a.factor).toFixed(1)}</td>
      <td>${(a.purinas*a.factor).toFixed(1)}</td><td>${(a.fibra*a.factor).toFixed(1)}</td><td>${(a.agua*a.factor).toFixed(1)}</td><td>${(a.afolic*a.factor).toFixed(1)}</td>
      <td><button class='btn btn-warning btn-sm' onclick='modificarCantidad(${i})'>✏️</button><button class='btn btn-danger btn-sm' onclick='eliminarAlimento(${i})'>❌</button></td>
    </tr>`;
  });
  calcularTotales();
}

function calcularTotales() {
  const t = { calorias:0, hc:0, proteinas:0, grasas:0, na:0, k:0, p:0, ca:0, fe:0, colest:0, purinas:0, fibra:0, agua:0, afolic:0 };
  alimentosSeleccionados.forEach(a => {
    for (let k in t) t[k] += (a[k] || 0) * a.factor;
  });
  document.getElementById('totales').textContent =
    `Totales: ${t.calorias.toFixed(1)} cal | ${t.hc.toFixed(1)}g HC | ${t.proteinas.toFixed(1)}g Prot | ${t.grasas.toFixed(1)}g Grasas | ` +
    `${t.na.toFixed(1)}mg Na | ${t.k.toFixed(1)}mg K | ${t.p.toFixed(1)}mg P | ${t.ca.toFixed(1)}mg Ca | ${t.fe.toFixed(1)}mg Fe | ` +
    `${t.colest.toFixed(1)}mg Colest | ${t.purinas.toFixed(1)}mg Purinas | ${t.fibra.toFixed(1)}g Fibra | ${t.agua.toFixed(1)}g Agua | ${t.afolic.toFixed(1)}µg A.Fólic`;
  actualizarGrafico(t);
}

function actualizarGrafico(t) {
  const ctx = document.getElementById('graficoCircular').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Carbohidratos', 'Proteínas', 'Grasas'],
      datasets: [{ data: [t.hc, t.proteinas, t.grasas], backgroundColor: ['#ffc107', '#198754', '#dc3545'] }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  });
  document.getElementById('pctCarbs').textContent = Math.round(t.hc / macrosObjetivo.hc * 100) + '%';
  document.getElementById('pctProteinas').textContent = Math.round(t.proteinas / macrosObjetivo.proteinas * 100) + '%';
  document.getElementById('pctGrasas').textContent = Math.round(t.grasas / macrosObjetivo.grasas * 100) + '%';
  document.getElementById('carbsRestantes').textContent = (macrosObjetivo.hc - t.hc).toFixed(1) + 'g restantes';
  document.getElementById('proteinasRestantes').textContent = (macrosObjetivo.proteinas - t.proteinas).toFixed(1) + 'g restantes';
  document.getElementById('grasasRestantes').textContent = (macrosObjetivo.grasas - t.grasas).toFixed(1) + 'g restantes';
  document.getElementById('calorias-restantes').innerHTML = `Todavía puedes comer <strong>${(macrosObjetivo.calorias - t.calorias).toFixed(0)}</strong> calorías`;
}
