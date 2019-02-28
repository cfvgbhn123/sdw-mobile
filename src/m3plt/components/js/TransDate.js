/**
 * Created by CHEN-BAO-DENG on 2017/8/14 0014.
 */


function transDate(date) {

    window.NOW_TIME = window.NOW_TIME || +new Date();

    var obj = new Date(date), dT = window.NOW_TIME - date,
        month = obj.getMonth() + 1, day = obj.getDate();

    if (dT < 24 * 60 * 60 * 1000) {
        if (dT < 60 * 60 * 1000) {

            if (dT < 0) return '刚刚玩过';

            if (dT < 60 * 1000) return (dT / 1000 >> 0) + '秒前';

            return (dT / ( 60 * 1000) >> 0) + '分前';
        }
        return (dT / ( 60 * 60 * 1000) >> 0) + '时前';
    }

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return month + '-' + day;
}


module.exports = transDate;