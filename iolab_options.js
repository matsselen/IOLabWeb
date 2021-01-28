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
    let longDesc = fc.code.toString()+": ";
    for (let ind = 0; ind < fc.sensors.length; ind++) {
      let skey = fc.sensors[ind].sensorKey;
      let srate = fc.sensors[ind].sampleRate;
      longDesc += sensorInfoList[skey].shortDesc + '(' + srate.toString() + 'Hz) \n';

      sensList.push(skey);
      rateList.push(srate);
    }

    fc.sensList = sensList;
    fc.rateList = rateList;
    fc.longDesc = longDesc


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
// construct the drop-down menu for selecting fixed configurations
function buildConfigPicker() {

  var configPicker = document.getElementById('config-picker');
  var configOption;

  for (let i = 0; i < iolabConfig.fixedConfigurations.length; i++) {
    configOption = document.createElement('option');

    let code = iolabConfig.fixedConfigurations[i].code;
    configOption.value = configOption.innerText = fixedConfigList[code].longDesc;

    configPicker.appendChild(configOption);
  }

  //configPicker.selectedIndex = 17; // default to "kitchen sink"
  //configPicker.selectedIndex = 13; // default to accelerometer
  configPicker.selectedIndex = 12; // high speed orientation
  current_config = configPicker.options[configPicker.selectedIndex].value;
  current_config_code = iolabConfig.fixedConfigurations[configPicker.selectedIndex]["code"];
  document.getElementById('config-picker').style.visibility = "hidden";

  configPicker.onchange = function () {
    current_config = configPicker.options[configPicker.selectedIndex].value;
    current_config_code = iolabConfig.fixedConfigurations[configPicker.selectedIndex]["code"];

  };
}
