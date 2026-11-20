# DESIGN.md

Design system for a clean, data-dense SaaS UI built with **shadcn/ui** + Tailwind.
Derived from the reference screenshots: dashboard widgets, CRM table, usage page, mobile task list, checkout cart, and health "key factors" list.

**Core idea:** a white, airy interface with soft gray "shell" surfaces, nested rounded cards, hairline borders, tiny tinted status pills, and one confident lime accent (`#9EEA6C`). Black is used for emphasis (primary buttons, active tabs, checked boxes), lime is the brand/primary color.

---

## 1. Principles

1. **Quiet surfaces, loud data.** Backgrounds stay white/near-white. Numbers, statuses and progress carry the color.
2. **Nested containers.** A gray shell wraps a white inner card (widgets, usage, cart). Depth comes from tone and 1px borders, not heavy shadows.
3. **Generous radius.** Everything is rounded: cards 20–28px, controls 12–16px, pills and avatars fully round.
4. **Tinted semantics.** Status = colored text on a ~10% tint of the same color. Never solid saturated fills for status.
5. **Light, legible type.** DM Sans at regular/medium weight. Large numerals for key metrics. JetBrains Mono for anything technical or tabular.
6. **Dark text on lime.** `#9EEA6C` is light, so text/icons on primary are always near-black, never white.

---

## 2. Typography

| Role | Family | Notes |
|---|---|---|
| Sans (default) | **DM Sans** | UI, headings, body |
| Mono | **JetBrains Mono** | IDs, credit counts, keyboard hints, code, timestamps in dense tables |


### Type scale

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `display` | 40 / 44 | 600 | Hero metric (e.g. `$66,220`) |
| `h1` | 28 / 34 | 600 | Page title ("Usage") |
| `h2` | 20 / 28 | 500 | Card/section title ("Inventory Value", "Upcoming") |
| `h3` | 16 / 24 | 500 | Row title, list item title |
| `body` | 14 / 20 | 400 | Default text, table cells |
| `body-lg` | 16 / 24 | 400 | Mobile body, cart items |
| `caption` | 12 / 16 | 500 | Pills, badges, helper text |
| `mono-sm` | 12 / 16 | 500 | Kbd chips, counts, ids |

Rules:
- Muted text (subtitles, "vs last week", table headers) uses `muted-foreground`.
- Large metrics use `tabular-nums` (`font-variant-numeric: tabular-nums`).
- Letter-spacing is default; no all-caps labels.

---

## 3. Color

### 3.1 Brand and neutrals

| Token | Hex | Use |
|---|---|---|
| `background` | `#FFFFFF` | App/page background |
| `foreground` | `#2B2B2B` | Primary text |
| `card` | `#FFFFFF` | Inner cards, popovers |
| `shell` (`secondary`) | `#F5F5F5` | Outer widget shells, hover rows, empty progress track |
| `muted` | `#F2F2F2` | Inactive stepper circles, empty streak rings, kbd chips |
| `muted-foreground` | `#6B6B6B` | Secondary text, icons |
| `subtle-foreground` | `#A3A3A3` | Disabled / faded text |
| `border` | `#EBEBEB` | 1px card and row borders |
| `input` | `#E5E5E5` | Input borders |
| `primary` | **`#9EEA6C`** | Brand, focus ring, selected accents, primary progress |
| `primary-foreground` | `#10200A` | Text/icons on primary |
| `ink` | `#111111` | High-emphasis buttons, active tab underline, checked checkbox, active stepper |

### 3.2 Primary scale (derived from `#9EEA6C`)

| Step | Hex |
|---|---|
| 50 | `#F5FDEF` |
| 100 | `#E8FAD9` |
| 200 | `#D3F5B8` |
| 300 | `#BDF08F` |
| **500 (base)** | **`#9EEA6C`** |
| 600 | `#7FD14A` |
| 700 | `#62A838` |
| 800 | `#4C802F` |
| 900 | `#3A6126` |

- Hover on primary: step 600. Pressed: step 700.
- Tinted primary backgrounds (selected row, "success" highlights): step 50 or 100.
- Primary text on white (links, small emphasis) uses step 700, since `#9EEA6C` alone fails contrast on white.

### 3.3 Semantic colors (taken from the references)

