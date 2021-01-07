'use strict';

// accelerometer chart variables & defaults
var accSpan = [10,-15,25];    // holds (tSpan, aMin, aMax) for accelerometer plot canvas
var accLast = [-1, 0, 0, 0];  // holds (t,x,y,z) of last accelerometer point plotted

// accelerometer plot stack
var accCanvasStack;
var accCsIDx, accCsIDy, accCsIDz;
var accCsCtl, ctlLayer, drawLayer, accCsDraw, drawContext;

//var baseCanvas;

// create graphics layers for each trace of each chart
function createPlotLayers() {

  // accelerometer
  accCanvasStack = new CanvasStack("chartAccCanvas");
  accCsIDx = accCanvasStack.createLayer();
  accCsIDy = accCanvasStack.createLayer();
  accCsIDz = accCanvasStack.createLayer();
  accCsDraw = accCanvasStack.createLayer();
  accCsCtl = accCanvasStack.createLayer();

  ctlLayer = document.getElementById(accCsCtl);
  drawLayer = document.getElementById(accCsDraw);
  drawContext = drawLayer.getContext('2d');

  ctlLayer.addEventListener("mousedown",mouseDown)
  ctlLayer.addEventListener("mouseup",mouseUp)
  ctlLayer.addEventListener("mousemove",mouseMove)
}

let drawingLine = false;
let mousePtrX, mousePtrY;

async function mouseDown(e) {
  drawingLine = true;
  mousePtrX = e.offsetX, mousePtrY = e.offsetY;

}

async function mouseUp(e) {
  drawingLine = false;
  drawLine(drawContext, mousePtrX, mousePtrY, e.offsetX, e.offsetY);
}

async function mouseMove(e) {
  if (drawingLine) {
    drawLine(drawContext, mousePtrX, mousePtrY, e.offsetX, e.offsetY);
    mousePtrX = e.offsetX, mousePtrY = e.offsetY;
  }
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}