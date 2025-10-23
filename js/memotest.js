// --- 1. Definición de Elementos del DOM ---

const gameBoard = document.getElementById('game-board');
const movesCounter = document.getElementById('moves-counter');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

// Elementos del Modal de Inicio (Setup)
const setupModal = document.getElementById('setup-modal');
const usernameInput = document.getElementById('username-input');
const startGameBtn = document.getElementById('start-game-btn');
const gameWrapper = document.getElementById('game-wrapper');

// Elementos del Modal de Victoria
const winModal = document.getElementById('win-modal');
const winStatsText = document.getElementById('win-stats-text');
const modalRestartBtn = document.getElementById('modal-restart-btn');

// Elementos del Leaderboard
const leaderboardList = document.getElementById('leaderboard-list');

// --- 2. Iconos y Configuración de Dificultad ---

// Lista maestra de iconos (12 pares para el modo difícil)
const ALL_ICONS = [
    'fa-solid fa-hippo', 'fa-solid fa-otter', 'fa-solid fa-dog', 'fa-solid fa-cat',
    'fa-solid fa-spider', 'fa-solid fa-fish-fins', 'fa-solid fa-dragon', 'fa-solid fa-crow',
    'fa-solid fa-bugs', 'fa-solid fa-frog', 'fa-solid fa-horse', 'fa-solid fa-dove'
];

// Configuración de niveles
// Limpiamos clases de dificultad anteriores
    gameBoard.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
    gameWrapper.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
    document.body.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard'); // Limpia el body

    // Añadimos la clase actual a todos los elementos clave
    gameBoard.classList.add(settings.class); 
    gameWrapper.classList.add(settings.class);
    document.body.classList.add(settings.class); // Añade al body (para el leaderboard)

// --- 3. Variables de Estado del Juego ---

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let totalPairs = 0;

// Variables de estado del jugador y tiempo
let currentPlayer = 'Jugador';
let currentDifficulty = 'medium';
let timerInterval = null;
let startTime = 0;
let firstFlipDone = false; // Para saber cuándo iniciar el timer

// --- 4. Funciones Principales del Juego ---

