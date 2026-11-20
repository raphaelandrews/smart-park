# Smart Park — Frontend Features & Implementation Plan

Frontend lives in `web/` (TanStack Router + TanStack Query + Orval-generated client +
Tailwind/shadcn-style UI). The API in `api/` is the source of truth and must not be
changed while implementing this plan.

---

## 1. Scope

Today the API exposes plain CRUD for six resources with pagination, soft delete, and a
few ticket business rules. It has no authentication, no server-side search/filtering, and
no reporting endpoints. Authentication, users, and roles are planned for a later phase
(see section 2 and Phases 8–9).

The frontend therefore has three kinds of features:

1. **Direct features** — screens that map 1:1 to API endpoints.
2. **Derived features** — screens/indicators computed client-side from list responses
   (occupancy, open tickets, revenue, dashboard).
3. **Planned features** — auth, roles, and driver self-service, which require API
   changes and are implemented in Phases 8–9.

### API surface used

| Resource | Base path | List | Get | Create | Update | Deactivate |
|---|---|---|---|---|---|---|
| Vehicles | `/vehicle` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Parking space types | `/parking-space-type` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Parking spaces | `/parking-space` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tariffs | `/tariff` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tickets | `/ticket` | ✅ | ✅ | ✅ | ✅ (exit only) | ✅ |
| Payments | `/payment` | ✅ | ✅ | ✅ | ❌ | ✅ |

All list endpoints accept `page`, `size`, `sort=field,asc|desc` and return a Spring
`Page` (`content`, `totalElements`, `totalPages`, `number`, `first`, `last`).
In development the client calls `/api/*`, proxied to `http://localhost:8080` by Vite
(`web/apps/web/vite.config.ts`).

### Known constraints (design around, do not fight)

- **No auth/roles.** There is no login, session, or permission model.
- **No server-side search or filters.** All search/filtering is client-side over the
  current page or a fully fetched collection.
- **Soft delete only.** Deactivated records disappear from every read endpoint and
  cannot be restored or listed.
- **No occupancy endpoint.** Occupied/available spaces are derived from tickets with
  `exitTime == null`.
- **No ticket status field.** Open vs. closed is derived from `exitTime`.
- **No payment method/status.** Payment = `ticketId` + `amount` + server timestamp.
- **No payment update.** Only create and deactivate.
- **No automatic price calculation.** Amount is always user-entered; the UI may suggest.
- **No dashboard/report endpoints.** KPIs are computed client-side from lists.
- **Rate limit** in production: 60 requests/minute per IP → `429` with `Retry-After`.

### Date format gotcha

Ticket responses format `entryTime`/`exitTime` as `yyyy-MM-dd'T'HH:mm:ss'Z'`, but the
update request expects a `LocalDateTime`. Send `YYYY-MM-DDTHH:mm:ss` **without** `Z`
when closing a ticket, and parse response dates as local values.

---

## 2. Target workflow, roles & access

Auth is not implemented yet. This section records the target so Phases 1–7 do not need
to be restructured later. Phases 8–9 implement it once the API supports it.

### 2.1 Roles

| Role | Who | Main job |
|---|---|---|
| `USER` | Driver / vehicle owner | Park, pay, review history, manage own vehicles |
| `ADMIN` | Parking operator | Manage lot inventory, users, exceptions, reports |

A `USER` owns **many vehicles** (`User 1 → N Vehicle`). A vehicle belongs to exactly one
user. A user may have several vehicles parked at once, so "my parking" lists multiple
active sessions, one per vehicle.

### 2.2 Self-service entry and exit

The driver generates the ticket; an operator is not required for normal operation.

**Entry**
1. Driver is logged in and selects one of their vehicles.
2. Driver scans the QR at the entrance/space, picks an available space from the map, or
   lets the server auto-assign the first available space. Both manual and automatic
   selection are supported.
3. The server creates the ticket: validates that the vehicle belongs to the user, the
   space is available and not blocked, chooses the active tariff, sets `entryTime`, and
   returns `qrCodeToken`.
4. The ticket becomes the driver's active session.

**During the stay**
- Driver sees the active session, elapsed time, estimated amount, and QR code.
- A user with multiple vehicles may have multiple open tickets.

**Exit / checkout**
1. Driver opens checkout in the app.
2. The server computes the amount from entry/exit, tariff, and tolerance.
3. Driver pays in the app (the payment gateway is simulated for this university
   project).
4. The server records the payment and closes the ticket **atomically**, setting
   `exitTime` and freeing the space.
5. Driver gets a receipt; the session moves to history.

