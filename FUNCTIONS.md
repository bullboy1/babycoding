# FUNCTIONS.md | stage:2 | count:40 | updated:2026-07-07 | canvas:on
|name|L|signature|path|refs|desc|
|applyView|L3|()|canvas/app.js|3|把平移缩放应用到画布|
|screenToWorld|L2|(cx,cy)|canvas/app.js|2|屏幕坐标换算成画布坐标|
|refresh|L3|()|canvas/app.js|3|重画卡片、连线和底部操作条|
|setGraph|L3|(graph)|canvas/app.js|3|装入一张新项目图并重置视图|
|fitView|L3|()|canvas/app.js|2|缩放平移到能看到整张图|
|zoomAt|L3|(cx,cy,factor)|canvas/app.js|3|以某个点为中心缩放画布|
|onDown|L4|(e)|canvas/app.js|1|按下鼠标：开始拖卡片或框选|
|onMove|L4|(e)|canvas/app.js|1|移动鼠标：拖动卡片或画选框|
|onUp|L4|(e)|canvas/app.js|1|松开鼠标：确定选区或落下卡片|
|afterSelectionChange|L3|()|canvas/app.js|4|选区变化后刷新界面和详情|
|loadText|L3|(name,text)|canvas/app.js|1|识别并载入 graph.json 或 FUNCTIONS.md|
|readFile|L3|(file)|canvas/app.js|2|读取用户拖入或选择的文件|
|onPrompt|L4|()|canvas/app.js|2|把选区和需求编译成指令并复制|
|initApp|L4|()|canvas/app.js|1|入口：绑定所有按钮和鼠标事件|
|baseName|L1|(path)|canvas/data.js|2|取路径最后一段当卡片标题|
|normalizeGraph|L3|(raw)|canvas/data.js|4|把原始数据统一成画布内部结构|
|markChanges|L3|(files,entries)|canvas/data.js|1|把上次改动标记落到文件和函数上|
|parseFunctionsMd|L3|(text)|canvas/data.js|1|把 FUNCTIONS.md 注册表解析成图|
|computeLayout|L3|(graph)|canvas/layout.js|1|按层级自动排布卡片和 tools 框|
|layoutBbox|L2|(positions,sizes,toolsBox)|canvas/layout.js|2|算所有卡片的外接矩形|
|edgePath|L2|(fromPos,fromSize,toPos,toSize)|canvas/layout.js|1|算两张卡片之间连线的曲线|
|computeFit|L2|(bbox,viewW,viewH)|canvas/layout.js|1|算看全貌所需的缩放和位移|
|buildPrompt|L3|(graph,selectedPaths,instruction)|canvas/prompt.js|1|选区加需求编译成给 AI 的完整指令|
|collectDeps|L3|(graph,selectedPaths)|canvas/prompt.js|1|找出选区依赖的可复用文件|
|copyFallback|L1|(text,done)|canvas/prompt.js|2|老浏览器的剪贴板复制兜底|
|esc|L1|(s)|canvas/render.js|16|转义 HTML 特殊字符防注入|
|cardHtml|L3|(file,pos,selected)|canvas/render.js|1|生成单张功能卡片的 HTML|
|edgesSvgHtml|L3|(graph,layout,selection)|canvas/render.js|2|生成全部连线，选区相关标红|
|renderWorld|L3|(state)|canvas/render.js|1|全量重画整个画布世界|
|renderDetail|L3|(file)|canvas/render.js|4|显示单个文件的专业详情面板|
|showToast|L2|(msg)|canvas/render.js|5|弹出一条短暂的提示消息|
|readSrc|L1|(f)|tools/build_canvas.js|3|读取 canvas 源文件文本|
|inlineAssets|L3|(html)|tools/build_canvas.js|1|内联 CSS 和 JS，注入版本戳|
|listSourceFiles|L1|()|tools/scan_registry.js|1|列出要扫描的源码文件|
|parseFunctions|L3|(text)|tools/scan_registry.js|1|正则找出文件里的顶层函数|
|buildRows|L3|(files)|tools/scan_registry.js|1|汇总函数事实，保留人工标注|
|renderRegistry|L3|(rows,today,canvasFlag)|tools/scan_registry.js|2|把行渲染成 FUNCTIONS.md 文本|
|buildGraph|L3|(files,rows,changes)|tools/scan_registry.js|1|生成画布用的 graph.json 结构|
|diffRows|L3|(oldText,newText)|tools/scan_registry.js|1|对比新旧注册表，打印增删改|
|main|L4|()|tools/scan_registry.js|1|入口：扫描，写注册表和图，或校验|
