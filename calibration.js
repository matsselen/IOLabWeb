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
