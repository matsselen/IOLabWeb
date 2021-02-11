// 
// These classes are used for plotting
//

'use strict';

class PlotSet {
    constructor(chartList, parentName) {

        this.plotSetThis = this;        // save "this" to use in callback routines
        this.chartList = chartList;     // list of charts to be created
        this.parentName = parentName;   // the name of the existing parent element

        this.plotObjectList = [];       // list of PlotIOLab insances (one for each sensor)
        this.checkboxIDlist = [];       // a list of all checkbox ID's (one for each sensor)

        // find the parent element
        this.parentElement = document.getElementById(this.parentName);

        // create the analysis elements that appear above the canvas
        let analysis = document.createElement("div");

        // place and control the zoom icon
        let aZoom = document.createElement("a");
        let zoomLink = document.createElement("img");
        zoomLink.src = "images/zoom1.png";
        zoomLink.width = "24";
        zoomLink.style = "cursor:pointer";
        aZoom.appendChild(zoomLink);
        aZoom.title = "Click & drag to zoom, double click to undo";
        aZoom.addEventListener("click", zoomClick);
        analysis.appendChild(aZoom);

        // place and control the pan icon
        let aPan = document.createElement("a");
        let panLink = document.createElement("img");
        panLink.src = "images/pan1.png";
        panLink.width = "24";
        panLink.style = "cursor:pointer";
        aPan.appendChild(panLink);
        aPan.title = "Click/hold & drag to pan";
        aPan.addEventListener("click", panClick);
        analysis.appendChild(aPan);

        // add the analysis region to the page and put some vertical space below it
        this.parentElement.appendChild(analysis);
        this.parentElement.appendChild(document.createElement("p"));


        // create the control elements that appear above the canvas
        let controls = document.createElement("div");
        let controlTitle = document.createTextNode("Sensors: \xA0\xA0");
        controls.appendChild(controlTitle);

        // add the control region to the page and put some vertical space below it
        this.parentElement.appendChild(controls);
        this.parentElement.appendChild(document.createElement("p"));

        // loop over sensors
        for (let ind = 0; ind < chartList.length; ind++) {

            this.sensorNum = chartList[ind];
            this.sensor = sensorInfoList[this.sensorNum];

            // create the <div> element that will be the parent element for each sensors plot
            let sensDiv = document.createElement("div");
            let sensorID = "plot_sens_" + this.sensor.shortDesc;
            sensDiv.setAttribute("id", sensorID);
            sensDiv.style.position = "relative";

            // append the plot for this sensor to the parent element
            this.parentElement.appendChild(sensDiv);

            //adjust the height of the charts based on the number of charts
            let chartHeight = 200;

            // create an IOLabPlot object on each plot element
            this.plotObjectList.push(new PlotIOLab(this.sensorNum, sensorID, chartHeight));

            // create the checkbox to show/hide each sensor plot
            let cb = document.createElement("input");
            let cbID = "cb_" + sensorID;
            this.checkboxIDlist.push(cbID);

            cb.setAttribute("id", cbID);
            cb.setAttribute("type", "checkbox");

            // pay attention to when the box is checked or unchecekd
            cb.addEventListener("click", selectSensor);

            // save which element this is controling
            cb.sensorDivID = sensorID;

            // create the axis labels before each checkbox
            let whichSens = document.createTextNode("\xA0\xA0" + this.sensor.shortDesc + ":");

            // add the labels and boxes to the control region
            controls.appendChild(whichSens);
            controls.appendChild(cb);

            // hide the plots for now
            sensDiv.style.display = "none";
            cb.checked = false;

        }

        // =================================================================================
        // PlotSet Constructor functions and event handlers

        // event handler for the layer selection checkboxes
        function selectSensor() {
            if (dbgInfo) console.log("In Plot::selectSensor() ", this.id, this.checked);

            if (this.checked) {
                document.getElementById(this.sensorDivID).style.display = "block";
            } else {
                document.getElementById(this.sensorDivID).style.display = "none";
            }
        }

        function zoomClick() {
            console.log("selecting zoom mode");
            this.firstChild.src = "images/zoom1.png";
            this.secondChild.src = "images/pan0.png";
        }

        function panClick() {
            console.log("selecting pan mode");
            this.firstChild.src = "images/zoom0.png";
            this.secondChild.src = "images/pan1.png";

        }
    }
    // clean up the DOM
    reset() {

        // clean up each child plot class
        while (this.plotObjectList.length > 0) {
            this.plotObjectList[0].reset();
            this.plotObjectList.shift();
        }

        // clean up ourselves
        while (this.parentElement.childNodes.length > 0) {
            this.parentElement.childNodes[0].remove();
        }

    }

