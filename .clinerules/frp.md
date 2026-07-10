# Cline Rules — Function Registry Protocol (FRP) v1.3

Mandatory for every task in this repo.
Goals: zero duplicate code, minimal token spend, clean layered architecture.

## 0. Session start
1. Read `FUNCTIONS.md`. If Stage 3 (sharded): read root index + only the shards of modules this task touches.
2. No `FUNCTIONS.md` → run §6 Bootstrap before anything else.
3. Function count crossed a §7 threshold → perform that stage upgrade within this task.

## 1. Lookup — before writing ANY function
1. Search `FUNCTIONS.md` (name + desc columns) by capability keywords.
2. HIT → grep the code to confirm existence and signature → REUSE. Reimplementing a registered capability is a protocol violation.
3. NEAR-HIT (covers ≥80% of the need) → EXTEND the existing function (add a param/option). Do not create a sibling.
4. MISS → create, following §2–§4.
5. Mandatory trace — print one line per decision in your reply, before writing code:
   - `REGISTRY: HIT parseDate (L1) src/utils/time.py`
   - `REGISTRY: EXTEND fetchOrder (L3) src/orders/api.py — add includeDrafts flag`
   - `REGISTRY: MISS -> new renderBadge (L2) src/ui/badge.tsx`

## 2. Creation rules
- Names: verb+noun, repo's dominant casing (`parseInvoice` / `parse_invoice`). Searchable; no abbreviations except: id, url, db, cfg, ctx.
- One function, one responsibility. Function ≤ 50 lines. File ≤ 300 lines. Nesting ≤ 3 levels.
- Rule of Three: a 2nd duplication is tolerated; the 3rd MUST be extracted into a shared L1/L2 component and registered.
- Folders: depth ≤ 4 from repo root, lowercase, named by domain/feature — never by person, date, or version.
- Imports flow downward only: L4 → L3 → L2 → L1. L1 imports no project code. An upward import is a bug.
- Shared constants/types obey the same lookup-before-create rule (grep first).
- Comments explain WHY, never WHAT. One-line docstring required on L1/L2; on L3/L4 only when non-obvious.
- Minimal diff: touch nothing outside task scope. No drive-by refactors.

## 3. Level decision tree (answer in order, stop at first YES)
1. Entry point / route / CLI / orchestrates other functions? → **L4**
2. Contains business or domain concepts (user, order, invoice...)? → **L3**
3. Used — or clearly usable — by ≥ 2 features? → **L2**
4. Otherwise (pure utility, no internal imports) → **L1**

## 4. Registration — before ending any task that changed code
- One row per function created or changed. Edit rows in place — NEVER rewrite the whole file.
- Deleted a function → delete its row. Keep header `count` / `updated` current.
- Register: exported/public functions, methods, shared components.
- Skip: private helpers < 10 lines with a single call site; tests; generated/vendored code.

## 5. FUNCTIONS.md format
```
# FUNCTIONS.md | stage:1 | count:23 | updated:2026-06-11
|name|L|signature|path|refs|desc|
|parseDate|L1|(s:str)->datetime|src/utils/time.py|4|ISO string to datetime|
|fetchOrder|L3|(id:int)->Order|src/orders/api.py|2|load one order by id|
```
- Pipe rows, NO alignment padding. desc ≤ 12 words, plain language a non-coder understands (canvas on → write desc in the canvas language). refs = grep'd call-site count (`-` allowed in Stage 1).
- Legacy rows may carry `-` for L/desc — lazy annotation: whoever next touches the function fills them in.

## 6. Bootstrap (no FUNCTIONS.md)
1. Scan the codebase for function definitions (glob + grep; exclude tests, generated, vendored).
2. Write `FUNCTIONS.md` with fact columns filled; set L/desc = `-` for all existing functions.
3. Set stage per §7. Report the function count to the user.

## 7. Stages — evolution thresholds
- **Stage 1** (< 30 functions): manual upkeep, single file, no tooling.
- **Stage 2** (30–200): write `tools/scan_registry` (≤ 150 lines; prefer the stack's AST, else universal-ctags, else regex).
  Contract: regenerate fact columns; PRESERVE manual L/desc values; print added/changed/removed rows; `--check` exits 1 when registry ≠ code.
  Also regenerate `docs/registry/graph.json` + `graph.js` (same object, wrapped as `window.BABYCODE_GRAPH = …;` so the canvas auto-loads it):
  `{"meta":{project,lang},"files":[{path,module,functions:[registry rows, plus §4-skipped helpers flagged minor:true]}],"edges":[{from,to}],"changes":{date,entries:[{path,name,kind:added|changed|removed}]}}`.
  edges = file-level imports; changes = THIS scan's diff (keep previous when empty) — the canvas highlights last-task changes; minor rows feed its detail toggle.
  At the end of every code-changing task: run it, then annotate only the printed rows.
- **Stage 3** (> 200): shard to `docs/registry/<module>.md`; `FUNCTIONS.md` becomes the index `|module|path|count|`.
  Install a pre-commit hook running `tools/scan_registry --check`.

## 8. Hygiene
- Row with refs:0 → append `[DEPRECATED]` to desc. Still 0 when its module is next touched → delete function + row.
- Found a code↔registry desync (unregistered function, or ghost row) → fix the registry in the same task, even if unrelated.

## 9. Output discipline
- Do not echo file contents back into chat. A report = REGISTRY trace lines + a change summary of ≤ 5 lines.

## 10. Canvas (optional — always the user's choice)
- The first time FUNCTIONS.md is created (or the header lacks a canvas flag), ask the user ONCE: "Enable the visual project canvas? (a plain-language map of your project)" — and if yes, which display language. Record `| canvas:off` or `| canvas:<lang>` (e.g. `canvas:zh`, `canvas:en`) in the FUNCTIONS.md header. Never ask again; the user may flip it anytime.
- canvas on → download the viewer VERBATIM to `docs/registry/canvas.html` from CANVAS_URL below (fetch failed / offline → ask the user to manually copy `dist/babycode-canvas.html` from the babycode repo). It auto-loads the `graph.js` sitting next to it — the user just double-clicks; no file picking.
- canvas on → keep `docs/registry/graph.js` current at the end of every code-changing task (Stage 2+: the scan emits it; Stage 1: derive it from FUNCTIONS.md with edges:[]).
- CANVAS_URL: https://raw.githubusercontent.com/bullboy1/babycoding/main/dist/babycode-canvas.html
- The viewer is a FIXED versioned artifact — treat as vendored: NEVER generate, edit, restyle, or "improve" it, and never register it. Upgrade = re-download. This keeps the canvas UI identical across all AIs and all projects.

## 11. Definition of done — self-check before the final reply
- [ ] One REGISTRY trace line per new/changed function
- [ ] Registry rows + header updated (Stage ≥ 2: scan executed)
- [ ] No new function > 50 lines, no new file > 300 lines
- [ ] No third duplication left unextracted
