'use strict';

// some test code for saving to a file
function saveToFile() {

    // push the current chart list onto the bottom of the dalData array
    // then stringify this and put it in a blob
    calData.unshift(chartIDlist);
    let jdata = JSON.stringify(calData);
    let dataBlob = new Blob([jdata]);

    // put calData back the way it was
    calData.shift();

    // download the data
    downloadData.href = window.URL.createObjectURL(dataBlob), { type: "text/plain;charset=utf-8" };
    downloadData.download = "IOLab-data-test.txt";
}

// code for reading back rxdata from a file
async function readInputFile() {
    var frd = new FileReader;
    frd.readAsText(this.files[0]);
    frd.onload = function () {
         parseFromFile(frd.result);
    }

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
    chartIDlist = calData[0];
    calData.shift();
    //writePointer = rxdata.length;


}