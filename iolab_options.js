// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

//===================================================================

function openOptModal() {
  local_Bvert = iolabOptions.byLocal;
  bzLocal.value = local_Bvert;
}

function initializeOptions() {
  getOptionCookies();
  dispDac.checked = iolabOptions.showDac;
  dispBzz.checked = iolabOptions.showBzz;
  dispD4.checked = iolabOptions.showD4;
  dispD5.checked = iolabOptions.showD5;
  dispD6.checked = iolabOptions.showD6;
  dispD6.byLocal = iolabOptions.byLocal;
  
}

function endOpt() {
  optModal.style.display = "none";
  iolabOptions.showDac = dispDac.checked;
  iolabOptions.showBzz = dispBzz.checked;
  iolabOptions.showD4 = dispD4.checked;
  iolabOptions.showD5 = dispD5.checked;
  iolabOptions.showD6 = dispD6.checked;
  iolabOptions.toIndex = timeoutPicker.selectedIndex;
  iolabOptions.byLocal = parseFloat(bzLocal.value);
  local_Bvert = iolabOptions.byLocal;
  setOptionCookie();

}

function selectOutput() {
  dacCtl.hidden = !dispDac.checked;
  bzzCtl.hidden = !dispBzz.checked;
  d4Ctl.hidden = !dispD4.checked;
  d5Ctl.hidden = !dispD5.checked;
  d6Ctl.hidden = !dispD6.checked;
}

// placeholder option values
var iolabOptions = {
  "time": 0,
  "showDac": true,
  "showBzz": true,
  "showD4": false,
  "showD5": false,
  "showD6": true,
  "toIndex": 1,
  "byLocal": -48.5
}

// this creates a cookie on the client browser to hold the calibration values in "calArray" for 
// sensor "sensorNum" on remote having "remoteID"
function setOptionCookie() {

  let expireHours = 17520; // expires in 2 years

  // the time now
  let d = new Date();
  console.log("setOptionCookie() called:" + d.toGMTString());

  // figure out the expiration time
  let now = d.getTime();
  d.setTime(now + expireHours * 60 * 60 * 1000);
  let expirationTime = d.toGMTString();

  // put the current time into the data being saved
  iolabOptions.time = now;

  // assemble the values to save in the cookie
  // [timestamp, sensorID, options]
  let values = "[" + JSON.stringify(iolabOptions) + "]";

  // construct the cookie contents in the form "name=value; expires=expirationTime; path"
  let cookieText = "iolab_options =" + values + ";" + "expires=" + expirationTime + ";path=/";
  console.log("setOptionCookie(): " + cookieText);

  // create the cookie
  document.cookie = cookieText;

  return now;
}

// this fetches any option configuration data that has been stored in cookies by the client browser
function getOptionCookies() {

  console.log("In getOptionCookies():");
  let cookieList = decodeURIComponent(document.cookie).split(';');

  let optRead = 0;
  for (let ind = 0; ind < cookieList.length; ind++) {
    let c = cookieList[ind];

    if (c.indexOf("iolab_options") > -1) {
      let i1 = c.indexOf("[") + 1;
      let i2 = c.length - 1;
      let str = c.substring(i1, i2);
      optRead = JSON.parse(str);
      console.log(optRead);
    }
  }

  if (optRead == 0) {
    console.log("getOptionCookies(): No options found");
  } else {
    console.log("getOptionCookies() found:");
    console.log(optRead);

    // get the options
    getValidOptions(optRead);
  }
}

