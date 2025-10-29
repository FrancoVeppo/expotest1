'use strict'; 

// --- CLASE PARA LA ESCENA 3D (THREE.JS) ---
class Stage {
    constructor() {
        this.container = document.getElementById('game');
        const gameRect = this.container.getBoundingClientRect();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(gameRect.width, gameRect.height);
        this.renderer.setClearColor(0xe0e0e0, 1); 
        this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.loader = new THREE.TextureLoader();
        this.currentBackgroundUrl = '';
        let aspect = gameRect.width / gameRect.height;
        let d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
        this.camera.position.set(2, 2, 2);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.light = new THREE.DirectionalLight(0xffffff, 0.5);
        this.light.position.set(0, 499, 0);
        this.scene.add(this.light);
        this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.softLight);
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }
    updateBackground(score) {
        let textureUrl = '';
        if (score < 15) { textureUrl = 'https://i.postimg.cc/T1bBwL3G/bosque.jpg'; } 
        else if (score < 30) { textureUrl = 'https://i.postimg.cc/k47dKqfK/ciudad.jpg'; } 
        else if (score < 45) { textureUrl = 'https://i.postimg.cc/6q00jP5d/nubes.jpg'; } 
        else { textureUrl = 'https://i.postimg.cc/pXv9jYzr/espacio.jpg'; }
        if (this.currentBackgroundUrl === textureUrl) return;
        this.currentBackgroundUrl = textureUrl;
        this.loader.load(textureUrl, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace; 
            this.scene.background = texture;
        }, undefined, (err) => { 
            console.error('Error al cargar imagen de fondo:', textureUrl, err); 
            this.scene.background = new THREE.Color(0xe0e0e0); 
            this.currentBackgroundUrl = ''; 
        });
    }
    setCamera(y, speed = 0.3) {
        TweenLite.to(this.camera.position, speed, { y: y + 4, ease: Power1.easeInOut });
        TweenLite.to(this.camera.lookAt, speed, { y: y, ease: Power1.easeInOut });
    }
    onResize() {
        const gameRect = this.container.getBoundingClientRect();
        let viewSize = 30;
        this.renderer.setSize(gameRect.width, gameRect.height);
        this.camera.left = gameRect.width / -viewSize;
        this.camera.right = gameRect.width / viewSize;
        this.camera.top = gameRect.height / viewSize;
        this.camera.bottom = gameRect.height / -viewSize;
        this.camera.updateProjectionMatrix();
    }
    render = function () { this.renderer.render(this.scene, this.camera); }
    add = function (elem) { this.scene.add(elem); }
    remove = function (elem) { this.scene.remove(elem); }
}

