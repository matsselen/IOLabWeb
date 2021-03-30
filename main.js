// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

//
// Main code for playing around with IOLab using the Web Serial API
//
'use strict';

// some useflul handles
const butConnect = document.getElementById('butConnect');
const connectImg = document.getElementById('connectImg');
const butSend = document.getElementById('butSend');
const butStartStop = document.getElementById('butStartStop');
const butRestore = document.getElementById('restore');
const debugCK = document.getElementById("debug_ck");
const denugStuff = document.getElementById("debugStuff")
const butDebug = document.getElementById('butDebug');
const dongleStatusDisplay = document.getElementById('dongleStatusDisplay');
const remoteStatusDisplay = document.getElementById('remoteStatusDisplay');
const configSelect = document.getElementById('configSelect');
const cmdPicker = document.getElementById('cmd-picker');
const configPicker = document.getElementById('config-picker');
const dataBoxTx = document.getElementById("dataBoxTx");
const dataBoxRx = document.getElementById("dataBoxRx");
const debugStuff = document.getElementById("debugStuff");
const inputFile = document.getElementById("inputfile");
const calDiv = document.getElementById("calDiv");
const calText = document.getElementById("ttext_p");
const calchooseF = document.getElementById("calChooseF");
const calchooseFtxt = document.getElementById("calChooseFtxt");
const calchooseAMG = document.getElementById("calChooseAMG");
const calchooseAMGtxt = document.getElementById("calChooseAMGtxt");

// calibration modal stuff
const modal = document.getElementById("calModal");
const calButton = document.getElementById("calBtn");
const calBtnImg = document.getElementById("calBtnImg");
const calBtnTxt = document.getElementById("calBtnTxt");
const ccspan = document.getElementsByClassName("closeCal")[0];

// do this when the DOM is first loaded
document.addEventListener('DOMContentLoaded', () => {

  // See if web-serial supported by this browser ?
  const notSupported = document.getElementById('notSupported');
  notSupported.classList.toggle('hidden', 'serial' in navigator);

  // attach event listeners to the buttons & controls on the main page
  butConnect.addEventListener('click', clickConnect);
  butSend.addEventListener('click', clickSend);
  butStartStop.addEventListener('click', clickStartStop);
  butDebug.addEventListener('click', clickDebug);
  inputFile.addEventListener("change", readInputFile);

  // when the calibration modal is invoked
  calButton.onclick = function () { 
    calibrationSetup();
    modal.style.display = "block"; 
  }

  // when the calibration modal is closed
  ccspan.onclick = function () { 
    endCal();
  }
 
  // get things ready to rumble
  getIOLabConfigInfo();
  buildConfigPicker();
  buildCmdPicker();

  // fetch any existing calibrations from browser cookies
  calArrayList = [];
  getCalCookies();

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

  // The checkbox at the top right of the will bring up a debugging menu
  // (including a button that will get you here) if you set "dbgInfo = true"
  console.log("Debug button clicked (put breakpoint here)");


}

function showDebug() {
  debugCK.hidden = false;
  dbgInfo = true;
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
    //butConnect.textContent = "Disconnect Dongle";
    connectImg.src = "images/release.PNG";
    butRestore.hidden = true;

    if (remoteConnected) configSelect.style.display = "block";
  } else {
    //butConnect.textContent = "Connect to Dongle";
    connectImg.src = "images/connect.PNG";
    configSelect.style.display = "none";
    butRestore.hidden = false;
  }

  // decide what text is shown on the send button
  if (current_cmd == "setFixedConfig") {
    butSend.textContent = "Configure";
  } else {
    butSend.textContent = "Send Command";
    daqConfigured = false;
  }

  // display dongle info if we have it
  if (dongleID > 0) {
    dongleStatusDisplay.innerHTML = "0x" + dongleID.toString(16);
  } else {
    dongleStatusDisplay.innerHTML = "not connected";
  }

  // display remote info if we have it
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

  // display the start button if the daq is configured
  if (daqConfigured) {
    butStartStop.hidden = false;
  } else {
    butStartStop.hidden = true;
  }

  // if we are running the start button becomes the stop button
  if (runningDAQ) {
    butStartStop.textContent = "Stop";
    butSend.hidden = true;
  } else {
    butStartStop.textContent = "Start";
    butSend.hidden = false;  }

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


