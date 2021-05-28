// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

function openPairModal() {
  console.log("In openPairModal()");


  // if (remote1Status==1 && remoteStatus[0]==1) {
  // pairInfo.innerHTML = "Dongle and Remote are paired"
  // } else {
  //   pairInfo.innerHTML = "Dongle and Remote are paired"
  // }

}

async function endPair() {
  console.log("In endPair()");
  await sendRecord(getCommandRecord("getPairing"));
  await sendRecord(getCommandRecord("getRemoteStatus"));
}

async function sendPair() {
  let status = 1; // 0=unpair, 1=pair 
  let id0 = foundRemote & 0xFF;
  let id1 = (foundRemote >> 8) & 0xFF;
  let id2 = (foundRemote >> 16) & 0xFF;

  let byteArray = getCommandRecord("startPairing", 1, [status, id2, id1, id0]);
  console.log("In sendPair()");
  await sendRecord(byteArray);

}

async function sendUnpair() {
  let status = 0; // 0=unpair, 1=pair 
  let id0 = remote1ID & 0xFF;
  let id1 = (remote1ID >> 8) & 0xFF;
  let id2 = (remote1ID >> 16) & 0xFF;

  let byteArray = getCommandRecord("startPairing", 1, [status, id2, id1, id0]);
  console.log("In sendUnpair()");
  await sendRecord(byteArray);
}

async function sendFind() {
  let byteArray = getCommandRecord("findRemote");
  console.log("In sendFind()");
  await sendRecord(byteArray);

}
