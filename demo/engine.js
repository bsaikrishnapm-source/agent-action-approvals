(function(){
"use strict";
function finite(value, name, min=0, max=Number.MAX_SAFE_INTEGER) {
  if(typeof value!=="number" || !Number.isFinite(value) || value<min || value>max) throw new Error(`${name} must be a finite number from ${min} to ${max}`);
  return value;
}
function clone(value){return JSON.parse(JSON.stringify(value));}
function unique(rows,key){if(new Set(rows.map(r=>r[key])).size!==rows.length)throw new Error(`Duplicate ${key}`);}
function ratio(a,b){return b ? a/b : null;}

function payload(x){
 if(!x||typeof x!=="object")throw new Error("Action is required");
 for(const k of ["tenant","order","request_id"])if(typeof x[k]!=="string"||!x[k].trim()||x[k].length>100)throw new Error(k+" must be 1–100 characters");
 if(x.action!=="issue_refund")throw new Error("Only simulated refunds are supported");
 finite(x.amount,"Amount",0,100000);if(Math.abs(x.amount*100-Math.round(x.amount*100))>1e-7)throw new Error("Amount must have at most two decimal places");
 if(x.currency!=="USD")throw new Error("Only fictional USD scenarios are supported");
 return {tenant:x.tenant,order:x.order,request_id:x.request_id,action:x.action,amount_cents:Math.round(x.amount*100),currency:x.currency};
}
class Approvals{
 constructor(){this.records=new Map();this.executions=new Map();this.audit=[];}
 log(status,key){this.audit.push({sequence:this.audit.length+1,status,request:key});this.audit=this.audit.slice(-50);}
 propose(x,actor,now=Date.now()){
  const p=payload(x);if(p.tenant!==actor.tenant)throw new Error("Tenant mismatch");
  const key=p.tenant+":"+p.request_id;const canonical=JSON.stringify(p);
  const old=this.records.get(key);
  if(old){if(old.canonical!==canonical){this.log("PAYLOAD_MISMATCH",key);throw new Error("Request ID already binds a different payload. Use a new request ID.");}return clone(old);}
  const row={key,canonical,payload:p,status:"PENDING",created:now,expires:null,reviewer:null};this.records.set(key,row);this.log("PENDING",key);return clone(row);
 }
 review(key,decision,reviewer,now=Date.now()){
  const r=this.records.get(key);if(!r)throw new Error("Request not found");
  if(reviewer.tenant!==r.payload.tenant)throw new Error("Reviewer tenant mismatch");
  if(!["support","manager"].includes(reviewer.role))throw new Error("Reviewer role is not allowed");
  if(r.status!=="PENDING")throw new Error("Only pending requests can be reviewed");
  if(!["APPROVED","REJECTED"].includes(decision))throw new Error("Invalid review decision");
  if(decision==="APPROVED" && r.payload.amount_cents>10000&&reviewer.role!=="manager")throw new Error("Above $100 requires the manager demo role");
  r.status=decision;r.expires=now+60000;r.reviewer=reviewer.role;this.log(decision,key);return clone(r);
 }
 execute(x,actor,now=Date.now()){
  const p=payload(x),key=p.tenant+":"+p.request_id,r=this.records.get(key);
  if(actor.tenant!==p.tenant)throw new Error("Tenant mismatch");
  if(!r||r.canonical!==JSON.stringify(p))throw new Error("No approval for this exact payload");
  if(this.executions.has(key)){this.log("REPLAY_NOOP",key);return {status:"REPLAY_NOOP",receipt:this.executions.get(key)};}
  if(r.status!=="APPROVED")throw new Error("Request is not approved");
  if(now>=r.expires){r.status="EXPIRED";this.log("EXPIRED",key);throw new Error("Approval expired; submit a new request ID");}
  const receipt="SIM-"+(this.executions.size+1);this.executions.set(key,receipt);r.status="EXECUTED";this.log("EXECUTED",key);return {status:"EXECUTED",receipt};
 }
}
const API={Approvals,payload};

if(typeof module!=="undefined"&&module.exports)module.exports=API;else window.Product=API;
})();
