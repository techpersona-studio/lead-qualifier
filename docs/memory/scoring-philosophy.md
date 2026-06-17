# Lead scoring philosophy

How this agency decides whether a lead is worth sales time. These principles drive the live system prompt in [`backend/prompts/lead-qualifier.ts`](../../backend/prompts/lead-qualifier.ts). That `.ts` is the single source of truth for scoring; this doc holds the rationale behind it.

## Who we are

A new agency competing on **quality at a fair price**, targeting high-value clients but happy to win small, well-scoped projects. Small local businesses (restaurants, shops, services) are core deal flow, not throwaway leads. A fast, easy, well-paid job is a win.

## Budget: score the value of our time, not the sticker price

The dollar figure alone means nothing. The same budget is strong for fast work and weak for heavy work. Score in two steps:

1. **Estimate effort in hours** from the use case and the scraped website.
   - Template tweak / copy refresh / single landing page: 2-4 hrs
   - Basic restaurant or small-business site on a template platform: 4-10 hrs
   - Custom multi-page site, conversion optimization, e-commerce: 20-60 hrs
   - Automation, AI workflows, integrations, custom platform: 40-150+ hrs
2. **Compute the effective hourly rate** (budget ÷ hours) and score against the $100-$150/hour US agency benchmark. $200+/hr = 10, $100-150/hr = 8, $50-75/hr = 4, under $30/hr = 1.

Worked examples:
- $500 for a 3-hour template tweak ≈ $165/hr → 9-10
- $500 for a basic restaurant site (~5 hrs) ≈ $100/hr → 8
- $1,000 for a custom automation build (~50 hrs) ≈ $20/hr → 1

A small budget for easy work rates **high**. A big budget hiding huge effort rates mediocre. Don't flag "budget too low" when the effective rate is at or above market.

## Decision-maker authority: infer from company size

The form captures the contact's name but **not their role**. Never flag a missing or unclear decision maker. Infer authority instead:

- 1-10 employees → contact is almost certainly the owner. Strong authority.
- 11-50 → manager or owner with real influence.
- 200+ → authority genuinely uncertain; only here may it flag.

Rationale: at a small local business, the person filling out the form is the buyer. Demanding "decision maker confirmed" for a 5-person restaurant is the wrong instinct.

## Website context grounds the scoring

The trigger task scrapes the lead's website ([`backend/lib/website.ts`](../../backend/lib/website.ts)) and feeds the readable text to the model before scoring. This resolves vague form fields (e.g. industry "Other") and drives the effort estimate. A template restaurant site signals low-effort, high-margin work even at a small budget.

## Where the philosophy lives in code

| Concern | File |
|---------|------|
| System prompt the model runs on (source of truth) | `backend/prompts/lead-qualifier.ts` |
| Website scrape feeding context | `backend/lib/website.ts` |
| Output schema + validation | `backend/lib/scorer.ts`, `backend/types/lead.ts` |

When you change scoring, edit the prompt, then redeploy the backend (`cd backend && npx trigger.dev@latest deploy`).
