// 
// These classes are used for plotting
// (more documentation will come when Mats feels like it)
//

'use strict';

// this class defines the data value range displayed on a chart in calibrated data units
// and provides methods to maniplate data for plotting
class ViewPort {
    constructor(xMin, xMax, yMin, yMax, canvasElement) {
        // passed values
        this.xMin = xMin;                       // minimum data x value
        this.xMax = xMax;                       // maximum data x value
        this.yMin = yMin;                       // minimum data y value
        this.yMax = yMax;                       // maximum data y value
        this.canvasElement = canvasElement;     // the base canvas of the plot

        // derived values
        this.xSpan = xMax - xMin;               // x range
        this.ySpan = yMax - yMin;               // y range
        this.cWidth = canvasElement.width;      // canvas width in pixels
        this.cHeight = canvasElement.height;    // canvas height in pixels
    };

    // alight the viewport with time tTest and report back how many shifts were needed
    alignWith = function (tTest) {

        let nShift = 0;

        if (tTest >= this.xMax) {
            nShift = 1 + (tTest - this.xMax) / this.xSpan;
        } else if (tTest < this.xMin) {
            nShift = (tTest - this.xMin) / this.xSpan - 1;
        }

        // make into an integer
        nShift = parseInt(nShift);

        // shift the viewport left or right
        this.xMin = this.xMin + nShift * this.xSpan;
        this.xMax = this.xMax + nShift * this.xSpan;

        return nShift;
    }

    // see if the viewport contain time tTest
    containsTime = function (tTest) {
        return ((tTest >= this.xMin) && (tTest < this.xMax));
    }

    // this method shifts the viewport by nShift*xSpan
    xShiftView = function (nShift) {
        this.xMin = this.xMin + nShift * this.xSpan;
        this.xMax = this.xMax + nShift * this.xSpan;
    }

    // this method returns pixel coordinates when passed data coordinates
    dataToPixel(tDat, yDat) {
        let xPix = ((tDat - this.xMin) / this.xSpan) * this.cWidth;
        let yPix = this.cHeight - ((yDat - this.yMin) / this.ySpan) * this.cHeight;
        //return [parseInt(xPix), parseInt(yPix)];
        return [xPix, yPix];
    }

    // this method returns data coordinates when passed pixel coordinates
    pixelToData(xPix, yPix) {
        let tDat = this.xMin + this.xSpan * xPix / this.cWidth;
        let yDat = this.yMax - this.ySpan * yPix / this.cHeight;
        return [tDat, yDat];
    }

};

class PlotIOLab {

