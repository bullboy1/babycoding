// ui.js — 次级交互：语言切换、细节开关、搜索、布局记忆——把"看多细、看哪种语言"都交给用户选

var SCALE_STEPS = [0.85, 1, 1.2, 1.45];

function initUi() {
  var langSel = document.getElementById('lang-select');
  langSel.value = getLang();
  langSel.onchange = function () { setLang(langSel.value); onLangChanged(); };
  document.getElementById('btn-minor').onclick = toggleMinor;
  document.getElementById('btn-refresh').onclick = function () { location.reload(); };
  document.getElementById('btn-relayout').onclick = resetLayout;
  document.getElementById('btn-card-minus').onclick = function () { setCardScale(-1); };
  document.getElementById('btn-card-plus').onclick = function () { setCardScale(1); };
  document.getElementById('search').oninput = runSearch;
  updateChrome();
}

// 卡片缩放三档往返：布局重算，档位按浏览器记住
function setCardScale(delta) {
  var i = SCALE_STEPS.indexOf(state.cardScale);
  if (i < 0) i = 1;
  i = Math.max(0, Math.min(SCALE_STEPS.length - 1, i + delta));
  if (SCALE_STEPS[i] === state.cardScale) return;
  state.cardScale = SCALE_STEPS[i];
  try { localStorage.setItem('babycode-scale', String(state.cardScale)); } catch (e) { i = i; }
  relayout();
}

// 重算布局并套用用户手动挪过的位置（细节开关/缩放共用）
function relayout() {
  state.layout = computeLayout(state.graph, state.showMinor, state.cardScale);
  applySavedPositions();
  fitView();
  refresh();
}

// 把工具栏、图例、占位符刷成当前语言
function updateChrome() {
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute('data-i18n'));
  document.getElementById('instruction').placeholder = t('instrPh');
  document.getElementById('search').placeholder = t('searchPh');
  document.getElementById('empty-tip').textContent = t('emptyTip');
  document.getElementById('btn-prompt').textContent = t('genBtn');
  document.getElementById('btn-minor').textContent = t(state.showMinor ? 'minorHide' : 'minorShow');
  document.getElementById('btn-card-minus').title = t('cardSmaller');
  document.getElementById('btn-card-plus').title = t('cardBigger');
  document.getElementById('help').title = t('hint');
}

function onLangChanged() {
  updateChrome();
  if (state.isDemo) { setGraph(demoGraph()); return; }
  refresh();
  renderDetail(null);
}

// 显示/隐藏小函数（<10 行且单调用点的私有助手），粒度由用户决定
function toggleMinor() {
  state.showMinor = !state.showMinor;
  try { localStorage.setItem('babycode-minor', state.showMinor ? '1' : ''); } catch (e) { state.showMinor = state.showMinor; }
  relayout();
  updateChrome();
}

function posKey() { return 'babycode-pos:' + (state.graph.meta.project || 'default'); }

// 用户拖过的卡片位置按项目记住，刷新数据后仍保持自己的摆法
function savePositions() {
  try { localStorage.setItem(posKey(), JSON.stringify(state.layout.positions)); } catch (e) { return; }
}

function applySavedPositions() {
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(posKey()) || 'null'); } catch (e) { saved = null; }
  if (!saved) return;
  Object.keys(saved).forEach(function (p) {
    if (state.layout.positions[p]) state.layout.positions[p] = saved[p];
  });
  state.layout.bbox = layoutBbox(state.layout.positions, state.layout.sizes, state.layout.toolsBox);
}

// 一键回到自动排版（清掉记住的手动位置）
function resetLayout() {
  try { localStorage.removeItem(posKey()); } catch (e) { return; }
  state.layout = computeLayout(state.graph, state.showMinor, state.cardScale);
  fitView();
  refresh();
}

// 搜索：命中的卡片保持醒目，其余压暗；清空恢复
function runSearch() {
  var q = document.getElementById('search').value.trim().toLowerCase();
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    var f = fileByPath(cards[i].getAttribute('data-path'));
    if (!f) continue;
    var hay = (f.path + ' ' + f.module + ' ' + f.functions.map(function (fn) { return fn.name + ' ' + fn.desc; }).join(' ')).toLowerCase();
    cards[i].classList.toggle('dim', !!q && hay.indexOf(q) < 0);
  }
}

function fileByPath(p) {
  return state.graph.files.filter(function (f) { return f.path === p; })[0];
}
