'use strict';
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
  startTime = 0;
  stopTime = 0;
  lastRunTime = 0;
  totalRunTime = 0;

  rawReadPtr = new Array(maxSensorCode).fill(0);
  calWritePtr = new Array(maxSensorCode).fill(0);
  calReadPtr = new Array(maxSensorCode).fill(0);

  rawData = [];
  calData = [];
  for (let i = 0; i < maxSensorCode; i++) {
    rawData.push([]);
    calData.push([]);
  }

  // wheel stuff
  rWheel = 0;
  vWheel = 0;
  aWheel = 0;

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

      let payloadBytes = rxdata[readPointer + 2];
      let indexEOP = readPointer + payloadBytes + 3;

      // make sure we have enough data to include the end of the packet
      if (indexEOP < writePointer) {

        // see if the end of packet byte is in fact there
        if (rxdata[indexEOP] == 0x0A) {

          // if we get here we seem to have a good record
          let recType = rxdata[readPointer + 1]
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

  let remote = rxdata[recStart] - 1;
  if (remote == 0 || remote == 1) {
    nSensor[remote] = rxdata[recStart + 1];
    let j = 0;
    for (let i = recStart + 2; i < recStart + recLength; i += 2) {
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

  let remote = rxdata[recStart] - 1;
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
  let remote = rxdata[recStart] - 1;
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
  let remote = rxdata[recStart] - 1;
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

  let remote = rxdata[recStart] - 1;
  // only read out remote 1 for now
  if (remote != 0) {
    console.log("ignoring remote " + (remote + 1));
    return;
  } else {

    // stuff from header & footer
    let frame = rxdata[recStart + 1];
    let rfstat = rxdata[recStart + 2];
    let rssi = rxdata[recStart + recLength - 1];

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
      let frameChange = frame - lastFrame;
      if (frameChange < 0) frameChange += 256;
      if (frameChange > 1) {
        console.log("OOPS - skipped a frame: this frame=" + frame + " last frame =" + lastFrame);
      }
      elapsedFrame += frameChange;
      lastFrame = frame;
    }

    // stuff from data portion
    let ptr = recStart + 3;
    let nsens = rxdata[ptr];

    for (let s = 0; s < nsens; s++) {
      let sens = rxdata[++ptr] & 0x7F; // Sensor. Mask off the overflow bit...
      let ovfl = rxdata[ptr] & 0x80;   // ...and flag it here
      let nbytes = rxdata[++ptr];
      let lastValidIndex = ptr + nbytes;
      let maxbytes = lengthBySensor[0][sens];
      if (maxbytes == 0) console.log("yikes - sens=" + sens + " nbytes=" + nbytes + " ptr=" + ptr + " maxbytes=" + maxbytes);
      let lastBufferIndex = ptr + maxbytes;

      let j = 0;
      let dataList = [];
      while (ptr < lastValidIndex) {
        dataList[j++] = rxdata[++ptr];
      }

      // Build data packet
      let dataPacket = [[elapsedFrame, rfstat, rssi], [sens, ovfl], dataList];

      // push the data onto a 2D raw data array indexed by sensor ID.
      rawData[sens].push(dataPacket);

      // set pointer to the next sensors data
      ptr = lastBufferIndex;
    }
  }
}

//======================================================================
// analyze and calibrate data from each sensor being read out
function buildAndCalibrate() {

  // loop over sensors
  for (let s = 0; s < sensorIDlist.length; s++) {

    let sensorID = sensorIDlist[s];

    // the accelerometer, magnetometer, and gyroscope have the same data formats
    // six bytes per sample: [x_hi, x_lo, y_hi, y_lo, z_hi, z_lo]
    if (sensorID == 1 || sensorID == 2 || sensorID == 3) {

      // loop over data packets that arrived since the last time
      for (let ind = rawReadPtr[sensorID]; ind < rawData[sensorID].length; ind++) {

        let nbytes = rawData[sensorID][ind][2].length;
        if (nbytes % 6 != 0) {
          console.log(" bytecount not a multiple of 6");
        } else {

          // loop over the data samples in each packet
          let nsamples = nbytes / 6;
          for (let i = 0; i < nsamples; i++) {
            let j = i * 6;
            let xDat = rawData[sensorID][ind][2][j] << 8 | rawData[sensorID][ind][2][j + 1];
            let yDat = rawData[sensorID][ind][2][j + 2] << 8 | rawData[sensorID][ind][2][j + 3];
            let zDat = rawData[sensorID][ind][2][j + 4] << 8 | rawData[sensorID][ind][2][j + 5];
            let tDat = (rawData[sensorID][ind][0][0] + i / nsamples) * 0.010;

            // accelerometer
            if (sensorID == 1) {
              let calx = calAccel(tc2int(xDat));
              let caly = calAccel(tc2int(yDat));
              let calz = calAccel(tc2int(zDat));
              // accdelerometer is turned on PCB so x = -y and y = x
              calData[sensorID][calWritePtr[sensorID]++] = [tDat, -caly, calx, calz];

              // magnetometer
            } else if (sensorID == 2) {
              let calx = calMag(tc2int(xDat));
              let caly = calMag(tc2int(yDat));
              let calz = calMag(tc2int(zDat));
              calData[sensorID][calWritePtr[sensorID]++] = [tDat, caly, calx, calz];

              // gyroscope
            } else if (sensorID == 3) {
              let calx = calGyro(tc2int(xDat));
              let caly = calGyro(tc2int(yDat));
              let calz = calGyro(tc2int(zDat));
              calData[sensorID][calWritePtr[sensorID]++] = [tDat, caly, calx, calz];
            }
          }//sample loop
        }
      }//data packet loop

      // advance raw data read pointer
      rawReadPtr[sensorID] = rawData[sensorID].length;

      // for the wheel sensor
    } else if (sensorID == 9) {

      // loop over data packets that arrived since the last time
      for (let ind = rawReadPtr[sensorID]; ind < rawData[sensorID].length; ind++) {

        let nbytes = rawData[sensorID][ind][2].length;
        if (nbytes % 2 != 0) {
          console.log(" bytecount not a multiple of 2");
        } else {

          // loop over the data samples in each packet
          let nsamples = nbytes / 2;
          for (let i = 0; i < nsamples; i++) {
            let j = i * 2;
            let wDatRaw = rawData[sensorID][ind][2][j] << 8 | rawData[sensorID][ind][2][j + 1];
            let tDat = (rawData[sensorID][ind][0][0] + i / nsamples) * 0.010;

            let wDat = tc2int(wDatRaw); // change encoder reading (signed 2s comp int) into signed int

            // save semi-raw wheel data using the actual sensor number of the wheel - just because we can
            // (as opposed to the derived sensor numbers for x, v, a)
            calData[9][calWritePtr[9]++] = [tDat, wDat];

            rWheel += wDat * 0.001;  // each tick is 1mm = 0.001m. 
            vWheel = wDat * 0.10;     // (wDat counts/tick)*(.001 m/count)*(100 ticks/s) = wDat*.001*100 m/s
            aWheel = 0;

            // if there are at least nBefore points before this one then average the velocity meaasurement 
            // and calculate a crude acceleration value by finding the slope of the velocity
            let nBefore = 8;
            if (calWritePtr[9] > nBefore) {
              let Sx = 0;
              let Sxx = 0;
              let Sy = 0;
              let Sxy = 0;
              let n = 0;
              for (let ind = calWritePtr[9] - nBefore; ind < calWritePtr[9]; ind++) {
                let x = calData[9][ind][0];
                let y = calData[9][ind][1];
                Sx += x;
                Sxx += x * x;
                Sy += y;
                Sxy += x * y;
                n += 1;
              }
              let aveX = Sx / n;
              let aveXX = Sxx / n;
              let aveY = Sy / n;
              let aveXY = Sxy / n;

              vWheel = 0.10 * aveY;
              aWheel = 0.10 * (aveXY - aveX * aveY) / (aveXX - aveX * aveX);

            }

            // save semi-processed wheel data (the wheel r/v/a charts are 15/16/17)
            calData[15][calWritePtr[15]++] = [tDat, rWheel];
            calData[16][calWritePtr[16]++] = [tDat, vWheel];
            calData[17][calWritePtr[17]++] = [tDat, aWheel];

          }
        }
      }

      // advance raw data read pointer
      rawReadPtr[sensorID] = rawData[sensorID].length;

      // for the ecg sensor
    } else if (sensorID == 27) {

      // loop over data packets that arrived since the last time
      for (let ind = rawReadPtr[sensorID]; ind < rawData[sensorID].length; ind++) {

        let nbytes = rawData[sensorID][ind][2].length;
        if (nbytes % 12 != 0) {
          console.log(" bytecount not a multiple of 12");
        } else {

          // loop over the data samples in each packet
          let nsamples = nbytes / 12;
          for (let i = 0; i < nsamples; i++) {
            let j = i * 12;
            let raDat = (0xf & rawData[sensorID][ind][2][j]) << 8 | rawData[sensorID][ind][2][j + 1];
            let laDat = (0xf & rawData[sensorID][ind][2][j + 2]) << 8 | rawData[sensorID][ind][2][j + 3];
            let llDat = (0xf & rawData[sensorID][ind][2][j + 4]) << 8 | rawData[sensorID][ind][2][j + 5];
            let c1Dat = (0xf & rawData[sensorID][ind][2][j + 6]) << 8 | rawData[sensorID][ind][2][j + 7];
            let c2Dat = (0xf & rawData[sensorID][ind][2][j + 8]) << 8 | rawData[sensorID][ind][2][j + 9];
            let c3Dat = (0xf & rawData[sensorID][ind][2][j + 10]) << 8 | rawData[sensorID][ind][2][j + 11];
            let tDat = (rawData[sensorID][ind][0][0] + i / nsamples) * 0.010;

            // 2^12 counts = 3 volts. The minus sign fixes an sign inversion elsewhere.
            let countsPerVolt = -4096 / 3;

            let calEcg = [];
            // calibrated simple leads
            calEcg.push((laDat - raDat) / countsPerVolt); // I
            calEcg.push((llDat - raDat) / countsPerVolt); // II
            calEcg.push((llDat - laDat) / countsPerVolt); // III
            // calibrated augmented leads
            calEcg.push((raDat - (laDat + llDat) / 2) / countsPerVolt); // aRA
            calEcg.push((laDat - (raDat + llDat) / 2) / countsPerVolt); // aLA
            calEcg.push((laDat - (raDat + laDat) / 2) / countsPerVolt); // aLL
            // calibrated chest leads
            let cref = (raDat + laDat + llDat) / 3;
            calEcg.push((c1Dat - cref) / countsPerVolt); // V1
            calEcg.push((c2Dat - cref) / countsPerVolt); // V2
            calEcg.push((c3Dat - cref) / countsPerVolt); // V3

            for (let i = 0; i < 9; i++) {
              let s = i + 31; // the ECG calibrated sensors are 31-39
              calData[s][calWritePtr[s]++] = [tDat, calEcg[i]];
            }
          }
        }
      }

      // advance raw data read pointer
      rawReadPtr[sensorID] = rawData[sensorID].length;
    } //ecg

  }//sensor loop

} //buildAndCalibrate()

//======================================================================
// reprocess data at the end of an acquisition (as needed)
function reProcess() {

  // loop over sensors
  for (let s = 0; s < sensorIDlist.length; s++) {

    let sensorID = sensorIDlist[s];

    // for the wheel sensor
    if (sensorID == 9) {

      // wingV and wingA are the number of points on either side of the current one to include when 
      // calculating the velocity and acceleration resprctively (total points = 2*wing+1)
      let wingV = 2;
      let wingA = 4;

      // dont bother unless we have enough data
      let nData = calData[sensorID].length;
      if(nData < 3*wingA) {
        console.log("In reProcess(): Not enough wheel data to reprocess")
        return;
      }

      if (dbgInfo) {
        console.log("In reProcess() nData (wheel) is "+nData.toString());
      }

      rWheel = 0;
      for (let i = 0; i < nData; i++) {

        let tDat = calData[sensorID][i][0];
        let wDat = calData[sensorID][i][1];

        // integrate to find position
        rWheel += wDat * 0.001;  // each tick is 1mm = 0.001m. 
        calData[15][i] = [tDat, rWheel];

        // first calculate the average velocity 
        // adjust the range of points to analyze if we are close to either end of the data array
        let iMin = Math.max(0, i - wingV);
        let iMax = Math.min(iMin + 1 + 2*wingV, nData);

        let Sy = 0;
        let n = 0;

        // accumulate the sums needed to find the average
        for (let i = iMin; i < iMax; i++) {
          Sy += calData[sensorID][i][1];
          n ++;
        }

        // find the average velocity
        vWheel = 0.10*Sy/n;
        calData[16][i] = [tDat, vWheel];

        // now calculate the slope to find the acceleration 
        // adjust the range of points to analyze if we are close to either end of the data array
        iMin = Math.max(0, i - wingA);
        iMax = Math.min(iMin + 1 + 2*wingA, nData);  

        let Sx = 0;
        let Sxx = 0;
        let Sxy = 0;
        n = 0;
        Sy = 0;

        // accumulate the sums needed to find the best-fit slope
        for (let i = iMin; i < iMax; i++) {
          let x = calData[sensorID][i][0];
          let y = calData[sensorID][i][1];
          Sx += x;
          Sxx += x * x;
          Sy += y;
          Sxy += x * y;
          n += 1;
        }
        let aveX = Sx / n;
        let aveXX = Sxx / n;
        let aveY = Sy / n;
        let aveXY = Sxy / n;

        // find the acceleration
        aWheel = 0.10 * (aveXY - aveX * aveY) / (aveXX - aveX * aveX);
        calData[17][i] = [tDat, aWheel];

      } // datapoints
    } // wheel
  } // sensor loop
} // reProcess()


// turn 16 bit twos complement signed int into signed int. 
function tc2int(n) {
  if (n > 0x7fff) {
    let r1 = ~n;
    let r2 = r1 & 0xffff;
    let r3 = -1 * (r2 + 1);
    return r3;
  } else {
    return n;
  }
}

// placeholder calibration functions 
function calAccel(n) {
  return 9.81 * n / 8080;
}

function calMag(n) {
  return (n + 500) / 50;
}

function calGyro(n) {
  return n / 815;
}