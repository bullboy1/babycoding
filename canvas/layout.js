// layout.js — 布局层：卡片测量、分层排布、连线走向、适配视图（纯计算，可在 node 中测试）

var CARD_W = 230;
var GAP_X = 70;
var GAP_Y = 90;
var ROW_CAP = 4;

// 卡片高度 = 头部 + 每个函数一行；与 style.css 的行高保持一致
function measureCard(file) {
  return { w: CARD_W, h: 50 + file.functions.length * 30 };
}

// 流程区（L3/L4）按层分行，tools（L1/L2）靠右成竖列并框起来
function computeLayout(graph) {
  var positions = {}, sizes = {};
  graph.files.forEach(function (f) { sizes[f.path] = measureCard(f); });
  var flow = graph.files.filter(function (f) { return !f.isTool; });
  var tools = graph.files.filter(function (f) { return f.isTool; });
  var rows = [];
  ['L4', 'L3'].forEach(function (lv) {
    var group = flow.filter(function (f) { return f.level === lv; });
    for (var i = 0; i < group.length; i += ROW_CAP) rows.push(group.slice(i, i + ROW_CAP));
  });
  var y = 40, flowRight = 0;
  rows.forEach(function (row) {
    var width = row.length * CARD_W + (row.length - 1) * GAP_X;
    var x = Math.max(40, (ROW_CAP * CARD_W + (ROW_CAP - 1) * GAP_X - width) / 2 + 40);
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
    var tx = (flowRight || 40) + 110, ty = 40, boxBottom = ty;
    tools.forEach(function (f) {
      positions[f.path] = { x: tx + 24, y: boxBottom + 46 };
      boxBottom = positions[f.path].y + sizes[f.path].h - 26;
    });
    toolsBox = { x: tx, y: ty, w: CARD_W + 48, h: boxBottom - ty + 50 };
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
