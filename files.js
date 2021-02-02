'use strict';

// some test code for saving to a file
function saveToFile() {
    //var dataBlob = new Blob([document.getElementById("dataBoxRx").value], { type: "text/plain;charset=utf-8" });
    //var dataBlob = new Blob([1,2,3,4,5,6,7,8,9,0], { type: "text/plain;charset=utf-8" });
    var dataBlob = new Blob(rawData);
    downloadData.href = window.URL.createObjectURL(dataBlob);
    downloadData.download = "IOLab-data-test.txt";
}

function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
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
    testInputArray = fileContents;
    //document.getElementById("dataBoxRx").value = fileContents;
}
