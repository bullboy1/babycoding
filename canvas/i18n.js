// i18n.js — 画布界面的双语字典：给人看的语言可选，FUNCTIONS.md 永远保持专业给 AI 看

var I18N = {
  zh: {
    open: '打开项目数据', demo: '演示项目', fit: '看全貌', refresh: '刷新数据', relayout: '重新排版',
    searchPh: '搜索功能、文件…', minorShow: '显示小函数', minorHide: '隐藏小函数',
    legendL4: '入口 / 流程', legendL3: '业务功能', legendTools: 'tools 通用零件',
    hint: '空白处拖拽 = 框选 · 拖动卡片 = 挪位置 · 滚轮 = 平移 · Ctrl/⌘+滚轮 = 缩放',
    L4: '入口 / 流程', L3: '业务功能', L2: '通用零件', L1: '基础零件', 'L-': '待标注',
    toolsBox: 'tools · 可复用零件', noDesc: '（还没写白话说明）', refs: '被用 {0} 处', minorTag: '小函数',
    changedBadge: '上次改动', dotAdded: '上次任务新增', dotChanged: '上次任务改动',
    chip: '上次 AI 任务动了 {0} 处（{1}）点我高亮',
    selCount: '已选 {0} 个功能块', instrPh: '用大白话说想怎么改，例如：给会员价打个 95 折', genBtn: '生成并复制 AI 指令',
    metaLine: '{0} · {1} 个功能块 · {2} 个功能', metaMinorHidden: '（已折叠 {0} 个小函数）', metaMinorShown: '（含 {0} 个小函数）',
    metaNoEdges: ' · 无连线数据（阶段一）', moreRows: '还有 {0} 个功能，点卡片查看全部',
    emptyTip: '把 graph.js / graph.json / FUNCTIONS.md 拖进来，就能看到你的项目地图',
    loaded: '已载入 {0}', autoLoaded: '已自动载入本项目数据', badFile: '没读懂这个文件：{0}',
    copied: '指令已复制，去粘贴给 Claude Code 吧', copyFail: '复制失败，指令已打印到控制台（F12 查看）',
    detailNote: '这些是给 AI 查表用的专业信息，来自 FUNCTIONS.md，你不需要看懂。', unnamed: '未命名项目',
    pHeader: '【babycode 画布指令】先读项目根目录 CLAUDE.md（FRP 协议）并遵守：动手前查 FUNCTIONS.md，能复用不新写；最小 diff；结束前更新注册表。',
    pScope: '本次改造范围（用户在画布上框选的文件）：',
    pDeps: '选区直接依赖的文件（优先复用，不在改造范围）：',
    pNeed: '用户需求：', pNoNeed: '（用户未填写，先向用户确认需求再动手）',
    pRule: '约束：不改动范围外文件；tools（L1/L2）里已有的能力必须复用，不许重写。'
  },
  en: {
    open: 'Open project data', demo: 'Demo project', fit: 'Fit view', refresh: 'Reload data', relayout: 'Auto-arrange',
    searchPh: 'Search functions, files…', minorShow: 'Show small functions', minorHide: 'Hide small functions',
    legendL4: 'Entry / flow', legendL3: 'Business logic', legendTools: 'tools: reusable parts',
    hint: 'Drag empty space = select · Drag card = move · Wheel = pan · Ctrl/Cmd+wheel = zoom',
    L4: 'Entry / flow', L3: 'Business logic', L2: 'Shared part', L1: 'Basic part', 'L-': 'Unlabeled',
    toolsBox: 'tools · reusable parts', noDesc: '(no plain-language note yet)', refs: 'used in {0} places', minorTag: 'small fn',
    changedBadge: 'Just changed', dotAdded: 'Added by last task', dotChanged: 'Changed by last task',
    chip: 'Last AI task touched {0} spots ({1}) — click to highlight',
    selCount: '{0} blocks selected', instrPh: 'Say what you want in plain words, e.g. give members a 5% discount', genBtn: 'Build and copy AI instruction',
    metaLine: '{0} · {1} blocks · {2} functions', metaMinorHidden: ' ({0} small functions folded)', metaMinorShown: ' (incl. {0} small functions)',
    metaNoEdges: ' · no dependency data (Stage 1)', moreRows: '{0} more functions — click the card to see all',
    emptyTip: 'Drop graph.js / graph.json / FUNCTIONS.md here to see your project map',
    loaded: 'Loaded {0}', autoLoaded: 'Project data loaded automatically', badFile: 'Could not read this file: {0}',
    copied: 'Instruction copied — paste it into Claude Code', copyFail: 'Copy failed — the instruction was printed to the console (F12)',
    detailNote: 'Professional details for the AI, from FUNCTIONS.md — you do not need to read them.', unnamed: 'Untitled project',
    pHeader: '[babycode canvas instruction] Read CLAUDE.md (FRP protocol) in the repo root first and obey it: check FUNCTIONS.md before writing, reuse instead of rewriting; minimal diff; update the registry before finishing.',
    pScope: 'Scope of this change (files the user framed on the canvas):',
    pDeps: 'Direct dependencies of the selection (reuse first, out of scope):',
    pNeed: 'User request:', pNoNeed: '(left blank — confirm the request with the user before coding)',
    pRule: 'Constraints: touch nothing outside the scope; capabilities that already exist in tools (L1/L2) MUST be reused, not rewritten.'
  }
};
var CURRENT_LANG = null;

// 取当前语言的一条文案，{0}{1} 会被参数替换
function t(key) {
  var pack = I18N[getLang()] || I18N.zh;
  var s = pack[key] != null ? pack[key] : (I18N.zh[key] != null ? I18N.zh[key] : key);
  for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
  return s;
}

// 语言优先级：用户手选（localStorage）> 项目数据声明 > 浏览器语言
function pickLang(graphLang) {
  var saved = null;
  try { saved = localStorage.getItem('babycode-lang'); } catch (e) { saved = null; }
  if (saved && I18N[saved]) return saved;
  if (graphLang && I18N[graphLang]) return graphLang;
  var nav = (typeof navigator !== 'undefined' && navigator.language) || 'zh';
  return nav.toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
}

// 启动时按优先级定语言，但不写入 localStorage（只有用户手选才记住）
function initLang(graphLang) { CURRENT_LANG = pickLang(graphLang); }

function getLang() { return CURRENT_LANG || (CURRENT_LANG = pickLang(null)); }

// 用户手动切换：立即生效并记住
function setLang(lang) {
  CURRENT_LANG = I18N[lang] ? lang : 'zh';
  try { localStorage.setItem('babycode-lang', CURRENT_LANG); } catch (e) { return; }
}
