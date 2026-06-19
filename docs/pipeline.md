# Agency pipeline (vision)

The full funnel from an inbound lead to a delivered opportunity map. Each AI stage is an **Agent** (see [`CONTEXT.md`](../CONTEXT.md)) run behind one generic task.

Status today: **Lead Qualifier** (stage 1) is built and **Opportunity Map Generator** (stage 6) is in progress. The rest is the intended direction, not yet built.

## Stages

1. **Qualify the lead** — the `Lead Qualifier` agent scores an inbound lead on fit, intent, budget, and urgency, and returns a 0-100 score with an A-D grade. *Built.*
2. **Gate: is the lead good?** — A and B leads proceed; C and D are nurtured or disqualified. A grade-driven gate, automatic or human.
3. **Deep research** — an enrichment agent researches the company (offer, market, how they win customers) to brief the next steps. *Not built.*
4. **Draft outreach** — an outreach agent writes a tailored first message with prepared Q&A. A human reviews and sends. This stage stays human-in-the-loop; automated send is a reputation risk. *Not built.*
5. **Book the call** — human plus calendar step.
6. **Generate the opportunity map** — after the call, a member pastes the conversation; the `Opportunity Map Generator` agent combines the transcript with a fresh web analysis and produces a ranked, ICE-scored set of opportunities, each with expected business impact, effort, risks, and a recommended first move. *In progress.*
7. **Deliver to the owner** — the map goes to the Lead's owner as a report. They decide whether to move forward.
8. **Await next step** — the Lead sits in a "sent, awaiting decision" state.

## Notes

- Each stage maps to a single **Lead** and advances its state. A Lead state machine (qualified → researched → contacted → call booked → mapped → sent → awaiting) is the natural backbone, but it isn't built yet.
- The pipeline validates the agent-registry architecture: every AI stage is another agent `{input, prompt, output schema}` behind the same generic task.
- Outreach (stage 4) must keep a human approval gate before anything is sent to a prospect.
- The opportunity map (stage 6) treats the website scrape as a core input, not an optional extra, since the site is almost always known by the time a call has happened.
