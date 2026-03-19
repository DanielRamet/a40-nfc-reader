import { db } from "./firebase.js";

import {
doc,
getDoc,
setDoc,
updateDoc,
collection,
query,
orderBy,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody=document.getElementById("tableBody");
const button=document.getElementById("scanButton");

const scansQuery=query(
collection(db,"scans"),
orderBy("count","desc")
);

onSnapshot(scansQuery,(snapshot)=>{

tableBody.innerHTML="";

let ranking=[];

snapshot.forEach((docItem)=>{
ranking.push(docItem.data());
});

updatePodium(ranking);

ranking.forEach((data,index)=>{

const date=new Date(data.lastScan);
const time=date.toLocaleTimeString();

const row=document.createElement("tr");

row.innerHTML=
`
<td>${index+1}</td>
<td>${data.uid}</td>
<td>${data.count}</td>
<td>${time}</td>
`;

tableBody.appendChild(row);

});

});

function updatePodium(ranking){

const first=ranking[0];
const second=ranking[1];
const third=ranking[2];

if(first){
document.querySelector("#first .name").textContent=first.uid;
document.querySelector("#first .score").textContent=first.count;
}

if(second){
document.querySelector("#second .name").textContent=second.uid;
document.querySelector("#second .score").textContent=second.count;
}

if(third){
document.querySelector("#third .name").textContent=third.uid;
document.querySelector("#third .score").textContent=third.count;
}

}

button.addEventListener("click",simulateScan);

async function simulateScan(){

const randomUID="bracelet_"+Math.floor(Math.random()*5+1);

const ref=doc(db,"scans",randomUID);

const snap=await getDoc(ref);

const now=Date.now();
const cooldown=480000;

if(!snap.exists()){

await setDoc(ref,{
uid:randomUID,
count:1,
lastScan:now
});

}else{

const data=snap.data();

if(now-data.lastScan>cooldown){

await updateDoc(ref,{
count:data.count+1,
lastScan:now
});

}

}

}