| Meaning | Text | Tint background | Seen in |
|---|---|---|---|
| Success / positive delta | `#0FA88A` | `#E7F7F3` | `+9% vs last week`, `Active` status, trend chips |
| Warning / in progress | `#F29D0B` | `#FFF4DE` | `In Progress`, amber flag |
| Danger / closed / high priority | `#F0245D` | `#FFE8EF` | `Closed`, pink flags, streak rings, "Tracking" |
| Info / link | `#1A7BFF` | `#E6F1FF` | "View all" link, Design tag |
| Accent orange | `#FF7139` | `#FFEDE5` | Target progress bar, Communications tag |
| Purple | `#7C4DFF` | `#F0EAFF` | Engineering tag |
| Sky | `#2BB4F0` | `#E5F6FD` | Logistics tag |
| Green tag | `#1FA564` | `#E4F6EC` | Product Management tag |
| Neutral tag | `#6B6B6B` | `#F2F2F2` | Marketing tag |

Category tags cycle through purple, green, info, sky, orange, pink, neutral. Assign by hash of the category name so it stays stable.

### 3.4 Gradients and patterns

- **Usage gradient bar:** `linear-gradient(90deg, #2A2BFF 0%, #8A2BE2 30%, #FF8A00 65%, #FF2D6F 100%)` for the main consumption bar.
- **Stripe overlay** on progress fills (the diagonal highlights in the Inventory and Usage bars):

```css
.progress-stripes {
  background-image: repeating-linear-gradient(
    -70deg,
    rgba(255, 255, 255, 0.28) 0 2px,
    transparent 2px 14px
  );
}
```

  Apply it on top of the fill color. The empty track is `shell` with no stripes (the Usage "remaining" track uses gray stripes).
- In this system the default progress fill is **primary**; the orange and rainbow fills are for explicit "target" or "usage" variants.

---

## 4. shadcn theme tokens

Drop into `app/globals.css` (Tailwind v4 style; for v3, move the vars into `tailwind.config` as `hsl(var(--x))`).

```css
:root {
  --radius: 1rem;

  --background: #ffffff;
  --foreground: #2b2b2b;

  --card: #ffffff;
  --card-foreground: #2b2b2b;
  --popover: #ffffff;
  --popover-foreground: #2b2b2b;

  --primary: #9eea6c;
  --primary-foreground: #10200a;

  --secondary: #f5f5f5;
  --secondary-foreground: #2b2b2b;

  --muted: #f2f2f2;
  --muted-foreground: #6b6b6b;

  --accent: #f5f5f5;
  --accent-foreground: #2b2b2b;

  --destructive: #f0245d;
  --destructive-foreground: #ffffff;

  --border: #ebebeb;
  --input: #e5e5e5;
  --ring: #9eea6c;

  /* extras */
  --ink: #111111;
  --success: #0fa88a;
  --success-bg: #e7f7f3;
  --warning: #f29d0b;
  --warning-bg: #fff4de;
  --info: #1a7bff;
  --info-bg: #e6f1ff;
  --orange: #ff7139;

  --chart-1: #9eea6c;
  --chart-2: #111111;
  --chart-3: #ff7139;
  --chart-4: #7c4dff;
  --chart-5: #2bb4f0;
}

@theme inline {
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ink: var(--ink);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);

  --radius-sm: calc(var(--radius) - 6px);  /* 10px */
  --radius-md: calc(var(--radius) - 4px);  /* 12px */
  --radius-lg: var(--radius);              /* 16px */
  --radius-xl: calc(var(--radius) + 4px);  /* 20px */
  --radius-2xl: calc(var(--radius) + 12px);/* 28px */
}
```

Dark mode is out of scope for v1. If added, keep `primary` unchanged and invert neutrals.

---

## 5. Shape, spacing, elevation

### Radius

| Element | Radius |
|---|---|
| Outer widget shell | 28px (`rounded-2xl`) |
| Inner card | 20px (`rounded-xl`) |
| Buttons, inputs, filter chips | 12–14px (`rounded-md`/`rounded-lg`) |
| Progress bars | 12px (full height rounded ends) |
| Pills, badges, avatars, step circles, day rings | `rounded-full` |
| Product image tile | 20px |
| Checkbox | 6px |

### Spacing

