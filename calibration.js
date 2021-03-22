// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// calibration constant variables
var calAccelConst = [[], []];
var calAccelTime = 0;

var calMagConst = [[], []];
var calMagTime = 0;

var calGyroConst = [[], []];
var calGyroTime = 0;

var calForceConst = [[], []];
var calForceTime = 0;

// calibration constant defaults (better than notning): 
var calAccelConstDefault = [-190, 833, -93, 830, 0, 832];
var calMagConstDefault = [-1382, 9.0, 1180, 9.9, 1019, 9.1];
var calGyroConstDefault = [0, 807, 20, 833, 13, 825];
var calForceConstDefault = [2147, -58.2];

// holds local values of g and Bvert
var local_g = 9.81; //m/s/s
var local_Bvert = -48.5; // uT (Urbana IL)
var weight_IOLab = 1.98 // N

// this holds the calibration constants fetched from browser cookies
var calArrayList = null;

// if we havent fetched the calibrations yet
var notFetchedCal = [true, true];

// cal processing stuff
var aCal, aForce, aAmg;
var amgImage, fImage, calImage;
var calAMGstats, calFstats;

var calMode = false;
var calStep = 0;


// calibration setup (evolving)
function calibrationSetup() {

    let d = new Date();

    // remove any existing text or images
    while (calchooseAMG.childNodes.length > 0) { calchooseAMG.childNodes[0].remove(); }
    while (calchooseF.childNodes.length > 0) { calchooseF.childNodes[0].remove(); }
    while (calchooseAMGtxt.childNodes.length > 0) { calchooseAMGtxt.childNodes[0].remove(); }
    while (calchooseFtxt.childNodes.length > 0) { calchooseFtxt.childNodes[0].remove(); }

    // display the image that the user clicks on to start AMG calibration
    aAmg = document.createElement("a");
    amgImage = document.createElement("img");
    amgImage.style = "cursor:pointer";
    amgImage.style.paddingRight = "5px";
    aAmg.appendChild(amgImage);
    aAmg.title = "Accel Mag Gyro Calibration";
    aAmg.addEventListener("click", calAMGclick);
    calchooseAMG.appendChild(aAmg)

    // the text that goes under the AMG selection image
    let amgTxt = "";
    if (calMagTime > 0) {
        d.setTime(calMagTime);
        amgTxt = document.createTextNode("Done " + d.toLocaleString());
        amgImage.src = "images/amg0.png";
    } else {
        amgTxt = document.createTextNode("Not yet calibrated");
        amgImage.src = "images/amg1.png";
    }

    calchooseAMGtxt.appendChild(amgTxt);

    // display the image that the user clicks on to start Force calibration
    aForce = document.createElement("a");
    fImage = document.createElement("img");
    fImage.style = "cursor:pointer";
    fImage.style.paddingRight = "5px";
    aForce.appendChild(fImage);
    aForce.title = "Force Calibration";
    aForce.addEventListener("click", calFclick);
    calchooseF.appendChild(aForce);

    // the text that goes under the Force selection image
    let fTxt = "";
    if (calForceTime > 0) {
        d.setTime(calForceTime);
        fTxt = document.createTextNode("Done " + d.toLocaleString());
        fImage.src = "images/force0.png";
    } else {
        fTxt = document.createTextNode("Not yet calibrated");
        fImage.src = "images/force1.png";
    }
    calchooseFtxt.appendChild(fTxt);
}

function calAMGclick() {
    console.log("calAMGclick");

    configCalDAQ();
    calMode = true;

    // set up the calibration controls
    calAMGstats = [];
    calStep = 0;

    aCal = document.createElement("a");
    calImage = document.createElement("img");
    calImage.src = amgCalStepList[calStep].image;
    calImage.style = "cursor:pointer";
    calImage.style.paddingRight = "5px";
    aCal.appendChild(calImage);
    aCal.title = "Calibrating Accelerometer, Magnetometer, and Gyroscope";
    aCal.addEventListener("click", amgCalClick);
    calDiv.appendChild(aCal);
    calText.innerHTML = amgCalStepList[calStep].text;

}

function calFclick() {
    console.log("In calFclick()");

    configCalDAQ();
    calMode = true;

    // set up the calibration controls
    calFstats = [];
    calStep = 0;

    aCal = document.createElement("a");
    calImage = document.createElement("img");
    calImage.src = fCalStepList[calStep].image;
    calImage.style = "cursor:pointer";
    calImage.style.paddingRight = "5px";
    aCal.appendChild(calImage);
    aCal.title = "Calibrating Force probe";
    aCal.addEventListener("click", fCalClick);
    calDiv.appendChild(aCal);
    calText.innerHTML = fCalStepList[calStep].text;

}

