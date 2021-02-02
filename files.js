'use strict';

// some test code for saving to a file
function saveToFile() {
    let dataBlob = new Blob([rxdata]);
    downloadData.href = window.URL.createObjectURL(dataBlob), { type: "text/plain;charset=utf-8" };
    downloadData.download = "IOLab-data-test.txt";
}

// code for reading back rxdata from a file
async function readInputFile() {
    //resetAcquisition();
    var frd = new FileReader;
    frd.readAsText(this.files[0]);
    frd.onload = function () {
         parseFromFile(frd.result);
    }

    setTimeout(async function () {
        writePointer = rxdata.length;
        console.log("After reading input file writePointer="+writePointer);
    }, 100);

    
    //plotSet.stopAcquisition();
}

// called by readInputFile
function parseFromFile(fileContents) {
    rxdata = fileContents.split(',').map(Number);
}
