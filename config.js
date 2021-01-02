var iolabConfig =
{
  "version": "1.1.0",
  "powerOffDelay": "300",
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
      "sensors": [{ "sensorKey": 3, "sampleRate": 380 }]
    },
    {
      "code": 2,
      "desc": "Accelerometer",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 1, "sampleRate": 400 }]
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
      ]
    },
    {
      "code": 4,
      "desc": "Mini-motion",
      "highSpeed": false,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 8, "sampleRate": 200 },
        { "sensorKey": 9, "sampleRate": 100 }
      ]
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
      ]
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
      ]
    },
    {
      "code": 7,
      "desc": "ECG (requires plugin)",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 10, "sampleRate": 400 }]
    },
    {
      "code": 8,
      "desc": "Header 3V",
      "highSpeed": false,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 12, "sampleRate": 200 },
        { "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 },
        { "sensorKey": 22, "sampleRate": 100 },
        { "sensorKey": 23, "sampleRate": 100 }
      ]
    },
    {
      "code": 9,
      "desc": "Microphone",
      "highSpeed": false,
      "frequencies": [1200, 2400],
      "sensors": [{ "sensorKey": 6, "sampleRate": 2400 }]
    },
    {
      "code": 10,
      "desc": "Magnetic",
      "highSpeed": false,
      "frequencies": [100, 200, 400],
      "sensors": [
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 12, "sampleRate": 400 }
      ]
    },
    {
      "code": 32,
      "desc": "Gyroscope (HS)",
      "highSpeed": true,
      "frequencies": [800],
      "sensors": [{ "sensorKey": 3, "sampleRate": 760 }]
    },
    {
      "code": 12,
      "desc": "Header 3V3",
      "highSpeed": false,
      "priority": 10,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 12, "sampleRate": 200 },
        { "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 },
        { "sensorKey": 22, "sampleRate": 100 },
        { "sensorKey": 23, "sampleRate": 100 }
      ]
    },
    {
      "code": 33,
      "desc": "Accelerometer (HS)",
      "highSpeed": true,
      "frequencies": [800],
      "sensors": [{ "sensorKey": 1, "sampleRate": 800 }]
    },
    {
      "code": 34,
      "desc": "Orientation (HS)",
      "highSpeed": true,
      "frequencies": [100, 200, 400],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 400 },
        { "sensorKey": 2, "sampleRate": 80 },
        { "sensorKey": 3, "sampleRate": 190 }
      ]
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
      ]
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
      ]
    },
    {
      "code": 37,
      "desc": "Pendulum (HS)",
      "highSpeed": true,
      "frequencies": [100, 200],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 200 },
        { "sensorKey": 3, "sampleRate": 190 },
        { "sensorKey": 8, "sampleRate": 200 }
      ]
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
        { "sensorKey": 13, "sampleRate": 100 },
        { "sensorKey": 21, "sampleRate": 100 }
      ]
    },
    {
      "code": 39,
      "desc": "Microphone (HS)",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 6, "sampleRate": 4800 }]
    },
    {
      "code": 40,
      "desc": "Ambient Light (HS)",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 7, "sampleRate": 4800 }]
    },
    {
      "code": 41,
      "desc": "Ambient Light & Accel (HS)",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 800 },
        { "sensorKey": 7, "sampleRate": 800 }
      ]
    },
    {
      "code": 42,
      "desc": "Force Gauge & Accel (HS)",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [
        { "sensorKey": 1, "sampleRate": 800 },
        { "sensorKey": 8, "sampleRate": 800 }
      ]
    },
    {
      "code": 43,
      "desc": "Ambient Light & Micro (HS)",
      "highSpeed": true,
      "frequencies": [1200, 2400],
      "sensors": [
        { "sensorKey": 6, "sampleRate": 2400 },
        { "sensorKey": 7, "sampleRate": 2400 }
      ]
    },
    {
      "code": 44,
      "desc": "Electrocardiograph (HS)",
      "highSpeed": true,
      "frequencies": [200, 400, 800],
      "sensors": [{ "sensorKey": 10, "sampleRate": 800 }]
    },
    {
      "code": 45,
      "desc": "High Gain (HS)",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 12, "sampleRate": 4800 }]
    },
    {
      "code": 46,
      "desc": "Force Gauge (HS)",
      "highSpeed": true,
      "frequencies": [2400, 4800],
      "sensors": [{ "sensorKey": 8, "sampleRate": 4800 }]
    },
    {
      "code": 47,
      "desc": "ECG & Analog",
      "highSpeed": true,
      "frequencies": [100, 200, 400],
      "sensors": [{ "sensorKey": 241, "sampleRate": 400 }]
    }
  ],
  "sensors": [
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
      "autoScaleY": false
    },
    {
      "code": 4,
      "desc": "Barometer",
      "shortDesc": "Baro",
      "label": "P",
      "unit": "kPa",
      "legends": ["Pressure"],
      "scales": [0, 120],
      "autoScaleY": false
    },
    {
      "code": 6,
      "desc": "Microphone",
      "shortDesc": "Micro",
      "label": "Intensity",
      "unit": "",
      "legends": ["Intensity"],
      "scales": [0, 10],
      "fftThreshold": 25,
      "autoScaleY": false
    },
    {
      "code": 7,
      "desc": "Light",
      "shortDesc": "Light",
      "label": "Intensity",
      "unit": "",
      "legends": ["Intensity"],
      "scales": [0, 10],
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
      "autoScaleY": false
    },
    {
      "code": 9,
      "desc": "Wheel",
      "shortDesc": "Wheel",
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
      "shortDesc": "Ana 1/2/3",
      "label": "A",
      "unit": "V",
      "legends": ["A1", "A2", "A3"],
      "pathColors": ["#BB0000", "#0000BB", "#008800"],
      "scales": [-0.5, 3.7],
      "autoScaleY": false
    },
    {
      "code": 11,
      "desc": "Battery",
      "shortDesc": "Bat",
      "label": "T",
      "unit": "V",
      "legends": ["Battery"],
      "scales": [0, 4],
      "autoScaleY": false
    },
    {
      "code": 12,
      "desc": "High Gain",
      "shortDesc": "HG",
      "label": "A",
      "unit": "mV",
      "legends": ["Voltage"],
      "scales": [-1, 1],
      "autoScaleY": false
    },
    {
      "code": 13,
      "desc": "Digital",
      "shortDesc": "Digi",
      "scales": [0, 5],
      "autoScaleY": false
    },
    {
      "code": 21,
      "desc": "Analog 7",
      "shortDesc": "Ana7",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "scales": [-0.5, 3.7],
      "autoScaleY": false
    },
    {
      "code": 22,
      "desc": "Analog 8",
      "shortDesc": "Ana8",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "scales": [-0.5, 3.7],
      "autoScaleY": false
    },
    {
      "code": 23,
      "desc": "Analog 9",
      "shortDesc": "Ana9",
      "label": "A",
      "unit": "V",
      "legends": ["Voltage"],
      "scales": [-0.5, 3.7],
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
      "autoScaleY": false
    },
    {
      "code": 241,
      "desc": "Electrocardiogram (9)",
      "shortDesc": "ECG9",
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
