/**
 * Created by Administrator on 2017/2/4.
 *
 * selectFrom(low,up) => Number
 *
 */

var MATH = {};

/**
 * 从low到up中随机选择一个数，并返回
 *
 * @param  low {Number}
 * @param  up  {Number}
 *
 * @return {Number}
 *
 */
MATH.selectFrom = function (low, up) {

    t = up - low + 1;
    return (Math.random() * t + low) >> 0;

};


if (typeof module == 'undefined') {
    module = {};
}
module.exports = MATH;