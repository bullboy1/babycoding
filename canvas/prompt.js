// prompt.js — 指挥台：把画布选区编译成一条带精确上下文的 AI 指令（上下文编译器）

// 选区 → 指令文本：范围、专业签名、可复用零件、FRP 约束一次说清
function buildPrompt(graph, selectedPaths, instruction) {
  var sel = graph.files.filter(function (f) { return selectedPaths.indexOf(f.path) >= 0; });
  var lines = [];
  lines.push('【babycode 画布指令】先读项目根目录 CLAUDE.md（FRP 协议）并遵守：动手前查 FUNCTIONS.md，能复用不新写；最小 diff；结束前更新注册表。');
  lines.push('');
  lines.push('本次改造范围（用户在画布上框选的文件）：');
  sel.forEach(function (f) {
    lines.push('- ' + f.path);
    f.functions.forEach(function (fn) {
      var d = fn.desc ? ' — ' + fn.desc : '';
      lines.push('  - ' + fn.name + ' ' + (fn.level !== '-' ? fn.level : '') + ' ' + fn.signature + d);
    });
  });
  var deps = collectDeps(graph, selectedPaths);
  if (deps.length) {
    lines.push('');
    lines.push('选区直接依赖的文件（优先复用，不在改造范围）：');
    deps.forEach(function (f) {
      var names = f.functions.map(function (fn) { return fn.name; }).join(', ');
      lines.push('- ' + f.path + '（' + names + '）');
    });
  }
  lines.push('');
  lines.push('用户需求：');
  lines.push(instruction || '（用户未填写，先向用户确认需求再动手）');
  lines.push('');
  lines.push('约束：不改动范围外文件；tools（L1/L2）里已有的能力必须复用，不许重写。');
  return lines.join('\n');
}

// 找出选区向外引用的文件，作为"可复用"上下文一并交给 AI
function collectDeps(graph, selectedPaths) {
  var out = [], seen = {};
  graph.edges.forEach(function (e) {
    if (selectedPaths.indexOf(e.from) >= 0 && selectedPaths.indexOf(e.to) < 0 && !seen[e.to]) {
      seen[e.to] = true;
      var f = graph.files.filter(function (x) { return x.path === e.to; })[0];
      if (f) out.push(f);
    }
  });
  return out;
}

// 复制到剪贴板；老浏览器与 file:// 环境退回隐藏 textarea 方案
function copyText(text, done) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { copyFallback(text, done); });
  } else {
    copyFallback(text, done);
  }
}

function copyFallback(text, done) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  done(ok);
}