- 4px base unit. Common steps: 4, 8, 12, 16, 20, 24, 32, 48.
- Widget shell padding: 8px around the inner card; inner card padding: 24px.
- Table row height: 56px (desktop), cell padding 16px horizontal.
- Page max content width for settings/usage pages: ~1100px, centered.

### Elevation

- **Default:** no shadow. Separation comes from `border` (1px `#EBEBEB`) and the gray shell.
- **Floating controls** (quantity stepper, mobile bottom nav, round back button): `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06)`.
- **Dashed placeholder cards** ("Plan today's…" slot): `border: 1px dashed #D4D4D4`, no fill.

---

## 6. Iconography

- Outline icons, 1.5px stroke, 20px default (16px inline, 24px nav). Use **lucide-react** (ships with shadcn).
- Filled glyphs only for emphasis moments: flag priority, heart (Recovery), moon (Sleep), flame (streak), active nav icon.
- Icon color: `muted-foreground` by default, `foreground` when active.
- Illustrations (courier scooter, flame) are flat, slightly glossy 3D-ish style with orange/pink/blue. Use sparingly for empty states and delivery.

---

## 7. Components

### 7.1 Widget card (shell + inner)

The signature pattern: a `shell` container wrapping a white `card` with a hairline border.

```tsx
<section className="rounded-2xl bg-secondary p-2">
  <header className="flex items-center justify-between px-4 py-3">
    <h2 className="text-xl font-medium">Inventory Value</h2>
    <InfoIcon className="size-5 text-muted-foreground" />
  </header>
  <div className="rounded-xl border bg-card p-6">{/* content */}</div>
</section>
```

Variants:
- **Header-in-card** (Upcoming, Daily streak): header is its own bordered white card with a 40px rounded icon tile (`bg-secondary`), title (h2) and muted subtitle; body is a second white card below, separated by a small gap on the gray shell.
- Optional trailing action: "View all ↗" (info color) or a `…` menu button.

### 7.2 Metric / stat

- Hero number: `display` size, weight 600, `tabular-nums`.
- Delta line: positive in `success` + `muted-foreground` label ("`+9%` vs last week"). Negative uses `destructive`.
- **Stat tiles** (Usage page): white rounded-xl tile, value (24/32, 500) top-left, trend chip top-right (`success-bg` pill with up-right arrow icon + percent), muted label below.

### 7.3 Progress bar

- Height 40–48px for hero bars, 8–12px for inline bars. Fully rounded ends.
- Filled segment + gap (6–8px) + empty track in `shell`. Both segments have rounded ends (segmented look, not a clipped overflow).
- Fill: primary by default; orange for "target" progress; gradient for usage consumption. Add the stripe overlay for hero bars.
- Legend below: colored dot (with inner white dot for target), label, value right-aligned, optional edit pencil.

```tsx
<div className="flex gap-2">
  <div className="progress-stripes h-12 rounded-xl bg-primary" style={{ flexBasis: `${pct}%` }} />
  <div className="h-12 flex-1 rounded-xl bg-secondary" />
</div>
```

### 7.4 Buttons

| Variant | Style |
|---|---|
| Primary (brand) | `bg-primary text-primary-foreground`, hover `primary-600`, radius 12px, h-10, px-4, weight 500 |
| Ink (high emphasis) | `bg-ink text-white`, pill or 12px radius, icon-left allowed ("+ Add company") |
| Secondary | white, 1px border, `foreground` text ("Manage plan", "Change") |
| Ghost | transparent, hover `secondary` |
| Icon | 40px circle or rounded-xl, white, 1px border, floating shadow (back button) |
| Link | `info` color, optional trailing external icon |

Focus: 2px ring in `primary` with 2px offset. Use **Ink** for the single most important action per screen when it sits on busy data views, and **Primary** for brand moments (CTAs, selected states, success).

### 7.5 Inputs, search, kbd

- Search field: white, 1px border, radius 14px, leading search icon, muted placeholder, trailing **kbd chip** (`⌘K`) in `muted` background with `mono-sm`.
- Date range picker: bordered white button with calendar icon, value, chevron-down.
- Filter chips: `Label: **Value** ▾`, label muted, value `foreground` weight 500, 1px border, radius 14px, h-10.

### 7.6 Tabs

- Underline tabs: active label `foreground` weight 500 with a 2px `ink` underline; inactive `muted-foreground`.
- Optional count badge after label: `muted` pill, `mono-sm`, px-2 (e.g. `All 238`).
- Leading icon allowed (Agents, Team members).

