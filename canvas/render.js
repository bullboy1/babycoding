// render.js — 渲染层：把 graph + layout 画成卡片、连线、tools 框、详情面板

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 单张卡片：标题给人看，函数行 = 白话描述 + 被引用次数 + 改动圆点
function cardHtml(file, pos, selected) {
  var rows = file.functions.map(function (fn) {
    var d = fn.desc ? esc(fn.desc) : '（还没写白话说明）';
    var cls = fn.desc ? 'fn-desc' : 'fn-desc blank';
    var refs = fn.refs !== '-' ? '被用 ' + esc(fn.refs) + ' 处' : '';
    var dot = fn.changedKind ?
      '<i class="fn-dot ' + fn.changedKind + '" title="上次任务' + (fn.changedKind === 'added' ? '新增' : '改动') + '"></i>' : '';
    return '<div class="fn-row"><span class="' + cls + '" title="' + esc(fn.name) + ' ' + esc(fn.signature) + '">' + dot + d +
      '</span><span class="fn-refs">' + refs + '</span></div>';
  }).join('');
  var cls = 'card ' + file.level.toLowerCase() + (selected ? ' selected' : '') + (file.changed ? ' changed' : '');
  var badge = file.changed ? '<span class="badge-changed">上次改动</span>' : '';
  return '<div class="' + cls + '" data-path="' + esc(file.path) + '" style="left:' + pos.x + 'px;top:' + pos.y + 'px">' +
    '<div class="card-head">' + badge + '<div class="card-title">' + esc(file.name) + '</div>' +
    '<div class="card-sub">' + esc(file.module) + ' · ' + esc(LEVEL_WORDS[file.level] || file.level) + '</div></div>' + rows + '</div>';
}

// tools 虚线框 + 标签（在画布坐标系内，跟随缩放平移）
function toolsBoxHtml(box) {
  if (!box) return '';
  return '<div id="tools-box" style="left:' + box.x + 'px;top:' + box.y + 'px;width:' + box.w + 'px;height:' + box.h + 'px"></div>' +
    '<div id="tools-label" style="left:' + (box.x + 16) + 'px;top:' + (box.y - 8) + 'px">tools · 可复用零件</div>';
}

// 连线整体重画；与选区相连的线标红，帮人看清"动这里会牵扯谁"
function edgesSvgHtml(graph, layout, selection) {
  return graph.edges.map(function (e) {
    var fp = layout.positions[e.from], tp = layout.positions[e.to];
    if (!fp || !tp) return '';
    var hot = selection.has(e.from) || selection.has(e.to);
    var d = edgePath(fp, layout.sizes[e.from], tp, layout.sizes[e.to]);
    return '<path class="' + (hot ? 'hot' : '') + '" data-from="' + esc(e.from) + '" data-to="' + esc(e.to) + '" d="' + d + '"/>';
  }).join('');
}

// 全量重绘世界（小图足够快，逻辑简单不出错）
function renderWorld(state) {
  var g = state.graph, l = state.layout;
  var html = toolsBoxHtml(l.toolsBox);
  g.files.forEach(function (f) {
    html += cardHtml(f, l.positions[f.path], state.sel.has(f.path));
  });
  document.getElementById('cards').innerHTML = html;
  var svg = document.getElementById('edges');
  svg.setAttribute('width', l.bbox.x + l.bbox.w + 200);
  svg.setAttribute('height', l.bbox.y + l.bbox.h + 200);
  svg.innerHTML = edgesSvgHtml(g, l, state.sel);
  document.getElementById('meta').textContent = metaText(g);
  document.getElementById('empty-tip').hidden = g.files.length > 0;
  renderChangesChip(g);
}

// 顶栏小胶囊：有改动记录才出现，点击一键选中"AI 动过的地方"
function renderChangesChip(graph) {
  var chip = document.getElementById('changes-chip');
  chip.hidden = !graph.changes;
  if (graph.changes) {
    chip.textContent = '上次 AI 任务动了 ' + graph.changes.entries.length + ' 处（' + graph.changes.date + '）点我高亮';
  }
}

function metaText(graph) {
  var fnCount = graph.files.reduce(function (n, f) { return n + f.functions.length; }, 0);
  var name = graph.meta.project || '未命名项目';
  return name + ' · ' + graph.files.length + ' 个功能块 · ' + fnCount + ' 个功能' + (graph.edges.length ? '' : ' · 无连线数据（阶段一）');
}

// 详情面板：白话在卡片上，专业信息（给 AI 的）收在这里
function renderDetail(file) {
  var el = document.getElementById('detail');
  if (!file) { el.hidden = true; return; }
  var rows = file.functions.map(function (fn) {
    return '<tr><td class="mono">' + esc(fn.name) + '</td><td class="mono">' + esc(fn.level) + ' ' + esc(fn.signature) +
      '</td><td>' + esc(fn.desc || '-') + '</td></tr>';
  }).join('');
  el.innerHTML = '<button class="d-close" data-close="1">✕</button><h3>' + esc(file.name) + '</h3>' +
    '<div class="d-path">' + esc(file.path) + '</div><table>' + rows + '</table>' +
    '<div class="d-note">这些是给 AI 查表用的专业信息，来自 FUNCTIONS.md，你不需要看懂。</div>';
  el.hidden = false;
}

// 底部操作条：选了东西才出现，引导"框选 → 说人话 → 拿指令"
function renderActionBar(state) {
  var bar = document.getElementById('action-bar');
  var n = state.sel.size;
  bar.hidden = n === 0;
  if (n > 0) document.getElementById('sel-count').textContent = '已选 ' + n + ' 个功能块';
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function () { t.hidden = true; }, 2600);
}
