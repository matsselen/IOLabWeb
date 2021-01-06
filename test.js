
function pad2(e) {
    return e < 10 ? "0" + e : e
}

function saveToFile() {
    var dataBlob = new Blob([document.getElementById("dataBoxTx").value], {type: "text/plain;charset=utf-8"});
    downloadData.href = window.URL.createObjectURL(dataBlob);
    var r = new Date;
    //downloadData.download = ["IOLabWeb-", r.getFullYear(), pad2(r.getMonth() + 1), pad2(r.getDate()), pad2(r.getHours()), pad2(r.getMinutes()), ".txt"].join(""); 
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
  