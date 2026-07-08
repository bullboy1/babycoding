#!/usr/bin/env node
// tools/build_canvas — 把 canvas/ 打包成单文件 dist/babycode-canvas.html（固定制品，逐字分发，保证所有项目 UI 一致）
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..');
var SRC = path.join(ROOT, 'canvas');
var OUT = path.join(ROOT, 'dist', 'babycode-canvas.html');
var VERSION = '2.1.0';

function readSrc(f) { return fs.readFileSync(path.join(SRC, f), 'utf8'); }

// 内联 CSS 与全部 JS，并注入版本戳和"请勿修改"声明
function inlineAssets(html) {
  html = html.replace('<link rel="stylesheet" href="style.css">',
    function () { return '<style>\n' + readSrc('style.css') + '</style>'; });
  html = html.replace(/(\s*<script src="[^"]+"><\/script>)+/, function (m) {
    var js = m.match(/src="([^"]+)"/g).map(function (s) {
      return readSrc(/"([^"]+)"/.exec(s)[1]);
    }).join('\n');
    return '\n<script>\n' + js + '\n</script>';
  });
  return html.replace('<!DOCTYPE html>',
    '<!DOCTYPE html>\n<!-- babycode-canvas v' + VERSION + ' | 固定制品：请勿手改或让 AI 重新生成；升级 = 重新下载 -->');
}

function buildDist() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, inlineAssets(readSrc('index.html')));
  console.log('built dist/babycode-canvas.html v' + VERSION + ' (' + fs.statSync(OUT).size + ' bytes)');
}

buildDist();
