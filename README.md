# Agent Action Approval Simulator

## Product decision at a glance

**User need:** Let an operator inspect an agent's proposed refund before it changes customer state.

**Decision:** Require approval of the exact action, escalate amounts above the fictional $100 threshold and reject expired or altered approvals.

**Inspect:** [Requirements and state model](PRODUCT.md) · [Guided demo](DEMO_GUIDE.md) · [Validation boundaries](VALIDATION.md).

**Evidence:** Ten original Python policy scenarios plus a browser approval flow. The browser binds approvals to action payloads and handles replays within a tab; durable execution and authenticated authority remain open.

## Interactive product demo — implemented

**Approval Inbox:** A pending/approved/rejected/expired/executed request flow, exact payload binding, manager threshold, approval TTL, and replay no-op within a tab.

### Open the product

1. On this repository, select **Code → Download ZIP**.
2. Extract the ZIP folder.
3. Open **demo/index.html** in your browser.

No installation, API key or login is required for the demo. GitHub's Code tab displays source; it does not run HTML applications. Keep the demo folder's files together. This is a local browser experience, not a hosted service.

[Demo walkthrough and architecture](DEMO_GUIDE.md) · [Browser source](demo/index.html) · [Decision logic](demo/engine.js) · [Verification](VALIDATION.md)


## Start here

**Problem:** Decide whether an AI agent may read an order, propose a refund, or needs human approval.

**What is built:** The interactive demo above, plus the original Python case study, product documents and synthetic data.

**Code to run:** `python3 simulate.py`

**What you will see:** Prints a decision for each of 10 scenarios and checks it against the expected outcome.

**Scope:** Includes a local browser demo plus the original Python command-line analysis. No live customer integration, hosted deployment, or real AI model call is included.


**Complete independent prototype | Agentic product design and tool-use governance**

## Decision

Separate permission to read information from permission to change customer state. Require human approval for any refund, and route refunds above the fictional $100 threshold to a higher-authority review.

## Demonstration

Run `python3 simulate.py`. Ten populated fixtures exercise approved actions, missing approval, amount limits, tenant boundaries, invalid amounts, unsupported tools, and duplicate requests. No payment or account API is called.

## Product trade-off

Approval adds friction, but an agent's proposed action is not authorization. A visible review step makes the amount, target, and consequence inspectable. Idempotency prevents a retry from being treated as a second refund.

## Deliverables

- [Ten policy scenarios](data.json)
- [Working decision simulator](simulate.py)
- [State model and acceptance criteria](PRODUCT.md)

## Limitations

In the original Python simulator, approval, tenancy, and duplicate status are trusted booleans. The browser demo adds exact payload binding, approval expiry and in-memory replay handling. Production must derive them from authenticated server-side state, bind approval to the exact action payload, and use a transaction-backed idempotency store. Passing fixture tests is not a security audit.

## Run locally

Requires Python 3. No additional packages or API keys are needed.

```bash
git clone https://github.com/bsaikrishnapm-source/agent-action-approvals.git
cd agent-action-approvals
python3 simulate.py
```

[Full PM portfolio](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source) · [Portfolio roadmap](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/ROADMAP.md) · [Project backlog](https://github.com/bsaikrishnapm-source/agent-action-approvals/issues) · [Planning board](https://github.com/users/bsaikrishnapm-source/projects/1)

## Inspect the data in Excel

```bash
python3 export_data.py --output exports
```

Creates CSV tables from the bundled synthetic data. The terminal output identifies each table and its row count. For a different JSON file, add `--input path/to/data.json`. Existing table CSV files in the output directory are replaced. These exports contain scenario inputs, not production results.

