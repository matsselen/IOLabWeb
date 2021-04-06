// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// Associate event handlers with the checkboxes that control display
function setupDebug() {

  debugCK.addEventListener("click", function () {
    if (this.checked && dbgInfo) {
      document.getElementById('debugStuff').style.display = "block";
      showCommands = true;
    } else {
      document.getElementById('debugStuff').style.display = "none";
      showCommands = false;
      this.checked = false;
    }

    console.log(this.id);
    console.log(this.checked);

    if (!dbgInfo) {
      console.log("Debug mode is currently disabled.");
      console.log("Set dbgInfo flag to enable.");
    }

    updateSystemState();

  });

  debugStuff.style.display = "none";
  debugCK.checked = false;
  showCommands = false;
  debugCK.hidden = true;
  cmdPicker.hidden = true;
}

// run this in the console to see the debugging features
function showDebug() {
  debugCK.hidden = false;
  dbgInfo = true;
  cmdPicker.hidden = false;
}
