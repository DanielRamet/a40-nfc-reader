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

const list = document.getElementById("list");
const button = document.getElementById("scanButton");

const scansQuery = query(
    collection(db,"scans"),
    orderBy("count","desc")
);

onSnapshot(scansQuery,(snapshot)=>{

    list.innerHTML="";

    snapshot.forEach((docItem)=>{

        const data=docItem.data();

        const date=new Date(data.lastScan);

        const time=date.toLocaleTimeString();

        const li=document.createElement("li");

        li.textContent=
        data.uid+
        " → "+data.count+
        " (último: "+time+")";

        list.appendChild(li);

    });

});

button.addEventListener("click",simulateScan);

async function simulateScan(){

    const randomUID="bracelet_"+Math.floor(Math.random()*3+1);

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

        if(now - data.lastScan > cooldown){

            await updateDoc(ref,{
                count:data.count+1,
                lastScan:now
            });

        }else{

            console.log("Scan ignorado (cooldown)");

        }

    }

}