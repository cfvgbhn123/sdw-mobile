/**
 * Created by CHEN-BAO-DENG on 2017/11/23 0023.
 */

/**
 *  统计游戏在线时长的
 */
var PlaySdwGameTimeManager = {

    _key: 'playGameTime',

    postAjaxData: function (url, data, callback) {

        var xhr = SDW_WEB.createXMLHTTPRequest();

        if (xhr) {

            xhr.open("POST", url, true);

            xhr.onerror = function () {
                dialog.show('error', '[Ajax Error]，请检查网络接口', 1);
            };

            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                }
            };

            xhr.send(JSON.stringify(data));
        }

    },

    start: function (id) {

        this.gameId = id;
        this.startTime = +new Date();

        // 如果有本地的游戏时间数据，进行上报
        var data = SDW_WEB.Store.get(this._key, true);
        SDW_WEB.Store.set(this._key, {
            startTime: this.startTime,
            gameId: this.gameId,
        }, true);

        if (data && SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid)
            this.uploadData(data);

        if (id)
            this.timer();
    },

    uploadData: function (data) {

        var postData = {
            appid: data.gameId,
            start: data.startTime,
            end: data.time
        };

        postData.sign = SDW_WEB.MD5('' + data.gameId + SDW_WEB.USER_INFO.uid + SDW_WEB.channel + data.startTime + data.time + '19666419c828842887b7294025667d79');

        var pObj = {
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme
        };


        var dpi = window.devicePixelRatio || 1;

        pObj.imei = SDW_WEB.guid;
        pObj.os = SDW_WEB.os;
        pObj.tg = 0;
        pObj.w = SDW_WEB.width * dpi;
        pObj.h = SDW_WEB.height * dpi;

        // 判断是否是有fl标记；
        if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.fl) {
            pObj.fl = SDW_WEB.USER_INFO.fl;
        }

        // 邀请者ID
        var query = SDW_WEB.queryParam;
        if (query[SDW_WEB.sender_sdw_id]) {
            pObj.rfid = query[SDW_WEB.sender_sdw_id];
        }

        var postUrl = SDW_WEB.URLS.addParam(pObj, true, 'http://platform.shandw.com/pltupot');

        this.postAjaxData(postUrl, postData, function (data) {

        })
    },

    /**
     * 对数据进行覆盖（而不是全部删除）
     */
    timer: function () {

        var self = this;
        var data = SDW_WEB.Store.get(this._key, true);

        // 时长计算
        data.time = +new Date();
        SDW_WEB.Store.set(this._key, data, true);

        setTimeout(function () {
            self.timer();
        }, 2000);

    }
};

module.exports = PlaySdwGameTimeManager;