**Consequences for the API**
- The driver must never send `tariffId` or `amount`; the server decides both.
- Add `POST /sessions/start` (vehicle + optional space/QR, server-selected tariff). When
  the space is omitted, the server auto-assigns the first available space; when provided,
  it validates the scanned/picked space. Both modes are supported.
  Add `POST /sessions/{id}/checkout` (server-computed amount, payment + close in one
  transaction). The generic `POST /ticket` stays as an operator/admin tool.
- The current `PUT /ticket/{id}` + `POST /payment` pair is not safe for self-service:
  a failure between the two calls can close a ticket without payment or charge twice.
- One open ticket per vehicle. Starting a session for a vehicle or space that is already
  occupied must fail with a clear business-rule error.

### 2.3 Anonymous access

| Public | Logged in |
|---|---|
| Landing page, login, register | Everything else |
| Aggregate availability: counts by space type, optional anonymized map with space codes and status | Vehicles, tickets, payments, history, profile |
| — | All admin screens and writes |

Rules:
- Anonymous users may see **availability**, never **occupancy details**: no plates, no
  ticket IDs, no payment data, no user data.
- Availability must come from a dedicated public endpoint (e.g.
  `GET /public/availability`) returning aggregates. Do not expose `/parking-space` and
  `/ticket` anonymously just to compute it.
- Starting a session, paying, and viewing history always require login.
- Show an "as of" timestamp; availability is a snapshot and changes quickly.

### 2.4 Route map (target)

```
Public
  /                     landing + availability + login/register CTAs
  /login
  /register

USER (driver)
  /my                   active sessions, QR, elapsed time, amount due
  /my/sessions/new      start a session
  /my/sessions/$id      active session detail / checkout
  /my/vehicles          own vehicles (CRUD)
  /my/history           closed tickets + receipts
  /my/payments          own payments
  /my/profile

ADMIN (operator)
  /admin                occupancy, open tickets, revenue
  /admin/spaces
  /admin/space-types
  /admin/tariffs
  /admin/vehicles
  /admin/tickets
  /admin/payments
  /admin/users
```

Until auth exists, management screens are mounted under `/admin/*` and `/my/*` is
reserved. This avoids moving every route when auth lands.

### 2.5 Permission matrix

| Capability | Anonymous | USER | ADMIN |
|---|---|---|---|
| View aggregate availability | ✅ | ✅ | ✅ |
| Login/register | ✅ | — | — |
| Own profile | ❌ | ✅ | ✅ |
| Own vehicles | ❌ | ✅ CRUD | ✅ all |
| Start/stop own session | ❌ | ✅ | ✅ |
| Own tickets, QR, receipts | ❌ | ✅ | ✅ |
| Pay own ticket | ❌ | ✅ | ✅ |
| Open/close any ticket | ❌ | ❌ | ✅ |
| Spaces, space types, tariffs | ❌ | ❌ | ✅ |
| All payments, void/refund | ❌ | ❌ | ✅ |
| Users and roles | ❌ | ❌ | ✅ |
| Revenue + occupancy dashboard | ❌ | own summary | ✅ |

### 2.6 Frontend auth mechanics

- Bootstrap with `GET /auth/me`; cache under `['me']` with `retry: false`.
- `_authenticated` pathless layout guards all private routes; an `_admin` layout adds the
  role check.
- Unauthenticated visit →
  `redirect({ to: '/login', search: { redirect: location.href } })`.
- After login, honor `?redirect=` only if the role can access it; otherwise go to the
  role home (`/admin` or `/my`).
- `401` anywhere → clear the auth/query cache and redirect with a session-expired
  message. `403` → render "Access denied", do not log out.
- Logout → `POST /auth/logout`, `queryClient.clear()`, redirect to `/login`.
- Registration always creates `USER`; never accept a role from the client.
- Prefer an httpOnly `Secure` cookie. If the frontend and API stay on different sites,
  plan for `SameSite=None` + CORS credentials, or an in-memory access token plus an
  httpOnly refresh cookie.

### 2.7 Backend contract to aim for

- `User`: `id`, `name`, `email`, `passwordHash`, `role` (`USER`/`ADMIN`), `active`,
  timestamps.
- `Vehicle.user_id` required (backfill existing rows before enforcing it).
- `Ticket` ownership derives from `vehicle.user`; optionally add `createdBy` for audit.
- `Payment` gets `paidBy`.
- Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
  `GET /auth/me`, and `POST /auth/refresh` if using JWTs.
- Server-side scoping for every read: `USER` sees own data, `ADMIN` sees all. Never rely
  on frontend filtering for authorization.