### 7.7 Data table

- Header row: `muted-foreground`, 14px, weight 500, with sort chevron (filled caret) after sortable labels.
- 1px `border` between rows, no zebra, no outer border on dense pages (or a card wrapper with 20px radius on the Usage page).
- Select-all checkbox shows indeterminate (black square with dash); row checkboxes are 20px rounded-md; **checked = `ink` fill with white check**.
- Owner column: 32px avatar + name.
- Stage/category: tinted pill (section 7.8).
- Status: tinted pill (success/warning/danger).
- Numeric columns left-aligned in these references. Use `tabular-nums`; use `font-mono` for large credit/ID values if desired.
- Relative times ("2 minutes ago") in `foreground`, lighter weight.
- Row hover: `secondary` at 50%.

### 7.8 Pills / badges

- Height 24–28px, px-3, `rounded-full`, 12–14px, weight 500.
- Colors always come in pairs (text + tint) from section 3.3, e.g. `Active` = `#0FA88A` on `#E7F7F3`.
- Add a subtle 1px border in a 20% tint for tags on white tables.

### 7.9 Task / list rows

- **Upcoming list:** priority flag (filled; pink = high, amber = medium) + truncated title (ellipsis) + clock icon with time + circular progress ring with percent. Rows separated by 1px `border`.
- **Mobile todo list:** section header (`h3`, muted) + count badge. Row = status icon + title (16px, 500) + meta line (small outline icon + muted category).
  - Status icons are dashed circles: **Todo** = dark dashed ring on light fill; **Backlog** = light gray dashed ring.
  - Lower items fade out toward the bottom (gradient mask) when partially hidden behind the nav.
- **Circular progress ring:** 20px, stroke 3px, color follows priority (pink/amber/gray at low), track `muted`, percent text next to it.

### 7.10 Streak

- Header: flame illustration + "9 Day Streak" (h1-ish, 600).
- Divider hairline.
- Seven day columns: label (`Mon`…`Sun`, muted for future days), 44px circle.
  - Done: `danger` ring (4px) with white center and check icon in the same color.
  - Not done / future: `muted` ring, empty.
- Use primary instead of pink for done days if the streak should read as brand-colored.

### 7.11 Stepper (checkout)

- Numbered circles 44px. **Active:** `ink` fill, white number. **Inactive:** `muted` fill, `muted-foreground` number.
- Label right of the circle (active in `foreground`, inactive muted). Connector is a short 1px line in `border`.
- Steps: `1 Cart — 2 Delivery — 3 Payment`.

### 7.12 Cart item and delivery card

- **Delivery card:** `secondary` fill, radius 24px, illustration left, bold time ("25–35 min", 24/32, 600), muted subtitle, white pill "Change" button right.
- **Cart row:** 96px image tile (`#F4F4F4`, radius 20px) with product photo, title (h3), muted modifiers ("Oat milk, less ice"), **quantity stepper** pill (white, floating shadow, `−` and `+` in muted, quantity centered 500), price right-aligned (600).
- Rows separated by a 1px divider.

### 7.13 Mobile bottom navigation

- Floating pill, white with soft shadow, inset from screen edges, home-indicator bar beneath.
- 4 items: Home, Projects, Inbox, Profile. Icon (24px) over 12px label.
- **Active item:** sits in an elevated `secondary` pill with bold label and filled icon in `foreground`. Inactive: outline icon and `muted-foreground` label.
- Tint the active pill with `primary-100` as the brand variant.

### 7.14 Sidebar (desktop, collapsible)

- Based on the shadcn `sidebar-07` layout: `SidebarProvider` + `SidebarInset`.
- White (`card`) sidebar with a 1px `border`; 16rem expanded, 3rem icon rail collapsed.
- Header: dark rounded brand tile + “Smart Park” + subtitle, as a link home.
- Content: grouped nav (`Visão geral`, `Gestão`) using `SidebarMenuButton` with
  `tooltip` in icon mode.
- Active item: soft lime tint (`primary-50`), `primary-200` border, `primary-900` text.
- Footer: compact operator block with avatar and role.
- Header bar: `SidebarTrigger`, vertical separator, breadcrumb, and notification button.
- Use `SidebarRail` on the edge and the provider’s cookie-backed state for persistence;
  `Ctrl/Cmd+B` toggles the sidebar.

