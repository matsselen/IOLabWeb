// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// Associate event handlers with the checkboxes that control display
function setupControls() {

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

  // document.getElementById("debugStuff").style.display = "none";
  // document.getElementById("debug_ck").checked = false;

  debugStuff.style.display = "none";
  debugCK.checked = false;
  showCommands = false;
  debugCK.hidden = true;
  cmdPicker.hidden = true;
}

