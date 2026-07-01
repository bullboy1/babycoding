<div align="center">

# Function Registry Protocol (FRP)

**Ein fertiges Regelwerk, das KI-Coding-Agenten davon abhält, eure eigenen Funktionen neu zu erfinden.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Works with Claude Code](https://img.shields.io/badge/Claude%20Code-native-6b46c1)](CLAUDE.md)
[![Works with Codex](https://img.shields.io/badge/Codex%20CLI-native-10a37f)](AGENTS.md)
[![Works with Cursor](https://img.shields.io/badge/Cursor-native-000000)](.cursor/rules/frp.mdc)
[![Works with Windsurf](https://img.shields.io/badge/Windsurf-native-00b3a4)](.windsurfrules)
[![Works with Gemini](https://img.shields.io/badge/Gemini%20CLI-native-4285f4)](GEMINI.md)
[![Works with Copilot](https://img.shields.io/badge/GitHub%20Copilot-native-24292e)](.github/copilot-instructions.md)
[![Works with Cline](https://img.shields.io/badge/Cline%20%2F%20Roo%20Code-native-f97316)](.clinerules/frp.md)

**Languages:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Deutsch**

</div>

---

## Das Problem

Jeder KI-Coding-Agent bringt dieselben zwei eingebauten Kosten mit:

1. **Er lernt die Codebase in jeder einzelnen Session neu** — grep-en, Dateien lesen, ein mentales Modell von Grund auf neu aufbauen, mit einem Token-Aufwand, der mit der Repo-Größe skaliert.
2. **Er erfindet lieber neu, als wiederzuverwenden** — denn für ein Sprachmodell ist es im Moment "billiger", eine neue Funktion zu schreiben, als zu belegen, dass eine alte den Job schon erledigt.

Stapelt man diese beiden Kosten über hundert Sessions, bekommt man dieselbe Fähigkeit fünfmal auf unterschiedliche Weise implementiert, niemand weiß mehr, welche Version die kanonische ist, und niemand traut sich, eine davon zu löschen. Das ist kein Gedankenspiel — es ist das, worauf jede langlebige KI-unterstützte Codebase ohne Leitplanke zusteuert.

**FRP macht aus "die Codebase erforschen" ein "Nachschlagen" und aus "bitte wiederverwenden" ein durchgesetztes Protokoll.**

## So funktioniert es

Legt eine einzige Datei — `CLAUDE.md`, `AGENTS.md`, oder was auch immer euer Tool liest — ins Projekt-Root. Sie sagt dem Agenten: **Bevor ihr irgendeine Funktion schreibt, prüft die Registry (`FUNCTIONS.md`). Gefunden → wiederverwenden. Fast gefunden → erweitern. Wirklich nicht vorhanden → erstellen, dann registrieren.** Jede Aufgabe endet damit, diese Registry mit dem Code synchron zu halten.

Das Protokoll läuft auf drei Ebenen, und jede Ebene liegt bei demjenigen, der am besten geeignet ist, ehrlich darüber zu sein:

| Ebene | Inhalt | Verantwortlich | Warum |
|---|---|---|---|
| **Fact** | Funktionsname / Signatur / Pfad / Anzahl der Call-Sites | ein Scan-Script (vom Agenten selbst geschrieben) | mechanische Fakten gehören in ein Script — kein Memory-Drift, keine Abschreibfehler |
| **Semantic** | L1–L4-Tier / einzeilige Beschreibung | der Agent, inkrementell | Ermessensentscheidungen lassen sich nicht skripten; nur die berührten Zeilen werden annotiert, sodass die Kosten pro Aufgabe minimal bleiben |
| **Enforcement** | Konsistenz Registry ↔ Code | ein Pre-Commit-Hook | "die Umgebung sagt Nein" ist deutlich verlässlicher als "der Prompt sagt Nein" |

Und es wächst mit dem Projekt, statt vorab Tooling zu verlangen:

| Stage | Funktionsanzahl | Mechanismus |
|---|---|---|
| 1 | < 30 | eine handgepflegte Datei, kein Tooling |
| 2 | 30–200 | der Agent schreibt sein eigenes Scan-Script; Fact-Spalten werden automatisch, Semantic-Spalten bleiben lazily annotiert |
| 3 | > 200 | die Registry wird pro Modul gesplittet; die Root-Datei wird zum Index; ein Pre-Commit-Hook macht Drift unmöglich |

Funktions-Tiers werden nach **Abhängigkeitsrichtung** vergeben, nicht nach Wichtigkeit — und Imports dürfen nur abwärts fließen (L4→L3→L2→L1), sodass ein umgekehrter Import genauso ein Protokollverstoß ist wie eine doppelte Funktion:

- **L1 — pure Utility.** Keine Business-Konzepte, keine internen Imports.
- **L2 — geteilte Komponente.** Wird von zwei oder mehr Features verwendet oder ist klar dafür geeignet.
- **L3 — Business-Logik.** Trägt ein Domain-Konzept (User, Order, Invoice…), Single Responsibility.
- **L4 — Entry Point.** Routes, CLI-Kommandos, Orchestrierung.

## Kompatibel mit

FRP ist reines Markdown, funktioniert also mit allem, was eine Rules-Datei lesen kann. Dieses Repo liefert dasselbe Protokoll bereits vorformatiert für den erwarteten Pfad jedes gängigen Tools:

| Tool | Datei in diesem Repo | Support |
|---|---|---|
| **Claude Code** | [`CLAUDE.md`](CLAUDE.md) | native |
| **Codex CLI** | [`AGENTS.md`](AGENTS.md) | native |
| **Cursor** | [`.cursor/rules/frp.mdc`](.cursor/rules/frp.mdc) | native (aktuelles `.mdc`-Format — die alte `.cursorrules`-Datei ist deprecated und wird im Agent-Modus stillschweigend ignoriert) |
| **Windsurf** | [`.windsurfrules`](.windsurfrules) | native |
| **Cline / Roo Code** | [`.clinerules/frp.md`](.clinerules/frp.md) | native |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | native |
| **Gemini CLI / Gemini Code Assist** | [`GEMINI.md`](GEMINI.md) | native |
| Amp, Devin, Zed, Jules, VS Code, JetBrains Junie, Warp, Factory | [`AGENTS.md`](AGENTS.md) | über den offenen [AGENTS.md](https://agents.md)-Standard, den alle oben genannten Tools nativ lesen |

Alle acht Dateien sind bis auf die Titelzeile byte-identisch — kopiert die, die euer Tool will, oder kopiert einfach alle und macht euch keine weiteren Gedanken darüber.

## Ändert das wirklich etwas? Das habe ich gemessen

Ich habe FRP 15 Tage lang bei echter Arbeit laufen lassen — eine lange, unbeaufsichtigte `/loop`-artige Task-Queue, Claude Opus 4.8 auf einem Max-5x-Seat mit Extended Thinking und Sub-Agents aktiviert, plus eine separate Codex-CLI-Spur auf GPT-5.5-high mit einem Plus-Seat. "Task" bedeutet unten jeweils einen Knoten im Task-Graph eines Dev-Frameworks — eine vergleichbare Arbeitseinheit in jedem Fall.

<div align="center">
  <img src="assets/perf-comparison.svg" alt="Before/after comparison: Codex completes 10 tasks per quota cycle instead of 6; Claude sustains a 15-day continuous run instead of collapsing after about 1 hour" width="820">
</div>

| Setup | Vor FRP | Nach FRP |
|---|---|---|
| Codex CLI (GPT-5.5-high, Plus-Seat) — abgeschlossene Tasks, bevor das Quota ausging | 6 Tasks, harte Grenze | **10 Tasks** |
| Claude Opus 4.8 (Max 5x, Extended Thinking, Sub-Agents) — längster unbeaufsichtigter Lauf innerhalb eines 5h-Fensters | brach nach **~1 Stunde** zu Rauschen zusammen, teils früher | lief einen vollen **15-tägigen** durchgehenden `/loop`-Task bis zum Abschluss |

*Das sind selbst protokollierte Zahlen des Autors aus dem persönlichen Einsatz, kein unabhängig geprüfter Benchmark — ich teile sie trotzdem, weil "es verbraucht weniger Tokens" keine Behauptung sein sollte, die man einfach glauben muss.*

**Warum das Bestand hat**: Der größte Teil des Token-Budgets eines Agenten bei einer langen Aufgabe fließt nicht ins Schreiben von Code — er fließt in das *Wiederentdecken* von Code, der bereits existiert. FRP ersetzt diese Entdeckung durch ein Nachschlagen in einer Datei, die ohnehin schon im Kontext liegt, sodass jede Aufgabe günstiger startet, langsamer degradiert und länger überlebt, bevor das Modell an eine Kontext- oder Quota-Wand stößt.

## Ein durchgerechnetes Beispiel

Nehmt ein mittelgroßes Backend mit ~85 exportierten Funktionen in `src/lib`. Ohne FRP brauchen drei verschiedene Tasks über drei Wochen jeweils "die rabattierten Versandkosten für eine Bestellung berechnen" — und jede wird von einer anderen Session bearbeitet, ohne Erinnerung an die anderen. Das Ergebnis: `calcShipping`, `getShippingCost` und `computeShippingTotal` existieren alle drei, widersprechen sich alle subtil beim Runden, und der nächste Bugreport lautet: "Welche davon ruft der Checkout eigentlich auf?"

Mit FRP:

- **Task 1** liefert `computeShippingCost` (L3), registriert sie in `FUNCTIONS.md`, fertig.
- **Task 2** braucht dasselbe plus einen Promo-Code-Rabatt. Der Agent durchsucht zuerst die Registry, bekommt einen **HIT**, sieht, dass es zu 80% passt, und **EXTENDet** sie mit einem `promoCode?`-Parameter statt eine Schwesterfunktion zu schreiben.
- **Task 3**, drei Wochen später in einer brandneuen Session, sucht vor dem Schreiben nach "shipping", findet dieselbe Funktion und verwendet sie unverändert weiter.

Eine Funktion, eine Single Source of Truth, null "welche ist eigentlich die kanonische"-Debugging-Sessions — und die Registry-Trace (`REGISTRY: HIT computeShippingCost (L3) …`) bedeutet, dass ihr genau nachvollziehen könnt, welche Entscheidung der Agent getroffen hat, bei jeder Aufgabe, ohne den Diff erneut zu lesen.

## Quick Start

1. Kopiert [`CLAUDE.md`](CLAUDE.md) (oder die zu eurem Tool passende Datei aus der Tabelle oben) in euer Projekt-Root.
2. Startet eine beliebige Aufgabe wie gewohnt. Das Protokoll übernimmt automatisch: noch kein `FUNCTIONS.md` → es wird zuerst eines bootstrappt; existiert schon → es wird vor jeder neuen Funktion geprüft.
3. Bestehende Funktionen in einer alten Codebase werden **nicht** vorab komplett annotiert — das würde eine riesige einmalige Token-Rechnung verursachen. Die semantischen Spalten bleiben leer, bis die Aufgabe von irgendjemandem diese Funktion berührt und eine Zeile ausfüllt. Die Registry rechtfertigt sich schrittweise, mit nahezu null Cold-Start-Kosten.

## Warum die Zahlen so sind, wie sie sind

- **Funktion ≤ 50 Zeilen / Datei ≤ 300 Zeilen / Nesting ≤ 3**: Modelle halten sich deutlich verlässlicher an harte Zahlen als an Adjektive wie "haltet es sauber".
- **Ordnertiefe ≤ 4**: Ein tieferer Baum bedeutet mehr Round-Trips, um eine Datei zu finden — Isolation sollte aus Namensgebung und Zuständigkeit kommen, nicht aus Verschachtelung.
- **Rule of Three**: Eine falsche Abstraktion ist teurer als eine Duplikation. Das zweite Auftreten wird toleriert; erst das dritte erzwingt die Extraktion — das stoppt vorzeitige Abstraktion, bevor sie beginnt.
- **Beschreibungen ≤ 12 Wörter, kein Tabellen-Padding, keine kompletten Datei-Neuschriebe**: Die Registry selbst ist eine Fixkosten, die in jeder Session bezahlt wird — jedes Byte darin muss sich seinen Platz verdienen.
- **Die verpflichtende `REGISTRY:`-Trace-Zeile**: kostet ein Dutzend Tokens, kauft zwei Dinge — ein Schritt, der laut ausgesprochen werden muss, wird mit höherer Wahrscheinlichkeit auch tatsächlich getan, und man kann auf einen Blick prüfen, ob das Modell ihn übersprungen hat.

## Die Token-Rechnung, grob überschlagen

Fixkosten pro Aufgabe ≈ der Protokollkörper (~1k Tokens) + der relevante Registry-Shard (ein paar Hundert) + inkrementelle Annotation (ein- bis zweihundert) — nennen wir es insgesamt ~1,5k. Vergleicht das mit blindem Explorieren einer mittelgroßen Codebase, was routinemäßig in die Zehntausende von Tokens läuft, zusätzlich zu den Tokens, die für das Generieren einer bereits existierenden Funktion verbraucht werden. Je größer das Projekt und je mehr Sessions es sieht, desto breiter wird diese Lücke.

## FAQ

**Kann ich das auf eine bestehende, unaufgeräumte Codebase aufsetzen?** Ja. Der Bootstrap füllt nur die Fact-Spalten; jede semantische Spalte startet leer und wird lazily gefüllt. Die initiale Tabelle aufzubauen ist günstig.

**Wird ein schwächeres/günstigeres Modell dem wirklich folgen?** Das Protokoll macht aus Ermessensentscheidungen Entscheidungsbäume und IF/THEN-Regeln (die Tier-Frage ist vier Ja/Nein-Checks), erzwingt eine `REGISTRY:`-Trace-Zeile zur Auditierbarkeit und sichert alles mit einem Pre-Commit-Hook ab. Das verwandelt ein Intelligenzproblem in ein Prozessproblem — und günstige Modelle folgen einem Prozess deutlich verlässlicher, als sie Ermessen ausüben.

**Schreibt es damit ein günstiges Modell smarten Code?** Ehrlich gesagt nein — es verbessert Architektur und Wiederverwendungsrate, nicht die Cleverness des einzelnen Funktionskörpers. Aber es kumuliert: Jede Wiederverwendung ist eine Funktion weniger, die ein schwaches Modell von Grund auf verfassen muss, sodass sich Qualität in einer wachsenden Bibliothek bereits verifizierter Komponenten ansammelt. Die Rolle des Modells verschiebt sich unmerklich von "Autor" zu "Assembler" — genau der Job, für den günstige Modelle verlässlich sind.

**Was ist mit mehreren Personen oder Sessions, die gleichzeitig arbeiten?** Die Registry liegt in Git, Konflikte lösen sich also über normale Merges. Ab Stage 2 baut ein erneuter Lauf des Scan-Scripts die Fact-Spalten von Grund auf neu auf, während der Contract verlangt, dass eure handgeschriebenen Semantic-Spalten dabei *erhalten* bleiben.

**Wird die Registry selbst nicht zu einem Haufen toter Einträge?** Nein — die `refs`-Spalte macht Waisen sichtbar: null Referenzen → markiert als `[DEPRECATED]` → gelöscht (Funktion und Zeile), sobald jemand das nächste Mal dieses Modul berührt. Einträge verschwinden auf demselben Weg, wie sie ankommen.

## Einstellbare Stellschrauben

Stage-Schwellenwerte (30 / 200), Zeilenlimits (50 / 300), Ordnertiefe (4) und Beschreibungslänge (12 Wörter) sind einfach nur Zahlen — ändert sie nach dem Geschmack eures Teams. Wenn ihr das tut, aktualisiert auch die Self-Check-Liste in §10 der Protokolldatei, damit Regel und Check niemals auseinanderdriften.

---

<sub>Zwei Dateien liefern die Substanz: der Protokollkörper (ins Projekt kopieren) und dieses README (die Erklärung für Menschen). Das Scan-Script ist bewusst *nicht* enthalten — der Agent schreibt es für euren spezifischen Stack, sobald ihr Stage 2 erreicht, gemäß dem in §7 festgeschriebenen Contract. Das hält den Protokollstack stack-agnostisch und macht das Tooling selbst zu etwas, das sich mitentwickelt.</sub>
