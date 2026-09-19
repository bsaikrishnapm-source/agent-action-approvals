# Agent Action Approval Simulator

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