// Función para barajar el array de cartas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Función para crear el tablero
function createBoard() {
    // AÑADE ESTA LÍNEA PARA OCULTAR EL MODAL
    winModal.classList.remove('is-visible');

    // 1. Resetear el estado y el tablero
    gameBoard.innerHTML = '';
    // ... (el resto de la función)
    // 2. Obtener configuración de dificultad
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    totalPairs = settings.pairs;

    // 3. Ajustar el CSS del tablero (GRID) y clases
    gameBoard.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;
    // Limpiamos clases de dificultad anteriores
    gameBoard.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
    gameBoard.classList.add(settings.class); // Añadimos la clase actual

    // 4. Preparar las cartas
    const iconsForGame = ALL_ICONS.slice(0, totalPairs);
    let gameCards = [...iconsForGame, ...iconsForGame];
    shuffle(gameCards);

    // 5. Crear y añadir cartas al HTML
    gameCards.forEach(iconClass => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.icon = iconClass;

        cardElement.innerHTML = `
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">
                <i class="${iconClass}"></i>
            </div>
        `;

        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

// Función que se ejecuta al hacer clic en una carta
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    // --- Iniciar el Timer ---
    // Solo en el primer clic de la partida
    if (!firstFlipDone) {
        startTimer();
        firstFlipDone = true;
    }

    this.classList.add('is-flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;
    
    moves++;
    movesCounter.textContent = moves;

    checkForMatch();
}

// Función para comprobar si hay coincidencia
function checkForMatch() {
    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
    isMatch ? disableCards() : unflipCards();
}

// Función si las cartas coinciden
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matchedPairs++;
    resetBoardState();

    // Comprobar si el juego ha terminado
    if (matchedPairs === totalPairs) {
        stopTimer();
        const finalTime = Math.floor((Date.now() - startTime) / 1000); // Tiempo en segundos
        
        // Guardar el puntaje
        saveScore(currentPlayer, moves, finalTime, currentDifficulty);
        // Actualizar la tabla de puntajes en el acto
        loadLeaderboard();

        // Mostrar modal de victoria
        winStatsText.textContent = `¡Lo lograste en ${moves} movimientos y ${formatTime(finalTime)}!`;
        setTimeout(() => {
            winModal.classList.add('is-visible');
        }, 500);
    }
}

// Función si las cartas NO coinciden
function unflipCards() {
    firstCard.classList.add('is-wrong');
    secondCard.classList.add('is-wrong');
    
    setTimeout(() => {
        firstCard.classList.remove('is-flipped', 'is-wrong');
        secondCard.classList.remove('is-flipped', 'is-wrong');
        resetBoardState();
    }, 1000);
}

// Función para reiniciar las variables de estado del turno
function resetBoardState() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// --- 5. Funciones de Flujo del Juego (Inicio, Reinicio) ---

// Función para iniciar el juego (desde el modal de setup)
function startGame() {
    currentPlayer = usernameInput.value.trim() || 'Jugador Anónimo';
    currentDifficulty = document.querySelector('input[name="difficulty"]:checked').value;

    setupModal.classList.remove('is-visible');
    gameWrapper.classList.remove('is-hidden');
    
    createBoard();
}

// Función para volver a la pantalla de selección
function resetToSetup() {
    winModal.classList.remove('is-visible');
    gameWrapper.classList.add('is-hidden');
    setupModal.classList.add('is-visible');
    stopTimer();
}

// --- 6. Funciones del Cronómetro ---

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = formatTime(elapsedTime);
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// --- 7. Funciones del Leaderboard (localStorage) ---

function saveScore(name, moves, time, difficulty) {
    // 1. Obtener puntajes existentes (o un array vacío)
    const scores = JSON.parse(localStorage.getItem('memotestLeaderboard')) || [];
    
    // 2. Crear el nuevo puntaje
    const newScore = { name, moves, time, difficulty };

    // 3. Añadir el nuevo puntaje
    scores.push(newScore);

    // 4. Guardar en localStorage
    localStorage.setItem('memotestLeaderboard', JSON.stringify(scores));
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('memotestLeaderboard')) || [];

    // Ordenar: primero por dificultad (difícil > medio > fácil)
    // Luego por tiempo (menos es mejor)
    // Luego por movimientos (menos es mejor)
    scores.sort((a, b) => {
        const diffOrder = { hard: 3, medium: 2, easy: 1 };
        if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
            return diffOrder[b.difficulty] - diffOrder[a.difficulty]; // Descendente
        }
        if (a.time !== b.time) {
            return a.time - b.time; // Ascendente
        }
        return a.moves - b.moves; // Ascendente
    });

    // Limpiar la lista actual
    leaderboardList.innerHTML = '';

    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>No hay puntajes todavía...</li>';
        return;
    }

    // Mostrar solo los 10 mejores
    const top10 = scores.slice(0, 10);

    top10.forEach(score => {
        const li = document.createElement('li');
        const diffText = score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1);
        li.textContent = `${score.name} (${diffText}) - ${formatTime(score.time)} (${score.moves} mov.)`;
        leaderboardList.appendChild(li);
    });
}

// --- 8. Inicialización y Event Listeners ---

// Botón "¡Jugar!" en el modal de inicio
startGameBtn.addEventListener('click', startGame);

// Botón "Cambiar Dificultad" (debajo del tablero)
restartBtn.addEventListener('click', resetToSetup);

// Botón "Jugar de Nuevo" en el modal de victoria
modalRestartBtn.addEventListener('click', createBoard); // Reinicia el mismo nivel

// Cargar el leaderboard al iniciar la página
document.addEventListener('DOMContentLoaded', loadLeaderboard);