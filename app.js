/**
 * 手繪風社區活動地圖與社區資源卡製作系統核心應用程式 (Community Map Studio)
 * 整合：向量手繪畫布渲染、魔鬼氈式圖釘拖曳定位、3D雙面A6資源卡、無障礙友善檢核、實體列印排版與踏查導覽
 */

(function () {
  'use strict';

  // ================= 狀態管理 (App State) =================
  const state = {
    communityData: null,
    activeView: 'map', // 'map' | 'cards' | 'print' | 'guide'
    activeCategory: 'all', // 'all' | 'food' | 'spot'
    sideIndexCategory: 'food', // 'food' | 'spot'
    searchQuery: '',
    selectedLocation: null,
    isCardFlipped: false,
    printMode: 'cards_front', // 'cards_front' | 'cards_back' | 'poster_map' | 'stickers' | 'worksheet'
    
    // 地圖平移與縮放視角
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    startPanX: 0,
    startPanY: 0,
    draggedPinId: null
  };

  // ================= 初始化 (Initialization) =================
  function initApp() {
    // 載入土庫範本或 LocalStorage 快取
    const savedData = localStorage.getItem('COMMUNITY_MAP_DATA');
    if (savedData) {
      try {
        state.communityData = JSON.parse(savedData);
      } catch (e) {
        state.communityData = JSON.parse(JSON.stringify(TUKU_SAMPLE_DATA));
      }
    } else {
      state.communityData = JSON.parse(JSON.stringify(TUKU_SAMPLE_DATA));
    }

    // 綁定 DOM 事件
    bindEvents();

    // 更新介面標題與計數
    updateHeaderInfo();

    // 渲染 SVG 手繪地圖
    renderSvgMap();

    // 渲染側邊索引清單
    renderSideIndex();

    // 渲染資源卡網格視圖
    renderCardsGrid();

    // 預設渲染列印預覽
    renderPrintPreview();
  }

  // ================= DOM 事件綁定 =================
  function bindEvents() {
    // 1. 視圖分頁切換
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        switchView(view);
      });
    });

    // 2. 地圖搜尋欄
    const searchInput = document.getElementById('mapSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        filterMapPins();
        renderSideIndex();
      });
    }

    // 3. 地圖分類篩選膠囊
    const filterBar = document.getElementById('categoryFilterBar');
    if (filterBar) {
      filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.dataset.category;
        filterMapPins();
      });
    }

    // 4. 側邊索引分類切換
    const tabIndexFood = document.getElementById('tabIndexFood');
    const tabIndexSpot = document.getElementById('tabIndexSpot');
    if (tabIndexFood && tabIndexSpot) {
      tabIndexFood.addEventListener('click', () => {
        tabIndexFood.classList.add('active');
        tabIndexSpot.classList.remove('active');
        state.sideIndexCategory = 'food';
        renderSideIndex();
      });
      tabIndexSpot.addEventListener('click', () => {
        tabIndexSpot.classList.add('active');
        tabIndexFood.classList.remove('active');
        state.sideIndexCategory = 'spot';
        renderSideIndex();
      });
    }

    // 5. 地圖縮放與平移按鈕
    document.getElementById('btnZoomIn')?.addEventListener('click', () => adjustZoom(0.15));
    document.getElementById('btnZoomOut')?.addEventListener('click', () => adjustZoom(-0.15));
    document.getElementById('btnZoomReset')?.addEventListener('click', resetZoom);

    // 6. 地圖畫布滑鼠拖曳平移 (Pan & Zoom)
    const mapWrapper = document.getElementById('mapCanvasWrapper');
    if (mapWrapper) {
      mapWrapper.addEventListener('mousedown', onMapMouseDown);
      window.addEventListener('mousemove', onMapMouseMove);
      window.addEventListener('mouseup', onMapMouseUp);
      mapWrapper.addEventListener('wheel', onMapWheel, { passive: false });
    }

    // 7. 3D 資源卡彈窗控制項
    document.getElementById('btnFlipCard')?.addEventListener('click', toggleCardFlip);
    document.getElementById('btnCloseCardModal')?.addEventListener('click', closeCardModal);
    document.getElementById('cardModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'cardModalBackdrop') closeCardModal();
    });
    document.getElementById('btnSpeechCard')?.addEventListener('click', speakCurrentCard);

    // 8. 點位編輯彈窗
    document.getElementById('btnAddPoint')?.addEventListener('click', () => openEditModal(null));
    document.getElementById('btnEditCurrentCard')?.addEventListener('click', () => {
      closeCardModal();
      openEditModal(state.selectedLocation);
    });
    document.getElementById('btnCloseEditModal')?.addEventListener('click', closeEditModal);
    document.getElementById('btnCancelEdit')?.addEventListener('click', closeEditModal);
    document.getElementById('pointEditForm')?.addEventListener('submit', onSavePointForm);

    // 9. 列印模式切換
    document.querySelectorAll('.print-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.print-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.printMode = btn.dataset.printMode;
        renderPrintPreview();
      });
    });

    // 10. 快速列印與社區切換
    document.getElementById('btnQuickPrint')?.addEventListener('click', () => {
      switchView('print');
      setTimeout(() => window.print(), 300);
    });
    document.getElementById('btnBatchPrintCards')?.addEventListener('click', () => {
      switchView('print');
      state.printMode = 'cards_front';
      document.querySelectorAll('.print-type-btn').forEach(b => b.classList.toggle('active', b.dataset.printMode === 'cards_front'));
      renderPrintPreview();
    });

    document.getElementById('btnSwitchCommunity')?.addEventListener('click', promptCommunitySwitcher);

    // 11. 卡片總覽頁面搜尋
    document.getElementById('cardsGridSearch')?.addEventListener('input', (e) => {
      renderCardsGrid(e.target.value.trim().toLowerCase());
    });
  }

  // ================= 視圖切換 =================
  function switchView(viewName) {
    state.activeView = viewName;

    // 更新導覽按鈕
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // 切換視圖面板
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    if (viewName === 'map') {
      document.getElementById('viewMap').classList.add('active');
    } else if (viewName === 'cards') {
      document.getElementById('viewCards').classList.add('active');
      renderCardsGrid();
    } else if (viewName === 'print') {
      document.getElementById('viewPrint').classList.add('active');
      renderPrintPreview();
    } else if (viewName === 'guide') {
      document.getElementById('viewGuide').classList.add('active');
    }
  }

  // ================= 介面標題與計數更新 =================
  function updateHeaderInfo() {
    const meta = state.communityData.meta || {};
    const locs = state.communityData.locations || [];
    
    document.getElementById('headerCommunityName').textContent = meta.mapTitle || '手繪風社區活動地圖';
    document.getElementById('headerSubTag').textContent = meta.communityName || '社區資源庫';

    const foodCount = locs.filter(l => l.category === 'food').length;
    const spotCount = locs.filter(l => l.category === 'spot').length;

    document.getElementById('countAll').textContent = locs.length;
    document.getElementById('countFood').textContent = foodCount;
    document.getElementById('countSpot').textContent = spotCount;
    document.getElementById('sideIndexCounter').textContent = `${locs.length} 個據點`;
  }

  // ================= SVG 手繪地圖渲染引擎 =================
  function renderSvgMap() {
    const data = state.communityData;
    if (!data) return;

    const roadsLayer = document.getElementById('mapRoadsLayer');
    const roadEdgesLayer = document.getElementById('mapRoadEdgesLayer');
    const roadLabelsLayer = document.getElementById('mapRoadLabelsLayer');
    const landmarksLayer = document.getElementById('mapLandmarksLayer');
    const pinsLayer = document.getElementById('mapPinsLayer');
    const titleArtLayer = document.getElementById('mapTitleArtLayer');
    const decorLayer = document.getElementById('mapDecorationsLayer');

    // 清空圖層
    roadsLayer.innerHTML = '';
    roadEdgesLayer.innerHTML = '';
    roadLabelsLayer.innerHTML = '';
    landmarksLayer.innerHTML = '';
    pinsLayer.innerHTML = '';
    titleArtLayer.innerHTML = '';
    decorLayer.innerHTML = '';

    // 1. 繪製手繪背景裝飾（草地小區塊與手繪紋理邊框）
    decorLayer.innerHTML = `
      <rect x="15" y="15" width="970" height="590" rx="18" fill="none" stroke="#8c6d4f" stroke-width="4" stroke-dasharray="8 4" opacity="0.65"/>
      <path d="M 40 40 Q 500 20 960 40" stroke="#bcaaa4" stroke-width="2" fill="none" opacity="0.5"/>
      <!-- Greenery patches -->
      <path d="M 120 180 C 140 160 170 170 190 190 C 170 210 140 200 120 180 Z" fill="#dcedc8" opacity="0.6"/>
      <path d="M 380 460 C 410 440 450 450 470 480 C 440 500 400 490 380 460 Z" fill="#dcedc8" opacity="0.6"/>
      <path d="M 720 380 C 760 360 800 370 820 410 C 780 430 740 420 720 380 Z" fill="#dcedc8" opacity="0.6"/>
    `;

    // 2. 繪製骨幹道路 (Road Network)
    (data.roads || []).forEach(road => {
      const pathD = pointsToSvgPath(road.points);
      
      // 道路外框 (Road edge)
      const edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      edge.setAttribute('d', pathD);
      edge.setAttribute('class', road.type === 'greenway' ? 'greenway-path' : 'road-edge');
      roadEdgesLayer.appendChild(edge);

      // 道路路面 (Road body)
      if (road.type !== 'greenway') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('class', 'road-path');
        roadsLayer.appendChild(path);

        // 道路中心虛線 (Road center dash)
        const dash = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        dash.setAttribute('d', pathD);
        dash.setAttribute('class', 'road-dash-line');
        roadsLayer.appendChild(dash);
      }

      // 道路名稱路牌標籤
      if (road.labelPos && road.name) {
        const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelG.setAttribute('transform', `translate(${road.labelPos.x}, ${road.labelPos.y})`);
        
        const badgeWidth = road.name.length * 15 + 16;
        labelG.innerHTML = `
          <rect x="${-badgeWidth/2}" y="-11" width="${badgeWidth}" height="22" rx="11" fill="#4a3828" stroke="#fdfaf2" stroke-width="2"/>
          <text x="0" y="0" class="road-label-badge">${road.name}</text>
        `;
        roadLabelsLayer.appendChild(labelG);
      }
    });

    // 3. 繪製地標插畫與文化元素
    (data.landmarks || []).forEach(lm => {
      const lmG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      lmG.setAttribute('transform', `translate(${lm.x - lm.size/2}, ${lm.y - lm.size/2})`);
      
      let illSvg = '';
      if (lm.illKey && HANDDRAWN_ILLUSTRATIONS[lm.illKey]) {
        illSvg = HANDDRAWN_ILLUSTRATIONS[lm.illKey].svg;
      }
      
      lmG.innerHTML = `
        <svg width="${lm.size}" height="${lm.size}" viewBox="0 0 100 100">
          ${illSvg}
        </svg>
        <text x="${lm.size/2}" y="${lm.size + 14}" font-family="var(--font-hand)" font-size="11" font-weight="900" fill="#4a3828" text-anchor="middle">
          ${lm.name}
        </text>
      `;
      landmarksLayer.appendChild(lmG);
    });

    // 4. 繪製右上角大地圖標題與圖例藝術文字 (對照範本精緻質感)
    titleArtLayer.innerHTML = `
      <g transform="translate(820, 45)">
        <rect x="-10" y="-15" width="165" height="50" rx="10" fill="#fdfaf2" stroke="#4a3828" stroke-width="2.5" filter="url(#pinDropShadow)"/>
        <text x="70" y="10" font-family="'Noto Serif TC', serif" font-weight="900" font-size="16" fill="#4a3828" text-anchor="middle">
          ${data.meta.mapTitle || '土庫旅行地圖'}
        </text>
        <text x="70" y="26" font-family="var(--font-hand)" font-size="10" font-weight="700" fill="#e65100" text-anchor="middle">
          手繪風・社區活動地圖
        </text>
      </g>
    `;

    // 5. 繪製點位圖釘貼紙 (Sticker Pins)
    (data.locations || []).forEach(loc => {
      const pinG = createPinSvgElement(loc);
      pinsLayer.appendChild(pinG);
    });
  }

  // 輔助函式：將多點座標陣列轉為平滑 SVG Path
  function pointsToSvgPath(pts) {
    if (!pts || pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      if (i === 1 && pts.length === 2) {
        d += ` L ${pts[1][0]} ${pts[1][1]}`;
      } else {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midX = (prev[0] + curr[0]) / 2;
        const midY = (prev[1] + curr[1]) / 2;
        d += ` Q ${prev[0]} ${prev[1]} ${midX} ${midY}`;
        if (i === pts.length - 1) {
          d += ` L ${curr[0]} ${curr[1]}`;
        }
      }
    }
    return d;
  }

  // 創建單一圖釘 SVG 元素 (支援點擊開啟資源卡與拖曳定位)
  function createPinSvgElement(loc) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `map-pin-group ${loc.category}`);
    g.setAttribute('id', `map-pin-${loc.id}`);
    g.setAttribute('data-id', loc.id);
    g.setAttribute('transform', `translate(${loc.x}, ${loc.y})`);
    g.setAttribute('filter', 'url(#pinDropShadow)');

    const isFood = loc.category === 'food';
    const pinColor = isFood ? '#e65100' : '#00838f';
    const pinBadge = loc.code || '01';

    g.innerHTML = `
      <!-- Pin Pinpoint pointer -->
      <path d="M 0 0 L -8 -16 A 14 14 0 1 1 8 -16 Z" fill="${pinColor}" stroke="#2c2523" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- White Inner badge -->
      <circle cx="0" cy="-20" r="10" fill="#fff" stroke="#2c2523" stroke-width="1.5"/>
      <!-- Number Code -->
      <text x="0" y="-19" font-family="var(--font-hand)" font-weight="900" font-size="10" fill="${pinColor}" text-anchor="middle" dominant-baseline="central">
        ${pinBadge}
      </text>
      <!-- Label tooltip on hover -->
      <g class="pin-hover-tag" transform="translate(0, 16)" opacity="0.95">
        <rect x="${-loc.name.length * 7 - 6}" y="-8" width="${loc.name.length * 14 + 12}" height="18" rx="6" fill="#2c2523"/>
        <text x="0" y="2" font-family="var(--font-hand)" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">
          ${loc.name}
        </text>
      </g>
    `;

    // 點擊事件：開啟 3D 雙面資源卡
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      openLocationCard(loc);
    });

    // 拖曳事件 (魔鬼氈定位互動)
    g.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      state.draggedPinId = loc.id;
    });

    return g;
  }

  // ================= 地圖圖釘即時搜尋與篩選 =================
  function filterMapPins() {
    const q = state.searchQuery;
    const cat = state.activeCategory;

    (state.communityData.locations || []).forEach(loc => {
      const pinEl = document.getElementById(`map-pin-${loc.id}`);
      if (!pinEl) return;

      const matchCat = cat === 'all' || loc.category === cat;
      const matchQuery = !q || 
        loc.name.toLowerCase().includes(q) || 
        (loc.signature && loc.signature.toLowerCase().includes(q)) || 
        (loc.address && loc.address.toLowerCase().includes(q)) ||
        (loc.tag && loc.tag.toLowerCase().includes(q));

      if (matchCat && matchQuery) {
        pinEl.style.display = 'block';
      } else {
        pinEl.style.display = 'none';
      }
    });
  }

  // ================= 側邊對應索引欄渲染 =================
  function renderSideIndex() {
    const listContainer = document.getElementById('sideIndexList');
    if (!listContainer) return;

    const cat = state.sideIndexCategory;
    const q = state.searchQuery;
    const items = (state.communityData.locations || []).filter(l => {
      const matchCat = l.category === cat;
      const matchQ = !q || 
        l.name.toLowerCase().includes(q) || 
        (l.signature && l.signature.toLowerCase().includes(q));
      return matchCat && matchQ;
    });

    listContainer.innerHTML = '';

    if (items.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: var(--ink-light); padding: 30px 10px; font-size: 13px;">
          無符合之點位項目
        </div>
      `;
      return;
    }

    items.forEach(loc => {
      const itemCard = document.createElement('div');
      itemCard.className = `index-card-item ${loc.category}`;
      itemCard.id = `index-item-${loc.id}`;

      const isFood = loc.category === 'food';
      const stepText = loc.accessibility?.stepText || '無障礙空間';

      itemCard.innerHTML = `
        <div class="index-item-code ${loc.category}">${loc.code}</div>
        <div class="index-item-info">
          <div class="index-item-name">${loc.name}</div>
          <div class="index-item-signature">${loc.signature || loc.tag || '在地特色據點'}</div>
          <div class="index-item-acc-icons">
            <span>♿ ${stepText}</span>
          </div>
        </div>
      `;

      itemCard.addEventListener('click', () => {
        focusMapPin(loc);
        openLocationCard(loc);
      });

      listContainer.appendChild(itemCard);
    });
  }

  // 聚焦地圖點位並產生波紋動畫
  function focusMapPin(loc) {
    // 移除舊的高亮
    document.querySelectorAll('.map-pin-group.highlighted').forEach(el => el.classList.remove('highlighted'));

    const pinEl = document.getElementById(`map-pin-${loc.id}`);
    if (pinEl) {
      pinEl.classList.add('highlighted');
      setTimeout(() => pinEl.classList.remove('highlighted'), 3000);
    }
  }

  // 取得點位分類中文名稱 (對照照片 1 指引第 5 點：飲食/購物/醫療/休閒/交通)
  function getLocCategoryName(cat) {
    switch (cat) {
      case 'food': return '飲食';
      case 'shop': return '購物';
      case 'medical': return '醫療';
      case 'spot': return '休閒';
      case 'transport': return '交通';
      default: return '資源';
    }
  }

  // 取得點位步行時間
  function getLocWalkTime(loc) {
    return loc.walkTime || '5';
  }

  // 取得點位友善特色 (黃色區塊，照片 2 樣式)
  function getLocFriendlyFeatures(loc) {
    if (loc.friendlyFeatures) return loc.friendlyFeatures;
    const stepText = loc.accessibility?.stepText || '門口平坦無階梯';
    return `店員親切熱情、${stepText}、會耐心等待學員點餐與溝通。`;
  }

  // 取得適合練習的目標 (粉綠區塊，ISP 個別化目標)
  function getLocPracticeGoals(loc) {
    if (loc.practiceGoals) return loc.practiceGoals;
    return '練習自己選擇商品與點餐、練習排隊等待、學習付款與找零計算。';
  }

  // 取得可分配的工作內容 (紫橘區塊 - 新增需求)
  function getLocJobTasks(loc) {
    if (loc.jobTasks) return loc.jobTasks;
    return '擔任點餐與採買組長（挑選品項）、擔任付款算錢員（交付零錢）、擔任隨行照片與紀錄員。';
  }

  // ================= 3D 雙面社區資源卡控制 (Card Modal) =================
  function openLocationCard(loc) {
    state.selectedLocation = loc;
    state.isCardFlipped = false;

    const backdrop = document.getElementById('cardModalBackdrop');
    const flipper = document.getElementById('cardFlipper');
    if (!backdrop || !flipper) return;

    flipper.classList.remove('flipped');

    const catLabel = getLocCategoryName(loc.category);
    const isFoodOrShop = loc.category === 'food' || loc.category === 'shop';
    const badgeColorClass = isFoodOrShop ? 'food' : 'spot';

    // 填寫【正面】內容 (對照照片 2 範本卡片)
    const frontBadge = document.getElementById('modalFrontBadge');
    if (frontBadge) {
      frontBadge.className = `card-badge-id ${badgeColorClass}`;
      frontBadge.textContent = `#${loc.code} ${catLabel}`;
    }

    const tagEl = document.getElementById('modalFrontTag');
    if (tagEl) tagEl.textContent = loc.tag || catLabel;

    const titleEl = document.getElementById('modalFrontTitle');
    if (titleEl) titleEl.textContent = loc.name;

    const walkEl = document.getElementById('modalFrontWalkTime');
    if (walkEl) walkEl.textContent = getLocWalkTime(loc);

    const addrSub = document.getElementById('modalFrontAddressSub');
    if (addrSub) addrSub.textContent = loc.address ? `(${loc.address})` : '';

    const hoursEl = document.getElementById('modalFrontHours');
    if (hoursEl) hoursEl.textContent = `${loc.hours || '請洽店家'} ${loc.offDay ? '(' + loc.offDay + ')' : ''}`;

    const friendlyEl = document.getElementById('modalFrontFriendlyFeatures');
    if (friendlyEl) friendlyEl.textContent = getLocFriendlyFeatures(loc);

    const practiceEl = document.getElementById('modalFrontPracticeGoals');
    if (practiceEl) practiceEl.textContent = getLocPracticeGoals(loc);

    const jobEl = document.getElementById('modalFrontJobTasks');
    if (jobEl) jobEl.textContent = getLocJobTasks(loc);

    // 插畫與照片展示 (對照照片 2 [ 📷 放店面照片 ])
    const illFrame = document.getElementById('modalFrontIllFrame');
    if (illFrame) {
      const illSvg = (loc.illKey && HANDDRAWN_ILLUSTRATIONS[loc.illKey]) 
        ? HANDDRAWN_ILLUSTRATIONS[loc.illKey].svg 
        : HANDDRAWN_ILLUSTRATIONS.spot_temple.svg;

      if (loc.photoUrl) {
        illFrame.innerHTML = `<img src="${loc.photoUrl}" alt="${loc.name}">`;
      } else {
        illFrame.innerHTML = `
          <div class="photo-placeholder-text">
            <span>📷 店面外觀照片</span>
            <div style="width: 55px; height: 55px; margin-top: 4px;">${illSvg}</div>
          </div>
        `;
      }
    }

    // 填寫【反面】內容 (詳細聯絡資訊與無障礙盤點)
    document.getElementById('modalBackTitle').textContent = loc.name;
    document.getElementById('modalBackCode').textContent = `#${loc.code} (${catLabel})`;
    document.getElementById('modalBackAddress').textContent = loc.address || '未登錄地址';
    document.getElementById('modalBackHours').textContent = loc.hours || '請洽店家';
    document.getElementById('modalBackOffDay').textContent = loc.offDay || '無特定公休';
    document.getElementById('modalBackPhone').textContent = loc.phone || '無電話登記';

    document.getElementById('modalBackSignature').textContent = `招牌必點：${loc.signature || '在地推薦'}`;
    document.getElementById('modalBackStory').textContent = loc.story || '尚無文史記錄，歡迎學員踏查補充！';

    // 無障礙友善圖示勾選
    const accList = document.getElementById('modalBackAccList');
    if (accList) {
      accList.innerHTML = '';
      const acc = loc.accessibility || {};
      const stepText = acc.stepText || '門口平坦無階';
      const passageText = acc.passageText || '通道通暢寬敞';
      const toiletText = acc.toiletText || '一般洗手間';

      accList.innerHTML = `
        <div class="acc-item-box active">
          <span class="acc-icon-svg">${ACCESSIBILITY_ICONS.step_0}</span>
          <span>${stepText}</span>
        </div>
        <div class="acc-item-box active">
          <span class="acc-icon-svg">${ACCESSIBILITY_ICONS.wheelchair}</span>
          <span>${passageText}</span>
        </div>
        <div class="acc-item-box active">
          <span class="acc-icon-svg">${ACCESSIBILITY_ICONS.toilet_accessible}</span>
          <span>${toiletText}</span>
        </div>
        <div class="acc-item-box active">
          <span class="acc-icon-svg">${ACCESSIBILITY_ICONS.elder_seat}</span>
          <span>敬老友善座 / 飲水</span>
        </div>
      `;
    }

    backdrop.classList.add('open');
  }

  function toggleCardFlip() {
    state.isCardFlipped = !state.isCardFlipped;
    const flipper = document.getElementById('cardFlipper');
    if (flipper) {
      flipper.classList.toggle('flipped', state.isCardFlipped);
    }
  }

  function closeCardModal() {
    const backdrop = document.getElementById('cardModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // 語音朗讀 (TTS)
  function speakCurrentCard() {
    if (!('speechSynthesis' in window) || !state.selectedLocation) return;
    window.speechSynthesis.cancel();

    const loc = state.selectedLocation;
    const text = `${loc.name}。編號 ${loc.code}。特色：${loc.signature || ''}。在地故事：${loc.story || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // ================= 資源卡總覽網格視圖 (Cards Grid) =================
  function renderCardsGrid(searchQuery = '') {
    const grid = document.getElementById('cardsGridLayout');
    if (!grid) return;

    grid.innerHTML = '';
    const locs = state.communityData.locations || [];
    const filtered = locs.filter(l => {
      return !searchQuery || 
        l.name.toLowerCase().includes(searchQuery) || 
        (l.signature && l.signature.toLowerCase().includes(searchQuery)) ||
        (l.tag && l.tag.toLowerCase().includes(searchQuery)) ||
        (l.friendlyFeatures && l.friendlyFeatures.toLowerCase().includes(searchQuery)) ||
        (l.practiceGoals && l.practiceGoals.toLowerCase().includes(searchQuery)) ||
        (l.jobTasks && l.jobTasks.toLowerCase().includes(searchQuery));
    });

    filtered.forEach(loc => {
      const card = document.createElement('div');
      card.className = 'grid-card-preview';
      
      const catName = getLocCategoryName(loc.category);
      const isFoodOrShop = loc.category === 'food' || loc.category === 'shop';
      const badgeColor = isFoodOrShop ? 'var(--food-primary)' : 'var(--spot-primary)';
      const illSvg = (loc.illKey && HANDDRAWN_ILLUSTRATIONS[loc.illKey]) 
        ? HANDDRAWN_ILLUSTRATIONS[loc.illKey].svg 
        : HANDDRAWN_ILLUSTRATIONS.spot_temple.svg;

      const photoContent = loc.photoUrl 
        ? `<img src="${loc.photoUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${loc.name}">`
        : `<div style="width:55px;height:55px;">${illSvg}</div>`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="background: ${badgeColor}; color: #fff; font-size: 11px; font-weight: 900; padding: 2px 8px; border-radius: 10px;">
            #${loc.code} ${catName}
          </span>
          <span style="font-size: 11px; color: var(--ink-muted);">🚶 走路 ${getLocWalkTime(loc)} 分鐘</span>
        </div>
        <div style="height: 95px; background: #fff; border: 2px dashed var(--border-hand); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; overflow: hidden;">
          ${photoContent}
        </div>
        <h4 style="font-family: var(--font-serif); font-size: 16px; color: var(--ink-brown); text-align: center; margin-bottom: 4px;">
          〔 ${loc.name} 〕
        </h4>
        <div style="font-size: 11px; background: #fffde7; border: 1px solid #fbc02d; padding: 3px 6px; border-radius: 6px; margin-bottom: 3px; color: #5d4037; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          😊 友善：${getLocFriendlyFeatures(loc)}
        </div>
        <div style="font-size: 11px; background: #f3e5f5; border: 1px solid #ab47bc; padding: 3px 6px; border-radius: 6px; margin-bottom: 6px; color: #4a148c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          💼 任務：${getLocJobTasks(loc)}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--ink-light); border-top: 1px dashed #ddd; padding-top: 5px;">
          <span>🎯 ISP：${(getLocPracticeGoals(loc)).slice(0, 10)}...</span>
          <span style="color: var(--food-primary); font-weight: 700;">點擊查看卡片 ➔</span>
        </div>
      `;

      card.addEventListener('click', () => openLocationCard(loc));
      grid.appendChild(card);
    });
  }

  // ================= 實體列印排版模式 (Print Suite) =================
  function renderPrintPreview() {
    const container = document.getElementById('printPreviewContainer');
    if (!container) return;

    container.innerHTML = '';
    const locs = state.communityData.locations || [];
    const mode = state.printMode;

    if (mode === 'cards_front' || mode === 'cards_back' || mode === 'cards_blank') {
      if (mode === 'cards_blank') {
        // 空白盤點資源卡排版 (產生 1 頁共 4 張空白範本卡，供學員外出攜帶手寫與盤點)
        const sheet = document.createElement('div');
        sheet.className = 'a4-print-sheet';

        const grid4 = document.createElement('div');
        grid4.className = 'a4-grid-4up';

        for (let i = 1; i <= 4; i++) {
          const cardBox = document.createElement('div');
          cardBox.className = 'card-print-box';
          cardBox.innerHTML = `
            <!-- 裁切十字線與打孔標記 -->
            <div class="crop-cross crop-tl"></div>
            <div class="crop-cross crop-tr"></div>
            <div class="crop-cross crop-bl"></div>
            <div class="crop-cross crop-br"></div>
            <div class="hole-punch-guide" title="打孔定位">○</div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 9.5px; font-weight: 900; border: 1px solid #333; padding: 1px 5px; border-radius: 4px;">預定編號：_______</span>
              <span style="font-size: 9px; border: 1px solid #333; padding: 1px 4px; border-radius: 4px;">類別: [ ]飲食 [ ]購物 [ ]醫療 [ ]休閒 [ ]交通</span>
            </div>

            <h3 style="font-family: var(--font-serif); font-size: 15px; color: #222; text-align: center; margin: 2px 0 4px;">〔 地點名稱：____________________ 〕</h3>

            <div style="height: 60px; border: 1.5px dashed #666; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa; overflow: hidden; margin-bottom: 4px; color: #777; font-size: 10px; font-weight: 700;">
              📷 貼店面實拍外觀照片 / 🎨 學員手繪框
            </div>

            <div style="font-size: 9.5px; line-height: 1.3; margin-bottom: 4px;">
              <div>📍 <strong>地址 / 怎麼走：</strong>從機構走路約 <u>______</u> 分鐘</div>
              <div>🕒 <strong>營業時間：</strong>________________ (公休:每週___)</div>
              <div>📞 <strong>電話：</strong>_________________________________</div>
            </div>

            <div style="background: #fffde7; border: 1px solid #fbc02d; border-radius: 5px; padding: 3px 5px; font-size: 9px; margin-bottom: 3px; color: #5d4037;">
              <strong>😊 友善特色盤點：</strong><br>
              [ ]耐心等待  [ ]無障礙廁所  [ ]友善招呼  [ ]其他:__________
            </div>

            <div style="background: #e0f2f1; border: 1px solid #26a69a; border-radius: 5px; padding: 3px 5px; font-size: 9px; margin-bottom: 3px; color: #004d40;">
              <strong>🎯 適合練習的目標 (ISP)：</strong><br>
              [ ]練習付款算錢  [ ]排隊等待  [ ]點餐表達  [ ]其他:__________
            </div>

            <div style="background: #f3e5f5; border: 1px solid #ab47bc; border-radius: 5px; padding: 3px 5px; font-size: 9px; color: #4a148c;">
              <strong>💼 可分配的工作內容 (學員分工)：</strong><br>
              [ ]採買組長  [ ]付款算錢員  [ ]拍攝記錄員  [ ]禮貌大使
            </div>
          `;
          grid4.appendChild(cardBox);
        }

        sheet.appendChild(grid4);
        container.appendChild(sheet);
        return;
      }
      // 4-up 雙面資源卡排版 (每頁 4 張 A6)
      const isBack = mode === 'cards_back';
      const pagesCount = Math.ceil(locs.length / 4);

      for (let p = 0; p < pagesCount; p++) {
        const sheet = document.createElement('div');
        sheet.className = 'a4-print-sheet';

        const grid4 = document.createElement('div');
        grid4.className = 'a4-grid-4up';

        const pageItems = locs.slice(p * 4, p * 4 + 4);
        pageItems.forEach(loc => {
          const cardBox = document.createElement('div');
          cardBox.className = 'card-print-box';

          const catName = getLocCategoryName(loc.category);
          const isFoodOrShop = loc.category === 'food' || loc.category === 'shop';
          const badgeClass = isFoodOrShop ? 'food' : 'spot';
          const illSvg = (loc.illKey && HANDDRAWN_ILLUSTRATIONS[loc.illKey]) 
            ? HANDDRAWN_ILLUSTRATIONS[loc.illKey].svg 
            : HANDDRAWN_ILLUSTRATIONS.spot_temple.svg;

          if (!isBack) {
            // 正面排版 (對照照片 2 範本卡片結構)
            const walkTime = getLocWalkTime(loc);
            const friendly = getLocFriendlyFeatures(loc);
            const goals = getLocPracticeGoals(loc);
            const jobs = getLocJobTasks(loc);

            cardBox.innerHTML = `
              <!-- 裁切十字線與打孔標記 -->
              <div class="crop-cross crop-tl"></div>
              <div class="crop-cross crop-tr"></div>
              <div class="crop-cross crop-bl"></div>
              <div class="crop-cross crop-br"></div>
              <div class="hole-punch-guide" title="打孔定位">○</div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="card-badge-id ${badgeClass}" style="font-size: 10px; padding: 1px 6px;">#${loc.code} ${catName}</span>
                <span style="font-size: 10px; border: 1px solid #333; padding: 1px 5px; border-radius: 4px;">${loc.tag || catName}</span>
              </div>

              <h3 style="font-family: var(--font-serif); font-size: 16px; color: #222; text-align: center; margin: 2px 0 6px;">〔 ${loc.name} 〕</h3>

              <div style="height: 65px; border: 1.5px dashed #444; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #fafafa; overflow: hidden; margin-bottom: 4px;">
                ${loc.photoUrl 
                  ? `<img src="${loc.photoUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${loc.name}">`
                  : `<div style="font-size: 10.5px; color: #666; font-weight: 700; text-align: center;">📷 放店面外觀照片</div>`
                }
              </div>

              <div style="font-size: 9.5px; line-height: 1.3; margin-bottom: 4px;">
                <div>📍 <strong>地址 / 怎麼走：</strong>從機構走路約 <u>${walkTime}</u> 分鐘 (${loc.address || '—'})</div>
                <div>🕒 <strong>營業時間：</strong>${loc.hours || '請洽店家'} ${loc.offDay ? '('+loc.offDay+')' : ''}</div>
              </div>

              <div style="background: #fffde7; border: 1px solid #fbc02d; border-radius: 5px; padding: 3px 5px; font-size: 9.5px; margin-bottom: 3px; color: #5d4037;">
                <strong>😊 友善特色：</strong>${friendly}
              </div>

              <div style="background: #e0f2f1; border: 1px solid #26a69a; border-radius: 5px; padding: 3px 5px; font-size: 9.5px; margin-bottom: 3px; color: #004d40;">
                <strong>🎯 適合練習的目標：</strong>${goals}
              </div>

              <div style="background: #f3e5f5; border: 1px solid #ab47bc; border-radius: 5px; padding: 3px 5px; font-size: 9.5px; color: #4a148c;">
                <strong>💼 可分配的工作內容：</strong>${jobs}
              </div>
            `;
          } else {
            // 反面排版 (無障礙與實用盤點)
            cardBox.innerHTML = `
              <div class="crop-cross crop-tl"></div>
              <div class="crop-cross crop-tr"></div>
              <div class="crop-cross crop-bl"></div>
              <div class="crop-cross crop-br"></div>
              <div class="hole-punch-guide" title="打孔定位">○</div>

              <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #222; padding-bottom: 4px; margin-bottom: 6px;">
                <span style="font-weight: 900; font-size: 13px;">${loc.name} (#${loc.code})</span>
                <span style="font-size: 10px;">反面・無障礙盤點</span>
              </div>
              <div style="font-size: 10.5px; line-height: 1.4; margin-bottom: 6px;">
                <div><strong>地址：</strong>${loc.address || '—'}</div>
                <div><strong>時間：</strong>${loc.hours || '—'} (公休: ${loc.offDay || '無'})</div>
                <div><strong>電話：</strong>${loc.phone || '—'}</div>
              </div>
              <div style="border: 1px solid #666; border-radius: 6px; padding: 4px; font-size: 10px; margin-bottom: 6px; background: #fdfdfd;">
                <strong>♿ 無障礙與友善盤點：</strong>
                <div>• 門口高低：${loc.accessibility?.stepText || '平坦無階'}</div>
                <div>• 輪椅通道：${loc.accessibility?.passageText || '寬敞輪椅友善'}</div>
                <div>• 洗手間：${loc.accessibility?.toiletText || '友善廁所'}</div>
              </div>
              <div style="font-size: 10px; background: #fff8e1; border: 1px dashed #d7ccc8; border-radius: 6px; padding: 4px; flex: 1;">
                <strong>招牌故事：</strong>${loc.signature || ''}。${(loc.story || '').slice(0, 50)}...
              </div>
            `;
          }

          grid4.appendChild(cardBox);
        });

        sheet.appendChild(grid4);
        container.appendChild(sheet);
      }

    } else if (mode === 'stickers') {
      // 點位編號圓貼紙排版 (Sticker Sheet)
      const sheet = document.createElement('div');
      sheet.className = 'a4-print-sheet';
      sheet.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 12px; font-family: var(--font-serif);">
          🏷️ 社區地圖點位編號圓貼 (供實體魔鬼氈張貼使用)
        </h3>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10mm 6mm; text-align: center;">
          ${locs.map(loc => {
            const isFood = loc.category === 'food' || loc.category === 'shop';
            const color = isFood ? '#e65100' : '#00838f';
            return `
              <div style="display: flex; flex-direction: column; align-items: center; border: 1px dashed #ccc; padding: 6px; border-radius: 8px;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: ${color}; color: #fff; font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid #222; box-shadow: 1px 2px 4px rgba(0,0,0,0.2);">
                  ${loc.code}
                </div>
                <span style="font-size: 10px; font-weight: 700; margin-top: 4px; white-space: nowrap; max-width: 65px; overflow: hidden; text-overflow: ellipsis;">
                  ${loc.name}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      `;
      container.appendChild(sheet);

    } else if (mode === 'worksheet') {
      // 田野踏查學習單 (Field Survey Worksheet)
      const sheet = document.createElement('div');
      sheet.className = 'a4-print-sheet';
      sheet.innerHTML = `
        <div style="border: 2px solid #222; padding: 12px; height: 100%;">
          <div style="text-align: center; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 12px;">
            <h2 style="font-family: var(--font-serif); font-size: 20px;">🎒 社區美食與文化景點・田野踏查訪查記錄表</h2>
            <div style="display: flex; justify-content: space-around; font-size: 12px; margin-top: 6px;">
              <span>踏查小組：_______________</span>
              <span>訪查員：_______________</span>
              <span>日期：____年___月___日</span>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px;" border="1">
            <tr style="background: #f0f0f0;">
              <th style="padding: 6px; width: 120px;">訪查項目</th>
              <th style="padding: 6px;">現場踏查記錄內容</th>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">地點名稱 / 編號</td>
              <td style="padding: 8px;">店名/景點：__________________ （地圖預定編號：_______）</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">詳細地址與電話</td>
              <td style="padding: 8px;">地址：____________________________________ 電話：____________</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">營業與公休時間</td>
              <td style="padding: 8px;">營業時間：____________ 公休日：每週_______</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">♿ 無障礙友善盤點<br>(請勾選實際狀況)</td>
              <td style="padding: 8px; line-height: 1.8;">
                • 門口高低差：[ ] 平坦無階梯  [ ] 設有平順斜坡  [ ] 1段階梯  [ ] 多段階梯<br>
                • 走道與空間：[ ] 寬敞 (輪椅/推車可暢行 >90cm)  [ ] 稍窄一般通道<br>
                • 洗手間友善：[ ] 設有無障礙專用廁所  [ ] 性別友善廁所  [ ] 一般廁所  [ ] 無提供<br>
                • 友善貼心服務：[ ] 長輩博愛座  [ ] 寵物友善  [ ] 提供免費飲水
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">招牌必點與推薦</td>
              <td style="padding: 8px;">招牌料理 / 必看亮點：____________________________________</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 700;">在地歷史故事 /<br>訪談店主心情筆記</td>
              <td style="padding: 8px; height: 80px; vertical-align: top;">
                （請記錄店家創立歷史、食材堅持、家族傳承或最感動的地方...）
              </td>
            </tr>
          </table>

          <div style="border: 2px dashed #666; height: 180px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #888; border-radius: 8px;">
            📷 實景照片黏貼處 / 🎨 學員手繪插畫框
          </div>
        </div>
      `;
      container.appendChild(sheet);

    } else if (mode === 'poster_map') {
      // 海報大地圖輸出 (Poster Map)
      const sheet = document.createElement('div');
      sheet.className = 'a4-print-sheet print-mode-poster';
      sheet.style.width = '100%';
      
      const svgClone = document.getElementById('handdrawnMapSvg').cloneNode(true);
      svgClone.setAttribute('width', '100%');
      svgClone.setAttribute('height', 'auto');

      sheet.appendChild(svgClone);
      container.appendChild(sheet);
    }
  }

  // ================= 點位新增 / 編輯表單 (Edit Modal) =================
  function openEditModal(loc) {
    const backdrop = document.getElementById('editModalBackdrop');
    const form = document.getElementById('pointEditForm');
    if (!backdrop || !form) return;

    form.reset();

    if (loc) {
      document.getElementById('editModalTitle').textContent = '✏️ 編輯點位資料與雙面資源卡';
      document.getElementById('formName').value = loc.name || '';
      document.getElementById('formCategory').value = loc.category || 'food';
      document.getElementById('formCode').value = loc.code || '';
      document.getElementById('formTag').value = loc.tag || '';
      document.getElementById('formWalkTime').value = loc.walkTime || '';
      document.getElementById('formPhotoUrl').value = loc.photoUrl || '';
      document.getElementById('formAddress').value = loc.address || '';
      document.getElementById('formHours').value = loc.hours || '';
      document.getElementById('formOffDay').value = loc.offDay || '';
      document.getElementById('formPhone').value = loc.phone || '';
      document.getElementById('formIllKey').value = loc.illKey || 'food_duck_noodles';
      document.getElementById('formFriendlyFeatures').value = loc.friendlyFeatures || '';
      document.getElementById('formPracticeGoals').value = loc.practiceGoals || '';
      document.getElementById('formJobTasks').value = loc.jobTasks || '';
      document.getElementById('formSignature').value = loc.signature || '';
      document.getElementById('formStory').value = loc.story || '';
      form.dataset.editId = loc.id;
    } else {
      document.getElementById('editModalTitle').textContent = '➕ 新增社區資源點位與雙面卡片';
      delete form.dataset.editId;
      
      // 自動給予新編號
      const count = (state.communityData.locations || []).length + 1;
      document.getElementById('formCode').value = count < 10 ? `0${count}` : `${count}`;
    }

    backdrop.classList.add('open');
  }

  function closeEditModal() {
    const backdrop = document.getElementById('editModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  function onSavePointForm(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    const locData = {
      id: editId || `loc_${Date.now()}`,
      name: document.getElementById('formName').value.trim(),
      category: document.getElementById('formCategory').value,
      code: document.getElementById('formCode').value.trim(),
      tag: document.getElementById('formTag').value.trim(),
      walkTime: document.getElementById('formWalkTime').value.trim(),
      photoUrl: document.getElementById('formPhotoUrl').value.trim(),
      address: document.getElementById('formAddress').value.trim(),
      hours: document.getElementById('formHours').value.trim(),
      offDay: document.getElementById('formOffDay').value.trim(),
      phone: document.getElementById('formPhone').value.trim(),
      illKey: document.getElementById('formIllKey').value,
      friendlyFeatures: document.getElementById('formFriendlyFeatures').value.trim(),
      practiceGoals: document.getElementById('formPracticeGoals').value.trim(),
      jobTasks: document.getElementById('formJobTasks').value.trim(),
      signature: document.getElementById('formSignature').value.trim(),
      story: document.getElementById('formStory').value.trim(),
      x: 500 + (Math.random() * 80 - 40),
      y: 300 + (Math.random() * 80 - 40),
      accessibility: {
        step: 'step_0',
        stepText: '平坦無階',
        passage: 'wide',
        passageText: '走道寬敞',
        toilet: 'toilet_accessible',
        toiletText: '設有友善洗手間'
      }
    };

    if (editId) {
      const idx = state.communityData.locations.findIndex(l => l.id === editId);
      if (idx !== -1) {
        locData.x = state.communityData.locations[idx].x;
        locData.y = state.communityData.locations[idx].y;
        state.communityData.locations[idx] = Object.assign(state.communityData.locations[idx], locData);
      }
    } else {
      state.communityData.locations.push(locData);
    }

    // 儲存至 LocalStorage
    saveDataToLocalStorage();

    // 更新介面
    closeEditModal();
    updateHeaderInfo();
    renderSvgMap();
    renderSideIndex();
    renderCardsGrid();
  }

  function saveDataToLocalStorage() {
    try {
      localStorage.setItem('COMMUNITY_MAP_DATA', JSON.stringify(state.communityData));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  // ================= 社區範本切換器 =================
  function promptCommunitySwitcher() {
    const choice = confirm('想要切換到哪一個社區地圖？\n\n【確定】保留並套用「土庫旅行地圖完整範本」\n【取消】匯出當前社區資料 JSON 備份檔');
    if (choice) {
      state.communityData = JSON.parse(JSON.stringify(TUKU_SAMPLE_DATA));
      saveDataToLocalStorage();
      updateHeaderInfo();
      renderSvgMap();
      renderSideIndex();
      renderCardsGrid();
      alert('已重新載入「土庫旅行地圖」經典範本！');
    } else {
      // 匯出 JSON 備份
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.communityData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `community_map_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  }

  // ================= 畫布平移與縮放 (Pan & Zoom & Drag Pins) =================
  function updateMapTransform() {
    const group = document.getElementById('mapTransformGroup');
    if (group) {
      group.setAttribute('transform', `translate(${state.panX}, ${state.panY}) scale(${state.zoom})`);
    }
  }

  function adjustZoom(delta) {
    state.zoom = Math.max(0.6, Math.min(2.5, state.zoom + delta));
    updateMapTransform();
  }

  function resetZoom() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    updateMapTransform();
  }

  function onMapMouseDown(e) {
    if (state.draggedPinId) return;
    state.isPanning = true;
    state.startPanX = e.clientX - state.panX;
    state.startPanY = e.clientY - state.panY;
    document.getElementById('mapCanvasWrapper')?.classList.add('grabbing');
  }

  function onMapMouseMove(e) {
    if (state.draggedPinId) {
      // 正在拖曳圖釘定位
      const svg = document.getElementById('handdrawnMapSvg');
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left - state.panX) / state.zoom) * (1000 / rect.width);
      const svgY = ((e.clientY - rect.top - state.panY) / state.zoom) * (620 / rect.height);

      const loc = state.communityData.locations.find(l => l.id === state.draggedPinId);
      if (loc) {
        loc.x = Math.round(Math.max(30, Math.min(970, svgX)));
        loc.y = Math.round(Math.max(30, Math.min(590, svgY)));
        const pinEl = document.getElementById(`map-pin-${loc.id}`);
        if (pinEl) pinEl.setAttribute('transform', `translate(${loc.x}, ${loc.y})`);
      }
      return;
    }

    if (!state.isPanning) return;
    state.panX = e.clientX - state.startPanX;
    state.panY = e.clientY - state.startPanY;
    updateMapTransform();
  }

  function onMapMouseUp() {
    if (state.draggedPinId) {
      state.draggedPinId = null;
      saveDataToLocalStorage();
    }
    state.isPanning = false;
    document.getElementById('mapCanvasWrapper')?.classList.remove('grabbing');
  }

  function onMapWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    adjustZoom(delta);
  }

  // 頁面載入完成後啟動
  document.addEventListener('DOMContentLoaded', initApp);

})();
