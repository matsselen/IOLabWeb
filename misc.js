// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// Associate event handlers with the checkboxes that control display
// (will be will be replaced by sometning better once the IOLabPlot class is finished)
function setupControls() {

  document.getElementById("debug_ck").addEventListener("click", function () {
    if (this.checked) {
      document.getElementById('debugStuff').style.display = "block";
      showCommands = true;
    } else {
      document.getElementById('debugStuff').style.display = "none";
      showCommands = false;
    }
    console.log(this.id);
    console.log(this.checked);

    updateSystemState();

  });

  // document.getElementById("debugStuff").style.display = "none";
  // document.getElementById("debug_ck").checked = false;
  
  document.getElementById("debugStuff").style.display = "none";
  document.getElementById("debug_ck").checked = false;
  showCommands = false;
}

