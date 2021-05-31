// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

var showingPairingModal = false;

function openPairModal() {
  console.log("In openPairModal()");
  showingPairingModal = true;

  pairUnpair.hidden = true; pairPair.hidden = true; pairFind.hidden = true;
  updatePairmodalInfo();
}


function updatePairmodalInfo() {

  // display dongle info 
  if (dongleID > 0) {
    pairInfo.innerHTML = "Dongle " + dongleID.toString(16) + " is detected";
  } else {
    pairInfo.innerHTML = "No dongle detected. Close this dialog, plug in dongle if needed, and click CONNECT.";
    return;
  }

  // display remote info if we have it
  if (remote1Status > 0) {
    pairUnpair.hidden = false; pairPair.hidden = true; pairFind.hidden = true;

    if (remoteStatus[0]) {
      pairInfo.innerHTML += " and paired to Remote " + remote1ID.toString(16) + ", which is also detected";
    } else {
      pairInfo.innerHTML += " and paired to Remote " + remote1ID.toString(16) + ", which is not detected (perhaps it is off ?)";
    }

  } else {
    pairInfo.innerHTML += " and is not paired to a Remote.";
    pairUnpair.hidden = true; pairPair.hidden = false; pairFind.hidden = false;
  }

}

async function closePairModal() {
  showingPairingModal = false;
  console.log("In closePairModal()");

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
