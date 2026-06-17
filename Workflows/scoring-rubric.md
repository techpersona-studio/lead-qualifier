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

Estimate whether the lead can realistically afford professional implementation services.

| Score | Budget |
|-------|--------|
| 10 | $5,000+ |
| 8 | $2,000-$5,000 |
| 6 | $1,000-$2,000 |
| 3 | $500-$1,000 |
| 0 | Under $500 |

Treat budgets below $1,000 as weak unless there is clear strategic value.

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
- "Disqualify. Budget appears below agency minimum and buying intent is weak."

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
- "Budget below agency minimum"
