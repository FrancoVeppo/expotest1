let preguntasSeleccionadas = [];
let indicePregunta = 0;
let tiempo = 60;
let temporizador;
let aciertos = 0;
let errores = 0;

// --- VARIABLES DE JUGADOR Y RANKING ---
let nombreJugadorActual = "";
// Carga los puntajes guardados o crea un array vacío
let puntajes = JSON.parse(localStorage.getItem("rankingTrivia")) || [];


// --- DIFICULTAD Y NAVEGACIÓN ---
document.getElementById("facil").addEventListener("click", () => iniciarJuego(5));
document.getElementById("medio").addEventListener("click", () => iniciarJuego(10));
document.getElementById("dificil").addEventListener("click", () => iniciarJuego(20));
document.getElementById("ver-ranking").addEventListener("click", mostrarRanking);
document.getElementById("boton-volver-menu").addEventListener("click", volverAlMenu);


// --- ALGORITMO FISHER-YATES (Mejor aleatoriedad) ---
function barajarArray(array) {
  let arrayCopia = [...array]; // Copiar para no modificar el array original
  for (let i = arrayCopia.length - 1; i > 0; i--) {
    // Genera un índice aleatorio entre 0 e i
    const j = Math.floor(Math.random() * (i + 1));
    // Intercambia los elementos
    [arrayCopia[i], arrayCopia[j]] = [arrayCopia[j], arrayCopia[i]];
  }
  return arrayCopia;
}

// --- FUNCIONES DEL JUEGO ---
function iniciarJuego(cantidad) {
  // Captura el nombre del jugador y quita espacios en blanco
  nombreJugadorActual = document.getElementById("nombre-jugador").value.trim();
  
  // --- VALIDACIÓN AÑADIDA ---
  if (nombreJugadorActual === "") {
    alert("Por favor, ingresa un nombre para jugar.");
    return; // Detiene la ejecución si no hay nombre
  }
  // --- FIN DE LA VALIDACIÓN ---

  // Usa el nuevo algoritmo para barajar
  preguntasSeleccionadas = barajarArray(preguntas).slice(0, cantidad);
  
  document.getElementById("pantalla-dificultad").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  indicePregunta = 0;
  aciertos = 0; // Reinicia contadores para la nueva partida
  errores = 0;
  mostrarPregunta(indicePregunta);
}

function mostrarPregunta(indice) {
  if (indice >= preguntasSeleccionadas.length) {
    finalizarJuego();
    return;
  }

  const preguntaActual = preguntasSeleccionadas[indice];
  document.getElementById("pregunta").textContent = preguntaActual.pregunta;

  const opcionesDiv = document.getElementById("opciones");
  opcionesDiv.innerHTML = "";

  preguntaActual.opciones.forEach(opcion => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.addEventListener("click", () => seleccionarOpcion(opcion, btn));
    opcionesDiv.appendChild(btn);
  });

  // Temporizador
  clearInterval(temporizador);
  tiempo = 60;
  document.getElementById("tiempo").textContent = tiempo;
  temporizador = setInterval(() => {
    tiempo--;
    document.getElementById("tiempo").textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(temporizador);
      seleccionarOpcion(null); // Se acaba el tiempo, cuenta como error
    }
  }, 1000);
}

function seleccionarOpcion(opcion, boton = null) {
  clearInterval(temporizador);
  const correcta = preguntasSeleccionadas[indicePregunta].correcta;

  const botones = document.querySelectorAll("#opciones button");
  botones.forEach(b => {
    b.disabled = true; // Deshabilitar botones después de elegir
    if (b.textContent === correcta) b.style.backgroundColor = "green"; // Correcto
    else if (b === boton) b.style.backgroundColor = "red"; // Equivocada
  });

  // Contar aciertos y errores
  if (opcion === correcta) aciertos++;
  else errores++;

  // Esperar 1.2 segundos para mostrar siguente pregunta
  setTimeout(() => {
    indicePregunta++;
    mostrarPregunta(indicePregunta);
  }, 1200);
}

function finalizarJuego() {
  document.getElementById("pantalla-juego").style.display = "none";
  const pantallaFinal = document.getElementById("pantalla-final");
  pantallaFinal.style.display = "block";

  let total = aciertos + errores;
  // Evitar división por cero si el juego termina sin preguntas
  let porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

  // Guardar puntaje en ranking (con nombre)
  puntajes.push({ nombre: nombreJugadorActual, aciertos, errores, porcentaje });
  
  // Ordenar el ranking por porcentaje (de mayor a menor)
  puntajes.sort((a, b) => b.porcentaje - a.porcentaje);
  
  // Guardar el ranking actualizado en localStorage
  localStorage.setItem("rankingTrivia", JSON.stringify(puntajes));

  pantallaFinal.innerHTML = `
    <h1>¡Juego terminado, ${nombreJugadorActual}!</h1>
    <p>Respuestas correctas: ${aciertos}</p>
    <p>Respuestas incorrectas: ${errores}</p>
    <p>Porcentaje de aciertos: ${porcentaje}%</p>
    <h3>Ranking Histórico:</h3>
    <ul id="lista-ranking-final">
      ${puntajes.map(p => `<li>${p.nombre}: ${p.aciertos} correctas - ${p.porcentaje}%</li>`).join('')}
    </ul>
    <button onclick="reiniciarJuego()">Volver a jugar</button>
  `;
}

function reiniciarJuego() {
  // No reseteamos 'puntajes' para que el ranking persista
  aciertos = 0;
  errores = 0;
  indicePregunta = 0;
  document.getElementById("pantalla-final").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
}

// --- FUNCIÓN AÑADIDA ---
function volverAlMenu() {
  // Parar el temporizador actual
  clearInterval(temporizador);
  
  // Ocultar pantalla de juego y mostrar la de dificultad
  document.getElementById("pantalla-juego").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
  
  // Limpiar el nombre del jugador para que pueda ingresar uno nuevo
  document.getElementById("nombre-jugador").value = ""; 
}


// --- FUNCIONES DE NAVEGACIÓN (Existentes) ---

function mostrarRanking() {
  document.getElementById("pantalla-dificultad").style.display = "none";
  document.getElementById("pantalla-ranking").style.display = "block";

  // Cargar puntajes (por si acaso se actualizó en otra pestaña)
  let puntajesGuardados = JSON.parse(localStorage.getItem("rankingTrivia")) || [];
  puntajesGuardados.sort((a, b) => b.porcentaje - a.porcentaje);

  const listaRanking = document.getElementById("lista-ranking");
  
  if (puntajesGuardados.length === 0) {
    listaRanking.innerHTML = "<li>Aún no hay puntajes guardados.</li>";
  } else {
    listaRanking.innerHTML = puntajesGuardados.map(p => 
      `<li>${p.nombre}: ${p.aciertos} correctas - ${p.porcentaje}%</li>`
    ).join('');
  }
}

function mostrarDificultad() {
  document.getElementById("pantalla-ranking").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
}