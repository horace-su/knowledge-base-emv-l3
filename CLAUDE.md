# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **Chinese-language documentation knowledge base** on **EMV Level 3 (terminal integration/deployment) testing and certification**. It is prose + tables, not code — there is no build, test, lint, or runtime tooling (the `.ruff_cache` / `.claude` entries in `.gitignore` are editor/tooling residue, not a Python project). Work here means reading, writing, and cross-checking Markdown.

All content is in Chinese; technical terms (EMV tags, card-scheme program names, tool names) are kept in their original English/abbreviated form.

## Layout

- All `.md` docs live **flat in the repo root** (no subdirectories of content).
- `README.md` is the **navigation hub and source of truth for structure**. It groups every doc under sections (基础概念 / FIME 工具 / 各卡组织 L3 要求 / Visa 专题 / Mastercard 专题), holds the 关键速记 summary table, and maintains a 一致性核查 (consistency-check) log.
- Cross-references between docs use relative links: `[标题](./文件名.md)`. Most docs open with a `>` blockquote linking to related docs.

## Domain coverage (so you can route a question to the right file)

- **Core EMV concepts**: CVM (`接触与非接CVM详解.md`), AID/CAPK terminal config (`终端配置-AID与CAPK.md`, `AID与CAPK全卡组织参考表.md`), TAC/IAC/TVR decision logic (`TAC-IAC-TVR决策逻辑.md`), ODA certificate chain (`ODA证书链字节级.md`).
- **FIME test tools**: `FIME-L3测试工具深度解析.md`, `FIME-BTT-品牌测试工具深度解析.md`.
- **Per-scheme L3 programs**: overview (`各卡组织L3认证测试要求一览.md`) + deep dives for Visa/Mastercard, Amex/Discover, JCB/银联, and 银联国内 PBOC/国密 (`银联国内-PBOC3.0与国密算法.md`).
- **Visa / Mastercard specifics**: TTQ/CTQ, CDET cases, Global L3 Test Set, M-TIP TSE config & questionnaire.

## Editing conventions

- **Maintain cross-document consistency.** Many facts are repeated across files and the README's 一致性核查 section tracks the ones that must agree everywhere. When editing, do not let these drift: ADVT/CDET deprecation date (2022-07-16), case counts (ADVT 29 = 22+7, CDET 17 = 13+4), Visa RID `A000000003`, kernel numbers (K2=Mastercard, K3=Visa, K6=Discover), and terminology (`M-TIP`, `D-PAS`). If you change such a fact, grep for it across all docs and update every occurrence, then update the README consistency table.
- **EMV data objects** are written as `tag (name)`, e.g. `TVR(95)`, `9F0E`, `9F66`. Keep tags in backticks/code form.
- Heavy use of Markdown tables for bit-level breakdowns and scheme comparisons — match the existing table style when extending.
- When adding a new doc, add its entry to the matching section in `README.md` (the repo treats an unindexed doc as an orphan).

## Notes

- `web-docs/SOURCES.md` is a curated index of authoritative public sources (EMVCo Books A–D, per-scheme L3 portals, FIME), not the original session-downloaded PDFs (those were never committed and are unrecoverable). To archive a real PDF, download from a source listed there and add an entry with the fetch date.
- All README internal links currently resolve (verified). When adding/renaming a doc, re-check the README index and the cross-link blockquotes at the top of related docs.
