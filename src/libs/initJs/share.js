/**
 * Created by CHEN-BAO-DENG on 2017/4/17.
 */

var SHA = require('./sha1.js');

// 闪电玩分享
var sdwShareState = {
    jsApiTicket: '',
    hasWXConfig: false,
    queueWXCallback: null,
    successCallback: null,
    failCallback: null,
    initWXConfig: function () {

        if (!this.jsApiTicket) return;

        var self = this;
        var ticket = this.jsApiTicket;
        var noncestr = +new Date();
        var timestamp = +new Date() / 1000 >> 0;
        var url = location.href.split('#')[0];
        var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url;
        var signature = SHA(str);

        // 微信JS配置
        wx.config({
            debug: false,
            appId: 'wxfd695e777664b347',
            timestamp: timestamp,
            nonceStr: noncestr,
            signature: signature,
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']
        });

        wx.ready(function () {
            self.hasWXConfig = true;
            self.queueWXCallback && self.configWXShare(self.queueWXCallback);
        });

    },

    /**
     * 根据传入的信息，生成分享回调的函数
     *
     * @param shareInfo {Object}
     * @param type {String}
     */
    checkCallbackFn: function (shareInfo, type) {
        if (typeof shareInfo[type] == 'function') {
            this[type + 'Callback'] = function () {

                if (window.parent === window) {
                    shareInfo[type]();
                } else {
                    // 向游戏页面发送消息，执行分享回调的函数
                    window.postMessage(JSON.stringify({
                        postSdwData: true,
                        oprate: 'shareCallback_' + type
                    }), '*');
                }
            }
        } else {
            this[type + 'Callback'] = function () {
            }
        }
    },

    /**
     * 配置微信的分享信息
     * @param shareInfo {Object}
     */
    configWXShare: function (shareInfo) {

        if (!sdwShareState.jsApiTicket) return;

        if (sdwShareState.hasWXConfig) {

            // 根据分享来确认执行的
            sdwShareState.checkCallbackFn(shareInfo, 'success');
            sdwShareState.checkCallbackFn(shareInfo, 'fail');

            // 设置各个分享的内容
            for (var i = 0; i < shareInfo.target.length; i++) {
                wx['onMenuShare' + shareInfo.target[i]]({
                    title: shareInfo.title,
                    desc: shareInfo.desc,
                    link: shareInfo.link,
                    imgUrl: shareInfo.imgUrl,
                    success: sdwShareState.successCallback,
                    fail: sdwShareState.failCallback
                });
            }

        } else {

            this.queueWXCallback = shareInfo;
            this.initWXConfig();
        }
    }
};