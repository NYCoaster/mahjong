// Taiwanese Mahjong Game - Pure JavaScript
class TaiwaneseMahjong {
  constructor() {
    this.deck = [];
    this.players = [[], [], [], []];
    this.discards = [];
    this.currentPlayer = 0;
    this.lastDiscard = null;
    this.paused = false;
    this.sortMode = 'suit';
    this.coins = 100;
    this.skins = { classic: 0, neon: 200, gold: 400 };
    
    this.initDeck();
    this.deal();
  }

  // Taiwanese tile names (Traditional Chinese)
  getTileName(tile) {
    const suits = { chars: '萬', bamboo: '條', dots: '筒' };
    const honors = { 
      east: '東', south: '南', west: '西', north: '北',
      red: '中', green: '發', white: '白'
    };
    
    if (tile.t === 'honor') return honors[tile.v];
    return `${tile.v}${suits[tile.t]}`;
  }

  initDeck() {
    // Suited tiles (1-9, 4 each)
    ['chars', 'bamboo', 'dots'].forEach(suit => {
      for (let v = 1; v <= 9; v++) {
        for (let i = 0; i < 4; i++) {
          this.deck.push({ t: suit, v });
        }
      }
    });
    
    // Honors (winds + dragons, 4 each)
    ['east', 'south', 'west', 'north', 'red', 'green', 'white'].forEach(h => {
      for (let i = 0; i < 4; i++) {
        this.deck.push({ t: 'honor', v: h });
      }
    });
    
    // Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  deal() {
    // 13 tiles each (dealer gets 14th later)
    for (let i = 0; i < 13; i++) {
      for (let p = 0; p < 4; p++) {
        this.players[p].push(this.deck.pop());
      }
    }
    this.sortHand(0);
    console.log('🀄 台灣麻將 - 牌已發完');
    console.log(`莊家手牌 (${this.players[0].length} 張):`, 
                this.players[0].map(t => this.getTileName(t)).join(' '));
    this.playTurn(0);
  }

  sortHand(player) {
    const suitOrder = { chars: 0, bamboo: 1, dots: 2, honor: 3 };
    this.players[player].sort((a, b) => {
      if (this.sortMode === 'suit') {
        if (a.t === b.t) return (a.v || 0) - (b.v || 0);
        return suitOrder[a.t] - suitOrder[b.t];
      } else {
        const va = typeof a.v === 'number' ? a.v : 10;
        const vb = typeof b.v === 'number' ? b.v : 10;
        if (va === vb) return suitOrder[a.t] - suitOrder[b.t];
        return va - vb;
      }
    });
  }

  playTurn(player) {
    if (this.deck.length === 0) {
      console.log('🀫 牌山見底 - 流局');
      return;
    }

    console.log(`\n--- 輪到玩家 ${player + 1} (${['莊家', '下家', '對家', '上家'][player]}) ---`);

    if (player === 0) {
      // Player turn - draw tile
      const tile = this.deck.pop();
      this.players[0].push(tile);
      this.sortHand(0);
      
      console.log('抽牌:', this.getTileName(tile));
      console.log('當前手牌:', this.players[0].map(t => this.getTileName(t)).join(' '));
      
      // Check self-kong
      if (this.checkKong(0)) {
        this.askKong(0);
        return;
      }
      
      // Check win
      if (this.isWin(this.players[0])) {
        console.log('🎉 自摸胡牌!');
        this.win(0);
        return;
      }
      
      // Ask to discard
      this.askDiscard(0);
      
    } else {
      // AI turn
      setTimeout(() => {
        const tile = this.deck.pop();
        this.players[player].push(tile);
        console.log(`AI${player} 抽牌: ${this.getTileName(tile)}`);
        
        // AI discards random tile
        const discardIdx = Math.floor(Math.random() * this.players[player].length);
        const discardTile = this.players[player].splice(discardIdx, 1)[0];
        this.lastDiscard = { tile: discardTile, from: player };
        this.discards.push(discardTile);
        
        console.log(`AI${player} 打出: ${this.getTileName(discardTile)}`);
        
        // Check if player 0 can call
        if (this.checkCalls(discardTile)) {
          this.askCalls(discardTile);
        } else {
          this.playTurn((player + 1) % 4);
        }
      }, 500);
    }
  }

