/* ===== StressMap 三环压力镜 前端逻辑 =====
 * 数据层使用稳定语义 key（academics / family / ...），展示层用 t() 翻译。
 * 提交后端时 key → 中文（兼容 server.js），渲染报告时中文 → key。
 */

const LABEL_KEYS = [
  'academics', 'family', 'friends', 'relationship',
  'organization', 'career', 'future', 'health'
];

// key → 后端使用的中文标签
const LABEL_TO_ZH = {
  academics: '学业（考试，论文）',
  family: '家庭（父母）',
  friends: '朋友（室友）',
  relationship: '亲密关系（伴侣）',
  organization: '组织（社团）',
  career: '实习求职（面试，简历）',
  future: '未来方向（考研，出国）',
  health: '健康（睡眠，饮食）'
};
// 中文 → key（用于把后端返回的报告标签翻译回来）
const ZH_TO_LABEL = {};
for (const k of LABEL_KEYS) ZH_TO_LABEL[LABEL_TO_ZH[k]] = k;

const COPING_KEYS = ['A', 'B', 'C'];

// ===== 应用状态 =====
const state = {
  step: 0, // 0=welcome, 1=rings, 2=scenarios, 3=result
  rings: {},        // key -> score (1/2/3)
  scenarios: [],    // {label:key, intensity, coping}
  positions: {},    // key -> {x,y} (%)
  report: null,
  number: null      // 问卷编号，如 S001
};

const view = document.getElementById('view');

function setStep(n) {
  state.step = n;
  document.querySelectorAll('.step-dot').forEach(d => {
    d.classList.toggle('active', Number(d.dataset.step) <= n);
  });
  render();
}

function render() {
  if (state.step === 0) renderWelcome();
  else if (state.step === 1) renderRings();
  else if (state.step === 2) renderScenarios();
  else if (state.step === 3) renderResult();
  updateStaticText();
}

// 更新 #view 之外的静态文案（顶栏）
function updateStaticText() {
  const topbar = document.querySelector('.topbar span');
  if (topbar) topbar.textContent = t('app.title');
  document.title = t('app.title');
}

// ===== 欢迎页 =====
function renderWelcome() {
  view.innerHTML = `
    <div class="card">
      <h1>${t('welcome.title')}</h1>
      <p class="subtitle">${t('welcome.subtitle')}</p>

      <div class="steps-list">
        <div class="step-item">
          <div class="step-num">1</div>
          <div><b>${t('welcome.step1.b')}</b><span>${t('welcome.step1.span')}</span></div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div><b>${t('welcome.step2.b')}</b><span>${t('welcome.step2.span')}</span></div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div><b>${t('welcome.step3.b')}</b><span>${t('welcome.step3.span')}</span></div>
        </div>
      </div>

      <div class="notice">${t('welcome.notice')}</div>

      <div class="row">
        <button class="btn btn-primary" id="startBtn">${t('welcome.startBtn')}</button>
      </div>
      <div class="footer-note">${t('welcome.footer')}</div>
    </div>
  `;
  document.getElementById('startBtn').onclick = () => setStep(1);
}

// ===== 三环拖拽 =====
// 环的几何参数（相对 ring-area 的百分比，圆心在 50,50）
const RING_RADII = { outer: 50, middle: 35, inner: 20 }; // 半径 %
function getRingAtPoint(xp, yp) {
  // xp, yp: 相对 ring-area 的百分比坐标 (0-100)
  const dx = xp - 50, dy = yp - 50;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= RING_RADII.inner) return 3;       // 内环 高压力
  if (d <= RING_RADII.middle) return 2;      // 中环 中压力
  if (d <= RING_RADII.outer) return 1;       // 外环 低压力
  return null;
}

