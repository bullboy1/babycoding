// data.js — 数据层：双语演示数据、graph 规范化、FUNCTIONS.md 解析（零依赖，可在 node 中测试）

var LEVEL_RANK = { L1: 1, L2: 2, L3: 3, L4: 4 };

var DEMO_GRAPH = {
  meta: { project: '演示：小小商城', stage: 2, lang: 'zh' },
  files: [
    { path: 'src/app/checkout.ts', module: 'app', functions: [
      { name: 'placeOrder', level: 'L4', signature: '(req)->Order', refs: 1, desc: '下单主流程：库存、算价、建单、通知' }
    ]},
    { path: 'src/orders/stock.ts', module: 'orders', functions: [
      { name: 'checkStock', level: 'L3', signature: '(items)->bool', refs: 2, desc: '检查库存够不够' }
    ]},
    { path: 'src/orders/pricing.ts', module: 'orders', functions: [
      { name: 'calcPrice', level: 'L3', signature: '(cart)->Money', refs: 2, desc: '算出购物车总价' },
      { name: 'applyCoupon', level: 'L3', signature: '(price,code)->Money', refs: 1, desc: '按优惠券调整价格' },
      { name: 'applyMemberDiscount', level: 'L3', signature: '(price,user)->Money', refs: 1, desc: '给会员打 95 折' }
    ]},
    { path: 'src/orders/create.ts', module: 'orders', functions: [
      { name: 'createOrder', level: 'L3', signature: '(cart,price)->Order', refs: 1, desc: '把订单存进数据库' }
    ]},
    { path: 'src/notify/email.ts', module: 'notify', functions: [
      { name: 'sendOrderEmail', level: 'L3', signature: '(order)->void', refs: 1, desc: '给买家发确认邮件' }
    ]},
    { path: 'src/utils/money.ts', module: 'utils', functions: [
      { name: 'formatMoney', level: 'L2', signature: '(n)->str', refs: 7, desc: '金额变成 ¥xx.xx 文本' }
    ]},
    { path: 'src/utils/http.ts', module: 'utils', functions: [
      { name: 'retryFetch', level: 'L2', signature: '(url,opt)->Resp', refs: 3, desc: '失败会自动重试的网络请求' }
    ]},
    { path: 'src/utils/time.ts', module: 'utils', functions: [
      { name: 'parseDate', level: 'L1', signature: '(s)->Date', refs: 4, desc: '文本日期转日期对象' }
    ]},
    { path: 'src/utils/validate.ts', module: 'utils', functions: [
      { name: 'validateSku', level: 'L1', signature: '(sku)->bool', refs: 2, desc: '检查商品编号格式对不对' },
      { name: 'trimSku', level: 'L1', signature: '(s)->str', refs: 1, desc: '去掉编号两端空格', minor: true }
    ]}
  ],
  edges: [
    { from: 'src/app/checkout.ts', to: 'src/orders/stock.ts' },
    { from: 'src/app/checkout.ts', to: 'src/orders/pricing.ts' },
    { from: 'src/app/checkout.ts', to: 'src/orders/create.ts' },
    { from: 'src/app/checkout.ts', to: 'src/notify/email.ts' },
    { from: 'src/orders/pricing.ts', to: 'src/utils/money.ts' },
    { from: 'src/orders/stock.ts', to: 'src/utils/http.ts' },
    { from: 'src/orders/create.ts', to: 'src/utils/time.ts' },
    { from: 'src/orders/create.ts', to: 'src/utils/validate.ts' },
    { from: 'src/notify/email.ts', to: 'src/utils/http.ts' },
    { from: 'src/notify/email.ts', to: 'src/utils/money.ts' }
  ],
  changes: { date: '2026-07-08', entries: [
    { path: 'src/orders/pricing.ts', name: 'applyMemberDiscount', kind: 'added' },
    { path: 'src/orders/pricing.ts', name: 'calcPrice', kind: 'changed' }
  ]}
};

var DEMO_GRAPH_EN = {
  meta: { project: 'Demo: Tiny Shop', stage: 2, lang: 'en' },
  files: DEMO_GRAPH.files.map(function (f) { return { path: f.path, module: f.module, functions: f.functions.map(function (fn) { return { name: fn.name, level: fn.level, signature: fn.signature, refs: fn.refs, minor: fn.minor, desc: ({
    placeOrder: 'Main checkout flow: stock, price, order, notify',
    checkStock: 'Check whether stock is enough',
    calcPrice: 'Compute the cart total',
    applyCoupon: 'Adjust price by coupon code',
    applyMemberDiscount: 'Give members a 5% discount',
    createOrder: 'Save the order to the database',
    sendOrderEmail: 'Email the buyer a confirmation',
    formatMoney: 'Turn a number into $x.xx text',
    retryFetch: 'Network request that retries on failure',
    parseDate: 'Turn date text into a Date object',
    validateSku: 'Check the product code format',
    trimSku: 'Trim spaces around a product code'
  })[fn.name] || fn.desc }; }) }; }),
  edges: DEMO_GRAPH.edges,
  changes: DEMO_GRAPH.changes
};

