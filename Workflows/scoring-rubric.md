# Scoring Rubric

## Fit (0-10)

- Does the lead appear to be a real business?
- Is their use case aligned with automation, website improvement, operational efficiency, lead generation, or customer experience?
- Are they likely a decision maker or someone with influence?

## Intent (0-10)

- How strong is the buying signal?
- Have they described a specific problem, goal, or desired outcome?
- Are they seeking implementation help rather than free advice?
- Have they provided meaningful details?

## Budget (0-10)

Score the **fit between budget and scope**, not the dollar figure alone. The same budget is strong for simple work and weak for complex work. As a new agency competing on quality at a fair price, small well-scoped projects are wins, not weak leads. Use the scraped website to judge project complexity.

**Simple work** (template or builder sites, restaurant and small-business sites, landing pages, basic redesigns):

| Score | Budget |
|-------|--------|
| 10 | $1,500+ |
| 9 | $1,000-$1,500 |
| 8 | $500-$1,000 |
| 6 | $300-$500 |
| 3 | Under $300 |

**Medium work** (custom builds, multi-page custom design, conversion optimization, e-commerce, CRM/tool setup):

| Score | Budget |
|-------|--------|
| 10 | $5,000+ |
| 9 | $3,000-$5,000 |
| 7 | $2,000-$3,000 |
| 5 | $1,000-$2,000 |
| 3 | $500-$1,000 |
| 1 | Under $500 |

**Complex work** (process automation, AI workflows, sales/support automation, integrations, custom platforms):

| Score | Budget |
|-------|--------|
| 10 | $8,000+ |
| 8 | $5,000-$8,000 |
| 6 | $3,000-$5,000 |
| 3 | $1,000-$3,000 |
| 1 | Under $1,000 |

Only treat budgets under $300 as weak across the board. Don't flag "budget below agency minimum" when the budget reasonably matches simple scope.

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
- "Decision maker unknown"
- "Requirements too vague"
- "May be seeking DIY advice only"
- "Budget too low for requested scope"
