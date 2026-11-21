# DESIGN.md

Design system for **Smart Park**, a light, data-dense parking SaaS with two surfaces:

- **Desktop admin** — dashboard, tables, forms, operation flows.
- **Consumer / mobile** — auth, driver area, and future checkout or payment flows.

The component language is shared across both. Its clearest reference is a mobile
checkout screen (cart → delivery → payment): neutral canvas, a light gray info strip,
media tiles, pill controls, black active states, and one decisive bottom action. Those
patterns scale up into the desktop admin rather than staying mobile-only.

**Core idea:** a white, airy interface with soft gray "shell" surfaces, nested rounded
cards, hairline dividers, tiny tinted status pills, and one confident lime accent
(`#9EEA6C`). **Lime is the primary brand color**: the default button, selection
accents, focus ring, progress and brand moments. **Ink (`#111111`) is the terminal
action** (pay, confirm, finish), the active step and every mobile sticky bar. The
checkout reference is the neutral base for the whole project, desktop included:
surfaces stay neutral so lime accents and the ink action stand out.

> **Source of truth**
>
> - Design tokens: `web/packages/ui/src/styles/globals.css`
> - Shared primitives: `web/packages/ui/src/components/` (Base UI + CVA)
> - App compositions: `web/apps/web/src/components/`
> - Fonts: DM Sans Variable, JetBrains Mono Variable (`@fontsource-variable/*`)
> - Icons: Hugeicons (`@hugeicons/core-free-icons` + `@hugeicons/react`)
> - Light-only. Do not add dark-mode variants.
>
> App code uses semantic tokens (`bg-secondary`, `text-muted-foreground`), never raw hex.

---

## 0. Pattern adoption map

Every pattern visible in the mobile reference has a system-wide equivalent. Build the
pattern once, then adapt its density — do not fork it per screen.

| Reference element | System pattern | Desktop admin | Mobile / consumer |
|---|---|---|---|
| Round back / overflow buttons | **Icon action** (`Button size="icon-lg"`, circular, floating shadow) | Header actions, notifications | Screen header, 44px circles on the 24px edge |
| `1 Cart — 2 Delivery — 3 Payment` | **Stepper** (28–32px circles, short hairline connectors) | Wizard header, multi-step dialogs | Full-width step row, `justify-between` |
| Light gray delivery strip | **Info strip** (illustration sits directly on the strip, no tile) | Active session / status summary | ETA, booking, payment summary |
| Product row with image | **Media row** (tile · title + overflow · meta · control + price) | Table row with leading thumb | Stacked row |
| `Iced matcha latte •••` | **Row overflow** (bare muted dots, no circle) | `TableActions` / dropdown | Dropdown trigger top-right of row |
| `− 1 +` quantity pill | **Stepper control** (white pill, floating shadow) | Inline numeric control | Pill, bottom-left of media row |
| `$6.50` bottom-right | **Row value** aligned with the control, not with the title | Right-aligned numeric column | Bottom row, right |
| White "Change" pill | **Pill action** | Inline edit / change button | Trailing action in info strip |
| Gray product tile | **Media thumb** | 32–40px icon tile in tables | 88px tile |
| `You might also like ›` | **Section header with action** (bare chevron, no circle) | “Ver todos” link in card header | Bare chevron ghost button |
| Recommendation cards + `+` | **Card rail** (tile left, add circle right, title + meta below) | 2/4-up shortcut grid | Horizontal snap rail with a peeking next card |
| Content fading under the bar | **Bottom fade mask** | — | White gradient above the sticky bar |
| Black `Total — Continue to delivery →` bar | **Sticky action bar** (label names the next step) | Sticky form footer inside the card | Fixed bottom bar |
| Fully neutral cart | **Neutral-first surfaces** | Default for all data views | Default for all flows |

Rule of thumb: **the mobile version compresses, the desktop version expands**. Same
hierarchy, same tokens, same interaction semantics.

---

## 1. Principles

1. **Quiet surfaces, loud data.** Backgrounds stay white/near-white. Numbers, statuses
   and progress carry the color.
2. **Neutral first, one decisive action.** Most of a screen is grayscale. Reserve
   **lime** for the primary action, selection, focus and progress, and **ink** for the
   terminal action (pay, confirm, finish) and the active step.
3. **Nested containers.** A gray shell wraps a white inner card. Depth comes from tone
   and 1px borders, not heavy shadows. On mobile the same idea is the light gray info
   strip and rail cards; list rows sit directly on white.
4. **Pills for controls, circles for elevated icon actions, rounded rectangles for
   surfaces.** Quantity steppers, “Change” actions and status badges are pills.
   Header back/overflow and add buttons are floating circles. Quiet affordances
   (row overflow dots, “see all” chevrons) are bare ghost icons with no circle.
   Cards and inputs are rounded rectangles.
5. **Hairlines, not boxes.** Separate rows with 1px `border` and generous vertical
   rhythm. Avoid one bordered card per field or per row.
6. **Generous radius.** Shells 28px, cards 20px, media tiles 20px, controls 12px,
   pills/circles fully round.
7. **Tinted semantics.** Status = colored text on a ~10% tint of the same color. Never
   solid saturated fills for status.
8. **Light, legible type.** DM Sans at regular/medium weight; semibold only for screen
   and section titles. Row titles and prices are medium (500), not bold. JetBrains
   Mono for technical or tabular values.
9. **Dark text on lime.** `#9EEA6C` is light, so text/icons on primary are always
   near-black, never white.
10. **Mobile patterns scale up.** A media row becomes a table row; a card rail becomes
    a grid; a sticky bar becomes a card footer. Never keep thumb-sized chrome on
    desktop, and never drop a desktop table into mobile without recomposing it.
11. **Two alignment lines on mobile.** Surfaces and controls (header circles, info
    strip, dividers, sticky bar) sit on the **24px edge**. Content (stepper, media
    tiles, text, section titles, prices) sits on the **32px content edge**, i.e. 8px
    inside the surface edge. Keep both consistent on every screen.
12. **The action names the next step.** The sticky CTA says where it goes (“Continuar
    para pagamento”), not just “Continuar”.

---

## 2. Typography

| Role | Family | Notes |
|---|---|---|
| Sans (default) | **DM Sans** | UI, headings, body |
| Mono | **JetBrains Mono** | IDs, plates, credit counts, keyboard hints, code, dense timestamps |

### Type scale

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `display` | 40 / 44 | 600 | Hero metric on desktop (e.g. `R$ 66.220`) |
| `h1` | 28 / 34 | 600 | Desktop page title (“Vagas”, “Pagamentos”) |
| `screen-title` | 17 / 24 | 600 | Mobile screen title (“Seu carrinho”) |
| `metric-md` | 20 / 26 | 600 | Info-strip value (“25–35 min”), compact metrics |
| `h2` | 17 / 24 mobile, 20 / 28 desktop | 600 | Card/section title (“Você também pode gostar”) |
| `item` | 16 / 24 | 500 | Media-row title, rail card title, row price |
| `h3` | 16 / 24 | 500 | Row title in dense admin lists |
| `body` | 14 / 20 | 400 | Default text, table cells |
| `meta` | 13 / 18 | 400 | Row modifiers, subtitles, strip captions (muted) |
| `stepper-label` | 13 / 18 | 500 | Step labels |
| `bar-label` | 15 / 20 | 500 | Sticky bar CTA, bar total |
| `caption` | 12 / 16 | 500 | Pills, badges, helper text, bar caption |
| `mono-sm` | 12 / 16 | 500 | Kbd chips, plate/ID values |

Rules:

- Muted text (subtitles, “vs last week”, table headers, modifiers) uses
  `muted-foreground`.
- Metrics and prices use `tabular-nums`.
- **Media rows:** the title sits top-left with the overflow dots top-right; the
  **price sits on the bottom row, right-aligned with the quantity control**. Do not
  put the price on the title line.