    startAcquisition() {

        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // remove any static viewports from the stack
            while (plot.viewStack.length > 1) {
                plot.viewStack.shift();
            }

            plot.mouseMode = "";
            plot.drawPlotAxes(plot.viewStack[0]);
            plot.plotStaticData();
        }
    }

    stopAcquisition() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // recalibrate each time axis based on the number of samples and the elapsed time
            plot.recalibrateTimes();

        }
    }

    displayPlots() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // display the data
            plot.mouseMode = "zoom";
            plot.displayStaticData();
        }
    }


    plotRunningData() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {
            this.plotObjectList[ind].plotRunningData();
        }
    }


};

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

        this.xAxisOffset = 40;                  // space (px) at the left used to draw y-axis labels
        this.yAxisOffset = 20;                  // space (px) at the bottom used to draw x-axis labels

        // derived values
        this.xSpan = xMax - xMin;               // x range
        this.ySpan = yMax - yMin;               // y range
        this.cWidth = canvasElement.width - this.xAxisOffset;      // canvas width in pixels
        this.cHeight = canvasElement.height - this.yAxisOffset;    // canvas height in pixels
    }; // end constructor

    //=========================================================================================
    //======================ViewPort Methods===================================================

    // pick the optimum values for data-axis labels 
    // (basically some multiple of 1, 2, 5, 10 so that we get between 5 and 15 labels )
    pickDataAxis() {

        // divide ySpan by 500,200,100,50,20,10,5,2,1,.5,.2,.1 ... until the resuls is between 5 and 15
        // for now it only works if the range is less than 6000 
        if (this.ySpan > 6000) {
            console.log("error in pickDataAxis: ySpan = ", this.xSpan);
            return ([0, 1000, 0]);
        }

        let interval;
        let minTicks = 5;
        let base = [500, 200, 100];
        for (let exp = 1; exp < 10; exp++) {
            let dec = Math.pow(10, exp);
            for (let b = 0; b < base.length; b++) {
                interval = base[b] / dec;
                if (this.ySpan / interval > minTicks) {
                    // this is a good interval so find lowest tick label
                    let start = parseInt(this.yMin / interval + 1) * interval;
                    if (this.yMin < 0) start -= interval;
                    let precision = Math.max(exp - 2, 0);
                    //if (dbgInfo) console.log("In pickDataAxis() base, exp, start, interval, precision ", base[b], exp, start, interval, precision);
                    return ([start, interval, precision]);
                }
            }
        }
        console.log("In pickDataAxis(): Should never get to this place.")
        return ([0, 1, 1]);
    }

    // pick the optimum values for time-axis labels 
    // (basically some multiple of 1, 2, 5, 10 so that we get between 5 and 15 labels )
    pickTimeAxis() {

        // divide xSpan by 500,200,100,50,20,10,5,2,1,.5,.2,.1 ... until the resuls is between 5 and 15
        // for now it only works if the range is less than 6000 seconds
        if (this.xSpan > 6000) {
            console.log("error in pickTimeAxis: xSpan = ", this.xSpan);
            return ([0, 1000, 0]);
        }

        let interval;
        let minTicks = 5;
        let base = [500, 200, 100];
        for (let exp = 1; exp < 10; exp++) {
            let dec = Math.pow(10, exp);
            for (let b = 0; b < base.length; b++) {
                interval = base[b] / dec;
                if (this.xSpan / interval > minTicks) {
                    // this is a good interval so find lowest tick label
                    let start = parseInt(this.xMin / interval + 1) * interval;
                    let precision = Math.max(exp - 2, 0);
                    //if (dbgInfo) console.log("In pickTimeAxis() base, exp, start, interval, precision ", base[b], exp, start, interval, precision);
                    return ([start, interval, precision]);
                }
            }
        }
        console.log("In pickTimeAxis(): Should never get to this place.")
        return ([0, 1, 1]);
    }

    // alight the viewport with time tTest and report back how many shifts were needed
    alignWith(tTest) {

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

    // see if the viewport contains time tTest
    containsXdata(xData) {
        return ((xData >= this.xMin) && (xData < this.xMax));
    }

    // see if the viewport contains time yData
    containsYdata(yData) {
        return ((yData >= this.yMin) && (yData < this.yMax));
    }

    // see if the viewport contains point [tTest, yDat]
    containsPoint(xData, yData) {
        return ((xData >= this.xMin) && (xData < this.xMax) && (yData >= this.yMin) && (yData < this.yMax));
    }

    // this method returns pixel coordinates when passed data coordinates
    dataToPixel(tDat, yDat) {
        let xPix = this.xAxisOffset + ((tDat - this.xMin) / this.xSpan) * this.cWidth;
        let yPix = this.cHeight - ((yDat - this.yMin) / this.ySpan) * this.cHeight;
        return [xPix, yPix];
    }

    // this method returns pixel coordinates when passed data coordinates
    // and adjusts the coordinates to avoid pixel smearing when drawing chart axes
    dataToPixelAxes(tDat, yDat, ctx) {
        let xPix = this.xAxisOffset + ((tDat - this.xMin) / this.xSpan) * this.cWidth;
        let yPix = this.cHeight - ((yDat - this.yMin) / this.ySpan) * this.cHeight;
        //let xPix = this.xAxisOffset + ((tDat - this.xMin) / this.xSpan) * (this.cWidth - this.xAxisOffset);
        //let yPix = this.cHeight - this.yAxisOffset - ((yDat - this.yMin) / this.ySpan) * (this.cHeight - this.yAxisOffset);
        if (ctx.lineWidth % 2 != 0) { // if the linewidth is an odd integer (like 1)
            return [parseInt(xPix) + 0.5, parseInt(yPix) + 0.5];
        } else {
            return [parseInt(xPix), parseInt(yPix)];;
        }
    }

    // this method returns data coordinates when passed pixel coordinates
    pixelToData(xPix, yPix) {
        let tDat = this.xMin + this.xSpan * (xPix - this.xAxisOffset) / this.cWidth;
        let yDat = this.yMax - this.ySpan * yPix / this.cHeight;
        return [tDat, yDat];
    }

};

