//
// Move some of the run control stuff in there
//
'use strict';

//============================================================
// run the DAQ for mSeconds milliseconds
function runForSeconds(mSeconds) {
    console.log("Running for " + mSeconds + " milliseconds.")
    startRun();
    fixedRunTimerID = setInterval(stopFixedRun, mSeconds);
    updateSystemState();
}

// this is called at the end of a fixed interval acquisition
function stopFixedRun() {
    clearInterval(fixedRunTimerID);
    stopRun()
    updateSystemState();
}

//============================================================
// start recording data
async function startRun() {
    console.log("Start runnung");

    // prepare all charts for acquisition
    plotSet.startAcquisition();

    // set the runningDAQ flag send a startData record to the system
    runningDAQ = true;
    await sendRecord(getCommandRecord("startData"));

    // update the data plots every plotTimerMS ms
    plotTimerID = setInterval(plotNewData, plotTimerMS);

    // keep track whether this is a restart or a first time start
    if (lastFrame > 0) justRestarted = true;
}

//============================================================
// stop recording data
async function stopRun() {
    console.log("Stop runnung");

    // clear the runningDAQ flag send a startData record to the system
    runningDAQ = false;
    await sendRecord(getCommandRecord("stopData"));

    // stop updating the data plots
    clearInterval(plotTimerID);

    // do end of acquiaition stuff and display the plots
    plotSet.stopAcquisition();
    plotSet.displayPlots();
}

// plots new data (called above)
function plotNewData() {

    // plot data from whatever sensors are selected 
    plotSet.plotRunningData();

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
    await port.open({ baudRate: 115200, baudrate: 115200 });
    // yes - you need both if you want it to run on Chromebooks

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

//============================================
// send a byte array to the serial port
async function sendRecord(byteArray) {
    if (port != null) {
        dataBoxTx.innerHTML += byteArray + '\n';

        if (byteArray[1] == 0x21) {
            stopTime = Date.now();
            lastRunTime = (stopTime - startTime);
            totalRunTime += lastRunTime;
        }
        writer.write(byteArray.buffer);

        if (byteArray[1] == 0x20) {
            startTime = Date.now();
        }
    } else {
        console.log("sendRecord: serial port is not open");
    }
}
