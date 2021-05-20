// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

function openPairModal() {

}

function endPair() {

}

function sendPair() {

}

function sendUnpair() {
  let status = 0; // 0=unpair, 1=pair 
  let id0 = remote1ID & 0xFF;
  let id1 = (remote1ID>>8) & 0xFF;
  let id2 = (remote1ID>>16) & 0xFF;

  byteArray = getCommandRecord(1, [status,id2,id1,id0], "getPacketConfig");
  console.log(byteArray);
  await sendRecord(byteArray);
}

function sendFind() {

}
