
// accelerometer chart variables & defaults
var accSpan = [10,-15,25];    // holds (tSpan, aMin, aMax) for accelerometer plot canvas
var accLast = [-1, 0, 0, 0];  // holds (t,x,y,z) of last accelerometer point plotted

// accelerometer plot stack
var accCanvasStack;
var accCsIDx;
var accCsIDy;
var accCsIDz;

// create graphics layers for each trace of each chart
function createPlotLayers() {

  // accelerometer
  accCanvasStack = new CanvasStack("chartAccCanvas");
  accCsIDx = accCanvasStack.createLayer();
  accCsIDy = accCanvasStack.createLayer();
  accCsIDz = accCanvasStack.createLayer();

}