  checkKong(player) {
    const counts = {};
    this.players[player].forEach(t => {
      const key = t.t + ':' + t.v;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.values(counts).some(count => count === 4);
  }

  askKong(player) {
    console.log('\n🤔 槓牌機會! 輸入 "kong" 或繼續打牌:');
    // In real game, would show UI buttons
  }

  checkCalls(tile) {
    // Simplified: check if player 0 can pung/chow
    const hand = this.players[0];
    const matches = hand.filter(t => t.t === tile.t && t.v === tile.v);
    return matches.length >= 2;
  }

  askCalls(tile) {
    console.log(`\n❓ 可吃碰槓: ${this.getTileName(tile)}`);
    console.log('可選: hu, kong, pung, chow, pass');
    // In real game, would pause for player input
  }

  isWin(hand) {
    if (hand.length !== 14) return false;
    
    // Try each possible pair
    const counts = {};
    hand.forEach(t => {
      const key = t.t + ':' + t.v;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    for (const key in counts) {
      if (counts[key] >= 2) {
        const remaining = { ...counts };
        remaining[key] -= 2;
        if (this.checkMelds(remaining)) return true;
      }
    }
    return false;
  }

  checkMelds(counts) {
    // Find first remaining tile
    let firstKey = null;
    for (const k in counts) {
      if (counts[k] > 0) {
        firstKey = k;
        break;
      }
    }
    if (!firstKey) return true;

    const [suit, value] = firstKey.split(':');
    const v = parseInt(value);

    // Try triplet
    if (counts[firstKey] >= 3) {
      counts[firstKey] -= 3;
      if (this.checkMelds(counts)) return true;
      counts[firstKey] += 3;
    }

    // Try sequence (suited tiles only)
    if (['chars', 'bamboo', 'dots'].includes(suit) && v <= 7) {
      const next1 = suit + ':' + (v + 1);
      const next2 = suit + ':' + (v + 2);
      if ((counts[next1] || 0) > 0 && (counts[next2] || 0) > 0) {
        counts[firstKey]--;
        counts[next1]--;
        counts[next2]--;
        if (this.checkMelds(counts)) return true;
        counts[firstKey]++;
        counts[next1]++;
        counts[next2]++;
      }
    }

    return false;
  }

  askDiscard(player) {
    console.log('\n請選擇要打出的牌 (輸入牌序號 0-' + (this.players[0].length - 1) + '):');
    // In real implementation, integrate with UI clicks
  }

  win(player) {
    console.log(`🎊 玩家 ${player + 1} 胡牌! 獲得 100 獎金`);
    this.coins += 100;
    console.log(`總獎金: ${this.coins}`);
  }

  // Player actions
  discard(index) {
    if (this.currentPlayer !== 0 || this.players[0].length % 3 !== 2) return;
    
    const tile = this.players[0].splice(index, 1)[0];
    this.lastDiscard = { tile, from: 0 };
    this.discards.push(tile);
    
    console.log('打出:', this.getTileName(tile));
    this.sortHand(0);
    
    // Check other players' calls
    for (let p = 1; p <= 3; p++) {
      if (this.checkCalls(tile)) {
        console.log(`玩家 ${p} 可吃碰: ${this.getTileName(tile)}`);
      }
    }
    
    // Next player
    this.playTurn(1);
  }

  toggleSort() {
    this.sortMode = this.sortMode === 'suit' ? 'num' : 'suit';
    this.sortHand(0);
    console.log(`排序模式: ${this.sortMode === 'suit' ? '牌型優先' : '數字優先'}`);
  }

  // Buy skins
  buySkin(skin) {
    if (this.skins[skin] > this.coins) {
      console.log('金幣不足');
      return false;
    }
    if (!this.skins[skin]) {
      console.log(`已擁有 ${skin}`);
      return true;
    }
    
    this.coins -= this.skins[skin];
    console.log(`購買 ${skin} 成功! 剩餘金幣: ${this.coins}`);
    return true;
  }
}

// Usage - Run in browser console or Node.js
const game = new TaiwaneseMahjong();

// Example commands:
// game.discard(5);           // Discard 6th tile (index 5)
// game.toggleSort();         // Toggle sort mode  
// game.buySkin('neon');      // Buy neon skin
// console.log(game.getTileName({t:'honor', v:'east'}));  // "東"
