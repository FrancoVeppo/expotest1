// (VARIABLES GLOBALES)
let preguntasSeleccionadas = [];
let indicePregunta = 0;
let tiempo = 60;
let temporizador;
let aciertos = 0;
let errores = 0;
let nombreJugadorActual = "";
let dniActual = ""; // <--- Renombramos la variable

// --- ¡¡¡IMPORTANTE!!! ---
// Pega tu URL secreta (la que acabas de copiar) aquí abajo, entre las comillas.
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKpZxUhpwOFyyumBYhG8V5SABHU3NB3liBtdZjv5quuDRH6OcXjGx9WuZ9w37CwfnCfA/exec";


// --- DIFICULTAD Y NAVEGACIÓN ---
document.getElementById("facil").addEventListener("click", () => iniciarJuego(5));
document.getElementById("medio").addEventListener("click", () => iniciarJuego(10));
document.getElementById("dificil").addEventListener("click", () => iniciarJuego(20));
document.getElementById("ver-ranking").addEventListener("click", mostrarRanking);
document.getElementById("boton-volver-menu").addEventListener("click", volverAlMenu);
document.getElementById("boton-volver-ranking").addEventListener("click", mostrarDificultad);

// Al cargar la página, mostramos el ranking de Google
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

// --- FUNCIONES DEL JUEGO ---

// (Esta es la función que verifica el DNI)
function iniciarJuego(cantidad) {
  nombreJugadorActual = document.getElementById("nombre-jugador").value.trim();
  dniActual = document.getElementById("documento-jugador").value.trim(); // <--- Captura el DNI
  
  // 1. Validación básica (campos vacíos)
  if (nombreJugadorActual === "" || dniActual === "") {
    alert("Por favor, ingresa tu nombre Y tu DNI.");
    return; 
  }
  
  // 2. Deshabilitar botones para evitar doble clic
  const botonesDificultad = document.querySelectorAll("#pantalla-dificultad button");
  botonesDificultad.forEach(btn => btn.disabled = true);
  
  let h1 = document.querySelector("#pantalla-dificultad h1");
  h1.textContent = "Verificando DNI...";

  // 3. Verificación en tiempo real con Google (envía el DNI como "codigo")
  fetch(GOOGLE_SCRIPT_URL + "?codigo=" + encodeURIComponent(dniActual))
    .then(response => response.json())
    .then(data => {
      // 4. Re-habilitar botones y restaurar título
      botonesDificultad.forEach(btn => btn.disabled = false);
      h1.textContent = "Elige la dificultad";

      // 5. Decidir si se juega o no
      if (data.status === "usado") {
        alert("Este DNI ya fue utilizado. Solo se permite un intento por persona.");
      
      } else if (data.status === "no_usado") {
        // --- CÓDIGO VÁLIDO ---
        preguntasSeleccionadas = barajarArray(preguntas).slice(0, cantidad);
        
        document.getElementById("pantalla-dificultad").style.display = "none";
        document.getElementById("pantalla-juego").style.display = "block";
        indicePregunta = 0;
        aciertos = 0; 
        errores = 0;
        mostrarPregunta(indicePregunta);
        
      } else {
        throw new Error(data.message || "Error desconocido al verificar el DNI.");
      }
    })
    .catch(error => {
      console.error("Error al verificar DNI:", error);
      alert("Error de red. No se pudo verificar tu DNI. Revisa la conexión e inténtalo de nuevo.");
      botonesDificultad.forEach(btn => btn.disabled = false);
      h1.textContent = "Elige la dificultad";
    });
}

function mostrarPregunta(indice) {
  // (Esta función no cambia)
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
  clearInterval(temporizador);
  tiempo = 60;
  document.getElementById("tiempo").textContent = tiempo;
  temporizador = setInterval(() => {
    tiempo--;
    document.getElementById("tiempo").textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(temporizador);
      seleccionarOpcion(null); 
    }
  }, 1000);
}

function seleccionarOpcion(opcion, boton = null) {
  // (Esta función no cambia)
  clearInterval(temporizador);
  const correcta = preguntasSeleccionadas[indicePregunta].correcta;
  const botones = document.querySelectorAll("#opciones button");
  botones.forEach(b => {
    b.disabled = true; 
    if (b.textContent === correcta) b.classList.add("correcta"); 
    else if (b === boton) b.classList.add("incorrecta"); 
  });
  if (opcion === correcta) aciertos++;
  else errores++;
  setTimeout(() => {
    indicePregunta++;
    mostrarPregunta(indicePregunta);
  }, 1200);
}