- `POST /payment` for a `USER` ignores client `amount` and uses the computed fare;
  `ADMIN` may override.
- Public `GET /public/availability` for anonymous counts/map.
- Self-service `POST /sessions/start` and `POST /sessions/{id}/checkout`.

---

## 3. Delivery strategy

Phases are ordered so every phase builds on validated foundations and ends with a
usable slice:

```
Phase 1 — Foundation & app shell
Phase 2 — Space types & tariffs (simplest CRUD, validates the foundation)
Phase 3 — Vehicles
Phase 4 — Parking spaces (depends on types + tickets for derived status)
Phase 5 — Tickets (depends on vehicles, spaces, tariffs)
Phase 6 — Payments (depends on tickets)
Phase 7 — Dashboard, polish & hardening
Phase 8 — Authentication, users & roles (requires API changes)
Phase 9 — Self-service sessions & checkout (requires API changes)
```

Phases 1–7 are the current frontend scope and work against the API as it exists today.
Phases 8–9 are planned and require the backend changes described in section 2.7.

Each task is independently reviewable. A phase is complete only when its
**Acceptance criteria** are met.

---

## Phase 1 — Foundation & app shell

**Goal:** one consistent way to fetch, paginate, display, mutate, validate, and report
errors, before any feature screen is built.
**Depends on:** nothing.
**Outcome:** navigation shell, reusable table/form/feedback primitives, typed error
handling, and lookup helpers.
**Status:** ✅ implemented.

### Tasks

- [x] **1.1 Review the generated API client**
  - Confirm `web/apps/web/src/api/fetcher.ts` sets `Content-Type: application/json`,
    prefixes `VITE_API_URL`, and unwraps `204` correctly.
  - Confirm Orval mutator config exists (`orval.config.*`) and `bun run gen:api`
    regenerates from `http://localhost:8080/v3/api-docs`.
  - Document regeneration steps in the README or a comment.

- [x] **1.2 Normalize API errors**
  - Parse `{ status, error, message, path }` and validation bodies
    `{ errors: [{ fieldName, message }] }` into one `ApiError` type.
  - Map status codes to user-friendly messages: `400` validation, `404` not found,
    `409` duplicate, `422` business rule, `429` rate limit with `Retry-After`.
  - Expose field-level validation errors to forms.
  - Show a toast (`sonner`) for non-field errors; inline messages for field errors.

- [x] **1.3 Configure TanStack Query**
  - Create a single `QueryClient` with sane defaults (`staleTime`, `retry` policy that
    does not retry `4xx`).
  - Invalidate the correct keys after each mutation (list + detail).
  - Add a global error fallback for queries/mutations.

- [x] **1.4 Build the app shell**
  - Sidebar/nav with Lucide icons: Dashboard, Vehicles, Parking Spaces, Space Types,
    Tariffs, Tickets, Payments.
  - Mount management routes under `/admin/*` from the start and reserve `/my/*` for the
    driver area (Phases 8–9). Leave `/login` and `/register` outside the shell.
  - Responsive header, page container, active-route highlighting, dark/light toggle
    (theme provider already exists).
  - Root route with a 404/not-found state.
  - Replace the starter `index.tsx` splash with a placeholder dashboard or redirect.

- [x] **1.5 Create shared UI primitives**
  - `PageHeader` (title, description, primary action).
  - `DataTable` (columns, loading skeleton, empty state, row actions).
  - `Pagination` driven by the Spring `Page` shape (`number`, `totalPages`, `first`,
    `last`), wiring `page`/`size` to the query.
  - `SortableHeader` emitting `sort=field,asc|desc`.
  - `ConfirmDialog` for deactivations (explicit "cannot be undone" copy).
  - `FormDialog` / `FormSheet` for create/edit.
  - `StatusBadge`, `EmptyState`, `ErrorState`, `PageSkeleton`.

- [x] **1.6 Add formatters and validation helpers**
  - Currency formatter (`BRL`), date/time formatter, duration formatter.
  - Shared Zod schemas mirroring API validation: plate regex,
    max lengths (code 20, name/description 100/255, model 100, color 50),
    decimal limits (8 integer / 2 fraction), non-negative rates, tolerance ≥ 0.
  - Plate normalization helper (`toUpperCase`, strip `-`).

- [x] **1.7 Build lookup helpers**
  - `useAllVehicles`, `useAllParkingSpaces`, `useAllTariffs`, `useAllSpaceTypes`
    fetching active records with a large `size` (e.g. 200) for selects.
  - Handle `totalElements > size` (paged combobox or "load more").
  - Expose cached maps (`id → entity`) for joins in tables.

