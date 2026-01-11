// game.js - UPDATED for Unicode Visuals
const suits = ['bamboo', 'dots', 'chars'];
const honors = ['east', 'south', 'west', 'north', 'red', 'green', 'white'];
let deck = [];
let players = [[], [], [], []];
let turn = 0;

// Unicode Base Points
const TILE_MAP = {
    'east': 0x1F000, 'south': 0x1F001, 'west': 0x1F002, 'north': 0x1F003,
    'red': 0x1F004, 'green': 0x1F005, 'white': 0x1F006,
    'chars': 0x1F007, // Starts at 1
    'bamboo': 0x1F010,
    'dots': 0x1F019
};

function initDeck() {
    deck = [];
    suits.forEach(suit => {
        for (let i = 1; i <= 9; i++) {
            for (let k = 0; k < 4; k++) deck.push({ type: suit, val: i });
        }
    });
    honors.forEach(honor => {
        for (let k = 0; k < 4; k++) deck.push({ type: 'honor', val: honor });
    });
    shuffle(deck);
}

function getTileChar(tile) {
    if (tile.type === 'honor') {
        return String.fromCodePoint(TILE_MAP[tile.val]);
    }
    // For suits, add value - 1 to the base code point
    const base = TILE_MAP[tile.type];
    return String.fromCodePoint(base + (tile.val - 1));
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
    // Deal 16 tiles (Taiwanese style)
    for (let i = 0; i < 16; i++) {
        for (let p = 0; p < 4; p++) players[p].push(deck.pop());
    }
    players[0].sort((a,b) => getTileValue(a) - getTileValue(b)); // Auto-sort player
    renderHands();
    drawTile(0);
}

function getTileValue(tile) {
    // Helper for sorting: give each type a numeric base
    const typeScores = { 'chars': 100, 'dots': 200, 'bamboo': 300, 'honor': 400 };
    let val = tile.val;
    if (typeof val === 'string') val = honors.indexOf(val);
    return (typeScores[tile.type] || 0) + val;
}

function drawTile(playerIndex) {
    if (deck.length === 0) return alert("Draw! Game Over.");
    const tile = deck.pop();
    players[playerIndex].push(tile);
    updateStatus(`Player ${playerIndex}'s Turn`);
    renderHands();
    
    if (playerIndex !== 0) {
        setTimeout(() => botPlay(playerIndex), 800);
    }
}

function botPlay(playerIndex) {
    const handSize = players[playerIndex].length;
    const discardIndex = Math.floor(Math.random() * handSize);
    discardTile(playerIndex, discardIndex);
}

function discardTile(playerIndex, tileIndex) {
    const tile = players[playerIndex].splice(tileIndex, 1)[0];
    addToDiscard(tile);
    if (playerIndex === 0) players[0].sort((a,b) => getTileValue(a) - getTileValue(b));
    renderHands();
    
    turn = (turn + 1) % 4;
    drawTile(turn);
}

function addToDiscard(tile) {
    const el = document.createElement('div');
    el.className = `tile tile-face ${tile.type}`;
    el.textContent = getTileChar(tile);
    document.getElementById('discard-pile').appendChild(el);
}

function renderHands() {
    // Player
    const pDiv = document.getElementById('hand-player');
    pDiv.innerHTML = '';
    players[0].forEach((tile, idx) => {
        const el = document.createElement('div');
        el.className = `tile tile-face ${tile.type}`;
        el.textContent = getTileChar(tile);
        el.onclick = () => { if (turn === 0) discardTile(0, idx); };
        pDiv.appendChild(el);
    });

    // Bots (Hidden)
    ['right', 'top', 'left'].forEach((pos, i) => {
        const botDiv = document.getElementById(`hand-${pos}`);
        botDiv.innerHTML = '';
        players[i+1].forEach(() => {
            const el = document.createElement('div');
            el.className = 'tile tile-back';
            // U+1F02B is the Unicode 'Mahjong Tile Back' symbol
            el.textContent = String.fromCodePoint(0x1F02B);
            botDiv.appendChild(el);
        });
    });
}

function updateStatus(msg) { document.getElementById('status-text').innerText = msg; }
startGame();
