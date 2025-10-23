document.addEventListener('DOMContentLoaded', () => {
    // --- PRECARGA DE SONIDOS ---
    const sounds = {
        dice: new Audio('sonidos/dice-roll.mp3'),
        buy: new Audio('sonidos/buy-property.mp3'),
        rent: new Audio('sonidos/pay-rent.mp3'),
        jail: new Audio('sonidos/go-to-jail.mp3'),
        card: new Audio('sonidos/draw-card.mp3')
    };

    // --- DATOS DEL JUEGO ---
    const boardData = [ { name: "Salida", type: "corner" }, { name: "Formosa", price: 60, group: "litoral", rent: [2, 10, 30, 90, 160, 250], houseCost: 50 }, { name: "Azar", type: "community-chest" }, { name: "Chaco", price: 60, group: "litoral", rent: [4, 20, 60, 180, 320, 450], houseCost: 50 }, { name: "Imp. a las Ganancias", type: "tax", price: 200 }, { name: "Aeroparque J. Newbery", price: 200, group: "airport", rent: [25, 50, 100, 200] }, { name: "Jujuy", price: 100, group: "norte", rent: [6, 30, 90, 270, 400, 550], houseCost: 50 }, { name: "Suerte", type: "chance" }, { name: "Salta", price: 100, group: "norte", rent: [6, 30, 90, 270, 400, 550], houseCost: 50 }, { name: "Tucumán", price: 120, group: "norte", rent: [8, 40, 100, 300, 450, 600], houseCost: 50 }, { name: "Cárcel / De Visita", type: "corner" }, { name: "La Rioja", price: 140, group: "cuyo", rent: [10, 50, 150, 450, 625, 750], houseCost: 100 }, { name: "AYSA", price: 150, group: "utility", rent: [4, 10] }, { name: "San Juan", price: 140, group: "cuyo", rent: [10, 50, 150, 450, 625, 750], houseCost: 100 }, { name: "Mendoza", price: 160, group: "cuyo", rent: [12, 60, 180, 500, 700, 900], houseCost: 100 }, { name: "Aeropuerto de Córdoba", price: 200, group: "airport", rent: [25, 50, 100, 200] }, { name: "Misiones", price: 180, group: "mesopotamia", rent: [14, 70, 200, 550, 750, 950], houseCost: 100 }, { name: "Azar", type: "community-chest" }, { name: "Corrientes", price: 180, group: "mesopotamia", rent: [14, 70, 200, 550, 750, 950], houseCost: 100 }, { name: "Entre Ríos", price: 200, group: "mesopotamia", rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 }, { name: "Estacionamiento Gratuito", type: "corner" }, { name: "La Pampa", price: 220, group: "patagonia", rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 }, { name: "Suerte", type: "chance" }, { name: "Neuquén", price: 220, group: "patagonia", rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 }, { name: "Río Negro", price: 240, group: "patagonia", rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 }, { name: "Aeropuerto de Bariloche", price: 200, group: "airport", rent: [25, 50, 100, 200] }, { name: "Chubut", price: 260, group: "sur", rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 }, { name: "Santa Cruz", price: 260, group: "sur", rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
        { name: "Edenor", price: 150, group: "utility", rent: [4, 10] },
        { name: "Tierra del Fuego", price: 280, group: "sur", rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 }, { name: "Váyase a la Cárcel", type: "corner jail" }, { name: "Santiago del Estero", price: 300, group: "centro", rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 }, { name: "Santa Fe", price: 300, group: "centro", rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 }, { name: "Azar", type: "community-chest" }, { name: "Córdoba", price: 320, group: "centro", rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 }, { name: "Aeropuerto de Ezeiza", price: 200, group: "airport", rent: [25, 50, 100, 200] }, { name: "Suerte", type: "chance" }, { name: "Prov. Buenos Aires", price: 350, group: "capital", rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 }, { name: "Impuesto al Lujo", type: "tax", price: 100 }, { name: "Capital Federal", price: 400, group: "capital", rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 }, ];
    const chanceCards = [ { text: "Salga de la cárcel gratis. Esta tarjeta puede conservarse hasta ser usada.", action: (p) => { p.hasGetOutOfJailCard = true; }, isGetOutOfJail: true }, { text: "Avanza a la Salida. Cobra $200.", action: (p) => { p.position = 0; p.money += 200; } }, { text: "El banco te paga un dividendo de $50.", action: (p) => p.money += 50 }, { text: "Ve a la Cárcel.", action: (p) => goToJail(p) }, { text: "Paga una multa por exceso de velocidad de $15.", action: (p) => p.money -= 15 }, ];
    const communityChestCards = [ { text: "Salga de la cárcel gratis. Esta tarjeta puede conservarse hasta ser usada.", action: (p) => { p.hasGetOutOfJailCard = true; }, isGetOutOfJail: true }, { text: "Error del banco a tu favor. Cobra $200.", action: (p) => p.money += 200 }, { text: "Paga la factura del doctor. $50.", action: (p) => p.money -= 50 }, { text: "Heredas $100.", action: (p) => p.money += 100 }, ];
    const availableEmojis = ['🚗', '🎩', '🚢', '🐶', '🦖', '🐧', '🚀', '🛵', '🐎', '🤖', '👑', '⭐'];
    const defaultColors = ['#ff4d4d', '#4d88ff', '#4dff4d', '#ffff4d', '#ff4dff', '#4dffff', '#ff8c4d', '#8c4dff'];

    let players = [];
    let currentPlayerIndex = 0;
    let lastDiceRoll = 0;
    let doublesCount = 0;
    let tradeOffer = {};

    // --- Elementos DOM ---
    const mainContainer = document.querySelector('.main-container');
    const boardElement = document.getElementById('board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const manageBtn = document.getElementById('manage-btn');
    const playerInfoElement = document.getElementById('player-info');
    const turnIndicatorElement = document.getElementById('turn-indicator');
    const controlsElement = document.querySelector('.controls');
    const die1Element = document.getElementById('die-1');
    const die2Element = document.getElementById('die-2');
    const diceTotalElement = document.getElementById('dice-total');
    const startupMenu = document.getElementById('startup-menu');
    const playerSetupsContainer = document.getElementById('player-setups-container');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const removePlayerBtn = document.getElementById('remove-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const manageModalOverlay = document.getElementById('manage-modal-overlay');
    const manageModalContent = document.getElementById('manage-modal-content');
    const manageModalCloseBtn = document.getElementById('manage-modal-close-btn');
    const gameMessagePanel = document.getElementById('game-message-panel');
    const messageIcon = document.getElementById('message-icon');
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    const messageButtons = document.getElementById('message-buttons');
    const tradeModalOverlay = document.getElementById('trade-modal-overlay');
    const tradePartnerSelection = document.getElementById('trade-partner-selection');
    const tradePartnerButtons = document.getElementById('trade-partner-buttons');
    const tradeInterface = document.getElementById('trade-interface');
    const initiatorOfferName = document.getElementById('initiator-name');
    const initiatorMoneyInput = document.getElementById('initiator-money');
    const initiatorPropertiesContainer = document.getElementById('initiator-properties');
    const recipientOfferName = document.getElementById('recipient-name');
    const recipientMoneyInput = document.getElementById('recipient-money');
    const recipientPropertiesContainer = document.getElementById('recipient-properties');
    const tradeModalButtons = document.getElementById('trade-modal-buttons');
    const propertyCardOverlay = document.getElementById('property-card-overlay');
    const propertyCardContent = document.getElementById('property-card-content');
    const propertyCardCloseBtn = document.getElementById('property-card-close-btn');

    // --- Funciones de Configuración Inicial ---
    function addPlayerSetup() {
        if (!playerSetupsContainer) return; // Seguridad
        const playerCount = playerSetupsContainer.children.length;
        if (playerCount >= 8) return;
        const playerIndex = playerCount + 1;
        const playerSetupDiv = document.createElement('div');
        playerSetupDiv.className = 'player-setup';
        playerSetupDiv.innerHTML = `
            <h3>Jugador ${playerIndex}</h3>
            <input type="text" class="player-name" placeholder="Ingresa tu nombre" value="Jugador ${playerIndex}">
            <p>Elige tu ficha:</p>
            <div class="emoji-grid"></div>
            <p>Elige tu color:</p>
            <input type="color" class="player-color" value="${defaultColors[playerCount % defaultColors.length]}">
        `;
        playerSetupsContainer.appendChild(playerSetupDiv);
        populateEmojiSelectors(playerSetupDiv.querySelector('.emoji-grid'));
    }
    function removePlayerSetup() {
        if (playerSetupsContainer && playerSetupsContainer.children.length > 2) {
            playerSetupsContainer.removeChild(playerSetupsContainer.lastChild);
        }
    }
    function populateEmojiSelectors(container) {
        if (!container) return;
        container.innerHTML = '';
        availableEmojis.forEach(emoji => {
            const button = document.createElement('button');
            button.classList.add('emoji-choice');
            button.textContent = emoji;
            button.onclick = () => {
                container.querySelectorAll('.emoji-choice').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                container.dataset.selectedEmoji = emoji;
            };
            container.appendChild(button);
        });
        const defaultEmoji = availableEmojis[(playerSetupsContainer.children.length - 1) % availableEmojis.length];
        const defaultButton = Array.from(container.children).find(btn => btn.textContent === defaultEmoji);
        if (defaultButton) {
            defaultButton.classList.add('selected');
            container.dataset.selectedEmoji = defaultEmoji;
        } else if (container.children.length > 0) {
            container.children[0].classList.add('selected');
            container.dataset.selectedEmoji = container.children[0].textContent;
        }
    }
    function launchGame() {
        players = [];
        if (!playerSetupsContainer) return; // Seguridad
        const setupDivs = playerSetupsContainer.querySelectorAll('.player-setup');
        setupDivs.forEach((div, index) => {
            players.push({
                id: index + 1,
                name: div.querySelector('.player-name')?.value || `Jugador ${index + 1}`,
                position: 0,
                money: 1500,
                token: div.querySelector('.emoji-grid')?.dataset.selectedEmoji || availableEmojis[index % availableEmojis.length],
                color: div.querySelector('.player-color')?.value || defaultColors[index % defaultColors.length],
                properties: [], // Inicializa lista de propiedades
                isInJail: false,
                jailTurns: 0,
                hasGetOutOfJailCard: false
            });
        });
        if (startupMenu) startupMenu.classList.remove('visible');
        if (mainContainer) mainContainer.classList.remove('hidden');
        if (window.innerWidth <= 800) {
            if (playerInfoElement && mainContainer) mainContainer.appendChild(playerInfoElement);
            if (controlsElement && mainContainer) mainContainer.appendChild(controlsElement);
        }
        initializeMarkers();
        initializeGame();
    }
    function initializeMarkers() {
        if (!boardElement) return;
        boardElement.querySelectorAll('.player-marker').forEach(marker => marker.remove());
        players.forEach(player => {
            const marker = document.createElement('div');
            marker.id = `player-marker-${player.id}`;
            marker.className = 'player-marker';
            const emoji = document.createElement('div');
            emoji.className = 'marker-emoji';
            emoji.textContent = player.token;
            const arrow = document.createElement('div');
            arrow.className = 'marker-arrow';
            marker.appendChild(emoji);
            marker.appendChild(arrow);
            boardElement.appendChild(marker);
        });
    }
    function createBoard() {
        if (!boardElement) return;
        const positions = [ [10, 10], [10, 9], [10, 8], [10, 7], [10, 6], [10, 5], [10, 4], [10, 3], [10, 2], [10, 1], [10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10] ];
        boardElement.querySelectorAll('.cell').forEach(cell => cell.remove());
        boardData.forEach((cellData, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${index}`;
            const [row, col] = positions[index];
            cell.style.gridRow = row + 1;
            cell.style.gridColumn = col + 1;
            cell.addEventListener('click', () => showPropertyCard(index)); // Listener para tarjeta
            if (cellData.group && cellData.group !== "airport" && cellData.group !== "utility") {
                const colorBar = document.createElement('div');
                colorBar.classList.add('color-bar');
                colorBar.style.backgroundColor = getGroupColor(cellData.group);
                cell.appendChild(colorBar);
            }
            const nameDiv = document.createElement('div');
            nameDiv.classList.add('name');
            nameDiv.textContent = cellData.name;
            cell.appendChild(nameDiv);
            if (cellData.price) {
                const priceDiv = document.createElement('div');
                priceDiv.classList.add('price');
                priceDiv.textContent = `$${cellData.price}`;
                cell.appendChild(priceDiv);
            }
            if (cellData.type === 'corner') cell.classList.add('corner');
            boardElement.appendChild(cell);
        });
    }
    // --- Funciones de Actualización de UI ---
    function updatePlayerInfo() {
        if (!playerInfoElement) return;
        playerInfoElement.innerHTML = players.map(p => `<div>${p.name} ${p.token}: <span style="color:${p.color}; font-weight:bold;">$${p.money}</span> ${p.isInJail ? '<strong>(En Cárcel)</strong>' : ''} ${p.hasGetOutOfJailCard ? '🃏' : ''}</div>`).join('');
        updateTurnIndicator();
    }
    function updateTurnIndicator() {
        if (!turnIndicatorElement || !players.length) return;
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return; // Seguridad extra
        turnIndicatorElement.innerHTML = `Turno de: <span style="color:${currentPlayer.color}; text-shadow: 0 0 8px ${currentPlayer.color};">${currentPlayer.name} ${currentPlayer.token}</span>`;
    }
    // ESTA ES LA VERSIÓN CON EL CAMBIO DE COLOR DE FLECHA
    function updatePlayerTokensOnBoard() {
        players.forEach(player => {
            const marker = document.getElementById(`player-marker-${player.id}`);
            const cellElement = document.getElementById(`cell-${player.position}`);

            if (!marker || !cellElement) {
                console.warn(`Marker or cell not found for player ${player.id} at position ${player.position}`);
                // No llamamos a updatePlayerInfo() aquí para evitar bucles si hay error al inicio
                return;
            }

            const emoji = marker.querySelector('.marker-emoji');
            const arrow = marker.querySelector('.marker-arrow');

            // --- CAMBIO: Color de la flecha ---
            if (emoji) emoji.textContent = player.token;
            if (arrow) arrow.style.borderTopColor = player.color; // Asigna el color del jugador

            // Llama a la función auxiliar para calcular y aplicar la posición
            updateMarkerPosition(marker, cellElement, player.id, player.position);
        });
        updatePlayerInfo(); // Llama a updatePlayerInfo UNA VEZ al final, después de mover todos
    }
    // Función auxiliar para calcular y aplicar posición/rotación
    function updateMarkerPosition(marker, cellElement, playerId, currentPos) {
        if (!boardElement || !marker || !cellElement) return;
        const boardRect = boardElement.getBoundingClientRect();
        const cellRect = cellElement.getBoundingClientRect();
        let top, left, rotation;
        const offset = marker.offsetHeight / 2 + 5; // Ajuste para que la flecha apunte bien

        // Detección de lado del tablero
        if (cellRect.top - boardRect.top < 10) { rotation = 0; top = cellRect.top - boardRect.top - offset; left = cellRect.left - boardRect.left + cellRect.width / 2; }
        else if (cellRect.bottom - boardRect.bottom > -10) { rotation = 180; top = cellRect.bottom - boardRect.top + offset; left = cellRect.left - boardRect.left + cellRect.width / 2; }
        else if (cellRect.left - boardRect.left < 10) { rotation = 270; left = cellRect.left - boardRect.left - offset; top = cellRect.top - boardRect.top + cellRect.height / 2; }
        else { rotation = 90; left = cellRect.right - boardRect.left + offset; top = cellRect.top - boardRect.top + cellRect.height / 2; }

        // Distribuir jugadores en la misma casilla
        const playersOnSameCell = players.filter(p => p.position === currentPos);
        let shift = 0;
        if (playersOnSameCell.length > 1) {
            const playerIndexOnCell = playersOnSameCell.findIndex(p => p.id === playerId);
            if (playerIndexOnCell !== -1) { shift = (playerIndexOnCell - (playersOnSameCell.length - 1) / 2) * (marker.offsetWidth * 0.6); } // Separación basada en ancho
        }
        if (rotation === 0 || rotation === 180) { left += shift; } // Arriba o Abajo
        else { top += shift; } // Izquierda o Derecha

        // Aplicar estilos directamente (sin transición CSS activa)
        marker.style.top = `${top}px`;
        marker.style.left = `${left}px`;
        marker.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        const emoji = marker.querySelector('.marker-emoji');
        if (emoji) emoji.style.transform = `rotate(${-rotation}deg)`; // Contra-rotar emoji
    }
    function updateDieFace(dieElement, value) {
        if (!dieElement) return;
        dieElement.innerHTML = '';
        dieElement.className = 'die'; // Resetea clases (quita 'rolling' y cara anterior)
        dieElement.classList.add(`face-${value}`); // Añade clase de cara
        // Dibuja puntos
        for (let i = 0; i < value; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dieElement.appendChild(dot);
        }
    }

    // --- Lógica Principal del Turno ---
    function rollDice() {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return; // Seguridad
        if (currentPlayer.isInJail) {
            showJailPanel(currentPlayer);
            return;
        }
        sounds.dice.play();
        rollDiceBtn.disabled = true;
        manageBtn.disabled = true;
        if (diceTotalElement) diceTotalElement.textContent = '';
        // Iniciar animación CSS (si existe)
        if (die1Element) die1Element.classList.add('rolling');
        if (die2Element) die2Element.classList.add('rolling');

        setTimeout(() => {
            // Detener animación CSS
            if (die1Element) die1Element.classList.remove('rolling');
            if (die2Element) die2Element.classList.remove('rolling');

            // Calcular dados
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            lastDiceRoll = d1 + d2; // Guardar suma

            // Actualizar UI de dados
            updateDieFace(die1Element, d1);
            updateDieFace(die2Element, d2);
            if (diceTotalElement) diceTotalElement.textContent = lastDiceRoll;

            const isDoubles = (d1 === d2);
            if (isDoubles) { doublesCount++; } else { doublesCount = 0; }

            // Chequear 3 dobles -> Cárcel
            if (doublesCount === 3) {
                showMessagePanel("¡A la Cárcel!", "Sacaste 3 dobles seguidos. ¡Vas a la cárcel!", '🚓', [{ text: "Aceptar", action: () => {
                    goToJail(currentPlayer);
                    switchPlayer(); // Turno termina
                }}]);
                return;
            }

            // Iniciar animación de movimiento
            animateMovePlayer(lastDiceRoll, isDoubles);

        }, 1000); // Duración de la animación de dados
    }

    // Anima el movimiento visualmente, luego llama a finishMovement
    async function animateMovePlayer(steps, isDoubles) {
        let player = players[currentPlayerIndex];
        if (!player) return;
        const startPosition = player.position;
        let currentAnimatedPos = startPosition;
        for (let i = 0; i < steps; i++) {
            currentAnimatedPos = (currentAnimatedPos + 1) % 40;
            const marker = document.getElementById(`player-marker-${player.id}`);
            const cellElement = document.getElementById(`cell-${currentAnimatedPos}`);
            if (marker && cellElement) {
                updateMarkerPosition(marker, cellElement, player.id, currentAnimatedPos);
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Velocidad de paso
        }
        // Llamar a la función que actualiza estado y decide acción
        finishMovement(startPosition, steps, isDoubles);
    }
    // Actualiza posición, maneja Salida, llama a handleLanding
    function finishMovement(startPosition, steps, isDoubles) {
        let player = players[currentPlayerIndex];
        if (!player) return;
        const finalPosition = (startPosition + steps) % 40;
        const passedGo = (startPosition + steps) >= 40;

        // Actualiza posición REAL
        player.position = finalPosition;

        // Asegura posición visual final
        const finalMarker = document.getElementById(`player-marker-${player.id}`);
        const finalCell = document.getElementById(`cell-${finalPosition}`);
        if (finalMarker && finalCell) {
             updateMarkerPosition(finalMarker, finalCell, player.id, finalPosition);
        }
        console.log(`${player.name} finished movement at ${boardData[finalPosition]?.name || 'Unknown'} (Pos: ${finalPosition})`);

        // Manejar Salida
        if (passedGo) {
            player.money += 200;
            updatePlayerInfo(); // Actualiza UI antes de mensaje
            showMessagePanel("¡Salida!", `${player.name} pasó por Salida y cobra $200.`, '💰', [{ text: "Aceptar", action: () => handleLanding(isDoubles) }]); // Al aceptar, aterriza
        } else {
            updatePlayerInfo(); // Actualiza UI por si acaso
            handleLanding(isDoubles); // Aterriza directamente
        }
    }

    // Ejecuta la acción de la casilla donde se aterrizó
    function handleLanding(isDoubles) {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        const currentCell = boardData[currentPlayer.position];
        if (!currentCell) { console.error(`Invalid cell: ${currentPlayer.position}`); return; }
        console.log(`Executing handleLanding for ${currentCell.name}`);
        const nextStepAction = () => determineNextStep(isDoubles); // Qué hacer después

        setTimeout(() => { // Pequeña pausa
            // Orden lógico: cárcel > impuestos > tarjetas > comprar > pagar alquiler > visita/nada
            if (currentCell.type === 'corner jail') {
                showMessagePanel("¡A la Cárcel!", `${currentPlayer.name}, ¡vete a la cárcel!`, '🚓', [{ text: "Aceptar", action: () => { goToJail(currentPlayer); switchPlayer(); } }]);
            } else if (currentCell.type === 'tax') {
                currentPlayer.money -= currentCell.price;
                const message = `${currentPlayer.name}, caes en ${currentCell.name}. Pagas $${currentCell.price}.`;
                showMessagePanel("Impuestos", message, '🧾', [{ text: "Aceptar", action: () => { updatePlayerInfo(); nextStepAction(); } }]);
            } else if (currentCell.type === 'chance' || currentCell.type === 'community-chest') {
                drawCard(currentCell.type, isDoubles);
            } else if (currentCell.price > 0 && !currentCell.owner) { // Propiedad libre
                if (currentPlayer.money >= currentCell.price) { showPurchasePanel(currentCell, currentPlayer, isDoubles); }
                else { showMessagePanel("Fondos Insuficientes", `No puedes comprar ${currentCell.name}.`, '😕', [{ text: "Aceptar", action: nextStepAction }]); }
            } else if (currentCell.price > 0 && currentCell.owner && currentCell.owner !== currentPlayer.id) { // Propiedad de otro
                payRent(currentPlayer, currentCell, nextStepAction);
            } else if (currentPlayer.position === 10 && !currentPlayer.isInJail) { // Visita cárcel
                showMessagePanel("De Visita", `${currentPlayer.name} está de visita en la cárcel.`, '👮', [{ text: "Aceptar", action: nextStepAction }]);
            } else { // Propia, Salida, Estacionamiento
                console.log(`Landed on own property or safe space: ${currentCell.name}`);
                nextStepAction();
            }
        }, 50);
    }

    // Calcula y procesa el pago de alquiler
    function payRent(currentPlayer, currentCell, nextStepAction) {
        const owner = players.find(p => p.id === currentCell.owner);
        if (!owner) { console.error(`Owner ${currentCell.owner} not found`); nextStepAction(); return; }
        let rent = 0;
        // Cálculo (robusto)
        if (currentCell.group === "airport") {
            const ownedCount = owner.properties?.filter(pIdx => boardData[pIdx]?.group === 'airport').length || 0;
            rent = currentCell.rent[ownedCount - 1] || 0;
        } else if (currentCell.group === "utility") {
            const ownedCount = owner.properties?.filter(pIdx => boardData[pIdx]?.group === 'utility').length || 0;
            const multiplier = currentCell.rent[ownedCount - 1] || 0;
            rent = multiplier * lastDiceRoll;
        } else { // Propiedad normal
            const groupProperties = boardData.filter(p => p.group === currentCell.group);
            const ownerOwnsAll = groupProperties.every(p => owner.properties?.includes(p.position));
            const houses = currentCell.houses || 0;
            const baseRent = currentCell.rent[0] || 0;
            if (ownerOwnsAll && houses === 0 && currentCell.rent.length > 1) { rent = baseRent * 2; }
            else { rent = currentCell.rent[houses] || baseRent; }
        }
        rent = Math.max(0, rent);
        currentPlayer.money -= rent;
        owner.money += rent;
        sounds.rent.play();
        const message = `${currentPlayer.name}, caes en ${currentCell.name} (${owner.name}). Pagas $${rent}.`;
        showMessagePanel("Pago de Alquiler", message, '💸', [{ text: "Aceptar", action: () => {
            updatePlayerInfo();
            if (currentPlayer.money < 0) {
                showMessagePanel("Bancarrota", `¡${currentPlayer.name} sin dinero! (Bancarrota pendiente)`, '☠️', [{ text: "Aceptar", action: nextStepAction }]);
            } else { nextStepAction(); }
        }}]);
    }

    // Decide si tirar de nuevo o cambiar de jugador
    function determineNextStep(isDoubles) {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        if (isDoubles && !currentPlayer.isInJail) { // Dobles y no encarcelado
            console.log("Doubles! Rolling again.");
            showMessagePanel("¡Dobles!", `Sacaste dobles. ¡Vuelves a tirar!`, '🎲', [{ text: "Aceptar", action: () => {
                rollDiceBtn.disabled = false; manageBtn.disabled = false; // Habilita para mismo jugador
            }}]);
        } else { // No dobles o encarcelado
            console.log("Not doubles or in jail, switching player.");
            switchPlayer();
        }
    }

    // Saca una carta y llama a determineNextStep
    function drawCard(type, isDoubles) {
        sounds.card.play();
        const deck = type === 'chance' ? chanceCards : communityChestCards;
        const card = deck[Math.floor(Math.random() * deck.length)];
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer) return;
        const title = type === 'chance' ? 'Suerte' : 'Azar';
        const icon = type === 'chance' ? '🍀' : '❓';
        console.log(`${currentPlayer.name} draws ${type}: ${card.text}`);
        card.action(currentPlayer); // La acción puede cambiar estado (ej: cárcel)
        updatePlayerTokensOnBoard(); // Actualizar visual si la carta movió
        // Al aceptar, decidir siguiente paso
        showMessagePanel(title, card.text, icon, [{ text: "Aceptar", action: () => determineNextStep(isDoubles) }]);
    }
    // Muestra panel de mensajes
    function showMessagePanel(title, text, icon, buttonsConfig) {
        if (!gameMessagePanel || !messageTitle || !messageText || !messageIcon || !messageButtons) return;
        messageTitle.textContent = title;
        messageText.textContent = text;
        messageIcon.textContent = icon;
        messageButtons.innerHTML = '';
        buttonsConfig.forEach(buttonConf => {
            const button = document.createElement('button');
            button.classList.add('modal-btn');
            if (buttonConf.className) button.classList.add(buttonConf.className);
            button.textContent = buttonConf.text;
            button.onclick = () => {
                gameMessagePanel.classList.add('hidden');
                if (buttonConf.action) buttonConf.action();
            };
            messageButtons.appendChild(button);
        });
        gameMessagePanel.classList.remove('hidden');
    }
    // Muestra panel de compra
    function showPurchasePanel(property, player, isDoubles) {
        const afterPurchaseAction = () => determineNextStep(isDoubles);
        const buttons = [
            { text: `🛒 Comprar por $${property.price}`, action: () => {
                sounds.buy.play();
                player.money -= property.price;
                property.owner = player.id;
                if (!player.properties) player.properties = [];
                player.properties.push(property.position);
                console.log(`${player.name} bought ${property.name}. Properties: ${player.properties}`);
                updateVisuals();
                afterPurchaseAction();
            }},
            { text: `❌ Pasar`, className: 'pass', action: afterPurchaseAction }
        ];
        showMessagePanel(property.name, "¿Deseas comprar esta propiedad?", '💰', buttons);
    }
    // Cambia al siguiente jugador
    function switchPlayer() {
        console.log(`Switching player from ${players[currentPlayerIndex]?.name || 'N/A'}`);
        doublesCount = 0; // Reinicia dobles
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        if (diceTotalElement) diceTotalElement.textContent = '';
        updatePlayerInfo(); // Actualiza UI
        const nextPlayer = players[currentPlayerIndex];
        if (!nextPlayer) return;
        console.log(`Next player is ${nextPlayer.name}`);
        // Configura botones para el siguiente jugador
        if (nextPlayer.isInJail) {
            console.log(`${nextPlayer.name} is in jail.`);
            rollDiceBtn.disabled = true;
            manageBtn.disabled = false; // Puede gestionar
            showJailPanel(nextPlayer); // Muestra opciones
        } else {
            console.log(`${nextPlayer.name} is NOT in jail.`);
            rollDiceBtn.disabled = false;
            manageBtn.disabled = false;
        }
    }
    // Manda al jugador a la cárcel
    function goToJail(player) {
        if (!player) return;
        sounds.jail.play();
        console.log(`${player.name} is going to jail!`);
        doublesCount = 0; // Anula dobles
        player.position = 10; // Casilla cárcel
        player.isInJail = true;
        player.jailTurns = 0;
        updatePlayerTokensOnBoard(); // Mueve ficha visualmente
        // El turno termina. switchPlayer será llamado por quien llamó a goToJail.
    }
    // Muestra opciones para salir de la cárcel
    function showJailPanel(player) {
        if (!player) return;
        const buttons = [];
        if (player.money >= 50) { buttons.push({ text: "Pagar $50", action: () => payJailFine(player) }); }
        if (player.hasGetOutOfJailCard) { buttons.push({ text: "Usar Tarjeta", action: () => useGetOutOfJailCard(player) }); }
        buttons.push({ text: "Tirar Dados", action: () => tryRollForDoubles(player) });
        showMessagePanel("En Cárcel", `Turno ${player.jailTurns + 1}/3. Elige:`, '⛓️', buttons);
    }
    // Devuelve lista de grupos donde el jugador tiene monopolio construible
    function getPlayerMonopolies(player) {
        if (!player || !player.properties) return [];
        const ownedGroups = {};
        player.properties.forEach(propIndex => {
            const propData = boardData[propIndex];
            if (propData?.group && propData.houseCost) { // Solo construibles
                if (!ownedGroups[propData.group]) { ownedGroups[propData.group] = 0; }
                ownedGroups[propData.group]++;
            }
        });
        const monopolies = [];
        for (const group in ownedGroups) {
            const groupPropsInGame = boardData.filter(p => p.group === group).length;
            if (groupPropsInGame > 0 && ownedGroups[group] === groupPropsInGame) {
                 monopolies.push(group);
            }
        }
        return monopolies;
    }
    // Construye casa/hotel
    function buildHouse(player, property) {
        if (!player || !property || !property.houseCost) return;
        if (player.money < property.houseCost) { showMessagePanel("Fondos Insuficientes", "No tienes dinero.", '😕', [{ text: "Aceptar" }]); return; }
        if (property.houses === undefined) property.houses = 0;
        if (property.houses >= 5) { showMessagePanel("Límite", "Ya tiene un hotel.", '🏨', [{ text: "Aceptar" }]); return; }
        const monopolies = getPlayerMonopolies(player);
        if (!monopolies.includes(property.group)) { showMessagePanel("Monopolio Requerido", "Necesitas todas las propiedades del grupo.", '🏗️', [{ text: "Aceptar" }]); return; }
        const groupPropsOwned = boardData.filter(p => p.group === property.group && p.owner === player.id);
        for (const p of groupPropsOwned) {
            if (p.houses === undefined) p.houses = 0;
            if (property.houses > p.houses) { showMessagePanel("Construcción", `Construye en "${p.name}" primero.`, '🏗️', [{ text: "Aceptar" }]); return; }
        }
        player.money -= property.houseCost;
        property.houses++;
        showMessagePanel("¡Construcción!", `${property.name} ahora tiene ${property.houses >= 5 ? 'un hotel' : property.houses + ' casa(s)'}.`, '🔨', [{ text: "Aceptar", action: updatePlayerInfo }]);
        updateVisuals();
    }
    // Inicializa el estado del juego
    function initializeGame() {
        // Reiniciar tablero
        boardData.forEach((cell, index) => {
            cell.position = index;
            cell.owner = null;
            if (cell.houseCost !== undefined) cell.houses = 0;
        });
        // Reiniciar jugadores
        players.forEach(p => {
            p.properties = [];
            p.money = 1500;
            p.position = 0;
            p.isInJail = false;
            p.jailTurns = 0;
            p.hasGetOutOfJailCard = false;
        });
        currentPlayerIndex = 0;
        doublesCount = 0;
        lastDiceRoll = 0;
        // Actualizar UI
        createBoard(); // Redibuja por si acaso
        updatePlayerInfo();
        updatePlayerTokensOnBoard(); // Coloca fichas
        // Habilitar controles
        rollDiceBtn.disabled = false;
        manageBtn.disabled = false;
        if (diceTotalElement) diceTotalElement.textContent = '';
        if (gameMessagePanel) gameMessagePanel.classList.add('hidden'); // Ocultar mensajes
    }
    // Intenta sacar dobles para salir de la cárcel
    function tryRollForDoubles(player) {
        if (!player) return;
        player.jailTurns++;
        sounds.dice.play();
        if (die1Element) die1Element.classList.add('rolling');
        if (die2Element) die2Element.classList.add('rolling');
        if (diceTotalElement) diceTotalElement.textContent = '';
        setTimeout(() => {
            if (die1Element) die1Element.classList.remove('rolling');
            if (die2Element) die2Element.classList.remove('rolling');
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            updateDieFace(die1Element, die1);
            updateDieFace(die2Element, die2);
            if (diceTotalElement) diceTotalElement.textContent = die1 + die2;
            lastDiceRoll = die1 + die2;
            if (die1 === die2) { // SALE
                player.isInJail = false; player.jailTurns = 0;
                showMessagePanel("¡Dobles!", `¡Sacaste dobles (${die1})! Sales y avanzas ${lastDiceRoll}.`, '🎲', [{ text: "Aceptar", action: () => animateMovePlayer(lastDiceRoll, false) }]); // Mover, no tirar de nuevo
            } else { // NO SALE
                if (player.jailTurns >= 3) { // 3er intento fallido
                    if (player.money >= 50) { // Pagar forzado
                        showMessagePanel("Último Intento Fallido", `Fallaste. Debes pagar $50.`, '😬', [{ text: "Pagar y Avanzar", action: () => {
                            player.money -= 50; player.isInJail = false; player.jailTurns = 0; updatePlayerInfo();
                            showMessagePanel("¡Libre!", `Pagas $50 y avanzas ${lastDiceRoll}.`, '✅', [{ text: "Aceptar", action: () => animateMovePlayer(lastDiceRoll, false) }]);
                        }}]);
                    } else { // Bancarrota pendiente
                        showMessagePanel("Sin Salida", `Fallaste y no tienes $50. (Bancarrota pendiente)`, '☠️', [{ text: "Aceptar", action: switchPlayer }]);
                    }
                } else { // Intento 1 o 2 fallido
                    showMessagePanel("Mala Suerte", `No dobles. Sigues en cárcel (${player.jailTurns}/3).`, '❌', [{ text: "Aceptar", action: switchPlayer }]);
                }
            }
        }, 1000);
    }
    // Paga para salir de la cárcel
    function payJailFine(player) {
        if (!player) return;
        if (player.money >= 50) {
            player.money -= 50; player.isInJail = false; player.jailTurns = 0; updatePlayerInfo();
            showMessagePanel("¡Libre!", "Pagaste $50. Tira los dados.", '✅', [{ text: "Aceptar", action: () => { rollDiceBtn.disabled = false; manageBtn.disabled = false; }}]);
        } else {
            showMessagePanel("Fondos Insuficientes", "No tienes $50.", '😕', [{ text: "Aceptar", action: () => showJailPanel(player) }]);
        }
    }
    // Usa tarjeta para salir de la cárcel
    function useGetOutOfJailCard(player) {
        if (!player) return;
        player.hasGetOutOfJailCard = false; player.isInJail = false; player.jailTurns = 0; updatePlayerInfo();
        showMessagePanel("¡Libre!", "Usaste tu tarjeta. Tira los dados.", '🃏', [{ text: "Aceptar", action: () => { rollDiceBtn.disabled = false; manageBtn.disabled = false; }}]);
    }
    // Devuelve color del grupo
    function getGroupColor(group) {
        const colors = { litoral: '#a52a2a', norte: '#add8e6', cuyo: '#d8bfd8', mesopotamia: '#ffa500', patagonia: '#ff0000', sur: '#ffff00', centro: '#008000', capital: '#0000ff', airport: '#808080', utility: '#d3d3d3' };
        return colors[group] || '#ccc';
    }
    // Actualiza bordes, brillo, casas
    function updateVisuals() {
        boardData.forEach((cell, index) => {
            if (cell.price || cell.group === 'airport' || cell.group === 'utility') {
                const cellEl = document.getElementById(`cell-${index}`);
                if (!cellEl) return;
                // Casas/Hoteles
                let houseDisplay = cellEl.querySelector('.house-display');
                if (cell.houses && cell.houses > 0) {
                    if (!houseDisplay) { houseDisplay = document.createElement('div'); houseDisplay.classList.add('house-display'); cellEl.appendChild(houseDisplay); }
                    houseDisplay.textContent = cell.houses >= 5 ? '🏨' : '🏠'.repeat(cell.houses);
                } else { if (houseDisplay) houseDisplay.remove(); }
                // Borde y Brillo
                cellEl.classList.remove('monopoly-glow'); cellEl.style.boxShadow = 'none';
                if (cell.owner) {
                    const owner = players.find(p => p.id === cell.owner);
                    if (owner) {
                        cellEl.style.borderColor = owner.color;
                        const ownerMonopolies = getPlayerMonopolies(owner);
                        if (ownerMonopolies.includes(cell.group)) {
                            cellEl.classList.add('monopoly-glow');
                            cellEl.style.boxShadow = `0 0 8px ${owner.color}, 0 0 15px ${owner.color} inset`;
                        }
                    } else { cellEl.style.borderColor = '#4a4e69'; cell.owner = null; }
                } else { cellEl.style.borderColor = '#4a4e69'; }
            }
        });
        updatePlayerInfo(); // Actualiza info (dinero, etc.)
        updatePlayerTokensOnBoard(); // Re-posiciona fichas (importante si hay cambios visuales)
    }
    // Muestra modal de gestión
    function manageProperties() {
         const currentPlayer = players[currentPlayerIndex];
         if (!currentPlayer) return;
         const monopolies = getPlayerMonopolies(currentPlayer);
         manageModalContent.innerHTML = ''; // Limpiar contenido previo
         const ownedPropertiesIndices = currentPlayer.properties || [];

         if (ownedPropertiesIndices.length === 0) {
             manageModalContent.innerHTML = '<p>No tienes propiedades para gestionar.</p>';
         } else {
              // Agrupar por grupo
             const groupedProperties = ownedPropertiesIndices.reduce((acc, propIndex) => {
                  const propData = boardData[propIndex];
                  if(propData?.group){ // Solo propiedades con grupo
                      if (!acc[propData.group]) acc[propData.group] = [];
                      acc[propData.group].push(propData);
                  }
                 return acc;
             }, {});

             // Ordenar grupos (opcional, para mejor visualización)
             const sortedGroups = Object.keys(groupedProperties).sort((a, b) => {
                 // Puedes definir un orden específico si quieres
                 return boardData.findIndex(p => p.group === a) - boardData.findIndex(p => p.group === b);
             });

             sortedGroups.forEach(group => { // Iterar sobre grupos ordenados
                 const groupDiv = document.createElement('div');
                 groupDiv.className = 'manage-group';
                 groupDiv.style.borderLeftColor = getGroupColor(group);
                 const canBuild = monopolies.includes(group) && boardData.find(p => p.group === group)?.houseCost; // Solo si tienen costo de casa

                 groupedProperties[group].forEach(prop => {
                     if (prop.houses === undefined) prop.houses = 0; // Asegurar que houses existe
                     const propDiv = document.createElement('div');
                     propDiv.className = 'manage-property';
                     propDiv.innerHTML = `<div class="property-name">${prop.name} ${prop.houses > 0 ? (prop.houses >= 5 ? '🏨' : '🏠'.repeat(prop.houses)) : ''}</div>`;

                     if (canBuild) {
                         const buildBtn = document.createElement('button');
                         buildBtn.className = 'modal-btn build-btn';
                         buildBtn.textContent = `Construir ($${prop.houseCost})`;
                         buildBtn.disabled = prop.houses >= 5; // Deshabilitar si ya tiene hotel
                         buildBtn.onclick = () => buildHouse(currentPlayer, prop);
                         propDiv.appendChild(buildBtn);
                         // Aquí podrías añadir botón de vender casa
                     }
                     // Aquí podrías añadir botón de hipotecar/deshipotecar
                     groupDiv.appendChild(propDiv);
                 });
                 manageModalContent.appendChild(groupDiv);
             });
         }

         // Botón para iniciar intercambio (siempre presente)
         const tradeBtnContainer = document.createElement('div');
         tradeBtnContainer.style.textAlign = 'center';
         tradeBtnContainer.style.marginTop = '20px';
         const tradeBtn = document.createElement('button');
         tradeBtn.id = 'initiate-trade-btn';
         tradeBtn.className = 'modal-btn';
         tradeBtn.textContent = '🤝 Iniciar Intercambio';
         tradeBtn.onclick = initiateTrade;
         tradeBtnContainer.appendChild(tradeBtn);
         manageModalContent.appendChild(tradeBtnContainer);

         manageModalOverlay.classList.add('visible');
     }

    // --- FUNCIONES DE INTERCAMBIO ---
    function initiateTrade() { /* ... (sin cambios) ... */ }
    function setupTradeInterface(initiator, recipient) { /* ... (sin cambios) ... */ }
    function populateTradeProperties(player, container) { /* ... (sin cambios) ... */ }
    function proposeTrade() { /* ... (sin cambios) ... */ }
    function reviewTradeOffer() { /* ... (sin cambios) ... */ }
    function executeTrade() { /* ... (ya incluye actualización de player.properties) ... */ }
    function rejectTrade(silent = false) { /* ... (sin cambios) ... */ }

    // --- FUNCIÓN TARJETA PROPIEDAD ---
    function showPropertyCard(index) { /* ... (sin cambios) ... */ }

    // --- EVENT LISTENERS ---
    if (addPlayerBtn) addPlayerBtn.addEventListener('click', addPlayerSetup);
    if (removePlayerBtn) removePlayerBtn.addEventListener('click', removePlayerSetup);
    if (startGameBtn) startGameBtn.addEventListener('click', launchGame);
    if (rollDiceBtn) rollDiceBtn.addEventListener('click', rollDice);
    if (manageBtn) manageBtn.addEventListener('click', manageProperties);
    if (manageModalCloseBtn) manageModalCloseBtn.addEventListener('click', () => manageModalOverlay?.classList.remove('visible'));
    if (propertyCardCloseBtn) propertyCardCloseBtn.addEventListener('click', () => propertyCardOverlay?.classList.remove('visible'));

    // --- PREPARACIÓN INICIAL ---
    addPlayerSetup(); // Añade el primer jugador
    addPlayerSetup(); // Añade el segundo jugador
});