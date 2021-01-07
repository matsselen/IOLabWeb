'use strict';
// Associate event handlers with the checkboxes that control charts & traces
function setupChartControls() {
  // accelerometer
  document.getElementById("trace_acc_x_ck").addEventListener("click", traceSelect);
  document.getElementById("trace_acc_y_ck").addEventListener("click", traceSelect);
  document.getElementById("trace_acc_z_ck").addEventListener("click", traceSelect);

  // show or hide charts & text-areas based on checkbox selections
  document.getElementById("sens_acc_ck").addEventListener("click", sensorSelect);
  document.getElementById("text_area_ck").addEventListener("click", sensorSelect);
}

// handle chart-trace checkbox events
function traceSelect() {

  var trace = 'unknown';
  switch (this.id) {
    case "trace_acc_x_ck": trace = accCsIDx; break;
    case "trace_acc_y_ck": trace = accCsIDy; break;
    case "trace_acc_z_ck": trace = accCsIDz; break;
  }

  if (this.checked) {
    document.getElementById(trace).style.visibility = 'visible';
  } else {
    document.getElementById(trace).style.visibility = 'hidden';
  }

  console.log(this.id);
  console.log(this.checked);
}

// handle sensor selection checkbox events
function sensorSelect() {

  var sensor = 'unknown';
  switch (this.id) {
    case "sens_acc_ck": sensor = 'accPlotContainer'; break;
    case "text_area_ck": sensor = 'textAreaContainer'; break;

  }

  if (this.checked) {
    document.getElementById(sensor).style.display = "block";
  } else {
    document.getElementById(sensor).style.display = "none";
  }

  console.log(this.id);
  console.log(this.checked);
}

// set things up initially to show & hide the appropriate charts
function initialChartSelect() {

  document.getElementById("accPlotContainer").style.display = "block";
  document.getElementById("sens_acc_ck").checked = true;

  document.getElementById("textAreaContainer").style.display = "block";
  document.getElementById("text_area_ck").checked = true;

 }