// --- CLASE PARA CADA BLOQUE ---
class Block {
    constructor(block) {
        this.STATES = { ACTIVE: 'active', STOPPED: 'stopped', MISSED: 'missed' };
        this.MOVE_AMOUNT = 12;
        this.dimension = { width: 0, height: 0, depth: 0 };
        this.position = { x: 0, y: 0, z: 0 };
        this.targetBlock = block; // El bloque de abajo (o null si es la base)
        this.isBase = !block; // Es true si 'block' es null/undefined
        this.index = this.isBase ? 0 : this.targetBlock.index + 1;
        this.workingPlane = this.index % 2 ? 'x' : 'z'; 
        this.workingDimension = this.index % 2 ? 'width' : 'depth';
        const BASE_SIZE = 10;
        this.dimension.width = this.isBase ? BASE_SIZE : this.targetBlock.dimension.width;
        this.dimension.height = 2; // Altura fija
        this.dimension.depth = this.isBase ? BASE_SIZE : this.targetBlock.dimension.depth;
        this.position.x = this.isBase ? 0 : this.targetBlock.position.x;
        this.position.y = this.dimension.height * this.index; // Altura Z en Three.js
        this.position.z = this.isBase ? 0 : this.targetBlock.position.z;
        if (this.isBase) { this.color = 0x303038; } 
        else { const baseHue = 200; const hueStep = 15; const hue = (baseHue + ((this.index - 1) * hueStep)) % 360; const saturation = 80; const lightness = 65; const hslColor = new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100); this.color = hslColor.getHex(); }
        this.state = this.isBase ? this.STATES.STOPPED : this.STATES.ACTIVE;
        if (!this.isBase) { this.speed = -0.1 - (this.index * 0.005); if (this.speed < -4) this.speed = -4; this.direction = this.speed; this.position[this.workingPlane] = Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT; }
        let geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));
        this.material = new THREE.MeshToonMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    }
    reverseDirection() { this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed); }
    place() {
        this.state = this.STATES.STOPPED;
        if (this.isBase) return { plane: 'x', direction: 0 }; 
        let overlap = this.targetBlock.dimension[this.workingDimension] - Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane]);
        let blocksToReturn = { 
            plane: this.workingPlane, 
            direction: this.direction,
            originalPositionBeforeAdjust: { ...this.position } 
        };
        if (this.dimension[this.workingDimension] - overlap < 0.3) { overlap = this.dimension[this.workingDimension]; blocksToReturn.bonus = true; this.position.x = this.targetBlock.position.x; this.position.z = this.targetBlock.position.z; this.dimension.width = this.targetBlock.dimension.width; this.dimension.depth = this.targetBlock.dimension.depth; }
        if (overlap > 0) {
            let choppedDimensions = { width: this.dimension.width, height: this.dimension.height, depth: this.dimension.depth }; choppedDimensions[this.workingDimension] -= overlap; this.dimension[this.workingDimension] = overlap;
            let placedGeometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth); placedGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2)); let placedMesh = new THREE.Mesh(placedGeometry, this.material);
            let choppedGeometry = new THREE.BoxGeometry(choppedDimensions.width, choppedDimensions.height, choppedDimensions.depth); choppedGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(choppedDimensions.width / 2, choppedDimensions.height / 2, choppedDimensions.depth / 2)); let choppedMesh = new THREE.Mesh(choppedGeometry, this.material);
            let choppedPosition = { ...blocksToReturn.originalPositionBeforeAdjust }; 
            if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) { this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane]; choppedPosition[this.workingPlane] = blocksToReturn.originalPositionBeforeAdjust[this.workingPlane]; } 
            else { this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane] + overlap - this.dimension[this.workingDimension]; choppedPosition[this.workingPlane] = blocksToReturn.originalPositionBeforeAdjust[this.workingPlane] + overlap; }
            if (!blocksToReturn.bonus) { this.position[this.workingPlane] += (this.targetBlock.dimension[this.workingDimension] - this.dimension[this.workingDimension]) / 2; }
            placedMesh.position.set(this.position.x, this.position.y, this.position.z); 
            blocksToReturn.placed = placedMesh; 
            if (!blocksToReturn.bonus) { blocksToReturn.chopped = choppedMesh; blocksToReturn.choppedPosition = choppedPosition; }
        } else { this.state = this.STATES.MISSED; blocksToReturn.placed = null; blocksToReturn.chopped = this.mesh; blocksToReturn.choppedPosition = this.position; }
        this.dimension[this.workingDimension] = overlap > 0 ? overlap : 0;
        return blocksToReturn;
    }
    tick() { if (this.state == this.STATES.ACTIVE) { let value = this.position[this.workingPlane]; if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) this.reverseDirection(); this.position[this.workingPlane] += this.direction; this.mesh.position[this.workingPlane] = this.position[this.workingPlane]; } }
}
// --- CLASE PRINCIPAL DEL JUEGO ---
class Game {
    constructor() {
        this.STATES = { 'LOADING': 'loading', 'PLAYING': 'playing', 'READY': 'ready', 'ENDED': 'ended', 'RESETTING': 'resetting' };
        this.blocks = []; 
        this.state = this.STATES.LOADING;
        this.stage = new Stage();
        this.mainContainer = document.getElementById('container');
        document.getElementById('game').style.zIndex = 1; 
        this.scoreContainer = document.getElementById('score');
        this.startButton = document.getElementById('start-button');
        this.instructions = document.getElementById('instructions');
        this.rankingListElement = document.getElementById('ranking-list');
        this.usernameInput = document.getElementById('username-input');
        this.gameReadyScreen = document.querySelector('.game-ready'); 
        this.gameOverScreen = document.querySelector('.game-over'); 

        // Nombre de usuario (localStorage)
        this.playerName = localStorage.getItem('bloquePlayerName') || ""; 
        this.usernameInput.value = this.playerName; 

        // --- ¡¡IMPORTANTE!! Pega tu URL aquí ---
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyvgrrjPok6rhA2UObft-7DWclmq7FIikMvn_3R8AuFa0eTy7CGSJfOov_VeaExKU2f/exec'; // <--- REEMPLAZA ESTO

        // Grupos de Three.js
        this.newBlocks = new THREE.Group();     
        this.placedBlocks = new THREE.Group();  
        this.choppedBlocks = new THREE.Group(); 
        this.stage.add(this.newBlocks); this.stage.add(this.placedBlocks); this.stage.add(this.choppedBlocks);
        
        // --- INICIALIZACIÓN ---
        this.bindEvents(); 
        this.checkStartButtonState(); 
        this.addBaseBlock(); 
        this.updateState(this.STATES.READY); 
        this.tick(); 
        
        // Cargar ranking desde Google Sheets
        this.loadRankingFromSheet(); // Llamada inicial
    }

