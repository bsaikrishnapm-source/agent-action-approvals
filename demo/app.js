"use strict";
const $=id=>document.getElementById(id);
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function num(id){const v=$(id).value;if(v.trim()==="")throw new Error("Enter a value for "+id);return Number(v);}
function field(id,label,value,options){
 const wrap=el("label");wrap.append(el("span",label));let input;
 if(options){input=el("select");for(const item of options){const o=el("option",typeof item==="string"?item:item[1]);o.value=typeof item==="string"?item:item[0];input.append(o);}}
 else{input=el("input");input.type=typeof value==="number"?"number":"text";if(input.type==="number"){input.step="any";input.min="0";}}
 input.id=id;input.value=value;wrap.append(input);$("controls").append(wrap);return input;
}
function button(label,fn,secondary=false){const b=el("button",label,secondary?"secondary":"");b.type="button";b.onclick=()=>{try{$("error").textContent="";fn();}catch(e){$("error").textContent=e.message;}};$("actions").append(b);return b;}
function metric(label,value){const c=el("div",undefined,"metric");c.append(el("span",label),el("strong",String(value)));$("metrics").append(c);}
function clear(){for(const id of ["metrics","results","notes"])$(id).replaceChildren();}
function message(text){$("notes").append(el("p",text));}
function table(title,rows,columns){
 const section=el("section",undefined,"result-section");section.append(el("h2",title));if(!rows.length){section.append(el("p","No records for this scenario."));$("results").append(section);return;}
 const wrap=el("div",undefined,"table-scroll"),t=el("table"),head=el("thead"),hr=el("tr");
 for(const [key,label]of columns)hr.append(el("th",label));head.append(hr);t.append(head);
 const body=el("tbody");for(const row of rows){const tr=el("tr");for(const [key]of columns){const v=row[key];tr.append(el("td",v===null||v===undefined?"—":Array.isArray(v)?v.join(", "):String(v)));}body.append(tr);}t.append(body);wrap.append(t);section.append(wrap);$("results").append(section);
}
function download(name,data,type="application/json"){
 const body=typeof data==="string"?data:JSON.stringify(data,null,2);
 const url=URL.createObjectURL(new Blob([body],{type}));const a=el("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function csv(rows){if(!rows.length)return "";const keys=Object.keys(rows[0]);const cell=v=>{let s=typeof v==="object"?JSON.stringify(v):String(v??"");if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return [keys.map(cell).join(","),...rows.map(r=>keys.map(k=>cell(r[k])).join(","))].join("\r\n");}
function pct(n){return n===null?"N/A":(n*100).toFixed(1)+"%";}
function money(n){return "$"+n.toFixed(2);}
const copies=[];
function saveComparison(label,result){copies.push({label,at:new Date().toISOString(),result:JSON.parse(JSON.stringify(result))});if(copies.length>5)copies.shift();$("saved").textContent=copies.length+" comparison snapshots saved in this tab";}
let lastResult=null;


let model=new Product.Approvals(),key=null,clock=0;
field("request","Request ID","refund-001");field("order","Order reference","order-1042");field("amount","Refund amount (USD)",40);
field("tenant","Action tenant","alpha",["alpha","beta"]);field("reviewer","Demo reviewer role","support",["support","manager"]);
function actor(){return {tenant:"alpha",role:$("reviewer").value};}
function payload(){return {tenant:$("tenant").value,request_id:$("request").value,order:$("order").value,action:"issue_refund",amount:num("amount"),currency:"USD"};}
function render(){
 clear();const rows=[...model.records.values()].map(r=>({request:r.payload.request_id,order:r.payload.order,amount:money(r.payload.amount_cents/100),status:r.status,reviewer:r.reviewer||"—",expires:r.expires===null?"—":new Date(r.expires).toISOString()}));
 metric("Requests",rows.length);metric("Simulated executions",model.executions.size);metric("Approval lifetime","60 seconds");
 table("Review inbox",rows,[["request","Request"],["order","Order"],["amount","Amount"],["status","State"],["reviewer","Reviewed by"],["expires","Expires (UTC)"]]);
 table("Session audit",model.audit,[["sequence","Event"],["request","Tenant / request"],["status","Decision"]]);
 message("Active operator tenant: alpha. Above $100 requires the manager demo role. Change an amount after approval to see payload binding reject execution. Refresh clears this in-memory simulation.");
 lastResult={requests:rows,audit:model.audit,executions:model.executions.size};
}
button("1. Submit request",()=>{const r=model.propose(payload(),actor(),Date.now()+clock);key=r.key;render();});
button("2. Approve",()=>{model.review(key,"APPROVED",actor(),Date.now()+clock);render();});
button("Reject",()=>{model.review(key,"REJECTED",actor(),Date.now()+clock);render();},true);
button("3. Simulate execution",()=>{try{const r=model.execute(payload(),actor(),Date.now()+clock);render();message(r.status+(r.receipt?" · "+r.receipt:""));}catch(e){render();throw e;}});
button("Advance clock 61 seconds",()=>{clock+=61000;message("Demo clock advanced. Execution will reject an expired approval.");},true);
button("Reset session",()=>{model=new Product.Approvals();clock=0;key=null;render();},true);render();

button("Save comparison snapshot",()=>{if(!lastResult)throw new Error("Run the scenario first");saveComparison("Scenario "+(copies.length+1),lastResult);table("Saved comparisons",copies.map(c=>({label:c.label,time:c.at})),[["label","Snapshot"],["time","Captured (UTC)"]]);},true);
button("Download evidence JSON",()=>download("product-evidence.json",{current:lastResult,comparisons:copies,scope:"Independent prototype; synthetic data only"}),true);
