// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

'use strict';

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
    //let longDesc = fc.code.toString() + " [" + fc.desc + "] ";
    let longDesc = fc.code.toString() + ": ";
    //let longDesc = "";
    let longDesc2 = "";
    for (let sens = 0; sens < fc.sensors.length; sens++) {
      let skey = fc.sensors[sens].sensorKey;
      let srate = fc.sensors[sens].sampleRate;
      longDesc2 += sensorInfoList[skey].shortDesc + '(' + srate.toString() + 'Hz) ';
      longDesc += sensorInfoList[skey].shortDesc + '(' + srate.toString() + ') ';

      sensList.push(skey);
      rateList.push(srate);
    }

    fc.sensList = sensList;
    fc.rateList = rateList;
    fc.longDesc = longDesc.slice(0, -1);
    fc.longDesc2 = longDesc2.slice(0, -1);


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
function buildDacPicker() {

  var dacOption;
  for (let i = 0; i < iolabConfig.DACVAlues.length; i++) {
    dacOption = document.createElement('option');
    dacOption.value = iolabConfig.DACVAlues[i].value;
    dacOption.innerText = iolabConfig.DACVAlues[i].label + " V";
    dacPicker.appendChild(dacOption);
  }
  dacPicker.selectedIndex = 17;

  dacPicker.onchange = function () {
    console.log("selecting dacPicker index ", dacPicker.selectedIndex);
    let dacValue = dacPicker.options[dacPicker.selectedIndex].value;

    let remoteID = 1;
    let kvPair = (1<<5) + parseInt(dacValue);
    let payload = [1, 0x19, kvPair];

    sendOutputConfig(remoteID, payload);

  }

  dacCK.addEventListener("click", function () {
    console.log("In dacCK", this.checked);

    let remoteID = 1;
    if (this.checked) {
      let payload = [1, 0x19, 1];
      sendOutputConfig(remoteID, payload);
    } else {
      let payload = [1, 0x19, 0];
      sendOutputConfig(remoteID, payload);      
    }

  });

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
