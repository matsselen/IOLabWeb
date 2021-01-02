
//====================================================================
// Call this to clear and reset the acquisition 
function resetAcquisition() {
  bytesReceived = 0;
  rxdata = [];
  writePointer = 0;
  readPointer = 0;
  timeElapsed = 0;
  lastFrame = -1;
  elapsedFrame = -1;

  rawData = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  rawReadPtr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  calData = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  calWritePtr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  calReadPtr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

}

//====================================================================
// Process the data sent from the remote to the dongle to the computer
// and extract both command records and data records
// Called on timer rawRecordTimerID at intervals rawRecordTimerMS
function extractRecords() {
  ncalls += 1;

  if (ncalls % 1000 == 0) {
    console.log("Processing call " + ncalls + " writePtr = " + writePointer + " readPtr = " + readPointer)
  }

  // the shortest packet we can receive is 5 bytes (ACK or NACK)
  while (readPointer < (writePointer - 4)) {
    // look for Start of Packet (0x02) - if not then increment read pointer

    if (rxdata[readPointer] != 2) {
      readPointer++;
    } else {

      var payloadBytes = rxdata[readPointer + 2];
      var indexEOP = readPointer + payloadBytes + 3;

      // make sure we have enough data to include the end of the packet
      if (indexEOP < writePointer) {

        // see if the end of packet byte is in fact there
        if (rxdata[indexEOP] == 0x0A) {

          // if we get here we seem to have a good record
          var recType = rxdata[readPointer + 1]
          if (recType > 199) {
            console.log("Ooops recType = " + recType)
            recType = 199;
          }
          if (recType == 0xAA) { // ACK
            nAck++;
            processACK(readPointer + 3, payloadBytes);
          }
          if (recType == 0xBB) { // NACK
            nNack++;
            processNACK(readPointer + 3, payloadBytes);
          }
          if (recType == 0x12) { // Get Pairing
            nGetPairing++;
            processGetPairing(readPointer + 3, payloadBytes);
          }
          if (recType == 0x14) { // Get Dongle Status
            nGetDongleStatus++;
            processGetDongleStatus(readPointer + 3, payloadBytes);
          }
          if (recType == 0x27) { // Get Fixed Config
            nGetFixedConfig++;
            processGetFixedConfig(readPointer + 3, payloadBytes);
          }
          if (recType == 0x28) { // Get Packet Config
            nGetPacketConfig++;
            processGetPacketConfig(readPointer + 3, payloadBytes);
          }
          if (recType == 0x2A) { // Get Remote Status
            nGetRemoteStatus++;
            processGetRemoteStatus(readPointer + 3, payloadBytes);
          }
          if (recType == 0x40) { // RF Connection (ASYNC)
            nRFconnection++;
            processRFconnection(readPointer + 3, payloadBytes);
          }
          if (recType == 0x41) { // Data from Remote (ASYNC)
            nDataFromRemote++;
            processDataRecord(readPointer + 3, payloadBytes);
          }

          n_rectype[recType]++;
          readPointer += (payloadBytes + 4);
        } else {
          readPointer++;
        }
      } else {
        return;
      }
    }
  }
}

// Process ACK
function processACK(recStart, recLength) {
  ackCommand = rxdata[recStart];
  console.log("In processACK: " + "Command:0x" + ackCommand.toString(16));
  updateSystemState();
}

// Process NACK
function processNACK(recStart, recLength) {
  nackCommand = rxdata[recStart];
  nackReason = rxdata[recStart + 1];
  console.log("In processNACK: " + "Command:0x" + nackCommand.toString(16) + " Reason:0x" + nackReason.toString(16));
  updateSystemState();
}

// Process responses to the Get Pairing command
function processGetPairing(recStart, recLength) {
  remote1Status = rxdata[recStart];
  remote1ID = (rxdata[recStart + 1] << 16) + (rxdata[recStart + 2] << 8) + rxdata[recStart + 3];
  remote2Status = rxdata[recStart + 4];
  remote2ID = (rxdata[recStart + 5] << 16) + (rxdata[recStart + 6] << 8) + rxdata[recStart + 7];
  console.log("In processGetPairing: " + "remote1Status:0x" + remote1Status.toString(16) +
    " remote1ID:0x" + remote1ID.toString(16) + " remote2Status:0x" + remote2Status.toString(16) +
    " remote2ID:0x" + remote2ID.toString(16));
  updateSystemState();
}

