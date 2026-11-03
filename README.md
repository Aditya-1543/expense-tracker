# Paisa Tracker 💸

A simple, free, installable expense tracker for your phone. Built with React + Vite as a PWA. Currency: INR (₹).

## Current status — Stage 1 (done)

A fully working **3-page** app that runs locally and stores data **in your browser** (no account, no server yet).

### 🏠 Home
- Add / edit / delete expenses (tap a transaction to edit)
- Amount, category, payment method, date, and remarks on every expense
- Monthly total hero card + daily-avg / spent-today / vs-last-month stats
- Category breakdown with a donut chart + ranked bars
- Search by remarks and filter by category
- Transactions grouped by day

### 📊 Analytics
- **Daily spend** bar chart for the month, filterable by category
- **Monthly trend** — last 6 months
- **Insights** — daily avg, per-expense avg, active days, top category, biggest expense, highest-spend day, and a payment-method split
- **Find a day** — pick any date to see that day's expenses and total

### ⚙️ Settings
- **Categories** — add / edit / delete (pick icon + color). Deleting a category in use reassigns its expenses safely; reset to defaults anytime.
- **Your data** — export backup (JSON), import backup, export CSV, clear all
- App info

Starter categories: Food, Groceries, Travel, Pooja, Bills, Rent, Utilities, Entertainment, Health, Shopping, Education, Other (all editable).
Payment methods: UPI (default), Cash, Card, Bank Transfer.

Installable to your iPhone / Android home screen (PWA). Professional light theme, mobile-first.

### Data retention
The app keeps only the **most recent 6 months** of expenses (current month + previous 5). Anything older is pruned automatically — on app load, after adding an expense, and after importing a backup. The policy lives in `src/lib/retention.js`; change `MONTHS_TO_KEEP` there to adjust the window.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). To test on your phone while developing, run `npm run dev -- --host` and open the Network URL on a phone connected to the same Wi-Fi.

## Build

```bash
npm run build
npm run preview
```

## Install on iPhone

1. Deploy (see Stage 2) or open the network URL in Safari.
2. Tap the Share icon → **Add to Home Screen**.
3. It opens full-screen with its own icon, like a native app.

## Roadmap

- **Stage 1 — Local PWA** ✅ (this)
- **Stage 2 — Cloud sync + deploy**
  - Supabase (free tier) for the database + email login
  - Deploy to Vercel or Netlify (free, auto HTTPS)
  - Swap `src/lib/store.js` to talk to Supabase — the UI won't change, only that file.
- **Stage 3 — Nice-to-haves**
  - Charts, filters, search
  - Recurring expenses
  - Budgets (optional, later)

## Project structure

```
src/
  main.jsx              app entry
  App.jsx               shell: shared state, page switch, add/edit flow, nav
  constants.js          seed categories, payment methods, icon/color palettes
  styles.css            light theme
  hooks/
    useExpenses.js      expense state + CRUD
    useCategories.js    category state + CRUD
  lib/
    store.js            expense data layer (localStorage now, Supabase later)
    categories.js       category data layer (localStorage now, Supabase later)
    format.js           INR + date helpers
  pages/
    HomePage.jsx        summary, stats, breakdown, transactions
    AnalyticsPage.jsx   charts, insights, day search
    SettingsPage.jsx    category manager + data tools
  components/
    BottomNav.jsx       3-tab navigation
    MonthSummary.jsx    total hero card + month picker
    QuickStats.jsx      daily avg / today / vs last month
    DonutChart.jsx      category donut
    BarChart.jsx        reusable bars (daily + monthly)
    CategoryBreakdown.jsx
    FilterBar.jsx       search + category chips
    ExpenseList.jsx     day-grouped transactions
    ExpenseForm.jsx     add/edit expense sheet
    CategoryEditor.jsx  add/edit category sheet
    ConfirmDialog.jsx   custom confirm modal
```

The data layers are deliberately isolated in `src/lib/store.js` and `src/lib/categories.js`. Stage 2 only needs to re-implement their functions against Supabase; the pages and components don't change.