function renderRings() {
  // 初始化 rings（若未设置则为 null）
  LABEL_KEYS.forEach(k => { if (!(k in state.rings)) state.rings[k] = null; });
  if (!state.positions) state.positions = {};

  view.innerHTML = `
    <div class="card">
      <h1>${t('rings.title')}</h1>
      <p class="ring-guide">${t('rings.guide')}</p>

      <div class="ring-area" id="ringArea">
        <div class="ring-bg ring-outer"><div class="ring-label">${t('rings.outer.label')}</div></div>
        <div class="ring-bg ring-middle"><div class="ring-label">${t('rings.middle.label')}</div></div>
        <div class="ring-bg ring-inner"><div class="ring-label">${t('rings.inner.label')}</div></div>
      </div>

      <div style="text-align:center;color:var(--c-muted);font-size:13px;margin-bottom:14px;">
        ${t('rings.poolHint')}
      </div>
      <div class="pool" id="pool"></div>

      <div class="row">
        <button class="btn btn-ghost" id="backBtn">${t('rings.back')}</button>
        <button class="btn btn-primary" id="nextBtn" disabled>${t('rings.next')}</button>
      </div>
    </div>
  `;

  document.getElementById('backBtn').onclick = () => setStep(0);
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.onclick = () => {
    const allPlaced = LABEL_KEYS.every(k => state.rings[k] != null);
    if (!allPlaced) { alert(t('rings.alert')); return; }
    setStep(2);
  };

  renderRingChips();
  setupDragAndDrop();
}

// 估算标签 chip 宽度（px），用于碰撞检测（基于当前语言显示的文本）
function estimateChipWidth(key) {
  const text = t('label.' + key);
  let w = 0;
  for (const ch of text) {
    // CJK 字符约 14px，拉丁字符约 8px
    w += /[\u4e00-\u9fff\uff00-\uffef]/.test(ch) ? 14 : 8;
  }
  return w + 24;
}
const CHIP_HEIGHT = 28;

// 在目标位置附近寻找不与其他已放置标签重叠的位置
function findNonOverlappingPos(xp, yp, key) {
  const area = document.getElementById('ringArea');
  const size = area.offsetWidth; // 正方形，宽高相等
  let tx = xp / 100 * size;
  let ty = yp / 100 * size;

  const myW = estimateChipWidth(key);
  const myH = CHIP_HEIGHT;

  const others = [];
  for (const [k, pos] of Object.entries(state.positions || {})) {
    if (k === key) continue;
    if (state.rings[k] == null) continue;
    others.push({
      x: pos.x / 100 * size,
      y: pos.y / 100 * size,
      w: estimateChipWidth(k),
      h: CHIP_HEIGHT
    });
  }

  function collides(x, y) {
    for (const o of others) {
      if (Math.abs(x - o.x) < (myW + o.w) / 2 + 4 &&
          Math.abs(y - o.y) < (myH + o.h) / 2 + 4) return true;
    }
    return false;
  }

  if (!collides(tx, ty)) return { x: xp, y: yp };

  const maxR = size * 0.4;
  for (let r = 14; r < maxR; r += 12) {
    const steps = Math.max(8, Math.floor(r / 6));
    for (let i = 0; i < steps; i++) {
      const ang = (i / steps) * Math.PI * 2;
      const cx = tx + Math.cos(ang) * r;
      const cy = ty + Math.sin(ang) * r;
      const cdx = cx - size / 2, cdy = cy - size / 2;
      if (Math.sqrt(cdx * cdx + cdy * cdy) > RING_RADII.outer / 100 * size - 6) continue;
      if (!collides(cx, cy)) {
        return { x: cx / size * 100, y: cy / size * 100 };
      }
    }
  }
  return { x: xp, y: yp };
}

// 统一放置逻辑：把 key 放到环区 (xp,yp) 百分比坐标处，自动判定环数并避免重叠
function placeChipAtPoint(key, xp, yp) {
  const score = getRingAtPoint(xp, yp);
  if (score == null) return false;
  state.rings[key] = score;
  state.positions[key] = findNonOverlappingPos(xp, yp, key);
  renderRingChips();
  return true;
}

// 把已放置的标签移出环区（放回未分类池）
function unplaceChip(key) {
  state.rings[key] = null;
  delete state.positions[key];
  renderRingChips();
}