- Letter-spacing is default; no all-caps labels.
- Truncate long titles (`truncate`) and keep the trailing value from shrinking
  (`shrink-0`).

---

## 3. Color

### 3.1 Brand and neutrals

| Token | Hex | Use |
|---|---|---|
| `background` | `#FFFFFF` | App/page background |
| `foreground` | `#2B2B2B` | Primary text |
| `card` | `#FFFFFF` | Inner cards, popovers, list surfaces |
| `shell` (`secondary`) | `#F5F5F5` | Outer widget shells, inset info strips, hover rows |
| `muted` | `#F2F2F2` | Media tiles, inactive step circles, kbd chips |
| `muted-foreground` | `#6B6B6B` | Secondary text, icons |
| `subtle-foreground` | `#A3A3A3` | Disabled / faded text, row overflow dots |
| `border` | `#EBEBEB` | 1px card, row and divider lines |
| `input` | `#E5E5E5` | Input and checkbox borders |
| `primary` | **`#9EEA6C`** | Brand, primary button, selected accents, focus ring, progress |
| `primary-foreground` | `#10200A` | Text/icons on primary |
| `ink` | `#111111` | Active step, terminal CTA / sticky bar, selected segmented filter, checked checkbox/radio/switch, brand tile |

**Surface ladder.** Use these in order; do not invent extra grays.

1. `background` — page canvas.
2. `card` — content surface (white).
3. `secondary` — outer shell or inset strip on white.
4. `muted` — media tile, inactive control, empty track (one step darker than shell).
5. `border` — only lines, never a fill.

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
- Selected rows and completed steps: step 50/100 with step 700/900 text.
- Primary text on white uses step 700; `#9EEA6C` alone fails contrast on white.

### 3.3 Semantic colors

| Meaning | Text | Tint background | Seen in |
|---|---|---|---|
| Success / positive | `#0FA88A` | `#E7F7F3` | `Ativo`, `Pago`, positive deltas |
| Warning / in progress | `#F29D0B` | `#FFF4DE` | `Ocupada`, `Pendente` |
| Danger / closed / error | `#F0245D` | `#FFE8EF` | `Bloqueada`, destructive actions |
| Info / link | `#1A7BFF` | `#E6F1FF` | Hints, informational badges |
| Accent orange | `#FF7139` | `#FFEDE5` | Target progress |
| Purple | `#7C4DFF` | `#F0EAFF` | Category tags |
| Sky | `#2BB4F0` | `#E5F6FD` | Category tags |
| Green tag | `#1FA564` | `#E4F6EC` | Category tags |
| Neutral tag | `#6B6B6B` | `#F2F2F2` | Default badge |

Category tags cycle through the palette. Assign by hash of the category name so colors
stay stable across renders.

### 3.4 Neutral dominance

The checkout reference contains **no brand color at all**: black active step, black
CTA, light gray strip, gray tiles, white floating controls. Apply that discipline
everywhere:

- A typical admin screen is 90% neutral. Lime appears only in the primary button,
  selected nav item, focus ring, progress fill, or success badge.
- A consumer flow may be fully neutral except for one lime brand mark. If the flow
  ends in a payment/booking action, make that bar **ink**, not lime.
- Never fill a whole card, list row, or sticky bar with lime.
- Keep at most two accent colors per widget.

### 3.5 Gradients and patterns

- **Usage gradient bar:** `linear-gradient(90deg, #2A2BFF 0%, #8A2BE2 30%, #FF8A00 65%, #FF2D6F 100%)`.
- **Stripe overlay** on hero progress fills:

```css
.progress-stripes {
  background-image: repeating-linear-gradient(
    -70deg,
    rgba(255, 255, 255, 0.28) 0 2px,
    transparent 2px 14px
  );
}
```

- Default progress fill is **primary**; orange and rainbow are explicit variants.
- No gradients on cards, headers, bars or buttons.
- The only other allowed gradient is the **bottom fade mask**: a white-to-transparent
  scrim above a mobile sticky bar so scrolling content dissolves instead of being cut
  (see 7.13).

---

## 4. Theme tokens

Tokens live in **`web/packages/ui/src/styles/globals.css`** and are exposed through
Tailwind v4 `@theme inline`. Do not redefine them in an app stylesheet or inline.

Key groups already defined there:

- Canvas/text: `background`, `foreground`, `card`, `popover`
- Brand: `primary` + 50/100/200/300/500/600/700/800/900
- Surfaces: `secondary`, `muted`, `muted-foreground`, `subtle-foreground`, `accent`
- Emphasis/feedback: `ink`, `destructive`, `danger`, `success`, `warning`, `info`,
  `orange`, `purple`, `sky`, `green-tag` (+ `*-bg` tints)
- Structure: `border`, `input`, `ring`
- Navigation: `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-accent`,
  `sidebar-border`, `sidebar-ring`
- Data viz: `chart-1`…`chart-5`
- Elevation: `shadow-floating`, `shadow-bar` (see section 5)

### Radius scale

`--radius: 1rem` (16px). Tailwind maps:

| Utility | Value | Use |
|---|---|---|
| `rounded-sm` | 10px | Small chips, kbd |
| `rounded-md` | 12px | Buttons, inputs, controls |
| `rounded-lg` | 16px | Rail media, compact cards |
| `rounded-xl` | 20px | Cards, tables, media tiles, info strips, list surfaces |
| `rounded-2xl` | 28px | Outer shells, dialogs, sticky bars |
| `rounded-3xl` | 36px | Large consumer/hero surfaces only |
| `rounded-full` | 9999px | Pills, circles, steppers, avatars, badges |

Dark mode is out of scope. The `dark` variant is intentionally inert.

---

## 5. Shape, spacing, elevation

### Radius by element

| Element | Radius |
|---|---|
| Outer widget shell / sticky action bar | 28px (`rounded-2xl`) |
| Inner card, table card, info strip | 20px (`rounded-xl`) |
| Cart/list media tile | 20px (`rounded-xl`) |
| Rail card | 20px (`rounded-xl`) |
| Rail media tile | 16px (`rounded-lg`) |
| Buttons, inputs, filter chips | 12px (`rounded-md`) |
| Pills, badges, avatars, step circles, icon buttons | `rounded-full` |
| Checkbox | 6px (`rounded-[6px]`) |

### Spacing

- 4px base unit. Common steps: 4, 8, 12, 16, 20, 24, 32, 48.
- **Mobile alignment lines:** surface/control edge = **24px**; content edge = **32px**
  (24 + 8). Header circles, info strip, dividers and sticky bar start at 24px; stepper,
  tiles, titles, modifiers and prices align to 32px.
- **Desktop content padding:** 24–32px; page content max width ~1440px.
- **Shell padding:** 8px around the inner card; inner card padding 24px.
- **Media row padding:** 24px vertical, 8px horizontal inside the 24px edge. Table rows
  stay at 56px height, 16px cell padding.
- **Mobile vertical rhythm (from the reference):**
  - header → stepper: 24px
  - stepper → info strip: 24px
  - info strip → first row: 32px
  - row ↔ divider ↔ row: 24px each side
  - last divider → section header: 32px
  - section header → rail: 20px
- **Desktop rhythm:** 32px between major blocks; 16px between related controls; 24px
  between a header and its first block.
- **Sticky bar offset:** inset 24px left/right (same as the surface edge), 16px above
  the safe area; content needs ≥112px bottom padding plus
  `env(safe-area-inset-bottom)`.

### Elevation

- **Default:** no shadow. Separation comes from `border` (1px `#EBEBEB`) and the gray
  shell. Cards, tiles and rail cards use `shadow-none`.
- **Floating controls** use the `shadow-floating` utility (promoted from the arbitrary
  value because it now appears on header circles, the quantity pill, the Change pill
  and add circles):

