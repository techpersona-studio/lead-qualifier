# Frontend redesign — Warm Editorial

**Date:** 2026-06-16
**Status:** Approved

---

## Context

The existing frontend is functional but visually generic — gray-50 background, default Tailwind utilities, no design personality. The goal is a redesigned frontend that feels warm, opinionated, and premium — suited for a founder/solo operator who qualifies leads and wants the result to feel like a considered verdict, not a dashboard readout.

The redesign keeps all existing backend contracts intact (same API route, same `QualificationResult` shape, same trigger.dev polling). Only the frontend visual layer changes.

---

## Aesthetic direction: Warm Editorial

- **Palette:** Parchment off-white (`#FAF8F5`) for the left panel, slightly deeper `#F5F1EC` for the right. Warm charcoal `#1C1917` for text. Terracotta `#C96A2E` as the single accent.
- **Typography:** DM Serif Display (Google Fonts) for the grade verdict. Geist Sans (existing) for all body/UI text. Geist Mono (existing) for numeric scores and dimension values.
- **Motion:** Entry animations on result arrival (fade + translateY). Dimension bars fill left-to-right on entry. Button loading state uses opacity pulse (no spinner).
- **Borders:** 1px warm-gray (`#D6CFC7`) bottom-border inputs, not boxed inputs. Terracotta border-bottom + left accent on focus.

---

## Layout

**Desktop (≥ 1024px):** Full-height two-panel split.
- Left panel: 45% width, sticky, padded 48px horizontal / 56px vertical. Max-width 520px.
- Right panel: 55% width, scrollable. Background `#F5F1EC`.
- Divider: `1px solid #E5DDD5`.

**Mobile (< 1024px):** Panels stack vertically. Form first, result below.

**No navbar.** Small wordmark top-left of left panel: `Lead Qualifier`, 13px uppercase, letter-spaced.

---

## Left panel — Form

### Field grouping
Three groups separated by hairline dividers:
1. **Person:** Contact Name, Company Name, Website URL
2. **Company:** Industry, Company Size
3. **Deal:** Budget Range, Use Case

### Input treatment
- Bottom-border only (`1px solid #D6CFC7`), no box
- On focus: border-bottom transitions to `#C96A2E`, 2px left accent bar appears
- Labels: 12px, uppercase, letter-spaced 0.08em, `#57534E`
- Values: 15px, `#1C1917`
- Textarea (Use Case): 4 rows, character count hint bottom-right
- Select dropdowns: same bottom-border style, custom chevron icon

### Analyze button
- Full-width, 48px tall
- Background `#1C1917`, text `#FAF8F5`
- Hover: lightens to `#2D2926` with subtle warm gradient overlay
- Loading: text becomes `Analyzing…`, slow opacity pulse, disabled state (opacity 0.6, cursor not-allowed)

---

## Right panel — Result

### Empty state
- Centered dashed-border rectangle (`#D6CFC7`, 1px dashed, 8px radius)
- Muted copy: "Run an analysis to see the qualification score." (14px, `#A8A29E`)
- Simple directional icon (no emoji)

### Result layout (4 zones)

**Zone 1 — Verdict header**
- Grade letter: DM Serif Display, 96px, left-anchored
- Grade colors: A = `#2D6A4F`, B = `#1D4E89`, C = `#92400E`, D = `#7F1D1D`
- Right of grade: score (`74 / 100`) in 28px Geist Mono, recommended action in 13px uppercase terracotta

**Zone 2 — Summary**
- Warm hairline divider above
- Claude summary paragraph: 15px Geist Sans, `#44403C`, line-height 1.7
- Staggered fade-in 200ms after header

**Zone 3 — Dimensions**
Four rows (Fit, Intent, Budget, Urgency):
- Label: 12px uppercase, letter-spaced, `#78716C`
- Value: `7 / 10`, Geist Mono, right-aligned
- Bar: 5px tall, background `#E5DDD5`, fill = grade color, animates 0→width on entry (400ms ease-out, 50ms stagger per row)

**Zone 4 — Flags (conditional)**
Only rendered if `flags.length > 0`:
- Each flag as a pill: 12px, background `#FEF3C7`, text `#92400E`, rounded-full
- `⚠` prefix

### Entry animation
On result arrival: entire result fades up (translateY 12px → 0, opacity 0 → 1) over 300ms. Dimension bars fill after 200ms delay.

---

## Files to modify

| File | Change |
|------|--------|
| `frontend/app/globals.css` | Replace color variables, add CSS animations, update `.input` and `.btn-primary` classes, add DM Serif Display font import |
| `frontend/app/layout.tsx` | Add DM Serif Display font via `next/font/google` |
| `frontend/app/page.tsx` | Implement two-panel split layout, wordmark |
| `frontend/components/LeadForm.tsx` | Restyle form with grouped fields, new input treatment, loading button state |
| `frontend/components/QualificationResult.tsx` | Implement 4-zone result layout, dimension bars, entry animations, empty state |

No backend changes. No new dependencies beyond DM Serif Display (loaded via `next/font/google`, zero bundle cost).

---

## Verification

1. Run `cd frontend && npm run dev`
2. Open `http://localhost:3000`
3. Confirm two-panel layout renders on desktop, stacks on mobile
4. Fill form with a test lead, click Analyze
5. Confirm loading state (opacity pulse, "Analyzing…" text)
6. Confirm result arrives with entry animation
7. Confirm dimension bars animate in
8. Confirm flags render as amber pills if present
9. Confirm grade letter uses DM Serif Display at 96px
10. Confirm color-coded grade (A = green, B = blue, C = amber-brown, D = deep red)
