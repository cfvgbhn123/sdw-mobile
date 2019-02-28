/**
 * Created by CHEN-BAO-DENG on 2018/2/12 0012.
 */


var angle = {
    maxAngle: 30,
    minAngle: 15,
    length: 8,
    radius: 10,
    start: 180,
    maxA: 270,
    compute: function () {
        var info = {}, point = [];
        var space = this.maxA / this.length;
        space = Math.min(space, this.maxAngle);
        space = Math.max(space, this.minAngle);
        info.space = space;
        var disAngle = space * (this.length - 1);
        info.disAngle = disAngle;
        var rotate = 90 - disAngle / 2;
        info.rotate = rotate;
        point.push(this.start - rotate);
        for (var i = 1; i < this.length; i++) {
            point.push(point[i - 1] - space);
        }
        info.point = point;
        console.log(JSON.stringify(info));
    }
};

angle.compute();