```css
@theme inline {
  --shadow-floating: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-bar: 0 12px 32px rgba(0, 0, 0, 0.18);
}
```

  Floating controls are always **white with a 1px hairline border** plus
  `shadow-floating`.
- **Sticky action bar:** `shadow-bar` on ink; never on light bars.
- **Dialogs:** the primitive's `shadow-lg`; overlays use `bg-black/10` plus optional
  backdrop blur.
- **Dashed placeholder card:** `border border-dashed border-border`, no fill, no
  shadow.

---

## 6. Iconography

- Outline icons, **2px stroke**, 16px inline, 20px default, 24px navigation.
- Import from `@hugeicons/core-free-icons` and render with
  `HugeiconsIcon` from `@hugeicons/react`. Do not mix in another icon set.
- Icon color: `muted-foreground` by default, `foreground` when active,
  `primary` only for a deliberate brand moment.
- Header back/overflow icons are `foreground`; quantity `−`/`+`, add `+`, “see all”
  chevrons are `muted-foreground`; row overflow dots are `subtle-foreground`.
- Icon-only buttons are always labeled with `aria-label`. Elevated actions (header,
  add) are circular; quiet affordances (row dots, chevrons) are bare ghost icons.
- Filled glyphs only for emphasis: active nav item, priority flag, notification dot.
- Illustrations (the scooter, product photos) are flat, slightly glossy 3D, about 44px
  tall in info strips, placed directly on the strip. Use them only in consumer empty
  states and info strips; admin screens use outline icons. For Smart Park, use a
  car/ticket/barrier illustration where the reference shows the scooter.

```tsx
<HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} className="size-5" />
```

---

## 7. Components

### 7.1 Surface stack and widget card

The signature pattern: a `secondary` shell wrapping a white card with a hairline
border. The admin pages already use it for tables:

```tsx
<section className="rounded-2xl bg-secondary p-2">
  <div className="rounded-xl border border-border bg-card">
    {/* table, form or content */}
  </div>
</section>
```

For a titled widget:

```tsx
<section className="rounded-2xl bg-secondary p-2">
  <header className="flex items-center justify-between px-4 py-3">
    <div>
      <h2 className="text-xl leading-7 font-semibold">Sessões ativas</h2>
      <p className="text-sm text-muted-foreground">Atualizado agora</p>
    </div>
    <Button variant="ghost" size="icon-sm" aria-label="Ver todas">
      <HugeiconsIcon icon={ArrowRight01Icon} className="text-muted-foreground" />
    </Button>
  </header>
  <div className="rounded-xl border border-border bg-card p-6">{/* content */}</div>
</section>
```

Rules:

- One shell per widget; never nest shell inside shell.
- Cards are white and flat. Do not add colored borders, gradients or shadows.
- On mobile, the shell can be dropped entirely (the reference has none): rows sit on
  the white canvas separated by hairlines, and only the info strip and rail cards
  carry a surface.

### 7.2 Page / screen header

**Desktop** uses `PageHeader`:

```tsx
<PageHeader
  title="Tickets"
  description="Abertura e encerramento de sessões."
  actions={<Button>Abrir ticket</Button>}
/>
```

**Mobile** uses a screen header with circular icon actions. Back and overflow are
44px circles on the 24px edge: white, hairline border, floating shadow. The title block
sits 16px after the back button; the overflow button is pinned to the right edge.
Title is 17/24 semibold, subtitle is `meta` muted.

```tsx
<header className="flex items-center gap-4 px-6 pt-4 pb-6">
  <Button
    variant="outline"
    size="icon-lg"
    className="rounded-full bg-card shadow-floating"
    aria-label="Voltar"
  >
    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-5" />
  </Button>
  <div className="min-w-0 flex-1">
    <h1 className="truncate text-[17px] leading-6 font-semibold">Seu carrinho</h1>
    <p className="truncate text-[13px] leading-[18px] text-muted-foreground">Estacionamento Central</p>
  </div>
  <Button
    variant="outline"
    size="icon-lg"
    className="rounded-full bg-card shadow-floating"
    aria-label="Mais opções"
  >
    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-5" />
  </Button>
</header>
```

Use one primary action per header. On desktop that action is a lime button (ink only for terminal actions); on
mobile it moves into a sticky bar (7.13).

### 7.3 Section header with action

The reference's `You might also like ›` is the standard “section + see all” pattern.
Title is `h2` (17/24 semibold on mobile), subtitle is `meta` muted, and the trailing
action is a **bare chevron**: a ghost icon button with a muted icon, no circle, no
border, no shadow, vertically centered on the title block. On desktop it may be an
info-colored link instead.

```tsx
<div className="flex items-center justify-between gap-3 px-8">
  <div className="min-w-0">
    <h2 className="text-[17px] leading-6 font-semibold">Você também pode gostar</h2>
    <p className="text-[13px] leading-[18px] text-muted-foreground">Popular entre outros clientes</p>
  </div>
  <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Ver todos">
    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
  </Button>
</div>
```

### 7.4 Metric / stat and info strip

- Hero number (desktop): `display` size, weight 600, `tabular-nums`.
- Delta line: positive in `success`, negative in `destructive`, label in
  `muted-foreground` (“`+9%` vs last week”).
- **Stat tiles:** white `rounded-xl` tile with a 1px border; value 24–32px/500 at
  top-left, trend chip top-right (`success-bg` pill with arrow + percent), muted label
  below.
- **Info strip** (the checkout ETA strip) is the compact metric variant:
  `rounded-xl bg-secondary`, 16px vertical / 20px horizontal padding, the
  **illustration directly on the strip (no tile behind it)**, value in `metric-md`,
  caption in `meta` muted, and a trailing white **Change pill** with floating shadow.
  It spans the 24px surface edges.

```tsx
<div className="mx-6 flex items-center gap-4 rounded-xl bg-secondary px-5 py-4">
  <img src={sessionIllustration} alt="" className="size-11 shrink-0 object-contain" />
  <div className="min-w-0 flex-1">
    <p className="text-xl leading-[26px] font-semibold tabular-nums">1h 20min</p>
    <p className="text-[13px] leading-[18px] text-muted-foreground">Tempo da sessão atual</p>
  </div>
  <Button
    variant="outline"
    className="h-11 rounded-full bg-card px-5 text-[15px] font-medium shadow-floating"
  >
    Alterar
  </Button>
</div>
```

### 7.5 Stepper and progress

**Stepper** (generalized from `Cart — Delivery — Payment`). Use it for any multi-step
flow: opening a ticket, closing and paying, onboarding.

- Circles **28px** on mobile, 32px on desktop (the reference circles are noticeably
  smaller than the header buttons).
- **Active:** `bg-ink text-white`; **completed:** `bg-primary-100 text-primary-900` with a
  check icon; **upcoming:** `bg-muted text-muted-foreground`.
- Numbers 13/500 `tabular-nums`. Labels `stepper-label` 13/18/500; active in
  `foreground`, others muted. Label sits 10px right of its circle.
- Connector: a **short 1px hairline** (`border`), about 18px wide with 16px of space on
  each side. It is not animated.
- The row spans the content width (32px edges) with `justify-between`.
- Semantics: `<ol>` with `aria-current="step"`.

```tsx
<ol className="flex items-center justify-between px-8" aria-label="Etapas">
  {steps.map((step, index) => (
    <li
      key={step}
      className="flex items-center"
      aria-current={index === current ? "step" : undefined}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-[13px] font-medium tabular-nums lg:size-8",
          index === current && "bg-ink text-white",
          index < current && "bg-primary-100 text-primary-900",
          index > current && "bg-muted text-muted-foreground",
        )}
      >
        {index < current ? (
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
        ) : (
          index + 1
        )}
      </span>
      <span
        className={cn(
          "ml-2.5 text-[13px] leading-[18px] font-medium",
          index === current ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {step}
      </span>
      {index < steps.length - 1 ? (
        <span className="mx-4 h-px w-[18px] bg-border" aria-hidden />
      ) : null}
    </li>
  ))}
</ol>
```

