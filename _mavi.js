// Mavi design-system runtime — light-DOM custom elements.
// Served from https://mavi.to/_mavi.js. No deps, no shadow.

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const parseNums = (s) =>
  String(s ?? "")
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

const parseList = (s) =>
  String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────── <mavi-report> ──

class MaviReport extends HTMLElement {
  connectedCallback() {
    const eyebrow = this.getAttribute("eyebrow");
    const title = this.getAttribute("title");
    const subtitle = this.getAttribute("subtitle");
    const date = this.getAttribute("date");
    const inner = this.innerHTML;
    this.innerHTML = `
      <header>
        ${eyebrow ? `<span class="mavi-eyebrow">${esc(eyebrow)}</span>` : ""}
        ${title ? `<h1 class="mavi-display" style="margin-top:0.75rem">${esc(title)}${subtitle ? `<br><span style="color:var(--text-2);font-weight:500">${esc(subtitle)}</span>` : ""}</h1>` : ""}
      </header>
      <div class="mavi-body">${inner}</div>
      ${date ? `<footer>Generated ${esc(date)} · mavi.to</footer>` : ""}
    `;
  }
}

// ─────────────────────────────────────── <mavi-dashboard> ──

class MaviDashboard extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "MAVI";
    const nav = this.getAttribute("nav");
    const date = this.getAttribute("date");
    const inner = this.innerHTML;
    this.innerHTML = `
      <header style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--border);padding-bottom:1rem">
        <div style="display:flex;gap:2rem;align-items:baseline">
          <strong>${esc(title)}</strong>
          ${nav ? `<nav class="mavi-eyebrow" style="opacity:0.7">${esc(nav)}</nav>` : ""}
        </div>
        ${date ? `<span class="mavi-eyebrow mavi-mono">${esc(date)}</span>` : ""}
      </header>
      <mavi-bento style="margin-top:1.5rem">${inner}</mavi-bento>
    `;
  }
}

// ─────────────────────────────────────── <mavi-bento> ──
// The one layout primitive. 12-col grid with per-component default spans.
// Override via span="N" and rowspan="N" on any child.

const DEFAULT_SPAN = {
  "mavi-metric": 3,
  "mavi-bar": 6,
  "mavi-chart": 6, // overridden to 3 for type="donut" below
  "mavi-log": 6,
  "mavi-sensor-grid": 12,
  "mavi-table": 12,
  "mavi-section": 12,
  "mavi-hero": 12,
  "mavi-row": 12,
};

function spanForChild(el) {
  const s = parseInt(el.getAttribute("span") ?? "", 10);
  if (Number.isFinite(s)) return Math.max(1, Math.min(12, s));
  const tag = el.tagName.toLowerCase();
  if (tag === "mavi-chart") {
    const type = el.getAttribute("type") || "bar";
    if (type === "donut") return 3;
    return 6;
  }
  return DEFAULT_SPAN[tag] ?? 12;
}

class MaviBento extends HTMLElement {
  connectedCallback() {
    for (const child of this.children) {
      child.setAttribute("data-span", String(spanForChild(child)));
      const rs = parseInt(child.getAttribute("rowspan") ?? "", 10);
      if (Number.isFinite(rs) && rs > 1) {
        child.setAttribute("data-rowspan", String(Math.min(4, rs)));
      }
    }
  }
}

// ─────────────────────────────────────── <mavi-section> ──

class MaviSection extends HTMLElement {
  connectedCallback() {
    const eyebrow = this.getAttribute("eyebrow");
    const title = this.getAttribute("title");
    const inner = this.innerHTML;
    this.innerHTML = `
      ${eyebrow ? `<span class="mavi-eyebrow">${esc(eyebrow)}</span>` : ""}
      ${title ? `<h2>${esc(title)}</h2>` : ""}
      <div>${inner}</div>
    `;
  }
}

// ─────────────────────────────────────── <mavi-metric> ──

class MaviMetric extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const value = this.getAttribute("value") || "";
    const trend = this.getAttribute("trend");
    let dir = "";
    if (trend) {
      const t = trend.trim();
      if (t.startsWith("+")) dir = "up";
      else if (t.startsWith("-")) dir = "down";
    }
    this.innerHTML = `
      <span class="mavi-label">${esc(label)}</span>
      <span class="mavi-num">${esc(value)}</span>
      ${trend ? `<span class="mavi-trend"${dir ? ` data-dir="${dir}"` : ""}>${esc(trend)}</span>` : ""}
    `;
  }
}

