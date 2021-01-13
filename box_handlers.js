'use strict';

// Associate event handlers with the checkboxes that control display
// (will be will be replaced by sometning better once the IOLabPlot class is finished)
function setupChartControls() {

  document.getElementById("text_area_ck").addEventListener("click", sensorSelect);
  document.getElementById("debug_ck").addEventListener("click", sensorSelect);
}

// handle selection checkbox events
function sensorSelect() {

  var sensor = 'unknown';
  switch (this.id) {
    // case "sens_acc_ck": sensor = 'accPlotContainer'; break;
    case "text_area_ck": sensor = 'textAreaContainer'; break;
    case "debug_ck": sensor = 'debugStuff'; break;

  }

  if (this.checked) {
    document.getElementById(sensor).style.display = "block";
  } else {
    document.getElementById(sensor).style.display = "none";
  }

  console.log(this.id);
  console.log(this.checked);
}

// set things up initially to show & hide the appropriate buttons
function initialChartSelect() {

  document.getElementById("textAreaContainer").style.display = "none";
  document.getElementById("text_area_ck").checked = false;

  document.getElementById("debugStuff").style.display = "none";
  document.getElementById("debug_ck").checked = false;

}