class PlotIOLab {

    // the constructor sets up a ploting area and its controls
    constructor(sensorNum, parentName, chartHeight = 200, chartWidth = 700) {

        this.sensorNum = sensorNum;     // the number of the sensor being plotted
        this.parentName = parentName;   // the ID of the parent <div> block
        this.chartHeight = chartHeight; // initial height of the chart in pixels
        this.chartWidth = chartWidth;   // initial width of the chart in pixels

        let plotThis = this;            // save "this" to used in callback routines

        this.layerColorList = [];       // holds the canvas layer colors
        this.layerIDlist = [];          // a list of all canvas layer ID's
        this.layerElementList = [];     // save the element handles to save "getElementById" calls
        this.checkboxIDlist = [];       // a list of all checkbox ID's
        this.chartLineWidth = 1;        // the width of the chart lines

        this.initialTimeSpan = 10;      // the initial time axis range (seconds)

        this.viewStack = [];            // a stack of static viewports ([0] is always current)
        this.mouseMode = "zoom";        // different behaviors for zooming, panning, analysis, etc

        this.timePerSample = 0;         // initalize to somenting nuts so we will know if used impropery

        // this will hold (t,x,[y,z,...]) of last data point plotted 
        // start with [t] and we will add 0's for each trace further below
        this.datLast = [-1];

        this.sensor = sensorInfoList[sensorNum];

        // extract some useful info from the sensor object
        this.plotName = this.sensor.desc;      // the name of the chart
        this.unit = this.sensor.unit;      // the units of the measurement
        this.axisTitles = this.sensor.legends;   // the trace labels
        this.scales = this.sensor.scales;    // the initial y-axis scale range
        this.baseID = this.sensor.shortDesc; // the ID of the bottom layer (used for drawing axes)

        // the number of traces is the same as the number of axis titles and 
        this.nTraces = this.axisTitles.length;

        // copy the trace colors so we can add to it w/o messing up the original.
        this.layerColorList = Array.from(this.sensor.pathColors);

        // the bottom and top layers are black (axes and control)
        this.layerColorList.push("#000000");
        this.layerColorList.unshift("#000000");

        // add a 0 to the datLast array for each chart trace since this is
        // the data dimensionality we expect from the acquired records 
        for (let ind = 0; ind < this.nTraces; ind++) {
            this.datLast.push(0);
        }

        // create the base layer canvas and set its properties 
        let baseCanvas = document.createElement("canvas");
        baseCanvas.setAttribute("id", this.baseID);
        baseCanvas.setAttribute("width", this.chartWidth);
        baseCanvas.setAttribute("height", this.chartHeight);
        baseCanvas.style.background = "white";

        // create the control elements that appear above the canvas
        let controls = document.createElement("div");
        let chartName = document.createTextNode(this.plotName + "\xA0\xA0");
        controls.appendChild(chartName);

        // get the existing parent element and add the controls and base canvas that we just created
        this.parentElement = document.getElementById(this.parentName);
        this.parentElement.appendChild(controls);
        this.parentElement.appendChild(baseCanvas);

        // save the base canvas element info.
        this.baseElement = document.getElementById(this.baseID);

        // create the canvas stack that will be used for displaying chart traces 
        // as well as the background grid and zoom controls
        let canvasStack = new CanvasStack(this.baseID, this.nTraces + 4);

        // create one overlay layer for each chart trace plus 2 additional layers
        //      layer N+2:  top layer is for zooming & panning control
        //      layer N+1:  top layer is for displaying cursor info
        //  layers 1 to N:  one layer for each of the N chart trace 
        //        layer 0:  bottom layer is for the axes
        for (let ind = 0; ind < (this.axisTitles.length + 3); ind++) {
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
            cb.checked = true;

            // pay attention to when the box is checked or unchecekd
            cb.addEventListener("click", selectLayer);

            // we know which canvas layer this controls so save that info to be used
            // in the event handler
            cb.canvaslayer = this.layerIDlist[ind + 1];

            // create the axis labels before each checkbox
            let axis = document.createTextNode("\xA0\xA0" + this.axisTitles[ind] + " (" + this.unit + "):");

            // add the labels and boxes to the control region
            controls.appendChild(axis);
            controls.appendChild(cb);
        }
        let txt = document.createTextNode("\xA0\xA0 vs. time (s)");
        controls.appendChild(txt);


        // Set up the viewport that will be used while the DAQ is running 
        this.runningDataView = new ViewPort(0, this.initialTimeSpan, this.scales[0], this.scales[1], this.baseElement);
        this.viewStack.push(this.runningDataView);

        // draw plot axes
        this.drawPlotAxes(this.viewStack[0]);

        // attach some event listeners to the top (control) layer
        let ctlLayer = this.layerElementList[this.layerElementList.length - 1];
        let ctlDrawContext = ctlLayer.getContext("2d");
        ctlLayer.addEventListener("mousedown", mouseDown);
        ctlLayer.addEventListener("mouseup", mouseUp);
        ctlLayer.addEventListener("mousemove", mouseMove);
        ctlLayer.addEventListener("mouseout", mouseOut);
        ctlLayer.addEventListener("dblclick", dblclick);

        // give a name to the second to last layer so we can draw on it
        let infoLayer = this.layerElementList[this.layerElementList.length - 2];
        let infoDrawContext = infoLayer.getContext("2d");



        // =================================================================================
        // IOLabPlot Constructor functions and event handlers

        // event handler for the layer selection checkboxes
        function selectLayer() {
            if (dbgInfo) console.log("In Plot::selectLayer() ", this.id, this.canvaslayer, this.checked);

            if (this.checked) {
                document.getElementById(this.canvaslayer).style.display = "block";
            } else {
                document.getElementById(this.canvaslayer).style.display = "none";
            }
        }

        // various handlers for mouse events
        let selecting = false;
        let mousePtrX, mousePtrY;

        function dblclick(e) {
            if (plotThis.mouseMode == "zoom") {
                // remove any static viewports from the stack
                while (plotThis.viewStack.length > 1) {
                    plotThis.viewStack.shift();
                }
                // scale x-axis and plot all data
                plotThis.displayStaticData();
            }
        }

        function mouseDown(e) {
            if (plotThis.mouseMode == "zoom") {
                selecting = true;
                mousePtrX = e.offsetX;
                mousePtrY = e.offsetY;
            }
        }

        function mouseUp(e) {
            if (plotThis.mouseMode == "zoom") {
                selecting = false;

                if (mousePtrX != e.offsetX & mousePtrY != e.offsetY) {

                    // clear the selection box
                    ctlDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);

                    let p1 = plotThis.viewStack[0].pixelToData(e.offsetX, e.offsetY);
                    let p2 = plotThis.viewStack[0].pixelToData(mousePtrX, mousePtrY);

                    let xMin = Math.min(p1[0], p2[0]);
                    let xMax = Math.max(p1[0], p2[0]);
                    let yMin = Math.min(p1[1], p2[1]);
                    let yMax = Math.max(p1[1], p2[1]);

                    // first create a viewport devined by the selected rectangle      
                    let selectedView = new ViewPort(xMin, xMax, yMin, yMax, plotThis.baseElement);

                    // push the new viweport onto the bottom of the stack. 
                    plotThis.viewStack.unshift(selectedView);

                } else {
                    // remove the current viweport from bottom of the stack and go back to the previous one. 
                    // (though dont remove the last one - thats the DAQ view)
                    if (plotThis.viewStack.length > 1) {
                        plotThis.viewStack.shift();
                    }
                }

                // draw the re-scaled axes
                plotThis.drawPlotAxes(plotThis.viewStack[0]);
                plotThis.plotStaticData();

            }
        }

