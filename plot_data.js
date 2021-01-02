
// plots new data
function plotNewData() {

  // plot data from whatever sensors are selected

  // right now just the accelerometer:
  plotNewAccelerometerData();

}

// plots new accelerometer data
function plotNewAccelerometerData() {

  //retrieve canvas layers
  var canvx = document.getElementById(accCsIDx);
  var canvy = document.getElementById(accCsIDy);
  var canvz = document.getElementById(accCsIDz);

  //retrieve contexts for each layer
  var ctx = canvx.getContext("2d");
  var cty = canvy.getContext("2d");
  var ctz = canvz.getContext("2d");

  // line colors
  ctx.strokeStyle = "#FF0000";
  cty.strokeStyle = "#0000FF";
  ctz.strokeStyle = "#00AA00";

  // the size of all layers should be the same
  var cWidth = canvx.width;
  var cHeight = canvx.height;

  var sensorID = 1;

  if(calReadPtr[sensorID] < calData[sensorID].length) {

    var px = [];
    var py = []; 
    var pz = [];

    ctx.beginPath();
    cty.beginPath();
    ctz.beginPath();

    // figure out where to start
    if(accLast[0] < 0){
      var td = calData[sensorID][calReadPtr[sensorID]][0];
      var xd = calData[sensorID][calReadPtr[sensorID]][1];
      var yd = calData[sensorID][calReadPtr[sensorID]][2];
      var zd = calData[sensorID][calReadPtr[sensorID]][3];
      px = datToPix(td,xd,cWidth,cHeight);
      py = datToPix(td,yd,cWidth,cHeight);
      pz = datToPix(td,zd,cWidth,cHeight);  
    } else {
      var tstart =  accLast[0] % accSpan[0];
      px = datToPix(tstart,accLast[1],cWidth,cHeight);
      py = datToPix(tstart,accLast[2],cWidth,cHeight);
      pz = datToPix(tstart,accLast[3],cWidth,cHeight);
    }

    ctx.moveTo(px[0], px[1]);
    cty.moveTo(px[0], py[1]);
    ctz.moveTo(px[0], pz[1]);

    var tpLast = -1;
    for (let ind = calReadPtr[sensorID]; ind < calData[sensorID].length; ind++){

      var tplot = calData[sensorID][ind][0] % accSpan[0];

      if(tplot < tpLast){

        // draw the current line before wrapping
        ctx.stroke();
        cty.stroke();
        ctz.stroke();
        
        // clear canvas before wrapping
        ctx.clearRect(0, 0, cWidth, cHeight);
        cty.clearRect(0, 0, cWidth, cHeight);
        ctz.clearRect(0, 0, cWidth, cHeight);

        px = datToPix(tplot,calData[sensorID][ind][1],cWidth,cHeight);
        py = datToPix(tplot,calData[sensorID][ind][2],cWidth,cHeight);
        pz = datToPix(tplot,calData[sensorID][ind][3],cWidth,cHeight);

        ctx.beginPath();
        cty.beginPath();
        ctz.beginPath();
    
        ctx.moveTo(px[0], px[1]);
        cty.moveTo(py[0], py[1]);
        ctz.moveTo(pz[0], pz[1]);
          
      } else {

        

        px = datToPix(tplot,calData[sensorID][ind][1],cWidth,cHeight);
        py = datToPix(tplot,calData[sensorID][ind][2],cWidth,cHeight);
        pz = datToPix(tplot,calData[sensorID][ind][3],cWidth,cHeight);
        ctx.lineTo(px[0], px[1]);
        cty.lineTo(py[0], py[1]);
        ctz.lineTo(pz[0], pz[1]);

      }

      tpLast = tplot;


    }
    ctx.stroke();
    cty.stroke();
    ctz.stroke();

    calReadPtr[sensorID] = calData[sensorID].length;
    accLast[0] = calData[sensorID][calData[sensorID].length-1][0];
    accLast[1] = calData[sensorID][calData[sensorID].length-1][1];
    accLast[2] = calData[sensorID][calData[sensorID].length-1][2];
    accLast[3] = calData[sensorID][calData[sensorID].length-1][3];
  
  }
}

//--------------------- plot utility code -------------------------

// returns pixel coordinates when passed plot coordinates
function datToPix(tDat,yDat,cWidth,cHeight){
  var xPix = (tDat/accSpan[0])*cWidth;
  var yPix = cHeight - ((yDat-accSpan[1])/(accSpan[2]-accSpan[1]))*cHeight;
  return [xPix,yPix];
}