// ─────────────────────────────────────── <mavi-hero> ──
// Big dotted-fill value (also supports solid attribute).

class MaviHero extends HTMLElement {
  connectedCallback() {
    const live = this.hasAttribute("live");
    const value = this.getAttribute("value") ?? this.textContent.trim();
    this.textContent = value;
    if (live) {
      const min = parseFloat(this.getAttribute("min") ?? "90");
      const max = parseFloat(this.getAttribute("max") ?? "99");
      setInterval(() => {
        if (Math.random() > 0.8) {
          this.textContent = Math.floor(rand(min, max + 1));
        }
      }, 800);
    }
  }
}

// ─────────────────────────────────────── <mavi-sensor-grid> ──

class MaviSensorGrid extends HTMLElement {
  connectedCallback() {
    const cols = parseInt(this.getAttribute("cols") ?? "32", 10);
    const rows = parseInt(this.getAttribute("rows") ?? "6", 10);
    const live = this.hasAttribute("live");
    this.style.setProperty("--cols", cols);
    const total = cols * rows;
    this.innerHTML = Array.from({ length: total })
      .map(() => `<div class="mavi-node"></div>`)
      .join("");
    if (live) {
      const nodes = this.querySelectorAll(".mavi-node");
      setInterval(() => {
        for (let i = 0; i < 15; i++) {
          const n = nodes[Math.floor(Math.random() * nodes.length)];
          if (n) n.style.opacity = rand(0.2, 1).toFixed(2);
        }
        for (let i = 0; i < 10; i++) {
          const n = nodes[Math.floor(Math.random() * nodes.length)];
          if (n) n.style.opacity = "0.1";
        }
      }, 150);
    }
  }
}

// ─────────────────────────────────────── <mavi-bar> ──

class MaviBar extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const valueAttr = this.getAttribute("value");
    const percent = parseFloat(this.getAttribute("percent") ?? valueAttr ?? "0");
    const display = valueAttr ?? `${percent}%`;
    this.innerHTML = `
      <div class="mavi-bar-head">
        <span class="mavi-label">${esc(label)}</span>
        <span class="mavi-bar-val">${esc(display)}</span>
      </div>
      <div class="mavi-bar-track">
        <div class="mavi-bar-fill" style="width:${Math.max(0, Math.min(100, percent))}%"></div>
      </div>
    `;
  }
}

// ─────────────────────────────────────── <mavi-row> ──

class MaviRow extends HTMLElement {
  connectedCallback() {
    const key = this.getAttribute("key") ?? "";
    const value = this.getAttribute("value") ?? this.textContent.trim();
    this.innerHTML = `
      <span class="mavi-row-key">${esc(key)}</span>
      <span class="mavi-row-val">${esc(value)}</span>
    `;
  }
}

// ─────────────────────────────────────── <mavi-log> ──

class MaviLog extends HTMLElement {
  connectedCallback() {
    const live = this.hasAttribute("live");
    const max = parseInt(this.getAttribute("max") ?? "25", 10);
    const initial = parseInt(this.getAttribute("initial") ?? "12", 10);
    const events = parseList(
      this.getAttribute("events") ??
        "SEQ_INIT,PACKET_DROP,SYNC_OK,MEM_FLUSH,THREAD_SPAWN,CACHE_HIT,SIG_TERM,AUTH_OK",
    );

    const push = () => {
      const t = new Date().toISOString().slice(11, 23);
      const ev = pick(events);
      const hex =
        "0x" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
      const entry = document.createElement("div");
      entry.className = "mavi-log-entry";
      entry.innerHTML = `<span class="mavi-log-ts">${esc(t)}</span><span class="mavi-log-msg">${esc(ev)} [${hex}]</span>`;
      this.prepend(entry);
      while (this.children.length > max) this.lastChild.remove();
    };

    for (let i = 0; i < initial; i++) push();
    if (live) setInterval(push, 600);
  }
}

// ─────────────────────────────────────── <mavi-chart> ──

