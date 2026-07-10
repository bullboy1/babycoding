// render.js — 渲染层：把 graph + layout 画成卡片、连线、tools 框、详情面板（文案全部走 i18n）

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 单张卡片：标题给人看，函数行 = 白话描述 + 引用数 + 改动圆点；超长折叠
function cardHtml(file, pos, selected, showMinor) {
  var fns = visibleFns(file, showMinor);
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
  var cls = 'card ' + file.level.toLowerCase() + (selected ? ' selected' : '') + (file.changed ? ' changed' : '');
  var badge = file.changed ? '<span class="badge-changed">' + t('changedBadge') + '</span>' : '';
  var levelWord = t(LEVEL_RANK[file.level] ? file.level : 'L-');
  return '<div class="' + cls + '" data-path="' + esc(file.path) + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px">' +
    '<div class="card-head">' + badge + '<div class="card-title">' + esc(file.name) + '</div>' +
    '<div class="card-sub">' + esc(file.module) + ' · ' + levelWord + '</div></div>' + rows + '</div>';
}

// tools 虚线框 + 标签（在画布坐标系内，跟随缩放平移）
function toolsBoxHtml(box) {
  if (!box) return '';
  return '<div id="tools-box" style="left:' + box.x + 'px;top:' + box.y + 'px;width:' + box.w + 'px;height:' + box.h + 'px"></div>' +
    '<div id="tools-label" style="left:' + (box.x + 16) + 'px;top:' + (box.y - 8) + 'px">' + t('toolsBox') + '</div>';
}

// 连线整体重画；与选区相连的线标红，帮人看清"动这里会牵扯谁"
function edgesSvgHtml(graph, layout, selection) {
  return graph.edges.map(function (e) {
    var fp = layout.positions[e.from], tp = layout.positions[e.to];
    if (!fp || !tp) return '';
    var hot = selection.has(e.from) || selection.has(e.to);
    var d = edgePath(fp, layout.sizes[e.from], tp, layout.sizes[e.to]);
    return '<path class="' + (hot ? 'hot' : '') + '" d="' + d + '"/>';
  }).join('');
}

// 全量重绘世界（小图足够快，逻辑简单不出错）
function renderWorld(state) {
  var g = state.graph, l = state.layout;
  var html = toolsBoxHtml(l.toolsBox);
  g.files.forEach(function (f) {
    var pos = l.positions[f.path];
    if (pos) html += cardHtml(f, pos, state.sel.has(f.path), state.showMinor);
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

// 顶栏摘要：项目名 + 功能块数 + 功能数 + 小函数折叠情况
function metaText(state) {
  var g = state.graph, all = 0, minor = 0;
  g.files.forEach(function (f) { f.functions.forEach(function (fn) { all++; if (fn.minor) minor++; }); });
  var s = t('metaLine', g.meta.project || t('unnamed'), visibleFiles(g, state.showMinor).length, all - minor);
  if (minor) s += t(state.showMinor ? 'metaMinorShown' : 'metaMinorHidden', minor);
  if (!g.edges.length) s += t('metaNoEdges');
  return s;
}

// 顶栏小胶囊：有改动记录才出现，点击一键选中"AI 动过的地方"
function renderChangesChip(graph) {
  var chip = document.getElementById('changes-chip');
  chip.hidden = !graph.changes;
  if (graph.changes) chip.textContent = t('chip', graph.changes.entries.length, graph.changes.date);
}

// 详情面板：白话在卡片上，专业信息（给 AI 的）收在这里；小函数带标签全量列出
function renderDetail(file) {
  var el = document.getElementById('detail');
  if (!file) { el.hidden = true; return; }
  var rows = file.functions.map(function (fn) {
    var tag = fn.minor ? ' <span class="minor-tag">' + t('minorTag') + '</span>' : '';
    return '<tr><td class="mono">' + esc(fn.name) + tag + '</td><td class="mono">' + esc(fn.level) + ' ' + esc(fn.signature) +
      '</td><td>' + esc(fn.desc || '-') + '</td></tr>';
  }).join('');
  el.innerHTML = '<button class="d-close" data-close="1">✕</button><h3>' + esc(file.name) + '</h3>' +
    '<div class="d-path">' + esc(file.path) + '</div><table>' + rows + '</table>' +
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