function endCal() {

    modal.style.display = "none";
    
    if (calMode) {
        calMode = false;
        
        while (calDiv.childNodes.length > 0) { calDiv.childNodes[0].remove(); }
        calText.innerHTML = "";
        configPicker.selectedIndex = 0;
        current_config = configPicker.options[configPicker.selectedIndex].value;
        current_config_code = -1;
        daqConfigured = false;

        // remove any existing plots that resulted from the calibration
        // (wait a little bit first since this will fail if the end-run stuff isnt finished)
        console.log("Reset after cal")
        setTimeout(async function () {
            if (plotSet != null) {
                plotSet.reset();
                plotSet = null;
                resetAcquisition();
            }
        }, 100);
        updateSystemState();
    }

}

function fCalClick() {
    console.log("In fCalClick()");

    calImage.src = "images/wait.png";
    calText.innerHTML = "Please wait while we record some data...";

    if (calStep < fCalStepList.length) {

        aCal.removeEventListener("click", fCalClick);
        resetAcquisition();
        runForSeconds(2500);

        setTimeout(async function () {
            var fStat = calMeanSigmaN(8, 1);
            calFstats.push(fStat);

            calStep++;
            if (calStep < fCalStepList.length) {
                calImage.src = fCalStepList[calStep].image;
                calText.innerHTML = fCalStepList[calStep].text;
                aCal.addEventListener("click", fCalClick);
            } else {
                calForceConst[0] = [calFstats[0][0], (calFstats[1][0] - calFstats[0][0]) / -weight_IOLab];
                console.log("New Force calibration constants:")
                console.log(calForceConst[0]);
                calForceTime = setCalCookie(remote1ID, 8, calForceConst[0]);
                endCal();
            }
        }, 2600);
    }
}

function amgCalClick() {
    console.log("In amgCalClick()");

    calImage.src = "images/wait.png";
    calText.innerHTML = "Please wait while we record some data...";

    if (calStep < amgCalStepList.length) {

        aCal.removeEventListener("click", amgCalClick);
        resetAcquisition();
        runForSeconds(2500);

        setTimeout(async function () {
            let staceStep = [1, 1, 2, 2, 3, 3];
            var aStat = calMeanSigmaN(1, staceStep[calStep]);
            var mStat = calMeanSigmaN(2, staceStep[calStep]);
            var gStat = calMeanSigmaN(3, staceStep[calStep]);
            calAMGstats.push([aStat, mStat, gStat]);

            calStep++;
            if (calStep < amgCalStepList.length) {
                calImage.src = amgCalStepList[calStep].image;
                calText.innerHTML = amgCalStepList[calStep].text;
                aCal.addEventListener("click", amgCalClick);
            } else {
                calcAMGconstants();
                endCal();
            }
        }, 2600);
    }
}

function calcAMGconstants() {

    // calculate accelerometer constants.
    // Averages determine offsets and local value of g determines scales
    let axOffset = (calAMGstats[0][0][0] + calAMGstats[1][0][0]) / 2;
    let ayOffset = (calAMGstats[2][0][0] + calAMGstats[3][0][0]) / 2;
    let azOffset = (calAMGstats[4][0][0] + calAMGstats[5][0][0]) / 2;

    let axScale = (calAMGstats[0][0][0] - calAMGstats[1][0][0]) / 2 / local_g;
    let ayScale = (calAMGstats[2][0][0] - calAMGstats[3][0][0]) / 2 / local_g;
    let azScale = (calAMGstats[4][0][0] - calAMGstats[5][0][0]) / 2 / local_g;

    // calculate magnetometer constants.
    // Averages determine offsets and local value of B(vertical) determines scales
    let mxOffset = (calAMGstats[0][1][0] + calAMGstats[1][1][0]) / 2;
    let myOffset = (calAMGstats[2][1][0] + calAMGstats[3][1][0]) / 2;
    let mzOffset = (calAMGstats[4][1][0] + calAMGstats[5][1][0]) / 2;

    let mxScale = (calAMGstats[0][1][0] - calAMGstats[1][1][0]) / 2 / local_Bvert;
    let myScale = (calAMGstats[2][1][0] - calAMGstats[3][1][0]) / 2 / local_Bvert;
    let mzScale = (calAMGstats[4][1][0] - calAMGstats[5][1][0]) / 2 / local_Bvert;

    // calculate gyroscope constants.
    // average values to determine offsets
    // scales are default values
    let gxOffset = (calAMGstats[0][2][0] + calAMGstats[1][2][0]) / 2;
    let gyOffset = (calAMGstats[2][2][0] + calAMGstats[3][2][0]) / 2;
    let gzOffset = (calAMGstats[4][2][0] + calAMGstats[5][2][0]) / 2;

    let gxScale = 807;
    let gyScale = 833;
    let gzScale = 825;

    // save these values in calibration arrays
    calAccelConst[0] = [axOffset, axScale, ayOffset, ayScale, azOffset, azScale];
    calMagConst[0] = [mxOffset, mxScale, myOffset, myScale, mzOffset, mzScale];
    calGyroConst[0] = [gxOffset, gxScale, gyOffset, gyScale, gzOffset, gzScale];
    console.log("New AMG calibration constants:")
    console.log(calAccelConst[0]);
    console.log(calMagConst[0]);
    console.log(calGyroConst[0]);

    calAccelTime = setCalCookie(remote1ID, 1, calAccelConst[0]);
    calMagTime = setCalCookie(remote1ID, 2, calMagConst[0]);
    calGyroTime = setCalCookie(remote1ID, 3, calGyroConst[0]);

}