- [x] **1.8 Add derived domain helpers**
  - `isTicketOpen(ticket)` → `exitTime == null`.
  - `getSpaceStatus(space, openTickets)` → `BLOCKED | OCCUPIED | AVAILABLE`.
  - `isVehicleParked(vehicleId, tickets)` → has an open ticket.
  - `isTicketPaid(ticketId, payments)` → payment exists.
  - Unit-test these pure helpers.

### Acceptance criteria

- Navigation works across all planned routes (placeholder pages allowed).
- A table can be sorted and paginated against any list endpoint without duplication.
- API errors (validation, conflict, business rule, rate limit) render consistently.
- `bun run check-types` and `bun run lint` pass.

---

## Phase 2 — Parking space types & tariffs

**Goal:** implement the two reference-data CRUDs first; they validate the foundation and
are prerequisites for spaces and tickets.
**Depends on:** Phase 1.
**Outcome:** management screens for space types and tariffs.

> **Route convention:** Phases 2–7 are admin/operator screens. Every route path shown
> below is relative to `/admin` (for example, `/tariffs` means `/admin/tariffs`). The
> driver area (`/my/*`) and public routes arrive in Phases 8–9.

### Tasks

- [ ] **2.1 Space types — list**
  - Route `/parking-space-types`.
  - Columns: name, description, requires credential, created at, actions.
  - Server pagination and sorting (`name` default).

- [ ] **2.2 Space types — create/edit**
  - Fields: `name` (required, ≤100), `description` (≤255),
    `requiresCredential` (required boolean).
  - Create via `POST /parking-space-type`; edit via `PUT /parking-space-type/{id}`.
  - Show `409` duplicate-name message inline.

- [ ] **2.3 Space types — deactivate**
  - `DELETE /parking-space-type/{id}` behind `ConfirmDialog`.
  - Explain that spaces using the type may become unusable for new tickets.

- [ ] **2.4 Tariffs — list**
  - Route `/tariffs`.
  - Columns: description, first-hour rate, additional-hour rate, tolerance,
    created at, actions.

- [ ] **2.5 Tariffs — create/edit**
  - Fields: `description` (required, ≤255), `firstHourRate`, `additionalHourRate`
    (≥0, 8/2 decimals), `toleranceMinutes` (integer ≥ 0).
  - Create via `POST /tariff`; edit via `PUT /tariff/{id}`.
  - Show `409` duplicate-description message inline.

- [ ] **2.6 Tariffs — deactivate**
  - `DELETE /tariff/{id}` behind `ConfirmDialog`.

- [ ] **2.7 Tariff calculator (optional but small)**
  - Client-side preview: first hour + additional hours, respecting tolerance.
  - Clearly labeled as an estimate; API does not compute amounts.

### Acceptance criteria

- Full create/read/update/deactivate works for both resources.
- Validation messages match the API rules and appear on the right fields.
- After every mutation, the list refreshes and a success toast appears.

---

## Phase 3 — Vehicles

**Goal:** complete vehicle management, including plate rules and the immutability of the
plate after creation.
**Depends on:** Phase 1.
**Outcome:** vehicles CRUD with client-side search and open-ticket awareness.

### Tasks

- [ ] **3.1 Vehicles — list**
  - Route `/vehicles`.
  - Columns: plate, model, color, type, active, created at, actions.
  - Server pagination and sorting (`model` default).
  - Client-side search by plate/model/color on the current page; optional
    "fetch all and filter" mode for small datasets.

- [ ] **3.2 Vehicles — create**
  - Fields: `licensePlate`, `model`, `color`, `vehicleType`
    (`CAR`, `MOTORCYCLE`, `TRUCK`, `BUS`).
  - Enforce plate regex `[A-Z]{3}[0-9][A-Z0-9][0-9]{2}`; auto-uppercase and strip `-`.
  - `POST /vehicle`; surface `409` "placa já cadastrada" inline.

- [ ] **3.3 Vehicles — edit**
  - Editable: `model`, `color`, `vehicleType` only (API does not accept plate).
  - Show plate as read-only with an explanatory hint.
  - `PUT /vehicle/{id}`.

- [ ] **3.4 Vehicles — deactivate**
  - `DELETE /vehicle/{id}` behind `ConfirmDialog`.
  - Warn if the vehicle currently has an open ticket (derived from tickets).

- [ ] **3.5 Vehicles — detail/history (optional)**
  - Route `/vehicles/$vehicleId` or a drawer.
  - Show vehicle data plus its tickets filtered client-side by `vehicleId`,
    open/closed state, and payments.

