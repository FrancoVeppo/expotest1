// (VARIABLES GLOBALES)
let preguntasSeleccionadas = [];
let indicePregunta = 0;
let tiempo = 60;
let temporizador;
let aciertos = 0;
let errores = 0;
let nombreJugadorActual = "";
let dniActual = "";
let dificultadActual = "";

// --- ¡¡¡IMPORTANTE!!! ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHqQr_sOhykx3WNXjQeUd4I9l-KBTH4tCwIcZaT0nbIXV9zrS7EQcC0KSS_m4-7RYqkQ/exec"; // <-- NO OLVIDES PONER TU URL

// --- REFERENCIAS A PANTALLAS ---
const pantallaDificultad = document.getElementById("pantalla-dificultad");
const pantallaCategorias = document.getElementById("pantalla-categorias");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaFinal = document.getElementById("pantalla-final");
const pantallaRanking = document.getElementById("pantalla-ranking");


// --- EVENT LISTENERS ---
document.getElementById("facil").addEventListener("click", () => preIniciarJuego(5, "Fácil"));
document.getElementById("medio").addEventListener("click", () => preIniciarJuego(10, "Medio"));
document.getElementById("dificil").addEventListener("click", mostrarCategorias);
document.getElementById("ver-ranking").addEventListener("click", mostrarRanking);
document.getElementById("boton-volver-menu").addEventListener("click", volverAlMenu);
document.getElementById("boton-volver-ranking").addEventListener("click", volverADificultad);
document.getElementById("boton-volver-dificultad").addEventListener("click", volverADificultad);

// Añadir listeners para los botones de categoría
document.querySelectorAll('.btn-categoria').forEach(button => {
  button.addEventListener('click', (event) => {
    const categoriaSeleccionada = event.target.getAttribute('data-categoria');
    // --- ¡¡CAMBIO AQUÍ!! --- Pide 30 preguntas para Difícil
    preIniciarJuego(30, "Difícil", categoriaSeleccionada);
  });
});

document.addEventListener("DOMContentLoaded", mostrarRankingInicio);


// --- ALGORITMO FISHER-YATES ---
function barajarArray(array) {
  let arrayCopia = [...array];
  for (let i = arrayCopia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopia[i], arrayCopia[j]] = [arrayCopia[j], arrayCopia[i]];
  }
  return arrayCopia;
}

// --- NUEVA FUNCIÓN INTERMEDIA: Verifica datos antes de verificar DNI o mostrar categorías ---
function preIniciarJuego(cantidad, nombreDificultad, categoria = null) {
  nombreJugadorActual = document.getElementById("nombre-jugador").value.trim();
  dniActual = document.getElementById("documento-jugador").value.trim();
  dificultadActual = nombreDificultad;

  if (nombreJugadorActual === "" || dniActual === "") {
    alert("Por favor, ingresa tu nombre Y tu DNI.");
    return;
  }

  // Ahora, verifica el DNI antes de empezar el juego
  verificarDNIYContinuar(cantidad, nombreDificultad, categoria);
}

// --- NUEVA FUNCIÓN: Muestra la pantalla de categorías ---
function mostrarCategorias() {
  nombreJugadorActual = document.getElementById("nombre-jugador").value.trim();
  dniActual = document.getElementById("documento-jugador").value.trim();
  dificultadActual = "Difícil"; // Ya sabemos que es difícil

  if (nombreJugadorActual === "" || dniActual === "") {
    alert("Por favor, ingresa tu nombre Y tu DNI antes de elegir categoría.");
    return;
  }

  // Oculta dificultad, muestra categorías
  pantallaDificultad.style.display = "none";
  pantallaCategorias.style.display = "block"; // Debería ser flex o grid según tu CSS
}