// (Esta función envía el puntaje - POST)
function finalizarJuego() {
  document.getElementById("pantalla-juego").style.display = "none";
  const pantallaFinal = document.getElementById("pantalla-final");
  pantallaFinal.style.display = "block";
  pantallaFinal.innerHTML = `<h1>Guardando tu puntaje...</h1>`;

  let total = aciertos + errores;
  let porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

  const datosDelJuego = {
    nombre: nombreJugadorActual,
    aciertos: aciertos,
    porcentaje: porcentaje,
    codigo: dniActual // <--- Envía el DNI bajo el nombre "codigo"
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'cors', 
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosDelJuego), 
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      pantallaFinal.innerHTML = `
        <h1>¡Juego terminado, ${nombreJugadorActual}!</h1>
        <p>Tu puntaje fue enviado con éxito.</p>
        <p>Respuestas correctas: ${aciertos}</p>
        <p>Porcentaje de aciertos: ${porcentaje}%</p>
        <p>¡Mucha suerte en el sorteo!</p>
        <button id="boton-reiniciar">Volver al inicio</button>
      `;
    } else {
      throw new Error(data.message || 'Error desconocido al guardar.');
    }
    document.getElementById("boton-reiniciar").addEventListener("click", reiniciarJuego);
  })
  .catch(error => {
    console.error('Error al enviar puntaje:', error);
    pantallaFinal.innerHTML = `
      <h1>¡Ups! Hubo un error de conexión</h1>
      <p>No pudimos guardar tu puntaje. Revisa tu conexión e inténtalo de nuevo.</p>
      <button id="boton-reiniciar">Volver al inicio</button>
    `;
    document.getElementById("boton-reiniciar").addEventListener("click", reiniciarJuego);
  });
}

function reiniciarJuego() {
  aciertos = 0;
  errores = 0;
  indicePregunta = 0;
  document.getElementById("pantalla-final").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
  
  // Limpia los campos
  document.getElementById("nombre-jugador").value = "";
  document.getElementById("documento-jugador").value = "";
  
  // Actualiza el ranking
  mostrarRankingInicio();
}

function volverAlMenu() {
  clearInterval(temporizador);
  document.getElementById("pantalla-juego").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
  document.getElementById("nombre-jugador").value = ""; 
  document.getElementById("documento-jugador").value = "";
  mostrarRankingInicio();
}


// --- FUNCIONES DE NAVEGACIÓN (PIDEN DATOS A GOOGLE) ---

// (Esta pide los datos para el ranking completo)
function mostrarRanking() {
  document.getElementById("pantalla-dificultad").style.display = "none";
  document.getElementById("pantalla-ranking").style.display = "block";

  const listaRanking = document.getElementById("lista-ranking");
  listaRanking.innerHTML = "<li>Cargando ranking...</li>";

  // Hacemos un GET a la misma URL
  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success' && result.data.length > 0) {
        var topPuntajes = result.data; // Ya viene filtrado
        
        listaRanking.innerHTML = topPuntajes.map(p => {
            let porcentaje = Math.round((p.aciertos / 20) * 100); 
            return `<li>${p.nombre}: ${p.aciertos} correctas - ${porcentaje}%</li>`;
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

function mostrarDificultad() {
  document.getElementById("pantalla-ranking").style.display = "none";
  document.getElementById("pantalla-dificultad").style.display = "block";
  mostrarRankingInicio();
}

// (Esta pide los datos para el ranking de la página de inicio)
function mostrarRankingInicio() {
  const listaRanking = document.getElementById("lista-ranking-inicio");
  listaRanking.innerHTML = "<li>Cargando ranking...</li>";
  
  // Hacemos un GET a la misma URL
  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success' && result.data.length > 0) {
        var topPuntajes = result.data; // Ya viene el Top 5 filtrado
        
        listaRanking.innerHTML = topPuntajes.map(p => {
          let porcentaje = Math.round((p.aciertos / 20) * 100); 
          
          return `
            <li>
              <strong>${p.nombre}</strong>
              <small>${p.aciertos} aciertos</small>
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