function renderRingChips() {
  const area = document.getElementById('ringArea');
  const pool = document.getElementById('pool');
  area.querySelectorAll('.chip-placed').forEach(el => el.remove());
  pool.innerHTML = '';

  LABEL_KEYS.forEach(key => {
    const score = state.rings[key];
    const text = t('label.' + key);
    if (score == null) {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = text;
      chip.draggable = true;
      chip.dataset.label = key;
      pool.appendChild(chip);
    } else {
      const pos = state.positions[key] || { x: 50, y: 50 };
      const chip = document.createElement('div');
      chip.className = 'chip chip-placed';
      chip.textContent = text;
      chip.draggable = true;
      chip.dataset.label = key;
      chip.style.left = pos.x + '%';
      chip.style.top = pos.y + '%';
      area.appendChild(chip);
    }
  });

  const allPlaced = LABEL_KEYS.every(k => state.rings[k] != null);
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.disabled = !allPlaced;

  resolveOverlaps();
}

// 基于真实 DOM 尺寸消解标签重叠
function resolveOverlaps() {
  const area = document.getElementById('ringArea');
  const chips = Array.from(area.querySelectorAll('.chip-placed'));
  if (chips.length < 2) return;
  const size = area.offsetWidth;

  function getCenter(chip) {
    const r = chip.getBoundingClientRect();
    const ar = area.getBoundingClientRect();
    return { x: r.left + r.width / 2 - ar.left, y: r.top + r.height / 2 - ar.top };
  }
  function overlaps(a, b) {
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    return !(ra.right < rb.left + 2 || rb.right < ra.left + 2 ||
             ra.bottom < rb.top + 2 || rb.bottom < ra.top + 2);
  }

  const cx = size / 2, cy = size / 2;
  const maxR = RING_RADII.outer / 100 * size - 8;

  function clampToRing(x, y) {
    const dx = x - cx, dy = y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > maxR) return { x: cx + dx / d * maxR, y: cy + dy / d * maxR };
    return { x, y };
  }
  function applyPos(chip, p) {
    const k = chip.dataset.label;
    if (state.positions[k]) {
      state.positions[k] = { x: p.x / size * 100, y: p.y / size * 100 };
      chip.style.left = (p.x / size * 100) + '%';
      chip.style.top = (p.y / size * 100) + '%';
    }
  }

  // 阶段一：径向散开
  let changed = true, iter = 0;
  while (changed && iter < 60) {
    changed = false; iter++;
    for (let i = 0; i < chips.length; i++) {
      for (let j = i + 1; j < chips.length; j++) {
        if (!overlaps(chips[i], chips[j])) continue;
        const ci = getCenter(chips[i]), cj = getCenter(chips[j]);
        let dx = cj.x - ci.x, dy = cj.y - ci.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.5) { dx = 1; dy = 0; dist = 1; }
        const push = 12;
        const nx = dx / dist, ny = dy / dist;
        applyPos(chips[i], clampToRing(ci.x - nx * push, ci.y - ny * push));
        applyPos(chips[j], clampToRing(cj.x + nx * push, cj.y + ny * push));
        changed = true;
      }
    }
  }

  // 阶段二：切向绕圆心推开
  changed = true; iter = 0;
  while (changed && iter < 80) {
    changed = false; iter++;
    for (let i = 0; i < chips.length; i++) {
      for (let j = i + 1; j < chips.length; j++) {
        if (!overlaps(chips[i], chips[j])) continue;
        const ci = getCenter(chips[i]), cj = getCenter(chips[j]);
        const rix = ci.x - cx, riy = ci.y - cy;
        const rj = Math.sqrt(rix * rix + riy * riy) || 1;
        let tix = -riy / rj, tiy = rix / rj;
        applyPos(chips[i], clampToRing(ci.x + tix * 10, ci.y + tiy * 10));
        applyPos(chips[j], clampToRing(cj.x - tix * 10, cj.y - tiy * 10));
        changed = true;
      }
    }
  }
}