// --- FUNCIÓN MODIFICADA: Verifica DNI y luego decide si iniciar o mostrar error ---
function verificarDNIYContinuar(cantidad, nombreDificultad, categoria = null) {
  const botonesDificultad = document.querySelectorAll("#pantalla-dificultad button, #pantalla-categorias button");
  botonesDificultad.forEach(btn => btn.disabled = true);

  // Mostrar feedback visual (opcional)
  let h1Dificultad = pantallaDificultad.querySelector("h1");
  let h1Categorias = pantallaCategorias.querySelector("h1");
  if (h1Dificultad) h1Dificultad.textContent = "Verificando DNI...";
  if (h1Categorias) h1Categorias.textContent = "Verificando DNI...";

  fetch(GOOGLE_SCRIPT_URL + "?codigo=" + encodeURIComponent(dniActual))
    .then(response => response.json())
    .then(data => {
      botonesDificultad.forEach(btn => btn.disabled = false);
      if (h1Dificultad) h1Dificultad.textContent = "Elige la dificultad";
      if (h1Categorias) h1Categorias.textContent = "Elige una Categoría (Difícil)";

      if (data.status === "usado") {
        alert("Este DNI ya fue utilizado. Solo se permite un intento por persona.");
        volverADificultad(); // Vuelve a la pantalla inicial si el DNI está usado
      } else if (data.status === "no_usado") {
        // --- DNI VÁLIDO ---
        iniciarJuego(cantidad, nombreDificultad, categoria); // Llama a la función que REALMENTE inicia
      } else {
        throw new Error(data.message || "Error desconocido al verificar el DNI.");
      }
    })
    .catch(error => {
      console.error("Error al verificar DNI:", error);
      alert("Error de red. No se pudo verificar tu DNI. Revisa la conexión e inténtalo de nuevo.");
      botonesDificultad.forEach(btn => btn.disabled = false);
      if (h1Dificultad) h1Dificultad.textContent = "Elige la dificultad";
      if (h1Categorias) h1Categorias.textContent = "Elige una Categoría (Difícil)";
    });
}
// --- FUNCIÓN MODIFICADA: Ahora recibe categoría y selecciona las preguntas ---
function iniciarJuego(cantidad, nombreDificultad, categoria = null) {

  // Selección de preguntas basada en dificultad y categoría
  if (nombreDificultad === "Difícil" && categoria) {
    if (categoria === "aleatorio") {
       // Mezcla todas las preguntas de todas las categorías
      const todasLasPreguntas = Object.values(preguntasPorCategoria).flat();
      preguntasSeleccionadas = barajarArray(todasLasPreguntas).slice(0, cantidad);
    } else if (preguntasPorCategoria[categoria]) {
      // Selecciona de la categoría específica
      preguntasSeleccionadas = barajarArray(preguntasPorCategoria[categoria]).slice(0, cantidad);
    } else {
      console.error("Categoría no encontrada:", categoria);
      alert("Error: Categoría no válida. Se usarán preguntas aleatorias.");
      // Fallback a aleatorio si la categoría es inválida
      const todasLasPreguntas = Object.values(preguntasPorCategoria).flat();
      preguntasSeleccionadas = barajarArray(todasLasPreguntas).slice(0, cantidad);
    }
  } else {
    // Para Fácil y Medio, usa la lista global 'preguntas' (mezcla de todo)
    preguntasSeleccionadas = barajarArray(preguntas).slice(0, cantidad);
  }

  // Asegurarse de que tenemos suficientes preguntas
  if(preguntasSeleccionadas.length < cantidad) {
      // Mostramos una advertencia MÁS específica
      alert(`Advertencia: Solo se encontraron ${preguntasSeleccionadas.length} preguntas para esta selección (se necesitan ${cantidad}). Asegúrate de tener suficientes en js/preguntas.js`);
      cantidad = preguntasSeleccionadas.length; // Ajusta la cantidad si no hay suficientes
      if (cantidad === 0) {
          alert("Error crítico: No hay preguntas disponibles para esta categoría/dificultad. Volviendo al inicio.");
          volverADificultad();
          return;
      }
  }


  // Ocultar pantallas y mostrar juego
  pantallaDificultad.style.display = "none";
  pantallaCategorias.style.display = "none";
  pantallaJuego.style.display = "block"; // O 'flex' si tu CSS lo requiere

  indicePregunta = 0;
  aciertos = 0;
  errores = 0;
  mostrarPregunta(indicePregunta);
}