### Acceptance criteria

- Plate validation matches the backend, including normalization.
- Plate cannot be edited after creation.
- Duplicate plate errors render inline and do not lose form state.

---

## Phase 4 — Parking spaces

**Goal:** manage the physical lot, including blocking and derived occupancy.
**Depends on:** Phase 1, Phase 2 (space types), Phase 5 data shape (tickets).
**Outcome:** spaces list/grid, CRUD, block/unblock, derived status.

### Tasks

- [ ] **4.1 Parking spaces — list**
  - Route `/parking-spaces`.
  - Columns: code, type name, blocked, blocking reason, status badge, created at,
    actions.
  - Server pagination and sorting (`code` default).

- [ ] **4.2 Parking spaces — derived status**
  - Load open tickets (all pages, `exitTime == null`).
  - Compute `BLOCKED` (flag), `OCCUPIED` (open ticket on the space), `AVAILABLE`.
  - Document that status is a client-side projection.

- [ ] **4.3 Parking spaces — create**
  - Fields: `code` (required, ≤20), `parkingSpaceTypeId` (select from active types),
    `blocked`, `blockingReason` (≤255, required when blocked).
  - `POST /parking-space`; surface `409` duplicate code.

- [ ] **4.4 Parking spaces — edit**
  - Editable: `parkingSpaceTypeId`, `blocked`, `blockingReason`. Code is read-only.
  - Require a reason when `blocked` is true; clear it when unblocking.
  - `PUT /parking-space/{id}`.

- [ ] **4.5 Block / unblock shortcut**
  - Row action that opens the edit dialog pre-focused on blocking fields, or a
    dedicated toggle calling the update endpoint with current values.

- [ ] **4.6 Parking spaces — deactivate**
  - `DELETE /parking-space/{id}` behind `ConfirmDialog`.
  - Warn if the space has an open ticket.

- [ ] **4.7 Parking lot grid view (optional)**
  - Toggle between table and grid.
  - Cards grouped by type, colored by derived status, showing code and block reason.
  - Click opens details/edit.

### Acceptance criteria

- A space with an open ticket never shows as available.
- Blocking requires and displays a reason.
- Code cannot be edited after creation.

---

## Phase 5 — Tickets

**Goal:** the core operational flow for staff: open a session, monitor open tickets, close a ticket.
**Depends on:** Phase 2 (tariffs), Phase 3 (vehicles), Phase 4 (spaces).
**Outcome:** ticket list/detail, open-ticket wizard, close-ticket flow, QR receipt.

> This phase builds the **operator/admin** view. The driver-facing self-service entry and
> checkout flow is Phase 9 and depends on new API endpoints.

### Tasks

- [ ] **5.1 Tickets — list**
  - Route `/tickets`.
  - Tabs/filters: **Open** (`exitTime == null`) and **Closed**, plus **All**.
  - Columns: id, plate, space, tariff, entry, exit, paid badge, actions.
  - Server pagination and sorting (`entryTime` default).
  - Because filtering is client-side, fetch pages and filter the current page; document
    the limitation.

- [ ] **5.2 Open ticket — form**
  - Fields: `vehicleId`, `parkingSpaceId`, `tariffId` (active records only).
  - Disable vehicles with an open ticket and blocked/occupied spaces in the pickers.
  - Do **not** send entry time; the API sets it.
  - `POST /ticket`.
  - Surface `422` messages verbatim: vehicle already parked, space occupied,
    space blocked.

- [ ] **5.3 Open ticket — success state**
  - Immediately show the created ticket with `qrCodeToken`, entry time, plate, space,
    and tariff.
  - Option to print/download a simple receipt.

- [ ] **5.4 Ticket detail**
  - Route `/tickets/$ticketId`.
  - Show all fields, open/closed state, derived paid state, and QR code.
  - Render the QR from `qrCodeToken` using a client-side QR library (e.g. `qrcode` or
    `react-qr-code`).

- [ ] **5.5 Close ticket**
  - Action in list and detail.
  - Default `exitTime` to now; allow adjustment.
  - Validate exit ≥ entry locally, then `PUT /ticket/{id}` with
    `YYYY-MM-DDTHH:mm:ss` (no `Z`).
  - Handle `422` "already closed" and "exit before entry".
  - Invalidate tickets and related queries after success.

- [ ] **5.6 Void ticket**
  - `DELETE /ticket/{id}` behind `ConfirmDialog`, with a warning about history loss.

- [ ] **5.7 Checkout handoff**
  - From a closed, unpaid ticket, offer "Register payment" that routes to the payment
    form with `ticketId` prefilled and a suggested amount computed from the tariff and
    duration (editable, clearly marked as an estimate).

