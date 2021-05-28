// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

//
// Main code for playing around with IOLab using the Web Serial API
//
'use strict';

// some useflul html element handles
const titleText = document.getElementById('titleText');
const butConnect = document.getElementById('butConnect');
const connectImg = document.getElementById('connectImg');
const butSend = document.getElementById('butSend');
const butStartStop = document.getElementById('butStartStop');
const butRestore = document.getElementById('restore');
const debugCK = document.getElementById("debug_ck");
const butSave = document.getElementById("save");
const denugStuff = document.getElementById("debugStuff")
const butDebug = document.getElementById('butDebug');
const dongleStatusDisplay = document.getElementById('dongleStatusDisplay');
const remoteStatusDisplay = document.getElementById('remoteStatusDisplay');

const configSelect = document.getElementById('configSelect');
const cmdPicker = document.getElementById('cmd-picker');
const configPicker = document.getElementById('config-picker');

const dacCtl = document.getElementById('dacCtl');
const dacPicker = document.getElementById('dacPicker');
const dacCK = document.getElementById('dacCK');
const dacUp = document.getElementById('dacUp');
const dacDN = document.getElementById('dacDn');
const dispDac = document.getElementById('dispDac');


const bzzCtl = document.getElementById('bzzCtl');
const bzzPicker = document.getElementById('bzzPicker');
const bzzCK = document.getElementById('bzzCK');
const dispBzz = document.getElementById('dispBzz');

const d4Ctl = document.getElementById('d4Ctl');
const d4Picker = document.getElementById('d4Picker');
const d4CK = document.getElementById('d4CK');
const dispD4 = document.getElementById('dispD4');

const d5Ctl = document.getElementById('d5Ctl');
const d5Picker = document.getElementById('d5Picker');
const d5CK = document.getElementById('d5CK');
const dispD5 = document.getElementById('dispD5');

const d6Ctl = document.getElementById('d6Ctl');
const d6CK = document.getElementById('d6CK');
const dispD6 = document.getElementById('dispD6');

const dataBoxTx = document.getElementById("dataBoxTx");
const dataBoxRx = document.getElementById("dataBoxRx");
const debugStuff = document.getElementById("debugStuff");
const inputFile = document.getElementById("inputfile");
const downloadData = document.getElementById("downloadData");

const calDiv = document.getElementById("calDiv");
const calText = document.getElementById("ttext_p");
const calchooseF = document.getElementById("calChooseF");
const calchooseFtxt = document.getElementById("calChooseFtxt");
const calchooseAMG = document.getElementById("calChooseAMG");
const calchooseAMGtxt = document.getElementById("calChooseAMGtxt");

// calibration modal stuff
const calModal = document.getElementById("calModal");
const calButton = document.getElementById("calBtn");
const calBtnImg = document.getElementById("calBtnImg");
const calBtnTxt = document.getElementById("calBtnTxt");
const ccspan = document.getElementsByClassName("closeCal")[0];

// option modal stuff
const optModal = document.getElementById("optModal");
const optButton = document.getElementById("optBtn");
const cospan = document.getElementsByClassName("closeOpt")[0];
const bzLocal = document.getElementById("bzLocal");

// pairing modal stuff
const pairModal = document.getElementById("pairModal");
const pairButton = document.getElementById("pairBtn");
const cpspan = document.getElementsByClassName("closePair")[0];

// ticks
const tickCounter = document.getElementById("tickCounter");
const timeoutPicker = document.getElementById("timeoutPicker");

