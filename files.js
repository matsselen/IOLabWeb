'use strict';

// some test code for saving to a file
function saveToFile() {
    var dataBlob = new Blob([document.getElementById("dataBoxRx").value], { type: "text/plain;charset=utf-8" });
    //var dataBlob = new Blob(rawData);
    downloadData.href = window.URL.createObjectURL(dataBlob);
    downloadData.download = "IOLab-data-test.txt";
}

// some test code for reading from a file
async function readInputFile() {
    var frd = new FileReader;
    frd.readAsText(this.files[0]);
    frd.onload = function () {
        parseFromFile(frd.result);
    }
}

// called by readInputFile
function parseFromFile(fileContents) {
    document.getElementById("dataBoxRx").value = fileContents;
}
