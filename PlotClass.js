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

    // this method shifts the x values by one range to the right
    xShiftViewRight = function () {
        this.xMin += this.xSpan;
        this.xMax += this.xSpan;
    }

    // this method returns pixel coordinates when passed data coordinates
    dataToPixel(tDat, yDat) {
        let xPix = (tDat / this.xSpan) * this.cWidth;
        let yPix = this.cHeight - ((yDat - this.yMin) / this.ySpan) * this.cHeight;
        return [xPix, yPix];
    }

    // this method returns data coordinates when passed pixel coordinates
    pixelToData(xPix, yPix) {
        let tDat = this.xMin + this.xSpan*xPix/this.cWidth;
        let yDat = this.yMax - this.ySpan*yPix/this.cHeight;
        return [tDat, yDat];
    }

};

class PlotIOLab {

    // the constructor sets up a ploting area and its controls
    constructor(sensorNum, parentName) {

        this.sensorNum = sensorNum;     // the number of the sensor being plotted
        this.parentName = parentName;   // the ID of the parent <div> block

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

    } // constructor

    //==========================================================================================


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

        if (calReadPtr[sensorID] < calData[sensorID].length) {
            //console.log("In plotRunningData ",calReadPtr[sensorID], calData[sensorID].length)

            let pix = [];
            for (let tr = 1; tr < this.nTraces + 1; tr++) { //traces start numbering at 1

                contextList[tr].beginPath();

                // figure out where to start
                if (this.datLast[0] < 0) { // if we just started
                    let td = calData[sensorID][calReadPtr[sensorID]][0];
                    let xd = calData[sensorID][calReadPtr[sensorID]][tr];
                    //pix = this.datToPix(td, xd, cWidth, cHeight);
                    pix = this.runningDataView.dataToPixel(td, xd);
                } else {
                    let tstart = this.datLast[0] % this.runningDataView.xSpan;
                    //pix = this.datToPix(tstart, this.datLast[tr], cWidth, cHeight);
                    pix = this.runningDataView.dataToPixel(tstart, this.datLast[tr]);
                }
                contextList[tr].moveTo(pix[0], pix[1]);
            }

            let tpLast = -1;
            for (let ind = calReadPtr[sensorID]; ind < calData[sensorID].length; ind++) {

                let tplot = calData[sensorID][ind][0] % this.runningDataView.xSpan;
                for (let tr = 1; tr < this.nTraces + 1; tr++) {

                    // see if we need to wrap
                    if (tplot < tpLast) {

                        // draw the current line before wrapping
                        contextList[tr].stroke();

                        // clear canvas before wrapping
                        contextList[tr].clearRect(0, 0, cWidth, cHeight);

                        //pix = this.datToPix(tplot, calData[sensorID][ind][tr], cWidth, cHeight);
                        pix = this.runningDataView.dataToPixel(tplot, calData[sensorID][ind][tr]);

                        contextList[tr].beginPath();
                        contextList[tr].moveTo(pix[0], pix[1]);

                    } else {

                        //pix = this.datToPix(tplot, calData[sensorID][ind][tr], cWidth, cHeight);
                        pix = this.runningDataView.dataToPixel(tplot, calData[sensorID][ind][tr]);
                        contextList[tr].lineTo(pix[0], pix[1]);

                    }
                }
                tpLast = tplot;
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