class MaviChart extends HTMLElement {
  connectedCallback() {
    const type = this.getAttribute("type") || "bar";
    const label = this.getAttribute("label");
    const values = parseNums(this.getAttribute("values"));
    const labels = parseList(this.getAttribute("labels"));
    const highlight = parseInt(this.getAttribute("highlight") ?? "", 10);
    let svg = "";
    if (type === "donut") svg = renderDonut(values[0] ?? 0);
    else svg = renderBar(values, labels, Number.isFinite(highlight) ? highlight : -1);
    this.innerHTML = `
      ${label ? `<span class="mavi-label">${esc(label)}</span>` : ""}
      ${svg}
    `;
  }
}

function renderBar(values, labels, hi) {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const rowH = 24, gap = 4, labelW = 70, w = 320;
  const h = values.length * rowH + gap;
  const rows = values
    .map((v, i) => {
      const bw = (v / max) * (w - labelW - 10);
      const fill = i === hi ? "var(--accent)" : "currentColor";
      return `<rect x="${labelW}" y="${i * rowH + gap}" width="${bw.toFixed(1)}" height="14" fill="${fill}"/>`;
    })
    .join("");
  const texts = labels
    .map(
      (l, i) =>
        `<text x="${labelW - 8}" y="${i * rowH + gap + 11}">${esc(l)}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 ${w} ${h}" font-family="inherit" font-size="11">
    <g>${rows}</g>
    <g fill="currentColor" text-anchor="end" opacity="0.7">${texts}</g>
  </svg>`;
}

function renderDonut(percent) {
  const p = Math.max(0, Math.min(100, percent));
  const circ = 2 * Math.PI * 48;
  const filled = (circ * p) / 100;
  return `<svg viewBox="0 0 120 120" style="width:140px;height:140px">
    <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="12" opacity="0.15"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="butt"
            stroke-dasharray="${filled.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="66" text-anchor="middle" font-size="20" font-weight="600" fill="currentColor">${p}%</text>
  </svg>`;
}

// ─────────────────────────────────────── <mavi-table> ──

class MaviTable extends HTMLElement {
  connectedCallback() {
    const headers = parseList(this.getAttribute("headers"));
    const raw = this.getAttribute("rows");
    let rows = [];
    if (raw) {
      try { rows = JSON.parse(raw); } catch { rows = []; }
    } else {
      const existing = this.innerHTML.trim();
      if (existing) {
        this.innerHTML = `<table>${existing}</table>`;
        return;
      }
    }
    const numeric = (v) =>
      typeof v === "number" || /^-?[\d.,%$]+$/.test(String(v ?? ""));
    const head = headers.length
      ? `<thead><tr>${headers
          .map((h, i) => `<th${i > 0 ? ' class="mavi-num-cell"' : ""}>${esc(h)}</th>`)
          .join("")}</tr></thead>`
      : "";
    const body = `<tbody>${rows
      .map(
        (r) =>
          `<tr>${r
            .map(
              (c, i) =>
                `<td${i > 0 && numeric(c) ? ' class="mavi-num-cell"' : ""}>${esc(c)}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("")}</tbody>`;
    this.innerHTML = `<table>${head}${body}</table>`;
  }
}

// ─────────────────────────────────────── <mavi-clock> ──

class MaviClock extends HTMLElement {
  connectedCallback() {
    const ms = this.hasAttribute("ms");
    const tick = () => {
      const now = new Date();
      const t = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      this.textContent = ms
        ? `${t}.${Math.floor(now.getMilliseconds() / 100)}`
        : t;
    };
    tick();
    setInterval(tick, ms ? 100 : 1000);
  }
}

// ─────────────────────────────────────── register ──

customElements.define("mavi-report", MaviReport);
customElements.define("mavi-dashboard", MaviDashboard);
customElements.define("mavi-bento", MaviBento);
customElements.define("mavi-section", MaviSection);
customElements.define("mavi-metric", MaviMetric);
customElements.define("mavi-hero", MaviHero);
customElements.define("mavi-sensor-grid", MaviSensorGrid);
customElements.define("mavi-bar", MaviBar);
customElements.define("mavi-row", MaviRow);
customElements.define("mavi-log", MaviLog);
customElements.define("mavi-chart", MaviChart);
customElements.define("mavi-table", MaviTable);
customElements.define("mavi-clock", MaviClock);
