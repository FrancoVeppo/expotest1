document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const statusDisplay = document.querySelector('#status');
    const board = document.querySelector('#board');
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.querySelector('#resetButton');
    const vsPlayerButton = document.querySelector('#vsPlayer');
    const vsCPUButton = document.querySelector('#vsCPU');
    const gameModeSelection = document.querySelector('#game-mode-selection');
    const gameContainer = document.querySelector('#game-container');

    // --- VARIABLES DEL JUEGO ---
    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let isGameActive = true;
    let isVsCPU = false; // Por defecto, es vs jugador

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // --- FUNCIONES DEL JUEGO ---
    
    function startGame(vsCPU) {
        isVsCPU = vsCPU;
        isGameActive = true;
        currentPlayer = 'X';
        gameState = ["", "", "", "", "", "", "", "", ""];
        cells.forEach(cell => cell.textContent = "");
        statusDisplay.textContent = `Turno del jugador ${currentPlayer}`;
        
        // Ocultar selección de modo y mostrar el tablero
        gameModeSelection.classList.add('hide');
        gameContainer.classList.remove('hide');
    }

    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !isGameActive) {
            return;
        }

        makeMove(clickedCellIndex, currentPlayer);

        if (isGameActive && isVsCPU && currentPlayer === 'O') {
            // Si el juego está activo y es el turno de la IA
            setTimeout(cpuMove, 500); // Pequeño retraso para que parezca que "piensa"
        }
    }

    function makeMove(index, player) {
        gameState[index] = player;
        document.querySelector(`.cell[data-index='${index}']`).textContent = player;
        
        if (checkResult()) {
            return; // Si el juego terminó, no cambiar de jugador
        }
        
        // Cambiar de jugador
        currentPlayer = player === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Turno del jugador ${currentPlayer}`;
    }

    function checkResult() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `¡El jugador ${currentPlayer} ha ganado!`;
            isGameActive = false;
            return true;
        }

        if (!gameState.includes("")) {
            statusDisplay.textContent = `¡Es un empate!`;
            isGameActive = false;
            return true;
        }
        
        return false;
    }

    // --- LÓGICA DE LA IA ---

    function cpuMove() {
        if (!isGameActive) return;

        // 1. Intentar ganar
        let move = findWinningMove('O');
        if (move !== null) {
            makeMove(move, 'O');
            return;
        }

        // 2. Intentar bloquear al jugador
        move = findWinningMove('X');
        if (move !== null) {
            makeMove(move, 'O');
            return;
        }

        // 3. Tomar una casilla aleatoria de las disponibles
        const availableCells = gameState.map((val, index) => val === "" ? index : null).filter(val => val !== null);
        const randomMove = availableCells[Math.floor(Math.random() * availableCells.length)];
        makeMove(randomMove, 'O');
    }

    function findWinningMove(player) {
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") {
                // Simular el movimiento
                gameState[i] = player;
                let wins = false;
                for (let j = 0; j < winningConditions.length; j++) {
                    const [a, b, c] = winningConditions[j];
                    if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
                        wins = true;
                        break;
                    }
                }
                // Deshacer la simulación
                gameState[i] = "";
                if (wins) {
                    return i; // Devolver el índice del movimiento ganador
                }
            }
        }
        return null; // No se encontró movimiento ganador
    }
    
    // --- EVENT LISTENERS ---
    
    // Iniciar el modo de juego seleccionado
    vsPlayerButton.addEventListener('click', () => startGame(false));
    vsCPUButton.addEventListener('click', () => startGame(true));

    // Clic en las casillas
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    // Reiniciar el juego (vuelve a la selección de modo)
    resetButton.addEventListener('click', () => {
        gameContainer.classList.add('hide');
        gameModeSelection.classList.remove('hide');
    });
});