// --- CONFIGURATION ---
const SUITS = ['wan', 'tong', 'tiao']; // Characters, Dots, Bamboo
const WORDS = ['east', 'south', 'west', 'north', 'red', 'green', 'white'];
// Taiwanese Mahjong uses 16 tiles.
const HAND_SIZE = 16;

let deck = [];
let playerHand = [];
let opponentHand = [];
let discardPile = [];
let isPlayerTurn = true;

// --- INITIALIZATION ---
function initGame() {
    deck = createDeck();
    shuffle(deck);
    playerHand = [];
    opponentHand = [];
    discardPile = [];

    // Deal 16 tiles to each
    for(let i = 0; i < HAND_SIZE; i++) {
        playerHand.push(deck.pop());
        opponentHand.push(deck.pop());
    }

    // Sort player hand for better UX
    sortHand(playerHand);

    // Player draws the first card to start (17th tile)
    drawTile('player');

    render();
}

// --- DECK CREATION ---
function createDeck() {
    let newDeck = [];

    // Number suits (1-9, 4 of each)
    SUITS.forEach(suit => {
        for (let i = 1; i <= 9; i++) {
            for (let count = 0; count < 4; count++) {
                newDeck.push({ type: 'suit', suit: suit, value: i });
            }
        }
    });

    // Word suits (Winds/Dragons, 4 of each)
    WORDS.forEach(word => {
        for (let count = 0; count < 4; count++) {
            newDeck.push({ type: 'word', suit: 'word', value: word });
        }
    });

    // Note: Flowers/Seasons omitted for simplicity in this prototype
    return newDeck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- GAME LOGIC ---

function drawTile(who) {
    if (deck.length === 0) {
        alert("Wall is empty! Draw game.");
        return;
    }

    const tile = deck.pop();
    if (who === 'player') {
        playerHand.push(tile);
        isPlayerTurn = true;
        updateStatus("Your Turn: Discard a tile.");
    } else {
        opponentHand.push(tile);
        // Simple AI: Discard random tile after 1 second
        setTimeout(() => aiDiscard(), 1000);
    }
    render();
}

function playerDiscard(index) {
    if (!isPlayerTurn) return;

    const tile = playerHand.splice(index, 1)[0];
    discardPile.push(tile);
    sortHand(playerHand);

    isPlayerTurn = false;
    updateStatus("Opponent's Turn...");
    render();

    // Pass turn to AI
    setTimeout(() => drawTile('opponent'), 1000);
}

function aiDiscard() {
    // Basic AI: Discards the last tile drawn (very dumb AI)
    const randomIndex = Math.floor(Math.random() * opponentHand.length);
    const tile = opponentHand.splice(randomIndex, 1)[0];
    discardPile.push(tile);

    updateStatus("Your Turn: Draw a tile...");
    render();

    // Pass turn back to player
    setTimeout(() => drawTile('player'), 500);
}

function sortHand(hand) {
    // Sort by Suit first, then Value
    hand.sort((a, b) => {
        if (a.suit < b.suit) return -1;
        if (a.suit > b.suit) return 1;
        // If suits are same, check value
        // Handle numbers vs words
        if (typeof a.value === 'number' && typeof b.value === 'number') {
            return a.value - b.value;
        }
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });
}

// --- RENDERING ---

function getTileDisplay(tile) {
    // Map internal values to display characters
    // Simple mapping for prototype
    if(tile.suit === 'wan') return tile.value + '萬';
    if(tile.suit === 'tong') return tile.value + '筒';
    if(tile.suit === 'tiao') return tile.value + '索';

    const map = {
        'east': '東', 'south': '南', 'west': '西', 'north': '北',
        'red': '中', 'green': '發', 'white': '白'
    };
    return map[tile.value] || tile.value;
}

function render() {
    const playerDiv = document.getElementById('player-hand');
    const opponentDiv = document.getElementById('opponent-hand');
    const discardDiv = document.getElementById('discard-pile');

    // Render Player Hand
    playerDiv.innerHTML = '';
    playerHand.forEach((tile, index) => {
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.suit = tile.suit;
        el.innerText = getTileDisplay(tile);
        el.onclick = () => playerDiscard(index);
        playerDiv.appendChild(el);
    });

    // Render Opponent Hand (Backs only)
    opponentDiv.innerHTML = '';
    opponentHand.forEach(() => {
        const el = document.createElement('div');
        el.className = 'tile';
        opponentDiv.appendChild(el);
    });

    // Render Discard Pile
    discardDiv.innerHTML = '';
    discardPile.forEach(tile => {
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.suit = tile.suit;
        el.innerText = getTileDisplay(tile);
        discardDiv.appendChild(el);
    });
}

function updateStatus(msg) {
    document.getElementById('status').innerText = msg;
}

// Start immediately
initGame();