### Acceptance criteria

- Open-ticket form prevents the same `422` situations client-side where possible.
- Closing a ticket updates its state everywhere without a manual refresh.
- QR token is displayed and scannable.
- Date sent on close is accepted by the API (no `Z`).

---

## Phase 6 — Payments

**Goal:** register and review payments, one per ticket.
**Depends on:** Phase 5 (tickets).
**Outcome:** payments list, register form, deactivate, ticket linkage.

### Tasks

- [ ] **6.1 Payments — list**
  - Route `/payments`.
  - Columns: id, ticket, plate/space (joined client-side), amount, payment date/time,
    active, actions.
  - Server pagination and sorting (`paymentDateTime` default, newest first).
  - Totals summary: count and sum of active payments on the current result set.

- [ ] **6.2 Payments — register**
  - Fields: `ticketId` (select closed/unpaid tickets), `amount` (> 0, 2 decimals).
  - Show ticket context (plate, space, entry/exit, duration) on selection.
  - Suggest amount from tariff + duration; keep it editable.
  - `POST /payment`; surface `409` when the ticket already has a payment.

- [ ] **6.3 Payment detail**
  - Route `/payments/$paymentId` or a side panel.
  - Show amount, timestamp, linked ticket, and link back to the ticket.

- [ ] **6.4 Deactivate payment**
  - `DELETE /payment/{id}` behind `ConfirmDialog`.
  - Explain that the ticket returns to "unpaid" in the UI.

- [ ] **6.5 Ticket ↔ payment consistency**
  - Ensure the "paid" badge on tickets is derived from active payments only.
  - Invalidate ticket queries after payment create/deactivate.

### Acceptance criteria

- One payment per ticket is enforced in the UI before submitting.
- Amount validation matches the API (≥ 0.01, 8 integer / 2 fraction digits).
- Payments and ticket paid-state stay in sync after mutations.

---

## Phase 7 — Dashboard, polish & hardening

**Goal:** expose operational visibility and prepare the app for real use.
**Depends on:** Phases 1–6.
**Outcome:** derived dashboard, consistent UX, QA and deployment readiness.

### Tasks

- [ ] **7.1 Dashboard metrics (derived)**
  - Route `/admin` (the placeholder from Phase 1).
  - Cards: total spaces, occupied, available, blocked, open tickets, active payments,
    revenue today, revenue total.
  - Source: fetch all pages of spaces, tickets, and payments (document the cost and
    rate-limit implications).
  - Show "as of" timestamp and a manual refresh.

- [ ] **7.2 Dashboard breakdowns**
  - Occupancy by space type (bar or stacked bar).
  - Open tickets table (plate, space, entry time, duration).
  - Recent payments table.
  - Optionally, a simple 7-day revenue series computed from `paymentDateTime`.

- [ ] **7.3 Global UX polish**
  - Loading skeletons on every table and detail view.
  - Empty states with a call to action.
  - Success/error toasts for every mutation.
  - Keyboard support and focus management in dialogs.
  - Responsive layouts (tables → cards on small screens).
  - Consistent Portuguese copy (the API messages are pt-BR).

- [ ] **7.4 Accessibility and semantics**
  - Labels tied to inputs, `aria-describedby` for errors.
  - Status conveyed by text/icon, not color alone.
  - Sufficient contrast in both themes.

- [ ] **7.5 Rate-limit and resilience behavior**
  - On `429`, show a friendly message with retry time and avoid retry storms.
  - Avoid unbounded parallel "fetch all pages" loops; add a small concurrency limit or
    cached aggregate hook.

- [ ] **7.6 End-to-end smoke tests**
  - Flow: create space type → space → tariff → vehicle → open ticket → close ticket →
    register payment → verify dashboard and paid badge.
  - Negative flows: duplicate plate/name/code/description, blocked space, vehicle with
    open ticket, closing twice, payment twice.

- [ ] **7.7 Deployment readiness**
  - Set `VITE_API_URL` at build time for the production API.
  - Verify CORS on the API allows the deployed origin.
  - Run `bun run check-types`, `bun run lint`, `bun run build`.
  - Update `README.md` with frontend setup and API base URL instructions.

### Acceptance criteria

- Dashboard numbers reconcile with list screens on the same snapshot.
- All primary and negative flows pass manually.
- Production build succeeds and talks to the deployed API.

---

## Phase 8 — Authentication, users & roles