// get whatever valid options are in the cookie we found
function getValidOptions(optRead) {

  if (optRead.showDac != undefined) {iolabOptions.showDac = optRead.showDac;}
  if (optRead.showBzz != undefined) {iolabOptions.showBzz = optRead.showBzz;}
  if (optRead.showD4 != undefined) {iolabOptions.showD4 = optRead.showD4;}
  if (optRead.showD5 != undefined) {iolabOptions.showD5 = optRead.showD5;}
  if (optRead.showD6 != undefined) {iolabOptions.showD6 = optRead.showD6;}
  if (optRead.toIndex != undefined) {iolabOptions.toIndex = optRead.toIndex;}
  if (optRead.byLocal != undefined) {iolabOptions.byLocal = optRead.byLocal;}
  console.log("In getValidOptions():")
  console.log(iolabOptions);
}

//===================================================================
// summarize some useful info from config.js
function getIOLabConfigInfo() {

  // store information about each sensor, indexed by sensor number
  for (let ind = 0; ind < iolabConfig.sensors.length; ind++) {
    let sens = iolabConfig.sensors[ind];
    sensorInfoList[sens.code] = sens;
  }

  // store information about each fixed configuration, index by config number
  for (let ind = 0; ind < iolabConfig.fixedConfigurations.length; ind++) {
    let fc = iolabConfig.fixedConfigurations[ind];

    let sensList = [];
    let rateList = [];
    let longDesc = fc.code.toString() + ": ";
    let longDesc2 = "";
    for (let sens = 0; sens < fc.sensors.length; sens++) {
      let skey = fc.sensors[sens].sensorKey;
      let srate = fc.sensors[sens].sampleRate;
      longDesc2 += sensorInfoList[skey].shortDesc + '(' + srate.toString() + 'Hz) ';
      longDesc += sensorInfoList[skey].shortDesc + '(' + srate.toString() + ') ';

      sensList.push(skey);
      rateList.push(srate);
    }

    // if there is any "extra" text tack it on to the end of the description
    let extra = "";
    if (fc.extra != undefined) {
      extra = fc.extra;
    }

    fc.sensList = sensList;
    fc.rateList = rateList;
    fc.longDesc = longDesc.slice(0, -1) + extra;
    fc.longDesc2 = longDesc2.slice(0, -1) + extra;

    fixedConfigList[fc.code] = fc;
  }

}


//====================================================================
// returns the appropriate byte array for the requested command record
function getCommandRecord(command, remoteID, payload) {

  // set defaults in cases where remoteID or payload are undefined
  // (for now we are using only remote 1)
  if (typeof remoteID === "undefined") { remoteID = 1 }
  if (typeof payload === "undefined") { payload = 2 }

  var byteArray = 0;

  if (command == "getDongleStatus") {
    byteArray = new Uint8Array([0x02, 0x14, 0x00, 0x0A]);

  } else if (command == "getPairing") {
    byteArray = new Uint8Array([0x02, 0x12, 0x00, 0x0A]);

  } else if (command == "getRemoteStatus") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x2A, 0x01, remoteID, 0x0A]);

  } else if (command == "setFixedConfig") {
    remoteID = 1, payload = current_config_code;
    byteArray = new Uint8Array([0x02, 0x26, 0x02, remoteID, payload, 0x0A]);

  } else if (command == "getFixedConfig") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x27, 0x01, remoteID, 0x0A]);

  } else if (command == "getPacketConfig") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x28, 0x01, remoteID, 0x0A]);

  } else if (command == "getBarometerCalibration") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x29, 0x02, remoteID, 4, 0x0A]);

  } else if (command == "getThermometerCalibration") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x29, 0x02, remoteID, 26, 0x0A]);

  } else if (command == "startData") {
    byteArray = new Uint8Array([0x02, 0x20, 0x00, 0x0A]);

  } else if (command == "stopData") {
    byteArray = new Uint8Array([0x02, 0x21, 0x00, 0x0A]);

  } else if (command == "powerDown") {
    remoteID = 1;
    byteArray = new Uint8Array([0x02, 0x2B, 0x01, remoteID, 0x0A]);

  }

  return byteArray;
}

