// render.js — 渲染层：卡片、带箭头的连线、聚焦淡出、层带标签、块式详情面板（文案全部走 i18n）

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 模块名 → 稳定的颜色，帮人一眼把同模块的卡片归为一组
function modHue(module) {
  var h = 0;
  for (var i = 0; i < module.length; i++) h = (h * 31 + module.charCodeAt(i)) % 360;
  return h;
}

// 选区的"邻居圈"：选中的 + 与之直接相连的；其余卡片淡出
function focusSet(graph, sel) {
  if (!sel.size) return null;
  var set = {};
  sel.forEach(function (p) { set[p] = 1; });
  graph.edges.forEach(function (e) {
    if (sel.has(e.from)) set[e.to] = 1;
    if (sel.has(e.to)) set[e.from] = 1;
  });
  return set;
}

// 单张卡片：标题给人看，函数行 = 白话 + 引用数 + 改动圆点；宽度字号随缩放档位
function cardHtml(file, pos, state) {
  var scale = state.cardScale || 1;
  var fns = visibleFns(file, state.showMinor);
  var shown = fns.slice(0, MAX_ROWS_SHOWN);
  var rows = shown.map(function (fn) {
    var d = fn.desc ? esc(fn.desc) : t('noDesc');
    var cls = 'fn-desc' + (fn.desc ? '' : ' blank') + (fn.minor ? ' minor' : '');
    var refs = fn.refs !== '-' ? t('refs', esc(fn.refs)) : '';
    var dot = fn.changedKind ?
      '<i class="fn-dot ' + fn.changedKind + '" title="' + t(fn.changedKind === 'added' ? 'dotAdded' : 'dotChanged') + '"></i>' : '';
    return '<div class="fn-row"><span class="' + cls + '" title="' + esc(fn.name) + ' ' + esc(fn.signature) + '">' + dot + d +
      '</span><span class="fn-refs">' + refs + '</span></div>';
  }).join('');
  if (fns.length > shown.length) rows += '<div class="fn-row fn-more">' + t('moreRows', fns.length - shown.length) + '</div>';
  var cls = 'card ' + file.level.toLowerCase() + (state.sel.has(file.path) ? ' selected' : '') +
    (file.changed ? ' changed' : '') + (state.focus && !state.focus[file.path] ? ' faded' : '');
  var badge = file.changed ? '<span class="badge-changed">' + t('changedBadge') + '</span>' : '';
  var lvWord = t(LEVEL_RANK[file.level] ? file.level : 'L-');
  var dot = '<i class="mod-dot" style="background:hsl(' + modHue(file.module) + ',45%,52%)"></i>';
  var size = 'width:' + Math.round(CARD_W * scale) + 'px;font-size:' + (13 * scale).toFixed(1) + 'px';
  return '<div class="' + cls + '" data-path="' + esc(file.path) + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px;' + size + '">' +
    '<div class="card-head">' + badge + '<div class="card-title">' + esc(file.name) + '</div>' +
    '<div class="card-sub">' + dot + esc(file.module) + ' · ' + lvWord + '</div></div>' + rows + '</div>';
}

// tools 虚线框、层带标签、孤立带标签（都在画布坐标系内，跟随缩放平移）
function labelsHtml(layout) {
  var html = '';
  if (layout.toolsBox) {
    var b = layout.toolsBox;
    html += '<div id="tools-box" style="left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px"></div>' +
      '<div class="band-label" style="left:' + (b.x + 16) + 'px;top:' + (b.y - 8) + 'px">' + t('toolsBox') + '</div>';
  }
  layout.bands.forEach(function (band) {
    html += '<div class="band-label" style="left:' + band.x + 'px;top:' + band.y + 'px">' + t(band.key) + '</div>';
  });
  if (layout.isoLabel) {
    html += '<div class="band-label iso" style="left:' + layout.isoLabel.x + 'px;top:' + layout.isoLabel.y + 'px">' + t('isoBand') + '</div>';
  }
  return html;
}

