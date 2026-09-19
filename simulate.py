"""Agent tool-use approval simulator. Never calls a payment or account API."""
import json
from pathlib import Path
def decide(x):
    if not x["tenant_ok"] or x["action"] not in ("read_order", "issue_refund"):
        return "DENY"
    if x["action"] == "read_order":
        return "ALLOW_READ"
    if x["amount"] < 0:
        return "DENY"
    if x["duplicate"]:
        return "REPLAY_NOOP"
    if x["amount"] > 100 or not x["approval"]:
        return "REVIEW"
    return "SIMULATE_EXECUTION"
rows = json.loads(Path(__file__).with_name("data.json").read_text())
for r in rows:
    outcome = decide(r)
    print(r["id"], outcome)
    assert outcome == r["expected"], r["id"]
print(f"{len(rows)}/{len(rows)} policy fixtures passed; no external actions performed.")
