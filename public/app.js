import { db } from "./firebase.js";

import {
doc,
getDoc,
setDoc,
updateDoc,
collection,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const list = document.getElementById("list");
const button = document.getElementById("scanButton");

const scansCollection = collection(db,"scans");

onSnapshot(scansCollection,(snapshot)=>{

    list.innerHTML="";

    snapshot.forEach((docItem)=>{

        const data = docItem.data();

        const li=document.createElement("li");
        li.textContent=data.uid+" → "+data.count;

        list.appendChild(li);

    });

});

button.addEventListener("click",simulateScan);

async function simulateScan(){

    const randomUID="bracelet_"+Math.floor(Math.random()*3+1);

    const ref=doc(db,"scans",randomUID);

    const snap=await getDoc(ref);

    if(!snap.exists()){

        await setDoc(ref,{
            uid:randomUID,
            count:1
        });

    }else{

        const current=snap.data().count;

        await updateDoc(ref,{
            count:current+1
        });

    }

}