# TastyGain (Base44)

Small tasty portions so you eat enough to support muscle gain. Sweet, salty, cake and candy are first-class plan items — nutritious, not a diet tracker.

Forked from NourishCare (household meal planning, Norwegian store catalogues, kitchen portions). NourishCare itself is unchanged.

| | |
|--|--|
| **GitHub** | https://github.com/WKampfisk/tastygain |
| **Base44 app** | `6a8c70e20596effd80c14869` |
| **Live site** | https://tasty-gain-80c14869.base44.app |
| **Dashboard** | https://app.base44.com/apps/6a8c70e20596effd80c14869/editor/workspace/overview |
| **Local path** | `~/base44-apps/tastygain` |

## Product

- **Today** — six small eating windows, log without scores, “bites today” counter
- **Meals** — week plan, chips for cake / candy / salty / sweet / shakes / dinners
- **Kitchen** — prepared portions, fridge/freezer
- **Shopping** — REMA, KIWI, COOP, SPAR, Bunnpris, Joker seed catalogue (NOK)
- **Tips** — eat enough with protein in the tasty food; not medical or training advice

Not a medical device. No calorie-deficit language, cheat-meal framing, or shame metrics.

## Local development

```powershell
cd $env:USERPROFILE\base44-apps\tastygain
npm install
npx base44 entities push
npm run dev
```

## Deploy

```powershell
npm run build
npx base44 deploy -y
```