**Progress bar:** height 40–48px for hero bars, 8–12px inline; fully rounded. Filled
segment + 6–8px gap + empty `secondary` track, both with rounded ends. Primary fill by
default; stripe overlay only on hero bars. A `Progress` component is **not installed** —
build it from `div`s.

### 7.6 Buttons and icon actions

`Button` is a Base UI button with CVA variants:

| Variant | Style | Use |
|---|---|---|
| `default` | lime fill, `primary-foreground` text | **Primary action** (create, save, add, submit) |
| `ink` | `bg-ink text-white` | Terminal/commit action (pay, confirm, finish), every mobile sticky bar |
| `outline` | white, 1px border | Secondary actions, “Change” pills, floating circles |
| `secondary` | gray fill | Inline/compact actions |
| `ghost` | transparent, hover `secondary` | Bare icon actions (row dots, chevrons), row actions |
| `destructive` | danger text on danger tint | Deactivate/remove |
| `link` | primary-700 underlined | Text links |

Sizes: `xs` 28px, `sm` 32px, `default` 40px, `lg` 44px, `icon` 40px circle,
`icon-xs` 24px, `icon-sm` 32px, `icon-lg` 44px. Radius is 12px for rectangular
buttons and full for `icon-*`.

- One filled CTA per view region. It is **lime** for ordinary primary actions and
  **ink** for terminal/commit actions (pay, confirm, finish) and every mobile sticky
  bar. If a view has an ink action, it is the only filled button.
- Floating circles and pills combine `variant="outline"`, `bg-card` and
  `shadow-floating`.
- Icon-only buttons must be labeled.
- When rendering a link, Base UI uses `render` (not `asChild`) and the button must set
  `nativeButton={false}`:

```tsx
<Button nativeButton={false} variant="ink" render={<Link to="/admin" />}>
  Ir para o painel
</Button>
```

### 7.7 Inputs, selects, search, kbd

- Inputs: `h-10`, `rounded-md`, 1px `input` border, white background, 2px
  `ring-ring/60` on focus, `aria-invalid` border/ring in danger.
- Textareas: same border/radius, min 3 rows.
- **Selects:** there is no Select primitive installed. Use the native `<select>` via
  `SelectField` from `@/components/forms/form-fields`; style matches `Input`.
- Search: white, 1px border, radius 12px, leading icon, muted placeholder, optional
  trailing kbd chip (`muted`, `mono-sm`).
- Filter chips: `Label: **Value** ▾`, muted label, foreground value, 1px border,
  radius 12px, h-10.
- Helper text sits below the field in `caption`/muted; errors in `text-danger`.

### 7.8 Tabs and segmented filters

There is **no Tabs primitive installed**. Two supported patterns:

1. **Segmented filter buttons** (used on Tickets): a row of pill `Button`s
   (`rounded-full`), active =
   `variant="ink"`, inactive = `variant="outline"`, size `sm`.
2. **Underline tabs** only if a Tabs primitive is added later: active label
   `foreground`/500 with a 2px ink underline; inactive muted; optional count pill in
   `muted` + `mono-sm`.

Never style the active filter with lime text on white.

### 7.9 Data table

Implemented by the app-level `DataTable`, wrapped in the shell/card pattern.

- Header row: `muted-foreground`, 14px, weight 500, sort icon after sortable labels
  (`opacity-40` idle, 100 when active). `aria-sort` is set on `<th>`.
- Rows: 1px `border` separators, no zebra, hover `bg-secondary/50`.
- Numeric columns use `tabular-nums`; plates/IDs use `font-mono`.
- Leading identity cell may use a 32–40px `muted` tile with an icon, mirroring the
  mobile media row.
- Status and category cells use `StatusBadge` (7.14).
- Loading: skeleton rows inside the same table. Error: `ErrorState`. Empty:
  `EmptyState` with a dashed border and optional action.
- Footer: `Pagination` with range text, first/prev/next/last buttons, and the page-size
  select when `onPageSizeChange` is wired. Pagination is never hidden for small
  datasets; it communicates totals.
- Actions column is right-aligned (`headerClassName="text-right"`) and uses
  `TableActions` (bare ghost icons or the overflow dots, never circled) or a pill action (7.11).

### 7.10 Media rows (list rows)

The checkout product row is the base pattern for any record with an identity, a
description, a control and a value. Use `flex`, not a new card per row.

**Mobile anatomy** (left to right, top to bottom):

1. **Tile:** 88px `muted` square, `rounded-xl`, content centered (photo, or a 24px
   outline icon when there is no image).
2. **Top line:** title (`item`, medium, truncated) on the left, **row overflow**
   (bare ghost `icon-xs`, three dots, `subtle-foreground`) on the right.
3. **Meta line:** modifiers or description in `meta`, muted.
4. **Bottom line:** inline control (quantity pill, status badge) on the left,
   **price right-aligned on the same line** (`item` size, medium, `tabular-nums`,
   `shrink-0`).

- Row padding: 24px vertical, 8px horizontal inside the 24px edge, so tiles and
  prices land on the 32px content edge.
- Dividers: `divide-y divide-border` on the list, inset to the 24px surface edge —
  never per-row cards.
- **Desktop table:** the same hierarchy becomes a row: leading thumb, identity,
  metadata, control/status, right-aligned numeric value, trailing actions.

```tsx
<ul className="mx-6 divide-y divide-border">
  <li className="flex gap-4 px-2 py-6">
    <div className="flex size-[88px] shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
      <HugeiconsIcon icon={Car01Icon} strokeWidth={2} className="size-6" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-base leading-6 font-medium">HB20 · Prata</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="-mr-1 text-subtle-foreground"
                aria-label="Mais opções do ticket"
              />
            }
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
          </DropdownMenuTrigger>
          {/* DropdownMenuContent */}
        </DropdownMenu>
      </div>
      <p className="text-[13px] leading-[18px] text-muted-foreground">Sessão aberta há 1h 20min</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <StepperControl value={1} min={1} max={10} onChange={setValue} />
        <span className="shrink-0 text-base leading-6 font-medium tabular-nums">R$ 6,50</span>
      </div>
    </div>
  </li>
</ul>
```

### 7.11 Pill controls

Three reusable shapes, all built from `Button` + semantic tokens:

1. **Quantity stepper** — the `− 1 +` pill. White, **36px tall** (`h-9`), `rounded-full`,
   1px border, `shadow-floating`, ghost circular buttons inside, muted `−`/`+` glyphs,
   value 16/500 `tabular-nums` in `foreground` with `aria-live="polite"`. Visually
   compact, but the touch targets still reach 44px via an invisible hit area
   (`after:absolute after:-inset-1`). Disable at bounds.
2. **Change pill** — white `rounded-full` outline button, 44px tall, label 15/500,
   `shadow-floating`. Use for “Alterar” (space, tariff, vehicle) on a gray strip.
3. **Add circle** — 40px circular outline button, white, `shadow-floating`, muted `+`.
   Always `aria-label="Adicionar …"`. In rail cards it sits **beside** the media tile,
   not on top of it.

```tsx
function StepperControl({ value, min = 0, max = 99, onChange }: StepperControlProps) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-border bg-card p-0.5 shadow-floating">
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative size-8 rounded-full text-muted-foreground after:absolute after:-inset-1"
        aria-label="Diminuir"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} className="size-4" />
      </Button>
      <span className="min-w-8 text-center text-base font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative size-8 rounded-full text-muted-foreground after:absolute after:-inset-1"
        aria-label="Aumentar"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
      </Button>
    </div>
  );
}
```

### 7.12 Card rail

