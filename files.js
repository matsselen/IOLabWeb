'use strict';

// some test code for saving to a file
function saveToFile() {


    let runSeconds = totalRunTime/1000;
    let date = new Date();

    appMetaData.runSeconds = runSeconds;
    appMetaData.date = date;

    // push any metadata plus current fixed config object onto the bottom of the dalData array
    // then stringify this and put it in a blob

    calData.unshift(currentFCobject);
    calData.unshift(appMetaData);
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

    let fName = "IOLab_" +
        date.toDateString().substr(4, 3) + "-" +
        date.toDateString().substr(8, 2) + "-" +
        date.toDateString().substr(11, 4) + "_" +
        date.toTimeString().substr(0, 2) + "." +
        date.toTimeString().substr(3, 2) + "." +
        date.toTimeString().substr(6, 2) + "_" +
        configDesc + "_" +
        runSeconds.toFixed(0)+"s.iolab";

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
    currentFCobject = calData[1];
    appMetaData     = calData[0]
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

        // each new plot object has a default viewport that is not needed, so remove it
        for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
            let plot = plotSet.plotObjectList[ind];
            plot.viewStack.shift();
        }

        plotSet.displayPlots();
    }

}