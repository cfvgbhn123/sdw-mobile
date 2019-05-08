/**
 *
 * 换算开服模块的时间文案
 *
 * @param time
 * @param baseTime
 * @param isPrv
 *
 * isPrv[false]   最多显示开服24小时
 * 已开服12小时  已开服06-21
 *
 * isPrv[true]   最多显示预计服（今明两天）
 * 今日12:00     明日23:30
 */
var TransServerDate = function (time, baseTime, isPrv) {

    // console.log('=========================');
    // console.log(time, baseTime, isPrv);
    // console.log(new Date(time));
    // console.log(new Date(baseTime));

    this.time = time || +new Date();
    this.baseTime = baseTime || time;
    this.isPrv = isPrv;
    this.hourSeconds = 60 * 60 * 1000;

    // 判断是否超过多少天
    this.differDay = function (differ) {

        // 基于服务器时间进行归零设置
        var timeStamp = +new Date(new Date(this.baseTime).setHours(0, 0, 0, 0));
        var endStamp = timeStamp + (differ * 24 * this.hourSeconds);

        // 判断时间段
        return (this.time >= timeStamp && this.time < endStamp);
    };

    // 超过的时间数量（小时）
    this.hasExceedTime = function (differ, type) {

        var differTime = this.baseTime - this.time;

        if (type === 'hour') return differTime < differ * this.hourSeconds;

        return false;
    };

    // 按类型进行格式化
    this.formatStr = function (type) {

        var oTime = new Date(this.time),
            fStr = null, lStr = null, split = '';

        // console.log(this.time, oTime, type);

        if (type === 'time') {
            fStr = oTime.getHours();
            lStr = oTime.getMinutes();
            split = ':';
        }

        if (type === 'day') {
            fStr = oTime.getMonth() + 1;
            lStr = oTime.getDate();
            split = '-';
        }

        if (type === 'hour') {
            // 需要换算时间 开服与服务器的时间差
            var differ = this.baseTime - this.time;
            return (differ / this.hourSeconds >> 0);
        }

        if (fStr !== null && lStr !== null) {
            if (fStr < 10) fStr = '0' + fStr;
            if (lStr < 10) lStr = '0' + lStr;
            return fStr + split + lStr;
        }

        return false;
    };

    // 格式化时间的文案
    this.formatDate = function () {

        // 预计开服
        if (this.isPrv) {

            // 判断是否是今天
            if (this.differDay(1)) return '今日' + this.formatStr('time');

            // 判断是否是明天
            if (this.differDay(2)) return '明日' + this.formatStr('time');
        }

        // 已经开服
        if (this.hasExceedTime(24, 'hour')) {

            var openHour = this.formatStr('hour');

            if (openHour === 0) {
                return '新开服';
            }

            return '已开服' + openHour + '小时';
        }

        return false;
    };


    // 返回结果
    return this.formatDate();

};


module.exports = TransServerDate;