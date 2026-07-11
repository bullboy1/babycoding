window.BABYCODE_GRAPH = {
 "meta": {
  "project": "babycoding",
  "stage": 2,
  "lang": "zh"
 },
 "files": [
  {
   "path": "canvas/app.js",
   "module": "canvas",
   "functions": [
    {
     "name": "applyView",
     "level": "L3",
     "signature": "()",
     "refs": 3,
     "desc": "把平移缩放应用到画布"
    },
    {
     "name": "screenToWorld",
     "level": "L2",
     "signature": "(cx,cy)",
     "refs": 2,
     "desc": "屏幕坐标换算成画布坐标"
    },
    {
     "name": "refresh",
     "level": "L3",
     "signature": "()",
     "refs": 9,
     "desc": "重画卡片、连线和底部操作条"
    },
    {
     "name": "setGraph",
     "level": "L3",
     "signature": "(graph)",
     "refs": 5,
     "desc": "装入一张新项目图并重置视图"
    },
    {
     "name": "fitView",
     "level": "L3",
     "signature": "()",
     "refs": 4,
     "desc": "缩放平移到能看到整张图"
    },
    {
     "name": "zoomAt",
     "level": "L3",
     "signature": "(cx,cy,factor)",
     "refs": 3,
     "desc": "以某个点为中心缩放画布"
    },
    {
     "name": "onWheel",
     "level": "-",
     "signature": "(e)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "onDown",
     "level": "L4",
     "signature": "(e)",
     "refs": 1,
     "desc": "按下鼠标：开始拖卡片或框选"
    },
    {
     "name": "onMove",
     "level": "L4",
     "signature": "(e)",
     "refs": 1,
     "desc": "移动鼠标：拖动卡片或画选框"
    },
    {
     "name": "onUp",
     "level": "L4",
     "signature": "(e)",
     "refs": 1,
     "desc": "松开鼠标：确定选区或落下卡片"
    },
    {
     "name": "applySelectClick",
     "level": "-",
     "signature": "(path,shift)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "selectInRect",
     "level": "L3",
     "signature": "(x1,y1,x2,y2,additive)",
     "refs": 1,
     "desc": "框选矩形内的卡片加入选区"
    },
    {
     "name": "afterSelectionChange",
     "level": "L3",
     "signature": "()",
     "refs": 4,
     "desc": "选区变化后刷新界面和详情"
    },
    {
     "name": "selectChanged",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "loadText",
     "level": "L3",
     "signature": "(name,text)",
     "refs": 1,
     "desc": "识别并载入 graph.json 或 FUNCTIONS.md"
    },
    {
     "name": "readFile",
     "level": "L3",
     "signature": "(file)",
     "refs": 2,
     "desc": "读取用户拖入或选择的文件"
    },
    {
     "name": "onPrompt",
     "level": "L4",
     "signature": "()",
     "refs": 2,
     "desc": "把选区和需求编译成指令并复制"
    },
    {
     "name": "hoverEdges",
     "level": "L3",
     "signature": "(e,on)",
     "refs": 2,
     "desc": "悬停卡片时点亮它的所有连线"
    },
    {
     "name": "initApp",
     "level": "L4",
     "signature": "()",
     "refs": 1,
     "desc": "入口：绑定所有按钮和鼠标事件"
    }
   ]
  },
  {
   "path": "canvas/data.js",
   "module": "canvas",
   "functions": [
    {
     "name": "demoGraph",
     "level": "L3",
     "signature": "()",
     "refs": 3,
     "desc": "按当前语言取演示项目"
    },
    {
     "name": "baseName",
     "level": "L1",
     "signature": "(path)",
     "refs": 2,
     "desc": "取路径最后一段当卡片标题"
    },
    {
     "name": "fileLevel",
     "level": "-",
     "signature": "(functions)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "normalizeGraph",
     "level": "L3",
     "signature": "(raw)",
     "refs": 4,
     "desc": "把原始数据统一成画布内部结构"
    },
    {
     "name": "markChanges",
     "level": "L3",
     "signature": "(files,entries)",
     "refs": 1,
     "desc": "把上次改动标记落到文件和函数上"
    },
    {
     "name": "moduleOf",
     "level": "-",
     "signature": "(path)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "parseFunctionsMd",
     "level": "L3",
     "signature": "(text)",
     "refs": 1,
     "desc": "把 FUNCTIONS.md 注册表解析成图"
    }
   ]
  },
  {
   "path": "canvas/i18n.js",
   "module": "canvas",
   "functions": [
    {
     "name": "t",
     "level": "L1",
     "signature": "(key)",
     "refs": 40,
     "desc": "取当前语言文案，支持参数替换"
    },
    {
     "name": "pickLang",
     "level": "L1",
     "signature": "(graphLang)",
     "refs": 2,
     "desc": "按优先级决定界面语言"
    },
    {
     "name": "initLang",
     "level": "-",
     "signature": "(graphLang)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "getLang",
     "level": "L1",
     "signature": "()",
     "refs": 3,
     "desc": "返回当前界面语言"
    },
    {
     "name": "setLang",
     "level": "-",
     "signature": "(lang)",
     "refs": 1,
     "desc": "-",
     "minor": true
    }
   ]
  },
  {
   "path": "canvas/layout.js",
   "module": "canvas",
   "functions": [
    {
     "name": "visibleFns",
     "level": "L2",
     "signature": "(file,showMinor)",
     "refs": 2,
     "desc": "按细节开关过滤可见函数"
    },
    {
     "name": "visibleFiles",
     "level": "L2",
     "signature": "(graph,showMinor)",
     "refs": 2,
     "desc": "按细节开关过滤可见文件"
    },
    {
     "name": "measureCard",
     "level": "-",
     "signature": "(file,showMinor,scale)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "placeRows",
     "level": "L3",
     "signature": "(group,cap,w,y,positions,sizes,state)",
     "refs": 2,
     "desc": "把一批卡片排成若干行"
    },
    {
     "name": "computeLayout",
     "level": "L3",
     "signature": "(graph,showMinor,scale)",
     "refs": 3,
     "desc": "按层级自动排布卡片和 tools 框"
    },
    {
     "name": "layoutBbox",
     "level": "L2",
     "signature": "(positions,sizes,toolsBox)",
     "refs": 3,
     "desc": "算所有卡片的外接矩形"
    },
    {
     "name": "edgePath",
     "level": "L2",
     "signature": "(fromPos,fromSize,toPos,toSize)",
     "refs": 1,
     "desc": "算两张卡片之间连线的曲线"
    },
    {
     "name": "computeFit",
     "level": "L2",
     "signature": "(bbox,viewW,viewH)",
     "refs": 1,
     "desc": "算看全貌所需的缩放和位移"
    }
   ]
  },
  {
   "path": "canvas/prompt.js",
   "module": "canvas",
   "functions": [
    {
     "name": "buildPrompt",
     "level": "L3",
     "signature": "(graph,selectedPaths,instruction)",
     "refs": 1,
     "desc": "选区加需求编译成给 AI 的完整指令"
    },
    {
     "name": "collectDeps",
     "level": "L3",
     "signature": "(graph,selectedPaths)",
     "refs": 1,
     "desc": "找出选区依赖的可复用文件"
    },
    {
     "name": "copyText",
     "level": "-",
     "signature": "(text,done)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "copyFallback",
     "level": "L1",
     "signature": "(text,done)",
     "refs": 2,
     "desc": "老浏览器的剪贴板复制兜底"
    }
   ]
  },
  {
   "path": "canvas/render.js",
   "module": "canvas",
   "functions": [
    {
     "name": "esc",
     "level": "L1",
     "signature": "(s)",
     "refs": 16,
     "desc": "转义 HTML 特殊字符防注入"
    },
    {
     "name": "modHue",
     "level": "-",
     "signature": "(module)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "focusSet",
     "level": "L3",
     "signature": "(graph,sel)",
     "refs": 1,
     "desc": "算出选区的邻居圈用于聚焦淡出"
    },
    {
     "name": "cardHtml",
     "level": "L3",
     "signature": "(file,pos,state)",
     "refs": 1,
     "desc": "生成单张功能卡片的 HTML"
    },
    {
     "name": "labelsHtml",
     "level": "L3",
     "signature": "(layout)",
     "refs": 1,
     "desc": "生成 tools 框、层带、独立带标签"
    },
    {
     "name": "edgesSvgHtml",
     "level": "L3",
     "signature": "(graph,layout,selection)",
     "refs": 2,
     "desc": "生成全部连线，选区相关标红"
    },
    {
     "name": "renderWorld",
     "level": "L3",
     "signature": "(state)",
     "refs": 1,
     "desc": "全量重画整个画布世界"
    },
    {
     "name": "metaText",
     "level": "-",
     "signature": "(state)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "renderChangesChip",
     "level": "-",
     "signature": "(graph)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "renderDetail",
     "level": "L3",
     "signature": "(file)",
     "refs": 6,
     "desc": "显示单个文件的专业详情面板"
    },
    {
     "name": "renderActionBar",
     "level": "-",
     "signature": "(state)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "showToast",
     "level": "L2",
     "signature": "(msg)",
     "refs": 6,
     "desc": "弹出一条短暂的提示消息"
    }
   ]
  },
  {
   "path": "canvas/ui.js",
   "module": "canvas",
   "functions": [
    {
     "name": "initUi",
     "level": "L4",
     "signature": "()",
     "refs": 1,
     "desc": "入口：绑定语言、搜索、开关等控件"
    },
    {
     "name": "setCardScale",
     "level": "L3",
     "signature": "(delta)",
     "refs": 2,
     "desc": "切换卡片缩放档位并记住"
    },
    {
     "name": "relayout",
     "level": "L3",
     "signature": "()",
     "refs": 5,
     "desc": "重算布局并套用记住的位置"
    },
    {
     "name": "updateChrome",
     "level": "L3",
     "signature": "()",
     "refs": 3,
     "desc": "把界面文案刷成当前语言"
    },
    {
     "name": "onLangChanged",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "toggleMinor",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "posKey",
     "level": "L1",
     "signature": "()",
     "refs": 3,
     "desc": "当前项目的位置存储键名"
    },
    {
     "name": "savePositions",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "applySavedPositions",
     "level": "L3",
     "signature": "()",
     "refs": 2,
     "desc": "套用用户记住的卡片位置"
    },
    {
     "name": "resetLayout",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "runSearch",
     "level": "L3",
     "signature": "()",
     "refs": 2,
     "desc": "搜索过滤：不匹配的卡片压暗"
    },
    {
     "name": "fileByPath",
     "level": "L1",
     "signature": "(p)",
     "refs": 2,
     "desc": "按路径找到文件对象"
    }
   ]
  },
  {
   "path": "tools/build_canvas.js",
   "module": "tools",
   "functions": [
    {
     "name": "readSrc",
     "level": "L1",
     "signature": "(f)",
     "refs": 3,
     "desc": "读取 canvas 源文件文本"
    },
    {
     "name": "inlineAssets",
     "level": "L3",
     "signature": "(html)",
     "refs": 1,
     "desc": "内联 CSS 和 JS，注入版本戳"
    },
    {
     "name": "buildDist",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    }
   ]
  },
  {
   "path": "tools/scan_registry.js",
   "module": "tools",
   "functions": [
    {
     "name": "listSourceFiles",
     "level": "L1",
     "signature": "()",
     "refs": 1,
     "desc": "列出要扫描的源码文件"
    },
    {
     "name": "parseFunctions",
     "level": "L3",
     "signature": "(text)",
     "refs": 1,
     "desc": "正则找出文件里的顶层函数"
    },
    {
     "name": "countRefs",
     "level": "-",
     "signature": "(name,files)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "loadManual",
     "level": "-",
     "signature": "()",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "buildRows",
     "level": "L3",
     "signature": "(files)",
     "refs": 1,
     "desc": "汇总函数事实，保留人工标注"
    },
    {
     "name": "renderRegistry",
     "level": "L3",
     "signature": "(rows,today,flag)",
     "refs": 2,
     "desc": "把行渲染成 FUNCTIONS.md 文本"
    },
    {
     "name": "buildGraph",
     "level": "L3",
     "signature": "(files,rows,changes,lang)",
     "refs": 1,
     "desc": "生成画布用的 graph.json 结构"
    },
    {
     "name": "diffRows",
     "level": "L3",
     "signature": "(oldText,newText)",
     "refs": 1,
     "desc": "对比新旧注册表，打印增删改"
    },
    {
     "name": "lastChanges",
     "level": "-",
     "signature": "(diff,today)",
     "refs": 1,
     "desc": "-",
     "minor": true
    },
    {
     "name": "main",
     "level": "L4",
     "signature": "()",
     "refs": 3,
     "desc": "入口：扫描，写注册表和图，或校验"
    }
   ]
  }
 ],
 "edges": [
  {
   "from": "canvas/app.js",
   "to": "canvas/data.js"
  },
  {
   "from": "canvas/app.js",
   "to": "canvas/i18n.js"
  },
  {
   "from": "canvas/app.js",
   "to": "canvas/layout.js"
  },
  {
   "from": "canvas/app.js",
   "to": "canvas/prompt.js"
  },
  {
   "from": "canvas/app.js",
   "to": "canvas/render.js"
  },
  {
   "from": "canvas/app.js",
   "to": "canvas/ui.js"
  },
  {
   "from": "canvas/data.js",
   "to": "canvas/i18n.js"
  },
  {
   "from": "canvas/i18n.js",
   "to": "canvas/app.js"
  },
  {
   "from": "canvas/i18n.js",
   "to": "canvas/ui.js"
  },
  {
   "from": "canvas/layout.js",
   "to": "tools/scan_registry.js"
  },
  {
   "from": "canvas/prompt.js",
   "to": "canvas/i18n.js"
  },
  {
   "from": "canvas/render.js",
   "to": "canvas/i18n.js"
  },
  {
   "from": "canvas/render.js",
   "to": "canvas/layout.js"
  },
  {
   "from": "canvas/ui.js",
   "to": "canvas/app.js"
  },
  {
   "from": "canvas/ui.js",
   "to": "canvas/data.js"
  },
  {
   "from": "canvas/ui.js",
   "to": "canvas/i18n.js"
  },
  {
   "from": "canvas/ui.js",
   "to": "canvas/layout.js"
  },
  {
   "from": "canvas/ui.js",
   "to": "canvas/render.js"
  }
 ],
 "changes": {
  "date": "2026-07-10",
  "entries": [
   {
    "kind": "added",
    "name": "hoverEdges",
    "path": "canvas/app.js"
   },
   {
    "kind": "changed",
    "name": "t",
    "path": "canvas/i18n.js"
   },
   {
    "kind": "added",
    "name": "placeRows",
    "path": "canvas/layout.js"
   },
   {
    "kind": "changed",
    "name": "computeLayout",
    "path": "canvas/layout.js"
   },
   {
    "kind": "changed",
    "name": "esc",
    "path": "canvas/render.js"
   },
   {
    "kind": "added",
    "name": "focusSet",
    "path": "canvas/render.js"
   },
   {
    "kind": "changed",
    "name": "cardHtml",
    "path": "canvas/render.js"
   },
   {
    "kind": "added",
    "name": "labelsHtml",
    "path": "canvas/render.js"
   },
   {
    "kind": "changed",
    "name": "renderDetail",
    "path": "canvas/render.js"
   },
   {
    "kind": "added",
    "name": "setCardScale",
    "path": "canvas/ui.js"
   },
   {
    "kind": "added",
    "name": "relayout",
    "path": "canvas/ui.js"
   },
   {
    "kind": "changed",
    "name": "main",
    "path": "tools/scan_registry.js"
   }
  ]
 }
};