    // the constructor sets up a ploting area and its controls
    constructor(sensorNum, parentName) {

        this.sensorNum = sensorNum;     // the number of the sensor being plotted
        this.parentName = parentName;   // the ID of the parent <div> block

        let plotThis = this;                // save "this" to used in callback routines

        this.layerColorList = [];           // holds the canvas layer colors
        this.layerIDlist = [];              // a list of all canvas layer ID's
        this.layerElementList = [];         // save the element handles to save "getElementById" calls
        this.checkboxIDlist = [];           // a list of all checkbox ID's

        // this will hold (t,x,[y,z,...]) of last data point plotted 
        // start with [t] and we will add 0's for each trace further below
        this.datLast = [-1];

        // start by finding the "sensor" entry in config.js (var iolabConfig) that matches sensorNum
        this.sensor = null;
        for (let ind = 0; ind < iolabConfig.sensors.length; ind++) {
            let sens = iolabConfig.sensors[ind];
            if (sens.code == sensorNum) {
                this.sensor = sens;
                break;
            }
        }

        // make sure the sensor was found
        if (this.sensor == null) {
            console.log("in PlotIOLab: Didnt find sensor " + sensorNum.toString());
        }

        // extract some useful info from the sensor object
        this.plotName = this.sensor.desc;       // the name of the chart
        this.axisTitles = this.sensor.legends;  // the trace labels
        this.baseID = this.sensor.shortDesc;    // the ID of the bottom layer (used for drawing axes)

        // the number of traces is the same as the number of axis titles and 
        this.nTraces = this.axisTitles.length;

        // set the trace colors
        this.layerColorList = this.sensor.pathColors;

        // the bottom and top layers are black (axes and control)
        this.layerColorList.push("#000000");
        this.layerColorList.unshift("#000000");

        // add a 0 to the datLast array for each chart trace
        for (let ind = 0; ind < this.nTraces; ind++) {
            this.datLast.push(0);
        }

        // create the base layer canvas and set its properties 
        let baseCanvas = document.createElement("canvas");
        baseCanvas.setAttribute("id", this.baseID);
        baseCanvas.setAttribute("width", 700);
        baseCanvas.setAttribute("height", 200);
        baseCanvas.style.border = "1px solid #4d4545";
        baseCanvas.style.background = "white";

        // create the control elements that appear above the canvas
        let controls = document.createElement("div");
        let chartName = document.createTextNode(this.plotName + "\xA0\xA0");
        controls.appendChild(chartName);

        // get the existing parent element and add the controls and base canvas that we just created
        let parent = document.getElementById(this.parentName);
        parent.appendChild(controls);
        parent.appendChild(baseCanvas);

        // save the base canvas element info.
        this.baseElement = document.getElementById(this.baseID);

        // create the canvas stack that will be used for displaying chart traces 
        // as well as the background grid and zoom controls
        let canvasStack = new CanvasStack(this.baseID);

        // create one overlay layer for each chart trace plus 2 additional layers
        //   layer N+1:  top layer is for control
        //  layers 1-N:  one layer for each of the N chart trace 
        //     layer 0:  bottom layer is for the axes
        for (let ind = 0; ind < (this.axisTitles.length + 2); ind++) {
            let layerID = canvasStack.createLayer();
            this.layerIDlist.push(layerID);
            this.layerElementList.push(document.getElementById(layerID));
        }

        // attach some event listeners to the top (control) layer
        let ctlLayer = this.layerElementList[this.layerElementList.length - 1];
        let ctlDrawContext = ctlLayer.getContext("2d");
        ctlLayer.addEventListener("mousedown", mouseDown);
        ctlLayer.addEventListener("mouseup", mouseUp);
        ctlLayer.addEventListener("mousemove", mouseMove);
        ctlLayer.addEventListener("mouseout", mouseOut);

        // create a checkbox for each component of the sensor data
        for (let ind = 0; ind < this.axisTitles.length; ind++) {

            // create the checkbox and set its attributes
            // first create its ID (and save this in a list)
            let cb = document.createElement("input");
            let cbID = this.baseID + "_cb" + ind.toString();
            this.checkboxIDlist.push(cbID);

            cb.setAttribute("id", cbID);
            cb.setAttribute("type", "checkbox");
            cb.setAttribute("checked", "true");

            // pay attention to when the box is checked or unchecekd
            cb.addEventListener("click", selectLayer);

            // we know which canvas layer this controls so save that info to be used
            // in the event handler
            cb.canvaslayer = this.layerIDlist[ind + 1];

            // create the axis labels before each checkbox
            let axis = document.createTextNode("\xA0\xA0" + this.axisTitles[ind] + ":");

            // add the labels and boxes to the control region
            controls.appendChild(axis);
            controls.appendChild(cb);

            // Set up the viewport that will be used while the DAQ is running 
            this.runningDataView = new ViewPort(0, 10, -15, 25, this.baseElement);

        }

        // event handler for the layer selection checkboxes
        function selectLayer() {
            console.log("In Plot::selectLayer() ", this.id, this.canvaslayer, this.checked);

            if (this.checked) {
                document.getElementById(this.canvaslayer).style.display = "block";
            } else {
                document.getElementById(this.canvaslayer).style.display = "none";
            }
        }

        // event handlers for mouse
        let ctlDrawing = false;
        let mousePtrX, mousePtrY;

        function mouseDown(e) {
            ctlDrawing = true;
            mousePtrX = e.offsetX;
            mousePtrY = e.offsetY;
        }

        function mouseUp(e) {
            ctlDrawing = false;
            drawRect(mousePtrX, mousePtrY, e.offsetX, e.offsetY);
        }

        function mouseMove(e) {
            if (ctlDrawing) {
                drawRect(mousePtrX, mousePtrY, e.offsetX, e.offsetY);
            }
        }

        function mouseOut(e) {
            if (ctlDrawing) {
                ctlDrawing = false;
            }
        }

        function drawRect(x1, y1, x2, y2) {

            ctlDrawContext.strokeStyle = 'black';
            ctlDrawContext.lineWidth = 1;

            ctlDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);

            if (x1 != x2 && y1 != y2) {
                ctlDrawContext.beginPath();
                ctlDrawContext.rect(x1, y1, (x2 - x1), (y2 - y1));
                ctlDrawContext.stroke();
            }
        }

    } // constructor

    //==========================================================================================

    // draw plot axes on the layer below the chart traces of ViewPort vp
    drawPlotAxes(vp) {

        // get the bottom drawing layer context
        let ctx = this.layerElementList[0].getContext("2d");
        ctx.strokeStyle = 'black';
        ctx.lineWidth = .5;
        ctx.beginPath();

        let pix1 = vp.dataToPixel(vp.xMin,(vp.yMax+vp.yMin)/2);
        let pix2 = vp.dataToPixel(vp.xMax,(vp.yMax+vp.yMin)/2);

        ctx.moveTo(pix1[0], pix1[1]);
        ctx.lineTo(pix2[0], pix2[1]);
        ctx.stroke();


    }

    // Plots any new avaiable data. Called on a timer during data acquisition.
    plotRunningData() {

        //retrieve contexts for each layer and set line properties
        let contextList = [];
        for (let ind = 0; ind < this.layerElementList.length; ind++) {
            let ctx = this.layerElementList[ind].getContext("2d");
            contextList.push(ctx);
            ctx.strokeStyle = this.layerColorList[ind];
            ctx.lineWidth = 2;
        }

        // the size of all layers is the same as the bottom one
        let cWidth = this.layerElementList[0].width;
        let cHeight = this.layerElementList[0].height;

        let sensorID = this.sensorNum;

        // see if we have unread calibrated data
        if (calReadPtr[sensorID] < calData[sensorID].length) {

            let pix = []; // holds an [x,y] pixel coordinate

            // find the time coordinate of the data at the current read pointer
            let td = calData[sensorID][calReadPtr[sensorID]][0];

            // make sure the viewport contains this time
            let nShift = this.runningDataView.alignWith(td);
            if (nShift != 0) {
                console.log("In plotRunningData(1) - shifted viewport by ", nShift);
            }

            // for each trace, find the starting point
            for (let tr = 1; tr < this.nTraces + 1; tr++) { //traces start numbering at 1

                contextList[tr].beginPath();

                // if this is the first call after instantiating the class, 
                // start with the data at calReadPtr (presumably 0)
                if (this.datLast[0] < 0) {

                    this.drawPlotAxes(this.runningDataView);

                    let xd = calData[sensorID][calReadPtr[sensorID]][tr];
                    pix = this.runningDataView.dataToPixel(td, xd);

                } else { // if this is not the first call start with the last datapoint we plotted

                    let tstart = this.datLast[0];
                    pix = this.runningDataView.dataToPixel(tstart, this.datLast[tr]);
                }
                contextList[tr].moveTo(pix[0], pix[1]);
            }

            let shiftView = false; // use this to indicate we are shifting the viewport
            for (let ind = calReadPtr[sensorID]; ind < calData[sensorID].length; ind++) {

                let tplot = calData[sensorID][ind][0]; // the current time coordinate

                // shift the viewport if necessary
                let nShift = this.runningDataView.alignWith(tplot);
                if (nShift != 0) {
                    shiftView = true;
                    console.log("In plotRunningData(2) - shifted viewport by ", nShift);
                }

                for (let tr = 1; tr < this.nTraces + 1; tr++) {

                    // see if we need to wrap
                    if (shiftView) {

                        // draw the current line before wrapping
                        contextList[tr].stroke();

                        // clear canvas before wrapping
                        contextList[tr].clearRect(0, 0, cWidth, cHeight);
                        this.drawPlotAxes(this.runningDataView);
                        pix = this.runningDataView.dataToPixel(tplot, calData[sensorID][ind][tr]);
                        contextList[tr].beginPath();
                        contextList[tr].moveTo(pix[0], pix[1]);

                    } else {

                        pix = this.runningDataView.dataToPixel(tplot, calData[sensorID][ind][tr]);
                        contextList[tr].lineTo(pix[0], pix[1]);

                    }
                }
                shiftView = false;
            }

            // set pointers to their new values and finish the line
            calReadPtr[sensorID] = calData[sensorID].length;
            this.datLast[0] = calData[sensorID][calData[sensorID].length - 1][0];
            for (let tr = 1; tr < this.nTraces + 1; tr++) {
                this.datLast[tr] = calData[sensorID][calData[sensorID].length - 1][tr];
                contextList[tr].stroke();
            }
        }
    } // plotNewData


    // for farting around
    testClass() {
        console.log("In testDraw");
        console.log(this);
    }

    testCanvas() {
        let ctx = null;

        ctx = this.layerElementList[0].getContext("2d");
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(50, 50);
        ctx.stroke();

        ctx = this.layerElementList[1].getContext("2d");
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(100, 100);
        ctx.stroke();

        ctx = this.layerElementList[2].getContext("2d");
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(150, 150);
        ctx.stroke();
    }

};