        function mouseMove(e) {
            // draw selection box on control layer
            if (plotThis.mouseMode == "zoom") {
                if (selecting) {
                    drawSelectionRect(mousePtrX, mousePtrY, e.offsetX, e.offsetY);
                }
            }
            // put stuff on info layer
            drawInfo(e);
        }

        function mouseOut(e) {
            if (plotThis.mouseMode == "zoom") {
                if (selecting) {
                    selecting = false;
                }
            }
            drawInfo(e, "clear");
        }

        // use when selecting a rectangle for some control function like zooming
        function drawInfo(e, mode = "") {

            // clear the canvas (and return if thats all we were supposed to do)
            infoDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);
            if (mode == "clear") return;

            let pix = plotThis.viewStack[0].pixelToData(e.offsetX, e.offsetY);

            plotThis.drawHline(infoDrawContext, plotThis.viewStack[0], pix[1], 1, '#f2a241');
            plotThis.drawVline(infoDrawContext, plotThis.viewStack[0], pix[0], 1, '#f2a241');

            infoDrawContext.font = "10px Arial";
            let text = "(" + e.offsetX.toFixed() + "," + e.offsetY.toFixed() + ")";
            infoDrawContext.fillText(text, e.offsetX, e.offsetY - 10);
            text = "(" + pix[0].toFixed(3) + "," + pix[1].toFixed(3) + ")";
            infoDrawContext.fillText(text, e.offsetX, e.offsetY);

        }

        // use when selecting a rectangle for some control function like zooming
        function drawSelectionRect(x1, y1, x2, y2) {

            ctlDrawContext.strokeStyle = '#f2a241';
            ctlDrawContext.lineWidth = 1;


            // start by clearing the rectangle
            ctlDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);

            // draw a new rectangle unless points 1 and 2 are the same
            if (x1 != x2 && y1 != y2) {
                ctlDrawContext.beginPath();
                ctlDrawContext.rect(x1 + .5, y1 + .5, (x2 - x1), (y2 - y1));
                ctlDrawContext.stroke();
            }


        }

    } // constructor
    //======================================================================================================
    //======================================================================================================
    //======================================================================================================
    //===============================IOLabPlot Methods======================================================

    // clean up the DOM
    reset() {
        while (this.parentElement.childNodes.length > 0) {
            this.parentElement.childNodes[0].remove();
        }
    }

    recalibrateTimes() {

        // get the original time of the last acquired data
        let datLength = calData[this.sensorNum].length;

        if (datLength > 100) { // do only if we have some data for this semsor
            let tLast0 = calData[this.sensorNum][datLength - 1][0];

            // figure out actual time per sample (divide by 1000 since totalRunTime is in ms)
            this.timePerSample = totalRunTime / datLength / 1000;

            // fix all of the time emasurements based on actual elapsed time
            let sampleTime = 0;
            for (let ind = 0; ind < datLength; ind++) {
                calData[this.sensorNum][ind][0] = sampleTime;
                sampleTime += this.timePerSample;
            }

            // debugging
            if (dbgInfo) {
                let tLast1 = calData[this.sensorNum][datLength - 1][0];
                console.log("In recalibrateTimes() sensor:" + this.sensorNum + " timePerSample:" + this.timePerSample.toFixed(6) + " tLast0:" + tLast0.toFixed(4) + " tLast1:" + tLast1.toFixed(4));
            }
        }
    }

    // draw plot axes on the layer below the chart traces of ViewPort vp
    drawPlotAxes(vp) {

        // get the bottom drawing layer context and set up the default text style
        let ctx = this.layerElementList[0].getContext("2d");
        ctx.strokeStyle = 'black';
        ctx.font = "11px Arial";

        // clear the axis canvas
        ctx.clearRect(0, 0, this.baseElement.width + 2, this.baseElement.height + 2);

        // x-axis: pick the starting time, interval, and precision based on viewport
        if (dbgInfo) console.log("In drawPlotAxes: ViewPort ", vp);
        let timeAxis = vp.pickTimeAxis();

        // draw and label the vertical gridlines (time axis)
        for (let t = timeAxis[0]; t < vp.xMax; t += timeAxis[1]) {
            let pix = vp.dataToPixel(t, vp.yMin);
            let tickLabel = t.toFixed(timeAxis[2]);
            let tickLabelWidth = ctx.measureText(tickLabel).width;
            ctx.fillText(tickLabel, pix[0] - tickLabelWidth / 2, pix[1] + 16);
            this.drawVline(ctx, vp, t, 1, '#cccccc', "");
            this.drawVline(ctx, vp, t, 1, '#000000', "-");
        }

        // label the overall time axis
        // let pix = vp.dataToPixel(vp.xMin+vp.xSpan/2, vp.yMin);
        // ctx.fillText("t (sec)", pix[0], pix[1]+25);

        // y-axis: pick the starting data value, interval, and precision based on viewport
        let dataAxis = vp.pickDataAxis();

        // draw and label the horizontal gridlines (y-axis)
        for (let y = dataAxis[0]; y < vp.yMax; y += dataAxis[1]) {
            let pix = vp.dataToPixel(vp.xMin, y);
            let tickLabel = y.toFixed(dataAxis[2]);
            let tickLabelWidth = ctx.measureText(tickLabel).width;
            ctx.fillText(tickLabel, pix[0] - tickLabelWidth - 8, pix[1] + 3);
            this.drawHline(ctx, vp, y, 1, '#cccccc', "");
            this.drawHline(ctx, vp, y, 1, '#000000', "-");
        }

        // redraw axes lines and line at y=0
        this.drawHline(ctx, vp, vp.yMin, 1, '#000000', "<");
        this.drawVline(ctx, vp, vp.xMin, 1, '#000000', "<");
        this.drawHline(ctx, vp, 0, 1, '#000000', "");
    }

    // draws a vertical line at y = yDat on context ctx reference to viewport vp 
    // and with width:lineWidth and color:strokeStyle 
    drawHline(ctx, vp, yDat, lineWidth, strokeStyle, opt = "") {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();

        let pix1 = vp.dataToPixelAxes(vp.xMin, yDat, ctx);
        let pix2 = vp.dataToPixelAxes(vp.xMax, yDat, ctx);

        if (opt == "<") { // make the starting end 5 px longer
            pix1[0] -= 5;
        } else if (opt == "-") { // make this a tick-mark
            pix2[0] = pix1[0] - 5;
        }

        ctx.moveTo(pix1[0], pix1[1]);
        ctx.lineTo(pix2[0], pix2[1]);
        ctx.stroke();

    }

    // draws a vertical line at y = yDat on context ctx reference to viewport vp 
    // and with width:lineWidth and color:strokeStyle 
    drawVline(ctx, vp, xDat, lineWidth, strokeStyle, opt = "") {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();
        let pix1 = vp.dataToPixelAxes(xDat, vp.yMin, ctx);
        let pix2 = vp.dataToPixelAxes(xDat, vp.yMax, ctx);

        if (opt == "<") { // make the starting end 5 px longer
            pix1[1] += 5;
        } else if (opt == "-") { // make this a tick-mark
            pix2[1] = pix1[1] + 5;
        }

        ctx.moveTo(pix1[0], pix1[1]);
        ctx.lineTo(pix2[0], pix2[1]);
        ctx.stroke();

    }

    // this is called when data acquisition is stopped 
    displayStaticData() {

        // get the time of the last acquired data
        let datLength = calData[this.sensorNum].length;

        if (datLength < 1) {
            if (dbgInfo) console.log("In displayStaticData(): no data to display ");

        } else {
            let tLast = calData[this.sensorNum][datLength - 1][0];
            tLast = parseInt(tLast + 1);


            // first create a viewport that contains the entire time-range      
            this.staticDataView = new ViewPort(0, tLast,
                this.runningDataView.yMin, this.runningDataView.yMax,
                this.baseElement
            );

            // Save the default static view on a stack. Zoomed views will pushed on to the bottom
            // of this stack so that element [0] is always the current view and previous views can 
            // be easily retireved. 
            this.viewStack.unshift(this.staticDataView);

            this.plotStaticData();

        }
    }

    // Plots data after data acquisition is stopped or paused.
    plotStaticData() {

        //retrieve contexts for each layer and set line properties
        let contextList = [];
        for (let ind = 0; ind < this.layerElementList.length; ind++) {
            let ctx = this.layerElementList[ind].getContext("2d");
            contextList.push(ctx);
            ctx.strokeStyle = this.layerColorList[ind];
            ctx.lineWidth = this.chartLineWidth;
        }

        // the size of all layers is the same as the bottom one
        let cWidth = this.layerElementList[0].width;
        let cHeight = this.layerElementList[0].height;

        let sensorID = this.sensorNum;


        // clear canvas and draw the axes appropriate for the current viewport
        contextList[0].clearRect(0, 0, cWidth, cHeight);
        this.drawPlotAxes(this.viewStack[0]);

        let inPort = false;
        let pix = [];

        // loop over data
        for (let ind = 0; ind < calData[sensorID].length; ind++) {

            let tplot = calData[sensorID][ind][0]; // the current time coordinate

            // don't bother plottint to the right of the viewport
            if (tplot > this.viewStack[0].xMax) {
                break;
            }

            // find the first dataploint at the leftmost edge of the viewport 
            // and start the line these
            if (!inPort && tplot >= this.viewStack[0].xMin) {
                inPort = true;
                for (let tr = 1; tr < this.nTraces + 1; tr++) {
                    contextList[tr].clearRect(0, 0, cWidth, cHeight);
                    pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr]);
                    contextList[tr].beginPath();
                    contextList[tr].moveTo(pix[0], pix[1]);
                }

            } else { // once we have the first point start drawing the rest
                for (let tr = 1; tr < this.nTraces + 1; tr++) {
                    pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr]);
                    contextList[tr].lineTo(pix[0], pix[1]);
                }
            }
        }

        // finish each of the lines and clear the part of each canvas that overlaps with the x-axis labels (cluge)
        for (let tr = 1; tr < this.nTraces + 1; tr++) {
            contextList[tr].stroke();
            contextList[tr].clearRect(0, cHeight - this.viewStack[0].yAxisOffset, cWidth, this.viewStack[0].yAxisOffset);
        }

    } // plotStaticData

    // Plots any new avaiable data. Called on a timer during data acquisition.
    plotRunningData() {

        //retrieve contexts for each layer and set line properties
        let contextList = [];
        for (let ind = 0; ind < this.layerElementList.length; ind++) {
            let ctx = this.layerElementList[ind].getContext("2d");
            contextList.push(ctx);
            ctx.strokeStyle = this.layerColorList[ind];
            ctx.lineWidth = this.chartLineWidth;
        }

        // the size of all layers is the same as the bottom one
        let cWidth = this.layerElementList[0].width;
        let cHeight = this.layerElementList[0].height;

        let sensorID = this.sensorNum;

        // see if we have unread calibrated data
        let dataLengthNow = calData[sensorID].length;
        if (calReadPtr[sensorID] < dataLengthNow) {

            let pix = []; // holds an [x,y] pixel coordinate

            // find the time coordinate of the data at the current read pointer
            let td = calData[sensorID][calReadPtr[sensorID]][0];

            // for each trace, find the starting point
            for (let tr = 1; tr < this.nTraces + 1; tr++) { //traces start numbering at 1

                contextList[tr].beginPath();

                // if this is the first call after instantiating the class, 
                // start with the data at calReadPtr (presumably 0)
                if (this.datLast[0] < 0) {

                    let xd = calData[sensorID][calReadPtr[sensorID]][tr];
                    pix = this.viewStack[0].dataToPixel(td, xd);

                } else { // if this is not the first call start with the last datapoint we plotted

                    let tstart = this.datLast[0];
                    pix = this.viewStack[0].dataToPixel(tstart, this.datLast[tr]);
                }
                contextList[tr].moveTo(pix[0], pix[1]);
            }

            let shiftView = false; // use this to indicate we are shifting the viewport
            for (let ind = calReadPtr[sensorID]; ind < dataLengthNow; ind++) {

                let tplot = calData[sensorID][ind][0]; // the current time coordinate

                // shift the viewport if necessary
                let nShift = this.viewStack[0].alignWith(tplot);
                if (nShift != 0) {
                    shiftView = true;
                    contextList[0].clearRect(0, 0, cWidth, cHeight);
                    this.drawPlotAxes(this.viewStack[0]);
                    if (dbgInfo) console.log("In plotRunningData(2) - shifted viewport by ", nShift);
                }


                for (let tr = 1; tr < this.nTraces + 1; tr++) {

                    // see if we need to wrap
                    if (shiftView) {

                        // draw the current line before wrapping
                        contextList[tr].stroke();

                        // clear canvas before wrapping
                        contextList[tr].clearRect(0, 0, cWidth, cHeight);
                        pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr]);
                        contextList[tr].beginPath();
                        contextList[tr].moveTo(pix[0], pix[1]);

                    } else {

                        pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr]);
                        contextList[tr].lineTo(pix[0], pix[1]);

                    }
                }
                shiftView = false;
            }

            // set pointers to their new values and finish the line
            calReadPtr[sensorID] = dataLengthNow;
            this.datLast[0] = calData[sensorID][dataLengthNow - 1][0];
            for (let tr = 1; tr < this.nTraces + 1; tr++) {
                this.datLast[tr] = calData[sensorID][dataLengthNow - 1][tr];
                contextList[tr].stroke();
            }
        }
    } // plotRunningData

    testClass() {
        console.log("In testClass");
        console.log(this);
    }
};

