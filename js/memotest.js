// Espera a que todo el HTML esté cargado antes de ejecutar CUALQUIER código
document.addEventListener('DOMContentLoaded', () => {

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
    const ALL_ICONS = [
        'fa-solid fa-hippo', 'fa-solid fa-otter', 'fa-solid fa-dog', 'fa-solid fa-cat',
        'fa-solid fa-spider', 'fa-solid fa-fish-fins', 'fa-solid fa-dragon', 'fa-solid fa-crow',
        'fa-solid fa-bugs', 'fa-solid fa-frog', 'fa-solid fa-horse', 'fa-solid fa-dove'
    ];

    const DIFFICULTY_SETTINGS = {
        easy: { pairs: 4, cols: 4, rows: 2, class: 'difficulty-easy' },
        medium: { pairs: 8, cols: 4, rows: 4, class: 'difficulty-medium' },
        hard: { pairs: 12, cols: 6, rows: 4, class: 'difficulty-hard' }
    };

    // --- 3. Variables de Estado del Juego ---
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let moves = 0;
    let totalPairs = 0;
    let currentPlayer = 'Jugador';
    let currentDifficulty = 'medium';
    let timerInterval = null;
    let startTime = 0;
    let firstFlipDone = false;

    // --- 4. Funciones Principales del Juego ---

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createBoard() {
        winModal.classList.remove('is-visible');
        gameBoard.innerHTML = '';
        matchedPairs = 0;
        moves = 0;
        movesCounter.textContent = moves;
        resetBoardState();
        stopTimer();
        timerDisplay.textContent = '00:00';
        firstFlipDone = false;

        const settings = DIFFICULTY_SETTINGS[currentDifficulty];
        totalPairs = settings.pairs;

        gameBoard.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;

        // --- ✅ CORRECCIÓN RESPONSIVA MÓVIL ---
        // Solo aplicamos 'grid-template-rows' si estamos en una pantalla grande
        if (window.innerWidth > 600) {
            gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;
        } else {
            // En móvil (<= 600px), quitamos este estilo para que 'aspect-ratio' funcione
            gameBoard.style.gridTemplateRows = 'unset'; 
        }
        // --- FIN DE LA CORRECCIÓN ---

        gameBoard.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        gameWrapper.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        document.body.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');

        gameBoard.classList.add(settings.class);
        gameWrapper.classList.add(settings.class);
        document.body.classList.add(settings.class);

        const iconsForGame = ALL_ICONS.slice(0, totalPairs);
        let gameCards = [...iconsForGame, ...iconsForGame];
        shuffle(gameCards);

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

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

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

    function checkForMatch() {
        const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        matchedPairs++;
        resetBoardState();

        if (matchedPairs === totalPairs) {
            stopTimer();
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            saveScore(currentPlayer, moves, finalTime, currentDifficulty);
            loadLeaderboard();
            winStatsText.textContent = `¡Lo lograste en ${moves} movimientos y ${formatTime(finalTime)}!`;
            setTimeout(() => {
                winModal.classList.add('is-visible');
            }, 500);
        }
    }

    function unflipCards() {
        firstCard.classList.add('is-wrong');
        secondCard.classList.add('is-wrong');
        setTimeout(() => {
            firstCard.classList.remove('is-flipped', 'is-wrong');
            secondCard.classList.remove('is-flipped', 'is-wrong');
            resetBoardState();
        }, 1000);
    }

    function resetBoardState() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    // --- 5. Funciones de Flujo del Juego ---

    function startGame() {
        currentPlayer = usernameInput.value.trim() || 'Jugador Anónimo';
        currentDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
        setupModal.classList.remove('is-visible');
        gameWrapper.classList.remove('is-hidden');
        createBoard();
    }

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

    // --- 7. Funciones del Leaderboard ---

    function saveScore(name, moves, time, difficulty) {
        const scores = JSON.parse(localStorage.getItem('memotestLeaderboard')) || [];
        const newScore = { name, moves, time, difficulty };
        scores.push(newScore);
        localStorage.setItem('memotestLeaderboard', JSON.stringify(scores));
    }

    function loadLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('memotestLeaderboard')) || [];
        scores.sort((a, b) => {
            const diffOrder = { hard: 3, medium: 2, easy: 1 };
            if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
                return diffOrder[b.difficulty] - diffOrder[a.difficulty];
            }
            if (a.time !== b.time) {
                return a.time - b.time;
            }
            return a.moves - b.moves;
        });

        leaderboardList.innerHTML = '';
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<li>No hay puntajes todavía...</li>';
            return;
        }

        const top10 = scores.slice(0, 10);
        top10.forEach(score => {
            const li = document.createElement('li');
            const diffText = score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1);
            li.textContent = `${score.name} (${diffText}) - ${formatTime(score.time)} (${score.moves} mov.)`;
            leaderboardList.appendChild(li);
        });
    }

    // --- 8. Inicialización y Event Listeners ---
    // Ahora todo esto se ejecuta DESPUÉS de que el HTML cargó.
    
    startGameBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetToSetup);
    modalRestartBtn.addEventListener('click', createBoard);
    loadLeaderboard(); // Carga los puntajes al inicio

}); // <-- FIN DEL "DOMContentLoaded" LISTENER