// 当前界面语言对应的演示项目
function demoGraph() { return normalizeGraph(getLang() === 'en' ? DEMO_GRAPH_EN : DEMO_GRAPH); }

// 取路径最后一段作为卡片标题（专业名给 AI，标题给人扫一眼）
function baseName(path) {
  var parts = String(path).split('/');
  return parts[parts.length - 1] || path;
}

// 文件层级 = 其函数的最高层级；全部未标注时按 L3 处理
function fileLevel(functions) {
  var best = 0;
  for (var i = 0; i < functions.length; i++) {
    var r = LEVEL_RANK[functions[i].level] || 0;
    if (r > best) best = r;
  }
  return best ? 'L' + best : 'L3';
}

// 把 graph.json / 解析结果统一成 viewer 内部结构（容错：缺列按 '-' 处理）
function normalizeGraph(raw) {
  var files = (raw.files || []).map(function (f) {
    var fns = (f.functions || []).map(function (fn) {
      return {
        name: fn.name || '-',
        level: LEVEL_RANK[fn.level] ? fn.level : '-',
        signature: fn.signature && fn.signature !== '-' ? fn.signature : '',
        refs: fn.refs === 0 || fn.refs ? fn.refs : '-',
        desc: fn.desc && fn.desc !== '-' ? fn.desc : '',
        minor: !!fn.minor
      };
    });
    var lv = fileLevel(fns);
    return {
      path: f.path, module: f.module || moduleOf(f.path), name: baseName(f.path),
      level: lv, isTool: LEVEL_RANK[lv] <= 2, functions: fns,
      minorOnly: fns.length > 0 && fns.every(function (fn) { return fn.minor; })
    };
  });
  var known = {};
  files.forEach(function (f) { known[f.path] = true; });
  var edges = (raw.edges || []).filter(function (e) { return known[e.from] && known[e.to] && e.from !== e.to; });
  var changes = raw.changes && raw.changes.entries && raw.changes.entries.length ? raw.changes : null;
  if (changes) markChanges(files, changes.entries);
  return { meta: raw.meta || {}, files: files, edges: edges, changes: changes };
}

// 把"上次任务动过"的标记落到文件和函数上，画布据此高亮
function markChanges(files, entries) {
  files.forEach(function (f) {
    f.functions.forEach(function (fn) {
      entries.forEach(function (e) {
        if (e.path === f.path && e.name === fn.name && e.kind !== 'removed') {
          fn.changedKind = e.kind;
          f.changed = true;
        }
      });
    });
  });
}

// 用倒数第二层目录当模块名；单层路径就用文件名
function moduleOf(path) {
  var parts = String(path).split('/');
  return parts.length > 1 ? parts[parts.length - 2] : baseName(path);
}

// 解析 FUNCTIONS.md（阶段一项目没有 graph，直接喂注册表也能出图，只是没有连线）
function parseFunctionsMd(text) {
  var lines = String(text).split('\n');
  var meta = { stage: 1 };
  var head = /stage:(\d+)/.exec(lines[0] || '');
  if (head) meta.stage = parseInt(head[1], 10);
  var langFlag = /canvas:(\w+)/.exec(lines[0] || '');
  if (langFlag && langFlag[1] !== 'off' && langFlag[1] !== 'on') meta.lang = langFlag[1];
  var byPath = {};
  var order = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.charAt(0) !== '|') continue;
    var c = line.split('|').map(function (s) { return s.trim(); });
    if (c.length < 7 || c[1] === 'name') continue;
    if (c[1] === 'module' || (!LEVEL_RANK[c[2]] && c[2] !== '-')) {
      throw new Error('Stage 3? use docs/registry/graph.json');
    }
    var path = c[4];
    if (!byPath[path]) { byPath[path] = []; order.push(path); }
    byPath[path].push({ name: c[1], level: c[2], signature: c[3], refs: c[5], desc: c[6] });
  }
  if (!order.length) throw new Error('no rows found (FUNCTIONS.md / graph.json / graph.js)');
  var files = order.map(function (p) { return { path: p, functions: byPath[p] }; });
  return normalizeGraph({ meta: meta, files: files, edges: [] });
}
