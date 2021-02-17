// 
// This code are used for data nalysis
//      class StatsIOLab

'use strict';

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class StatsIOLab {
    constructor(sensor, trace) {

        this.sensor = sensor;           // calData sensor number
        this.trace = trace;             // trace number (counts from 1)

        this.Sx = 0;
        this.Sxx = 0;
        this.Sy = 0;
        this.Syy = 0;
        this.Sxy = 0;
        this.N = 0;

        this.mean = 0;
        this.sigma = 0;
        this.slope = 0;
        this.intercept = 0;
        this.rxy = 0;
        this.timeRange = 0;
        this.area = 0;

        this.indFirstCalc = -1;
        this.indLastCalc = -1;

    }

    calcStats(indFirst, indLast) {

        if (indFirst != this.indFirstCalc || indLast != this.indLastCalc) {
            this.zeroSums();

            for (let ind = indFirst; ind < indLast; ind++) {
                let x = calData[this.sensor][ind][0];
                let y = calData[this.sensor][ind][this.trace];
                this.Sx  += x;
                this.Sxx += x*x;
                this.Sy  += y;
                this.Syy += y*y;
                this.Sxy += x*y;
                this.N   += 1;
            }

            let aveX  = this.Sx/this.N;
            let aveXX = this.Sxx/this.N;
            let aveY  = this.Sy/this.N;
            let aveYY = this.Syy/this.N;
            let aveXY = this.Sxy/this.N;

            let sigX = Math.pow((aveXX - aveX*aveX),0.5);
            let sigY = Math.pow((aveYY - aveY*aveY),0.5);
            let covXY = aveXY - aveX*aveY;

            this.mean = aveY;
            this.sigma = sigY;
            this.slope = covXY/(sigX*sigX);
            this.intercept = aveY - this.slope*aveX;
            this.rxy = covXY/(sigX*sigY);

            this.timeRange = calData[this.sensor][indLast][0] - calData[this.sensor][indFirst][0];
            this.area = this.mean*this.timeRange;

            // remember the limits so we dont do this again needlessly
            this.indFirstCalc = indFirst;
            this.indLastCalc = indLast;
        }
    }

    zeroSums() {
        this.Sx = 0;
        this.Sxx = 0;
        this.Sy = 0;
        this.Syy = 0;
        this.Sxy = 0;
        this.N = 0;
    }
}