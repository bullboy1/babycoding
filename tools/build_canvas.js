#!/usr/bin/env node
// tools/build_canvas — 把 canvas/ 打包成单文件 dist/babycode-canvas.html（固定制品，逐字分发，保证所有项目 UI 一致）
// graph.js 保持外链：部署后画布自动读取旁边的项目数据，双击即见图
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..');
var SRC = path.join(ROOT, 'canvas');
var OUT = path.join(ROOT, 'dist', 'babycode-canvas.html');
var DEPLOY = path.join(ROOT, 'docs', 'registry', 'canvas.html');
var VERSION = '2.3.0';

function readSrc(f) { return fs.readFileSync(path.join(SRC, f), 'utf8'); }

// 内联 CSS 与应用 JS（graph.js 除外），注入版本戳和"请勿修改"声明
function inlineAssets(html) {
  html = html.replace('<link rel="stylesheet" href="style.css">',
    function () { return '<style>\n' + readSrc('style.css') + '</style>'; });
  html = html.replace(/(\s*<script src="[^"]+"><\/script>)+/, function (m) {
    var srcs = m.match(/src="([^"]+)"/g).map(function (s) { return /"([^"]+)"/.exec(s)[1]; });
    var kept = srcs.filter(function (s) { return s === 'graph.js'; })
      .map(function (s) { return '<script src="' + s + '"></script>'; }).join('\n');
    var js = srcs.filter(function (s) { return s !== 'graph.js'; }).map(readSrc).join('\n');
    return '\n' + kept + '\n<script>\n' + js + '\n</script>';
  });
  return html.replace('<!DOCTYPE html>',
    '<!DOCTYPE html>\n<!-- babycode-canvas v' + VERSION + ' | fixed artifact: do not edit or let an AI regenerate it; upgrade = re-download -->');
}

// 同时产出发行制品和本仓库的部署副本（吃自己狗粮：双击 docs/registry/canvas.html 即见本仓库地图）
function buildDist() {
  var html = inlineAssets(readSrc('index.html'));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  fs.mkdirSync(path.dirname(DEPLOY), { recursive: true });
  fs.writeFileSync(DEPLOY, html);
  console.log('built dist/babycode-canvas.html + docs/registry/canvas.html v' + VERSION + ' (' + html.length + ' bytes)');
}

buildDist();
