# mavi.to 🧿

Static site hosting the Mavi design system (`_mavi.css` + `_mavi.js`) and public artifacts written by the bot under `/a/<slug>/`.

## Structure

```
mavi.to/
├── _mavi.css       # design tokens + component styles
├── _mavi.js        # custom-element runtime (ES module)
├── index.html      # landing + live preview of all components
└── a/              # runtime-generated artifacts (gitignored)
```

## Local preview

```bash
cd ~/Sites/mavi-to
python3 -m http.server 8000
# open http://localhost:8000
```

## Components (v1)

All light-DOM, no shadow root, no deps.

| Tag                  | Attributes                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `<mavi-report>`      | `eyebrow`, `title`, `subtitle`, `date`                            |
| `<mavi-dashboard>`   | `title`, `nav`, `date`                                            |
| `<mavi-section>`     | `eyebrow`, `title`                                                |
| `<mavi-metric>`      | `label`, `value`, `trend` (`+X` / `-X` auto-colored), `accent`    |
| `<mavi-chart>`       | `type` (`sparkline` / `bar` / `donut`), `label`, `values`, `labels`, `highlight` |
| `<mavi-table>`       | `headers`, `rows` (JSON array of arrays) — or raw `<tr>` children |

## Minimal artifact

```html
<!doctype html>
<html data-theme="dark">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>My report</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://mavi.to/_mavi.css">
<script type="module" src="https://mavi.to/_mavi.js"></script>
</head>
<body>
<mavi-report eyebrow="REPORT" title="Hello" date="2026-04-16">
  <mavi-metric label="Users" value="1,284" accent></mavi-metric>
</mavi-report>
</body>
</html>
```

## Deploy

Forge-managed static site at `/home/forge/mavi.to/`. Option A: git-pull via Forge Quick Deploy after connecting this repo. Option B: rsync from local.
