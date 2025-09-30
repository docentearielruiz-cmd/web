/* =========================
   ESTRUCTURA GENERAL
   =========================
   - Aquí definimos "ejercicios" como objetos con:
     { id, title, desc, inputs: [...], handler: function }
   - La función setExercise(cId) carga el ejercicio en la UI.
   - runExercise() lee los valores de las entradas y llama al handler.
   - iniciarNuevamente() limpia UI y estado.
*/

/* Estado global del entorno */
let currentExercise = null;
let state = {}; // espacio para que el handler guarde información (por ejemplo, lista de números)

/* -------------------------
   Definición de ejercicios
   -------------------------
   Aquí agregas nuevos ejercicios como objetos.
*/
const exercises = [
  {
    id: 'numeros-hasta-cero',
    title: 'Leer números hasta que se ingrese 0',
    desc: 'Ingrese uno a uno los números. El programa guardará los números hasta que se ingrese 0; al hacerlo, mostrará la lista completa y un resumen (cantidad, suma, promedio).',
    // inputs: lista de controles que queremos mostrar
    inputs: [
      { name: 'numero', type: 'number', label: 'Ingrese un número:' }
    ],
    // handler: recibe un objeto con los valores de los inputs y retorna texto para mostrar en resultado.
    handler: function(values, state) {
      // state.numeros es la lista acumulada
      if (!state.numeros) state.numeros = [];

      let n = parseFloat(values.numero);
      if (isNaN(n)) return { finished: false, text: '⚠️ Ingrese un número válido.' };

      if (n === 0) {
        // finalizar: mostrar resumen
        const lista = state.numeros.slice(); // copia
        const cantidad = lista.length;
        const suma = lista.reduce((a,b)=>a+b,0);
        const promedio = cantidad > 0 ? (suma / cantidad).toFixed(2) : 0;
        const texto = `Programa finalizado. Números ingresados: ${lista.join(', ') || '(ninguno)'}.
Cantidad: ${cantidad}. Suma: ${suma}. Promedio: ${promedio}.`;
        // reset state for next run
        state.numeros = [];
        return { finished: true, text: texto };
      } else {
        // almacenar y continuar
        state.numeros.push(n);
        const tipo = n > 0 ? 'POSITIVO' : 'NEGATIVO';
        return { finished: false, text: `Número ${n} almacenado → ${tipo}. Ingrese otro o 0 para terminar.`};
      }
    }
  },

  /* Puedes añadir más ejercicios aquí. Ejemplo (plantilla):
  {
    id: 'ejemplo-par-impar',
    title: 'Determinar par o impar',
    desc: 'Ingrese un número y el programa dirá si es par o impar.',
    inputs: [{ name:'numero', type:'number', label:'Número:' }],
    handler: function(values, state) {
      let n = parseInt(values.numero, 10);
      if (isNaN(n)) return { finished:false, text:'Ingrese un número válido.' };
      return { finished:true, text: (n % 2 === 0) ? 'Es PAR' : 'Es IMPAR' };
    }
  }
  */
];

/* -------------------------
   Funciones de la UI
   ------------------------- */

function setExercise(id) {
  const ex = exercises.find(e => e.id === id);
  if (!ex) return console.error('Ejercicio no encontrado:', id);
  currentExercise = ex;

  // Título y descripción
  document.getElementById('exercise-title').innerText = ex.title;
  document.getElementById('exercise-desc').innerText = ex.desc;

  // Generar inputs
  const container = document.getElementById('inputs-container');
  container.innerHTML = ''; // limpiar
  ex.inputs.forEach(input => {
    const row = document.createElement('div');
    row.className = 'input-row';
    const label = document.createElement('label');
    label.setAttribute('for', input.name);
    label.innerText = input.label || input.name;
    row.appendChild(label);

    let control;
    if (input.type === 'textarea') {
      control = document.createElement('textarea');
      control.rows = input.rows || 3;
    } else {
      control = document.createElement('input');
      control.type = input.type || 'text';
    }
    control.id = input.name;
    control.name = input.name;
    if (input.placeholder) control.placeholder = input.placeholder;
    row.appendChild(control);
    container.appendChild(row);
  });

  // limpiar resultado y estado local del ejercicio
  iniciarNuevamente(false); // false = no limpiar la UI de título
}

/* Ejecutar el ejercicio actual (invocado por onclick) */
function runExercise() {
  if (!currentExercise) return alert('No hay ejercicio cargado.');

  // Recopilar valores de inputs
  const values = {};
  currentExercise.inputs.forEach(inp => {
    const el = document.getElementById(inp.name);
    values[inp.name] = el ? el.value : '';
  });

  // llamar al handler
  const res = currentExercise.handler(values, state);

  // Mostrar resultado
  const resultadoDiv = document.getElementById('resultado');
  resultadoDiv.innerText = res.text || '';

  // Si el handler indica finished === true, opcionalmente se puede bloquear o resetear entradas.
  if (res.finished) {
    // por ejemplo, dejamos las entradas limpias y deshabilitamos el botón ejecutar hasta reiniciar
    currentExercise.inputs.forEach(inp => {
      const el = document.getElementById(inp.name);
      if (el) { el.value = ''; }
    });
  } else {
    // si no terminó, dejamos la caja número seleccionada y vacía para la siguiente entrada (UX)
    const firstInput = document.getElementById(currentExercise.inputs[0].name);
    if (firstInput) {
      firstInput.value = '';
      firstInput.focus();
    }
  }
}

/* Limpiar todo: inputs, resultado y estado */
function iniciarNuevamente(clearHeader = true) {
  // limpiar valores de inputs
  if (currentExercise) {
    currentExercise.inputs.forEach(inp => {
      const el = document.getElementById(inp.name);
      if (el) el.value = '';
    });
  }
  // limpiar resultado
  document.getElementById('resultado').innerText = '';
  // reset estado global
  state = {};
  // opcional: reset header/title (por defecto true)
  if (clearHeader && currentExercise) {
    // no hacemos nada para mantener título; si quisieras, podrías resetear
  }
}

/* -------------------------
   Inicialización: cargar ejercicio por defecto
   ------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  // Cargar el ejercicio por defecto (puedes cambiar el id)
  setExercise('numeros-hasta-cero');
});
