# 💰 Personal Budget

A personal budget web app built from your Excel budget tracker. All the data from the
spreadsheet (transactions, budgets, groceries, savings, loan, IOUs) is pre-loaded and
becomes the starting data on first run.

**Pages**

- **Dashboard** — month filter, budget vs. spent per category, spending donut, 6-month income/spending trend, IOU list
- **Transactions** — add / edit / delete expenses and income, filter by month, category, or search
- **Groceries** — grocery runs by store with monthly totals
- **Savings** — $5,000 goal tracker with running-total log and months-to-goal
- **Loans** — Sallie Mae (and any other debt) with monthly interest, months to payoff, and full payoff schedule
- **Settings** — edit category budgets, savings goals, download a JSON backup

Data is stored server-side, so the same numbers show up on your phone and laptop.
A PIN screen keeps it private.

## Deploy to Vercel (one time, ~5 minutes)

1. Push this folder to a GitHub repository (or run `npx vercel` inside it).
2. In [vercel.com](https://vercel.com) → **Add New → Project** → import the repo → **Deploy** (no config needed).
3. **Enable sync**: in the project → **Storage** tab → **Create Database → Upstash for Redis**
   (free plan) → connect it to the project. This adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically.
4. **Set your PIN**: project → **Settings → Environment Variables** → add `APP_PIN` = your PIN.
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new env vars take effect.

Open the app URL on your phone and choose **Add to Home Screen** — it installs like an app.

Without the Redis store the app still runs, but edits are lost between visits
(a warning banner reminds you).

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Locally, data lives in `data/db.json` (created from the seed on first run) and no PIN
is required unless you set `APP_PIN` in `.env.local`.

## How the data works

- First run: `data/seed.json` (converted from the Excel file) becomes the database.
- Cloud: the whole dataset is stored as one JSON document in Upstash Redis.
- Backup anytime from **Settings → Download JSON backup**.
