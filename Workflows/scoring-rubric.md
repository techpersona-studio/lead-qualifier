# Scoring Rubric

## Fit (0-10)

- **9-10**: Enterprise/mid-market in a high-value vertical (SaaS, fintech, e-commerce, healthcare tech)
- **7-8**: SMB with clear product-market fit potential
- **4-6**: Unclear industry fit or very small company
- **0-3**: Consumer, non-profit, student, or clearly outside ICP

## Intent (0-10)

- **9-10**: Specific problem, clear use case, mentions timeline
- **7-8**: Defined problem, vague timeline
- **4-6**: General interest, no clear problem statement
- **0-3**: Spam-like or exploratory with no real need

## Budget (0-10)

- **9-10**: > $50k/year stated or implied
- **7-8**: $10k–$50k/year
- **4-6**: < $10k or "exploring options"
- **0-3**: No budget or clearly cannot afford

## Urgency (0-10)

- **9-10**: Immediate need ("this quarter", "ASAP")
- **7-8**: Near-term ("next 3-6 months")
- **4-6**: Future planning ("sometime this year")
- **0-3**: No timeline or just browsing

## Overall score formula

```
score = (fit × 0.35) + (intent × 0.30) + (budget × 0.20) + (urgency × 0.15)
score = round(score × 10)   // scales to 0-100
```

## Grade thresholds

| Grade | Score range | Action |
|-------|-------------|--------|
| A | ≥ 80 | Book discovery call |
| B | 60–79 | Follow up within 48h |
| C | 40–59 | Nurture sequence |
| D | < 40 | Disqualify |
