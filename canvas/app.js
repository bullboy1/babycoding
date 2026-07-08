// app.js — 交互层：平移缩放、框选、拖卡片、载入数据、把选区变成指令

var state = { graph: null, layout: null, sel: new Set(), view: { x: 0, y: 0, scale: 1 } };
var gesture = null;

function applyView() {
  document.getElementById('world').style.transform =
    'translate(' + state.view.x + 'px,' + state.view.y + 'px) scale(' + state.view.scale + ')';
}

function screenToWorld(cx, cy) {
  var r = document.getElementById('canvas').getBoundingClientRect();
  return { x: (cx - r.left - state.view.x) / state.view.scale, y: (cy - r.top - state.view.y) / state.view.scale };
}

function refresh() { renderWorld(state); renderActionBar(state); }

function setGraph(graph) {
  state.graph = graph;
  state.layout = computeLayout(graph);
  state.sel = new Set();
  fitView();
  refresh();
  renderDetail(null);
}

function fitView() {
  var c = document.getElementById('canvas');
  state.view = computeFit(state.layout.bbox, c.clientWidth, c.clientHeight);
  applyView();
}

function zoomAt(cx, cy, factor) {
  var r = document.getElementById('canvas').getBoundingClientRect();
  var s = Math.min(2.5, Math.max(0.2, state.view.scale * factor));
  var k = s / state.view.scale;
  state.view.x = (cx - r.left) - ((cx - r.left) - state.view.x) * k;
  state.view.y = (cy - r.top) - ((cy - r.top) - state.view.y) * k;
  state.view.scale = s;
  applyView();
}

function onWheel(e) {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, Math.pow(1.0015, -e.deltaY));
  else { state.view.x -= e.deltaX; state.view.y -= e.deltaY; applyView(); }
}

function onDown(e) {
  if (e.button !== 0) return;
  var card = e.target.closest ? e.target.closest('.card') : null;
  if (card) {
    var p = state.layout.positions[card.dataset.path];
    gesture = { type: 'card', path: card.dataset.path, el: card, sx: e.clientX, sy: e.clientY,
      ox: p.x, oy: p.y, moved: false, shift: e.shiftKey };
  } else {
    gesture = { type: 'marquee', sx: e.clientX, sy: e.clientY, moved: false, shift: e.shiftKey };
  }
}

function onMove(e) {
  if (!gesture) return;
  var dx = e.clientX - gesture.sx, dy = e.clientY - gesture.sy;
  if (Math.abs(dx) + Math.abs(dy) > 4) gesture.moved = true;
  if (!gesture.moved) return;
  if (gesture.type === 'card') {
    var p = state.layout.positions[gesture.path];
    p.x = gesture.ox + dx / state.view.scale;
    p.y = gesture.oy + dy / state.view.scale;
    gesture.el.style.left = p.x + 'px';
    gesture.el.style.top = p.y + 'px';
    document.getElementById('edges').innerHTML = edgesSvgHtml(state.graph, state.layout, state.sel);
  } else {
    var m = document.getElementById('marquee');
    var r = document.getElementById('canvas').getBoundingClientRect();
    m.hidden = false;
    m.style.left = Math.min(gesture.sx, e.clientX) - r.left + 'px';
    m.style.top = Math.min(gesture.sy, e.clientY) - r.top + 'px';
    m.style.width = Math.abs(dx) + 'px';
    m.style.height = Math.abs(dy) + 'px';
  }
}

function onUp(e) {
  if (!gesture) return;
  var g = gesture;
  gesture = null;
  document.getElementById('marquee').hidden = true;
  if (g.type === 'card') {
    if (g.moved) {
      state.layout.bbox = layoutBbox(state.layout.positions, state.layout.sizes, state.layout.toolsBox);
      refresh();
    } else { applySelectClick(g.path, g.shift); }
    return;
  }
  if (!g.moved) { state.sel = new Set(); afterSelectionChange(); return; }
  var a = screenToWorld(Math.min(g.sx, e.clientX), Math.min(g.sy, e.clientY));
  var b = screenToWorld(Math.max(g.sx, e.clientX), Math.max(g.sy, e.clientY));
  selectInRect(a.x, a.y, b.x, b.y, g.shift);
}

function applySelectClick(path, shift) {
  if (shift) { if (state.sel.has(path)) state.sel.delete(path); else state.sel.add(path); }
  else { state.sel = new Set([path]); }
  afterSelectionChange();
}

function selectInRect(x1, y1, x2, y2, additive) {
  if (!additive) state.sel = new Set();
  state.graph.files.forEach(function (f) {
    var p = state.layout.positions[f.path], s = state.layout.sizes[f.path];
    if (p.x < x2 && p.x + s.w > x1 && p.y < y2 && p.y + s.h > y1) state.sel.add(f.path);
  });
  afterSelectionChange();
}

function afterSelectionChange() {
  refresh();
  if (state.sel.size === 1) {
    var path = Array.from(state.sel)[0];
    renderDetail(state.graph.files.filter(function (f) { return f.path === path; })[0]);
  } else { renderDetail(null); }
}

// 一键选中上次任务动过的文件，配合底部指令条继续追问或改造
function selectChanged() {
  if (!state.graph.changes) return;
  state.sel = new Set(state.graph.changes.entries.map(function (e) { return e.path; })
    .filter(function (p) { return state.layout.positions[p]; }));
  afterSelectionChange();
}

function loadText(name, text) {
  try {
    var graph = /^\s*[\[{]/.test(text) ? normalizeGraph(JSON.parse(text)) : parseFunctionsMd(text);
    if (!graph.meta.project) graph.meta.project = name;
    setGraph(graph);
    showToast('已载入 ' + name);
  } catch (err) { showToast('没读懂这个文件：' + err.message); }
}

function readFile(file) {
  var r = new FileReader();
  r.onload = function () { loadText(file.name, r.result); };
  r.readAsText(file);
}

function onPrompt() {
  var txt = document.getElementById('instruction').value.trim();
  var p = buildPrompt(state.graph, Array.from(state.sel), txt);
  copyText(p, function (ok) {
    showToast(ok ? '指令已复制，去粘贴给 Claude Code 吧' : '复制失败，指令已打印到控制台（F12 查看）');
    if (!ok) console.log(p);
  });
}

function initApp() {
  var canvas = document.getElementById('canvas');
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  document.getElementById('btn-fit').onclick = fitView;
  document.getElementById('btn-zoom-in').onclick = function () { zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 1.25); };
  document.getElementById('btn-zoom-out').onclick = function () { zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 0.8); };
  document.getElementById('btn-demo').onclick = function () { setGraph(normalizeGraph(DEMO_GRAPH)); };
  document.getElementById('btn-open').onclick = function () { document.getElementById('file-input').click(); };
  document.getElementById('file-input').onchange = function (e) { if (e.target.files[0]) readFile(e.target.files[0]); };
  document.getElementById('btn-prompt').onclick = onPrompt;
  document.getElementById('changes-chip').onclick = selectChanged;
  document.getElementById('detail').addEventListener('click', function (e) {
    if (e.target.dataset.close) renderDetail(null);
  });
  document.getElementById('instruction').addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onPrompt();
  });
  window.addEventListener('dragover', function (e) { e.preventDefault(); document.body.classList.add('dropping'); });
  window.addEventListener('dragleave', function () { document.body.classList.remove('dropping'); });
  window.addEventListener('drop', function (e) {
    e.preventDefault();
    document.body.classList.remove('dropping');
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
  });
  setGraph(normalizeGraph(DEMO_GRAPH));
}

document.addEventListener('DOMContentLoaded', initApp);