### 7.15 Key-factor rows (health)

- Leading 40px filled glyph (heart, moon) in `ink` or gray gradient for inactive.
- Title (h3), optional status label with small pulse icon in `danger` ("Tracking…").
- Sub-line: metric label muted + live dot (pink dot in a pink-tinted ring) + value (e.g. `HRV • 62 ms`, `Sleep 7h 42m`) in `mono-sm`.
- Pending / empty slots use the dashed placeholder card.

### 7.16 Top bar / breadcrumb

- Breadcrumb: home icon, `/` in `subtle-foreground`, current page with icon in `foreground`.
- Right side: notification bell in a white rounded-xl button with a small red/blue dot, avatar (40px), chevron.
- 1px bottom border; page background `#FAFAFA`-to-white (use `background` `#FFF` for content, `shell` for chrome).

---

## 8. Layout

- **Desktop:** collapsible white sidebar → top bar → content. Content uses a 12-column grid, 24px gutters. Widgets sit in 2- or 4-up grids; tables span full width.
- **Mobile:** single column, 16–20px side padding, sticky floating bottom nav, 20–24px radius containers.
- Section rhythm: 32px between major blocks, 16px between related controls.
- Dense pages (CRM table) keep the header controls in one row: tabs → filters → view toggle (List | Board, segmented control with white selected state).

---

## 9. Interaction and motion

- Durations: 120ms (hover/press), 200ms (expand, tab change), 300ms (progress fill).
- Easing: `cubic-bezier(0.2, 0, 0, 1)`.
- Progress fills animate width on mount. Streak circles pop in with a 150ms scale from 0.9.
- Hover: rows → `secondary/50`; buttons → one step darker; icon buttons → `secondary`.
- Focus-visible: 2px `primary` ring everywhere. Never remove outlines.
- Respect `prefers-reduced-motion`.

---

## 10. Accessibility

- Body text contrast ≥ 4.5:1: `#2B2B2B` on white passes; `muted-foreground` `#6B6B6B` on white passes (5.3:1).
- `#9EEA6C` on white is ~1.6:1: **never** use it for text or thin icons on white. Use it for fills and use `primary-700` for text.
- Text on `#9EEA6C` is `#10200A` (≈ 13:1).
- Status is never color-only: pair with text labels (Active, Closed) and icons.
- Hit targets ≥ 40px on mobile (44px for stepper, nav, quantity controls).
- Tables: real `<table>` semantics, `aria-sort` on sortable headers, labeled checkboxes.

---

## 11. shadcn component mapping

| UI piece | shadcn component | Customization |
|---|---|---|
| Widget shell/card | `Card` | Add `bg-secondary p-2 rounded-2xl` wrapper; inner `rounded-xl border` |
| Buttons | `Button` | Add `ink` variant; primary uses dark foreground |
| Search, date, filters | `Input`, `Popover`, `Calendar`, `Select` | 14px radius, kbd chip slot |
| Tabs | `Tabs` | Underline style, count `Badge` |
| Table | `Table` + TanStack Table | Sort carets, indeterminate header checkbox |
| Pills | `Badge` | Variants: `success`, `warning`, `danger`, `info`, `neutral`, plus category colors |
| Checkbox | `Checkbox` | Checked = `ink` |
| Progress | `Progress` | Segmented + stripe variant |
| Avatar | `Avatar` | 32/40px |
| Stepper | custom | Built from `Button`-like circles |
| Toggle (List/Board) | `ToggleGroup` | White selected pill on `secondary` track |
| Dropdown `…` | `DropdownMenu` | Default |
| Tooltip (info icon) | `Tooltip` | Default |

---

## 12. Do / Don't

**Do**
- Nest white cards in gray shells; keep borders at 1px `#EBEBEB`.
- Use tinted pills for every status and category.
- Keep one primary action per view; use `ink` or `primary` for it.
- Use `font-mono` for numbers people compare or copy (credits, IDs, ⌘K).

**Don't**
- Don't put white text on `#9EEA6C`.
- Don't add heavy shadows, gradients on cards, or colored card borders.
- Don't use more than two accent colors in one widget.
- Don't mix radius scales within the same card.