// set up the DAQ system for a calibration
async function configCalDAQ() {
    console.log("in configCalDAQ():");

    // set current command to be "setFixedConfig" (dropdown index 3)
    cmdPicker.selectedIndex = 3;
    current_cmd = cmdPicker.options[cmdPicker.selectedIndex].value;

    // set "kitchen sink" configuration for calibration (dropdown index 17)
    configPicker.selectedIndex = 17;
    current_config = configPicker.options[configPicker.selectedIndex].value;
    current_config_code = iolabConfig.fixedConfigurations[configPicker.selectedIndex - 1]["code"];
    configPicker.title = fixedConfigList[current_config_code].longDesc2;

    let byteArray = getCommandRecord(current_cmd);
    console.log(byteArray);
    await sendRecord(byteArray);

    setTimeout(async function () {
        byteArray = getCommandRecord("getPacketConfig");
        console.log(byteArray);
        await sendRecord(byteArray);
    }, 100);

    // remove any existing plots
    if (plotSet != null) {
        plotSet.reset();
        plotSet = null;
        resetAcquisition();
    }

    // get the current fixed configuration object
    let fixedConfigObject = fixedConfigList[current_config_code];
    currentFCobject = fixedConfigObject;

    // create a list of sensors to be used by the data processing code and keep track of sample rates
    sensorIDlist = fixedConfigObject.sensList;
    sensorRateList = fixedConfigObject.rateList;

    // create a list of charts (by sensor ID) to be plotted
    chartIDlist = fixedConfigObject.chartList;

    // create the required plot objects
    plotSet = new PlotSet(chartIDlist, "plotContainer", "controlContainer");

}

// returns mean, sigma, and N calibration use.
function calMeanSigmaN(sensor, trace) {

    // sensor is the sensor number (1, 2, 3, 8 for acc, mag, gyro, force)
    // trace is the axis (1,2,3 = x, y, z axes for acc, mag, gyro and 1 = y-axis for force)

    // set up counters
    let Sy = 0;
    let Syy = 0;
    let n = 0;

    // use all of the data except the first 10 points in case things were still settling
    let indFirst = 10;
    let indLast = adcData[sensor].length;

    for (let ind = indFirst; ind < indLast; ind++) {
        let y = adcData[sensor][ind][trace];
        Sy += y;
        Syy += y * y;
        n += 1;
    }
    if (n < 100) { // we should be accumulating data for at least 2 seconds at 100 Hz
        console.log("N = " + n.toString() + " when calibrationng sensor " + sensor.toString() + " trace " + trace.toString());
        return [0, 0, 0];
    }

    let aveY = Sy / n;
    let aveYY = Syy / n;
    let sigY = Math.pow((aveYY - aveY * aveY), 0.5);

    return [aveY, sigY, n];

}

