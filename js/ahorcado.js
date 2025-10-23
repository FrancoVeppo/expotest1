document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const wordDisplay = document.getElementById('word-display');
    const keyboardDiv = document.getElementById('keyboard');
    const hangmanParts = document.querySelectorAll('.hangman-part');
    const gameOverMessageDiv = document.getElementById('game-over-message');
    const messageText = document.getElementById('message-text');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- VARIABLES DEL JUEGO ---
    const words = ['javascript', 'programacion', 'desarrollo', 'tecnologia', 'exposicion'];
    const maxWrongGuesses = 6;
    
    let selectedWord = '';
    let correctLetters = [];
    let wrongGuesses = 0;

    // --- FUNCIONES DEL JUEGO ---

    function startGame() {
        // Reiniciar variables
        wrongGuesses = 0;
        correctLetters = [];
        selectedWord = words[Math.floor(Math.random() * words.length)];

        // Ocultar partes del ahorcado
        hangmanParts.forEach(part => (part.style.visibility = 'hidden'));
        
        // Mostrar los guiones de la palabra
        displayWord();

        // Crear o reiniciar el teclado
        createKeyboard();
        
        // Ocultar mensaje final
        gameOverMessageDiv.classList.add('hide');
    }

    function displayWord() {
        wordDisplay.innerHTML = selectedWord
            .split('')
            .map(letter => `
                <div class="letter-box">
                    ${correctLetters.includes(letter) ? letter : ''}
                </div>
            `)
            .join('');

        const innerWord = wordDisplay.innerText.replace(/\n/g, '');
        if (innerWord === selectedWord) {
            endGame(true); // Ganó
        }
    }

    function createKeyboard() {
        keyboardDiv.innerHTML = ''; // Limpiar teclado anterior
        const alphabet = 'abcdefghijklmnñopqrstuvwxyz';
        alphabet.split('').forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.classList.add('key');
            button.addEventListener('click', () => handleGuess(letter, button));
            keyboardDiv.appendChild(button);
        });
    }

    function handleGuess(letter, button) {
        button.disabled = true; // Deshabilitar la tecla presionada

        if (selectedWord.includes(letter)) {
            correctLetters.push(letter);
            button.classList.add('correct');
        } else {
            wrongGuesses++;
            button.classList.add('wrong');
            updateHangman();
        }
        
        displayWord();
    }
    
    function updateHangman() {
        if (wrongGuesses > 0) {
            hangmanParts[wrongGuesses - 1].style.visibility = 'visible';
        }

        if (wrongGuesses >= maxWrongGuesses) {
            endGame(false); // Perdió
        }
    }

    function endGame(isWinner) {
        // Deshabilitar todo el teclado
        keyboardDiv.querySelectorAll('.key').forEach(btn => btn.disabled = true);
        
        setTimeout(() => {
            if (isWinner) {
                messageText.textContent = '¡Felicidades! ¡Ganaste!';
            } else {
                messageText.textContent = `Perdiste. La palabra era: "${selectedWord}"`;
            }
            gameOverMessageDiv.classList.remove('hide');
        }, 500);
    }
    
    // --- EVENT LISTENERS ---
    playAgainBtn.addEventListener('click', startGame);

    // Iniciar el juego por primera vez
    startGame();
});