The recommendation rail becomes any horizontal collection: quick actions, recent
vehicles, shortcuts.

- **Card:** ~168px wide, white, 1px border, `rounded-xl`, **16px padding**, `snap-start`.
- **Top row:** media tile (72px square, `rounded-lg`, `bg-muted`) on the left and the
  **add circle** (40px) on the right, `justify-between`. The circle never overlays
  the tile.
- **Below:** title `item` (16/500, truncated) 12px under the row, then meta/price in
  `meta` muted.
- **Rail:** starts at the 32px content edge, 12px gap, bleeds off the right edge, and
  is sized so about **10px of the next card peeks** to signal scrolling. Native scroll
  with hidden scrollbar; the page itself never scrolls horizontally.
- The lower part of the rail fades under the sticky bar (see 7.13).
- **Desktop adaptation:** convert the rail to a 2- or 4-column grid; do not keep a
  horizontal scroller unless the content is genuinely open-ended.

```tsx
<section className="space-y-5">
  {/* SectionHeader from 7.3 */}
  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pr-8 pl-8 pb-2 [scrollbar-width:none]">
    {items.map((item) => (
      <article
        key={item.id}
        className="w-[168px] shrink-0 snap-start rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex size-[72px] items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-6 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-10 rounded-full bg-card text-muted-foreground shadow-floating"
            aria-label={`Abrir ${item.title}`}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
        <h3 className="mt-3 truncate text-base leading-6 font-medium">{item.title}</h3>
        <p className="text-[13px] leading-[18px] text-muted-foreground">{item.meta}</p>
      </article>
    ))}
  </div>
</section>
```

### 7.13 Sticky action bar

The black `Total — Continue to delivery →` bar is the system's **sticky
summary/action** pattern.

- **Mobile:** fixed, inset **24px** left/right (the surface edge), at least 16px above
  the safe area, `rounded-2xl`, `bg-ink`, white text, **min height 60px**, 20px left
  padding, 16px right padding. Left: total (`bar-label`, 15–16/500 `tabular-nums`)
  with a 12px caption at 60% white (“Total • Impostos inclusos”). Right: CTA label
  `bar-label` with an arrow, **naming the next step** (“Continuar para pagamento”).
  Shadow: `shadow-bar`.
- **Bottom fade mask:** a `pointer-events-none` white-to-transparent gradient (~128px
  tall) sits behind the bar so scrolled content fades out underneath it, as in the
  reference.
- **Desktop:** do not float over content. Pin it to the bottom of the form card
  (`sticky bottom-0` inside the card) or use a card footer with the same hierarchy.
- Content needs bottom padding (≥112px mobile) and `scroll-padding-bottom` so nothing
  is hidden behind the bar.
- One sticky bar per screen. Never combine it with a floating bottom nav at the same
  time.
- The CTA is ink/white, not lime. Lime may appear only in the arrow or a progress
  accent.

```tsx
<>
  <div
    aria-hidden
    className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-background via-background/85 to-transparent"
  />
  <div className="fixed inset-x-6 bottom-0 z-30 pb-[max(1rem,env(safe-area-inset-bottom))]">
    <div className="flex min-h-[60px] items-center gap-4 rounded-2xl bg-ink py-2.5 pr-4 pl-5 text-white shadow-bar">
      <div className="min-w-0">
        <p className="text-base leading-6 font-medium tabular-nums">R$ 11,40</p>
        <p className="text-xs text-white/60">Total • Impostos inclusos</p>
      </div>
      <Button
        variant="ghost"
        className="ml-auto h-11 shrink-0 rounded-full px-3 text-[15px] font-medium text-white hover:bg-white/10 hover:text-white"
      >
        Continuar para pagamento
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
      </Button>
    </div>
  </div>
</>
```

### 7.14 Pills and badges

`StatusBadge` is the only badge implementation (no `Badge` primitive installed).

- Height 24px, `px-3`, `rounded-full`, 12px/500.
- Tones: `neutral`, `brand`, `success`, `warning`, `danger`, `info`.
- Colors always pair text + tint (3.3); add a 1px border at ~20% for tags on white.
- Status is never color-only; include the label (`Ativo`, `Pendente`, `Bloqueada`).

### 7.15 Forms and dialogs

- Standard form dialog: `FormDialog` (Base UI `Dialog`, centered, `rounded-2xl`,
  overlay `bg-black/10` with `supports-backdrop-filter:backdrop-blur-xs`, close button
  top-right).
- Destructive confirmation: `ConfirmDialog` with `variant="destructive"`; explain that
  soft-deleted records disappear from lists.
- Fields: `TextField`, `TextAreaField`, `SelectField`, `CheckboxField`, `FormError`
  from `@/components/forms/form-fields`.
- Field errors are inline, 12px danger text; API errors appear as a `FormError` block
  at the top of the form.
- Submit disabled while pending; show a spinner in the submit button.
- The primary submit is `default` (lime), or `ink` for terminal/commit actions;
  cancel is `outline` or `ghost`.
- On mobile, prefer a full-screen sheet for long forms with the Stepper under the
  screen header; on desktop keep the centered dialog.
- Checkbox: 20px, 6px radius, checked = `ink` fill with white check.
- Multi-step forms use the Stepper (7.5) inside the dialog header.

### 7.16 Empty, error, loading

- **Empty:** `EmptyState` — dashed 1px border, centered icon in a muted tile, title
  `h3`, muted description, optional action. Use the secondary shell around it when it
  replaces a table.
- **Error:** `ErrorState` with retry. Never leave a blank region.
- **Loading:** `Skeleton` rows inside tables; mobile media rows use an 88px tile
  skeleton plus two text lines; `Loader` for route transitions; `PageSkeleton` for
  whole pages. No spinners centered on empty pages.
- Empty-state illustrations follow section 6 (flat, sparse).

### 7.17 Navigation

**Sidebar (desktop)** — `@web/ui/components/sidebar` via `admin-shell.tsx`:

- `SidebarProvider` + `SidebarInset`; white sidebar, 1px border.
- 16rem expanded, 3rem icon rail; `SidebarRail` on the edge; cookie-backed state and
  `Ctrl/Cmd+B`.
- Header: 32px `rounded-lg bg-ink` brand tile with lime icon + “Smart Park” + subtitle.
- Groups: `Visão geral`, `Gestão`; `SidebarMenuButton` with tooltip in icon mode.
- Active item: `bg-primary-50`, `border-primary-200`, `text-primary-900`, filled icon;
  inactive items use outline icons and `muted-foreground`.
- Footer: compact operator block with avatar and role; dropdown for “Minha área” and
  “Sair”.

**Bottom navigation (mobile)** — floating white pill, inset 24px, `shadow-floating`,
4 items max. Icon 24px over a 12px label. Active item sits in a `secondary` pill with a
filled icon and bold label; inactive uses outline icons + muted labels. Do not show it
on screens that already have a sticky action bar.

### 7.18 Top bar / breadcrumb

- 64px height, bottom 1px border, `background` fill, sticky.
- Left: sidebar trigger, vertical separator, breadcrumb (home / current, current in
  `foreground`).
- Right: notification icon button (40px circle, white, 1px border, `shadow-floating`)
  with a danger dot; optional avatar.
- On mobile, collapse the breadcrumb to a single back affordance and move the page
  title into the screen header (7.2).

### 7.19 Auth screens

`AuthLayout`: centered card on `secondary`, max ~1000px, split into a lime-tinted
brand panel (`primary-50`, flat illustration, desktop only) and the form column. Brand tile is ink with a lime icon.
Form width ~360px, social login (Google) separated by a labeled divider, one primary
(lime) submit button. On mobile the brand panel disappears and the logo moves above the form.

### 7.20 Specialized widgets

- **Streak:** flame + “9 Day Streak”, hairline divider, 7 day columns; done = primary-100
  circle with a primary-900 check, future = muted ring.