function setupDragAndDrop() {
  let draggingLabel = null;
  const area = document.getElementById('ringArea');

  // ===== 桌面端：原生 HTML5 拖拽 =====
  document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('chip')) {
      draggingLabel = e.target.dataset.label;
      e.target.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; } catch (_) {}
    }
  });
  document.addEventListener('dragend', e => {
    if (e.target.classList.contains('chip')) e.target.classList.remove('dragging');
    draggingLabel = null;
    area.classList.remove('drag-over');
  });

  area.addEventListener('dragover', e => {
    e.preventDefault();
    area.classList.add('drag-over');
  });
  area.addEventListener('dragleave', e => {
    if (e.target === area) area.classList.remove('drag-over');
  });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (!draggingLabel) return;
    const rect = area.getBoundingClientRect();
    const xp = (e.clientX - rect.left) / rect.width * 100;
    const yp = (e.clientY - rect.top) / rect.height * 100;
    placeChipAtPoint(draggingLabel, xp, yp);
  });

  // ===== 移动端：触摸拖拽 =====
  let touchLabel = null;
  let touchGhost = null;
  let touchMoved = false;
  let touchStartPos = null;

  function getTouchPos(e) {
    const t = e.touches[0] || e.changedTouches[0];
    return { x: t.clientX, y: t.clientY };
  }

  function isPointInArea(px, py) {
    const rect = area.getBoundingClientRect();
    return px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
  }

  function onTouchStart(e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    touchLabel = chip.dataset.label;
    touchMoved = false;
    const pos = getTouchPos(e);
    touchStartPos = pos;

    // 创建跟随手指的幽灵元素
    touchGhost = chip.cloneNode(true);
    touchGhost.classList.add('chip-ghost');
    touchGhost.style.position = 'fixed';
    touchGhost.style.left = (pos.x - chip.offsetWidth / 2) + 'px';
    touchGhost.style.top = (pos.y - chip.offsetHeight / 2) + 'px';
    touchGhost.style.pointerEvents = 'none';
    touchGhost.style.zIndex = '9999';
    document.body.appendChild(touchGhost);
    chip.classList.add('dragging');
  }

  function onTouchMove(e) {
    if (!touchLabel) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    if (touchStartPos) {
      const dx = pos.x - touchStartPos.x, dy = pos.y - touchStartPos.y;
      if (dx * dx + dy * dy > 25) touchMoved = true;
    }
    if (touchGhost) {
      touchGhost.style.left = (pos.x - 60) + 'px';
      touchGhost.style.top = (pos.y - 14) + 'px';
    }
    area.classList.toggle('drag-over', isPointInArea(pos.x, pos.y));
  }

  function onTouchEnd(e) {
    if (!touchLabel) return;
    const pos = getTouchPos(e);
    area.classList.remove('drag-over');

    if (touchMoved && isPointInArea(pos.x, pos.y)) {
      const rect = area.getBoundingClientRect();
      const xp = (pos.x - rect.left) / rect.width * 100;
      const yp = (pos.y - rect.top) / rect.height * 100;
      placeChipAtPoint(touchLabel, xp, yp);
    } else if (touchMoved) {
      // 拖到环外：若原来是已放置的，则移回池
      if (state.rings[touchLabel] != null) unplaceChip(touchLabel);
    }
    // 未移动（点击）：留给 click 事件处理循环放入

    cleanupTouch();
  }

  function onTouchCancel() { cleanupTouch(); }

  function cleanupTouch() {
    if (touchGhost) { touchGhost.remove(); touchGhost = null; }
    document.querySelectorAll('.chip.dragging').forEach(c => c.classList.remove('dragging'));
    touchLabel = null;
    touchStartPos = null;
  }

  // 绑定到环区和池，事件委托
  area.addEventListener('touchstart', onTouchStart, { passive: false });
  const pool = document.getElementById('pool');
  if (pool) pool.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  document.addEventListener('touchcancel', onTouchCancel, { passive: false });

  // ===== 点击 chip 循环放入外/中/内环（移动端友好，桌面也可用） =====
  function onChipClick(e) {
    // 触摸拖动后不触发点击循环
    if (touchMoved) return;
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const key = chip.dataset.label;
    const cur = state.rings[key];
    const order = [null, 1, 2, 3];
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];
    state.rings[key] = next;
    if (next == null) {
      delete state.positions[key];
    } else {
      const kIdx = LABEL_KEYS.indexOf(key);
      const angle = (kIdx / LABEL_KEYS.length) * Math.PI * 2 - Math.PI / 2;
      const r = next === 3 ? 14 : next === 2 ? 28 : 42;
      const xp = 50 + Math.cos(angle) * r;
      const yp = 50 + Math.sin(angle) * r;
      state.positions[key] = findNonOverlappingPos(xp, yp, key);
    }
    renderRingChips();
  }

  // 用 click 统一处理（桌面+移动端点击）
  area.addEventListener('click', onChipClick);
  if (pool) pool.addEventListener('click', onChipClick);
}

