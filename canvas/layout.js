// layout.js — 布局层：自适应分层排布、模块聚类、tools 双列、连线走向、适配视图（纯计算，可测试）

var CARD_W = 230;
var GAP_X = 70;
var GAP_Y = 90;
var MAX_ROWS_SHOWN = 7;

// 细节开关决定小函数是否可见
function visibleFns(file, showMinor) {
  return showMinor ? file.functions : file.functions.filter(function (fn) { return !fn.minor; });
}

function visibleFiles(graph, showMinor) {
  return showMinor ? graph.files : graph.files.filter(function (f) { return !f.minorOnly; });
}

// 卡片高度随可见函数行数走；超过上限折叠成"还有 N 个"提示行
function measureCard(file, showMinor) {
  var n = visibleFns(file, showMinor).length;
  var shown = Math.min(n, MAX_ROWS_SHOWN);
  return { w: CARD_W, h: 50 + shown * 30 + (n > shown ? 26 : 0) };
}

// 流程区（L3/L4）按层分行、按模块聚类；tools（L1/L2）靠右成列并框起来
function computeLayout(graph, showMinor) {
  var positions = {}, sizes = {};
  var files = visibleFiles(graph, showMinor);
  files.forEach(function (f) { sizes[f.path] = measureCard(f, showMinor); });
  var flow = files.filter(function (f) { return !f.isTool; });
  var tools = files.filter(function (f) { return f.isTool; });
  var byModule = function (a, b) {
    return a.module === b.module ? (a.path < b.path ? -1 : 1) : (a.module < b.module ? -1 : 1);
  };
  var cap = Math.max(3, Math.min(6, Math.ceil(Math.sqrt(flow.length * 1.6))));
  var rows = [];
  ['L4', 'L3'].forEach(function (lv) {
    var group = flow.filter(function (f) { return f.level === lv; }).sort(byModule);
    for (var i = 0; i < group.length; i += cap) rows.push(group.slice(i, i + cap));
  });
  var y = 40, flowRight = 0;
  rows.forEach(function (row) {
    var width = row.length * CARD_W + (row.length - 1) * GAP_X;
    var x = Math.max(40, (cap * CARD_W + (cap - 1) * GAP_X - width) / 2 + 40);
    var maxH = 0;
    row.forEach(function (f) {
      positions[f.path] = { x: x, y: y };
      x += CARD_W + GAP_X;
      if (sizes[f.path].h > maxH) maxH = sizes[f.path].h;
    });
    if (x - GAP_X > flowRight) flowRight = x - GAP_X;
    y += maxH + GAP_Y;
  });
  var toolsBox = null;
  if (tools.length) {
    tools.sort(byModule);
    var cols = tools.length > 5 ? 2 : 1;
    var tx = (flowRight || 40) + 110, ty = 40;
    var colBottom = [];
    for (var c = 0; c < cols; c++) colBottom[c] = ty + 20;
    tools.forEach(function (f, i) {
      var col = i % cols;
      positions[f.path] = { x: tx + 24 + col * (CARD_W + 24), y: colBottom[col] + 26 };
      colBottom[col] = positions[f.path].y + sizes[f.path].h - 6;
    });
    var bottom = Math.max.apply(null, colBottom);
    toolsBox = { x: tx, y: ty, w: cols * CARD_W + (cols - 1) * 24 + 48, h: bottom - ty + 30 };
  }
  return { positions: positions, sizes: sizes, toolsBox: toolsBox, bbox: layoutBbox(positions, sizes, toolsBox) };
}

// 全部卡片 + tools 框的外接矩形，用于"看全貌"
function layoutBbox(positions, sizes, toolsBox) {
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  Object.keys(positions).forEach(function (p) {
    var pos = positions[p], s = sizes[p];
    if (pos.x < x1) x1 = pos.x;
    if (pos.y < y1) y1 = pos.y;
    if (pos.x + s.w > x2) x2 = pos.x + s.w;
    if (pos.y + s.h > y2) y2 = pos.y + s.h;
  });
  if (toolsBox) {
    if (toolsBox.x < x1) x1 = toolsBox.x;
    if (toolsBox.y < y1) y1 = toolsBox.y;
    if (toolsBox.x + toolsBox.w > x2) x2 = toolsBox.x + toolsBox.w;
    if (toolsBox.y + toolsBox.h > y2) y2 = toolsBox.y + toolsBox.h;
  }
  if (x1 === Infinity) return { x: 0, y: 0, w: 800, h: 500 };
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

// 连线锚点：横向差距大走左右侧边，否则走下边→上边
function edgePath(fromPos, fromSize, toPos, toSize) {
  var fcx = fromPos.x + fromSize.w / 2, tcx = toPos.x + toSize.w / 2;
  var dx = (toPos.x > fromPos.x + fromSize.w || fromPos.x > toPos.x + toSize.w);
  var x1, y1, x2, y2;
  if (dx) {
    var leftToRight = tcx > fcx;
    x1 = leftToRight ? fromPos.x + fromSize.w : fromPos.x;
    y1 = fromPos.y + fromSize.h / 2;
    x2 = leftToRight ? toPos.x : toPos.x + toSize.w;
    y2 = toPos.y + toSize.h / 2;
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
  }
  var down = toPos.y > fromPos.y;
  x1 = fcx; y1 = down ? fromPos.y + fromSize.h : fromPos.y;
  x2 = tcx; y2 = down ? toPos.y : toPos.y + toSize.h;
  var my = (y1 + y2) / 2;
  return 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2;
}

// 算出能看到整张图的缩放与平移
function computeFit(bbox, viewW, viewH) {
  var scale = Math.min((viewW - 60) / bbox.w, (viewH - 60) / bbox.h, 1);
  if (!(scale > 0)) scale = 1;
  if (scale < 0.2) scale = 0.2;
  return {
    scale: scale,
    x: (viewW - bbox.w * scale) / 2 - bbox.x * scale,
    y: (viewH - bbox.h * scale) / 2 - bbox.y * scale
  };
}