- **Key-factor rows:** 40px filled glyph tile, title, status line with pulse, metric
  value in `mono-sm`. Pending slots use the dashed placeholder card.
- **Ticket/payment rows:** apply the media-row pattern (7.10); plate in `font-mono`,
  status via `StatusBadge`, duration in the meta line, value on the bottom row,
  `tabular-nums`.

---

## 8. Layout

### Desktop admin

- Collapsible sidebar → 64px top bar → content.
- Content max width 1440px, padding 24–32px, 12-column grid with 24px gutters.
- Widgets in 2- or 4-up grids; tables span full width.
- Header controls stay in one row: title/actions, then tabs → filters → view toggle.
- Forms are centered cards or dialogs, max ~640px.

### Mobile consumer

Canonical order, exactly as in the reference:

1. Screen header (circles on the 24px edge)
2. Stepper (content edge)
3. Info strip (surface edge)
4. Media rows separated by hairlines
5. Section header with bare chevron
6. Card rail with a peeking card
7. Bottom fade mask + sticky action bar

- Single column; 24px surface edge, 32px content edge; 24–32px section rhythm
  (see section 5).
- Full-bleed dividers may extend to the 24px edge; keep text aligned to 32px.
- Sticky bar is the last element in the visual hierarchy, not an extra card.
- Safe area: `pb-[max(1rem,env(safe-area-inset-bottom))]`; never place a control under
  the home indicator.

### Responsive rules

- Media rows stay rows; only the tile size and control placement change.
- Tables become media rows below `md`; do not horizontally scroll an entire page.
- Card rails become grids at `lg`.
- Sticky bottom actions become card footers at `lg`.
- Header circles stay 44px on touch, 40px on desktop; the quantity pill stays 36px
  visually with a 44px touch area.

---

## 9. Interaction and motion

- Durations: 120ms (hover/press, quantity change), 200ms (expand, step/tab change),
  300ms (progress fill).
- Easing: `cubic-bezier(0.2, 0, 0, 1)`.
- Steps animate color/background only; the connector does not animate.
- Quantity value may scale 0.95→1 over 120ms; avoid layout shift.
- Card rails use native scroll with `snap-x`; no JS carousel required.
- Sticky bar may fade/slide in on scroll (200ms), but must never cover the focused
  field; scroll the focused element into view above it.
- Row hover: `secondary/50`; icon buttons: `secondary`; primary: one step darker.
- Focus-visible: 2px `primary` ring (`ring-ring/60`), never removed.
- Respect `prefers-reduced-motion`.

---

## 10. Accessibility

- Body text ≥ 4.5:1: `#2B2B2B` on white; `muted-foreground` `#6B6B6B` on white passes.
- `subtle-foreground` (`#A3A3A3`) is decorative only (row overflow dots, disabled
  text); never use it for information-bearing text.
- Never use lime for text/icons on white; use `primary-700`.
- Text on lime is `#10200A` (≈13:1). Text on ink is white; the bar caption at 60%
  white must stay ≥ 4.5:1 on `#111111`.
- Status always includes a label, not just color.
- Icon buttons: `aria-label`, ≥40px desktop / 44px touch. Visually smaller controls
  (the 36px quantity pill, 28px step circles that are not interactive) extend their
  hit area to 44px.
- Stepper: `<ol>`, `aria-current="step"`, visible step numbers.
- Quantity stepper: labeled decrement/increment, `aria-live="polite"` value, disabled
  bounds.
- Prices: use `formatCurrency` (`Intl.NumberFormat` pt-BR/BRL); include the currency in
  the accessible name, not just the symbol.
- Sticky bars: content bottom padding + `scroll-padding-bottom` so focused controls
  are never obscured. Do not trap focus in a non-modal bar. The fade mask is
  `aria-hidden` and `pointer-events-none`.
- Horizontal rails: keyboard reachable, no hover-only actions, no page-level
  horizontal scroll.
- Tables: real `<table>`, `aria-sort`, labeled checkboxes.
- Dialogs: Base UI handles focus trap/escape; keep `disablePointerDismissal` while a
  mutation is pending.

---

## 11. Implementation map

### Shared primitives — `web/packages/ui/src/components/`

| UI need | File | Notes |
|---|---|---|
| Buttons, icon actions | `button.tsx` | Base UI + CVA; variants `default`, `ink`, `outline`, `secondary`, `ghost`, `destructive`, `link` |
| Text input | `input.tsx` | h-10, 12px radius, focus ring |
| Textarea | `textarea.tsx` | Same border/radius |
| Checkbox | `checkbox.tsx` | 20px, 6px radius, checked = ink |
| Labels | `label.tsx` | Pair with field ids |
| Cards | `card.tsx` | `rounded-xl`, 1px border, `shadow-none` |
| Dialogs | `dialog.tsx` | Base UI; centered, `rounded-2xl`, overlay blur |
| Dropdown | `dropdown-menu.tsx` | Base UI; wrap labels/items in `DropdownMenuGroup`; used for row overflow |
| Sidebar | `sidebar.tsx` | shadcn-style, Base UI; icon collapse |
| Sheet | `sheet.tsx` | Mobile full-screen forms |
| Empty | `empty.tsx` | Primitives used by `EmptyState` |
| Skeleton | `skeleton.tsx` | Loading rows |
| Toasts | `sonner.tsx` | `Toaster richColors` in `__root.tsx` |
| Tooltip | `tooltip.tsx` | Info icons, collapsed nav |
| Avatar / Breadcrumb / Separator | `avatar.tsx`, `breadcrumb.tsx`, `separator.tsx` | Navigation and identity |

**Not installed:** `Tabs`, `Select`, `Badge`, `Progress`, `ToggleGroup`, `Table`.
Use the approved substitutes in section 12 instead of adding a new dependency
casually.

### App compositions — `web/apps/web/src/components/`

| Pattern | File | Notes |
|---|---|---|
| Page header | `page-header.tsx` | 28/34 title, muted description, actions slot |
| Data table | `data-table.tsx` | Shell/card, sorting, skeleton, empty, footer |
| Pagination | `pagination.tsx` | Spring `Page` shape, page-size select |
| Status pill | `status-badge.tsx` | 6 tones, 24px, full radius |
| Row actions | `table-actions.tsx` | Edit/delete ghost buttons; mobile uses the overflow dots |
| Form dialog | `form-dialog.tsx` | Submit/cancel, pending state |
| Confirm dialog | `confirm-dialog.tsx` | Destructive variant |
| Form fields | `forms/form-fields.tsx` | `TextField`, `TextAreaField`, `SelectField` (native select), `CheckboxField`, `FormError` |
| TanStack form bindings | `forms/tanstack-fields.tsx` | `useForm` field adapters, touched/server error display, `aria-describedby` |
| Validation | `lib/validation.ts` | Zod Standard Schema validators, numeric coercion, cross-field rules |
| Empty state | `empty-state.tsx` | Dashed border, icon, action |
| Error state | `error-state.tsx` | Retry affordance |
| Loading | `loader.tsx`, `page-skeleton.tsx` | Route and page fallbacks |
| Admin shell | `layout/admin-shell.tsx` | Sidebar, top bar, user menu |
| Auth layout | `auth/auth-layout.tsx` | Split brand/form panel |

### Base UI conventions

- `render` replaces `asChild`:
  `render={<Link to="…" />}`.
- A `Button` rendering a link needs `nativeButton={false}`.
- Controlled overlays use `open` / `onOpenChange` (see `FormDialog`).
- `disablePointerDismissal={isPending}` prevents closing during mutations.
- Use `data-slot`/`data-*` state attributes already exposed by the primitives
  (`data-active`, `data-checked`, `data-open`) instead of ad-hoc state classes.

### Applying the mobile reference to Smart Park