// ===== 情景题 =====
function renderScenarios() {
  if (state.scenarios.length === 0) {
    state.scenarios = LABEL_KEYS.map(k => ({ label: k, intensity: null, coping: null }));
  }

  const list = LABEL_KEYS.map((key, i) => {
    const ans = state.scenarios[i];
    return `
      <div class="scenario">
        <div class="sc-label">${i+1}. ${t('label.'+key)}</div>
        <div class="sc-text">${t('scenario.'+key)}</div>
        <div class="q-block">
          <div class="q-title">${t('scenarios.intensity')}</div>
          <div class="opts">
            <div class="opt ${ans.intensity===1?'selected':''}" data-i="${i}" data-int="1">${t('int.low')}</div>
            <div class="opt ${ans.intensity===2?'selected':''}" data-i="${i}" data-int="2">${t('int.mid')}</div>
            <div class="opt ${ans.intensity===3?'selected':''}" data-i="${i}" data-int="3">${t('int.high')}</div>
          </div>
        </div>
        <div class="q-block">
          <div class="q-title">${t('scenarios.coping')}</div>
          <div class="opts">
            ${COPING_KEYS.map(k => `
              <div class="opt opt-abc ${ans.coping===k?'selected':''}" data-i="${i}" data-cope="${k}">
                <span class="opt-letter">${k}</span>${t('coping.'+k)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  view.innerHTML = `
    <div class="card">
      <h1>${t('scenarios.title')}</h1>
      <p class="ring-guide">${t('scenarios.guide')}</p>
      ${list}
      <div class="row">
        <button class="btn btn-ghost" id="backBtn">${t('scenarios.back')}</button>
        <button class="btn btn-primary" id="submitBtn">${t('scenarios.submit')}</button>
      </div>
    </div>
  `;

  document.getElementById('backBtn').onclick = () => setStep(1);
  document.getElementById('submitBtn').onclick = submitAndShow;

  view.querySelectorAll('[data-int]').forEach(el => {
    el.onclick = () => {
      const i = Number(el.dataset.i);
      state.scenarios[i].intensity = Number(el.dataset.int);
      el.parentNode.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    };
  });
  view.querySelectorAll('[data-cope]').forEach(el => {
    el.onclick = () => {
      const i = Number(el.dataset.i);
      state.scenarios[i].coping = el.dataset.cope;
      el.parentNode.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    };
  });
}

async function submitAndShow() {
  for (let i = 0; i < state.scenarios.length; i++) {
    const a = state.scenarios[i];
    if (!a.intensity || !a.coping) {
      alert(t('scenarios.alert', { n: i + 1 }));
      return;
    }
  }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = t('scenarios.submitting');
  try {
    // 把 key 转成中文标签再提交（兼容后端）
    const ringsZh = {};
    for (const [k, v] of Object.entries(state.rings)) ringsZh[LABEL_TO_ZH[k]] = v;
    const scenariosZh = state.scenarios.map(s => ({
      label: LABEL_TO_ZH[s.label],
      intensity: s.intensity,
      coping: s.coping
    }));

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rings: ringsZh, scenarios: scenariosZh })
    });
    const data = await res.json();
    if (res.ok) {
      state.report = data.report;
      state.number = data.number || '';
      setStep(3);
    } else {
      alert(t('submit.error') + (data.error || ''));
    }
  } catch (e) {
    alert(t('network.error') + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = t('scenarios.submit');
  }
}

