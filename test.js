
function saveToFile() {
    var dataBlob = new Blob([document.getElementById("dataBoxTx").value], {type: "text/plain;charset=utf-8"});
    //var dataBlob = new Blob(rawData);
    downloadData.href = window.URL.createObjectURL(dataBlob);
    downloadData.download = "IOLab-data-test.txt";
}

function parseFromFile(fileContents) {
    document.getElementById("dataBoxTx").value = fileContents;
}

async function readInputFile() {
    var frd = new FileReader;
    frd.readAsText(this.files[0]);
    frd.onload = function() {
      parseFromFile(frd.result);
    }
  }
  