# Agent Approval Product Spec

## Persona and problem

A customer operations reviewer needs to inspect an agent-proposed refund before committing money. The scenario is fictional and is not a recommendation about any real company's refund policy.

## State model

Proposed actions become Denied, Read allowed, or Awaiting review. Approved eligible writes may move to Simulated execution. Duplicate write requests move to Replay no-op. Amounts above $100 stay in review even when the ordinary approval flag is present.

## Review screen specification

Show action, amount, order reference, customer tenant, reason, and supporting evidence. Offer Approve and Reject with a clear confirmation of the consequence. Any edit to the action payload invalidates the prior approval. Reviewer identity and timestamp belong in the audit record.

## Implemented policy cases

The simulator checks the allowlist and tenant boundary before actions. Invalid negative refund amounts are denied. Reads do not require write approval. Duplicate refund attempts do not re-execute. Missing approval and above-limit requests remain in review.

## Production requirements

Signed approvals must expire, bind to a canonical payload, and be checked against the reviewer's role. Idempotency keys must be scoped to the tenant and action, with an atomic check-and-write. Handle partial API failure by checking prior execution status before retrying. Audit logs must be append-only with appropriate retention.

The original Python simulator uses boolean fixtures. The new browser demo binds approval to an exact canonical payload, models expiry and reviewer thresholds, and keeps a request-scoped execution map for replay handling. Its actors and storage remain client-side simulations. Signed authorization, atomic durable execution and provider reconciliation remain specified production requirements; see DEMO_GUIDE.md.

## Metrics and release decision

Measure unauthorized action rate, duplicate execution rate, approval latency, rejection reasons, and successful task completion. Zero unauthorized writes and zero duplicate writes are release gates in the test environment. Recommendation: prototype complete; no real-money rollout without server-side controls and independent security review.