// Process responses to the Get Dongle Status command
function processGetDongleStatus(recStart, recLength) {
  dongleFirmwareVersion = (rxdata[recStart] << 8) + rxdata[recStart + 1];
  dongleStatus = rxdata[recStart + 2];
  dongleID = (rxdata[recStart + 3] << 16) + (rxdata[recStart + 4] << 8) + rxdata[recStart + 5];
  console.log("In processGetDongleStatus: " + "Firmware:0x" + dongleFirmwareVersion.toString(16) +
    " Status:0x" + dongleStatus.toString(16) + " ID:0x" + dongleID.toString(16));
  updateSystemState();
}

// Process responses to the Get Packet Config command
function processGetPacketConfig(recStart, recLength) {

  lengthBySensor = [new Array(30).fill(0), new Array(30).fill(0)];

  var remote = rxdata[recStart] - 1;
  if (remote == 0 || remote == 1) {
    nSensor[remote] = rxdata[recStart + 1];
    var j = 0;
    for (i = recStart + 2; i < recStart + recLength; i += 2) {
      sensorArray[remote][j] = rxdata[i];
      lengthArray[remote][j] = rxdata[i + 1];
      lengthBySensor[remote][rxdata[i]] = rxdata[i + 1];
      j++;
    }
    console.log("In GetPacketConfig, lengthBySensor:");
    console.log(lengthBySensor);
    daqConfigured = true;
    updateSystemState();
  } else {
    console.log("invalid remote in GetPacketConfig record: " + remote);
  }
}

// Process responses to the Get Fixed Config command
function processGetFixedConfig(recStart, recLength) {

  var remote = rxdata[recStart] - 1;
  if (remote == 0 || remote == 1) {
    fixedConfig[remote] = rxdata[recStart + 1];
    console.log("In GetFixedConfig: Remote=" + remote + " Fixed Configuration=" + fixedConfig[remote]);
    daqConfigured = false;
    updateSystemState();
  } else {
    console.log("invalid remote in GetFixedConfig record: " + remote);
  }
}

// Process responses to the Get Remote Status command
function processGetRemoteStatus(recStart, recLength) {
  var remote = rxdata[recStart] - 1;
  if (remote == 0 || remote == 1) {
    remoteStatus[remote] = 1;
    remoteSensorFirmwareVersion[remote] = (rxdata[recStart + 1] << 8) + rxdata[recStart + 2];
    remoteRadioFirmwareVersion[remote] = (rxdata[recStart + 3] << 8) + rxdata[recStart + 4];
    remoteBattery[remote] = (rxdata[recStart + 5] << 8) + rxdata[recStart + 6];
    remoteVoltage[remote] = 6 * (remoteBattery[remote] / 4096);

    console.log("In processGetRemoteStatus: " + "Remote: " + rxdata[recStart].toString() +
      " Sensor Firmware:0x" + remoteSensorFirmwareVersion[remote].toString(16) +
      " Radio Firmware:0x" + remoteRadioFirmwareVersion[remote].toString(16) +
      " Battery:0x" + remoteBattery[remote].toString(16));
  }
  updateSystemState();
}

// Process asynchronous RF Connection records sent by the remote
// when it is turned on or off
function processRFconnection(recStart, recLength) {
  var remote = rxdata[recStart] - 1;
  if (remote == 0 || remote == 1) {
    remoteRFstatus[remote] = rxdata[recStart + 1];
    if (remoteRFstatus[remote] > 0) {
      remoteStatus[remote] = 1;
      justTurnedOnRemote = true;
    } else {
      remoteStatus[remote] = 0;
      justTurnedOnRemote = false;
    }
    daqConfigured = false;

    console.log("In processRFconnection: " + "Remote: " + rxdata[recStart].toString() +
      " Status:0x" + remoteRFstatus[remote].toString(16));
  }
  updateSystemState();
}


