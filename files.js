'use strict';

// some test code for saving to a file
function saveToFile() {


    // push any metadata plus current fixed config object onto the bottom of the dalData array
    // then stringify this and put it in a blob

    calData.unshift(appMetaData);
    calData.unshift(currentFCobject);
    let jdata = JSON.stringify(calData);
    let dataBlob = new Blob([jdata]);

    // put calData back the way it was
    calData.shift();
    calData.shift();

    // figure out filename
    let configDesc = "noconfig";
    if (currentFCobject != null) {
        configDesc = currentFCobject.desc;
    }
    let seconds = totalRunTime/1000;
    let d = new Date();
    let fName = "IOLab_" +
        d.toDateString().substr(4, 3) + "-" +
        d.toDateString().substr(8, 2) + "-" +
        d.toDateString().substr(11, 4) + "_" +
        d.toTimeString().substr(0, 2) + "." +
        d.toTimeString().substr(3, 2) + "." +
        d.toTimeString().substr(6, 2) + "_" +
        configDesc + "_" +
        seconds.toFixed(0)+"s.iolab";

    // save the data as a local download
    downloadData.href = window.URL.createObjectURL(dataBlob), { type: "text/plain;charset=utf-8" };
    downloadData.download = fName;

}

// code for reading back rxdata from a file
async function readInputFile() {
    var frd = new FileReader;
    frd.readAsText(this.files[0]);
    frd.onload = function () {
        parseFromFile(frd.result);
    }

    // wait 100 ms for shit to finish then get to work restoring the saved plots
    setTimeout(async function () {
        restoreAcquisition();
    }, 100);

}

// called by readInputFile
function parseFromFile(fileContents) {
    calData = JSON.parse(fileContents);
}

function restoreAcquisition() {

    console.log("In restoreAcquisition()");

    // exctact the fixed config object and restore the calibrated data
    currentFCobject = calData[0];
    appMetaData     = calData[1]
    calData.shift();
    calData.shift();

    // restore the cal data write pointers
    for (let i = 0; i < maxSensorCode; i++) {
        calWritePtr[i] = calData[i].length;
    }

    // remove any existing plots
    if (plotSet != null) {
        plotSet.reset();
        plotSet = null;
        resetAcquisition();
    }

    // if enough info is present create new plotSet and display the restored data
    if (currentFCobject != null) {
        chartIDlist = currentFCobject.chartList;
        plotSet = new PlotSet(chartIDlist, "plotContainer");
        plotSet.displayPlots();
    }

}