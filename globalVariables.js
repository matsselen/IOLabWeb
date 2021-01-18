// Global variables for data acquisition
'use strict';

// configuration information (hardwired for now)
var sensorIDlist = [1,2,3];

// run control
var justRestarted = false;
var justTurnedOnRemote = false;
var runningDAQ = false;
var daqConfigured = false;
var serialConnected = false;

// event timers
var rawRecordTimerID;
var rawRecordTimerMS = 50;
var calRecordTimerID;
var calRecordTimerMS = 50;
var plotTimerID;
var plotTimerMS = 50;

// writes extra info to the console if true
var dbgInfo = true;

// the last IOLab command record selected
var current_cmd = "none";

// the last IOLab fixed config selected
var current_config = "none";
var current_config_code;

// stuff for processing raw records
var ncalls = 0;
var n_rectype = new Array(200).fill(0);

// this holds the last ACK info
var ackCommand;
var nAck = 0;

// this holds the last NACK info
var nackCommand;
var nackReason;
var nNack = 0;

// these hold the dongle info
var dongleFirmwareVersion = 0;
var dongleStatus = 0;
var dongleID = 0; 
var nGetDongleStatus = 0;

// these hold the remote info
var remoteSensorFirmwareVersion = [0,0];
var remoteRadioFirmwareVersion = [0,0];
var remoteStatus = [0,0];
var remoteBattery = [0,0]; // raw batteryvoltage 
var remoteVoltage = [0,0]; // calibrated voltage 
var nGetRemoteStatus = 0;

// these hold the RF connection info
var remoteRFstatus = [0,0];
var nRFconnection = 0;

// these hold the pairing info
var remote1Status = 0, remote2Status = 0;
var remote1ID = 0, remote2ID = 0;
var nGetPairing = 0;

// these hold the data packet configuration info
var nSensor = [0,0];
var sensorArray = [[],[]];
var lengthArray = [[],[]];
var lengthBySensor;
var nGetPacketConfig = 0;

// these hold the fixed configuration info
var fixedConfig = [0,0];
var iolabConfigIndex;
var nGetFixedConfig = 0

// data record info
var nDataFromRemote = 0;
var bytesReceived = 0;
var timeElapsed = 0;
var lastFrame = -1;
var elapsedFrame = -1;

// rxdata holds all data received from serial port. 
// writePointer points to the end of this array, and 
// readPointer is used by extractRecords() to keep track 
// of where we are currently unpacking these data
var rxdata = [];
var writePointer = 0;
var readPointer = 0;

// raw unpacked data indexed by sensor number. Filled by processDataRecord().
// rawReadPtr is used by buildAndCalibrate() to keep track of where we are
var rawData = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var rawReadPtr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// calibrated data indexed by sensor number. Filled by buildAndCalibrate() and 
// used by plottong code along with calWritePtr and calReadPtr
var calData = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var calWritePtr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var calReadPtr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// sensors (numbering is the same as win/mac application):
// number name
//  0     rssi 
//  1     accelerometer 
//  