//====================================================================
// construct the drop-down menu for selecting commands 
// (should be consistent with the commands defined above)
function buildCmdPicker() {

  let cmdPicker = document.getElementById('cmd-picker');
  let cmdOption = null;

  // build drowpdown menu
  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getDongleStatus";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "startData";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "stopData";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "setFixedConfig";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getFixedConfig";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getPacketConfig";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getPairing";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getRemoteStatus";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getBarometerCalibration";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "getThermometerCalibration";
  cmdPicker.appendChild(cmdOption);

  cmdOption = document.createElement('option');
  cmdOption.value = cmdOption.innerText = "powerDown";
  cmdPicker.appendChild(cmdOption);

  // default to setFixedConfig
  cmdPicker.selectedIndex = 3;
  current_cmd = cmdPicker.options[cmdPicker.selectedIndex].value;
  document.getElementById('config-picker').style.visibility = "visible";

  cmdPicker.onchange = function () {

    current_cmd = cmdPicker.options[cmdPicker.selectedIndex].value;
    console.log("current_cmd= " + current_cmd);

    if (current_cmd == "setFixedConfig") {
      document.getElementById('config-picker').style.visibility = "visible";
    } else {
      document.getElementById('config-picker').style.visibility = "hidden";
    }
    updateSystemState();

  };
}

//====================================================================
// construct the drop-down menu for the DAC control
async function buildDacPicker() {

  for (let i = 0; i < iolabConfig.DACValues.length; i++) {
    var dacOption = document.createElement('option');
    dacOption.value = 32 + iolabConfig.DACValues[i].val;        // the key-value for each DAC setting
    dacOption.innerText = iolabConfig.DACValues[i].lbl + " V";  // the menu text for each DAC setting
    dacPicker.appendChild(dacOption);
  }

  dacCtl.hidden = !dispDac.checked;
  dacPicker.selectedIndex = 17;

  // when the DAC voltage is changed
  dacPicker.onchange = async function () {
    setDacVoltage();
  }

  dacUp.addEventListener("click", async function () {
    if (dacPicker.selectedIndex < (iolabConfig.DACValues.length - 1)) {
      dacPicker.selectedIndex += 1;
    }
    setDacVoltage();
  });

  dacDn.addEventListener("click", async function () {
    if (dacPicker.selectedIndex > 0) {
      dacPicker.selectedIndex -= 1;
    }
    setDacVoltage();
  });

  // when the DAC box is checked or unchecked
  dacCK.addEventListener("click", async function () {
    dacEnable(this.checked);
  });

}

//====================================================================
// construct the drop-down menu for buzzer control
async function buildBzzPicker() {

  for (let i = 0; i < iolabConfig.BzzValues.length; i++) {
    var bzzOption = document.createElement('option');
    bzzOption.value = 32 + iolabConfig.BzzValues[i].val;        // the key-value for each DAC setting
    bzzOption.innerText = iolabConfig.BzzValues[i].lbl + " Hz";  // the menu text for each DAC setting
    bzzPicker.appendChild(bzzOption);
  }

  bzzCtl.hidden = !dispBzz.checked;
  bzzPicker.selectedIndex = 8;

  // when the Bzz frequency is changed
  bzzPicker.onchange = async function () {
    setBzzFrequency();
  }

  // when the Bzz box is checked or unchecked
  bzzCK.addEventListener("click", async function () {
    bzzEnable(this.checked);
  });

}

//====================================================================
// construct the drop-down menu for the D4 control
async function buildD4Picker() {

  for (let i = 0; i < iolabConfig.D4D5Values.length; i++) {
    var d4Option = document.createElement('option');
    let key = iolabConfig.D4D5Values[i].key;
    let value = iolabConfig.D4D5Values[i].val;
    d4Option.value = (key << 5) + value;                            // the key-value for each setting
    d4Option.innerText = iolabConfig.D4D5Values[i].lbl + " Hz";  // the menu text for each setting
    d4Picker.appendChild(d4Option);
  }

  d4Ctl.hidden = !dispD4.checked;
  d4Picker.selectedIndex = 3;

  // when the D4 voltage is changed
  d4Picker.onchange = async function () {
    setD4Frequency();
  }

  // when the D4 box is checked or unchecked
  d4CK.addEventListener("click", async function () {
    d4Enable(this.checked);
  });

}

