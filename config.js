// MIT License
// Copyright (c) 2021 Mats Selen
// ---------------------------------

var iolabConfig =
{
  "version": "1.1.0",
  "powerOffDelay": 300,
  "chartMeanParameters": {
    "duration": 0.5,
    "numberOfDigits": 2
  },
  "fixedConfigurations": [
    {
      "code": 1,
      "desc": "Gyroscope",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 3, "sampleRate": 380 }],
      "chartList": [3]
    },
    {
      "code": 2,
      "desc": "Accelerometer",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 1, "sampleRate": 400 }],
      "chartList": [1]
    },
    {
      "code": 3,
      "desc": "Orientation",
      "highSpeed": false,
      "frequencies": [100],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 100 },
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 3, "sampleRate": 95 },
        { "sensorKey": 12, "sampleRate": 100 }
      ],
      "chartList": [1,2,3,12]
    },
    {
      "code": 4,
      "desc": "Mini Motion",
      "highSpeed": false,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 8, "sampleRate": 200 },
        { "sensorKey": 9, "sampleRate": 100 }
      ],
      "chartList": [1,8,15,16,17]
    },
    {
      "code": 5,
      "desc": "Pendulum",
      "highSpeed": false,
      "frequencies": [100],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 100 },
        { "sensorKey": 3, "sampleRate": 95 },
        { "sensorKey": 8, "sampleRate": 100 }
      ],
      "chartList": [1,3,8]
    },
    {
      "code": 6,
      "desc": "Ambient",
      "highSpeed": false,
      "frequencies": [50, 100, 200, 400],
      "sensors": [
        { "sensorKey": 4, "sampleRate": 100 },
        { "sensorKey": 7, "sampleRate": 400 },
        { "sensorKey": 11, "sampleRate": 50 },
        { "sensorKey": 26, "sampleRate": 50 }
      ],
      "chartList": [4,7,11,26]
    },
    // {
    //   "code": 7,
    //   "desc": "ECG (requires plugin)",
    //   "highSpeed": false,
    //   "frequencies": [100, 200, 400],
    //   "sensors": [{ "sensorKey": 10, "sampleRate": 400 }]
    // },
    {
      "code": 8,
      "desc": "Header 3V",
      "highSpeed": false,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 12, "sampleRate": 200 },
        //{ "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 },
        { "sensorKey": 22, "sampleRate": 100 },
        { "sensorKey": 23, "sampleRate": 100 }
      ],
      //"chartList": [12,13,21,22,23]
      "chartList": [12,21,22,23]
    },
    {
      "code": 9,
      "desc": "Microphone",
      "highSpeed": false,
      "frequencies": [1200, 2400],
      "sensors": [{ "sensorKey": 6, "sampleRate": 2400 }],
      "chartList": [6]
    },
    {
      "code": 10,
      "desc": "Magnetic",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 12, "sampleRate": 400 }
      ],
      "chartList": [2,12]
    },
    {
      "code": 12,
      "desc": "Header 3V3",
      "highSpeed": false,
      "priority": 10,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 12, "sampleRate": 200 },
        //{ "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 },
        { "sensorKey": 22, "sampleRate": 100 },
        { "sensorKey": 23, "sampleRate": 100 }
      ],
      //"chartList": [12,13,21,22,23]
      "chartList": [12,21,22,23]
    },
    {
      "code": 32,
      "desc": "Gyroscope HS",
      "highSpeed": true,
      "frequencies": [800],
      "sensors": [{ "sensorKey": 3, "sampleRate": 760 }],
      "chartList": [3]
    },
    {
      "code": 33,
      "desc": "Accelerometer HS",
      "highSpeed": true,
      "frequencies": [800],
      "sensors": [{ "sensorKey": 1, "sampleRate": 800 }],
      "chartList": [1]
    },
    {
      "code": 34,
      "desc": "Orientation HS",
      "highSpeed": true,
      "frequencies": [100, 200, 400],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 400 },
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 3, "sampleRate": 190 }
      ],
      "chartList": [1,2,3]
    },
    {
      "code": 35,
      "desc": "Motion",
      "highSpeed": true,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 3, "sampleRate": 190 },
        { "sensorKey": 8, "sampleRate": 200 },
        { "sensorKey": 9, "sampleRate": 100 }
      ],
      "chartList": [1,3,8,15,16,17]
    },
    {
      "code": 36,
      "desc": "Sports",
      "highSpeed": true,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 3, "sampleRate": 190 },
        { "sensorKey": 10, "sampleRate": 200 }
      ],
      "chartList": [1,2,3,10]
    },
    {
      "code": 37,
      "desc": "Pendulum HS",
      "highSpeed": true,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 3, "sampleRate": 190 },
        { "sensorKey": 8, "sampleRate": 200 }
      ],
      "chartList": [1,3,8]
    },
    {
      "code": 38,
      "desc": "Kitchen Sink",
      "highSpeed": true,
      "frequencies": [100],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 100 },
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 3, "sampleRate": 95 },
        { "sensorKey": 4, "sampleRate": 100 },
        { "sensorKey": 7, "sampleRate": 100 },
        { "sensorKey": 8, "sampleRate": 100 },
        { "sensorKey": 9, "sampleRate": 100 },
        { "sensorKey": 11, "sampleRate": 100 },
        { "sensorKey": 12, "sampleRate": 100 },
        //{ "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 }
      ],
      //"chartList": [1,2,3,4,7,8,15,16,17,11,12,13,21]
      "chartList": [1,2,3,4,7,8,15,16,17,11,12,21]
    },
    {
      "code": 39,
      "desc": "Microphone HS",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 6, "sampleRate": 4800 }],
      "chartList": [6]
    },
    {
      "code": 40,
      "desc": "Light HS",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 7, "sampleRate": 4800 }],
      "chartList": [7]
    },
    {
      "code": 41,
      "desc": "Light Accel HS",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 800 },
        { "sensorKey": 7, "sampleRate": 800 }
      ],
      "chartList": [1,7]
    },
    {
      "code": 42,
      "desc": "Force Accel HS",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 800 },
        { "sensorKey": 8, "sampleRate": 800 }
      ],
      "chartList": [1,8]
    },
    {
      "code": 43,
      "desc": "Light Microphone HS",
      "highSpeed": true,
      "frequencies": [1200, 2400],
      "sensors": [
        { "sensorKey": 6, "sampleRate": 2400 },
        { "sensorKey": 7, "sampleRate": 2400 }
      ],
      "chartList": [6,7]
    },
    {
      "code": 44,
      "desc": "A1 A2 A3",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [{ "sensorKey": 10, "sampleRate": 800 }],
      "chartList": [10]
    },
    {
      "code": 45,
      "desc": "High Gain HS",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 12, "sampleRate": 4800 }],
      "chartList": [12]
    },
    {
      "code": 46,
      "desc": "Force HS",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 8, "sampleRate": 4800 }],
      "chartList": [8]
    },
    // {
    //   "code": 47,
    //   "desc": "ECG & Analog",
    //   "highSpeed": true,
    //   "frequencies": [100, 200, 400],
    //   "sensors": [{ "sensorKey": 241, "sampleRate": 400 }]
    // },
    {
      "code": 48,
      "desc": "ECG6",
      "highSpeed": true,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 27, "sampleRate": 400 }],
      "chartList": [31,32,33,34,35,36,37,38,39]
    },
    {
      "code": 49,
      "desc": "ECG6 HS",
      "sensors": [{ "sensorKey": 27, "sampleRate": 800 }],
      "chartList": [31,32,33,34,35,36,37,38,39]
    }
  ],
  "sensors": [
    {
      "code": 0,
      "desc": 'RSSI',
      "shortDesc": 'RSSI',
      "label": 'Sig Str',
      "legends": ['Signal strength'],
      "pathColors": ["#0000BB"],
      "scales": [0, 100],
      "zeroable": false,
      "autoScaleY": false
    },    
    {
      "code": 1,
      "desc": "Accelerometer",
      "shortDesc": "Accel",
      "label": "a",
      "unit": "m/s²",
      "legends": ["Ax", "Ay", "Az"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-20, 20],
      "minScalingRate": 5,
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 2,
      "desc": "Magnetometer",
      "shortDesc": "Magn",
      "label": "B",
      "unit": "µT",
      "legends": ["Bx", "By", "Bz"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-150, 150],
      "minScalingRate": 5,
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 3,
      "desc": "Gyroscope",
      "shortDesc": "Gyro",
      "label": "ω",
      "unit": "rad/s",
      "legends": ["ωx", "ωy", "ωz"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-20, 20],
      "minScalingRate": 5,
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 4,
      "desc": "Barometer",
      "shortDesc": "Baro",
      "label": "P",
      "unit": "kPa",
      "legends": ["Pressure"],
      "pathColors": ["#0000BB"],
      "scales": [0, 120],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 6,
      "desc": "Microphone",
      "shortDesc": "Microphone",
      "label": "Intensity",
      "unit": "",
      "legends": ["Intensity"],
      "pathColors": ["#0000BB"],
      "scales": [0, 10],
      "fftThreshold": 25,
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 7,
      "desc": "Light",
      "shortDesc": "Light",
      "label": "Intensity",
      "unit": "",
      "legends": ["Intensity"],
      "pathColors": ["#0000BB"],
      "scales": [0, 10],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 8,
      "desc": "Force",
      "shortDesc": "Force",
      "label": "Fᵧ",
      "unit": "N",
      "legends": ["Fᵧ"],
      "pathColors": ["#0000BB"],
      "scales": [-5, 5],
      "zeroable": true,
      "autoScaleY": false
    },
    {
      "code": 9,
      "desc": "Wheel",
      "shortDesc": "Wheel",
      "legends": ["displacement", "velocity", "acceleration"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-2, 2],
      "subCharts": [
        {
          "desc": "Position",
          "label": "rᵧ",
          "unit": "m",
          "legends": ["rᵧ"],
          "autoScaleY": false,
          "pathColors": ["#BB0000"],
          "scales": [-2, 2]
        },
        {
          "desc": "Velocity",
          "label": "vᵧ",
          "unit": "m/s",
          "legends": ["vᵧ"],
          "autoScaleY": false,
          "pathColors": ["#008800"],
          "scales": [-3, 3]
        },
        {
          "desc": "Acceleration",
          "label": "aᵧ",
          "unit": "m/s²",
          "legends": ["aᵧ"],
          "autoScaleY": false,
          "pathColors": ["#0000BB"],
          "scales": [-30, 30]
        }
      ],
      "timeAverageIdx": 2,
      "reverseAxis": false
    },
    {
      "code": 10,
      "desc": "Analog 1/2/3",
      "shortDesc": "A1/A2/A3",
      "label": "A",
      "unit": "V",
      "legends": ["A1", "A2", "A3"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-0.5, 3.7],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 11,
      "desc": "Battery",
      "shortDesc": "Bat",
      "label": "T",
      "unit": "V",
      "legends": ["Battery"],
      "pathColors": ["#0000BB"],
      "scales": [0, 4],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 12,
      "desc": "High Gain",
      "shortDesc": "HG",
      "label": "A",
      "unit": "mV",
      "legends": ["Voltage"],
      "pathColors": ["#0000BB"],
      "scales": [-1.5, 1.5],
      "zeroable": true,
      "autoScaleY": false
    },
    {
      "code": 13,
      "desc": "Digital",
      "shortDesc": "Digi",
      "legends": ["Voltage"],
      "pathColors": ["#0000BB"],
      "scales": [0, 5],
      "zeroable": false,
      "autoScaleY": false
    },
    {// calculated sensor (derived from sensor 9)
      "code": 15,
      "desc": "Wheel Position",
      "shortDesc": "Wheel (rᵧ)",
      "legends": ["rᵧ"],
      "pathColors": ["#BB0000"],
      "scales": [-2, 2],
      "zeroable": true,
      "unit": "m"
    },
    {// calculated sensor (derived from sensor 9)
      "code": 16,
      "desc": "Wheel Velocity",
      "shortDesc": "Wheel (vᵧ)",
      "legends": ["vᵧ"],
      "pathColors": ["#008800"],
      "scales": [-3, 3],
      "zeroable": false,
      "unit": "m/s"
    },
    {// calculated sensor (derived from sensor 9)
      "code": 17,
      "desc": "Wheel Acceleration",
      "shortDesc": "Wheel (aᵧ)",
      "legends": ["aᵧ"],
      "pathColors": ["#0000BB"],
      "scales": [-20, 20],
      "zeroable": false,
      "unit": "m/s²"
    },
    {
      "code": 21,
      "desc": "Analog 7",
      "shortDesc": "A7",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "pathColors": ["#0000BB"],
      "scales": [-0.5, 3.7],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 22,
      "desc": "Analog 8",
      "shortDesc": "A8",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "pathColors": ["#0000BB"],
      "scales": [-0.5, 3.7],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 23,
      "desc": "Analog 9",
      "shortDesc": "A9",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "pathColors": ["#0000BB"],
      "scales": [-0.5, 3.7],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 26,
      "desc": "Thermometer",
      "shortDesc": "Therm",
      "label": "T",
      "unit": "°C",
      "legends": ["Temp."],
      "pathColors": ["#0000BB"],
      "scales": [0, 40],
      "zeroable": false,
      "autoScaleY": false
    },
    {
      "code": 27,
      "desc": "Electrocardiogram (9)",
      "shortDesc": "ECG",
      "unit": "mV",
      "legends": ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V3", "V6"],
      "pathColors": ["#819263","#3ca13b","#546f6f","#342fdd","#49a6ff","#515095","#c34947","#fa3430","#a73431"],
      "timeAverageIdx": 2,
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 31,
      "desc": "Electrocardiogram",
      "shortDesc": "I",
      "unit": "mV",
      "legends": ["I"],
      "pathColors": ["#819263"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 32,
      "desc": "Electrocardiogram",
      "shortDesc": "II",
      "unit": "mV",
      "legends": ["II"],
      "pathColors": ["#3ca13b"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 33,
      "desc": "Electrocardiogram",
      "shortDesc": "III",
      "unit": "mV",
      "legends": ["III"],
      "pathColors": ["#546f6f"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 34,
      "desc": "Electrocardiogram",
      "shortDesc": "aVR",
      "unit": "mV",
      "legends": ["aVR"],
      "pathColors": ["#342fdd"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 35,
      "desc": "Electrocardiogram",
      "shortDesc": "aVL",
      "unit": "mV",
      "legends": ["aVL"],
      "pathColors": ["#49a6ff"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 36,
      "desc": "Electrocardiogram",
      "shortDesc": "aVF",
      "unit": "mV",
      "legends": ["aVF"],
      "pathColors": ["#515095"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },
    {// calculated sensor (derived from sensor 27)
      "code": 37,
      "desc": "Electrocardiogram",
      "shortDesc": "V1",
      "unit": "mV",
      "legends": ["V1"],
      "pathColors": ["#c34947"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },    
    {// calculated sensor (derived from sensor 27)
      "code": 38,
      "desc": "Electrocardiogram",
      "shortDesc": "V2",
      "unit": "mV",
      "legends": ["V2"],
      "pathColors": ["#fa3430"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },  
    {// calculated sensor (derived from sensor 27)
      "code": 39,
      "desc": "Electrocardiogram",
      "shortDesc": "V3",
      "unit": "mV",
      "legends": ["V3"],
      "pathColors": ["#a73431"],
      "zeroable": false,
      "scales": [-0.5, 0.5],
    },  
    {
      "code": 241,
      "desc": "Electrocardiogram (9-old)",
      "shortDesc": "ECG9-old",
      "unit": "mV",
      "legends": ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V3", "V6"],
      "pathColors": [
        "#819263",
        "#3ca13b",
        "#546f6f",
        "#342fdd",
        "#49a6ff",
        "#515095",
        "#c34947",
        "#fa3430",
        "#a73431"
      ],
      "timeAverageIdx": 2,
      "scales": [-0.5, 0.5],
      "minScalingRate": 5,
      "autoScaleY": true
    }
  ],
  "DACVAlues": [
    { "value": 0, "label": "0.0"},
    { "value": 1, "label": "0.1"},
    { "value": 2, "label": "0.2"},
    { "value": 3, "label": "0.3"},
    { "value": 4, "label": "0.4"},
    { "value": 5, "label": "0.5"},
    { "value": 6, "label": "0.6"},
    { "value": 7, "label": "0.7"},
    { "value": 8, "label": "0.8"},
    { "value": 9, "label": "1.0"},
    { "value": 10, "label": "1.1"},
    { "value": 11, "label": "1.2"},
    { "value": 12, "label": "1.3"},
    { "value": 13, "label": "1.4"},
    { "value": 14, "label": "1.5"},
    { "value": 15, "label": "1.6"},
    { "value": 16, "label": "1.7"},
    { "value": 17, "label": "1.8"},
    { "value": 18, "label": "1.9"},
    { "value": 19, "label": "2.0"},
    { "value": 20, "label": "2.1"},
    { "value": 21, "label": "2.2"},
    { "value": 22, "label": "2.3"},
    { "value": 23, "label": "2.4"},
    { "value": 24, "label": "2.5"},
    { "value": 25, "label": "2.7"},
    { "value": 26, "label": "2.8"},
    { "value": 27, "label": "2.9"},
    { "value": 28, "label": "3.0"},
    { "value": 29, "label": "3.1"},
    { "value": 30, "label": "3.2"},
    { "value": 31, "label": "3.3"}
  ]
}
