// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

// Global variables for data acquisition
'use strict';

// current version
var currentVersion = [0,9,9];

// oldest app version whose saved data is compatible with this app
var bcompatVersion = [0,9,8];

// application metadata (included with saved data)
var appMetaData = {
    runSeconds: 0, 
    date: null,
    calAccelConst: null,
    calAccelTime: 0,
    calMagConst: null,
    calMagTime: 0,    
    calGyroConst: null,
    calGyroTime: 0,
    calForceConst: null,
    calForceTime: 0,
    appVersion: currentVersion
};

// plots
var plotSet = null;
var commonCursorTime = null;
var commonCursorMode = true;
var analTime1 = 0;
var analTime2 = 0;
var tStart = 0;
var tStop = 0;

// serial port
var port = null;
var reader = null;
var writer = null;

// run control
var justRestarted = false;
var justTurnedOnRemote = false;
var runningDAQ = false;
var daqConfigured = false;
var serialConnected = false;
var remoteConnected = false;

// timing info (ms)
var startTime = 0;
var stopTime = 0; 
var lastRunTime = 0; 
var totalRunTime = 0;

// event timers
var rawRecordTimerID;
var rawRecordTimerMS = 50;
var calRecordTimerID;
var calRecordTimerMS = 50;
var plotTimerID;
var plotTimerMS = 50;
var tickTimerID;
var tickTimerMS = 1000;
var fixedRunTimerID;

// various tick timers (1 tick = 1 second)
var totalTicks = 0;
var idleTicks = 0;
var idleIncrement = 0;
var idleTimeoutCount = 300;

// useful expert tools
var dbgInfo = false;
//var dbgInfo = true;
var showCommands = false;
var nDebug = 0;

// the last IOLab command record selected
var current_cmd = "none";

// configuration info
var maxSensorCode = 40;
var maxConfigCode = 50;
var fixedConfigList = new Array(maxConfigCode).fill(0);
var sensorInfoList  = new Array(maxSensorCode).fill(0);
var current_config = "none";
var current_config_code;
var currentFCobject = null;
var sensorIDlist = [];
var sensorRateList = [];
//var chartIDlist = [];


// keep track of raw data records
var ncalls = 0;
var n_rectype = new Array(250).fill(0);

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

// barometert calibration
var nGetCalibration = 0;
var rawBarometerA0 = 0;
var rawBarometerB1 = 0;
var rawBarometerB2 = 0;
var rawBarometerC12 = 0;
var calA0, calB1, calB2, calC12;
var baromConstCalculated = false;

// thermometer calibration
var rawThermometerC85 = 0;
var rawThermometerC30 = 0;


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
// (initialized in resetAcquisition())
var rawData = null;
var rawReadPtr = null;

// adcData is decoded raw data that has not had calibration constants applied
// useful for calibration for now is only used for calibrated sensors 1,2,3,8 (acc,mag,gyro,force) 
var adcData = null;

// calibrated data indexed by sensor number. Filled by buildAndCalibrate() and 
// used by plottong code along with calWritePtr and calReadPtr
// (initialized in resetAcquisition())
var calData = null;
var calWritePtr = null;
var calReadPtr = null;



// wheel data
var rWheel = 0;
var vWheel = 0;
var aWheel = 0;