// see if any of the calibration values found in cookies can be used for the current remotes.
function setCalValues(remoteNumber, remoteID) {  // remoteNumber = 0,1 and remoteID is 24 bit ID

    // make sure remoteNumber is valid
    if (remoteNumber < 0 || remoteNumber > 1) {
        console.log("In setCalValues(): Bad remote ", remoteNumber);
        return;
    }

    // start by setting valuse to the crappy defalut in case we can find anytnign better
    console.log("In setCalValues(): Setting default calibration values for remote ", remoteNumber);
    calAccelConst[remoteNumber] = calAccelConstDefault;
    calMagConst[remoteNumber] = calMagConstDefault;
    calGyroConst[remoteNumber] = calGyroConstDefault;
    calForceConst[remoteNumber] = calForceConstDefault;

    // first see if we found any calibration cookies - if not return
    if (calArrayList.length == 0) {
        console.log("In setCalValues(): No cookie calibration values found");
        return;
    }

    // loop over calArrayList (read from cookies) and see if any of the entries match the current remote(s)
    for (let ind = 0; ind < calArrayList.length; ind++) {

        let entry = calArrayList[ind];
        if (entry[1] == remoteID) {

            if (entry[2] == 1) { // accelerometer
                for (let i = 0; i < 6; i++) { calAccelConst[remoteNumber][i] = entry[i + 4]; }
                console.log("accelerometer calibrations set for remote " +
                    remoteNumber.toString() + " remoteID " + remoteID.toString(), calAccelConst);
                calAccelTime = entry[0];
            }

            if (entry[2] == 2) { // magnetometer
                for (let i = 0; i < 6; i++) { calMagConst[remoteNumber][i] = entry[i + 4]; }
                console.log("magnetometer calibrations set for remote " +
                    remoteNumber.toString() + " remoteID " + remoteID.toString(), calMagConst);
                calMagTime = entry[0];
            }

            if (entry[2] == 3) { // gyroscope
                for (let i = 0; i < 6; i++) { calGyroConst[remoteNumber][i] = entry[i + 4]; }
                console.log("gyroscope calibrations set for remote " +
                    remoteNumber.toString() + " remoteID " + remoteID.toString(), calGyroConst);
                calGyroTime = entry[0];
            }

            if (entry[2] == 8) { // force
                for (let i = 0; i < 2; i++) { calForceConst[remoteNumber][i] = entry[i + 4]; }
                console.log("force probe calibrations set for remote " +
                    remoteNumber.toString() + " remoteID " + remoteID.toString(), calForceConst);
                calForceTime = entry[0];
            }
        }
    }

}


// this creates a cookie on the client browser to hold the calibration values in "calArray" for 
// sensor "sensorNum" on remote having "remoteID"
function setCalCookie(remoteID, sensorNum, calArray) {

    let expireHours = 4380; // expires in 6 months

    // the time now
    let d = new Date();
    console.log("setCalCookie() called:" + d.toGMTString());

    // figure out the expiration time
    let now = d.getTime();
    d.setTime(now + expireHours * 60 * 60 * 1000);
    let expirationTime = d.toGMTString();


    // assemble the values to save in the cookie
    // [timestamp, sensorID, sensorNumber, offset1, scale1, offset2, scale2,...]
    let values = "[" + now.toString() + "," + remoteID.toString() + "," + sensorNum.toString() + "," + calArray.length.toString()
    for (let ind = 0; ind < calArray.length; ind++) {
        values += "," + calArray[ind].toString();
    }
    values += "]";

    // construct the cookie contents in the form "name=value; expires=expirationTime; path"
    let cookieText = "iolabcal_" + sensorNum.toString() + "_" + remoteID.toString() + "=" + values + ";" + "expires=" + expirationTime + ";path=/";
    console.log("setCalCookie(): " + cookieText);

    // create the cookie
    document.cookie = cookieText;

    return now;
}

// this fetches any calibration data that has been stored in cookies by the client browser
function getCalCookies() {

    let cookieList = decodeURIComponent(document.cookie).split(';');

    for (let ind = 0; ind < cookieList.length; ind++) {
        let c = cookieList[ind];

        if (c.indexOf("iolabcal_") > -1) {
            let i1 = c.indexOf("[");
            let i2 = c.indexOf("]") + 1;
            let str = c.substring(i1, i2);
            let a = JSON.parse(str);
            // consistency check
            if (a[3] == a.length - 4) {
                calArrayList.push(a);
                console.log("found ", a);
            } else {
                console.log("Inconsistent calibration cookie: " + a);
            }
        }
    }
}