// ===== 结果导出 / 分享 =====
// 生成报告的纯文本（用于复制分享）
function buildReportText() {
  const r = state.report;
  if (!r) return '';
  const lines = [];
  lines.push(t('result.title'));
  lines.push('─'.repeat(30));

  // 主要压力源
  lines.push('');
  lines.push(t('result.section1'));
  if (!r.mainStressors || r.mainStressors.length === 0) {
    lines.push(t('result.empty.main'));
  } else {
    r.mainStressors.forEach((s, i) => {
      const key = ZH_TO_LABEL[s.label] || s.label;
      lines.push(`${i + 1}. ${t('label.' + key)}`);
      lines.push(`   ${t('suggestion.' + key)}`);
    });
  }

  // 不一致选项
  lines.push('');
  lines.push(t('result.section2'));
  if (!r.inconsistencies || r.inconsistencies.length === 0) {
    lines.push(t('result.empty.incons'));
  } else {
    r.inconsistencies.forEach(item => {
      const key = ZH_TO_LABEL[item.label] || item.label;
      const dirKey = item.direction === '高估' ? 'over' : 'under';
      lines.push(`• ${t('result.incons.name', { dir: t('result.incons.' + dirKey), label: t('label.' + key) })}`);
    });
  }

  // 应对风格
  const style = r.copingStyle || 'A';
  lines.push('');
  lines.push(t('result.section3'));
  lines.push(`${t('copingStyle.' + style + '.name')}（${style}）`);
  lines.push(t('copingStyle.' + style + '.desc'));

  // 问卷编号 + 提醒
  if (state.number) {
    lines.push('');
    lines.push(t('result.serialLabel') + '：' + state.number);
    lines.push(t('result.copingReminder', { style: `${t('copingStyle.' + style + '.name')}（${style}）` }));
  }

  return lines.join('\n');
}

// 复制报告文本到剪贴板（兼容降级）
async function copyReport() {
  const text = buildReportText();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    const btn = document.getElementById('copyBtn');
    const orig = btn.textContent;
    btn.textContent = '✓ ' + t('result.copied');
    setTimeout(() => { btn.textContent = orig; }, 2000);
  } catch (e) {
    alert(t('network.error') + e.message);
  }
}