// do this when the DOM is first loaded
document.addEventListener('DOMContentLoaded', () => {

  // display the version number on the browser tab
  titleText.innerHTML = "IOLab Web v" +
    currentVersion[0].toString() + "." +
    currentVersion[1].toString() + "." +
    currentVersion[2].toString();

  // See if web-serial supported by this browser ?
  const notSupported = document.getElementById('notSupported');
  notSupported.classList.toggle('hidden', 'serial' in navigator);

  // attach event listeners to the buttons & controls on the main page
  butConnect.addEventListener('click', clickConnect);
  butSend.addEventListener('click', clickSend);
  butStartStop.addEventListener('click', clickStartStop);
  butDebug.addEventListener('click', clickDebug);
  inputFile.addEventListener("change", readInputFile);
  downloadData.addEventListener('click', saveToFile);

  window.onbeforeunload = function () {
    sendRecord(getCommandRecord("powerDown"));
    // leave page after a delay to give the shutdown command time to finish
    setTimeout(async function () {
      console.log("Leaving App and turning off remote 1");
    }, 200);
  };

  // fetch option from cookie if possible
  initializeOptions();

  // when the calibration modal is invoked
  calButton.onclick = function () {
    calibrationSetup();
    calModal.style.display = "block";
  }

  // when the calibration modal is closed
  ccspan.onclick = function () {
    endCal();
  }

  // when the options modal is invoked
  optButton.onclick = function () {
    openOptModal();
    optModal.style.display = "block";
  }

  // when the option modal is closed
  cospan.onclick = function () {
    endOpt();

  }  // when the pairing modal is invoked
  pairButton.onclick = function () {
    if (serialConnected) {
    openPairModal();
    pairModal.style.display = "block";
    } else {
      window.alert("You need to CONNECT with your dongle before you can do this");
    }
  }

  // when the pairing modal is closed
  cpspan.onclick = function () {
    pairModal.style.display = "none";
    endPair();
  }


  // get things ready
  getIOLabConfigInfo();
  buildConfigPicker();
  buildCmdPicker();
  buildDacPicker();
  buildD4Picker();
  buildD5Picker();
  buildD6control();
  buildBzzPicker();
  buildTimeoutPicker();
  buildBvertControl();

  // fetch any existing calibrations from browser cookies
  calArrayList = [];
  getCalCookies();

  // Set up the debugging controls (hidden by defaults)
  setupDebug();

  // create & reset the data acquisition arrays
  resetAcquisition();

  // update the UI
  updateSystemState();

});

//============================================
// event handler for connect/disconnect button  
async function handleTick() {
  totalTicks ++;
  if(!runningDAQ) { idleTicks -= idleIncrement };
  tickCounter.innerHTML = "Inactivity Timeout "+idleTicks.toString();

  if (idleTicks <= 0) {
    sendRecord(getCommandRecord("powerDown"));
    console.log("Inactivity timeout");
    idleTicks = idleTimeoutCount; 
    idleIncrement = 0;
  }

}

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
  await sendRecord(byteArray);

  if (current_cmd == "setFixedConfig") {
    setTimeout(async function () {
      byteArray = getCommandRecord("getPacketConfig");
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
    //chartIDlist = fixedConfigObject.chartList;

    // create the required plot objects
    plotSet = new PlotSet(fixedConfigObject, "plotContainer", "controlContainer");
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

  // to display debug button type "showDebug()" in the console and the select the 
  // checkbox that appears at the top right of the window
  console.log("Debug button clicked (put breakpoint here)");
}

// action of the reset button
function resetApp() {
  console.log("Reload App");
  location.reload();
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
      console.log("In updateSystemState(): Set initial calibration" );
    }
    configSelect.style.display = "block";    
    idleIncrement = 1;


  } else {
    remoteConnected = false;
    configSelect.style.display = "none";
    remoteStatusDisplay.innerHTML = "off";
    idleIncrement = 0;
    idleTicks = idleTimeoutCount; 
  }

  // display the start button if the daq is configured
  if (daqConfigured) {
    butStartStop.hidden = false;
  } else {
    butStartStop.hidden = true;
  }

  // if we are running the start button becomes the stop button
  if (runningDAQ) {
    butStartStop.textContent = "Stop/Pause";
    butSend.hidden = true;
  } else {
    butStartStop.textContent = "Record";
    butSend.hidden = false;
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