- **Driver area:** screen header (“Seu ticket” + lot name), stepper, info strip
  (active session time + “Alterar” for vehicle), media rows (vehicle/ticket), card rail
  of shortcuts (add vehicle, history), and a sticky bar “Total • Continuar para
  pagamento”.
- **Admin mobile/tablet:** collapse tables into media rows; keep desktop density at
  `md+`.
- **Ticket flow:** stepper `Abrir → Encerrar → Pagar`; ticket row mirrors a cart line
  (plate tile, entry time in the meta line, duration/status control and value on the
  bottom row).
- **Dashboard:** card rail for shortcuts/recent activity; stat tiles for occupancy
  and revenue; info strip for the active session summary.
- **Forms:** use the sticky action bar only on mobile; on desktop pin the footer inside
  the card.

**Suggested extraction order** (build with existing primitives, in
`web/apps/web/src/components/patterns/` once a pattern has a second real use):

1. `ScreenHeader` — circular back/overflow + title/subtitle.
2. `Stepper` — steps for ticket open → close → pay and for onboarding.
3. `InfoStrip` — illustration + metric + caption + Change pill.
4. `StepperControl` — quantity pill for future counters and adjustments.
5. `MediaRow` — plate/vehicle/ticket identity rows with overflow menu; desktop tables
   reuse its thumb.
6. `SectionHeader` — title/subtitle + bare chevron action.
7. `CardRail` — dashboard shortcuts and consumer recommendations.
8. `StickyActionBar` — mobile form/payment footer with fade mask; desktop card-footer
   variant.

Until a pattern is extracted, compose it inline with `Button`, `Card`, semantic
tokens and Hugeicons; do not introduce a parallel styling system.

---

## 12. Do / Don't

**Do**

- Nest white cards in gray shells on desktop; keep borders at 1px `#EBEBEB`.
- Use tinted pills for every status and category.
- Use lime for the primary action and selection accents; use ink for the terminal
  action and the active step.
- Use floating white circles for header back/overflow and add actions; use bare ghost
  icons for row dots and “see all” chevrons.
- Use media rows for anything with an identity + metadata + control + value, with the
  value on the bottom row.
- Align surfaces to the 24px edge and content to the 32px content edge on mobile.
- Use `tabular-nums` and `font-mono` for values people compare or copy.
- Keep one primary action per view; one sticky bar per mobile screen; label it with the
  next step.
- Fade scrolled content under the sticky bar with the white gradient mask.
- Give sticky bars and floating controls a soft shadow (`shadow-floating`,
  `shadow-bar`); keep cards flat.

**Don't**

- Don't put white text on `#9EEA6C`.
- Don't fill cards, rows or the sticky bar with lime.
- Don't use more than two accent colors in one widget.
- Don't mix radius scales within the same card.
- Don't wrap every row in its own bordered card; use dividers.
- Don't put the price on the title line of a media row.
- Don't put the add circle on top of the rail tile, and don't circle the “see all”
  chevron.
- Don't use bold (600+) for row titles or prices; medium is the ceiling.
- Don't keep desktop tables unchanged on mobile.
- Don't float a sticky bar over desktop tables.
- Don't make all actions pills; reserve pills for inline controls and true badges.
- Don't add heavy shadows, gradients on cards, or colored card borders.
- Don't circle quiet affordances (row dots, chevrons).

---

## 13. Extending the system to components not in the reference

The reference shows about ten patterns. Everything else (tables, every button variant,
forms, overlays, charts, empty states) is **derived** from them with the rules below.
If a component is not specified in section 7, derive it with 13.2; do not invent new
shapes, grays, radii, shadows or type sizes.

### 13.1 Role map: which token does which job

| Job | Token / style |
|---|---|
| Page canvas | `background` |
| Content surface | `card` + 1px `border` |
| Inset / grouping surface (strips, shells) | `secondary`, no border |
| Media tile, inactive control, empty track | `muted` |
| Hairline / divider | `border` (lines only, never a fill) |
| Input and checkbox border | `input` |
| Primary action, selection accent, brand | `primary` (lime) with `primary-foreground`; tints `primary-50/100` with `primary-700/900` text |
| Terminal action, active step, sticky bar, checked controls | `ink` with white |
| Secondary action | `outline`: white, 1px `border` |
| Quiet / tertiary action | `ghost` |
| Destructive | `destructive`: danger text on danger tint |
| Status and category | tint pairs from 3.3 |
| Secondary text and icons | `muted-foreground` |
| Disabled or decorative text | `subtle-foreground` |
| Focus | 2px `ring` (`ring-ring/60`) |

### 13.2 Derivation algorithm

For any new component, decide in this order:

1. **Classify it:** surface, control, row/list, data display, overlay, feedback or
   navigation.
2. **Pick the shape:** surface → rounded rectangle from the radius ladder (shell 28,
   card 20, control 12); inline control or badge → pill; elevated icon action → circle;
   quiet icon action → bare ghost icon. A nested radius is the outer radius minus the
   padding between them (shell 28, padding 8, inner card 20).
3. **Pick the fill** from the surface ladder (3.1). Never add a new gray.
4. **Pick the border** with 13.4.
5. **Pick the elevation:** flat by default; `shadow-floating` only for a control that
   floats above content; `shadow-bar` only for the ink sticky bar; overlays use the
   primitive's `shadow-lg`.
6. **Pick the color role** from 13.1. Neutral first; lime and ink are accents.
7. **Pick the type token** from section 2. Do not introduce new sizes or weights.
8. **Pick the spacing** from 13.3. Stay on the 4px grid.
9. **Define the states** with 13.6.
10. **Desktop vs mobile:** mobile compresses, desktop expands; same hierarchy and
    tokens (section 0 rule of thumb).
11. **Run the checklist** in section 14.

### 13.3 Spacing system

| Context | Value |
|---|---|
| Control height | 28 / 32 / 40 / 44 (`xs` / `sm` / `default` / `lg`) |
| Button horizontal padding | `xs` 10, `sm` 12, `default` 16, `lg` 20 |
| Icon ↔ label gap | 8px (6px in `xs`/`sm`) |
| Related controls (button groups, chips) | 8–12px |
| Label → field → helper text | 6–8px / 6px |
| Between form fields | 16–20px (24px between field groups) |
| Card padding | 24px desktop, 20px strip, 16px rail/compact card |
| Shell padding | 8px |
| Table row height | 56px comfortable, 44px dense; header row 48px; cell padding 16px horizontal |
| Mobile media row | 24px vertical, 8px horizontal inside the 24px edge |
| Toolbar above a table | controls 40px high, 12px gap, 16–24px to the table |
| Dialog | 24px padding; 16px header → body; 24px body → footer; 12px between footer buttons |
| Section gap | 32px; header → first block 24px |
| Page padding | desktop 24–32px; mobile 24px surface edge / 32px content edge |

Every value is a multiple of 4. If a design needs an off-grid number, round to the
nearest step instead.

### 13.4 Borders and dividers

- **Default line:** 1px solid `border` (`#EBEBEB`). Never 2px, except the focus ring.
- **Where a border goes:** white on white (cards, rail cards, floating controls,
  popovers, toasts) gets one. Gray on white (info strip, shell, `muted` tile) gets
  none.
- **Inputs:** 1px `input` at rest; hover darkens to `subtle-foreground`; focus keeps the
  border and adds the 2px ring; invalid uses danger border and ring.
- **Dividers:** horizontal only, between rows and sections, inset to the surface edge
  on mobile. Tables use row separators only: no vertical cell borders, no zebra, no
  second outer border (the card already has one).
- **Dashed:** only for placeholders, empty states and drop zones.
- **Never:** colored card borders, 2px borders, a border plus a heavy shadow, one box
  per row, borders around bare ghost icon buttons.
- **Radius follows the element** (section 5); border radius always equals the element
  radius.

### 13.5 Buttons: variants × states