// 下载报告为 PDF
async function downloadReport() {
  const card = document.querySelector('#view .card');
  if (!card) return;
  const btn = document.getElementById('downloadBtn');
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('result.exporting');

  try {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      throw new Error('PDF libs not loaded');
    }
    const canvas = await html2canvas(card, {
      backgroundColor: '#f4f6fb',
      scale: window.devicePixelRatio > 1 ? 2 : 1,
      useCORS: true,
      logging: false
    });

    const { jsPDF } = jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('StressMap-report.pdf');
  } catch (e) {
    alert(t('result.downloadReport') + ' ' + t('network.error') + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

// 保存为图片（html2canvas）
async function exportImage() {
  const card = document.querySelector('#view .card');
  if (!card) return;
  const btn = document.getElementById('exportImgBtn');
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('result.exporting');

  try {
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas not loaded');
    }
    const canvas = await html2canvas(card, {
      backgroundColor: '#f4f6fb',
      scale: window.devicePixelRatio > 1 ? 2 : 1,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = 'StressMap-report.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    // 降级到下载文本
    alert(t('result.exportImage') + ' ' + t('network.error') + e.message);
    downloadReport();
  } finally {
    btn.disabled = false;
    btn.textContent = orig;
  }
}

// ===== 结果页 =====
function renderResult() {
  const r = state.report;
  if (!r) { setStep(0); return; }

  // 主要压力源：把后端返回的中文 label 翻成 key，再 t()
  let mainHtml;
  if (!r.mainStressors || r.mainStressors.length === 0) {
    mainHtml = `<div class="empty">${t('result.empty.main')}</div>`;
  } else {
    mainHtml = '<div class="stressor-list">' + r.mainStressors.map((s, i) => {
      const key = ZH_TO_LABEL[s.label] || s.label;
      return `
        <div class="stressor-item">
          <div class="s-name">${i+1}. ${t('label.'+key)}</div>
          <div class="s-sug">${t('suggestion.'+key)}</div>
        </div>
      `;
    }).join('') + '</div>';
  }

  // 不一致选项
  let inconsHtml;
  if (!r.inconsistencies || r.inconsistencies.length === 0) {
    inconsHtml = `<div class="empty">${t('result.empty.incons')}</div>`;
  } else {
    inconsHtml = r.inconsistencies.map(item => {
      const key = ZH_TO_LABEL[item.label] || item.label;
      const isHigh = item.diff >= 2;
      const tag = isHigh
        ? `<span class="i-tag high">${t('result.tag.high')}</span>`
        : `<span class="i-tag mid">${t('result.tag.mid')}</span>`;
      const dirKey = item.direction === '高估' ? 'over' : 'under';
      const dirText = t('result.incons.' + dirKey);
      const name = t('result.incons.name', { dir: dirText, label: t('label.'+key) });
      const desc = t('result.incons.desc.' + dirKey, { label: t('label.'+key) });
      return `
        <div class="incons-item">
          ${tag}
          <div class="i-name">${name}</div>
          <div class="i-text">${desc}</div>
        </div>
      `;
    }).join('');
  }

  // 应对风格
  const style = r.copingStyle || 'A';
  const counts = r.counts || { A: 0, B: 0, C: 0 };

  view.innerHTML = `
    <div class="card">
      <h1>${t('result.title')}</h1>
      <p class="subtitle">${t('result.subtitle')}</p>

      <div class="report-section">
        <h2>${t('result.section1')} <span class="badge">${t('result.badge1')}</span></h2>
        ${mainHtml}
      </div>

      <div class="report-section">
        <h2>${t('result.section2')} <span class="badge">${t('result.badge2')}</span></h2>
        ${inconsHtml}
      </div>

      <div class="report-section">
        <h2>${t('result.section3')}</h2>
        <div class="coping-card">
          <div class="c-title">${t('result.coping.title')}</div>
          <div class="c-style">${t('copingStyle.'+style+'.name')}（${style}）</div>
          <div class="c-desc">${t('copingStyle.'+style+'.desc')}</div>
          <div style="margin-top:12px;font-size:13px;color:var(--c-muted);">
            ${t('result.coping.counts', { a: counts.A||0, b: counts.B||0, c: counts.C||0 })}
          </div>
        </div>
      </div>

      <div class="export-actions">
        <button class="btn btn-ghost" id="exportImgBtn">📷 ${t('result.exportImage')}</button>
        <button class="btn btn-ghost" id="downloadBtn">📄 ${t('result.downloadReport')}</button>
        <button class="btn btn-ghost" id="copyBtn">📋 ${t('result.copyText')}</button>
      </div>

      <div class="row">
        <button class="btn btn-ghost" id="restartBtn">${t('result.restart')}</button>
      </div>
      <div class="footer-note">${t('result.footer')}</div>
      <div class="serial-block">
        <div class="serial-no">${state.number || '—'}</div>
        <div class="serial-hint">${t('result.copingReminder', { style: '<b>' + t('copingStyle.'+style+'.name') + '（' + style + '）</b>' })}</div>
      </div>
    </div>
  `;

  document.getElementById('restartBtn').onclick = () => {
    state.rings = {};
    state.scenarios = [];
    state.positions = {};
    state.report = null;
    state.number = null;
    setStep(0);
  };

  document.getElementById('exportImgBtn').onclick = exportImage;
  document.getElementById('downloadBtn').onclick = downloadReport;
  document.getElementById('copyBtn').onclick = copyReport;
}

// 语言切换时重绘当前步骤
window.addEventListener('languageChanged', () => {
  render();
});

// 启动
render();
