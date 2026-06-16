# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Chinese-language knowledge base** (not a code project) on **EMV Level 3 (terminal integration/deployment) testing & certification**. Every tracked file is Markdown. There is no build, lint, or test system — `.ruff_cache` is vestigial and there is no Python. Work happens by reading, editing, and cross-linking `.md` files. The default output language for content is Chinese with English technical terms inline (e.g. CVM、TVR、CDCVM), matching the existing docs.

## Structure & conventions

- **`README.md` is the authoritative index/TOC.** Every doc must be linked from it and there must be no orphans (see its "一致性核查" section). When you add, rename, or delete a doc, update `README.md` in the same change.
- **Docs are heavily cross-linked** with relative paths (`./终端配置-AID与CAPK.md`). When renaming a file, grep for inbound links across all `.md` and fix them — broken internal links are tracked as a failure condition in the README.
- **Standard doc header**: `#` H1 title, then a `>` blockquote that links the related/prerequisite docs and states scope. Follow this shape for new docs.
- **`web-docs/` holds the raw source PDFs** pulled during sessions; `web-docs/SOURCES.md` is the source list. Content lives in the tracked `.md` files; the PDFs are archival references (EMVCo specs, L3 test reports, scheme rules).
- **`pdftotext` is available** (`/usr/local/bin/pdftotext`, Poppler) and extracts clean text from the text-based PDFs — use it to fold PDF content into docs. Some PDFs are image-only (e.g. the Worldpay key tables), where only headers extract; for those, read the PDF directly via the Read tool.

## Cross-document invariants (must stay consistent)

These facts are repeated across multiple docs and the README verifies they agree. When editing, keep them aligned everywhere:

- ADVT/CDET deprecation date: **2022-07-16** (replaced by Visa Global L3 Test Set).
- Case counts: **ADVT 29 (=22 contact + 7), CDET 17 (=13 + 4)**.
- Visa RID `A000000003`; kernel numbering **K2 = Mastercard, K3 = Visa, K6 = Discover**.
- Terminology: write **M-TIP** and **D-PAS** (bare `MTIP` only inside reference-number formats).
- EMV TLV tags are written as hex in backticks (`9F66`, `8E`, `9F6E`); preserve this style.

## Working notes

- Precise version numbers/case IDs come from card-scheme portals and may lag in these docs (some sourced from older spec versions, e.g. TSE 2015, ADVT v6.1.1); the framework is accurate but flag "verify against latest portal version" rather than inventing exact numbers.
- Commits in this repo use an emoji/gitmoji-style subject line.
</content>
</invoke>