//====================================================================
// construct the drop-down menu for the D5 control
async function buildD5Picker() {

  for (let i = 0; i < iolabConfig.D4D5Values.length; i++) {
    var d5Option = document.createElement('option');
    let key = iolabConfig.D4D5Values[i].key;
    let value = iolabConfig.D4D5Values[i].val;
    d5Option.value = (key << 5) + value;                            // the key-value for each setting
    d5Option.innerText = iolabConfig.D4D5Values[i].lbl + " Hz";  // the menu text for each setting
    d5Picker.appendChild(d5Option);
  }

  d5Ctl.hidden = !dispD5.checked;
  d5Picker.selectedIndex = 3;

  // when the D5 voltage is changed
  d5Picker.onchange = async function () {
    setD5Frequency();
  }

  // when the D5 box is checked or unchecked
  d5CK.addEventListener("click", async function () {
    d5Enable(this.checked);
  });

}

//====================================================================
// construct the drop-down menu for the timeout option
async function buildTimeoutPicker() {

  let timeoutValue = [5, 10, 15, 30, 60, 120, 180, 360];
  let timeoutText = ["5 min", "10 min", "15 min", "30 min", "1 hr", "2 hr", "3 hr", "6 hr"];

  for (let i = 0; i < timeoutValue.length; i++) {
    let timeoutOption = document.createElement('option');
    timeoutOption.value = timeoutValue[i];     // value for each setting
    timeoutOption.innerText = timeoutText[i];  // the menu text for each setting
    timeoutPicker.appendChild(timeoutOption);
  }

  timeoutPicker.selectedIndex = iolabOptions.toIndex;
  idleTimeoutCount = 60 * timeoutPicker.options[timeoutPicker.selectedIndex].value;

  // start the tick timer
  tickTimerID = setInterval(handleTick, tickTimerMS);

  // when the timeout value is changed
  timeoutPicker.onchange = async function () {
    idleTimeoutCount = 60 * timeoutPicker.options[timeoutPicker.selectedIndex].value;
    idleTicks = idleTimeoutCount;
    tickCounter.innerHTML = "Inactivity Timeout " + idleTicks.toString();

  }
}

//====================================================================
// The D6 output is just controlled by a checkbox. 
// It powers up to Z, check = 1, uncheck = 0.  
async function buildD6control() {

  d6Ctl.hidden = !dispD6.checked;

  // when the D6 box is checked or unchecked
  d6CK.addEventListener("click", async function () {
    d6Enable(this.checked);
  });

}

//====================================================================
// The local vertical B-field used in magnetometer calibration  
async function buildBvertControl() {

  local_Bvert = iolabOptions.byLocal;
  bzLocal.value = local_Bvert;


}


// methods used by event handlers
async function setDacVoltage(remoteID = 1) {
  let dacValue = dacPicker.options[dacPicker.selectedIndex].value;
  let kvPair = parseInt(dacValue);
  await sendOutputConfig(remoteID, [1, 0x19, kvPair]);
  setTimeout(async function () {
    await sendOutputConfig(remoteID, [1, 0x19, kvPair]);
  }, 25);
}

async function dacEnable(turnOn, remoteID = 1) {
  let val = 0;
  if (turnOn) val = 1;
  await sendOutputConfig(remoteID, [1, 0x19, val]);
  setTimeout(async function () {
    await sendOutputConfig(remoteID, [1, 0x19, val]);
  }, 25);
}

