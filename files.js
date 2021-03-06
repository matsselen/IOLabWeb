// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// save to a file
function saveToFile() {

    let runSeconds = totalRunTime / 1000;
    let date = new Date();

    appMetaData.runSeconds = runSeconds;
    appMetaData.date = date;
    appMetaData.calAccelConst = calAccelConst;
    appMetaData.calAccelTime = calAccelTime;
    appMetaData.calMagConst = calMagConst;
    appMetaData.calMagTime = calMagTime;
    appMetaData.calGyroConst = calGyroConst;
    appMetaData.calGyroTime = calGyroTime;
    appMetaData.calForceConst = calForceConst;
    appMetaData.calForceTime = calForceTime;
    appMetaData.appVersion = currentVersion;

    // push any metadata plus current fixed config object onto the bottom of the calData array
    rxdata.unshift(currentFCobject);
    rxdata.unshift(appMetaData);
    let jdata = JSON.stringify(rxdata);

    // put calData back the way it was
    rxdata.shift();
    rxdata.shift();

    // figure out the filename for the save file
    let configDesc = "noconfig";
    if (currentFCobject != null) {
        configDesc = currentFCobject.desc;
    }

    let fName = "IOLab_" +
        date.toDateString().substr(4, 3) + "-" +
        date.toDateString().substr(8, 2) + "-" +
        date.toDateString().substr(11, 4) + "_" +
        date.toTimeString().substr(0, 2) + "." +
        date.toTimeString().substr(3, 2) + "." +
        date.toTimeString().substr(6, 2) + "_" +
        configDesc + "_" +
        runSeconds.toFixed(0) + "s.iozip";

    let zip = new JSZip();
    zip.file("data.json", jdata);

    zip.generateAsync({ // uses jszip.jz
        type: "blob", compression: "DEFLATE",
        compressionOptions: { level: 9 } })
    .then (
        function success(content) {
            saveAs(content, fName); // uses FileSaver.js           
        },
        function error(e) {
            console.log("Error saving zip file");
            console.log(e);
        }
    );
}

// reads back rxdata from a file and 
async function readInputFile() {

    resetAcquisition();

    if (dbgInfo) {
        console.log("Will unzip the first file in this list:");
        console.log(this.files);
    }

    JSZip.loadAsync(this.files[0]).then(function (zip) {

        zip.file("data.json").async("text").then(function success(content) {
            // calData = JSON.parse(content);
            rxdata = JSON.parse(content);
            if (dbgInfo) {
                // console.log(calData);
                console.log(rxdata);
            }

            restoreAcquisition();

        }, function error(e) {
            console.log("Error unzipping");
            console.log(e);
        })
    });
}

function restoreAcquisition() {

    // exctact the fixed config object and restore the calibrated data
    currentFCobject = rxdata[1];
    appMetaData = rxdata[0];
    rxdata.shift();
    rxdata.shift();

    // set the calibration constants to the values used in the saved data
    calAccelConst = appMetaData.calAccelConst;
    calMagConst = appMetaData.calMagConst;
    calGyroConst = appMetaData.calGyroConst;
    calForceConst = appMetaData.calForceConst;
    console.log("In restoreAcquisition(): Use saved calibration" );


    // first see if the save data can be retored by this version of the software 
    // do this with a try/catch in case someone is trying to restore old data that has no version info
    let dataVersion = 0;
    try { dataVersion = appMetaData.appVersion[0] * 1000 + appMetaData.appVersion[1] * 100 + appMetaData.appVersion[2]; }
    catch { }

    // least copatible version (in globalVariables.js)
    let compatVersion = bcompatVersion[0] * 1000 + bcompatVersion[1] * 100 + bcompatVersion[2];

    if (dataVersion < compatVersion) {
        let bcv = "v" + bcompatVersion[0].toString() + "." + bcompatVersion[1].toString() + "." + bcompatVersion[2].toString();
        window.alert("Sorry - cant restore data written with app version before " + bcv)
    }
    else {

        // restore the total run time (ms)
        totalRunTime = appMetaData.runSeconds * 1000;

        // remove any existing plots
        if (plotSet != null) {
            plotSet.reset();
            plotSet = null;
        }

        // if enough info is present create new plotSet and display the restored data
        if (currentFCobject != null) {

            sensorIDlist = currentFCobject.sensList;
            sensorRateList = currentFCobject.rateList;

            plotSet = new PlotSet(currentFCobject, "plotContainer", "controlContainer");

            // each new plot object in the set we just created has a default viewport (0-10sec) 
            // that is not needed when restoring old data, so remove these
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                let plot = plotSet.plotObjectList[ind];
                plot.viewStack.shift();
            }

            writePointer = rxdata.length;
            extractRecords();
            buildAndCalibrate();
            reProcessWheel();

            // reprocess plot data (smoothing etc)
            plotSet.reprocessPlotData();

            // display the data we just loaded
            plotSet.displayPlots();

            // signal to restore the calibration constants to their original values
            notFetchedCal[0] = true;

            // data is only restored when the dongle is not commected, so we need to ignore the 
            // restored data records that look like the data was just acquired.
            dongleID = 0;
            remote1ID = 0;
            remoteStatus[0] = 0;
            remoteConnected = false;
            serialConnected = false;
            updateSystemState();
                        
        }
    }

}