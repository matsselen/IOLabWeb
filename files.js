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

    // push any metadata plus current fixed config object onto the bottom of the dalData array
    // then stringify this and put it in a blob

    calData.unshift(currentFCobject);
    calData.unshift(appMetaData);
    let jdata = JSON.stringify(calData);
    //let dataBlob = new Blob([jdata]);

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
        runSeconds.toFixed(0) + "s.iolab";


    // save the data as a local download
    //downloadData.href = window.URL.createObjectURL(dataBlob), { type: "text/plain;charset=utf-8" };
    //downloadData.download = fName;

    //----- test zip stuff ----------------
    fName += ".zip";
    var zip = new JSZip();
    zip.file("data.json", jdata);

    zip.generateAsync({
        type: "blob",
        /* NOTE THESE ADDED COMPRESSION OPTIONS */
        /* deflate is the name of the compression algorithm used */
        compression: "DEFLATE",
        compressionOptions: {
            /* compression level ranges from 1 (best speed) to 9 (best compression) */
            level: 9
        }
    })
        .then(function success(content) {
            saveAs(content, fName); // uses FileSaver.js           
        }, 
        function error(e) {
            console.log("Error saving zip file");
            console.log(e);
        }
        );
    //----- test zip stuff ----------------

}

// code for reading back rxdata from a file
async function readInputFile() {

    if (dbgInfo) {
        console.log("Will unzip the first file in this list:");
        console.log(this.files);
    }

    JSZip.loadAsync(this.files[0]).then(function (zip) {

        zip.file("data.json").async("text").then(function success(content) {
            calData = JSON.parse(content);
            if (dbgInfo) {
                console.log(calData);
            }
            restoreAcquisition();

        }, function error(e) {
            console.log("Error unzipping");
            console.log(e);
        })

    });


    // var frd = new FileReader;
    // try {
    //     frd.readAsText(this.files[0]);
    //     frd.onload = function () {
    //         parseFromFile(frd.result);
    //     }

    //     // wait 100 ms for shit to finish then get to work restoring the saved plots
    //     setTimeout(async function () {
    //         console.log(calData);
    //         //mas restoreAcquisition();
    //     }, 100);
    // }
    // catch (error) {
    //     console.log("Did not reastore a data file");
    //     console.log(error);
    // }
}

// called by readInputFile
// function parseFromFile(fileContents) {
//     calData = JSON.parse(fileContents);
// }

// //mas called by readInputFile
// function parseFromZip(fileContents) {
//     JSZip.loadAsync(fileContents).then(function (zip) {
//         console.log(zip);
//         console.log(fileContents);
//     });
// }

function restoreAcquisition() {

    console.log("In restoreAcquisition()");

    // exctact the fixed config object and restore the calibrated data
    currentFCobject = calData[1];
    appMetaData = calData[0];
    calData.shift();
    calData.shift();


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

        // restore the cal data write pointers
        for (let i = 0; i < maxSensorCode; i++) {
            calWritePtr[i] = calData[i].length;
        }

        // remove any existing plots
        if (plotSet != null) {
            plotSet.reset();
            plotSet = null;
            //resetAcquisition();
        }

        // if enough info is present create new plotSet and display the restored data
        if (currentFCobject != null) {

            plotSet = new PlotSet(currentFCobject, "plotContainer", "controlContainer");

            // each new plot object in the set we just created has a default viewport (0-10sec) 
            // that is not needed when restoring old data, so remove these
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                let plot = plotSet.plotObjectList[ind];
                plot.viewStack.shift();
            }

            // reprocess plot data (smoothing etc)
            plotSet.reprocessPlotData();

            // display the data we just loaded
            plotSet.displayPlots();

        }
    }

}