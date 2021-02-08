//
// Code for playing around with IOLab using the Web Serial API
//
'use strict';

// some useflul handles
const butConnect          = document.getElementById('butConnect');
const butSend             = document.getElementById('butSend');
const butStartStop        = document.getElementById('butStartStop');
const butDebug            = document.getElementById('butDebug');
const dongleStatusDisplay = document.getElementById('dongleStatusDisplay');
const remoteStatusDisplay = document.getElementById('remoteStatusDisplay');
const configSelect        = document.getElementById('configSelect');
const cmdPicker           = document.getElementById('cmd-picker');
const dataBoxTx           = document.getElementById("dataBoxTx");
const dataBoxRx           = document.getElementById("dataBoxRx");
const debugStuff          = document.getElementById("debugStuff");
const inputFile           = document.getElementById("inputfile");

// do this when the DOM is loaded
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

  // get things ready to rumble
  getIOLabConfigInfo();
  buildConfigPicker();
  buildCmdPicker();

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

    // create a list of sensors to be used by the data processing code
    sensorIDlist = fixedConfigObject.sensList;

    // create a list of charts (by sensor ID) to be plotted
    chartIDlist = fixedConfigObject.chartList;

    // create the required plot objects
    plotSet = new PlotSet(chartIDlist, "plotContainer");
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
  resetAcquisition();
  //runForSeconds(2000);
  //window.dispatchEvent(new Event('resize'));
  //serialConnected = true;
  updateSystemState();
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
    butConnect.textContent = "Disconnect Serial Port";
    if (remoteConnected) configSelect.style.display = "block";
  } else {
    butConnect.textContent = "Connect to Serial Port";
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
    dongleStatusDisplay.innerHTML = "none";
  }

  if ((remote1ID > 0) && (remoteStatus[0])) {
    remoteStatusDisplay.innerHTML = "0x" + remote1ID.toString(16) +
      " (" + remoteVoltage[0].toFixed(2) + " V)";
    remoteConnected = true;
    configSelect.style.display = "block";
  } else {
    remoteConnected = false;
    configSelect.style.display = "none";
    remoteStatusDisplay.innerHTML = "none";
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
      let byteArray = getCommandRecord("getRemoteStatus");
      console.log(byteArray);
      await sendRecord(byteArray);
    }, 100);

  }
}