// fetch the barometer and thermometer calibration constants from the current remote 1
async function getBarometerThermometerCalibration() {


    // when fetching the barometer and thermometer calibration constants we need to wait for 
    // any previous commands to finish (hence the initial delay), and then for some reason we need
    // to request the second set of calibrations three times since sometimes the first one is 
    // returned several times (this seems to be a firmware feature - the old code does the same thing) 
    let delay = 200;
    let delayIncrement = 100;

    // get barometer calibration constants
    console.log("Requesting barometer calibration constants");
    let byteArray1 = getCommandRecord("getBarometerCalibration");
    setTimeout(async function () {
        console.log(byteArray1);
        await sendRecord(byteArray1);
    }, delay);
    delay += delayIncrement;

    // get thermometer calibration constants
    console.log("Requesting thermometer calibration constants");
    let byteArray2 = getCommandRecord("getThermometerCalibration");
    for (let n = 0; n < 3; n++) {
        setTimeout(async function () {
            console.log(byteArray2);
            await sendRecord(byteArray2);
        }, delay);
        delay += delayIncrement;
    }

}


//===============================================================
// turns the bytes read from the calibration registers into 
// floating point numbers used for calculating the pressure
function calcBarometerConstants() {
    console.log("Calculating barometer calibration constants");

    // get the signs of the coefficients
    let a0 = tc2int(rawBarometerA0);
    let signA0 = Math.sign(a0);
    let absA0 = Math.abs(a0);

    let b1 = tc2int(rawBarometerB1);
    let signB1 = Math.sign(b1);
    let absB1 = Math.abs(b1);

    let b2 = tc2int(rawBarometerB2);
    let signB2 = Math.sign(b2);
    let absB2 = Math.abs(b2);

    let c12 = tc2int(rawBarometerC12);
    let signC12 = Math.sign(c12);
    let absC12 = Math.abs(c12) >> 2;

    // decode the integer and fractional parts and put it all together
    let integerA0 = (absA0 >> 3);
    let numeratorA0 = (absA0 & 0x7);
    let denominatorA0 = Math.pow(2, 3);
    calA0 = signA0 * (integerA0 + numeratorA0 / denominatorA0);

    let integerB1 = (absB1 >> 13);
    let numeratorB1 = (absB1 & 0x1FFF);
    let denominatorB1 = Math.pow(2, 13);
    calB1 = signB1 * (integerB1 + numeratorB1 / denominatorB1);

    let integerB2 = (absB2 >> 14);
    let numeratorB2 = (absB2 & 0x3FFF);
    let denominatorB2 = Math.pow(2, 14);
    calB2 = signB2 * (integerB2 + numeratorB2 / denominatorB2);

    let numeratorC12 = (absC12 & 0x1FFF);
    let denominatorC12 = Math.pow(2, 22);
    calC12 = signC12 * numeratorC12 / denominatorC12;

    console.log("Barometer A0 B1 B2 C12", calA0, calB1, calB2, calC12);
}

// calculate absolute pressure in kPa using the calibration constants exctracted above
function calBaromData(pDat, tDat) {
    // the first time through calculate calibrations constants
    if (!baromConstCalculated) {
        calcBarometerConstants();
        baromConstCalculated = true;
    }

    let pComp = calA0 + (calB1 + calC12 * tDat) * pDat + calB2 * tDat;
    let p = 50 + pComp * (115 - 50) / 1023;

    return p;

}

// calibration functions 
// assume remote r=0 for now
function calAccelXYZ(x, y, z, r = 0) {
    let cx = (x - calAccelConst[r][0]) / calAccelConst[r][1];
    let cy = (y - calAccelConst[r][2]) / calAccelConst[r][3];
    let cz = (z - calAccelConst[r][4]) / calAccelConst[r][5];
    return ([cx, cy, cz]);
}

function calMagXYZ(x, y, z, r = 0) {
    let cx = (x - calMagConst[r][0]) / calMagConst[r][1];
    let cy = (y - calMagConst[r][2]) / calMagConst[r][3];
    let cz = (z - calMagConst[r][4]) / calMagConst[r][5];
    return ([cx, cy, cz]);
}

function calGyroXYZ(x, y, z, r = 0) {
    let cx = (x - calGyroConst[r][0]) / calGyroConst[r][1];
    let cy = (y - calGyroConst[r][2]) / calGyroConst[r][3];
    let cz = (z - calGyroConst[r][4]) / calGyroConst[r][5];
    return ([cx, cy, cz]);
}

function calForceY(y, r = 0) {
    let cy = (y - calForceConst[r][0]) / calForceConst[r][1];
    return (cy);
}