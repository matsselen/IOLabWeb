// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

// 
// These classes are used for plotting IOLab data
//      class PlotSet
//      class ViewPort
//      class PlotIOLab

'use strict';

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class PlotSet {

    // this class holds a set of "PlotIOLab" class objects - one for each active sensor
    constructor(fixedConfig, chartContainer, controlContainer) {

        let plotSetThis = this;         // save "this" to use in callback routines
        this.fixedConfig = fixedConfig; // the fixed congiguration being used
        this.chartContainer = chartContainer;       // the name of the existing chart container
        this.controlContainer = controlContainer;   // the name of the existing control container

        this.chartList = fixedConfig.chartList;       // list of charts to be created 
        this.chartRateList = fixedConfig.chartRateList;   // list of sample rates for each chart


        this.plotObjectList = [];       // list of PlotIOLab instances (one for each sensor)
        this.checkboxIDlist = [];       // a list of all checkbox ID's (one for each sensor)
        this.sensorCBlist = [];         // sensor checkboxes

        this.mouseMode = "zoom";        // different behaviors for zooming, panning, analysis, etc
        this.linkMode = false;          // if true then horisontal axes of charts are linked

        // find the chart container element
        this.chartElement = document.getElementById(this.chartContainer);

        // find the control container element
        this.controlElement = document.getElementById(this.controlContainer);

        // create the analysis elements that appear above the canvas
        let analysis = document.createElement("div");
        analysis.style.paddingLeft = "5px";

        // place and control the zoom icon
        this.aZoom = document.createElement("a");
        this.zoomLink = document.createElement("img");
        this.zoomLink.src = "images/zoom1.png";
        this.zoomLink.width = "40";
        this.zoomLink.style = "cursor:pointer";
        this.zoomLink.style.paddingRight = "5px";
        this.aZoom.appendChild(this.zoomLink);
        this.aZoom.title = "Click & drag to zoom, click to undo, double-click to reset";
        this.aZoom.addEventListener("click", zoomClick);
        analysis.appendChild(this.aZoom);

        // place and control the pan icon
        this.aPan = document.createElement("a");
        this.panLink = document.createElement("img");
        this.panLink.src = "images/pan0.png";
        this.panLink.width = "40";
        this.panLink.style = "cursor:pointer";
        this.panLink.style.paddingRight = "5px";
        this.aPan.appendChild(this.panLink);
        this.aPan.title = "Click & drag to pan, click to undo, double-click to reset";
        this.aPan.addEventListener("click", panClick);
        analysis.appendChild(this.aPan);

        // place and control the analysis icon
        this.aAnal = document.createElement("a");
        this.anaLink = document.createElement("img");
        this.anaLink.src = "images/ana0.png";
        this.anaLink.width = "40";
        this.anaLink.style = "cursor:pointer";
        this.anaLink.style.paddingRight = "5px";
        this.aAnal.appendChild(this.anaLink);
        this.aAnal.title = "Click & drag to select analysis region";
        this.aAnal.addEventListener("click", anaClick);
        analysis.appendChild(this.aAnal);

        // place and control the chart-link icon
        this.aLink = document.createElement("a");
        this.linkLink = document.createElement("img");
        this.linkLink.src = "images/link0.png";
        this.linkLink.width = "40";
        this.linkLink.style = "cursor:pointer";
        this.linkLink.style.paddingRight = "5px";
        this.aLink.appendChild(this.linkLink);
        this.aLink.title = "Link charts";
        this.aLink.addEventListener("click", linkClick);
        analysis.appendChild(this.aLink);

        // place and control the CSV time-aligned download icon
        this.aCSVall = document.createElement("a");
        this.linkCSVall = document.createElement("img");
        this.linkCSVall.src = "images/csv.png";
        this.linkCSVall.height = "30";
        this.linkCSVall.style = "cursor:pointer";
        this.linkCSVall.style.padding = "2px 5px 5px 25px";
        this.aCSVall.appendChild(this.linkCSVall);
        this.aCSVall.title = "Export data from all charts to a single .csv file. Time range defined by top plot.";
        this.aCSVall.addEventListener("click", csvAllClick);
        analysis.appendChild(this.aCSVall);

        // add the analysis region to the page and put some vertical space below it
        this.controlElement.appendChild(analysis);
        this.controlElement.appendChild(document.createElement("p"));


        // create the control elements that appear above the canvas
        let controls = document.createElement("div");
        let controlTitle = document.createTextNode("Sensors:\xA0");
        controls.appendChild(controlTitle);

        // add the control region to the page and put some vertical space below it
        this.controlElement.appendChild(controls);

        // loop over sensors
        for (let ind = 0; ind < this.chartList.length; ind++) {

            this.chartRate = this.chartRateList[ind];
            this.sensorNum = this.chartList[ind];
            this.sensor = sensorInfoList[this.sensorNum];

            // create the <div> element that will be the parent element for each sensors plot
            let sensDiv = document.createElement("div");
            let sensorID = "plot_sens_" + this.sensor.shortDesc;
            sensDiv.setAttribute("id", sensorID);
            sensDiv.style.position = "relative";

            // append the plot for this sensor to the parent element
            this.chartElement.appendChild(sensDiv);

            //adjust the height of the charts based on the number of charts
            let chartHeight = 250;

            // create an IOLabPlot object on each plot element
            this.plotObjectList.push(new PlotIOLab(this, this.sensorNum, this.chartRate, sensorID, chartHeight));

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

            // box is checked to begin with
            cb.checked = true;

            // create the axis labels before each checkbox
            let whichSens = document.createTextNode("\xA0\xA0" + this.sensor.shortDesc + ":");

            // add the labels and boxes to the control region
            controls.appendChild(whichSens);
            controls.appendChild(cb);

            this.sensorCBlist.push(cb);

        }

        // =================================================================================
        // PlotSet Constructor functions and event handlers

        // event handler for the layer selection checkboxes
        function selectSensor() {
            if (dbgInfo) console.log("In Plot::selectSensor() ", this.id, this.checked);

            if (this.checked) {
                //document.getElementById(this.sensorDivID).style.display = "block";
                document.getElementById(this.sensorDivID).hidden = false;
            } else {
                //document.getElementById(this.sensorDivID).style.display = "none";
                document.getElementById(this.sensorDivID).hidden = true;
            }
        }

        function zoomClick() {
            if (dbgInfo) {
                console.log("selecting zoom mode");
            }
            plotSetThis.zoomLink.src = "images/zoom1.png";
            plotSetThis.panLink.src = "images/pan0.png";
            plotSetThis.anaLink.src = "images/ana0.png";
            plotSetThis.mouseMode = "zoom";
        }

        function panClick() {
            if (dbgInfo) {
                console.log("selecting pan mode");
            }
            plotSetThis.zoomLink.src = "images/zoom0.png";
            plotSetThis.panLink.src = "images/pan1.png";
            plotSetThis.anaLink.src = "images/ana0.png";
            plotSetThis.mouseMode = "pan";
        }

        function anaClick() {
            if (dbgInfo) {
                console.log("selecting analysis mode");
            }
            plotSetThis.zoomLink.src = "images/zoom0.png";
            plotSetThis.panLink.src = "images/pan0.png";
            plotSetThis.anaLink.src = "images/ana1.png";
            plotSetThis.mouseMode = "anal";
        }

        function linkClick() {
            if (dbgInfo) {
                console.log("selecting link mode");
            }
            if (plotSetThis.linkMode) {
                plotSetThis.linkLink.src = "images/link0.png";
                plotSetThis.linkMode = false;
            } else {
                plotSetThis.linkLink.src = "images/link1.png";
                plotSetThis.linkMode = true;
            }
        }

        function csvAllClick() {
            plotSetThis.exportAllCsv();
        }
    }

    //===================================================================
    // class methods

    // export time-aligned data to csv file
    exportAllCsv() {
        console.log("In exportAllCsv()");

        // The charts are ordered so that the first one should be used to supply the 
        // common timebase for all. The data in the other charts is interpolated/averaged to
        // provide numbers at the same time coordinates. 

        // the first row contains the columns labels
        let csvdata = "t (s)";
        for (let p = 0; p < this.plotObjectList.length; p++) {

            for (let ind = 0; ind < this.plotObjectList[p].axisTitles.length; ind++) {
                csvdata += ", ";
                csvdata += this.plotObjectList[p].csvLabels[ind];
            }
        }
        csvdata += "\r\n";

        // The time range is defined by the visible part of the topmost plot
        let ind1 = Math.floor(this.plotObjectList[0].viewStack[0].xMin / this.plotObjectList[0].timePerSample) - 2;
        if (ind1 < 0) ind1 = 0;
        let ind2 = Math.floor(this.plotObjectList[0].viewStack[0].xMax / this.plotObjectList[0].timePerSample) + 2;
        if (ind2 > this.plotObjectList[0].plotData.length) ind2 = this.plotObjectList[0].plotData.length;

        // loop over data
        for (let ind = ind1; ind < ind2; ind++) {

            // get the time values from the first plot
            //for (let ind = 0; ind < this.plotObjectList[0].plotData.length; ind++) {
            let t = this.plotObjectList[0].plotData[ind][0];
            csvdata += t.toString();

            // Loop over the charts and find the data at this 
            for (let p = 0; p < this.plotObjectList.length; p++) {
                let d = this.plotObjectList[p].getDataAtTime(t);

                // then a y coordinate for each axis
                for (let tr = 1; tr < d.length; tr++) {
                    let yplot = d[tr] - this.plotObjectList[p].datShift[tr];
                    csvdata += ", ";
                    csvdata += yplot.toString();
                }
            }
            csvdata += "\r\n";
        }

        // create a blob of the csv data
        let dataBlob = new Blob([csvdata]);

        // figure out filename
        let date = new Date();
        let fName = "IOLabCSVall_" +
            date.toDateString().substr(4, 3) + "-" +
            date.toDateString().substr(8, 2) + "-" +
            date.toDateString().substr(11, 4) + "_" +
            date.toTimeString().substr(0, 2) + "." +
            date.toTimeString().substr(3, 2) + "." +
            date.toTimeString().substr(6, 2) + "_" +
            "sens_all.csv";

        // save the data as a local download
        this.aCSVall.href = window.URL.createObjectURL(dataBlob), { type: "text/csv;charset=utf-8" };
        this.aCSVall.download = fName;

    }


    // clean up the DOM
    reset() {

        // clean up each child plot class
        while (this.plotObjectList.length > 0) {
            this.plotObjectList[0].reset();
            this.plotObjectList.shift();
        }

        //clean up ourselves
        while (this.chartElement.childNodes.length > 0) {
            this.chartElement.childNodes[0].remove();
        }
        while (this.controlElement.childNodes.length > 0) {
            this.controlElement.childNodes[0].remove();
        }
    }

    // called when the DAQ is started
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
            plot.smoothHide();

            plot.ctlLayer.hidden = true;
            this.zoomLink.src = "images/zoom0.png";
            this.panLink.src = "images/pan0.png";
            this.anaLink.src = "images/ana0.png";
            this.linkLink.src = "images/link0.png";

            // analysis info layer
            let analysisLayer = plot.layerElementList[plot.layerElementList.length - 2];
            let analysisDrawContext = analysisLayer.getContext("2d");

            // clear old stuff
            analysisDrawContext.clearRect(0, 0, plot.baseElement.width + 2, plot.baseElement.height + 2);
            tStart = 0;
            tStop = 0;

        }
    }

    // called when the DAQ is paused/ended
    stopAcquisition() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // recalibrate each time axis based on the number of samples and the elapsed time
            plot.processPlotData();
            plot.smoothShow();
            plot.ctlLayer.hidden = false;
            this.zoomLink.src = "images/zoom1.png";


        }
    }

    // reprocess the acquired data so we can display and analyze it
    reprocessPlotData() {
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // reprocess the plot data (smoothing etc)
            plot.processPlotData();
            plot.smoothShow();
        }
    }

    // display whatever data we have after pausing or ending or recalling a run
    displayPlots() {

        this.mouseMode = "zoom";
        for (let ind = 0; ind < this.plotObjectList.length; ind++) {

            let plot = this.plotObjectList[ind];

            // display the data
            plot.displayStaticData();
        }
    }

    // plot the data in real time as we are aquiring it
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

    // display and analyze the data for one sensor
    // the constructor sets up a ploting area and its controls
    //constructor(thisParent, sensorNum, parentName, chartHeight = 200, chartWidth = 700) {
    constructor(thisParent, sensorNum, sensorRate, parentName, chartHeight = 200, chartWidth = 700) {

        this.thisParent = thisParent;   // this probably wont work
        this.sensorNum = sensorNum;     // the number of the sensor being plotted
        this.parentName = parentName;   // the ID of the parent <div> block
        this.chartHeight = chartHeight; // initial height of the chart in pixels
        this.chartWidth = chartWidth;   // initial width of the chart in pixels

        this.sensorRate = sensorRate;   // the sample rate of the sensor being plotted

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

        // this holds the reprocessed (smoothed etc) data that is plotted
        this.plotData = [];

        // this will hold (t,x,[y,z,...]) of last data point plotted 
        // start with [t] and we will add 0's for each trace further below
        this.datLast = [-1];

        this.sensor = sensorInfoList[sensorNum];

        // extract some useful info from the sensor object
        this.plotName = this.sensor.desc;      // the name of the chart
        this.unit = this.sensor.unit;      // the units of the measurement
        this.axisTitles = this.sensor.legends;   // the trace labels
        this.csvLabels = this.sensor.csvLabels;  // axis labels used for csv export
        this.scales = this.sensor.scales;    // the initial y-axis scale range
        this.baseID = this.sensor.shortDesc; // the ID of the bottom layer (used for drawing axes)
        this.zeroable = this.sensor.zeroable; // can this sensor be zeroed

        // the number of traces is the same as the number of axis titles and 
        this.nTraces = this.axisTitles.length;

        // parameters that determine reprocessing of each trace
        this.smoothVal = 0;
        this.datShift = new Array(1 + this.nTraces).fill(0);

        // copy the trace colors so we can add to it w/o messing up the original.
        this.layerColorList = Array.from(this.sensor.pathColors);

        // the bottom and top layers are black (axes and control)
        this.layerColorList.push("#000000");
        this.layerColorList.unshift("#000000");

        if (dbgInfo) {
            console.log("PlotIOLab() sensor:" + sensorNum.toString() + " rate:" + sensorRate.toString());
        }

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
        let chartName = document.createTextNode(this.plotName + " (" + this.sensorRate.toString() + " Hz)\xA0\xA0");
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
            let axisContainer = document.createElement("span");
            axisContainer.style.color = this.layerColorList[ind + 1];
            axisContainer.appendChild(axis);

            // add the labels and boxes to the control region
            controls.appendChild(axisContainer);
            controls.appendChild(cb);

            // create a data analysis object for each trace
            let stat = new StatsIOLab(this, ind + 1);
            this.analObjectList.push(stat);

        }

        // text that appears at the end of the row of sensor checkboxes
        let txt = document.createTextNode("\xA0 vs. t (s)");
        controls.appendChild(txt);

        // create a drop-down menu to control smoothing
        let opt = null;
        this.smoothSelect = document.createElement("select");
        this.smoothSelect.setAttribute("class", "smooth");

        for (let i = 0; i < 10; i++) {
            opt = document.createElement('option');
            opt.setAttribute("class", "smooth");
            opt.value = i;
            opt.innerText = (2 * i + 1).toString();
            this.smoothSelect.appendChild(opt);
        }

        this.smoothTxt = document.createElement('span');
        this.smoothTxt.setAttribute("class", "smooth");
        this.smoothTxt.innerHTML = "\xA0\xA0 Smooth:"

        controls.appendChild(this.smoothTxt);
        controls.appendChild(this.smoothSelect);

        // hide the smoothing dropdown until we need it
        this.smoothHide();

        // define the event handler for changing the smoothing parameter
        this.smoothSelect.onchange = function () {
            let val = this.options[this.selectedIndex].value;
            plotThis.smoothVal = parseInt(val);
            console.log("selected smoothing= " + val.toString() + " for sensor " + plotThis.sensorNum.toString());
            plotThis.processPlotData();
            plotThis.plotStaticData();
            updateSystemState();
        };

        // create and place and control the csv download button
        this.aCSV = document.createElement("a");
        var csvLink = document.createElement("img");
        csvLink.src = "images/csv.png";
        csvLink.height = "18";
        csvLink.style = "cursor:pointer";
        csvLink.style.paddingLeft = "10px";
        csvLink.style.verticalAlign = "bottom";
        this.aCSV.appendChild(csvLink);
        this.aCSV.title = "Save current chart view data to .csv file";
        this.aCSV.addEventListener("click", csvClick);
        controls.appendChild(this.aCSV);


        // create and place and control the re-zero button
        this.aZero = document.createElement("a");
        var zeroLink = document.createElement("img");
        zeroLink.src = "images/rezero2.png";
        zeroLink.height = "20";
        zeroLink.style = "cursor:pointer";
        zeroLink.style.paddingLeft = "10px";
        zeroLink.style.verticalAlign = "bottom";
        this.aZero.appendChild(zeroLink);
        this.aZero.title = "Set vertical zero at selected average";
        this.aZero.addEventListener("click", zeroClick);
        controls.appendChild(this.aZero);

        // hide the re-zero button until its needed
        this.aZero.hidden = true;

        // Set up the viewport that will be used while the DAQ is running 
        this.runningDataView = new ViewPort(0, this.initialTimeSpan, this.scales[0], this.scales[1], this.baseElement);
        this.viewStack.push(this.runningDataView);

        // draw plot axes
        this.drawPlotAxes(this.viewStack[0]);

        // attach some event listeners to the top (control) layer
        this.ctlLayer = this.layerElementList[this.layerElementList.length - 1];
        let ctlDrawContext = this.ctlLayer.getContext("2d");
        this.ctlLayer.addEventListener("mousedown", mouseDown);
        this.ctlLayer.addEventListener("mouseup", mouseUp);
        this.ctlLayer.addEventListener("mousemove", mouseMove);
        this.ctlLayer.addEventListener("mouseout", mouseOut);
        this.ctlLayer.addEventListener("dblclick", dblclick);

        // create a handle to the cursor info layer
        let infoLayer = this.layerElementList[this.layerElementList.length - 3];
        let infoDrawContext = infoLayer.getContext("2d");

        // if this configuration involves the thermometer or barometer sensors then fetch their calibration constants
        if (sensorNum == 4) { // the thermomenet does not appear witout the barometer
            getBarometerThermometerCalibration();
        }

        // =================================================================================
        // IOLabPlot Constructor functions and event handlers

        // event handler for saving chart data to a csv file
        function csvClick() {

            console.log("In csvClick() saving data for sensor " + plotThis.sensorNum.toString());

            let csvdata = "t (s)";

            // the first row contains the columns labels
            for (let ind = 0; ind < plotThis.axisTitles.length; ind++) {
                csvdata += ", ";
                csvdata += plotThis.csvLabels[ind];
            }
            csvdata += "\r\n";

            // only save the visible part
            let ind1 = Math.floor(plotThis.viewStack[0].xMin / plotThis.timePerSample) - 2;
            if (ind1 < 0) ind1 = 0;
            let ind2 = Math.floor(plotThis.viewStack[0].xMax / plotThis.timePerSample) + 2;
            if (ind2 > plotThis.plotData.length) ind2 = plotThis.plotData.length;

            // loop over data
            for (let ind = ind1; ind < ind2; ind++) {

                // each line starts with the time coordinate
                let tplot = plotThis.plotData[ind][0]; // the current time coordinate
                csvdata += tplot.toString();

                // then a y coordinate for each axis
                for (let tr = 1; tr < plotThis.nTraces + 1; tr++) {
                    let yplot = plotThis.plotData[ind][tr] - plotThis.datShift[tr];
                    csvdata += ", ";
                    csvdata += yplot.toString();
                }
                csvdata += "\r\n";
            }

            // create a blob of the csv data
            let dataBlob = new Blob([csvdata]);

            // figure out filename
            let date = new Date();
            let fName = "IOLabCSV_" +
                date.toDateString().substr(4, 3) + "-" +
                date.toDateString().substr(8, 2) + "-" +
                date.toDateString().substr(11, 4) + "_" +
                date.toTimeString().substr(0, 2) + "." +
                date.toTimeString().substr(3, 2) + "." +
                date.toTimeString().substr(6, 2) + "_" +
                "sens_" + plotThis.sensorNum.toString() + ".csv";

            // save the data as a local download
            plotThis.aCSV.href = window.URL.createObjectURL(dataBlob), { type: "text/csv;charset=utf-8" };
            plotThis.aCSV.download = fName;
        }

        // event handler for the re-zero button
        function zeroClick() {
            plotThis.aZero.hidden = true;

            for (let tr = 1; tr < plotThis.nTraces + 1; tr++) {
                let st = plotThis.analObjectList[tr];
                plotThis.datShift[tr] += st.mean;
                st.calcStats(0, 0, "redo");
            }

            plotThis.processPlotData();
            plotThis.plotStaticData();
            plotThis.drawSelectionAnalysis();

            if (dbgInfo) {
                console.log("In zeroClick(): datShift");
                console.log(plotThis.datShift);
            }

        }

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
                if (plotThis.zeroable) {
                    plotThis.aZero.hidden = false;
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

    } // IOLabPlot constructor

    //===============================IOLabPlot Methods========================================

    // returns the interpolated data valuse at a specific time t and range dt
    getDataAtTime(t) {

        // interpolate to find the data values at the requested time
        let indMax = this.plotData.length - 1;
        let ind0 = Math.min(parseInt(t / this.timePerSample), indMax);
        let ind1 = ind0 + 1;
        if (ind0 == indMax) { ind1 = ind0; }
        let d0 = this.plotData[ind0];
        let d1 = this.plotData[ind1];

        let dAtTime = [t];
        for (let i = 1; i < d0.length; i++) {
            let yt = d0[i] + (t - d0[0]) * (d1[i] - d0[i]) / this.timePerSample;
            dAtTime.push(yt);
        }
        return dAtTime;
    }

    // hide the smoothing control
    smoothHide() {
        this.smoothTxt.hidden = true;
        this.smoothSelect.hidden = true;
    }

    // show the smoothing control
    smoothShow() {
        this.smoothTxt.hidden = false;
        this.smoothSelect.hidden = false;
    }

    // draw region(s) selected (or being selected)
    drawSelectionAnalysis() {
        if (plotSet.linkMode) { // if plots are linked the time is selected on all at once
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                if (plotSet.sensorCBlist[ind].checked) {
                    plotSet.plotObjectList[ind].drawSelectionAnalysisMethod();
                }
            }
        } else {
            this.drawSelectionAnalysisMethod();
        }

    }

    // dsiplay the vertical (time) cursor and the data at this location
    drawTimeAndData() {
        if (plotSet.linkMode) { // if plots are linked the info is displayed on all at once
            for (let ind = 0; ind < plotSet.plotObjectList.length; ind++) {
                if (plotSet.sensorCBlist[ind].checked) {
                    plotSet.plotObjectList[ind].drawTimeAndDataMethod();
                }
            }
        } else {
            this.drawTimeAndDataMethod();
        }
    }

    // draw the selected region as well as any analysis results for this region
    drawSelectionAnalysisMethod() {

        // if there is no data for this sensor then go home
        if (this.plotData.length == 0) return;

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
        if (indStop > this.plotData.length - 1) indStop = this.plotData.length - 1;

        // redo the start & stop times so that they correspond to actual samples
        let tStartLocal = this.plotData[indStart][0];
        let tStopLocal = this.plotData[indStop][0];

        // find the theoretical indeces for the left and right side of the viewport
        let indLeftVP = Math.round(this.viewStack[0].xMin / this.timePerSample) - 1;
        let indRightVP = Math.round(this.viewStack[0].xMax / this.timePerSample);

        // find the actual left and right indeces if the region to highlight
        // so we dont try to highlightoutside the chart and/or data boundaries
        let indLeft = Math.max(indLeftVP, indStart);
        let indRight = Math.min(indRightVP, indStop);

        // find the actual times for the left and tight edges of the highlighting
        let tLeft = this.plotData[indLeft][0];
        let tRight = this.plotData[indRight][0];

        // clear old stuff
        analysisDrawContext.clearRect(0, 0, this.baseElement.width + 2, this.baseElement.height + 2);

        // if there is no interval to draw then return
        if (tStopLocal == tStartLocal) {
            this.aZero.hidden = true;
            return;
        }

        // draw the vertical lines that delineate the selectd region
        if (tStartLocal >= this.viewStack[0].xMin && tStartLocal <= this.viewStack[0].xMax) {
            this.drawVline(analysisDrawContext, this.viewStack[0], tStartLocal, 1, '#000000');
        }
        if (tStopLocal >= this.viewStack[0].xMin && tStopLocal <= this.viewStack[0].xMax) {
            this.drawVline(analysisDrawContext, this.viewStack[0], tStopLocal, 1, '#000000');
        }

        // display the time range of the selected region
        analysisDrawContext.fillStyle = '#000000';
        analysisDrawContext.font = "12px Arial";
        let text = "∆t = " + Math.abs(tStopLocal - tStartLocal).toFixed(3) + "s";
        analysisDrawContext.fillText(text, 200, 15);

        // find the starting and ending pixels on the x axis
        let zeroLeft = this.viewStack[0].dataToPixel(tLeft, 0);
        let zeroRight = this.viewStack[0].dataToPixel(tRight, 0);

        // highlight the selected region for each visible trace
        let traceVoffset = 15;
        for (let tr = 1; tr < this.nTraces + 1; tr++) {
            if (this.traceEnabledList[tr - 1]) {

                // calculate statistics
                let st = this.analObjectList[tr];
                st.calcStats(indStart, indStop);

                // put data analysis results on the plot for each selected trace
                analysisDrawContext.fillStyle = this.layerColorList[tr];
                let text = "n=" + st.n.toFixed(0) + " μ=" + st.mean.toFixed(4) + "±" + st.stderr.toFixed(4) + " σ=" + st.sigma.toFixed(4) +
                    " a=" + st.area.toFixed(2) + " m=" + st.slope.toFixed(2) + " b=" + st.intercept.toFixed(2) +
                    " r=" + st.rxy.toFixed(3);
                traceVoffset += 12;
                analysisDrawContext.fillText(text, 200, traceVoffset);

                // fill the area of the selected region (i.e. display the area)
                if (indRight > indLeft) {
                    analysisDrawContext.beginPath();
                    analysisDrawContext.moveTo(zeroLeft[0], zeroLeft[1]);

                    // pick the number to advance the index by for each point plotted so that we dont waste time plotting 
                    // several points for a single pixel column on the chart
                    let nSkip = Math.max(1, parseInt((indRight - indLeft) / cWidth / 2));

                    //for (let ind = indLeft; ind <= indRight; ind++) {
                    for (let ind = indLeft; ind <= indRight; ind += nSkip) {
                        let t = this.plotData[ind][0];
                        let y = this.plotData[ind][tr] - this.datShift[tr];
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
            console.log("In drawTimeAndDataMethod(): sensor " + this.sensorNum.toString() + " timePerSample in not set - Mats screwed up");
            return;
        }

        // find the data index that corresponds to the selected time
        let ind = Math.round(commonCursorTime / this.timePerSample);

        // if we are past the first data-point then use the first one
        if (ind < 0) {
            ind = 0;
        }

        // if we are past the last data-point then use the last one
        if (ind >= this.plotData.length) {
            ind = this.plotData.length - 1;
        }        

        // find the time of the current index (i.e. the actual sample time)
        let plotCursorTime = this.plotData[ind][0];

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

                let currentCursorData = this.plotData[ind][tr] - this.datShift[tr];//calData[this.sensorNum][ind][tr];
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

    // clean up the DOM
    reset() {
        while (this.parentElement.childNodes.length > 0) {
            this.parentElement.childNodes[0].remove();
        }
    }

    // reprocesses calData and copies results into this.plotData
    processPlotData() {

        // get the original time of the last acquired data
        let datLength = calData[this.sensorNum].length;

        if (datLength > 10) { // do only if we have some data for this semsor
            let tLast0 = calData[this.sensorNum][datLength - 1][0];

            // figure out actual time per sample (divide by 1000 since totalRunTime is in ms)
            this.timePerSample = totalRunTime / datLength / 1000;

            // fix all of the time measurements based on actual elapsed time
            let sampleTime = 0;
            this.plotData = [];
            for (let ind = 0; ind < datLength; ind++) {
                calData[this.sensorNum][ind][0] = sampleTime;
                sampleTime += this.timePerSample;

                // the .slice nonsense is required to copy the array by value
                let dat = calData[this.sensorNum][ind].slice();
                this.plotData[ind] = dat;

                for (let tr = 1; tr < this.nTraces + 1; tr++) {
                    this.plotData[ind][tr] = this.smoothe(datLength, this.sensorNum, tr, ind, this.smoothVal);
                }
            }

            // debugging
            if (dbgInfo) {
                let tLast1 = calData[this.sensorNum][datLength - 1][0];
                console.log("In processPlotData() sensor:" + this.sensorNum +
                    " timePerSample:" + this.timePerSample.toFixed(6) +
                    " tLast0:" + tLast0.toFixed(4) +
                    " tLast1:" + tLast1.toFixed(4) +
                    " length:" + datLength.toFixed(0));
            }
        }
    }

    // returns average value for sensor/trace for index +/- nside.
    smoothe(datlength, sensor, trace, index, nside) {

        if (datlength == 0) { return 0; }
        if (nside == 0) { return calData[sensor][index][trace]; }

        // set up counters
        let Sy = 0;
        let n = 0;

        let indFirst = Math.max(0, index - nside);
        let indLast = Math.min(datlength, index + nside);

        for (let ind = indFirst; ind < indLast; ind++) {
            Sy += calData[sensor][ind][trace];
            n += 1;
        }
        return Sy / n;
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
        let datLength = this.plotData.length;

        if (datLength < 1) {
            if (dbgInfo) console.log("In displayStaticData(): no data to display for sensor " + this.sensorNum.toString());

        } else {
            let tLastFloat = this.plotData[datLength - 1][0];
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
        if (ind2 > this.plotData.length) ind2 = this.plotData.length;

        // pick the number to advance the index by for each point plotted so that we dont waste time plotting 
        // several points for a single pixel column on the chart
        let nSkip = Math.max(1, parseInt((ind2 - ind1) / cWidth / 2));

        // loop over data
        //for (let ind = ind1; ind < ind2; ind++) {
        for (let ind = ind1; ind < ind2; ind += nSkip) {

            let tplot = this.plotData[ind][0]; // the current time coordinate

            // find the first dataploint at the leftmost edge of the viewport 
            // and start the line these
            if (first) {
                first = false;
                for (let tr = 1; tr < this.nTraces + 1; tr++) {
                    contextList[tr].clearRect(0, 0, cWidth, cHeight);
                    pix = this.viewStack[0].dataToPixel(tplot, this.plotData[ind][tr] - this.datShift[tr]);
                    contextList[tr].beginPath();
                    contextList[tr].moveTo(pix[0], pix[1]);
                }

            } else { // once we have the first point start drawing the rest
                for (let tr = 1; tr < this.nTraces + 1; tr++) {
                    pix = this.viewStack[0].dataToPixel(tplot, this.plotData[ind][tr] - this.datShift[tr]);
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

                    let xd = calData[sensorID][calReadPtr[sensorID]][tr] - this.datShift[tr];
                    pix = this.viewStack[0].dataToPixel(td, xd);

                } else { // if this is not the first call start with the last datapoint we plotted

                    let tstart = this.datLast[0];
                    pix = this.viewStack[0].dataToPixel(tstart, this.datLast[tr] - this.datShift[tr]);
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
                        pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr] - this.datShift[tr]);
                        contextList[tr].beginPath();
                        contextList[tr].moveTo(pix[0], pix[1]);

                    } else {
                        pix = this.viewStack[0].dataToPixel(tplot, calData[sensorID][ind][tr] - this.datShift[tr]);
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

};

