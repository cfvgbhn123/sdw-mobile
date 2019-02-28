/**
 * Created by CHEN-BAO-DENG on 2017/7/4 0004.
 *
 * 闪电玩在口袋中打开，获取奖励功能
 *
 * 基于闪电玩，每天只发送一次，客户端做限制处理
 *
 */

function KDReward() {

    if (!SDW_WEB.onKD) return;

    var kdUser = SDW_WEB.Store.get('kd_user');

    if (!kdUser) return;

    var _cacheKey = 'KDReward_date_' + kdUser.uid;

    if (checkDate()) {

        var url = SDW_WEB.URLS.addParam({
            id: SDW_WEB.channel,
            uid: kdUser.uid,
            token: kdUser.token,
            secheme: kdUser.secheme,
            // }, false, 'http://192.168.110.79:8061/?op=opensdwreward');
        }, false, 'http://shop-app.m3guo.com/?op=opensdwreward');

        SDW_WEB.getAjaxData(url, function (data) {

            if (data.result == 1) {
                // 对当前的时间进行存储
                SDW_WEB.Store.set(_cacheKey, +new Date(), true);
            }

        });

    } else {

    }

    /**
     * 检查是否当日可发送
     * @returns {boolean}
     */
    function checkDate() {

        var cacheDate = SDW_WEB.Store.get(_cacheKey, true);

        var oNowDate = new Date();

        if (cacheDate) {

            var oCacheDate = new Date(cacheDate);

            return !(oCacheDate.getFullYear() === oNowDate.getFullYear() &&
            oCacheDate.getMonth() === oNowDate.getMonth() &&
            oCacheDate.getDate() === oNowDate.getDate());
        }

        return true;
    }

}

module.exports = KDReward;
