// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';


var calAccelConst = [[-111.82, 833.41, -66.75, 829.33, -8.61, 832.22], [0, 830, 0, 830, 0, 830]]; // [remote][values]
var calMagConst = [[-1367.16, 9.625, 1159.81, 1159.81, 1000.43, 9.6], [0, 10, 0, 10, 0, 10]]; // [remote][values]
var calGyroConst = [[-1.38, 815, 12.39, 815, 10.68, 815], [0, 815, 0, 815, 0, 815]]; // [remote][values]
var calForceConst = [[101.98, -59.74], [0, -60]]; // [remote][values]

// var calAccelConst = [[],[]];
// var calMagConst = [[],[]];
// var calGyroConst = [[],[]];
// var calForceConst = [[],[]];

function setCalCookieTest () {
    setCalCookie(remote1ID, 1, calAccelConst[0] );
    setCalCookie(remote1ID, 2, calMagConst[0] );
    setCalCookie(remote1ID, 3, calGyroConst[0] );
    setCalCookie(remote1ID, 8, calForceConst[0] );
}

function setCalCookie(remoteID, sensorNum, calArray) {

    let expireHours = 1; //how many hours in the future this cookie expires

    // the time now
    let d = new Date();
    console.log("setCalCookie() called:" + d.toGMTString());

    // figure out the expiration time
    let now = d.getTime();
    d.setTime(now + expireHours * 60 * 60 * 1000);
    let expirationTime = d.toGMTString();


    // assemble the values to save in the cookie
    // [timestamp, sensorID, sensorNumber, offset1, scale1, offset2, scale2,...]
    let values = "[" + now.toString() + "," + remoteID.toString() + "," + sensorNum.toString()
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

function getCalCookies(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "cookie " + cname + " not found";
}

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

// caluclate absolute pressure in kPa
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