// Process asynchronous data records sent by the remote acquiring data
function processDataRecord(recStart, recLength) {

  var remote = rxdata[recStart] - 1;
  // only read out remote 1 for now
  if (remote != 0) {
    console.log("ignoring remote " + (remote + 1));
    return;
  } else {

    // stuff from header & footer
    var frame = rxdata[recStart + 1];
    var rfstat = rxdata[recStart + 2];
    var rssi = rxdata[recStart + recLength - 1];

    // save header info as sensor 0.
    rawData[0].push([frame, rfstat, rssi]);


    // Figure out the number of elpsed frames since the last reset. We do this by 
    // looking at the frame change since the last one. It should be 1, but migth be 2 or 
    // more of somthing was missed. It could also be a -ve number of the 8-bit counter wrapped.
    //
    // If this is the first packet after resetting, set the elapsed frame counter to 0. 
    // If this is the first packet after "continuing", increment elapsed frame by 1.

    if (lastFrame < 0) {
      lastFrame = frame;
      elapsedFrame = 0;
      justRestarted = false;

      // if we just restarted after pausing the frame counter may not be in sequence 
      // from the previous one from before the pause, to deal with this

    } else if (justRestarted) {
      justRestarted = false;
      lastFrame = frame;
      elapsedFrame += 1;

      // if its not the first data packet after a reset or a restart then find the change 
      // since the last one, taking into account the possibility that the counter wrapped
    } else {
      var frameChange = frame - lastFrame;
      if (frameChange < 0) frameChange += 256;
      if (frameChange > 1) {
        console.log("OOPS - skipped a frame: this frame=" + frame + " last frame =" + lastFrame);
      }
      elapsedFrame += frameChange;
      lastFrame = frame;
    }

    // stuff from data portion
    var ptr = recStart + 3;
    var nsens = rxdata[ptr];

    for (let s = 0; s < nsens; s++) {
      var sens = rxdata[++ptr] & 0x7F; // Sensor. Mask off the overflow bit...
      var ovfl = rxdata[ptr] & 0x80;   // ...and flag it here
      var nbytes = rxdata[++ptr];
      var lastValidIndex = ptr + nbytes;
      var maxbytes = lengthBySensor[0][sens];
      if (maxbytes == 0) console.log("yikes - sens=" + sens + " nbytes=" + nbytes + " ptr=" + ptr + " maxbytes=" + maxbytes);
      var lastBufferIndex = ptr + maxbytes;

      var j = 0;
      var dataList = [];
      while (ptr < lastValidIndex) {
        dataList[j++] = rxdata[++ptr];
      }

      // Build data packet
      var dataPacket = [[elapsedFrame, rfstat, rssi], [sens, ovfl], dataList];

      // push the data onto a 2D raw data array indexed by sensor ID.
      rawData[sens].push(dataPacket);

      // set pointer to the next sensors data
      ptr = lastBufferIndex;
    }
  }
}

//======================================================================
// the beginning of a set of routines to analyze and calibrate data
// at the moment its rather crude, but you get the idea
function buildAndCalibrate() {

  // accelerometer
  var sensorID = 1;

  // puts the raw bytes together and applies calibration (cal just estimated for now)
  // six bytes per sample: [x_hi, x_lo, y_hi, y_lo, z_hi, z_lo]
  if (sensorID == 1) {
    for (let ind = rawReadPtr[sensorID]; ind < rawData[sensorID].length; ind++) {

      var nbytes = rawData[sensorID][ind][2].length;
      if (nbytes % 6 != 0) {
        console.log("accelerometer bytecount not a multiple of 6");
      } else {
        var nsamples = nbytes / 6;
        for (let i = 0; i < nsamples; i++) {
          var j = i * 6;
          var xDat = rawData[sensorID][ind][2][j] << 8 | rawData[sensorID][ind][2][j + 1];
          var yDat = rawData[sensorID][ind][2][j + 2] << 8 | rawData[sensorID][ind][2][j + 3];
          var zDat = rawData[sensorID][ind][2][j + 4] << 8 | rawData[sensorID][ind][2][j + 5];
          var tDat = (rawData[sensorID][ind][0][0] + i / nsamples) * 0.010;
          var calx = calAccel(xDat);
          var caly = calAccel(yDat);
          var calz = calAccel(zDat);

          // accdelerometer is turned on PCB so x = -y and y = x
          calData[sensorID][calWritePtr[sensorID]++] = [tDat, -caly, calx, calz];
        }
      }
    }
    rawReadPtr[sensorID] = rawData[sensorID].length;
  }
}

// turn 16 bit twos complement signed int into signed int and pretend-calibrate 
function calAccel(n) {
  if (n > 0x7fff) {
    var r1 = ~n;
    var r2 = r1 & 0xffff;
    var r3 = -1 * (r2 + 1);
    return 9.81 * r3 / 8080;
  } else {
    return 9.81 * n / 8080;
  }
}