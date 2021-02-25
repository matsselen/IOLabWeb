// 
// This code are used for plotting
//      class PlotSet
//      class ViewPort
//      class PlotIOLab

'use strict';

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class PlotSet {
    constructor(chartList, parentName) {

        let plotSetThis = this;         // save "this" to use in callback routines
        this.chartList = chartList;     // list of charts to be created
        this.parentName = parentName;   // the name of the existing parent element

        this.plotObjectList = [];       // list of PlotIOLab instances (one for each sensor)
        this.checkboxIDlist = [];       // a list of all checkbox ID's (one for each sensor)
        this.sensorCBlist = [];         // sensor checkboxes

        this.mouseMode = "zoom";        // different behaviors for zooming, panning, analysis, etc
        this.linkMode = false;          // if true then horisontal axes of charts are linked

        // find the parent element
        this.parentElement = document.getElementById(this.parentName);

        // create the analysis elements that appear above the canvas
        let analysis = document.createElement("div");
        analysis.style.paddingLeft = "5px";

        // place and control the zoom icon
        let aZoom = document.createElement("a");
        var zoomLink = document.createElement("img");
        zoomLink.src = "images/zoom1.png";
        zoomLink.width = "40";
        zoomLink.style = "cursor:pointer";
        zoomLink.style.paddingRight = "5px";
        aZoom.appendChild(zoomLink);
        aZoom.title = "Click & drag to zoom, click to undo, double-click to reset";
        aZoom.addEventListener("click", zoomClick);
        analysis.appendChild(aZoom);

        // place and control the pan icon
        let aPan = document.createElement("a");
        var panLink = document.createElement("img");
        panLink.src = "images/pan0.png";
        panLink.width = "40";
        panLink.style = "cursor:pointer";
        panLink.style.paddingRight = "5px";
        aPan.appendChild(panLink);
        aPan.title = "Click & drag to pan, click to undo, double-click to reset";
        aPan.addEventListener("click", panClick);
        analysis.appendChild(aPan);

        // place and control the analysis icon
        let aAnal = document.createElement("a");
        var anaLink = document.createElement("img");
        anaLink.src = "images/ana0.png";
        anaLink.width = "40";
        anaLink.style = "cursor:pointer";
        anaLink.style.paddingRight = "5px";
        aAnal.appendChild(anaLink);
        aAnal.title = "Click & drag to select analysis region";
        aAnal.addEventListener("click", anaClick);
        analysis.appendChild(aAnal);

        // place and control the chart-link icon
        let aLink = document.createElement("a");
        var linkLink = document.createElement("img");
        linkLink.src = "images/link0.png";
        linkLink.width = "40";
        linkLink.style = "cursor:pointer";
        linkLink.style.paddingRight = "5px";
        aLink.appendChild(linkLink);
        aLink.title = "Link charts";
        aLink.addEventListener("click", linkClick);
        analysis.appendChild(aLink);

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
            let chartHeight = 250;

            // create an IOLabPlot object on each plot element
            this.plotObjectList.push(new PlotIOLab(this, this.sensorNum, sensorID, chartHeight));

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
            this.sensorCBlist.push(cb);

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
            if (dbgInfo) {
                console.log("selecting zoom mode");
            }
            zoomLink.src = "images/zoom1.png";
            panLink.src = "images/pan0.png";
            anaLink.src = "images/ana0.png";
            plotSetThis.mouseMode = "zoom";
        }

        function panClick() {
            if (dbgInfo) {
                console.log("selecting pan mode");
            }
            zoomLink.src = "images/zoom0.png";
            panLink.src = "images/pan1.png";
            anaLink.src = "images/ana0.png";
            plotSetThis.mouseMode = "pan";
        }

        function anaClick() {
            if (dbgInfo) {
                console.log("selecting analysis mode");
            }
            zoomLink.src = "images/zoom0.png";
            panLink.src = "images/pan0.png";
            anaLink.src = "images/ana1.png";
            plotSetThis.mouseMode = "anal";
        }

        function linkClick() {
            if (dbgInfo) {
                console.log("selecting link mode");
            }
            if (plotSetThis.linkMode) {
                linkLink.src = "images/link0.png";
                plotSetThis.linkMode = false;
            } else {
                linkLink.src = "images/link1.png";
                plotSetThis.linkMode = true;
            }
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

        this.mouseMode = "";

        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // remove any static viewports from the stack
            while (plot.viewStack.length > 1) {
                plot.viewStack.shift();
            }

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

        this.mouseMode = "zoom";
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // display the data
            plot.displayStaticData();
        }
    }


    plotRunningData() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {
            this.plotObjectList[ind].plotRunningData();
        }
    }


};

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class ViewPort {
    // this class defines the data value range displayed on a chart in calibrated data units
    // and provides methods to maniplate data for plotting

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

    // shift the current viewport by (dX, dY) pixels
    shiftView(dxPix, dyPix) {

        let dXdata = dxPix * this.xSpan / this.cWidth;
        let dYdata = -dyPix * this.ySpan / this.cHeight;

        this.xMin += dXdata;
        this.xMax += dXdata;
        this.yMin += dYdata;
        this.yMax += dYdata;
    }

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
                    if (this.yMin < -interval) start -= interval;
                    let precision = Math.max(exp - 2, 0);
                    //console.log("start=",start," interval=",interval)
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

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class PlotIOLab {

    // the constructor sets up a ploting area and its controls
    constructor(thisParent, sensorNum, parentName, chartHeight = 200, chartWidth = 700) {

        this.thisParent = thisParent;   // this probably wont work
        this.sensorNum = sensorNum;     // the number of the sensor being plotted
        this.parentName = parentName;   // the ID of the parent <div> block
        this.chartHeight = chartHeight; // initial height of the chart in pixels
        this.chartWidth = chartWidth;   // initial width of the chart in pixels

        let plotThis = this;            // save "this" to used in callback routines

        this.layerColorList = [];       // holds the canvas layer colors
        this.layerIDlist = [];          // a list of all canvas layer ID's
        this.layerElementList = [];     // save the element handles to save "getElementById" calls
        this.checkboxIDlist = [];       // a list of all checkbox ID's
        this.traceEnabledList = [];     // true if a trace layer is visible. Note: counts from 0.
        this.analObjectList = [0];      // one analysis object for each trace (count from 1)
        this.chartLineWidth = 1;        // the width of the chart lines

        this.initialTimeSpan = 10;      // the initial time axis range (seconds)

        this.viewStack = [];            // a stack of static viewports ([0] is always current)

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
        let canvasStack = new CanvasStack(this.baseID, this.nTraces + 5);

        //                     Canvas layers
        //      layer N+3:  zooming & panning control
        //      layer N+2:  analysis results and highlighting
        //      layer N+1:  cursor information
        //  layers 1 to N:  one layer for each of the N chart trace 
        //        layer 0:  bottom layer is for the axes
        for (let ind = 0; ind < (this.axisTitles.length + 4); ind++) {
            let layerID = canvasStack.createLayer();
            this.layerIDlist.push(layerID);
            this.layerElementList.push(document.getElementById(layerID));
        }

        // create a checkbox for each component of the sensor data - and - 
        // create a data analysis object for each component of the sensor data
        for (let ind = 0; ind < this.axisTitles.length; ind++) {

            // create the checkbox and set its attributes
            // first create its ID (and save this in a list)
            let cb = document.createElement("input");
            let cbID = this.baseID + "_cb" + ind.toString();
            this.checkboxIDlist.push(cbID);
            this.traceEnabledList.push(true);

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
            
            // put the axis label in a <span> element so we can set the color of the text
            let axisContainer =  document.createElement("span");
            axisContainer.style.color = this.layerColorList[ind+1];
            axisContainer.appendChild(axis);

            // add the labels and boxes to the control region
            controls.appendChild(axisContainer);
            controls.appendChild(cb);

            // create a data analysis object for each trace
            let stat = new StatsIOLab(this.sensorNum, ind + 1);
            this.analObjectList.push(stat);

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

        // analysis results and highlighting layer
        let analysisLayer = this.layerElementList[this.layerElementList.length - 2];
        let analysisDrawContext = analysisLayer.getContext("2d");

        // cursor info layer
        let infoLayer = this.layerElementList[this.layerElementList.length - 3];
        let infoDrawContext = infoLayer.getContext("2d");


        // =================================================================================
        // IOLabPlot Constructor functions and event handlers

        // event handler for the layer selection checkboxes
        function selectLayer() {

            // figure out the layer by looking at the ID
            let ind = parseInt(this.id.substr(this.id.length - 1, 1));
            plotThis.traceEnabledList[ind] = this.checked;

            if (this.checked) {
                document.getElementById(this.canvaslayer).style.display = "block";
            } else {
                document.getElementById(this.canvaslayer).style.display = "none";
            }
            plotThis.drawSelectionAnalysis();

            if (dbgInfo) {
                console.log("In Plot::selectLayer() ", this.id, this.canvaslayer, this.checked, plotThis.traceEnabledList);
            }

        }

        // various variables and handlers for mouse events
        let zooming = false;
        let panning = false;
        let analyzing = false;
        let mousePtrX, mousePtrY;
        let mousePtrXlast, mousePtrYlast;

        // when the left mouse button is double-clicked
        function dblclick(e) {
            if ((plotThis.thisParent.mouseMode == "zoom") || (plotThis.thisParent.mouseMode == "pan")) {
                // remove any static viewports from the stack
                while (plotThis.viewStack.length > 1) {
                    plotThis.viewStack.shift();
                }
                // scale x-axis and plot all data
                plotThis.displayStaticData();
                plotThis.drawSelectionAnalysis();
            }
            if (plotThis.thisParent.mouseMode == "anal") {
                analTime1 = 0;
                analTime2 = 0;
                tStart = 0;
                tStop = 0;
                plotThis.drawSelectionAnalysis();
            }
        }

        // when the left mouse button is pressed
        function mouseDown(e) {
            if (plotThis.thisParent.mouseMode == "zoom") {
                zooming = true;
                mousePtrX = e.offsetX;
                mousePtrY = e.offsetY;
            }

            if (plotThis.thisParent.mouseMode == "pan") {
                panning = true;
                mousePtrX = e.offsetX;
                mousePtrY = e.offsetY;
                mousePtrXlast = e.offsetX;
                mousePtrYlast = e.offsetY;
                // make a copy of the current viewport and put it n the stack       
                let copyView = new ViewPort(plotThis.viewStack[0].xMin, plotThis.viewStack[0].xMax,
                    plotThis.viewStack[0].yMin, plotThis.viewStack[0].yMax, plotThis.viewStack[0].canvasElement);

                // push the new viweport onto the bottom of the stack. 
                plotThis.viewStack.unshift(copyView);


            }

            if (plotThis.thisParent.mouseMode == "anal") {
                analyzing = true;
                mousePtrX = e.offsetX;
                mousePtrY = e.offsetY;
                analTime1 = commonCursorTime;
            }
        }

        // when the left mouse button is released
        function mouseUp(e) {

            if (panning) {
                panning = false;

                if (mousePtrX == e.offsetX && mousePtrY == e.offsetY) {
                    // remove the current viweport from bottom of the stack and go back to the previous one. 
                    // we do this twice if we are in pam mode since the mouse-down event created a copy of the previos view
                    // (though dont remove the last one - thats the DAQ view)
                    if (plotThis.viewStack.length > 1) {
                        plotThis.viewStack.shift();
                    }
                    if (plotThis.viewStack.length > 1) {
                        plotThis.viewStack.shift();
                    }
                }
                // draw with the panned axes
                plotThis.drawPlotAxes(plotThis.viewStack[0]);
                plotThis.plotStaticData();
                plotThis.drawSelectionAnalysis();
            }

            if (zooming) {
                zooming = false;

                if (mousePtrX != e.offsetX || mousePtrY != e.offsetY) {

                    // clear the control layer 
                    ctlDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);

                    // find out where we started and ended the selection
                    let p1 = plotThis.viewStack[0].pixelToData(e.offsetX, e.offsetY);
                    let p2 = plotThis.viewStack[0].pixelToData(mousePtrX, mousePtrY);

                    // calculte the new viewport boundaries
                    let xMin = Math.min(p1[0], p2[0]);
                    let xMax = Math.max(p1[0], p2[0]);
                    let yMin = Math.min(p1[1], p2[1]);
                    let yMax = Math.max(p1[1], p2[1]);

                    // first create a viewport      
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

                // draw the zoomed axes
                plotThis.drawPlotAxes(plotThis.viewStack[0]);
                plotThis.plotStaticData();
                plotThis.drawSelectionAnalysis();
            }

            if (analyzing) {
                analyzing = false;
                if ((mousePtrX != e.offsetX) || (mousePtrY != e.offsetY)) {
                    analTime2 = commonCursorTime;
                    plotThis.drawSelectionAnalysis();
                }
            }
        }

        // when the mouse moves over the chart
        function mouseMove(e) {

            // put crosshairs and cursor info on control layer if we are in 
            // zoom mode or pan mode
            if ((plotThis.thisParent.mouseMode == "zoom") || (plotThis.thisParent.mouseMode == "pan")) {
                drawCursorInfo(e);
            }
            if (plotThis.thisParent.mouseMode == "anal") {

                // find mouse location in data coordinates
                let mouseData = plotThis.viewStack[0].pixelToData(e.offsetX, e.offsetY);
                commonCursorTime = mouseData[0];
                plotThis.drawTimeAndData();

            }

            // draw selection box if we are zooming
            if (zooming) {
                drawSelectionRect(mousePtrX, mousePtrY, e.offsetX, e.offsetY);
            }

            // shift the viewport if we are panning
            if (panning) {
                plotThis.viewStack[0].shiftView(mousePtrXlast - e.offsetX, mousePtrYlast - e.offsetY);
                mousePtrXlast = e.offsetX;
                mousePtrYlast = e.offsetY;

                // draw the panned chart
                plotThis.drawPlotAxes(plotThis.viewStack[0]);
                plotThis.plotStaticData();
                plotThis.drawSelectionAnalysis();
            }

            // draw displacement vector if we are panning
            if (analyzing) {
                analTime2 = commonCursorTime;
                // make sure tStart <= tStop
                if (analTime1 <= analTime2) {
                    tStart = analTime1;
                    tStop = analTime2;
                } else {
                    tStart = analTime2;
                    tStop = analTime1;
                }
                plotThis.drawSelectionAnalysis();
            }

        }

        // clean up when the mouse leaves the chart
        function mouseOut(e) {
            zooming = false;
            panning = false;
            analyzing = false;
            infoDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);
            ctlDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);
        }

        // display crosshair and cursor info

        function drawCursorInfo(e, mode = "") {

            // clear the canvas (and return if thats all we were supposed to do)
            infoDrawContext.clearRect(0, 0, plotThis.baseElement.width + 2, plotThis.baseElement.height + 2);
            if (mode == "clear") return;

            let pix = plotThis.viewStack[0].pixelToData(e.offsetX, e.offsetY);

            plotThis.drawHline(infoDrawContext, plotThis.viewStack[0], pix[1], 1, '#f2a241');
            plotThis.drawVline(infoDrawContext, plotThis.viewStack[0], pix[0], 1, '#f2a241');

            infoDrawContext.font = "10px Arial";
            let text = "(" + pix[0].toFixed(3) + "," + pix[1].toFixed(3) + ")";
            infoDrawContext.fillText(text, e.offsetX + 1, e.offsetY - 1);

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

    //===============================IOLabPlot Methods========================================

    drawSelectionAnalysis() {
        if (plotSet.linkMode) {
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                if (plotSet.checkboxIDlist[ind]) {
                    plotSet.plotObjectList[ind].drawSelectionAnalysisMethod();
                }
            }
        } else {
            this.drawSelectionAnalysisMethod();
        }

    }

    drawTimeAndData() {
        if (plotSet.linkMode) {
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                plotSet.plotObjectList[ind].drawTimeAndDataMethod();
            }
        } else {
            this.drawTimeAndDataMethod();
        }
    }

    // use when selecting a rectangle for some control function like zooming
    drawSelectionAnalysisMethod() {

        // analysis info layer
        let analysisLayer = this.layerElementList[this.layerElementList.length - 2];
        let analysisDrawContext = analysisLayer.getContext("2d");


        // the size of all layers is the same as the bottom one
        let cWidth = this.layerElementList[0].width;
        let cHeight = this.layerElementList[0].height;

        // find the data indeces that corresponds to the selected times
        let indStart = Math.floor(tStart / this.timePerSample);
        let indStop = Math.floor(tStop / this.timePerSample);

        // make sure these correspond to existing array elements
        if (indStart < 0) indStart = 0;
        if (indStop > calData[this.sensorNum].length - 1) indStop = calData[this.sensorNum].length - 1;

        // redo the start & stop times so that they correspond to actual samples
        let tStartLocal = calData[this.sensorNum][indStart][0];
        let tStopLocal = calData[this.sensorNum][indStop][0];

        // find the theoretical indeces for the left and right side of the viewport
        let indLeftVP = Math.round(this.viewStack[0].xMin / this.timePerSample) - 1;
        let indRightVP = Math.round(this.viewStack[0].xMax / this.timePerSample);

        // find the actual left and right indeces if the region to highlight
        // so we dont try to highlightoutside the chart and/or data boundaries
        let indLeft = Math.max(indLeftVP, indStart);
        let indRight = Math.min(indRightVP, indStop);

        // find the actual times for the left and tight edges of the highlighting
        let tLeft = calData[this.sensorNum][indLeft][0];
        let tRight = calData[this.sensorNum][indRight][0];

        // clear old stuff
        analysisDrawContext.clearRect(0, 0, this.baseElement.width + 2, this.baseElement.height + 2);

        // if there is no interval to draw then return
        if (tStopLocal == tStartLocal) return;


        if (tStartLocal >= this.viewStack[0].xMin && tStartLocal <= this.viewStack[0].xMax) {
            this.drawVline(analysisDrawContext, this.viewStack[0], tStartLocal, 1, '#000000');
        }

        if (tStopLocal >= this.viewStack[0].xMin && tStopLocal <= this.viewStack[0].xMax) {
            this.drawVline(analysisDrawContext, this.viewStack[0], tStopLocal, 1, '#000000');
        }

        analysisDrawContext.fillStyle = '#000000';
        analysisDrawContext.font = "12px Arial";
        let text = "∆t = " + Math.abs(tStopLocal - tStartLocal).toFixed(3) + "s";
        analysisDrawContext.fillText(text, 200, 15);

        // find the starting and ending 
        let zeroLeft = this.viewStack[0].dataToPixel(tLeft, 0);
        let zeroRight = this.viewStack[0].dataToPixel(tRight, 0);

        // highlight the selected region for each visible trace
        let traceVoffset = 15;
        for (let tr = 1; tr < this.nTraces + 1; tr++) {
            if (this.traceEnabledList[tr - 1]) {

                // calculate statistics
                let st = this.analObjectList[tr];
                st.calcStats(indStart, indStop);

                // put data numbers at top left corner of plot
                analysisDrawContext.fillStyle = this.layerColorList[tr];
                let text = "n=" + st.n.toFixed(0) + " μ=" + st.mean.toFixed(4) + "±" + st.stderr.toFixed(4) + " σ=" + st.sigma.toFixed(4) +
                    " a=" + st.area.toFixed(2) + " m=" + st.slope.toFixed(2) + " b=" + st.intercept.toFixed(2) +
                    " r=" + st.rxy.toFixed(3);
                traceVoffset += 12;
                analysisDrawContext.fillText(text, 200, traceVoffset);

                if (indRight > indLeft) {
                    analysisDrawContext.beginPath();
                    analysisDrawContext.moveTo(zeroLeft[0], zeroLeft[1]);
                    for (let ind = indLeft; ind <= indRight; ind++) {
                        let t = calData[this.sensorNum][ind][0];
                        let y = calData[this.sensorNum][ind][tr];
                        let p = this.viewStack[0].dataToPixel(t, y);
                        analysisDrawContext.lineTo(p[0], p[1]);
                    }
                    analysisDrawContext.lineTo(zeroRight[0], zeroRight[1]);
                    analysisDrawContext.closePath();
                    analysisDrawContext.fillStyle = this.layerColorList[tr] + '3f';
                    analysisDrawContext.fill();
                }
            }
        }
        // clean up any spills (i.e. any highlighting over the axis labels)
        analysisDrawContext.clearRect(0, cHeight - this.viewStack[0].yAxisOffset, cWidth, this.viewStack[0].yAxisOffset);
        analysisDrawContext.clearRect(0, 0, this.viewStack[0].xAxisOffset, cHeight);
    }

    // display vertical line at cursor and data for this time
    drawTimeAndDataMethod(mode = "") {

        // cursor info layer
        let infoLayer = this.layerElementList[this.layerElementList.length - 3];
        let infoDrawContext = infoLayer.getContext("2d");

        // clear the canvas (and return if thats all we were supposed to do)
        infoDrawContext.clearRect(0, 0, this.baseElement.width + 2, this.baseElement.height + 2);
        if (mode == "clear") return;

        // if timePerSample is not initalized then something is wrong
        if (this.timePerSample == 0) {
            console.log("In drawTimeAndDataMethod(): sensor "+this.sensorNum.toString()+" timePerSample in not set - Mats screwed up");
            return;
        }

        // find the data index that corresponds to the selected time
        let ind = Math.round(commonCursorTime / this.timePerSample);

        // if we are past the first data-point then use the first one
        if (ind < 0) {
            ind = 0;
        }

        // if we are past the last data-point then use the last one
        if (ind >= calData[this.sensorNum].length) {
            ind = calData[this.sensorNum].length - 1;
        }

        // find the time of the current index (i.e. the actual sample time)
        let plotCursorTime = calData[this.sensorNum][ind][0];

        // draw a vertical line at the sample time
        this.drawVline(infoDrawContext, this.viewStack[0], plotCursorTime, 1, '#000000');


        // put cursor time at top left corner of plot
        infoDrawContext.font = "12px Arial";
        infoDrawContext.fillStyle = '#000000';
        let text = "t = " + plotCursorTime.toFixed(3) + "s";
        infoDrawContext.fillText(text, 50, 15);


        // find the data value at the cursor for each visible trace
        let traceVoffset = 15;
        for (let tr = 1; tr < this.nTraces + 1; tr++) {
            if (this.traceEnabledList[tr - 1]) {

                let currentCursorData = calData[this.sensorNum][ind][tr];
                let dataPix = this.viewStack[0].dataToPixel(plotCursorTime, currentCursorData);
                infoDrawContext.strokeStyle = 'rgba(0,0,0,0)'; // transparent circle outline (cluge)
                infoDrawContext.lineWidth = 0;
                infoDrawContext.beginPath();
                infoDrawContext.arc(dataPix[0], dataPix[1], 4, 0, 2 * Math.PI);
                infoDrawContext.fillStyle = this.layerColorList[tr] + '7f'; //fill-alpha = 0.5
                infoDrawContext.fill();
                infoDrawContext.stroke();

                // put data numbers at top left corner of plot
                infoDrawContext.fillStyle = this.layerColorList[tr]; //fill-alpha = 1.0
                let text = this.axisTitles[tr - 1] + " = " + currentCursorData.toFixed(3) + " " + this.unit;
                traceVoffset += 12;
                infoDrawContext.fillText(text, 50, traceVoffset);

            }
        }

    }


    matsTest(e) {
        let x = e.offsetX
        let n = this.sensorNum;
        console.log("Hi Mats n,x: ", n, x);
    }
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
                console.log("In recalibrateTimes() sensor:" + this.sensorNum +
                    " timePerSample:" + this.timePerSample.toFixed(6) +
                    " tLast0:" + tLast0.toFixed(4) +
                    " tLast1:" + tLast1.toFixed(4) +
                    " length:" + datLength.toFixed(0));
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
        if (vp.containsYdata(0)) this.drawHline(ctx, vp, 0, 1, '#000000', "");
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
            let tLastFloat = calData[this.sensorNum][datLength - 1][0];
            let tLast = parseInt(tLastFloat + 1);

            // if we are restoring an acquisition then timePerSample wont be set
            // so in this case we figure it out and set it
            if (this.timePerSample == 0) {
                this.timePerSample = tLastFloat / datLength;
            }


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

        let first = true;
        let pix = [];

        // only plot the visible part
        let ind1 = Math.floor(this.viewStack[0].xMin / this.timePerSample) - 2;
        if (ind1 < 0) ind1 = 0;
        let ind2 = Math.floor(this.viewStack[0].xMax / this.timePerSample) + 2;
        if (ind2 > calData[sensorID].length) ind2 = calData[sensorID].length;

        // loop over data
        for (let ind = ind1; ind < ind2; ind++) {

            let tplot = calData[sensorID][ind][0]; // the current time coordinate

            // find the first dataploint at the leftmost edge of the viewport 
            // and start the line these
            if (first) {
                first = false;
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

        // finish each of the lines and clear the part of each canvas that overlaps with the x and y-axis labels (cluge)
        for (let tr = 1; tr < this.nTraces + 1; tr++) {
            contextList[tr].stroke();
            contextList[tr].clearRect(0, cHeight - this.viewStack[0].yAxisOffset, cWidth, this.viewStack[0].yAxisOffset);
            contextList[tr].clearRect(0, 0, this.viewStack[0].xAxisOffset, cHeight);
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

