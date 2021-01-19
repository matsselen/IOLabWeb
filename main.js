//
// Code for playing around with IOLab using the Web Serial API
//
'use strict';

//var accPlotClass = null;
var plotSet = null;

let port = null;
let reader = null;
let writer = null;

const butConnect = document.getElementById('butConnect');
const butSend = document.getElementById('butSend');
const butStartStop = document.getElementById('butStartStop');
const butDebug = document.getElementById('butDebug');
const dongleStatusDisplay = document.getElementById('dongleStatusDisplay');
const remoteStatusDisplay = document.getElementById('remoteStatusDisplay');
const testContainer = document.getElementById('testContainer');

const dataBoxTx = document.getElementById("dataBoxTx");
const dataBoxRx = document.getElementById("dataBoxRx");

const debugStuff = document.getElementById("debugStuff");
const inputFile = document.getElementById("inputfile");

// do this when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

  // attach event listeners to the buttons
  butConnect.addEventListener('click', clickConnect);
  butSend.addEventListener('click', clickSend);
  butStartStop.addEventListener('click', clickStartStop);
  butDebug.addEventListener('click', clickDebug);

  inputFile.addEventListener("change", readInputFile);

  buildConfigPicker();
  buildCmdPicker();

  // See if web-serial supported by this browser ?
  const notSupported = document.getElementById('notSupported');
  notSupported.classList.toggle('hidden', 'serial' in navigator);

  // create canvas stacks and layers for charts and set these up
  setupControls();
  resetAcquisition();

  // test IOLabPlot class
  plotSet = new PlotSet(sensorIDlist, "testContainer");

  // update the UI
  updateSystemState();

});

//============================================
// when the connect/disconnect button is clicked 
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
// when the send button is clicked 
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
  }
}

//============================================
// when the Start/Stop button is clicked 
async function clickStartStop() {

  // start DAQ if we are not already running
  if (!runningDAQ) {
    console.log("Start runnung");

    plotSet.startAcquisition();

    // set the runningDAQ flag send a startData record to the system
    runningDAQ = true;
    await sendRecord(getCommandRecord("startData"));

    // update the data plots every plotTimerMS ms
    plotTimerID = setInterval(plotNewData, plotTimerMS);

    // keep track whether this is a restart or a first time start
    if (lastFrame > 0) justRestarted = true;


    // stop DAQ and plotting if we are running
  } else {
    console.log("Stop runnung");

    // clear the runningDAQ flag send a startData record to the system
    runningDAQ = false;
    await sendRecord(getCommandRecord("stopData"));

    // stop updating the data plots
    clearInterval(plotTimerID);

    // display static data
    plotSet.stopAcquisition();

  }

  updateSystemState();

}

// plots new data (called above)
function plotNewData() {

  // plot data from whatever sensors are selected 
  plotSet.plotRunningData();
  //accPlotClass.plotRunningData();

}

//============================================
// when the Debug button is clicked 
async function clickDebug() {
  console.log("Debug button clicked (put breakpoint here)");
  //window.dispatchEvent(new Event('resize'));
  //xxx = new PlotIOLab(1,"testContainer");
  //xxx.testFunc();
  //accPlotClass = new PlotIOLab(1,"testContainer");
  //accPlotClass.testClass();
  while (testContainer.childNodes.length > 0) {
    testContainer.childNodes[0].remove();
  }
  plotSet = null;

}




//============================================
// send a byte array to the serial port
async function sendRecord(byteArray) {
  if (port != null) {
    dataBoxTx.innerHTML += byteArray + '\n';
    writer.write(byteArray.buffer);
    console.log("In sendRecord: ", byteArray);
    console.log("Date.now: ", Date.now(), " performance.now() ", performance.now());
  } else {
    console.log("sendRecord: serial port is not open");
  }
}

//============================================================================
// connect to the serial port, set up the writer and reader, and start reading
async function connectAndStart() {

  // Request a serial port and open a connection to an IOLab dongle.
  try {
    port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x1881 }] });
  } catch (e) {
    console.log("No port selected - returning");
    return false;
  }

  // Open the serial port
  console.log("Opening port");
  await port.open({ baudRate: 115200 });

  // Create a reader and a writer
  writer = port.writable.getWriter();
  reader = port.readable.getReader();

  serialConnected = true;

  // The "readLoop()" function called below will read data from the serial port and
  // put these in a buffer for further analysis, which will be done at degular time
  // intervals by the code here: 

  // Look for new data
  rawRecordTimerID = setInterval(extractRecords, rawRecordTimerMS);

  // Analyze new data
  calRecordTimerID = setInterval(buildAndCalibrate, calRecordTimerMS);

  // see if there is a dongle plugged in 
  // (the 100 ms delay will do this after read-loop starts)
  setTimeout(async function () {
    let byteArray = getCommandRecord("getDongleStatus");
    console.log(byteArray);
    await sendRecord(byteArray);
  }, 100);

  // see if there is a paired remote paired with this dongle
  // (the 100 ms delay will do this after read-loop starts)
  setTimeout(async function () {
    let byteArray = getCommandRecord("getPairing");
    console.log(byteArray);
    await sendRecord(byteArray);
  }, 100);

  // see if we can fetch the status of the paired remote
  // (the 100 ms delay will do this after read-loop starts)
  setTimeout(async function () {
    let byteArray = getCommandRecord("getRemoteStatus");
    console.log(byteArray);
    await sendRecord(byteArray);
  }, 100);

  // update the UI
  updateSystemState();

  // Launch the reading loop. This runs forever (until the serial port is disconnected).
  await readLoop();

  // If we leave the read loop it must be all over
  console.log("Elvis has left the building")

}

//=================================================================
// Disconnect from the serial port and stop reading and processing
async function disconnectAndStop() {
  console.log("Entering disconnectAndStop()");

  // stop the timers
  clearInterval(rawRecordTimerID);
  clearInterval(calRecordTimerID);
  clearInterval(plotTimerID);

  console.log("Turn off remote 1");
  await sendRecord(getCommandRecord("powerDown"));

  writer.releaseLock();
  try {
    await reader.cancel();
  } catch {
    console.log("error canceling the reader");
  }

  // close the serial port & clean up a bit
  await port.close();

  // reset control variables 
  port = null;
  reader = null;
  writer = null;

  justRestarted = false;
  runningDAQ = false;
  daqConfigured = false;
  serialConnected = false;

  dongleStatus = 0;
  dongleID = 0;
  remote1Status = 0, remote2Status = 0;
  remote1ID = 0, remote2ID = 0;

}

//=======================================================
// Read any data records that arrive via the serial port 
// and add these to the rxdata array.
async function readLoop() {

  while (port != null) {

    try {
      const { value, done } = await reader.read();

      if (value) {
        // save received data rxdata list
        for (let i = 0; i < value.length; i++) {
          rxdata[writePointer++] = value[i];
        }
        // write Rx control records to Rx box (but not async data records)
        if (!runningDAQ && value[0] == 2) { dataBoxRx.innerHTML += value + '\n'; }
      }

      if (done) {
        console.log('Release Roderick');
        reader.releaseLock();
        return;
      }

    } catch (e) {
      console.log("Error fetching data in readLoop");
    }

  }

}

//===============================================
// update the look and content of the UI based on 
// the state of the data acquisition system
function updateSystemState() {

  if (serialConnected) {
    butConnect.textContent = "Disconnect Serial Port";
    butSend.hidden = false;
  } else {
    butConnect.textContent = "Connect to Serial Port";
    butSend.hidden = true;
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
  } else {
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