function mostrarPregunta(indice) {
  // --- Esta función no cambia internamente ---
  if (indice >= preguntasSeleccionadas.length) {
    finalizarJuego();
    return;
  }

  const preguntaEl = document.getElementById("pregunta");
  const opcionesDiv = document.getElementById("opciones");

  const preguntaActual = preguntasSeleccionadas[indice];
  preguntaEl.textContent = preguntaActual.pregunta;
  opcionesDiv.innerHTML = "";

  preguntaActual.opciones.forEach(opcion => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.addEventListener("click", () => seleccionarOpcion(opcion, btn));
    opcionesDiv.appendChild(btn);
  });

  clearInterval(temporizador);
  tiempo = 10;
  document.getElementById("tiempo").textContent = tiempo;
  temporizador = setInterval(() => {
    tiempo--;
    document.getElementById("tiempo").textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(temporizador);
      seleccionarOpcion(null);
    }
  }, 1000);

  preguntaEl.style.animation = 'fadeIn 0.4s ease-out forwards';
  opcionesDiv.style.animation = 'fadeIn 0.4s ease-out forwards';
}

function seleccionarOpcion(opcion, boton = null) {
  // --- Esta función no cambia internamente ---
  clearInterval(temporizador);
  const correcta = preguntasSeleccionadas[indicePregunta].correcta;
  const botones = document.querySelectorAll("#opciones button");

  botones.forEach(b => {
    b.disabled = true;
    if (b.textContent === correcta) b.classList.add("correcta");
    else if (b === boton) b.classList.add("incorrecta");
  });

  if (opcion === correcta) {
    aciertos++;

    if (typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, drift: 0.1 });
    }

  } else {
    errores++;
  }

  const preguntaEl = document.getElementById("pregunta");
  const opcionesEl = document.getElementById("opciones");

  setTimeout(() => {
    preguntaEl.style.animation = 'fadeOut 0.4s ease-out forwards';
    opcionesEl.style.animation = 'fadeOut 0.4s ease-out forwards';

    setTimeout(() => {
      indicePregunta++;
      mostrarPregunta(indicePregunta);
    }, 400);

  }, 1200);
}

function finalizarJuego() {
  // --- Esta función no cambia internamente ---
  pantallaJuego.style.display = "none";
  pantallaFinal.style.display = "block";
  pantallaFinal.innerHTML = `<h1>Guardando tu puntaje...</h1>`;

  let total = preguntasSeleccionadas.length;
  let porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

  const datosDelJuego = {
    nombre: nombreJugadorActual,
    aciertos: aciertos,
    porcentaje: porcentaje,
    codigo: dniActual,
    dificultad: dificultadActual,
    totalPreguntas: total
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    // NO headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosDelJuego),
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      pantallaFinal.innerHTML = `
        <h1>¡Juego terminado, ${nombreJugadorActual}!</h1>
        <p>Tu puntaje fue enviado con éxito.</p>
        <p>Respuestas correctas: ${aciertos} de ${total}</p>
        <p>Porcentaje de aciertos: ${porcentaje}%</p>
        <p>¡Mucha suerte en el sorteo!</p>
        <button id="boton-reiniciar">Volver al inicio</button>
      `;
    } else {
      throw new Error(data.message || 'Error desconocido al guardar.');
    }
    // Añadir listener al nuevo botón
     const botonReiniciar = document.getElementById("boton-reiniciar");
     if(botonReiniciar) botonReiniciar.addEventListener("click", volverADificultad);
  })
  .catch(error => {
    console.error('Error al enviar puntaje:', error);
    pantallaFinal.innerHTML = `
      <h1>¡Ups! Hubo un error de conexión</h1>
      <p>No pudimos guardar tu puntaje. Revisa tu conexión e inténtalo de nuevo.</p>
      <button id="boton-reiniciar">Volver al inicio</button>
    `;
     // Añadir listener al nuevo botón incluso en caso de error
     const botonReiniciar = document.getElementById("boton-reiniciar");
     if(botonReiniciar) botonReiniciar.addEventListener("click", volverADificultad);
  });
}

