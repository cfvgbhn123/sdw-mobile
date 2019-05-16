/**
 * Created by Administrator on 2016/11/16.
 *
 * 最顶层的页面需要有sdwShareState对象
 * 修改
 *
 */


var sdw;
window.NativeBridge;

var SHA = require('./initJs/sha1');
var  wyShare = require('./share');
// 闪电玩分享
window.sdwShareState = {
    jsApiTicket: '',
    hasWXConfig: false,
    queueWXCallback: null,
    childSuccessCallback: null,
    childCancelCallback: null,
    childFailCallback: null,

    initWXConfig: function () {
        if (!this.jsApiTicket) return;
        var self = this;
        var ticket = this.jsApiTicket;
        var noncestr = 'hjsfkhjkhjkhjk';
        var timestamp = +new Date() / 1000 >> 0;
        // 去掉所有的参数
        var url = location.href.split('#')[0];
        var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url;
        var signature = SHA.hex_sha1(str);

        // 微信JS配置
        wx.config({
            debug: false,
            appId: 'wxfd695e777664b347',
            timestamp: timestamp,
            nonceStr: noncestr,
            signature: signature,
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'hideMenuItems']
        });
        wx.ready(function () {
            self.hasWXConfig = true;
            self.queueWXCallback && self.configWXShare(self.queueWXCallback);
        });
    },

//     // 口袋专属
//     openSafari: function (option) {
//         if (this.checkOptionCallback(option)) {
// //                var callback = this.createCallback(option);
//             window.NativeBridge.call('openSafari', option, null, option);
//         }
//     },

    /**
     * 根据传入的信息，生成分享回调的函数
     *
     * @param shareInfo {Object}
     * @param type {String}
     */
    checkCallbackFn: function (shareInfo, type) {

        if (typeof shareInfo[type] == 'function') {

            window.sdwShareState[type + 'Callback'] = function () {

                if (window.parent === window) {
                    shareInfo[type]();
                } else {
                    // 向游戏页面发送消息，执行分享回调的函数
                    // alert('页面跨域');
                    // window.postMessage(JSON.stringify({
                    //     postSdwData: true,
                    //     oprate: 'shareCallback_' + type
                    // }), '*');
                }
            }
        } else {
            sdwShareState[type + 'Callback'] = function () {

            }
        }
    },

    /**
     * 配置微信的分享信息，配置的入口
     * @param shareInfo {Object}
     */
    configWXShare: function (shareInfo) {

        if (!sdwShareState.jsApiTicket) {
            // 获取微信的jstick
            sdwShareState.getWXJsTick(shareInfo);
            return;
        }

        // 如果已经设置的微信的接口，直接设置分享
        if (sdwShareState.hasWXConfig) {


            for (var i = 0; i < shareInfo.target.length; i++) {
                // console.log('onMenuShare' + shareInfo.target[i]);

                var shareInfoObj = {
                    title: shareInfo.title,
                    desc: shareInfo.desc,
                    link: shareInfo.link,
                    imgUrl: shareInfo.imgUrl,
                    success: shareInfo.success,
                    fail: shareInfo.fail,
                    cancel: shareInfo.cancel
                };

                if (/Timeline/.test(shareInfo.target[i])) {
                    shareInfoObj.link = shareInfo.newLink;
                }

                wx['onMenuShare' + shareInfo.target[i]](shareInfoObj);
            }

        } else {
            this.queueWXCallback = shareInfo;
            this.initWXConfig();
        }
    },

    // 获取微信的JStick
    getWXJsTick: function (option) {

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme
            // }, false, 'https://auth.shandw.com/wcjsapi');
            //     http://est-api.shandw.com/wcjsapi/wxaea32dc50ee82072
            // }, false, 'https://auth.shandw.com/wcjsapi');

            // flag [2018-01-24 13:56:01] 微信获取
        }, false, 'http://wxpush.shandw.com/wcjsapi/wxfd695e777664b347');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1) {

                window.sdwShareState.jsApiTicket = data.JsApiTicket || '';
                window.sdwShareState.configWXShare(option);

            } else {

                // 获取失败，只能普通设置

            }

        });
    }
};

var APP = require('./initJs/OS');

if (APP.onKD && APP.onAndriod) {
    APP.and_KdVer = parseInt((kdjs.getKDVersion()).replace(/\D/g, ''));
}