// 连线整体重画：方向箭头 + 选区相关标红 + 无关线淡出
function edgesSvgHtml(graph, layout, selection) {
  var defs = '<defs>' +
    '<marker id="arw" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><polygon points="0,0 8,4 0,8" fill="#cfcaba"/></marker>' +
    '<marker id="arw-hot" viewBox="0 0 8 8" refX="7.2" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><polygon points="0,0 8,4 0,8" fill="#d97757"/></marker></defs>';
  return defs + graph.edges.map(function (e) {
    var fp = layout.positions[e.from], tp = layout.positions[e.to];
    if (!fp || !tp) return '';
    var hot = selection.has(e.from) || selection.has(e.to);
    var cls = hot ? 'hot' : (selection.size ? 'faded' : '');
    var d = edgePath(fp, layout.sizes[e.from], tp, layout.sizes[e.to]);
    return '<path class="' + cls + '" data-from="' + esc(e.from) + '" data-to="' + esc(e.to) + '" d="' + d +
      '" marker-end="url(#' + (hot ? 'arw-hot' : 'arw') + ')"/>';
  }).join('');
}

// 全量重绘世界（小图足够快，逻辑简单不出错）
function renderWorld(state) {
  var g = state.graph, l = state.layout;
  state.focus = focusSet(g, state.sel);
  var html = labelsHtml(l);
  g.files.forEach(function (f) {
    var pos = l.positions[f.path];
    if (pos) html += cardHtml(f, pos, state);
  });
  document.getElementById('cards').innerHTML = html;
  var svg = document.getElementById('edges');
  svg.setAttribute('width', l.bbox.x + l.bbox.w + 200);
  svg.setAttribute('height', l.bbox.y + l.bbox.h + 200);
  svg.innerHTML = edgesSvgHtml(g, l, state.sel);
  document.getElementById('meta').textContent = metaText(state);
  document.getElementById('empty-tip').hidden = g.files.length > 0;
  renderChangesChip(g);
}

// 顶栏摘要：项目名 + 功能块数 + 功能数 + 连线数 + 小函数折叠情况
function metaText(state) {
  var g = state.graph, all = 0, minor = 0;
  g.files.forEach(function (f) { f.functions.forEach(function (fn) { all++; if (fn.minor) minor++; }); });
  var s = t('metaLine', g.meta.project || t('unnamed'), visibleFiles(g, state.showMinor).length, all - minor);
  if (minor) s += t(state.showMinor ? 'metaMinorShown' : 'metaMinorHidden', minor);
  s += g.edges.length ? t('metaEdges', g.edges.length) : t('metaNoEdges');
  return s;
}

// 顶栏小胶囊：有改动记录才出现，点击一键选中"AI 动过的地方"
function renderChangesChip(graph) {
  var chip = document.getElementById('changes-chip');
  chip.hidden = !graph.changes;
  if (graph.changes) chip.textContent = t('chip', graph.changes.entries.length, graph.changes.date);
}

// 详情面板：块式布局——名字/层级/引用一行、签名一行、白话一行，永不压缩
function renderDetail(file) {
  var el = document.getElementById('detail');
  if (!file) { el.hidden = true; return; }
  var blocks = file.functions.map(function (fn) {
    var tag = fn.minor ? '<span class="minor-tag">' + t('minorTag') + '</span>' : '';
    var refs = fn.refs !== '-' ? '<span class="d-refs">' + t('refs', esc(fn.refs)) + '</span>' : '';
    var lv = fn.level !== '-' ? '<span class="d-lv">' + esc(fn.level) + '</span>' : '';
    var sig = fn.signature ? '<div class="d-sig">' + esc(fn.signature) + '</div>' : '';
    var desc = '<div class="d-desc' + (fn.desc ? '' : ' blank') + '">' + (fn.desc ? esc(fn.desc) : t('noDesc')) + '</div>';
    return '<div class="d-fn"><div class="d-fn-head"><span class="d-name">' + esc(fn.name) + '</span>' + lv + tag + refs + '</div>' +
      sig + desc + '</div>';
  }).join('');
  el.innerHTML = '<button class="d-close" data-close="1">✕</button><h3>' + esc(file.name) + '</h3>' +
    '<div class="d-path">' + esc(file.path) + '</div>' + blocks +
    '<div class="d-note">' + t('detailNote') + '</div>';
  el.hidden = false;
}

// 底部操作条：选了东西才出现，引导"框选 → 说人话 → 拿指令"
function renderActionBar(state) {
  var bar = document.getElementById('action-bar');
  bar.hidden = state.sel.size === 0;
  if (state.sel.size > 0) document.getElementById('sel-count').textContent = t('selCount', state.sel.size);
}

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function () { el.hidden = true; }, 2600);
}