async function setD4Frequency(remoteID = 1) {
  let D4Value = d4Picker.options[d4Picker.selectedIndex].value;
  let kvPair = parseInt(D4Value);
  await sendOutputConfig(remoteID, [1, 0x12, kvPair]);
}

async function d4Enable(turnOn, remoteID = 1) {
  let val = 0;
  if (turnOn) val = 2;
  let D4Value = d4Picker.options[d4Picker.selectedIndex].value;
  let kvPair = parseInt(D4Value);
  await sendOutputConfig(remoteID, [2, 0x12, kvPair, 0x12, val]);
}

async function setD5Frequency(remoteID = 1) {
  let D5Value = d5Picker.options[d5Picker.selectedIndex].value;
  let kvPair = parseInt(D5Value);
  await sendOutputConfig(remoteID, [1, 0x13, kvPair]);
}

async function d5Enable(turnOn, remoteID = 1) {
  let val = 0;
  if (turnOn) val = 2;
  let D5Value = d5Picker.options[d5Picker.selectedIndex].value;
  let kvPair = parseInt(D5Value);
  await sendOutputConfig(remoteID, [2, 0x13, kvPair, 0x13, val]);
}

async function setBzzFrequency(remoteID = 1) {
  let bzzValue = bzzPicker.options[bzzPicker.selectedIndex].value;
  let kvPair = parseInt(bzzValue);
  await sendOutputConfig(remoteID, [1, 0x18, kvPair]);
  setTimeout(async function () {
    await sendOutputConfig(remoteID, [1, 0x18, kvPair]);
  }, 25);
}

async function bzzEnable(turnOn, remoteID = 1) {
  let val = 0;
  if (turnOn) val = 1;
  let bzzValue = bzzPicker.options[bzzPicker.selectedIndex].value;
  let kvPair = parseInt(bzzValue);
  await sendOutputConfig(remoteID, [2, 0x18, kvPair, 0x18, val]);
  setTimeout(async function () {
    await sendOutputConfig(remoteID, [2, 0x18, kvPair, 0x18, val]);
  }, 25);
}

async function d6Enable(turnOn, remoteID = 1) {
  let val = 32;
  if (turnOn) val = 33;
  await sendOutputConfig(remoteID, [2, 0x14, 2, 0x14, val]);
  setTimeout(async function () {
    await sendOutputConfig(remoteID, [2, 0x14, 2, 0x14, val]);
  }, 25);
}

//====================================================================
// construct the drop-down menu for selecting fixed configurations
function buildConfigPicker() {

  // var configPicker = document.getElementById('config-picker');
  var configOption = document.createElement('option');
  configOption.value = configOption.innerText = "Select Sensor Combintion (sample rate in Hz) then click Configure";
  configPicker.appendChild(configOption);

  for (let i = 0; i < iolabConfig.fixedConfigurations.length; i++) {
    configOption = document.createElement('option');

    let code = iolabConfig.fixedConfigurations[i].code;
    configOption.value = configOption.innerText = fixedConfigList[code].longDesc;

    configPicker.appendChild(configOption);
  }

  //configPicker.selectedIndex = 17; // default to "kitchen sink"
  //configPicker.selectedIndex = 13; // default to accelerometer
  configPicker.selectedIndex = 0;
  current_config = configPicker.options[configPicker.selectedIndex].value;
  current_config_code = -1;

  document.getElementById('config-picker').style.visibility = "hidden";

  configPicker.onchange = function () {
    console.log("selecting config-picker index ", configPicker.selectedIndex);
    current_config = configPicker.options[configPicker.selectedIndex].value;
    daqConfigured = false;

    if (configPicker.selectedIndex == 0) {
      current_config_code = -1;
      configPicker.title = "Select Configuration";
    } else {
      current_config_code = iolabConfig.fixedConfigurations[configPicker.selectedIndex - 1]["code"];
      configPicker.title = fixedConfigList[current_config_code].longDesc2;
    }
    updateSystemState();
  }

}
