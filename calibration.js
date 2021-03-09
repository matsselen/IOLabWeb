// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

// calibration constant defaults (better than notning): [remote][values]
var calAccelConst = [[],[]]; 
var calMagConst = [[],[]]; 
var calGyroConst = [[],[]];
var calForceConst = [[],[]]; 

var calAccelConstDefault = [-190, 833, -93, 830, 0, 832]; 
var calMagConstDefault = [-1382, 9.0, 1180, 9.9, 1019, 9.1]; 
var calGyroConstDefault = [-2, 940, -14, 940, -14, 940]; 
var calForceConstDefault = [2147, -58.2]; 

// this holds the calibration constants fetched from browser cookies
var calArrayList = null;

// if we havent fetched the calibrations yet
var notFetchedCal = [true, true];

// see if any of the calibration values found in cookies can be used for the current remotes.
function setCalValues(remoteNumber, remoteID) {  // remoteNumber = 0,1 and remoteID is 24 bit ID

    // make sure remoteNumber is valid
    if (remoteNumber < 0 || remoteNumber > 1) {
        console.log("In setCalValues(): Bad remote ",remoteNumber);
        return;      
    }

    // start by setting valuse to the crappy defalut in case we can find anytnign better
    console.log("In setCalValues(): Setting default calibration values for remote ",remoteNumber);
    calAccelConst[remoteNumber] = calAccelConstDefault;
    calMagConst[remoteNumber]   = calMagConstDefault;
    calGyroConst[remoteNumber]  = calGyroConstDefault;
    calForceConst[remoteNumber] = calForceConstDefault;

    // first see if we found any calibration cookies - if not return
    if (calArrayList.length == 0) {
        console.log("In setCalValues(): No cookie calibration values found");
        return;
    }

    // loop over calArrayList and see if any of the entries match the current remote(s)
    for (let ind = 0; ind < calArrayList.length; ind ++) {

        let entry = calArrayList[ind];
        if (entry[1] == remoteID) {
            
            if (entry[2] == 1) { // accelerometer
                for (let i = 0; i < 6; i++) { calAccelConst[remoteNumber][i] = entry[i+4]; }
                console.log("accelerometer calibrations set for remote " + 
                remoteNumber.toString() + " remoteID " + remoteID.toString(), calAccelConst);
            }

            if (entry[2] == 2) { // magnetometer
                for (let i = 0; i < 6; i++) { calMagConst[remoteNumber][i] = entry[i+4]; }
                console.log("magnetometer calibrations set for remote " + 
                remoteNumber.toString() + " remoteID " + remoteID.toString(), calMagConst);
            }

            if (entry[2] == 3) { // gyroscope
                for (let i = 0; i < 6; i++) { calGyroConst[remoteNumber][i] = entry[i+4]; }
                console.log("gyroscope calibrations set for remote " + 
                remoteNumber.toString() + " remoteID " + remoteID.toString(), calGyroConst);
            }

            if (entry[2] == 8) { // force
                for (let i = 0; i < 2; i++) { calForceConst[remoteNumber][i] = entry[i+4]; }
                console.log("force probe calibrations set for remote " + 
                remoteNumber.toString() + " remoteID " + remoteID.toString(), calForceConst);
            }
        }
    }

}

function setCalCookieTest () {
    setCalCookie(remote1ID, 1, [-190, 833, -93, 830, 0, 832] );
    setCalCookie(remote1ID, 2, [-1382, 9.0, 1180, 9.9, 1019, 9.1] );
    setCalCookie(remote1ID, 3, [-2, 940, -14, 940, -14, 940] );
    setCalCookie(remote1ID, 8, [2147, -58.2] );   
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
    let cookieText = "iolabcal_"+ sensorNum.toString()+"_" + remoteID.toString() + "=" + values + ";" + "expires=" + expirationTime + ";path=/";
    console.log("setCalCookie(): " + cookieText);

    // create the cookie
    document.cookie = cookieText;
}

// this fetches any calibration data that has been stored in cookies by the client browser
function getCalCookies() {

    let cookieList = decodeURIComponent(document.cookie).split(';');
    
    for (let ind = 0; ind < cookieList.length; ind++) {
        let c = cookieList[ind];

        if (c.indexOf("iolabcal_") > -1) {
            let i1 = c.indexOf("[");
            let i2 = c.indexOf("]")+1;
            let str = c.substring(i1,i2);
            let a = JSON.parse(str);
            // consistency check
            if (a[3] == a.length - 4) {
                calArrayList.push(a);
                console.log("found ",a);
            } else {
                console.log("Inconsistent calibration cookie: "+a);
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
function calAccelXYZ(x,y,z,r=0) {
    let cx = (x-calAccelConst[r][0])/calAccelConst[r][1];
    let cy = (y-calAccelConst[r][2])/calAccelConst[r][3];
    let cz = (z-calAccelConst[r][4])/calAccelConst[r][5];
    return ([cx, cy, cz]);
}

function calMagXYZ(x,y,z,r=0) {
    let cx = (x-calMagConst[r][0])/calMagConst[r][1];
    let cy = (y-calMagConst[r][2])/calMagConst[r][3];
    let cz = (z-calMagConst[r][4])/calMagConst[r][5];
    return ([cx, cy, cz]);
}

function calGyroXYZ(x,y,z,r=0) {
    let cx = (x-calGyroConst[r][0])/calGyroConst[r][1];
    let cy = (y-calGyroConst[r][2])/calGyroConst[r][3];
    let cz = (z-calGyroConst[r][4])/calGyroConst[r][5];
    return ([cx, cy, cz]);
}

function calForceY(y,r=0) {
    let cy= (y-calForceConst[r][0])/calForceConst[r][1];
    return (cy);
}