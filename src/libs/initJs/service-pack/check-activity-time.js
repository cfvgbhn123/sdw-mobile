/**
 * Created by CHEN-BAO-DENG on 2018/1/26 0026.
 */

function _getTime(year, month, day, hour, minute, second) {
    var startTimeObj = new Date();
    startTimeObj.setFullYear(year);
    startTimeObj.setMonth(month);
    startTimeObj.setDate(day);
    startTimeObj.setHours(hour || 0);
    startTimeObj.setMinutes(minute || 0);
    startTimeObj.setSeconds(second || 0);
    return +startTimeObj;
}


module.exports = function (_s, _e) {
    var now = +new Date();
    var startTime = _getTime(_s[0], _s[1] - 1, _s[2]);  // 时间搓
    var endTime = _getTime(_e[0], _e[1] - 1, _e[2]); // 时间搓
    return (startTime <= now) && (now < endTime);
};
