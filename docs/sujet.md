## Context

Build Campaign Desk in 2 to 3 hours: a server-rendered web app and its JSON API, where a protocol creates a reward campaign on a Merkl opportunity. Merkl's public API supplies opportunities and token prices. Your API stores the campaigns and enforces two business rules.

AI tools are allowed and expected. Writing the code is now the cheap part, so the debrief is about the reasons behind it: why each piece of code sits in its file, how one request travels through your code, and how you would change it.

**Spend a good part of your time on the architecture.** Set up your layers before the features, give each file and each layer one clear responsibility, and be ready to say what it must not do. This is the first thing we look at.

What we evaluate:

- Architecture: the layers you chose, the single responsibility of each file, and why.
- The three rules: correct, tested.
- Data choices: what you store, what you fetch, what you cache.
- Ownership: you can explain and change any line you submit.

The spec is short on purpose. When it leaves a question open, pick an answer and write it in your README. Stop at 3 hours and list what you would do next.

## The product

A protocol wants to fund rewards on a Merkl opportunity: a pool, a vault, a lending market. Campaign Desk lets it pick an opportunity, create a campaign on it, saved in your own database, and see what it costs. This is not a simulator: a created campaign is a stored record.

Pages:

1. Opportunity list, server-rendered, with at least 3 filters (chain, action, status, minimum TVL…). The filters live in the URL.
2. Opportunity page: its Merkl data, the campaigns already created on it, and a form to create a new one with a reward token, a total amount, a start and an end. A refused campaign shows the reason next to the field concerned. An accepted one is saved and shows its fee and total cost.

Everything the web app does is also available through a JSON API that you design. Another internal tool will call this API later.

Data sources:

- Merkl public API: opportunities, reward tokens and their USD prices. Read-only.
- Your database: the campaigns

## Business rules

Two rules, enforced on every path into the system, each with tests.

| ID | Rule |
| --- | --- |
| BR-1 Minimum budget | A campaign pays at least $100 of rewards a day, valued at the token's current Merkl price. A token without a Merkl price is refused. |
| BR-2 Fee | The fee is 3% of the reward amount, paid on top. Amounts are integers in the token's smallest unit (1 USDC = 1,000,000), and the fee rounds up to the next unit. |

## Baseline

Each point below only has to work. We check it, we do not grade its depth.

- Merkl: responses cached in-process (no Redis), and a slow or down Merkl does not crash a page.
- Forms and SSR: the form works before JavaScript loads, errors land on the right field, filters live in the URL.
- Tests: each rule tested at its boundaries.

Non-goals: login, deployment, containers, wallets and onchain transactions, pixel-perfect design.

## Your feature

Once the rules and the baseline work, spend the rest of your time on one feature of your choice: frontend or backend, anything you want to show us. This is where you go deep. Budget 30 minutes to 1 hour. Say in the README what you built and why you picked it.

## Using AI

Use any AI tool.

- You own every line. In the debrief we open files and ask why each one exists and why its code sits there.
- Add an AI section to the README: what you delegated, and one place where the output was wrong and how you fixed it.
- Volume earns nothing. Unused code and unused dependencies count against the submission.

## Deliverables

Send a link to one repository at least 24 hours before the debrief.

- README:  your answers to the open questions, the AI section, and what you would do next.
- Tests for the two rules.
- Optional: a few seeded campaigns, so the opportunity pages are not empty on first run.
- Exact dependency versions and a committed lockfile.
- The git history as you made it. Do not squash it.

The stack is your choice. We use TypeScript, Bun, React Router (SSR), Elysia, Prisma and Postgres. Using the same stack makes the conversation easier but earns no points.