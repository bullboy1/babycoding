<div align="center">

<img src="assets/logo.png" alt="babycoding logo" width="120">

# Function Registry Protocol (FRP)

**A drop-in rulebook that stops AI coding agents from reinventing your own functions.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Works with Claude Code](https://img.shields.io/badge/Claude%20Code-native-6b46c1)](CLAUDE.md)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-native-10a37f)](AGENTS.md)
[![Works with Cursor](https://img.shields.io/badge/Cursor-native-000000)](.cursor/rules/frp.mdc)
[![Works with Windsurf](https://img.shields.io/badge/Windsurf-native-00b3a4)](.windsurfrules)
[![Works with Gemini](https://img.shields.io/badge/Gemini%20CLI-native-4285f4)](GEMINI.md)
[![Works with Copilot](https://img.shields.io/badge/GitHub%20Copilot-native-24292e)](.github/copilot-instructions.md)
[![Works with Cline](https://img.shields.io/badge/Cline%20%2F%20Roo%20Code-native-f97316)](.clinerules/frp.md)

**Languages:** **English** · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md)

</div>

---

## The problem

Every AI coding agent has the same two costs baked in:

1. **It re-learns your codebase every single session** — grepping, reading files, rebuilding a mental model from scratch, at a token cost that scales with repo size.
2. **It would rather invent than reuse** — because for a language model, writing a new function is "cheaper" in the moment than proving an old one already does the job.

Stack those two costs over a hundred sessions and you get the same capability implemented five different ways, no one sure which version is canonical, and no one brave enough to delete any of them. That's not a hypothetical — it's what every long-lived AI-assisted codebase converges to without a guardrail.

**FRP turns "explore the codebase" into "look it up," and turns "please reuse things" into an enforced protocol.**

## How it works

Drop a single file — `CLAUDE.md`, `AGENTS.md`, or whichever your tool reads — into the project root. It tells the agent: **before writing any function, check the registry (`FUNCTIONS.md`). Found it → reuse it. Almost found it → extend it. Genuinely missing → create it, then register it.** Every task ends by keeping that registry in sync with the code.

The protocol runs on three layers, and each layer is owned by whoever is best suited to be honest about it:

| Layer | Content | Owner | Why |
|---|---|---|---|
| **Fact** | function name / signature / path / call-site count | a scan script (written by the agent itself) | mechanical facts belong to a script — no memory drift, no copy errors |
| **Semantic** | L1–L4 tier / one-line description | the agent, incrementally | judgment calls can't be scripted; only the touched rows get annotated, so the cost per task stays tiny |
| **Enforcement** | registry-vs-code consistency | a pre-commit hook | "the environment says no" is far more reliable than "the prompt says no" |

And it grows with the project instead of demanding upfront tooling:

| Stage | Function count | Mechanism |
|---|---|---|
| 1 | < 30 | one hand-maintained file, zero tooling |
| 2 | 30–200 | the agent writes its own scan script; fact columns become automatic, semantic columns stay lazily annotated |
| 3 | > 200 | the registry shards by module; the root file becomes an index; a pre-commit hook makes drift impossible |

Function tiers are assigned by **dependency direction**, not importance — and imports are only allowed to flow downward (L4→L3→L2→L1), so a reverse import is a protocol violation the same way a duplicate function is:

- **L1 — pure utility.** No business concepts, no internal imports.
- **L2 — shared component.** Used, or clearly usable, by two or more features.
- **L3 — business logic.** Carries a domain concept (user, order, invoice…), single responsibility.
- **L4 — entry point.** Routes, CLI commands, orchestration.

## Compatible with

FRP is just markdown, so it works with anything that can read a rules file. This repo ships the same protocol pre-formatted for every major tool's expected path:

| Tool | File in this repo | Support |
|---|---|---|
| **Claude Code** | [`CLAUDE.md`](CLAUDE.md) | native |
| **Codex CLI** | [`AGENTS.md`](AGENTS.md) | native |
| **Cursor** | [`.cursor/rules/frp.mdc`](.cursor/rules/frp.mdc) | native (current `.mdc` format — the legacy `.cursorrules` file is deprecated and silently ignored in Agent mode) |
| **Windsurf** | [`.windsurfrules`](.windsurfrules) | native |
| **Cline / Roo Code** | [`.clinerules/frp.md`](.clinerules/frp.md) | native |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | native |
| **Gemini CLI / Gemini Code Assist** | [`GEMINI.md`](GEMINI.md) | native |
| Amp, Devin, Zed, Jules, VS Code, JetBrains Junie, Warp, Factory | [`AGENTS.md`](AGENTS.md) | via the open [AGENTS.md](https://agents.md) standard, which all of the above read natively |

All eight files are byte-identical apart from the title line — copy the one your tool wants, or copy all of them and stop thinking about it.

## Does it actually change anything? Here's what I measured

I ran FRP for 15 days across real work — a long, unattended `/loop`-style task queue, Claude Opus 4.8 on a Max 5x seat with Extended Thinking and sub-agents on, plus a separate Codex CLI track on GPT-5.5-high with a Plus seat. "Task" below means one node in a dev framework's task graph — a comparable unit of work each time.

<div align="center">
  <img src="assets/perf-comparison.svg" alt="Before/after comparison: Codex completes 10 tasks per quota cycle instead of 6; Claude sustains a 15-day continuous run instead of collapsing after about 1 hour" width="820">
</div>

| Setup | Before FRP | After FRP |
|---|---|---|
| Codex CLI (GPT-5.5-high, Plus seat) — tasks finished before quota ran out | 6 tasks, hard cap | **10 tasks** |
| Claude Opus 4.8 (Max 5x, Extended Thinking, sub-agents) — longest unattended run inside a 5h window | collapsed to noise after **~1 hour**, sometimes less | ran a full **15-day** continuous `/loop` task to completion |

*These are the author's own logged numbers from personal usage, not an independently audited benchmark — sharing them anyway because "it uses fewer tokens" is a claim you shouldn't have to take on faith.*

**Why it holds up**: most of an agent's token budget on a long task isn't spent writing code — it's spent *re-discovering* the code that already exists. FRP replaces that discovery with a lookup against a file that's already sitting in context, so every task starts cheaper, degrades slower, and survives longer before the model runs into a context or quota wall.

## A worked example

Take a mid-sized backend with ~85 exported functions across `src/lib`. Without FRP, three different tasks over three weeks each need "compute the discounted shipping cost for an order" — and each one is handled by a different session with no memory of the others. The result: `calcShipping`, `getShippingCost`, and `computeShippingTotal` all exist, all subtly disagree on rounding, and the next bug report is "which one does checkout actually call?"

With FRP:

- **Task 1** ships `computeShippingCost` (L3), registers it in `FUNCTIONS.md`, done.
- **Task 2** needs the same thing plus a promo-code discount. The agent searches the registry first, gets a **HIT**, sees it's an 80% match, and **EXTENDs** it with a `promoCode?` parameter instead of writing a sibling function.
- **Task 3**, three weeks later in a brand-new session, searches for "shipping" before writing anything, finds the same function, and reuses it as-is.

One function, one source of truth, zero "which one is canonical" debugging sessions — and the registry trace (`REGISTRY: HIT computeShippingCost (L3) …`) means you can audit exactly which decision the agent made, in every task, without re-reading the diff.

## Quick start

1. Copy [`CLAUDE.md`](CLAUDE.md) (or the file matching your tool, from the table above) into your project root.
2. Start any task as normal. The protocol takes over automatically: no `FUNCTIONS.md` yet → it bootstraps one first; already exists → it's checked before any new function gets written.
3. Existing functions in an old codebase are **not** pre-annotated up front — that would burn a huge one-time token bill. The semantic columns stay blank until whoever's task touches that function fills in one row. The registry earns its keep gradually, with near-zero cold-start cost.

## Why the numbers are what they are

- **Function ≤ 50 lines / file ≤ 300 lines / nesting ≤ 3**: models comply with hard numbers far more reliably than with adjectives like "keep it clean."
- **Folder depth ≤ 4**: a deeper tree means more round-trips to locate a file — isolation should come from naming and responsibility, not from nesting.
- **Rule of Three**: a wrong abstraction is more expensive than a duplicate. The second occurrence is tolerated; only the third forces extraction — this stops premature abstraction before it starts.
- **Descriptions ≤ 12 words, no table padding, no full-file rewrites**: the registry itself is a fixed cost paid every session — every byte in it has to earn its place.
- **The mandatory `REGISTRY:` trace line**: costs a dozen tokens, buys two things — a step that has to be said out loud is a step that's more likely to actually happen, and you can audit at a glance whether the model skipped it.

## The token math, roughly

Fixed cost per task ≈ the protocol body (~1k tokens) + the relevant registry shard (a few hundred) + incremental annotation (one or two hundred) — call it ~1.5k total. Compare that to blind exploration of a mid-sized codebase, which routinely runs into the tens of thousands of tokens, on top of the tokens spent generating a function that already existed. The bigger the project and the more sessions it sees, the wider that gap gets.

## FAQ

**Can I bolt this onto an existing, messy codebase?** Yes. Bootstrap only fills the fact columns; every semantic column starts blank and gets filled in lazily. Building the initial table is cheap.

**Will a weaker/cheaper model actually follow this?** The protocol turns judgment calls into decision trees and IF/THEN rules (the tier question is four yes/no checks), forces a `REGISTRY:` trace line for auditability, and backstops everything with a pre-commit hook. That converts an intelligence problem into a process problem — and cheap models are far more reliable at following a process than at exercising judgment.

**Does it make a cheap model write smart code?** Honestly, no — it improves architecture and reuse rate, not the cleverness of any individual function body. But it compounds: every reuse is one fewer function a weak model has to author from scratch, so quality accumulates in a growing library of already-verified components. The model's role quietly shifts from "author" to "assembler" — which is exactly the job cheap models are reliable at.

**What about multiple people or sessions working at once?** The registry lives in git, so conflicts resolve through normal merges. From Stage 2 onward, re-running the scan script rebuilds the fact columns from scratch while the contract requires it to *preserve* your hand-written semantic columns.

**Won't the registry itself turn into a pile of dead entries?** No — the `refs` column makes orphans visible: zero references → flagged `[DEPRECATED]` → deleted (function and row) the next time anyone touches that module. Entries leave the same way they arrive.

## Tunable knobs

Stage thresholds (30 / 200), line limits (50 / 300), folder depth (4), and description length (12 words) are all just numbers — change them to match your team's taste. If you do, update the self-check list in §10 of the protocol file too, so the rule and the check never drift apart.

---

<sub>Two files ship the substance: the protocol body (copy into your project) and this README (the explanation for humans). The scan script is deliberately *not* included — the agent writes it for your specific stack once you hit Stage 2, per the contract frozen into §7. That keeps the protocol stack-agnostic and makes the tooling itself part of what evolves.</sub>
