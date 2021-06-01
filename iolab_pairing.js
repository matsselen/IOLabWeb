// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

var showingPairingModal = false;

// called when the pairing modal is opened
function openPairModal() {
  console.log("In openPairModal()");
  showingPairingModal = true;

  pairUnpair.hidden = true; pairFind.hidden = true; pairInst.hidden = true;
  updatePairmodalInfo();
}

// displays the status of the dongle and remote on the pairing modal
function updatePairmodalInfo() {

  // display dongle info 
  if (dongleID > 0) {
    pairInfo.innerHTML = "Dongle " + dongleID.toString(16) + " is detected.";
  } else {
    pairInfo.innerHTML = "No dongle detected. Close this dialog, make sure a dongle is plugged in, and click CONNECT.";
    return;
  }

  // display remote info if we have it
  if (remote1Status > 0) {
    pairUnpair.hidden = false; pairFind.hidden = true;  pairInst.hidden = true;

    if (remoteStatus[0]) {
      pairInfo.innerHTML += " It is paired to Remote " + remote1ID.toString(16) + " which is also detected";
    } else {
      pairInfo.innerHTML += " It is paired to Remote " + remote1ID.toString(16) + " which is not detected (perhaps it is not turmed on ?)";
    }

  } else {
    pairInfo.innerHTML += " It is not paired to a Remote.";
    pairUnpair.hidden = true; pairFind.hidden = false;  pairInst.hidden = false;
  }

}

// called when the pairing modal is closed
async function closePairModal() {
  showingPairingModal = false;
  console.log("In closePairModal()");

}

// sends a command to the system to pair a remote with a dongle
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

// unpair the current remote
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

// finds any nearby remote in discovery mode and pairs with it
async function sendFind() {
  console.log("In sendFind()");

  foundRemote = 0;
  setTimeout(async function () {
    await sendRecord(getCommandRecord("findRemote"));
  }, 100);

  setTimeout(async function () {
    if (foundRemote > 0) {
      await sendPair();
    } else {
      console.log("Remote not found");
    }
  }, 200);

}
