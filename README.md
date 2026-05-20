# Calculators — handoff bundle for Anna

Self-contained calculator components for integration into Paradise Media XenForo sites (LBP, rFactorCentral, etc.). Each calc is a paired `<name>.html` + `<name>.js`. Drop them into any XenForo Page node or static directory — no build step, no framework.

## How to integrate (XenForo)

Each calc's `<name>.html` file is structured for direct copy-paste into a XenForo Page node template:

1. **Open `<calc>/<calc>.html`** in this repo.
2. **Copy everything between** `<!-- BEGIN CALC BODY -->` and `<!-- END CALC BODY -->`. That block contains: a scoped `<style>` section, the calc markup, and the `<script>` tag.
3. **Paste into a XenForo Page node template** (Admin CP → Pages → create new page → paste into the template body).
4. **Upload `odds-math.js` and the calc's `<calc>.js`** to your server (e.g. `/js/calculators/`).
5. **Update the `<script src>` path** in the pasted block to point at the uploaded JS files (the embed payload uses a relative path like `./<calc>.js`).

All CSS is scoped under a per-calc class (e.g. `.pm-calc-odds-converter`), so styles will not bleed into the XenForo theme. The outer `<html>`/`<head>`/`<body>` in each file is for local standalone preview only — do not copy it into XenForo.

### Every calc ships with an SEO explainer

The BEGIN/END payload includes both the calc UI **and** an explainer section (intro, worked-examples table, key-concept callout, format/term reference). This is the SEO surface that ranks competitively against SBR and Wizard of Odds, which both win calculator search traffic on body copy depth rather than UX. The explainer travels with the embed so Anna doesn't have to author duplicate body copy in XenForo.

### Other integration options

- **Static directory drop-in** — host the full HTML file under `/tools/<name>/` and link from XenForo nav. No template editing required.
- **Widget** — paste the BEGIN/END block into a XenForo HTML widget for sidebar/footer placement.
- **Iframe** — `<iframe src="/tools/<name>/">` is also fine if XF iframe BBCode is enabled.

All files are framework-free vanilla JS. No npm install, no transpile.

## File layout

```
calculators/
├── README.md                  ← this file
├── package.json               ← type: module + npm test runner
├── odds-math.js               ← shared lib: format conversions + implied probability
├── tests/
│   └── odds-math.test.js      ← node-runner tests for the shared lib
└── <calc>/                    ← one folder per calculator
    ├── <calc>.html            ← UI per calc
    └── <calc>.js              ← logic per calc (imports ../odds-math.js)
```

Each calc lives in its own folder so files are easy to find and the root stays clean as the catalog grows to 24+ calcs. The shared `odds-math.js` stays at the root level; per-calc JS imports it via `../odds-math.js`.

## Audience fit by site

| Calc | LBP (igaming) | rFactorCentral (racing/sim) | Notes |
|------|---|---|---|
| Odds Converter | ✓ | ✓ | Format converter, useful for any betting market |
| Parlay | ✓ | ✓ | Sportsbook + F1/MotoGP outright betting |
| Bet / Straight Bet | ✓ | ✓ | Generic stake × odds |
| Sports Futures | ✓ | ✓ | Outright winners, F1 championship, etc. |
| Streak | ✓ |  | Bankroll-survival probability |
| French Roulette | ✓ |  | Casino |
| Baccarat | ✓ |  | Casino |
| Casino Bonus Playthrough | ✓ |  | Casino bonus EV |
| Poisson | ✓ | ✓ | Goals / lap-count modelling |
| Kelly | ✓ | ✓ | Bankroll sizing, sport-agnostic |
| Risk of Ruin (Eternal + Session) | ✓ |  | Bankroll management |
| Freeplay | ✓ |  | Free-play bonus EV |
| Half Point | ✓ |  | NFL/NBA-specific |
| Spread/ML | ✓ |  | NFL/NBA-specific |
| Round Robin | ✓ | ✓ | Multi-leg betting |
| Reverse Bets | ✓ |  | If-bet logic |
| Arbitrage | ✓ | ✓ | Cross-book arb |
| Lottery (Powerball / Mega Millions / etc.) | ✓ |  | Lottery audience |

## Calculators in this bundle

Updated as each ships:

- [x] Odds Converter
- [x] Bet / Straight Bet
- [x] Parlay
- [x] Sports Futures
- [x] Streak
- [x] French Roulette
- [x] Baccarat
- [x] Casino Bonus Playthrough
- [ ] Poisson
- [ ] Kelly
- [ ] Risk of Ruin (Eternal)
- [ ] Risk of Ruin (Session)
- [ ] Freeplay
- [ ] Half Point
- [ ] Spread/ML
- [ ] Round Robin
- [ ] Reverse Bets
- [ ] Arbitrage
- [ ] Powerball
- [ ] Mega Millions (2025 + 2017 rules)
- [ ] SuperLotto Plus
- [ ] Pick Six
- [ ] Lottery Jackpot Ticket Sales

## Running tests

```
cd calculators
node --test tests/
```

No dependencies. Uses the built-in Node test runner (Node 18+).