**Goal:** protect the app, introduce `USER`/`ADMIN`, and scope all data by ownership.
**Depends on:** Phases 1–7 and the backend auth/user model described in section 2.7.
**Outcome:** public login/register and availability, guarded routes, role-aware shell,
driver area, and admin user management.
**Status:** backend auth and the auth UI are implemented; driver/admin feature screens and
public availability remain.

### Tasks

- [ ] **8.1 Regenerate the API client**
  - Add the auth endpoints (`/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`)
    and the public availability endpoint to the OpenAPI spec, then regenerate.
  - Extend the error normalizer for `401` and `403`.

- [x] **8.2 Auth bootstrap**
  - `useMe()` query under `['me']` with `retry: false`.
  - Gate the app on the first `/auth/me` result (loading state, no redirect flicker).
  - Store the authenticated user in router context for guards.

- [x] **8.3 Public layout and login**
  - Public layout without sidebar for `/`, `/login`, `/register`.
  - `/login`: email + password, inline validation, server error display, link to
    register.
  - Preserve `?redirect=` and return there after login when the role allows it.
  - Redirect authenticated users visiting `/login` to their role home.

- [x] **8.4 Registration**
  - `/register`: name, email, password, confirmation.
  - Always creates `USER`; never render or send a role field.
  - Handle duplicate email, weak password, and disabled account errors.
  - On success, log in or send the user to `/login`.

- [x] **8.5 Route guards**
  - `_authenticated` pathless layout: unauthenticated → `/login?redirect=...`.
  - `_admin` layout: `USER` → access-denied page; never silently redirect to `/login`.
  - Role home redirect: `ADMIN` → `/admin`, `USER` → `/my`.
  - Handle expired sessions (`401`) globally and clear cached private data.

- [ ] **8.6 Role-aware shell**
  - Admin navigation: Dashboard, Spaces, Space Types, Tariffs, Vehicles, Tickets,
    Payments, Users.
  - User navigation: My Parking, My Vehicles, History, Payments, Profile.
  - Hide admin links from `USER`; keep server-side enforcement as the real boundary.

- [ ] **8.7 Driver home (`/my`)**
  - List all active sessions for the user's vehicles (one per vehicle).
  - Card per session: plate, space, entry time, elapsed timer, estimated amount, QR.
  - Primary action: start a session; per-card action: checkout.
  - Empty state when nothing is parked.

- [ ] **8.8 Driver vehicles (`/my/vehicles`)**
  - Reuse the Phase 3 vehicle screens scoped to the current user.
  - Backend returns only the user's vehicles; never filter another user's data
    client-side.
  - Plate stays immutable after creation.

- [ ] **8.9 Driver history and payments (`/my/history`, `/my/payments`)**
  - Closed tickets with duration, amount, and receipt link.
  - Own payments only, newest first, with totals.
  - Reuse the ticket detail/receipt components from Phase 5.

- [ ] **8.10 Profile (`/my/profile`)**
  - Display name/email/role, change password if the API supports it, logout.
  - Confirm logout and clear the query cache.

- [ ] **8.11 Admin user management (`/admin/users`)**
  - List users with role and active status.
  - Activate/deactivate and promote/demote between `USER` and `ADMIN`.
  - Guard rails: cannot deactivate/demote yourself if you are the last admin.

- [ ] **8.12 Anonymous availability**
  - Landing page shows aggregate counts by space type and an "as of" timestamp.
  - Optional anonymized map: space code + status only; never plates, tickets, or
    payments.
  - CTA to log in/register; no operational actions while logged out.

- [ ] **8.13 Auth and ownership tests**
  - Anonymous → private route redirects to login with `redirect`.
  - `USER` → `/admin/*` denied; `ADMIN` → allowed.
  - User A cannot see user B's vehicles, tickets, or payments (verify at the API).
  - Expired session → login with message; logout clears cached data.

### Acceptance criteria

- No private data is visible or reachable while logged out.
- A `USER` cannot reach admin routes even by typing the URL; `403` shows access denied.
- Login returns to the intended page; logout clears all cached data.
- Ownership isolation is verified end-to-end, not just hidden in the UI.

---

## Phase 9 — Self-service sessions & checkout

**Goal:** let drivers start and pay for sessions without an operator.
**Depends on:** Phase 8 plus new server endpoints (`POST /sessions/start`,
`POST /sessions/{id}/checkout`, server-side fare calculation).
**Outcome:** driver entry/exit flows, active session tracking, receipts, and admin
exception tools.

### Tasks

