
function pad2(e) {
    return e < 10 ? "0" + e : e
}

function saveToFile() {
    var e = new Blob([document.getElementById("dataBoxTx").value], {
        type: "text/plain;charset=utf-8"
    }),
        a = window.URL.createObjectURL(e),
        t = document.getElementById("downloadData"),
        r = new Date;
    t.download = ["ioLab-", r.getFullYear(), pad2(r.getMonth() + 1), pad2(r.getDate()), pad2(r.getHours()), pad2(r.getMinutes()), ".txt"].join(""), 
    t.href = a
}

function parseFromFile(fileContents) {
    document.getElementById("dataBoxTx").value = fileContents;
}

async function readInputFile() {
    var frd = new FileReader;
    frd.onload = function() {
      //document.getElementById("dataBoxTx").value = frd.result;
      parseFromFile(frd.result);
    }, frd.readAsText(this.files[0])
  }
  