window.NativeBridge = {
    myData: 'cbdttf',
    name: 'sdw-init.js',
    loadJs: 1,
    callbacksCount: 1,

    // 回调函数，APP直接执行
    callbacks: {
        goBackstage: null,
        recoverBackstage: null,
        pullDownRefresh: function () {

        }
    },

    dhPaycallbacks: {},

    // 来自APP的回调修改
    resultForCallback: function (callbackId, res) {

        // alert('resultForCallback' + callbackId + ',' + res);

        var callback = window.NativeBridge.callbacks[callbackId];

        // alert(callback.toString());
        if (callback) {
            callback(res);
        } else {
            setTimeout(function () {
                alert('回调函数ID' + callbackId + '不存在，请检查回调ID是否正确');
            }, 10);
        }
    },

    /**
     * 对象的全部属性，输出JSON格式
     *
     * @param obj {Object} 需要进行序列化的js对象
     * @return 返回一个JSON字符串
     *
     */
    objectToString: function (obj) {

        var res = {};
        for (var i in obj) {

            if (typeof obj[i] == 'function') {
                res[i] = obj[i].toString();

            } else {
                res[i] = obj[i];
            }
        }
        return JSON.stringify(res);
    },

    /**
     * 唤起APP的方法
     *
     * @param functionName {String}
     * @param args
     * @param callback
     * @param option
     */
    call: function (functionName, args, callback, option, type) {


        var hasCallback = callback && typeof callback === "function";

        var callbackId = hasCallback ? NativeBridge.callbacksCount++ : -1;
        var hasPost = false;

        // 出现跨域，有回调函数，
        // if (APP.ky && hasCallback && functionName !== 'quickPayment') {
        if (APP.ky && hasCallback) {
            var postStr = JSON.stringify({
                optionStr: this.objectToString(option),
                fncName: functionName,
                callbackId: callbackId,
                args: args,
                postSdwData: true,
                operate: 'createNativeBridgeCallback'
            });
            // 通知父页面创建回调函数
            window.parent.postMessage(postStr, '*');
            hasPost = true;
        }

        if (hasCallback) {
            sessionStorage['NativeBridge_callbacks' + callbackId] = callback.toString();
            NativeBridge.callbacks[callbackId] = callback;
        }

        if (!hasPost) {
            var jsonString = JSON.stringify({
                callbackId: callbackId,
                args: args
            });

            var uri = '';

            if (functionName === 'quickPayment' || functionName === 'ApplePayment') {
                uri = 'payment://';
            } else if (APP.onShandw) {
                uri = 'sdw://';
            } else if (APP.onKD) {
                uri = 'kd://';
            } else if (APP.onMicroSDWAPP) {
                uri = 'microsdw://';

                // flag [2018-01-12 14:13:24] 新增野蛮人的判断方法
            } else if (APP.onMDZZHelper) {
                uri = 'mdzz://';
            }

            if (type) {
                uri = type + '://';
            }

            uri += functionName + '#' + jsonString;

            var iFrame = document.createElement("IFRAME");
            iFrame.src = uri;
            document.documentElement.appendChild(iFrame);
            iFrame.parentNode.removeChild(iFrame);
            iFrame = null;
        }

    }
};

var __sdw__ = {

    _shareItems: ['QQ', 'Timeline', 'AppMessage', 'Weibo', 'QZone'],
    _otherItems: ['copyLink', 'followWeixin', 'addDesktop', 'customService'],
    _toolBarItems: ['QQ', 'Timeline', 'AppMessage', 'Weibo', 'QZone',
        'copyLink', 'followWeixin', 'addDesktop', 'customService'],

    checkShareItem: function (item) {
        var items = __sdw__._toolBarItems.slice(0);
        for (var i = 0; i < items.length; i++) {
            if (items[i] == item) return true;
        }
        return false;
    }
};