- [ ] **9.1 Start-session wizard**
  - Step 1: choose one of the user's vehicles (default to the last used).
  - Step 2: scan a space QR, pick an available space from the map, **or** choose
    "auto-assign" to let the server take the first available space.
  - Step 3: confirm; show the applied tariff read-only.
  - Never ask for `tariffId` or `amount`; the server decides both.

- [ ] **9.2 Availability map**
  - Show only forwardable data: space code and available/occupied/blocked status.
  - Refresh on focus and after a session starts/ends.
  - Respect the public endpoint's aggregate shape when logged out.

- [ ] **9.3 Entry error handling**
  - Map server business rules: vehicle already parked, space taken, space blocked,
    vehicle not owned, no active tariff, no availability.
  - Offer a retry with another space or auto-assign without losing the selected vehicle.

- [ ] **9.4 Active session tracking**
  - Entry time, live elapsed timer, space, tariff, QR token, estimated amount.
  - Pull-to-refresh/manual refresh; amount is an estimate until checkout.
  - Link to checkout and to the receipt after closure.

- [ ] **9.5 Multiple concurrent sessions**
  - A user with several vehicles can have several active sessions.
  - Show all of them on `/my`; start-session excludes vehicles already parked.

- [ ] **9.6 In-app checkout**
  - Show the server-computed breakdown (first hour, additional hours, tolerance).
  - Payment step inside the app (simulated gateway for this university project).
  - Success: receipt with amount, duration, plate, space, and timestamps.
  - The ticket closes atomically with the payment; the space becomes available.

- [ ] **9.7 Checkout resilience**
  - Send an idempotency key; prevent double submission/double charge.
  - Handle pending/declined payment states without closing the ticket.
  - Allow retry after a network failure; never leave a paid-but-open session.

- [ ] **9.8 Admin exception tools**
  - Force-close a stuck session, void/refund a payment, reassign a space.
  - Require a reason and audit the action (API support needed).

- [ ] **9.9 End-to-end tests**
  - Happy path: login → start → wait → checkout → receipt → history.
  - Edge cases: double entry, blocked space, multiple vehicles, double checkout,
    declined payment, expired session.

### Acceptance criteria

- A driver can complete entry → stay → pay → exit without admin help.
- Amounts are computed server-side and cannot be tampered with in the client.
- Payment and close are atomic; no paid-open or closed-unpaid states remain.
- Admin can resolve stuck sessions and refund/void with a reason.

---

## 4. Feature checklist (definition of done per screen)

Every feature screen must have:

- [ ] Loading, empty, and error states.
- [ ] Correct authentication/role guard and ownership scope (Phases 8–9).
- [ ] `401`/`403`/session-expired states handled without leaking private data.
- [ ] Server-side pagination and sorting where the endpoint supports it.
- [ ] Validation mirroring the API DTO constraints.
- [ ] Inline handling of `400`/`409` field errors.
- [ ] Toast on success and on non-field errors.
- [ ] Confirmation before soft delete.
- [ ] Query invalidation after every mutation.
- [ ] Responsive layout.
- [ ] Portuguese UI copy consistent with API messages.

---

## 5. Explicitly out of scope

Phases 1–7 intentionally exclude (Phases 8–9 add some of them later):

- Authentication, authorization, user profiles, and roles — **Phase 8**.
- Driver self-service entry/checkout and server-side fare calculation — **Phase 9**.
- Server-side search, filters, or full-text queries.
- Restoring or listing deactivated records.
- Payment methods/status, refunds, partial payments, and real gateway integration.
- Editing a payment.
- Ticket status enum exposure, audit log, reservations, and capacity planning.
- Credential validation for `requiresCredential` space types.
- Server-generated reports and charts (Phase 8 adds only public aggregate availability).
- Physical kiosks, gate hardware, and cashier devices — payments happen inside the app.

---

## 6. Suggested dependency graph

```
Phase 1 (foundation)
   ├── Phase 2 (types, tariffs)
   │      └── Phase 4 (spaces) ──┐
   ├── Phase 3 (vehicles) ───────┤
   │                             └── Phase 5 (tickets) ── Phase 6 (payments) ── Phase 7 (dashboard)
   └───────────────────────────────────────────────────────────────────────────┘
                                                                                     │
                                                                                     ▼
                                                              Phase 8 (auth, roles, ownership)
                                                                                     │
                                                                                     ▼
                                                              Phase 9 (self-service entry/checkout)
```

Phases 2 and 3 can run in parallel. Phase 4 needs Phase 2; Phase 5 needs 2, 3, and 4;
Phase 6 needs 5; Phase 7 needs everything. Phase 8 needs the backend user/auth model;
Phase 9 needs Phase 8 plus the session/checkout endpoints.
