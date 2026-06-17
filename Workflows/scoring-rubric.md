# Scoring Rubric

## Fit (0-10)

- Does the lead appear to be a real business?
- Is their use case aligned with automation, website improvement, operational efficiency, lead generation, or customer experience?
- Decision-maker authority is **inferred from company size**, since the form doesn't capture the contact's role. At 1-10 employees the contact is almost certainly the owner (strong authority); at 11-50 assume a manager or owner with influence; only at 200+ treat authority as uncertain. Never flag a missing decision maker for companies under 200.

## Intent (0-10)

- How strong is the buying signal?
- Have they described a specific problem, goal, or desired outcome?
- Are they seeking implementation help rather than free advice?
- Have they provided meaningful details?

## Budget (0-10)

Score the budget by the **value of our time**, not the dollar figure alone. A small budget for fast, easy work is a great deal. A large budget hiding huge effort can be mediocre. As a new agency competing on quality at a fair price, reward strong effort-to-value matches.

**Step 1 — Estimate the effort** (hours), using the use case and scraped website:

| Work | Estimated hours |
|------|-----------------|
| Template tweak, content/copy refresh, single landing page | 2-4 |
| Basic restaurant or small-business site / redesign on a template platform | 4-10 |
| Custom multi-page site, conversion optimization, e-commerce | 20-60 |
| Process automation, AI workflows, integrations, custom platform | 40-150+ |

**Step 2 — Compute the effective hourly rate** (budget ÷ hours). Target is $100-$150/hour (US agency benchmark):

| Score | Effective hourly rate |
|-------|-----------------------|
| 10 | $200+/hour |
| 9 | $150-$200/hour |
| 8 | $100-$150/hour |
| 6 | $75-$100/hour |
| 4 | $50-$75/hour |
| 2 | $30-$50/hour |
| 1 | Under $30/hour |

**Worked examples:**

- $500 for a 3-hour template tweak ≈ $165/hour → 9-10
- $500 for a basic restaurant site (~5 hours) ≈ $100/hour → 8
- $1,000 for a custom automation build (~50 hours) ≈ $20/hour → 1

Reward a high effective hourly rate even when the absolute budget is small. Don't flag "budget too low" when the effective rate is at or above market.

## Urgency (0-10)

- Is there a defined timeline?
- Is there evidence of an active business problem?
- Are they losing time, revenue, or opportunities today?
- Does the project appear likely to happen soon?

## Category weighting

| Category | Signal |
|----------|--------|
| Sales Automation | Strong positive |
| Customer Support | Strong positive |
| Internal Operations | Strong positive |
| Lead Generation | Positive |
| Marketing Automation | Positive |
| Data Analysis | Neutral |
| Product Analytics | Slightly weaker fit unless tied to implementation work |

## Overall score

The model calculates an overall score from 0-100 across the four dimensions, applying the category weighting above.

## Grade thresholds

| Grade | Score range |
|-------|-------------|
| A | 80-100 |
| B | 65-79 |
| C | 45-64 |
| D | 0-44 |

## recommendedAction

Always contains a clear decision plus reasoning. Allowed action types:

- Pursue immediately
- Schedule discovery call
- Qualify budget first
- Nurture for later
- Disqualify

Examples:

- "Pursue immediately. Strong fit, clear pain point, and realistic budget."
- "Schedule discovery call. Good fit but requirements need clarification."
- "Qualify budget first. Project appears valuable but spending authority is unclear."
- "Nurture for later. Moderate interest but urgency is low."
- "Disqualify. Budget is far below what the requested scope requires and buying intent is weak."

## nextSteps

- 2-3 specific action items only when grade is A or B.
- Empty array for grades C and D.

## flags

Risk factors or missing information, such as:

- "No budget specified"
- "Timeline missing"
- "Requirements too vague"
- "May be seeking DIY advice only"
- "Budget too low for requested scope"