    addBaseBlock() {
         this.placedBlocks.clear(); this.blocks = []; 
         const base = new Block(null); this.blocks.push(base); this.placedBlocks.add(base.mesh); this.stage.updateBackground(0); 
    }
    bindEvents() { 
        this.usernameInput.addEventListener('input', () => this.checkStartButtonState());
        this.startButton.addEventListener('click', (e) => { if (!this.startButton.disabled) this.handleStartAction(); }); 
        this.startButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (!this.startButton.disabled) this.handleStartAction(); }, { passive: false });
        this.mainContainer.addEventListener('click', (e) => { if (e.target !== this.startButton && e.target !== this.usernameInput) this.handleGameAction(); });
        this.mainContainer.addEventListener('touchstart', (e) => { if (e.target !== this.usernameInput) e.preventDefault(); if (e.target === this.startButton || e.target === this.usernameInput) return; this.handleGameAction(); }, { passive: false }); 
        document.addEventListener('keydown', e => { if (e.keyCode == 32) { e.preventDefault(); if (this.state === this.STATES.READY && document.activeElement !== this.usernameInput && !this.startButton.disabled) { this.handleStartAction(); } else if (this.state === this.STATES.PLAYING || this.state === this.STATES.ENDED) { this.handleGameAction(); } } });
    }
    checkStartButtonState() { 
        const name = this.usernameInput.value.trim(); const isDisabled = name === ""; this.startButton.disabled = isDisabled; this.startButton.style.opacity = isDisabled ? '0.5' : '1'; this.startButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    }
    handleStartAction() { 
        if (this.state === this.STATES.READY && !this.startButton.disabled) { const name = this.usernameInput.value.trim(); this.playerName = name; localStorage.setItem('bloquePlayerName', this.playerName); this.usernameInput.blur(); this.startGame(); }
    }
    handleGameAction() { 
         switch (this.state) { case this.STATES.PLAYING: this.placeBlock(); break; case this.STATES.ENDED: this.restartGame(); break; }
    }
    async loadRankingFromSheet() { 
        this.rankingListElement.innerHTML = '<li>Cargando puntajes...</li>'; if (!this.WEB_APP_URL || this.WEB_APP_URL === 'TU_URL_DE_APLICACION_WEB_AQUI') { console.error("URL no configurada."); this.rankingListElement.innerHTML = '<li>Error al cargar (URL no config.)</li>'; return; } try { const response = await fetch(this.WEB_APP_URL + '?limit=10'); if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); } const topScores = await response.json(); this.rankingListElement.innerHTML = ''; if (!Array.isArray(topScores) || topScores.length === 0) { this.rankingListElement.innerHTML = '<li>Aún no hay puntajes. ¡Juega!</li>'; } else { topScores.forEach(entry => { const li = document.createElement('li'); li.textContent = `${entry.name ?? "Anónimo"} - ${entry.score} puntos`; this.rankingListElement.appendChild(li); }); } } catch (error) { console.error("Error al cargar ranking:", error); this.rankingListElement.innerHTML = '<li>Error al cargar puntajes.</li>'; }
    }
    async saveScoreToSheet(newScore) { 
        if (newScore <= 0) return; if (!this.WEB_APP_URL || this.WEB_APP_URL === 'TU_URL_DE_APLICACION_WEB_AQUI') { console.error("URL no config. No se guarda puntaje."); return; } const dataToSend = { name: this.playerName, score: newScore }; console.log("Enviando puntaje:", dataToSend); try { const response = await fetch(this.WEB_APP_URL, { method: 'POST', mode: 'no-cors', cache: 'no-cache', body: JSON.stringify(dataToSend) }); console.log("Puntaje enviado (respuesta no-cors)."); setTimeout(() => { this.loadRankingFromSheet(); }, 1500); } catch (error) { console.error("Error al guardar puntaje:", error); }
    }
    updateState(newState) { 
        for(let key in this.STATES) this.mainContainer.classList.remove(this.STATES[key]); this.mainContainer.classList.add(newState); this.state=newState;
    }
    startGame() { 
        if (this.state !== this.STATES.READY) return; this.scoreContainer.innerHTML = '0'; this.gameReadyScreen.style.display = 'none'; this.gameOverScreen.style.display = 'none'; this.updateState(this.STATES.PLAYING); 
        this.newBlocks.clear(); this.choppedBlocks.clear(); while(this.placedBlocks.children.length > 1) { this.placedBlocks.remove(this.placedBlocks.children[1]); }
        if (this.blocks.length > 0) { this.blocks = [this.blocks[0]]; this.blocks[0].mesh.position.set(0, 0, 0); this.blocks[0].mesh.scale.set(1, 1, 1); this.blocks[0].mesh.rotation.set(0, 0, 0); } else { this.addBaseBlock(); }
        this.stage.setCamera(2, 0.1); this.stage.updateBackground(0); this.addBlock(); 
    }
    restartGame() { 
        if (this.state === this.STATES.RESETTING) return; this.updateState(this.STATES.RESETTING);
        this.gameReadyScreen.style.display = 'flex'; this.gameOverScreen.style.display = 'none'; this.checkStartButtonState(); 
        this.newBlocks.clear(); this.choppedBlocks.clear();
        let blocksToRemove = this.placedBlocks.children.slice(1); let removeSpeed = 0.2; let delayAmount = 0.02; let totalRemoveTime = blocksToRemove.length * delayAmount + removeSpeed; 
        blocksToRemove.forEach((blockMesh, i) => { const delay = (blocksToRemove.length - 1 - i) * delayAmount; TweenLite.to(blockMesh.scale, removeSpeed, { x: 0, y: 0, z: 0, delay: delay, ease: Power1.easeIn, onComplete: () => { if (blockMesh && this.placedBlocks.children.includes(blockMesh)) this.placedBlocks.remove(blockMesh); }}); TweenLite.to(blockMesh.rotation, removeSpeed, { y: 0.5, delay: delay, ease: Power1.easeIn }); });
        this.stage.setCamera(2, totalRemoveTime); 
        const finalScore = this.blocks.length - 1; if (finalScore > 0) { let countdown = { value: finalScore }; TweenLite.to(countdown, totalRemoveTime, { value: 0, ease: Power1.easeIn, onUpdate: () => { this.scoreContainer.innerHTML = String(Math.round(countdown.value)); }}); } else { this.scoreContainer.innerHTML = '0'; }
        if (this.blocks.length > 0) { this.blocks = [this.blocks[0]]; }
        setTimeout(() => { this.updateState(this.STATES.READY); this.stage.updateBackground(0); }, Math.max(200, totalRemoveTime * 1000)); 
    }
    placeBlock() { 
        let currentBlock = this.blocks[this.blocks.length - 1]; if (!currentBlock || this.state !== this.STATES.PLAYING || currentBlock.state !== currentBlock.STATES.ACTIVE) return; 
        currentBlock.state = currentBlock.STATES.STOPPED; let newBlocks = currentBlock.place(); this.newBlocks.remove(currentBlock.mesh); 
        if (currentBlock.state === currentBlock.STATES.MISSED) { if (newBlocks.chopped) this.animateChoppedBlock(newBlocks.chopped, newBlocks.plane, newBlocks.direction, newBlocks.choppedPosition, currentBlock.targetBlock); this.endGame(); return; }
        if (newBlocks.placed) { currentBlock.mesh = newBlocks.placed; this.placedBlocks.add(currentBlock.mesh); }
        if (newBlocks.chopped) this.animateChoppedBlock(newBlocks.chopped, newBlocks.plane, newBlocks.direction, newBlocks.choppedPosition, currentBlock.targetBlock); 
        this.addBlock();
    }
    animateChoppedBlock(choppedMesh, plane, direction, initialChoppedPosition, targetBlock) { 
        choppedMesh.position.set(initialChoppedPosition.x, initialChoppedPosition.y, initialChoppedPosition.z); this.choppedBlocks.add(choppedMesh); const outwardOffset = 5; let targetLateralPosition = initialChoppedPosition[plane]; 
        if (targetBlock) { targetLateralPosition += (initialChoppedPosition[plane] > targetBlock.position[plane]) ? outwardOffset : -outwardOffset; } else { targetLateralPosition += (direction > 0) ? -outwardOffset : outwardOffset; } 
        let positionParams = { y: '-=40', ease: Power1.easeIn, [plane]: targetLateralPosition, onComplete: () => { if (choppedMesh) this.choppedBlocks.remove(choppedMesh); }}; 
        let rotateRandomness = 10; let rotationParams = { delay: 0.05, x: plane == 'z' ? ((Math.random()*rotateRandomness)-(rotateRandomness/2)):0.1, z: plane == 'x' ? ((Math.random()*rotateRandomness)-(rotateRandomness/2)):0.1, y: Math.random()*0.1, }; 
        TweenLite.to(choppedMesh.position, 1, positionParams); TweenLite.to(choppedMesh.rotation, 1, rotationParams);
    }
    addBlock() { 
        let lastBlock = this.blocks[this.blocks.length - 1]; if (this.state === this.STATES.PLAYING) this.stage.updateBackground(this.blocks.length); 
        let newBlock = new Block(lastBlock); this.newBlocks.add(newBlock.mesh); this.blocks.push(newBlock);       
        this.scoreContainer.innerHTML = String(this.blocks.length - 1); this.stage.setCamera(this.blocks.length * 2); 
        if (this.blocks.length >= 5) this.instructions.classList.add('hide'); else if (this.state === this.STATES.PLAYING) this.instructions.classList.remove('hide'); 
    }
    endGame() { 
        if (this.state !== this.STATES.PLAYING) return; this.updateState(this.STATES.ENDED); const finalScore = this.blocks.length - 1; 
        this.saveScoreToSheet(finalScore); // Guardar en Sheet
        this.gameOverScreen.style.display = 'flex';
    }
    tick() { 
        if (this.state === this.STATES.PLAYING && this.blocks.length > 0) { const currentBlock = this.blocks[this.blocks.length - 1]; if (currentBlock && currentBlock.state === currentBlock.STATES.ACTIVE) { currentBlock.tick(); } }
        this.stage.render(); requestAnimationFrame(() => { this.tick() }); 
    }
}
let game = new Game(); // Iniciar el juego
