# Agent Action Approval Simulator

## Start here

**Problem:** Decide whether an AI agent may read an order, propose a refund, or needs human approval.

**What is built:** An independent Python prototype or analysis, with product documents and synthetic data.

**Code to run:** `python3 simulate.py`

**What you will see:** Prints a decision for each of 10 scenarios and checks it against the expected outcome.

**Scope:** Runs locally in a terminal. No live customer integration, deployed application, or real AI model call is included.


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

Approval, tenancy, and duplicate status are trusted booleans in this simulation. Production must derive them from authenticated server-side state, bind approval to the exact action payload, and use a transaction-backed idempotency store. Passing fixture tests is not a security audit.

## Run locally

Requires Python 3. No additional packages or API keys are needed.

```bash
git clone https://github.com/bsaikrishnapm-source/agent-action-approvals.git
cd agent-action-approvals
python3 simulate.py
```

[View the full product management portfolio](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source)

## Inspect the data in Excel

```bash
python3 export_data.py --output exports
```

Creates CSV tables from the bundled synthetic data. The terminal output identifies each table and its row count. For a different JSON file, add `--input path/to/data.json`. Existing table CSV files in the output directory are replaced. These exports contain scenario inputs, not production results.
