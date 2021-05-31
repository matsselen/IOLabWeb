// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

var showingPairingModal = false;

function openPairModal() {
  showingPairingModal = true;
  console.log("In openPairModal()");
  // await sendRecord(getCommandRecord("getPairing"));
  // await sendRecord(getCommandRecord("getRemoteStatus"));
  updatePairmodalInfo();

  // if (remote1Status==1 && remoteStatus[0]==1) {
  // pairInfo.innerHTML = "Dongle and Remote are paired"
  // } else {
  //   pairInfo.innerHTML = "Dongle and Remote are paired"
  // }

}


function updatePairmodalInfo() {

  // display dongle info 
  if (dongleID > 0) {
    pairInfo.innerHTML = "Dongle 0x" + dongleID.toString(16) + " is connected.";
  } else {
    pairInfo.innerHTML = "No dongle connected.";
  }

  // display remote info if we have it
  if (remote1Status > 0) {

    if (remoteStatus[0]) {
      pairInfo.innerHTML += "  Remote 0x" + remote1ID.toString(16) + " is paired and detected";
    } else {
      pairInfo.innerHTML += "  Remote 0x" + remote1ID.toString(16) + " is paired but is not detected";
    }

  } else {
    pairInfo.innerHTML += "  No remote is paired.";
  }

}

async function endPair() {
  showingPairingModal = false;
  console.log("In endPair()");
  await sendRecord(getCommandRecord("getPairing"));
  //await sendRecord(getCommandRecord("getRemoteStatus"));
}

async function sendPair() {
  let status = 1; // 0=unpair, 1=pair 
  let id0 = foundRemote & 0xFF;
  let id1 = (foundRemote >> 8) & 0xFF;
  let id2 = (foundRemote >> 16) & 0xFF;

  let byteArray = getCommandRecord("startPairing", 1, [status, id2, id1, id0]);
  console.log("In sendPair()");
  await sendRecord(byteArray);

  setTimeout(async function () {
    await sendRecord(getCommandRecord("getPairing"));
    updatePairmodalInfo();  
  }, 100);

}

async function sendUnpair() {
  let status = 0; // 0=unpair, 1=pair 
  let id0 = remote1ID & 0xFF;
  let id1 = (remote1ID >> 8) & 0xFF;
  let id2 = (remote1ID >> 16) & 0xFF;

  let byteArray = getCommandRecord("startPairing", 1, [status, id2, id1, id0]);
  console.log("In sendUnpair()");
  await sendRecord(byteArray);

  setTimeout(async function () {
    await sendRecord(getCommandRecord("getPairing"));
    updatePairmodalInfo();  
  }, 100);

}

async function sendFind() {
  
  console.log("In sendFind()");
  // let byteArray = getCommandRecord("findRemote");
  // await sendRecord(byteArray);
  await sendRecord(getCommandRecord("findRemote"));

}
