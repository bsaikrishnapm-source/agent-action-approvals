# Approval Inbox — product walkthrough

## Implemented user value

A pending/approved/rejected/expired/executed request flow, exact payload binding, manager threshold, approval TTL, and replay no-op within a tab.

## Five-minute review

Submit a $40 request; approve it; simulate execution; retry; create a new request ID and change its amount after approval; advance the clock to test expiry.

Choose **Save comparison snapshot** to retain up to five result snapshots in the current tab. **Download evidence JSON** exports the current result and captured snapshots. Refreshing clears all session state. Exports describe synthetic data and local actions only.

## Architecture

| File | Responsibility |
| --- | --- |
| demo/index.html | Page structure, local script references and evidence boundary |
| demo/style.css | Responsive workspace, focus styles and readable tables |
| demo/data.js | Bundled synthetic fixture data; no network requests |
| demo/engine.js | Pure decision functions and in-memory workflow state |
| demo/app.js | Labeled controls, local actions, result rendering and downloads |
| test_demo.cjs | Node built-in behavioral tests against the decision engine |

The UI inserts scenario text through textContent. CSV exports, where present, quote fields and neutralize formula-like leading characters. No external libraries, trackers, authentication credentials or model endpoints are used.

## Product scope and trade-offs

All actors and balances are fictional. Authority is selected through demo controls, not verified identity. State is in-memory and editable by the browser user. No signed approval, transaction database, concurrency control, external payment, or durable audit is implemented.

## Review criteria

A reviewer should be able to explain the decision, change an assumption, inspect a failure path and export the evidence. A successful prototype test demonstrates only the declared fixture behavior; it does not establish production readiness.

## Run verification

Requires Node.js 18 or newer for the built-in test runner (the demo itself requires only a browser).

```bash
node --test test_demo.cjs
```

Expected: 8 passing decision tests. The existing Python entry point remains available in the main README.

## Accessibility design

Controls use visible labels, keyboard focus outlines and native buttons/selects. Error text uses an alert region; metric updates and snapshot counts use polite live regions. A skip link targets scenario controls. Tables scroll inside the result panel on narrow displays. Browser rendering and assistive-technology testing have not been completed in this environment.

## Data and retention

Use synthetic records only. Demo decisions and logs live in memory, with no localStorage or remote persistence. Downloading evidence explicitly writes a file through the user's browser. Clearing a buffer or refreshing does not delete a previously downloaded export.

## Proposed production transaction boundary

Resolve tenant and reviewer authority from authenticated server state. Store a canonical payload digest and expiry with each approval, scoped by tenant/request ID. Within a database transaction, lock the request, verify unchanged payload and unexpired approval, and atomically record an execution intent under a unique idempotency key. Use the same key with the downstream payment provider. On an uncertain response, reconcile provider status before retrying; never infer failure from a timeout. Persist audit events with access controls and retention. This is architecture documentation; the browser Map does not implement this boundary.