// 闪电玩接口定义
var sdw = {
    cachePayHandler: null,
    JsApiTicket: '', // 记录微信的ticket
    debug: 1,
    loadJs: 1,
    pre_callbacks: [],
    onShandw: /Shandw/.test(navigator.userAgent),
    customToolBarItems: [],
    /**
     * 加载支付的文件
     */
    init_load: function () {
        var self = this;
        var loadPayJs = document.createElement('script');
        loadPayJs.src = '';
        document.getElementsByTagName('head')[0].appendChild(loadPayJs);
        loadPayJs.onload = function () {
            self.loadJs = 1;
            if (self.pre_callbacks.length) {
                for (var i = 0; i < self.pre_callbacks.length; i++) {
                    var item = self.pre_callbacks[i];
                    item.cb(item.args);
                }
            }
        };
    },
    /**
     * LOG函数
     */
    log: function (msg) {
        this.debug && alert(msg);
    },
    /**
     * 判断是否有APP的支付SDK
     */

    hasSDK: function () {
        // 安卓只判断是否有SDK注入
        var andSdk = typeof CDLAndroid !== 'undefined';

        // IOS的SDK注入
        var iosWz = /WangZuo/.test(navigator.userAgent);
        var iosKdSdk = /KDM3GNEW/.test(navigator.userAgent);
        var iosSdk = APP.onIOS && (APP.onShandw || iosWz || iosKdSdk);

        return andSdk || iosSdk;
    },
    /**
     * 选择默认的分享图片
     */
    selectImg: function () {
        var img = document.getElementsByTagName('img');
        if (img) {
            return img[0].src;
        }
        return '';
    },
    /**
     * 创建一个回调函数，判断APP的返回值
     */
    createCallback: function (option) {

        // alert(JSON.stringify(option));

        return function (resJson) {

            try {
                var res = JSON.parse(resJson);

                // alert('resJson' + resJson);
                // alert('option.success.toString()' + option.success.toString());

                if (res.result == 0) {

                    option.fail && option.fail(res);

                } else if (res.result == 1) {

                    option.success && option.success(res);

                } else if (res.result == 2) {
                    option.cancel && option.cancel(res);
                }

            } catch (e) {
                alert('e[fail]:' + JSON.stringify(e));

                // [修改] 针对IOS的支付回调做相应的判断
                if (/失败/.test(resJson)) {
                    option.fail && option.fail({result: 0, msg: resJson});
                } else {
                    option.cancel && option.cancel({result: 2, msg: resJson});
                }
            }
        }
    },
    /**
     * SDK支付回调
     */
    createSDKCallback: function (option) {
        var self = this;
        return function (resJson) {
            var resData = self.createPayData(option);
            if (option.complete) {
                // IOS需要延迟调用，如果回调函数中出现alert
                setTimeout(function () {
                    option.complete(resData);
                }, 20);
            }
        }
    },
    /**
     * 构建用户支付的信息
     */
    createPayData: function (option) {
        var resData = {};
        resData.channel = option.channel;
        resData.appId = option.appId;
        resData.cpOrderId = option.cpOrderId;
        resData.timestamp = option.timestamp;
        resData.accountId = option.accountId;
        resData.amount = option.amount;
        resData.memo = option.memo;
        return resData;
    },
    /**
     * 检测用户的函数
     */
    checkOptionCallback: function (option) {
        var flag = true, args = ['success', 'fail', 'cancel', 'complete'];
        for (var i = 0; i < args.length; i++) {
            if (option[args[i]]) {
                flag = flag && (typeof option[args[i]] == "function");
            }
        }

        if (!flag) {
            this.log('Function类型错误')
        }

        return flag;
    },
    /**
     * 检测用户的参数
     */
    checkOptionArguments: function (option, check) {
        for (var i = 0; i < check.length; i++) {
            if (!option.hasOwnProperty(check[i])) {
                return {
                    result: 0,
                    msg: '参数' + check[i] + '有误'
                };
            }
        }
        return {
            result: 1
        }
    },
    /**
     * 获取微端APP的基本信息
     */
    getMicroAPPInfo: function (option) {
        if (this.checkOptionCallback(option)) {
            var callback = this.createCallback(option);
            NativeBridge.call('getMicroAPPInfo', null, callback, option);
        }
    },

    /*********微端的新接口*********/



    // 发送登录的数据-平台调用
    postPltLoginInfo: function (option) {
        NativeBridge.call('postPltLoginInfo', option, null);
    },

    // 发送游戏调用支付的数据-平台自动调用
    postChoosePayInfo: function (option) {
        NativeBridge.call('postChoosePayInfo', option, null);
    },

    // 发送游戏创角色信息-游戏调用
    postGamePlayerInfo: function (option) {
        NativeBridge.call('postGamePlayerInfo', option, null);
    },

    // 发送游戏调用支付的数据-游戏调用
    postPaySuccessInfo: function (option) {
        NativeBridge.call('postPaySuccessInfo', option, null);
    },

    /*********微端的新接口*********/

    /**
     * 获取APP的基本信息
     */
    getAPPInfo: function (option) {
        if (this.checkOptionCallback(option)) {
            var callback = this.createCallback(option);
            NativeBridge.call('getAPPInfo', null, callback, option);
        }
    },
    /**
     * 获取用户的基本信息
     */
    getUserInfo: function (option) {
        if (this.checkOptionCallback(option)) {
            var callback = this.createCallback(option);
            NativeBridge.call('getUserInfo', null, callback, option);
        }
    },
    /**
     * 通过JS向APP发送消息
     */
    notifyToAPP: function (option) {

        var args = [], check;

        // 游戏授权成功
        if (option.type == 'playGame') {
            args = ['id', 'icon', 'name', 'time'];
        } else if (type == 'isGame') {
            option.show = option.show || 0;
        } else {
            this.log('缺少type类型');
            return;
        }

        check = this.checkOptionArguments(option, args);

        if (check.result == 0) {
            this.log(check.msg);
            return;
        }

        NativeBridge.call('notifyToAPP', option);
    },
    /**
     * 页面全屏化
     */
    requestFullScreen: function (option) {
        if (this.checkOptionCallback(option)) {
            var callback = this.createCallback(option);
            NativeBridge.call('requestFullScreen', option, callback);
        }
    },

    /**
     * 清除APP缓存
     */
    clearAPPCache: function (option) {
        NativeBridge.call('clearAPPCache', null, null);
    },
    /**
     * 取消页面全屏化
     */
    exitFullScreen: function (option) {
        if (this.checkOptionCallback(option)) {
            var callback = this.createCallback(option);
            NativeBridge.call('exitFullScreen', option, callback);
        }
    },
    /**
     * 关闭当前页面
     */
    closeWindow: function () {
        NativeBridge.call('closeWindow', null);
    },
    /**
     * 返回上一级页面
     */
    goBackWindow: function () {
        NativeBridge.call('goBackWindow', null);
    },
    /**
     * 唤起APP的登录界面
     */
    openLogin: function (option) {
        // if (this.checkOptionCallback(option)) {
        //     var callback = this.createCallback(option);
        NativeBridge.call('openLogin', null, null);
        // }
    },
    /**
     * 新开一个页面
     */
    openWindow: function (option) {
        var logs;
        if (!option.link) {
            logs = '缺少参数[link]';
        } else if (!(/http(s)?\:\/\//.test(option.link))) {
            logs = '参数[link]格式错误！';
        }

        if (logs) {
            this.log(logs);
            return;
        }

        option.isFullScreen = option.isFullScreen || false;
        option.showMoreBtn = option.showMoreBtn || false;

        // flag [2018-01-12 17:00:40] 是否需要关闭当前页面
        option.close = option.close || false;

        NativeBridge.call('openWindow', option);
    },

    /**
     * 新开一个页面[安卓需要校验]
     * @param option
     */
    openWindowNeedLogin: function (option) {

        // console.log('openWindowNeedLogin');

        var logs;
        if (!option.link) {
            logs = '缺少参数[link]';
        } else if (!(/http(s)?\:\/\//.test(option.link))) {
            logs = '参数[link]格式错误！';
        }

        if (logs) {
            this.log(logs);
            return;
        }

        option.isFullScreen = option.isFullScreen || false;
        option.showMoreBtn = option.showMoreBtn || false;

        NativeBridge.call('openWindowNeedLogin', option);
    },

    /**
     * 显示底部的工具栏
     */
    onShowToolBar: function () {
        NativeBridge.call('onShowToolBar', null, null);
    },

    __sortToolBars: function (items) {
        var postTools = {
            firstLine: [],
            secondLine: []
        };

        for (var i = 0; i < items.length; i++) {

            for (var j = 0; j < __sdw__._shareItems.length; j++) {
                if (items[i] == __sdw__._shareItems[j]) {
                    postTools.firstLine.push(items[i]);
                    break;
                }
            }
        }

        for (var i = 0; i < items.length; i++) {

            for (var j = 0; j < __sdw__._otherItems.length; j++) {
                if (items[i] == __sdw__._otherItems[j]) {
                    postTools.secondLine.push(items[i]);
                    break;
                }
            }
        }

        return postTools;

    },
    /**
     * 设置底部的工具栏显示信息
     * @param items
     */
    onSetToolBarOperation: function (items) {

        var postTools;

        if (items instanceof Array) {
            // this.customToolBarItems = items.slice(0);

            postTools = this.__sortToolBars(items.slice(0))
        } else {

            this.customToolBarItems = __sdw__._toolBarItems.slice(0);
        }

        NativeBridge.call('onSetToolBarOperation', postTools, null);
    },
    /**
     * 删除底部工具栏的按钮
     * @param items
     */
    onHideToolBarItems: function (items) {

        if (!items instanceof Array) {
            console.log('onHideToolBarItems: items must is Array!');
            return;
        }

        items = items || [];
        var custom = this.customToolBarItems;

        for (var i = 0; i < items.length; i++) {

            for (var j = 0; j < custom.length; j++) {
                if (items[i] == custom[j]) {
                    // 剔除
                    custom.splice(j, 1);
                    break;
                }
            }
        }

        this.onSetToolBarOperation(custom);
    },
    /**
     * 新增底部工具栏的按钮
     * @param items
     */
    onShowToolBarItems: function (items) {

        if (!items instanceof Array) {
            console.log('onShowToolBarItems: items must is Array!');
            return;
        }

        items = items || [];
        var custom = this.customToolBarItems;

        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < custom.length; j++) {
                if (items[i] == custom[j]) {
                    break; // 说明原先已经有了
                }
            }

            if (j >= custom.length) {
                // 原先没有存在
                custom.push(items[i]);
            }
        }

        this.onSetToolBarOperation(custom);
    },
    /**
     * 唤起单个分享页面
     */
    onShareOperation: function (option) {

        if (!__sdw__.checkShareItem(option.target)) {
            this.log('onShareOperation: [target] error!');
            return;
        }

        option.title = option.title || document.title;
        option.link = option.link || location.href;
        option.desc = option.desc || '';
        option.imgUrl = option.imgUrl || this.selectImg();

        var callback = this.createCallback(option);
        NativeBridge.call('onShareOperation', option, callback);
    },
    /**
     * 变更分享的信息，不唤起分享页面
     */
    changeShareOperation: function (option) {

        option.target = option.target || '';
        option.title = option.title || document.title;
        option.link = option.link || location.href;
        option.desc = option.desc || '';
        option.imgUrl = option.imgUrl || this.selectImg();

        var callback = this.createCallback(option);
        NativeBridge.call('changeShareOperation', option, callback);
    },

    /**
     * 变更分享的信息，不唤起分享页面
     */
    getUnloadInfo: function (option) {

        var callback = this.createCallback(option);
        NativeBridge.call('getUnloadInfo', option, callback);
    },
    /**
     * APP进入后台
     */
    goBackstage: function (callback) {
        if (callback && typeof callback == "function") {
            NativeBridge.callbacks['goBackstage'] = callback;
            NativeBridge.call('goBackstage', null);
        } else {
            this.log('Function参数错误')
        }
    },
    /**
     * APP从后台恢复
     */
    recoverBackstage: function (callback) {
        if (callback && typeof callback == "function") {
            NativeBridge.callbacks['recoverBackstage'] = callback;
            NativeBridge.call('recoverBackstage', null);
        } else {
            this.log('[recoverBackstage]: Function参数错误!')
        }
    },
    /**
     * 页面下拉刷新
     */
    setPullDownRefresh: function (open) {
        open = open || false;
        NativeBridge.call('setPullDownRefresh', open, null);
    },
    /**
     * 关闭页面下拉刷新
     */
    onHidePullDown: function () {
        NativeBridge.call('onHidePullDown', null);
    },
    /**
     * APP调取JS函数
     */
    appCallJs: function (callback) {
        if (callback && typeof callback == "function") {
            NativeBridge.call('appCallJs', null, callback);
        } else {
            this.log('Function参数错误');
        }
    },
    /**
     * APP调取JS函数
     */
    switchTab: function (string) {
        if (string && typeof string == "string") {
            NativeBridge.call('switchTab', string, null);
        } else {
            this.log('Function参数错误');
        }
    },

    /**
     * 刷新
     * @param string
     */
    refreshTab: function (string) {
        if (string && typeof string == "string") {
            NativeBridge.call('refreshTab', string, null);
        } else {
            this.log('Function参数错误');
        }
    },

    /**
     * 检查是否引入平台支付
     */
    checkWebJsFile: function () {
        if (typeof dhpayObj != 'undefined') {
            return true;
        }

        this.log('请检查是否引入支付文件');
        return false;
    },

    // flag [2018-01-15 14:02:27] 添加闹钟
    setClock: function (option) {
        option = option || {};
        NativeBridge.call('setClock', option, null);
    },


    postInfoH5Native: function (data) {
        data = data || {};
        NativeBridge.call('postInfoH5Native', data, null);
    },

    /**
     * 支付接口SDK
     */
    chooseSDWPay: function (option) {

        if (typeof option == 'string') {
            try {
                option = JSON.parse(option);
            } catch (e) {

            }
        }

        option = option || {};

        // 需要检测所有的参数
        var check = this.checkOptionArguments(option, ['subject', 'appId', 'gameName', 'accountId', 'amount', 'memo', 'cpOrderId', 'sign', 'timestamp', 'channel']);

        option.paychannel = option.paychannel || '';

        if (check.result == 0) {
            this.log(check.msg);
            return;
        }

        if (this.checkOptionCallback(option)) {

            // 调取APP的SDK接口
            if (this.hasSDK()) {

                var callback = this.createSDKCallback(option);

                if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

                    this.cachePayHandler = function () {
                        NativeBridge.call('quickPayment', JSON.stringify(option), callback, option);
                    };

                } else {

                    this.cachePayHandler = function () {

                        // 微端游戏中，是直接调用
                        if (APP.onMicroSDWAPP) {

                            var postObj = {
                                postjson: {}
                            };

                            for (var i in option) {

                                if (i != 'success' && i != 'fail' && i != 'cancel' && i != 'complete' && i != 'paychannel') {
                                    postObj.postjson[i] = option[i];
                                }

                                if (i == 'complete') {
                                    postObj.closecallback = this.createSDKCallback(option);
                                    postObj.config = {'alipay': true};
                                }
                            }

                            dhpayObj.payfor(postObj);

                        } else {
                            CDLAndroid.quickPayment(JSON.stringify(option));
                        }

                        window.onDHSDKResult = callback;
                    };

                    // this.cachePayHandler = function () {
                    //     CDLAndroid.quickPayment(JSON.stringify(option));
                    //     window.onDHSDKResult = callback;
                    // };
                }

            } else {

                // 调取网页支付SDK
                var postObj = {
                    postjson: {},
                    resultpost: true,
                    config: {alipay: true, weixin: true}
                };

                for (var i in option) {

                    // web需要剔除paychannel
                    if (i != 'success' && i != 'fail' && i != 'cancel' && i != 'complete' && i != 'paychannel') {
                        postObj.postjson[i] = option[i];
                    }

                    if (i == 'complete' && typeof option.complete == 'function') {
                        var resData = this.createPayData(option);

                        postObj.closecallback = function () {
                            option.complete(resData);
                        };
                    }
                }

                // 对回调函数做兼容处理
                if (!postObj.closecallback) {
                    postObj.closecallback = function () {

                    }
                }

                if (option.paychannel != '') {
                    var wxShowFlag = option.paychannel == 'weixin';
                    postObj.config.alipay = !wxShowFlag;
                    postObj.config.weixin = wxShowFlag;
                }

                if (APP.onKD && APP.onAndriod && APP.and_KdVer < 402) {
                    // 对于口袋老版本的安卓，关闭支付宝
                    postObj.config.alipay = false;
                }

                this.cachePayHandler = function () {
                    dhpayObj && dhpayObj.payfor(postObj);
                };
            }

            if (APP.ky) {

                // 对于梦三客户端的，不存在游客模式。直接调用
                if (/(?=.*btnName)(?=.*M32GW)^.*$/.test(location.href)) {

                    this.cachePayHandler && this.cachePayHandler();

                } else {

                    window.parent.postMessage(JSON.stringify({
                        postSdwData: true,
                        operate: 'checkVisitorMode'
                    }), '*');
                }

            } else {

                this.cachePayHandler && this.cachePayHandler();
            }

        }
    },

    // 口袋相关的接口
    kd: {
        openSafari: function (option) {
            window.NativeBridge.call('openSafari', option, null, option, 'kd');
        }
    },

    /**
     * 设置分享，会根据目前所在的环境调用分享接口
     *
     * 只有在登录闪电玩的账号，并且成功请求到ticket
     * @param res {Object}
     */

    onSetShareOperate: function (res, otherParams) {
        window.shandwshare = {
            success:null,
            cancel:null,
        };
        // 清除预设的分享
        if (SDW_WEB && SDW_WEB.mySetTimer) {
            clearTimeout(SDW_WEB.mySetTimer);
            SDW_WEB.mySetTimer = null;
        }

        // flag [2018-09-20 09:56:44] 闪电玩简易版的字段
        if (SDW_WEB.readParam('sdw_simple')) {
            res.link += '&sdw_simple=1';
        }

        var option = this.clone(res);
        var self = this;
        var _self_callback = null;
        typeof option.success !== 'function' && (option.success = function () {

        });

        typeof option.cancel !== 'function' && (option.cancel = function () {

        });

        typeof option.fail !== 'function' && (option.fail = function () {

        });

        // var postMsgObj = {
        //     postSdwData: true,
        //     operate: 'setSDWshareInfo'
        // };

        // postMsgObj.shareInfo = option;

        /*微信分享的链接必须在后台配置JS安全域名（需备案），APP的分享链接可随意*/

        var convertTimeLineUrl = function (url) {
            url = url || location.href;
            /*ab.mwyx.cn未备案，微信先屏蔽*/
            if (SDW_WEB.onWeiXin) {
                return url;
            }
            var newUrl = 'http://ab.mwyx.cn/to.html?sdwto=' + encodeURIComponent(url);
            return newUrl;
        };


        option.newLink = convertTimeLineUrl(option.link);


        /*第三方APP与闪电玩协商的分享*/
        window.shandwshare.success = option.success;
        window.shandwshare.cancel = option.cancel ;
        var shareInfo = {
            title: option.title,
            desc: option.desc,
            link: option.link,
            imgUrl: option.imgUrl,
            shareflag:option.share?true:false,
        };
        if( window.sdwMsg && window.sdwMsg.share ){
            window.sdwMsg.share(JSON.stringify(shareInfo));
            return ;
        }



        // ******************************************************************************
        // 微信中的分享设置
        // ******************************************************************************
        if (SDW_WEB.onWeiXin) {

            var wxShare = __sdw__._shareItems.slice(0);
            // postMsgObj.source = 'weixin';

            if ((typeof option.target == 'undefined') || option.target == '') {
                option.target = wxShare;
            } else {

                var sdkTarget = option.target;
                var resTarget = [];

                for (var i = 0; i < sdkTarget.length; i++) {
                    if (wxShare.indexOf(sdkTarget[i]) != -1)
                        resTarget.push(sdkTarget[i]);
                }

                option.target = resTarget;
            }

            _self_callback = function () {
                // 配置分享微信的信息
                SDW_WEB.onWeiXin && sdwShareState.configWXShare(option);
            }
        }

        // ******************************************************************************
        // 微信中的分享设置
        // ******************************************************************************

        // ******************************************************************************
        // 闪电玩中的分享设置
        // ******************************************************************************
        else if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper || SDW_WEB.onMicroSDWAPP) {
            _self_callback = function () {
                // 闪电玩APP中，配置分享
                option.target = option.target || __sdw__._shareItems.slice(0);
                for (var i = 0; i < option.target.length; i++) {
                    var optionItem = self.clone(option);
                    var callback = self.createCallback(optionItem);
                    optionItem.target = option.target[i];
                    if (/Timeline/.test(option.target[i])) {
                        optionItem.link = option.newLink;
                    } else {
                        optionItem.link = option.link;
                    }
                    NativeBridge.call('onSetShareOperate', optionItem, callback);
                }
            };
        }

        // ******************************************************************************
        // 口袋梦三国中的分享设置
        // ******************************************************************************
        else if (SDW_WEB.onKD) {
            var optionItem = self.clone(option);
            var callback = self.createCallback(optionItem);
            NativeBridge.call('onSetShareOperate', optionItem, callback);
        }

        // ******************************************************************************
        // 网易星球中的分享设置
        // ******************************************************************************
        else if (SDW_WEB.wyxq) {
            wyShare &&  wyShare.setShareInfo({
                title: option.title,
                content: option.desc,
                url: option.link,
                thumbUrl: option.imgUrl,
                success: option.success,
                fail: option.fail,
                cancel: option.cancel,
            });
        }

        // ******************************************************************************
        // 网易圈圈的分享设置（文案设置）
        // ******************************************************************************
        else if (SDW_WEB.onWyqq) {
            window.ncgObjectShareData = {
                title: option.title,
                desc: option.desc,
                img: option.imgUrl,
                link: option.link
            };

            // alert(JSON.stringify(window.ncgObjectShareData));
            console.log(window.ncgObjectShareData);

            // 是否进行快速分享
            if (option.share) {
                window.top.postMessage(JSON.stringify({
                    method: 'WebviewNCGObject.share',
                    data: window.ncgObjectShareData
                }), '*');
            } else {
                // 显示右上角的分享按钮
                window.top.postMessage(JSON.stringify({
                    method: 'WebviewNCGObject.showRightBarShareButton',
                    data: window.ncgObjectShareData
                }), '*');
            }
        }

        // ******************************************************************************
        // 牛哄哄的分享设置（文案设置）
        // ******************************************************************************
        else if (/nhhapp/.test(navigator.userAgent)) {
            window.bitgm && (typeof window.bitgm.setshareInfo === 'function')
            && window.bitgm.setshareInfo({
                title: option.title,
                content: option.desc,
                url: option.link,
                thumbUrl: option.imgUrl,
                success: option.success,
                fail: option.fail,
                cancel: option.cancel,
            });
        }

        else if(SDW_WEB.onChatBao){
            window.__Games&& (typeof window.__Games.shareGame === 'function')
            && window.__Games.shareGame(option);
        }
        else if(SDW_WEB.onQujianpan){
            window.shandwshare.success = option.success;
            window.shandwshare.cancel = option.cancel ;
            // var shareInfo = {
            //     title: option.title,
            //     desc: option.desc,
            //     link: option.link,
            //     imgUrl: option.imgUrl,
            //     shareflag:option.share?true:false,
            // };

            if(SDW_WEB.onIOS){
                window.webkit.messageHandlers.shandwShare.postMessage(JSON.stringify(shareInfo));
            }else if(SDW_WEB.onAndriod){
                window.androidMethodThor.shandwShare(JSON.stringify(shareInfo));
            }
        }
        if (!option.notSave) {
            // 记录父级页面中回调
            window.sdwShareState.successCallback = option.success;
            window.sdwShareState.cancelCallback = option.cancel;
            window.sdwShareState.failCallback = option.fail;
        }
        _self_callback && _self_callback();
    },

    /**
     * 用户退出
     */
    logout: function () {
        NativeBridge.call('logout', null, null);
    },

    /**
     * 刷新当前页面
     * @param destroy {Boolean} 是否需要销毁
     */
    refreshPage: function (destroy) {
        destroy = destroy || false;
        NativeBridge.call('refreshPage', destroy, null);
    },

    /**
     * 设置QQ客服群
     * @param link
     */
    setQQLink: function (link) {
        NativeBridge.call('setQQLink', link, null);
    },

    /**
     * 将内容复制到剪切板中
     * @param str
     */
    setClipboard: function (str) {
        NativeBridge.call('setClipboard', str, null);
    },

    /**
     * 关闭SDK的支付界面
     */
    closeSDWPay: function () {

        if (this.onShandw || this.hasSDK()) {

            // APP SDK支付

        } else {

            // web支付
            if (APP.ky && APP.onWeiXin) {

                // 向父级发送关闭二维码的请求** 微信中二维码支付
                window.parent.postMessage(JSON.stringify({
                    operate: 'requestHideQrcode'
                }), '*')

            } else if (dhpayObj) {
                dhpayObj.hidepay();
            }

        }

    },

    ///////----*****安卓私有接口----*******///////

    /**
     * 创建桌面快捷方式
     */
    createDesktop: function (option) {
        option.title = option.title || document.title;
        option.link = option.link || location.href;
        option.icon = option.icon || '';
        var callback = this.createCallback(option);
        NativeBridge.call('createDesktop', option, callback);
    }
    , clone: function (resource) {
        if (typeof resource === 'object') {
            var result = {};

            for (var i in resource) {
                result[i] = resource[i];
            }

        }

        return result;
    }
};


// 父级页面消息通知到本页面****************
if (APP.ky) {

    window.addEventListener('message', function (e) {

        try {
            var postData = JSON.parse(e.data);

            if (postData.postSdwData) {

                var type = postData.oprate;

                // 分享回调
                if (type == 'shareCallback_success') {
                    window.sdwShareState.childSuccessCallback && window.sdwShareState.childSuccessCallback();
                }

                if (type == 'shareCallback_cancel') {
                    window.sdwShareState.childFailCallback && window.sdwShareState.childCancelCallback();
                }

                if (type == 'shareCallback_fail') {
                    window.sdwShareState.childFailCallback && window.sdwShareState.childFailCallback();
                }

                if (type == 'choosePayCheckState_ok') {
                    // 执行支付
                    sdw.cachePayHandler && sdw.cachePayHandler();
                }
            }

        } catch (e) {

            console.log(e);

        }

    }, false);
}

module.exports = sdw;