| Variant | Rest | Hover | Pressed | Disabled |
|---|---|---|---|---|
| `default` (lime) | `bg-primary` / `primary-foreground` text | `primary-600` | `primary-700` | `bg-muted`, `text-subtle-foreground` |
| `ink` | `bg-ink` / white | `bg-foreground` | `#000000` | `bg-muted`, `text-subtle-foreground` |
| `outline` | `bg-card`, 1px `border` | `bg-secondary` | `bg-muted` | border kept, `text-subtle-foreground` |
| `secondary` | `bg-secondary` | `bg-muted` | `bg-muted` | `text-subtle-foreground` |
| `ghost` | transparent | `bg-secondary` | `bg-muted` | `text-subtle-foreground` |
| `destructive` | `text-danger` on `danger-bg` | tint one step darker | tint two steps darker | `bg-muted`, `text-subtle-foreground` |
| `link` | `text-primary-700`, underline | `primary-800` | `primary-900` | `text-subtle-foreground` |

- **Sizes:** `xs` 28px / 12px text, `sm` 32px / 13px, `default` 40px / 14px medium,
  `lg` 44px / 15px medium. Rectangular buttons use 12px radius; `icon-*` buttons and
  pill contexts (Change pill, filter pills, quantity pill) are fully round.
- **Shadow:** none, except floating circles and pills (`shadow-floating`) and the ink
  sticky bar (`shadow-bar`).
- **Loading:** a spinner replaces the leading icon, the width stays fixed, the button
  is disabled.
- **Hierarchy in a view region:** one filled CTA (lime or ink, see 7.6), the rest
  `outline` or `ghost`. In footers the cancel button sits left of the primary; on
  desktop the pair is right-aligned.
- **Icon-only:** always `aria-label`; elevated ones are circles, quiet ones are bare
  ghost icons.

### 13.6 Interactive states (all components)

- **Hover:** `secondary` fill (`secondary/50` on table rows).
- **Pressed:** `muted` fill.
- **Selected:** `primary-50` fill, `primary-200` border where a border exists, label in
  `primary-900`. Checkbox, radio and switch use `ink` when on, `muted` when off.
- **Focus-visible:** 2px `ring-ring/60` on every focusable element, never removed.
- **Disabled:** `subtle-foreground` text, `muted` fill for filled controls, no shadow,
  `pointer-events-none`. Do not use opacity hacks.
- **Loading:** `Skeleton` in the target shape, or a spinner inside the control.
- **Error:** danger border and ring plus a 12px danger message below the field.
- **Motion:** section 9.

### 13.7 Recipes for components not in the reference

| Component | Recipe |
|---|---|
| **Data table** | Shell + card (7.1). Header row 48px on `card`, `muted-foreground` 14/500, no gray header fill. Rows 56px (44px dense) with a 1px `border` bottom, hover `secondary/50`, selected `primary-50`. Numbers right-aligned, `tabular-nums`; plates and IDs in `font-mono`. Optional 32–40px `muted` leading tile. Trailing actions are bare ghost icons or overflow dots. Footer: `Pagination`, 56px, top border. Toolbar above: search, filter chips, then the primary button on the right. |
| **Pagination** | Range text left; `outline` `icon-sm` circles (no shadow) for first/prev/next/last; page-size select on the right. |
| **Tabs / segmented filters** | Pill buttons per 7.8: active `ink`, inactive `outline`. |
| **Dropdown / select menu** | `card`, 1px `border`, `rounded-xl`, 4px padding, `shadow-lg`; items 36px high, `rounded-lg`, hover `secondary`; checked item shows a check; destructive item in danger text. |
| **Popover** | Same surface as the dropdown with 16px padding. |
| **Tooltip** | `ink` background, white 12px text, `rounded-md`, 8px/6px padding. |
| **Toast** | `card`, 1px `border`, `rounded-xl`, `shadow-floating`; leading icon in the semantic color. |
| **Alert / banner** | Info-strip shape: `rounded-xl`, tone tint background (or `secondary` for neutral), icon left, no border, 16px/20px padding. |
| **Accordion / collapsible** | Hairline-separated rows, 24px vertical padding, bare chevron on the right; no card per item. |
| **Avatar** | Circle 32 or 40px, `muted` fill, initials 12/500; image avatars have no border. |
| **Checkbox / radio / switch** | 20px controls; on = `ink` with white mark; off = white with `input` border (switch off track = `muted`). |
| **Date picker / calendar** | Popover surface; selected day is an `ink` circle with white text; today has a 1px ring; ranges fill `secondary`. |
| **Charts** | Flat fills from `chart-1…5`, gridlines in `border`, axis labels 12px `muted-foreground`, tooltip uses the popover surface, no gradient fills. |
| **Skeleton** | `muted` blocks matching the target radius, `animate-pulse`. |
| **Sheet / drawer** | White, `rounded-t-2xl` on mobile, 36×4px `muted` grab handle, screen padding rules (24px / 32px). |
| **File drop zone** | `rounded-xl`, 1px dashed `border`, hover `secondary`, centered icon in a `muted` tile. |
| **Timeline / activity list** | Media-row pattern with an 8px status dot instead of a tile; hairline separators. |

### 13.8 Density

- **Comfortable** (mobile, consumer flows, cards): the sizes in the reference.
- **Compact** (admin tables and toolbars on desktop): 44–56px rows, 14/13px text,
  `sm` controls.

Density only changes size and spacing. Radius, colors, borders and hierarchy never
change between densities.

### 13.9 When in doubt

Prefer fewer boxes and more hairlines, fewer colors and more neutral, one filled
action, and the same radius as the nearest sibling. Ask: could this screen sit next
to the checkout reference without looking like another product?

---

## 14. Conformance checklist

Every screen, component or PR is checked against the checkout reference with these
tests. The reference is the standard for the whole project, not only mobile.

1. **Grayscale test.** With color removed, the hierarchy still reads and one filled
   action stands out.
2. **One filled CTA per view region.** Lime for ordinary primary actions, ink for
   terminal actions and the mobile sticky bar; everything else is `outline` or `ghost`.
3. **Lime budget.** Lime appears only as the primary button, selection accent, focus
   ring, progress fill, brand mark or success tint, never as a whole surface.
4. **Surfaces.** White canvas, light gray inset strips/shells, `muted` tiles, 1px
   `border` lines. Cards, tiles and rail cards are flat.
5. **Floating controls.** Header circles, quantity pill, Change pill, add circles and
   the notification button are white, hairline-bordered, `shadow-floating`.
6. **Shape language.** Pills for inline controls and badges, circles for elevated icon
   actions, bare ghost icons for quiet affordances, rounded rectangles for surfaces.
7. **Hairlines, not boxes.** Rows are separated by dividers, never one card per row.
8. **Media row anatomy.** Tile · title + overflow · meta line · control left and value
   right on the bottom row. Desktop tables keep the same order.
9. **Status.** Tinted pill with a label; no solid saturated fills.
10. **Mobile alignment.** Surfaces on the 24px edge, content on the 32px content edge;
    24–32px vertical rhythm.
11. **Type.** Row titles and prices medium (500); semibold only for screen and section
    titles; `tabular-nums` on numbers; no all-caps; only sizes from section 2.
12. **Sticky action.** One sticky bar on mobile, ink, labelled with the next step, with
    the fade mask above it; a card footer on desktop.
13. **Stepper.** Active ink, completed `primary-100` with a check, upcoming `muted`;
    short hairline connectors.
14. **Tokens only.** Semantic tokens and `shadow-floating`/`shadow-bar`; no raw hex, no
    arbitrary shadows, no dark variants, spacing on the 4px grid.
15. **Derived components.** Anything not in section 7 was built with the 13.2 algorithm
    and matches a recipe in 13.7.
16. **Touch targets.** 44px hit area on touch, even when the visual control is smaller.
