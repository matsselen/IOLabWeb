// 
// This code are used for data nalysis
//      class StatsIOLab

'use strict';

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
class StatsIOLab {
    constructor(parentThis, sensor, trace) {

        let analThis = this;         // save "this" to use in callback routines
        this.parentThis = parentThis;   // this of caller
        this.sensor = sensor;
        this.trace = trace;

        this.Sx = 0;
        this.Sxx = 0;
        this.Sy = 0;
        this.Syy = 0;
        this.Sxy = 0;
        this.N = 0;

        this.mean = 0;
        this.sigma = 0;
        this.slope = 0;
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