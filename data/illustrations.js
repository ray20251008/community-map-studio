/**
 * 手繪風社區地圖插畫與圖示庫
 * 提供豐富的 SVG 手繪插畫、地標、裝飾元件與無障礙檢核圖示
 */

const HANDDRAWN_ILLUSTRATIONS = {
  // --- 美食類插畫 ---
  food_duck_noodles: {
    name: '鴨肉麵線 / 當歸湯',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <ellipse cx="50" cy="65" rx="38" ry="18" fill="#e8c39e" stroke="#4a3525" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="50" cy="58" rx="35" ry="15" fill="#fcf4e4" stroke="#4a3525" stroke-width="2.5"/>
      <ellipse cx="50" cy="58" rx="30" ry="11" fill="#b86b35" opacity="0.65"/>
      <!-- Noodles & meat slices -->
      <path d="M28 55 Q 35 45 42 56 Q 48 48 55 58 Q 63 50 72 55" stroke="#faecd4" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M32 60 Q 40 52 48 61 Q 58 54 68 59" stroke="#faecd4" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="52" rx="7" ry="4" fill="#6d391e" stroke="#3b1d0d" stroke-width="1.5" transform="rotate(-15 44 52)"/>
      <ellipse cx="56" cy="50" rx="8" ry="4.5" fill="#7a3f21" stroke="#3b1d0d" stroke-width="1.5" transform="rotate(10 56 50)"/>
      <!-- Chopsticks & steam -->
      <path d="M60 40 L85 15" stroke="#d97d38" stroke-width="3" stroke-linecap="round"/>
      <path d="M64 42 L89 18" stroke="#d97d38" stroke-width="3" stroke-linecap="round"/>
      <path d="M38 38 Q 35 28 40 20" stroke="#b0a89f" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
      <path d="M50 35 Q 54 24 49 16" stroke="#b0a89f" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
    </svg>`
  },
  food_cake: {
    name: '傳統大餅 / 漢餅',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <ellipse cx="50" cy="62" rx="34" ry="18" fill="#d99b50" stroke="#4a3525" stroke-width="3"/>
      <ellipse cx="50" cy="50" rx="34" ry="18" fill="#f5c278" stroke="#4a3525" stroke-width="3"/>
      <!-- Seal imprint on pastry -->
      <circle cx="50" cy="50" r="14" fill="#e74c3c" opacity="0.85"/>
      <text x="50" y="55" font-family="'Noto Serif TC', serif" font-weight="900" font-size="14" fill="#fff" text-anchor="middle">喜</text>
      <!-- Sesame seeds -->
      <circle cx="30" cy="46" r="1.5" fill="#fff"/>
      <circle cx="68" cy="48" r="1.5" fill="#fff"/>
      <circle cx="42" cy="38" r="1.5" fill="#fff"/>
      <circle cx="58" cy="60" r="1.5" fill="#fff"/>
    </svg>`
  },
  food_rice_cake: {
    name: '傳統米糕 / 油飯',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <path d="M28 50 L34 78 Q 50 86 66 78 L72 50 Z" fill="#e0dacb" stroke="#4a3525" stroke-width="3"/>
      <path d="M25 50 Q 50 38 75 50 Q 50 62 25 50 Z" fill="#d29653" stroke="#4a3525" stroke-width="3"/>
      <path d="M30 46 Q 42 32 50 42 Q 62 30 70 46" fill="#a4632b" stroke="#4a3525" stroke-width="2"/>
      <circle cx="42" cy="40" r="3" fill="#663311"/>
      <circle cx="54" cy="38" r="2.5" fill="#663311"/>
      <path d="M48 34 Q 52 28 58 35" stroke="#3c8d40" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  food_shaved_ice: {
    name: '古早味冰品 / 豆花',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <path d="M25 52 L35 80 Q 50 88 65 80 L75 52 Z" fill="#9cd3db" stroke="#4a3525" stroke-width="3"/>
      <path d="M20 52 Q 50 30 80 52 Q 50 64 20 52 Z" fill="#fff" stroke="#4a3525" stroke-width="3"/>
      <path d="M30 48 Q 50 15 70 48" fill="#fffef7" stroke="#4a3525" stroke-width="2.5"/>
      <!-- Syrup & red beans -->
      <path d="M40 32 Q 50 24 60 38" stroke="#8d4024" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="45" cy="42" r="3" fill="#602315"/>
      <circle cx="52" cy="39" r="3" fill="#602315"/>
      <circle cx="58" cy="44" r="3" fill="#602315"/>
      <circle cx="36" cy="44" r="3" fill="#d4af37"/>
    </svg>`
  },
  food_coffee: {
    name: '手沖咖啡 / 文青茶飲',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <rect x="30" y="42" width="36" height="38" rx="6" fill="#f8f4eb" stroke="#4a3525" stroke-width="3"/>
      <path d="M66 50 Q 80 50 80 62 Q 80 72 66 72" fill="none" stroke="#4a3525" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="48" cy="42" rx="18" ry="6" fill="#6f4e37" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M42 32 Q 38 22 44 14" stroke="#a0988e" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
      <path d="M54 30 Q 58 20 52 12" stroke="#a0988e" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
      <text x="48" y="65" font-size="10" fill="#a4632b" font-weight="bold" text-anchor="middle">CAFE</text>
    </svg>`
  },
  food_bread: {
    name: '手作烘焙 / 麵包點心',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <path d="M22 62 Q 22 36 50 36 Q 78 36 78 62 Q 78 72 50 72 Q 22 72 22 62 Z" fill="#e8a85a" stroke="#4a3525" stroke-width="3"/>
      <path d="M35 45 Q 38 52 42 45" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M48 43 Q 51 50 55 43" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M60 45 Q 63 52 67 45" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  food_bao: {
    name: '手工包子 / 水煎包',
    category: 'food',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <path d="M26 68 Q 26 40 50 38 Q 74 40 74 68 Q 74 76 50 76 Q 26 76 26 68 Z" fill="#fff9ef" stroke="#4a3525" stroke-width="3"/>
      <path d="M44 42 Q 50 34 56 42" stroke="#4a3525" stroke-width="2" fill="none"/>
      <path d="M38 46 Q 50 36 62 46" stroke="#4a3525" stroke-width="2" fill="none"/>
      <circle cx="50" cy="38" r="2.5" fill="#e53935"/>
    </svg>`
  },

  // --- 建築與景點插畫 ---
  spot_temple: {
    name: '順天宮 / 信仰廟宇',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Roof -->
      <path d="M12 44 Q 50 26 88 44 L 80 50 Q 50 36 20 50 Z" fill="#e65100" stroke="#4a3525" stroke-width="3"/>
      <path d="M22 34 Q 50 18 78 34 L 74 38 Q 50 26 26 38 Z" fill="#f57c00" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M10 42 Q 6 36 12 32" stroke="#4a3525" stroke-width="2.5" fill="none"/>
      <path d="M90 42 Q 94 36 88 32" stroke="#4a3525" stroke-width="2.5" fill="none"/>
      <!-- Pillars & Body -->
      <rect x="25" y="50" width="50" height="34" fill="#ffecb3" stroke="#4a3525" stroke-width="3"/>
      <rect x="30" y="50" width="8" height="34" fill="#c62828" stroke="#4a3525" stroke-width="2"/>
      <rect x="62" y="50" width="8" height="34" fill="#c62828" stroke="#4a3525" stroke-width="2"/>
      <!-- Plaque & door -->
      <rect x="42" y="54" width="16" height="10" fill="#b71c1c" stroke="#4a3525" stroke-width="1.5"/>
      <text x="50" y="62" font-size="6" fill="#ffeb3b" font-weight="bold" text-anchor="middle">順天宮</text>
      <rect x="44" y="67" width="12" height="17" rx="3" fill="#4e342e"/>
    </svg>`
  },
  spot_church: {
    name: '基督長老教會 / 禮拜堂',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Steeple & Body -->
      <path d="M50 16 L 38 42 L 62 42 Z" fill="#90caf9" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M50 8 L 50 20 M 46 12 L 54 12" stroke="#4a3525" stroke-width="3" stroke-linecap="round"/>
      <rect x="40" y="42" width="20" height="42" fill="#e3f2fd" stroke="#4a3525" stroke-width="3"/>
      <rect x="22" y="52" width="56" height="32" fill="#fff" stroke="#4a3525" stroke-width="3"/>
      <!-- Windows & door -->
      <path d="M46 64 A 4 4 0 0 1 54 64 L 54 74 L 46 74 Z" fill="#1e88e5" stroke="#4a3525" stroke-width="1.5"/>
      <rect x="45" y="74" width="10" height="10" fill="#5d4037"/>
    </svg>`
  },
  spot_story_house: {
    name: '土庫故事屋 / 日式老屋',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Japanese Roof -->
      <polygon points="15,48 50,22 85,48" fill="#546e7a" stroke="#4a3525" stroke-width="3"/>
      <rect x="24" y="48" width="52" height="34" fill="#d7ccc8" stroke="#4a3525" stroke-width="3"/>
      <!-- Wooden lattices -->
      <rect x="30" y="56" width="16" height="18" fill="#fff8e1" stroke="#4a3525" stroke-width="2"/>
      <line x1="38" y1="56" x2="38" y2="74" stroke="#4a3525" stroke-width="1.5"/>
      <line x1="30" y1="65" x2="46" y2="65" stroke="#4a3525" stroke-width="1.5"/>
      <rect x="54" y="56" width="16" height="26" fill="#8d6e63" stroke="#4a3525" stroke-width="2"/>
      <line x1="62" y1="56" x2="62" y2="82" stroke="#4a3525" stroke-width="1.5"/>
      <path d="M12 82 L 88 82" stroke="#4a3525" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  spot_granary: {
    name: '八角糧倉 / 歷史建築',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Octagonal roof -->
      <polygon points="50,20 20,44 80,44" fill="#ffb74d" stroke="#4a3525" stroke-width="3"/>
      <polygon points="24,44 32,78 68,78 76,44" fill="#ffe0b2" stroke="#4a3525" stroke-width="3"/>
      <circle cx="50" cy="56" r="8" fill="#8d6e63" stroke="#4a3525" stroke-width="2"/>
      <line x1="50" y1="20" x2="50" y2="12" stroke="#4a3525" stroke-width="2.5"/>
      <rect x="44" y="66" width="12" height="12" fill="#5d4037"/>
    </svg>`
  },
  spot_market: {
    name: '土庫第一市場 / 傳統市集',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Market Awning -->
      <path d="M18 42 L 82 42 L 76 56 L 14 56 Z" fill="#4caf50" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M18 42 L 28 42 L 24 56 L 14 56 Z" fill="#ffeb3b"/>
      <path d="M38 42 L 48 42 L 44 56 L 34 56 Z" fill="#ffeb3b"/>
      <path d="M58 42 L 68 42 L 64 56 L 54 56 Z" fill="#ffeb3b"/>
      <rect x="22" y="56" width="56" height="26" fill="#fff9c4" stroke="#4a3525" stroke-width="3"/>
      <!-- Veggie / fruit stands -->
      <circle cx="34" cy="68" r="5" fill="#f44336"/>
      <circle cx="44" cy="68" r="5" fill="#ff9800"/>
      <circle cx="54" cy="68" r="5" fill="#8bc34a"/>
      <circle cx="64" cy="68" r="5" fill="#9c27b0"/>
    </svg>`
  },
  spot_school: {
    name: '土庫商工 / 學校文教',
    category: 'spot',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <rect x="22" y="44" width="56" height="38" fill="#e1f5fe" stroke="#4a3525" stroke-width="3"/>
      <polygon points="50,22 18,44 82,44" fill="#0288d1" stroke="#4a3525" stroke-width="3"/>
      <rect x="30" y="52" width="10" height="10" fill="#fff" stroke="#4a3525" stroke-width="1.5"/>
      <rect x="60" y="52" width="10" height="10" fill="#fff" stroke="#4a3525" stroke-width="1.5"/>
      <rect x="45" y="64" width="10" height="18" fill="#546e7a"/>
      <circle cx="50" cy="34" r="4" fill="#ffeb3b" stroke="#4a3525" stroke-width="1.5"/>
    </svg>`
  },

  // --- 裝飾插圖（在地旅人、牛車、地圖元素） ---
  decor_traveler_bike: {
    name: '騎單車旅行者',
    category: 'decor',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Wheels -->
      <circle cx="28" cy="70" r="14" fill="none" stroke="#4a3525" stroke-width="3"/>
      <circle cx="72" cy="70" r="14" fill="none" stroke="#4a3525" stroke-width="3"/>
      <!-- Frame -->
      <polygon points="28,70 50,70 64,52 42,52" fill="none" stroke="#e65100" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="50" y1="70" x2="42" y2="44" stroke="#e65100" stroke-width="3.5"/>
      <line x1="72" y1="70" x2="62" y2="44" stroke="#e65100" stroke-width="3.5"/>
      <line x1="58" y1="44" x2="68" y2="42" stroke="#4a3525" stroke-width="3" stroke-linecap="round"/>
      <!-- Person -->
      <circle cx="48" cy="26" r="8" fill="#ffd54f" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M48 34 Q 52 44 44 54" stroke="#00acc1" stroke-width="6" stroke-linecap="round"/>
      <path d="M48 36 L 62 44" stroke="#ffd54f" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  decor_ox_cart: {
    name: '牽牛車 / 農村風情',
    category: 'decor',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <!-- Ox Body -->
      <ellipse cx="64" cy="58" rx="20" ry="14" fill="#78909c" stroke="#4a3525" stroke-width="2.5"/>
      <circle cx="82" cy="50" r="10" fill="#78909c" stroke="#4a3525" stroke-width="2.5"/>
      <path d="M86 44 Q 92 38 88 34" stroke="#4a3525" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Cart -->
      <rect x="18" y="46" width="30" height="18" fill="#bcaaa4" stroke="#4a3525" stroke-width="2.5"/>
      <circle cx="33" cy="72" r="11" fill="#d7ccc8" stroke="#4a3525" stroke-width="3"/>
      <line x1="48" y1="56" x2="64" y2="58" stroke="#5d4037" stroke-width="3"/>
    </svg>`
  },
  decor_postbox: {
    name: '社區郵筒 / 招呼站',
    category: 'decor',
    svg: `<svg viewBox="0 0 100 100" class="hd-ill-svg">
      <rect x="36" y="28" width="28" height="42" rx="14" fill="#2e7d32" stroke="#4a3525" stroke-width="3"/>
      <rect x="42" y="44" width="16" height="4" fill="#fff"/>
      <rect x="45" y="70" width="10" height="20" fill="#757575" stroke="#4a3525" stroke-width="2.5"/>
    </svg>`
  }
};

// 友善無障礙圖示集 (專為反面盤點卡設計)
const ACCESSIBILITY_ICONS = {
  step_0: `<svg viewBox="0 0 24 24" class="acc-svg"><path d="M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="10" r="3" fill="currentColor"/><path d="M8 13v5M13 14l3-3 3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  step_ramp: `<svg viewBox="0 0 24 24" class="acc-svg"><polygon points="3,19 21,19 21,11" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8" cy="9" r="2.5" fill="currentColor"/><path d="M8 11.5l3 3.5" stroke="currentColor" stroke-width="2"/></svg>`,
  step_many: `<svg viewBox="0 0 24 24" class="acc-svg"><path d="M3 19h5v-4h5v-4h5V7h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
  wheelchair: `<svg viewBox="0 0 24 24" class="acc-svg"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M19 13v-2c0-.55-.45-1-1-1h-5v6h3l3 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 18a5 5 0 1 1 0-10" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  narrow_door: `<svg viewBox="0 0 24 24" class="acc-svg"><rect x="4" y="3" width="16" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/><circle cx="7" cy="12" r="1" fill="currentColor"/></svg>`,
  
  toilet_accessible: `<svg viewBox="0 0 24 24" class="acc-svg"><path d="M4 4h7v16H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 8h5v12h-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="8" r="1.5" fill="currentColor"/><circle cx="17.5" cy="11" r="1" fill="currentColor"/><text x="12" y="21" font-size="7" font-weight="bold" fill="currentColor" text-anchor="middle">WC</text></svg>`,
  toilet_gender: `<svg viewBox="0 0 24 24" class="acc-svg"><circle cx="9" cy="6" r="2" fill="currentColor"/><path d="M9 8v6M7 11h4" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="6" r="2" fill="currentColor"/><path d="M14 14l4-6M18 8h-4" stroke="currentColor" stroke-width="1.5"/></svg>`,
  
  elder_seat: `<svg viewBox="0 0 24 24" class="acc-svg"><circle cx="10" cy="5" r="2" fill="currentColor"/><path d="M7 19h6l2-7h-4l-1 4H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 19v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  pet_friendly: `<svg viewBox="0 0 24 24" class="acc-svg"><circle cx="6" cy="8" r="2" fill="currentColor"/><circle cx="18" cy="8" r="2" fill="currentColor"/><circle cx="10" cy="5" r="1.5" fill="currentColor"/><circle cx="14" cy="5" r="1.5" fill="currentColor"/><ellipse cx="12" cy="14" rx="5" ry="4" fill="currentColor"/></svg>`,
  water_refill: `<svg viewBox="0 0 24 24" class="acc-svg"><path d="M12 3a6 6 0 0 0-6 6c0 4 6 12 6 12s6-8 6-12a6 6 0 0 0-6-6z" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="11" font-size="6" font-weight="bold" fill="currentColor" text-anchor="middle">H2O</text></svg>`
};
