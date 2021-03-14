// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

//
// Main code for playing around with IOLab using the Web Serial API
//
'use strict';

// some useflul handles
const butConnect = document.getElementById('butConnect');
const butSend = document.getElementById('butSend');
const butStartStop = document.getElementById('butStartStop');
const butDebug = document.getElementById('butDebug');
const dongleStatusDisplay = document.getElementById('dongleStatusDisplay');
const remoteStatusDisplay = document.getElementById('remoteStatusDisplay');
const configSelect = document.getElementById('configSelect');
const cmdPicker = document.getElementById('cmd-picker');
const dataBoxTx = document.getElementById("dataBoxTx");
const dataBoxRx = document.getElementById("dataBoxRx");
const debugStuff = document.getElementById("debugStuff");
const inputFile = document.getElementById("inputfile");

// modal test
// Get the modal
var modal = document.getElementById("calModal");

// Get the button that opens the modal
var btn = document.getElementById("calBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("closeCal")[0];


// do this when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

  // modal test

  // When the user clicks the button, open the modal 
  btn.onclick = function () {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


  // See if web-serial supported by this browser ?
  const notSupported = document.getElementById('notSupported');
  notSupported.classList.toggle('hidden', 'serial' in navigator);

  // attach event listeners to the buttons & controls on the main page
  butConnect.addEventListener('click', clickConnect);
  butSend.addEventListener('click', clickSend);
  butStartStop.addEventListener('click', clickStartStop);
  butDebug.addEventListener('click', clickDebug);
  inputFile.addEventListener("change", readInputFile);

  // get things ready to rumble
  getIOLabConfigInfo();
  buildConfigPicker();
  buildCmdPicker();

  // fetch any existing calibrations from browser cookies
  calArrayList = [];
  getCalCookies();
  console.log(calArrayList);

  // create canvas stacks and layers for charts and set these up
  setupControls();
  resetAcquisition();

  // update the UI
  updateSystemState();

});

//============================================
// event handler for connect/disconnect button  
async function clickConnect() {

  // if we are already connected then disconnect
  if (port != null) {
    if (runningDAQ) {
      console.log("Don't disconnect while running !");
      return;
    } else {
      await disconnectAndStop();
      updateSystemState();
      return;
    }
  }

  // otherwise try connecting
  await connectAndStart();
}

//============================================
// event handler for Send/Configure button  
async function clickSend() {

  // get the current command string
  if ((current_cmd == "setFixedConfig") && (current_config_code == -1)) return;

  let byteArray = getCommandRecord(current_cmd);
  console.log(byteArray);
  await sendRecord(byteArray);

  if (current_cmd == "setFixedConfig") {
    setTimeout(async function () {
      byteArray = getCommandRecord("getPacketConfig");
      console.log(byteArray);
      await sendRecord(byteArray);
    }, 100);

    // remove any existing plots
    if (plotSet != null) {
      plotSet.reset();
      plotSet = null;
      resetAcquisition();
    }

    // get the current fixed configuration 
    let fixedConfigObject = fixedConfigList[current_config_code];
    currentFCobject = fixedConfigObject;

    // create a list of sensors to be used by the data processing code and keep track of sample rates
    sensorIDlist = fixedConfigObject.sensList;
    sensorRateList = fixedConfigObject.rateList;

    // create a list of charts (by sensor ID) to be plotted
    chartIDlist = fixedConfigObject.chartList;

    // create the required plot objects
    plotSet = new PlotSet(chartIDlist, "plotContainer", "controlContainer");
  }
}

//============================================
// event handler for Start/Stop button 
async function clickStartStop() {

  if (!runningDAQ) {// start DAQ if we are not already running
    startRun();
  } else {// stop DAQ and plotting if we are running
    stopRun();
  }
  updateSystemState();
}


//============================================
// event handler for Debug button  
async function clickDebug() {

  console.log("Debug button clicked (put breakpoint here)");
  //setCalCookieTest();

  //location.reload();
  //resetAcquisition();
  //runForSeconds(2000);
  //window.dispatchEvent(new Event('resize'));
  //serialConnected = !serialConnecteds;
  //remoteConnected = !remoteConnected;
  //updateSystemState();
  //plotSet.reset();
  //plotSet = null;

}

//===============================================
// update the look and content of the UI based on 
// the state of the data acquisition system
function updateSystemState() {

  if (showCommands) {
    cmdPicker.style.visibility = "visible";
  } else {
    cmdPicker.style.visibility = "hidden";
  }

  if (serialConnected) {
    butConnect.textContent = "Disconnect Dongle";
    if (remoteConnected) configSelect.style.display = "block";
  } else {
    butConnect.textContent = "Connect to Dongle";
    configSelect.style.display = "none";
  }

  if (current_cmd == "setFixedConfig") {
    butSend.textContent = "Configure";
  } else {
    butSend.textContent = "Send Command";
    daqConfigured = false;
  }

  if (dongleID > 0) {
    dongleStatusDisplay.innerHTML = "0x" + dongleID.toString(16);
  } else {
    dongleStatusDisplay.innerHTML = "not connected";
  }

  if ((remote1ID > 0) && (remoteStatus[0])) {
    remoteStatusDisplay.innerHTML = "0x" + remote1ID.toString(16) +
      " (" + remoteVoltage[0].toFixed(2) + " V)";
    remoteConnected = true;
    // get the cal values needed by this remote, if they exist (just remote 1 [0] for now)
    if (notFetchedCal[0]) {
      notFetchedCal[0] = false;
      setCalValues(0, remote1ID);
    }
    configSelect.style.display = "block";

  } else {
    remoteConnected = false;
    configSelect.style.display = "none";
    remoteStatusDisplay.innerHTML = "off";
  }

  if (daqConfigured) {
    butStartStop.hidden = false;
  } else {
    butStartStop.hidden = true;
  }

  if (runningDAQ) {
    butStartStop.textContent = "Stop";
  } else {
    butStartStop.textContent = "Start";
  }

  // if we just turned on the remote, fetch info about it
  if (justTurnedOnRemote) {
    justTurnedOnRemote = false;

    // try to fetch the status of the remote
    setTimeout(async function () {
      // get remote status
      let byteArray = getCommandRecord("getRemoteStatus");
      console.log(byteArray);
      await sendRecord(byteArray);

    }, 100);
  }

}


