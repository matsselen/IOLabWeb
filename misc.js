'use strict';

// Associate event handlers with the checkboxes that control display
// (will be will be replaced by sometning better once the IOLabPlot class is finished)
function setupControls() {

  document.getElementById("debug_ck").addEventListener("click", function () {
    if (this.checked) {
      document.getElementById('debugStuff').style.display = "block";
    } else {
      document.getElementById('debugStuff').style.display = "none";
    }
    console.log(this.id);
    console.log(this.checked);
  });

  document.getElementById("debugStuff").style.display = "block";
  document.getElementById("debug_ck").checked = true;
}