// --- FUNCIONES DE NAVEGACIÓN (Actualizadas) ---

// Ya no se llama reiniciarJuego, es volver a la pantalla principal
function volverADificultad() {
  aciertos = 0;
  errores = 0;
  indicePregunta = 0;
  nombreJugadorActual = "";
  dniActual = "";
  dificultadActual = "";

  // Ocultar todas las pantallas excepto la de dificultad
  pantallaCategorias.style.display = "none";
  pantallaJuego.style.display = "none";
  pantallaFinal.style.display = "none";
  pantallaRanking.style.display = "none";
  pantallaDificultad.style.display = "block"; // O 'flex' si tu CSS lo requiere

  // Limpia los campos
  document.getElementById("nombre-jugador").value = "";
  document.getElementById("documento-jugador").value = "";

  // Actualiza el ranking
  mostrarRankingInicio();
}

// Volver al menú desde el juego
function volverAlMenu() {
  clearInterval(temporizador); // Detiene el timer si estaba corriendo
  volverADificultad(); // Llama a la función principal de reseteo
}


function mostrarRanking() {
  // Ocultar otras pantallas
  pantallaDificultad.style.display = "none";
  pantallaCategorias.style.display = "none";
  pantallaRanking.style.display = "block"; // Mostrar ranking

  const listaRanking = document.getElementById("lista-ranking");
  listaRanking.innerHTML = "<li>Cargando ranking...</li>";

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success' && result.data.length > 0) {
        var topPuntajes = result.data;

        listaRanking.innerHTML = topPuntajes.map(p => {
            let porcentaje = p.porcentaje;
            let dificultad = p.dificultad || '...';
            let totalPreg = p.totalPreguntas || '...';

            return `<li>${p.nombre}: ${p.aciertos} de ${totalPreg} (${dificultad}) - ${porcentaje}%</li>`;
          }).join('');

      } else if (result.data.length === 0) {
        listaRanking.innerHTML = "<li>Aún no hay puntajes.</li>";
      } else {
        throw new Error(result.message || 'Error al cargar ranking');
      }
    })
    .catch(error => {
      console.error("Error al cargar ranking:", error);
      listaRanking.innerHTML = `<li>Error al cargar ranking.</li>`;
    });
}


function mostrarRankingInicio() {
  // --- Esta función no cambia internamente ---
  const listaRanking = document.getElementById("lista-ranking-inicio");
  listaRanking.innerHTML = "<li>Cargando ranking...</li>";

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success' && result.data.length > 0) {
        var topPuntajes = result.data;

        listaRanking.innerHTML = topPuntajes.map(p => {
            let porcentaje = p.porcentaje;
            let dificultad = p.dificultad || '';
            let totalPreg = p.totalPreguntas || 0;

            let textoAciertos = (totalPreg > 0) ?
              `${p.aciertos} de ${totalPreg} (${dificultad})` :
              `${p.aciertos} aciertos`;

            return `
              <li>
                <strong>${p.nombre}</strong>
                <small>${textoAciertos}</small>
                <div class="barra-progreso">
                  <div class="barra-progreso-fill" style="width: ${porcentaje}%;">
                    ${porcentaje}%
                  </div>
                </div>
              </li>
            `;
          }).join('');

      } else if (result.data.length === 0) {
        listaRanking.innerHTML = "<li>Aún no hay puntajes. ¡Sé el primero!</li>";
      } else {
        throw new Error(result.message || 'Error al cargar ranking');
      }
    })
    .catch(error => {
      console.error("Error al cargar ranking:", error);
      listaRanking.innerHTML = `<li>Error al cargar ranking.</li>`;
    });
}
