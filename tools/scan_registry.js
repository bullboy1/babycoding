#!/usr/bin/env node
// tools/scan_registry — FRP Stage 2 扫描器（node + 正则；契约见 CLAUDE.md §7）：node tools/scan_registry.js [--check]
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..');
var DIRS = ['canvas', 'tools'];
var REGISTRY = path.join(ROOT, 'FUNCTIONS.md');
var GRAPH = path.join(ROOT, 'docs', 'registry', 'graph.json');

function listSourceFiles() {
  var out = [];
  DIRS.forEach(function (d) {
    var dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(function (f) {
      if (f.endsWith('.js')) out.push({ rel: d + '/' + f, text: fs.readFileSync(path.join(dir, f), 'utf8') });
    });
  });
  return out;
}

// 顶层 function 声明；花括号配平估算函数体行数（正则法，协议允许的兜底）
function parseFunctions(text) {
  var fns = [], lines = text.split('\n'), re = /^(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/;
  for (var i = 0; i < lines.length; i++) {
    var m = re.exec(lines[i]);
    if (!m) continue;
    var depth = 0, opened = false, end = i;
    for (var j = i; j < lines.length; j++) {
      for (var k = 0; k < lines[j].length; k++) {
        if (lines[j][k] === '{') { depth++; opened = true; }
        else if (lines[j][k] === '}') depth--;
      }
      end = j;
      if (opened && depth <= 0) break;
    }
    fns.push({ name: m[1], sig: '(' + m[2].replace(/\s+/g, '') + ')', bodyLines: end - i + 1 });
  }
  return fns;
}

function countRefs(name, files) {
  var n = 0, re = new RegExp('\\b' + name + '\\b', 'g');
  files.forEach(function (f) { n += (f.text.match(re) || []).length; });
  return Math.max(0, n - 1); // 去掉定义本身
}

function loadManual() {
  var map = {};
  if (!fs.existsSync(REGISTRY)) return map;
  fs.readFileSync(REGISTRY, 'utf8').split('\n').forEach(function (line) {
    var c = line.split('|');
    if (c.length >= 7 && c[1] !== 'name') map[c[1] + '@' + c[4]] = { L: c[2], desc: c[6] };
  });
  return map;
}

function buildRows(files) {
  var rows = [], manual = loadManual();
  files.forEach(function (f) {
    f.fns.forEach(function (fn) {
      var refs = countRefs(fn.name, files);
      if (fn.bodyLines < 10 && refs <= 1) return; // §4：<10 行且单调用点的私有助手不登记
      var m = manual[fn.name + '@' + f.rel] || { L: '-', desc: '-' };
      rows.push({ name: fn.name, L: m.L, sig: fn.sig, path: f.rel, refs: refs, desc: m.desc });
    });
  });
  return rows;
}

function renderRegistry(rows, today, canvasFlag) {
  var stage = rows.length < 30 ? 1 : rows.length <= 200 ? 2 : 3;
  var out = '# FUNCTIONS.md | stage:' + stage + ' | count:' + rows.length + ' | updated:' + today + (canvasFlag ? ' | canvas:' + canvasFlag : '') + '\n|name|L|signature|path|refs|desc|\n';
  rows.forEach(function (r) { out += '|' + r.name + '|' + r.L + '|' + r.sig + '|' + r.path + '|' + r.refs + '|' + r.desc + '|\n'; });
  return out;
}

// 文件级依赖：A 引用了 B 定义的函数 → A→B（无 import 的浏览器脚本用引用近似）
function buildGraph(files, rows, changes) {
  var owner = {}, edges = [], seen = {}, byPath = {};
  files.forEach(function (f) { f.fns.forEach(function (fn) { owner[fn.name] = owner[fn.name] || f.rel; }); });
  files.forEach(function (f) {
    Object.keys(owner).forEach(function (name) {
      if (owner[name] === f.rel || seen[f.rel + '>' + owner[name]]) return;
      if (new RegExp('\\b' + name + '\\b').test(f.text)) {
        seen[f.rel + '>' + owner[name]] = 1;
        edges.push({ from: f.rel, to: owner[name] });
      }
    });
  });
  rows.forEach(function (r) {
    (byPath[r.path] = byPath[r.path] || []).push({ name: r.name, level: r.L, signature: r.sig, refs: r.refs, desc: r.desc });
  });
  return {
    meta: { project: 'babycode', stage: 2 },
    files: Object.keys(byPath).map(function (p) { return { path: p, module: p.split('/')[0], functions: byPath[p] }; }),
    edges: edges.filter(function (e) { return byPath[e.from] && byPath[e.to]; }),
    changes: changes
  };
}

function diffRows(oldText, newText) {
  var key = function (line) { var c = line.split('|'); return c.length >= 7 && c[1] !== 'name' ? c[1] + '@' + c[4] : null; };
  var index = function (text) {
    var m = {};
    text.split('\n').forEach(function (l) { var k = key(l); if (k) m[k] = l; });
    return m;
  };
  var a = index(oldText), b = index(newText), out = [];
  Object.keys(b).forEach(function (k) {
    if (!a[k]) out.push('+ ' + b[k]);
    else if (a[k] !== b[k]) out.push('~ ' + b[k]);
  });
  Object.keys(a).forEach(function (k) { if (!b[k]) out.push('- ' + a[k]); });
  return out;
}

// 本次扫描的增删改写进 graph.json，画布据此高亮"AI 动了哪里"；无变化时沿用上次
function lastChanges(diff, today) {
  if (diff.length) {
    return { date: today, entries: diff.map(function (l) {
      var c = l.split('|');
      return { kind: l[0] === '+' ? 'added' : l[0] === '~' ? 'changed' : 'removed', name: c[1], path: c[4] };
    }) };
  }
  try { return JSON.parse(fs.readFileSync(GRAPH, 'utf8')).changes || null; } catch (e) { return null; }
}

function main() {
  var files = listSourceFiles();
  files.forEach(function (f) { f.fns = parseFunctions(f.text); });
  var rows = buildRows(files);
  var oldText = fs.existsSync(REGISTRY) ? fs.readFileSync(REGISTRY, 'utf8') : '';
  var oldDate = (/updated:(\S+)/.exec(oldText) || [])[1];
  var canvasFlag = (/canvas:(\w+)/.exec(oldText) || [])[1];
  var diff = diffRows(oldText, renderRegistry(rows, 'x', canvasFlag));
  if (process.argv.indexOf('--check') >= 0) {
    if (diff.length) { console.log('REGISTRY DRIFT:\n' + diff.join('\n')); process.exit(1); }
    return console.log('registry in sync (' + rows.length + ' functions)');
  }
  var today = diff.length ? new Date().toISOString().slice(0, 10) : (oldDate || new Date().toISOString().slice(0, 10));
  var graph = buildGraph(files, rows, lastChanges(diff, today));
  fs.mkdirSync(path.dirname(GRAPH), { recursive: true });
  fs.writeFileSync(REGISTRY, renderRegistry(rows, today, canvasFlag));
  fs.writeFileSync(GRAPH, JSON.stringify(graph, null, 1) + '\n');
  console.log(diff.length ? diff.join('\n') : 'no changes');
  console.log('scanned ' + files.length + ' files, registered ' + rows.length + ' functions');
}

main();
