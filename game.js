const suits = ['bamboo', 'dots', 'chars'];
const honors = ['east', 'south', 'west', 'north', 'red', 'green', 'white'];
let deck = [];
let players = [[], [], [], []]; // 0: User, 1: Right, 2: Top, 3: Left
let turn = 0;

function initDeck() {
    deck = [];
    // Generate Standard Suit Tiles (1-9)
    suits.forEach(suit => {
        for (let i = 1; i <= 9; i++) {
            for (let k = 0; k < 4; k++) deck.push({ type: suit, val: i });
        }
    });
    // Generate Honor Tiles
    honors.forEach(honor => {
        for (let k = 0; k < 4; k++) deck.push({ type: 'honor', val: honor });
    });
    shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame() {
    initDeck();
    players = [[], [], [], []];
    document.getElementById('discard-pile').innerHTML = '';
    
    // Deal 16 tiles to everyone (Taiwanese Rule)
    for (let i = 0; i < 16; i++) {
        for (let p = 0; p < 4; p++) players[p].push(deck.pop());
    }
    
    renderHands();
    drawTile(0); // User starts
}

function drawTile(playerIndex) {
    if (deck.length === 0) return alert("Draw!");
    const tile = deck.pop();
    players[playerIndex].push(tile);
    updateStatus(`Player ${playerIndex}'s Turn`);
    renderHands();
    
    if (playerIndex !== 0) {
        setTimeout(() => botPlay(playerIndex), 1000);
    }
}

function botPlay(playerIndex) {
    // Simple Bot: Discards random tile
    const handSize = players[playerIndex].length;
    const discardIndex = Math.floor(Math.random() * handSize);
    discardTile(playerIndex, discardIndex);
}

function discardTile(playerIndex, tileIndex) {
    const tile = players[playerIndex].splice(tileIndex, 1)[0];
    addToDiscard(tile);
    renderHands();
    
    // Pass turn
    turn = (turn + 1) % 4;
    drawTile(turn);
}

function addToDiscard(tile) {
    const el = document.createElement('div');
    el.className = `tile suit-${tile.type}`;
    el.textContent = formatTile(tile);
    document.getElementById('discard-pile').appendChild(el);
}

function renderHands() {
    // Render Player Hand (Interactive)
    const pDiv = document.getElementById('hand-player');
    pDiv.innerHTML = '';
    players[0].forEach((tile, idx) => {
        const el = document.createElement('div');
        el.className = `tile suit-${tile.type}`;
        el.textContent = formatTile(tile);
        el.onclick = () => {
            if (turn === 0) discardTile(0, idx);
        };
        pDiv.appendChild(el);
    });

    // Render Bot Hands (Hidden)
    ['right', 'top', 'left'].forEach((pos, i) => {
        const botDiv = document.getElementById(`hand-${pos}`);
        botDiv.innerHTML = '';
        players[i+1].forEach(() => {
            const el = document.createElement('div');
            el.className = 'tile face-down';
            botDiv.appendChild(el);
        });
    });
}

function formatTile(tile) {
    if (tile.type === 'honor') return tile.val[0].toUpperCase();
    return `${tile.val} ${tile.type[0].toUpperCase()}`;
}

function updateStatus(msg) { document.getElementById('status-text').innerText = msg; }
function sortHand() {
    players[0].sort((a,b) => (a.type > b.type) ? 1 : -1);
    renderHands();
}

startGame();
