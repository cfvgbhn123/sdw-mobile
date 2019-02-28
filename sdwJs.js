/**
 * Created by Administrator on 2016/11/16.
 * 用于CP接入的js-sdk
 */
var sdw;

var OS = {}, u = navigator.userAgent;
OS.onIOS = !!u.match(/\(i[^;]+;(U;)? CPU.+Mac OS X/);
OS.onMobile = !!u.match(/AppleWebKit.*Mobile.*/);
OS.onIPhone = u.indexOf("iPhone") > -1;
OS.onIPad = u.indexOf("iPad") > -1;
OS.onAndriod = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
OS.onWP = u.indexOf("Windows Phone") > -1;
OS.onQQBrowser = u.indexOf("QQBrowser") > -1;
OS.onMQQBrowser = u.indexOf("MQQBrowser") > -1;
OS.onWeiXin = u.indexOf('MicroMessenger') > -1;
OS.onWeiBo = u.indexOf('Weibo') > -1;
OS.onSafari = u.indexOf('Safari') > -1;
OS.onQQ = OS.onIOS ? (u.indexOf('QQ') > -1 && !(OS.onMQQBrowser || OS.onQQBrowser)) : OS.onMQQBrowser && !OS.onWeiXin; // 需要单独对QQ应用做处理
OS.onPC = !OS.onMobile;
OS.QBCore = /QBCore/.test(u);
OS.onKD = /KDM3G/.test(u) || /KDM3GNEW/.test(u) || typeof kdjs != 'undefined' || typeof callKDMSGToResponse != 'undefined';
OS.width = document.documentElement.clientWidth || document.body.clientWidth;
OS.height = document.documentElement.clientHeight || document.body.clientHeight;
OS.onShandw = /Shandw/.test(u);
OS.onMDZZHelper = /MDZZHelper/.test(u);  // 野蛮人APP助手
OS.onWeChat = /WindowsWechat/.test(u);  // PC端微信客户端
OS.onAliPay = /Alipay/.test(u);  // 支付宝

OS.onMicroSDWAPP = /Micro-SDW-APP/.test(u) || /Micro-SDW-APP-WapPay/.test(u);  // 闪电玩的微端标记（只有包含游戏）

OS.onShandwMicroGame = /Shandw-Micro-Game/.test(u);  // 安卓的微端，包含游戏和闪电玩的平台，此环境下有特定的退弹（需要采用接口获取）

OS.hasIOSMicroWapPay = /Micro-SDW-APP-WapPay/.test(u) || /WapPay-Shandw/.test(u);  // flag [2017-11-07 10:05:04] 新加闪电玩wap支付

OS.hasApplePay = /APPLE-PAY/.test(u);  // flag [2018-01-18 13:44:33] 如果含有苹果支付的SDK

OS.onAPPs = OS.onMobile && (OS.onWeiXin || OS.onQQ || OS.onKD || OS.onShandw || OS.onWeiBo || OS.onAliPay || OS.onMDZZHelper);
OS.ky = window !== parent;

// 操作系统
OS.os = 0;
if (OS.onIOS) {
    OS.os = (OS.onShandw || OS.onMicroSDWAPP || OS.hasIOSMicroWapPay) ? 2 : 4;
} else if (OS.onAndriod) {
    OS.os = (OS.onShandw || OS.onMicroSDWAPP || OS.onShandwMicroGame) ? 1 : 3;
}

OS.getNow = function () {
    return +new Date();
};

var APP = OS;

if (APP.onKD && APP.onAndriod) {
    APP.and_KdVer = parseInt((kdjs.getKDVersion()).replace(/\D/g, ''));
}

window.NativeBridge = {

    myData: 'sdw',
    name: 'sdwJs-cp.js',
    loadJs: 1,
    callbacksCount: 1,
    // 回调函数，APP直接执行
    callbacks: {
        goBackstage: null,
        recoverBackstage: null,
        pullDownRefresh: function () {

        }
    },

    // 来自APP的回调
    resultForCallback: function (callbackId, res) {
        var callback = window.NativeBridge.callbacks[callbackId];
        if (callback) {
            callback(res);
        } else {
            setTimeout(function () {
                // alert('回调函数ID' + callbackId + '不存在，请检查回调ID是否正确');
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

        var hasCallback = callback && typeof callback == "function";
        var callbackId = hasCallback ? window.NativeBridge.callbacksCount++ : -1;
        var hasPost = false;

        if (hasCallback) {
            // sessionStorage['NativeBridge_callbacks' + callbackId] = callback.toString();
            window.NativeBridge.callbacks[callbackId] = callback;
        }

        // alert(APP.ky)
        // 出现跨域，有回调函数，
        if (APP.ky && hasCallback) {
            // if (APP.ky && hasCallback && functionName != 'quickPayment') {
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
                // flag [2018-01-12 15:15:11] 新增野蛮人的判断
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
window.sdw = {
    payMap: {}, // 记录支付的信息
    th_callback: [],
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
        var iosWapSdk = OS.hasIOSMicroWapPay;

        var iosSdk = OS.onIOS && (OS.onShandw || iosWz || iosKdSdk || iosWapSdk);

        // 采用web支付的闪电玩APP
        if (/WapPayShandw/.test(navigator.userAgent)) {
            iosSdk = false;
        }

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
        return function (resJson) {
            try {
                var res = JSON.parse(resJson);
                if (res.result == 0) {
                    option.fail && option.fail(res);
                } else if (res.result == 1) {
                    option.success && option.success(res);
                } else if (res.result == 2) {
                    option.cancel && option.cancel(res);
                }
            } catch (e) {
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
                flag = flag && (typeof option[args[i]] === "function");
            }
        }

        if (!flag) {
            this.log('Function类型错误');
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
     * 检查是否引入平台支付
     */
    checkWebJsFile: function () {
        if (typeof dhpayObj != 'undefined') {
            return true;
        }

        this.log('请检查是否引入支付文件');
        return false;
    },


    /**
     * 支付接口SDK（可能会不停地变更）
     */
    chooseSDWPay: function (option) {

        var self = this;
        if (typeof option === 'string') {
            try {
                option = JSON.parse(option);
            } catch (e) {
                console.log(e);
                return;
            }
        }

        option = option || {};

        // 需要检测所有的参数
        var check = this.checkOptionArguments(option, ['subject', 'appId', 'gameName', 'accountId', 'amount', 'cpOrderId', 'sign', 'timestamp', 'channel']);

        option.paychannel = option.paychannel || '';

        if (check.result === 0) {
            this.log(check.msg);
            return;
        }

        if (this.payMap[option.cpOrderId]) {
            alert('订单号重复提交...');
            return;
        }

        this.payMap[option.cpOrderId] = 1;

        if (this.checkOptionCallback(option)) {

            // 微端支付信息发送
            var postMicroAPPChoosePayFn = function (type) {

                sdw.postChoosePayInfo({
                    transactionId: '' + option.cpOrderId,
                    paymentType: type || 'alipay',
                    currencyType: 'CNY',
                    currencyAmount: option.amount / 100  // 单位分
                })

            };

            // flag [2017-11-07 15:12:11] 调用支付函数方法
            var callDhPayFn = function (option, type) {
                var postObj = filterData(option);
                postObj.config.method = type;
                postObj.config.weixin = true;
                dhpayObj && dhpayObj.payfor(postObj);
            };

            // flag [2017-11-10 17:01:18] 过去web的数据
            var filterData = function (option) {
                var postObj = {
                    postjson: {},
                    config: {alipay: true, weixin: true},
                    resultpost: true
                };
                for (var i in option) {
                    if (i != 'success' && i != 'fail' && i != 'cancel' && i != 'complete' && i != 'paychannel') {
                        option[i] && (postObj.postjson[i] = option[i]);
                    }
                    if (i == 'complete' && typeof option.complete === 'function') {
                        var resData = sdw.createPayData(option);
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

                return postObj;
            };

            // QQ
            if (window.OPEN_DATA && window.OPEN_DATA.appurl) {
                var param = window.sdw.getUrlObj(window.OPEN_DATA.appurl.split('?')[1]);
                var supportPay = 1;
            } else {
                var param = window.sdw.getUrlObj();
                var supportPay = param['pltpay'];
            }

            var platform = param['plt'];
            if (platform && supportPay && typeof window._sdw_3th_pay_fun != 'undefined' && platform !== 'null') {
                // 调用第三方的支付
                window._sdw_3th_pay_fun(option);
                return;
            }

            /*苹果支付*/
            var applePayFn = function () {
                // 正在请求数据
                sdw.dialogMessage({
                    fn: 'show',
                    msg: 'Loading...',
                    type: 'loading',
                    hidden: false
                });

                jQuery && jQuery.ajax({
                    type: "GET",
                    url: 'http://sandbox.pay.17m3cdn.com/sdk/CodeWappay.aspx',
                    data: {
                        subject: option.subject,
                        appId: option.appId,
                        gameName: option.gameName,
                        accountId: option.accountId,
                        amount: option.amount,
                        cpOrderId: option.cpOrderId,
                        call_back_url: option.call_back_url,
                        merchant_url: option.merchant_url,
                        sign: option.sign,
                        timestamp: option.timestamp,
                        channel: option.channel,
                        payChannel: 'sdw',
                        payScene: 5
                    },
                    dataType: 'jsonp',
                    jsonpCallback: 'callback' + (new Date().getTime()),
                    success: function (data) {
                        if (data.result == '1') {
                            // 苹果支付
                            postMicroAPPChoosePayFn('applepay');
                            var applePayObj = data.data;
                            var callback = self.createSDKCallback(applePayObj);
                            // 调用原生SDK的支付
                            NativeBridge.call('ApplePayment', JSON.stringify(applePayObj), callback, applePayObj);
                            sdw.dialogMessage({
                                fn: 'hidden'
                            });

                        } else {
                            alert('sdwJs.js[chooseSDWPay]:' + JSON.stringify(data));
                        }
                    }
                });
            };

            // 微端游戏审核状态，直接采用苹果支付，否则就退出
            if (param['app_review'] == '1') {
                // 如果存在苹果支付，则使用苹果支付
                // alert(APP.hasApplePay);
                if (APP.hasApplePay) {
                    applePayFn();
                }
                return;
            }


            /*支付逻辑函数*/

            this.cachePayHandler = function (useweb) {
                // apple pay
                if (APP.hasApplePay && useweb === 0) {
                    applePayFn();
                }
                // app-sdk pay
                else if (self.hasSDK()) {
                    var callback = self.createSDKCallback(option);
                    if (APP.onIOS) {
                        if (APP.hasIOSMicroWapPay) {
                            callDhPayFn(option, 'wap');
                        } else {
                            NativeBridge.call('quickPayment', JSON.stringify(option), callback, option);
                        }
                    } else {
                        // 微端游戏中，直接调用WAP
                        if (APP.onMicroSDWAPP || (CDLAndroid.sdkAvaliable && CDLAndroid.sdkAvaliable())) {
                            callDhPayFn(option, 'wap');
                        } else {
                            CDLAndroid.quickPayment(JSON.stringify(option));
                        }
                        if (!APP.ky) window.onDHSDKResult = callback;
                    }
                }
                // web pay
                else {
                    var postObj = filterData(option);
                    postObj.config.method = 'web';
                    if (option.paychannel != '') {
                        var wxShowFlag = option.paychannel == 'weixin';
                        postObj.config.alipay = !wxShowFlag;
                        postObj.config.weixin = wxShowFlag;
                    }
                    if (APP.onKD && APP.onAndriod && APP.and_KdVer < 402) postObj.config.alipay = false;
                    postObj.config.qpay = APP.onQQ;
                    dhpayObj && dhpayObj.payfor(postObj);
                }
            };


            /*支付逻辑函数*/

            // 如果有苹果支付，判断是否需要进行苹果支付
            // if (APP.hasApplePay) {
            //     this.cachePayHandler = function (useweb) {
            //         applePayFn();
            //     };
            // }

            // 调取APP的SDK接口
            // else if (this.hasSDK()) {
            //
            //     var callback = this.createSDKCallback(option);
            //
            //     if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            //         // flag [2017-11-07 10:12:47] IOS的SDK支付方法
            //         this.cachePayHandler = function () {
            //
            //             // 微端中，采用wap支付
            //             if (APP.hasIOSMicroWapPay) {
            //                 callDhPayFn(option, 'wap');
            //             } else {
            //                 // 调用原生SDK的支付
            //                 NativeBridge.call('quickPayment', JSON.stringify(option), callback, option);
            //             }
            //         };
            //
            //     } else {
            //
            //         // flag [2017-11-07 10:13:22] 安卓的SDK支付方法
            //         this.cachePayHandler = function () {
            //             // 微端游戏中，直接调用WAP
            //             if (APP.onMicroSDWAPP || (CDLAndroid.sdkAvaliable && CDLAndroid.sdkAvaliable())) {
            //                 callDhPayFn(option, 'wap');
            //             } else {
            //                 CDLAndroid.quickPayment(JSON.stringify(option));
            //             }
            //             // SDK的回调
            //             if (!APP.ky)
            //                 window.onDHSDKResult = callback;
            //         };
            //     }
            //
            // } else {
            //
            //     // 采用网页支付
            //     var postObj = filterData(option);
            //
            //     postObj.config.method = 'web';
            //
            //     if (option.paychannel != '') {
            //         var wxShowFlag = option.paychannel == 'weixin';
            //         postObj.config.alipay = !wxShowFlag;
            //         postObj.config.weixin = wxShowFlag;
            //     }
            //
            //     if (APP.onKD && APP.onAndriod && APP.and_KdVer < 402) {
            //         // 对于口袋老版本的安卓，关闭支付宝
            //         postObj.config.alipay = false;
            //     }
            //
            //     // flag [2017-12-08 10:24:49] QQ中屏蔽微信支付
            //     // if (APP.onQQ) {
            //     //     postObj.config.weixin = false;
            //     // }
            //
            //
            //     // flag [2017-12-08 10:38:00] 非QQ场景，屏蔽QQ支付
            //     postObj.config.qpay = APP.onQQ;
            //
            //     // flag [2017-11-06 15:54:33] 在支付宝中，直接采用支付宝支付（平台做处理）
            //
            //     // flag [2017-12-14 16:25:18] 屏蔽外部的微信支付
            //     // if (!APP.onAPPs) {
            //     //     postObj.config.weixin = false;
            //     // }
            //
            //     this.cachePayHandler = function () {
            //         dhpayObj && dhpayObj.payfor(postObj);
            //     };
            // }

            // 对支付进行最终的检查
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

    isFun: function (callback) {
        return typeof callback === 'function';
    },

    /**
     * 设置分享，会根据目前所在的环境调用分享接口
     *
     * @param res {Object}
     */
    onSetShareOperate: function (res) {
        var option = this.clone(res);
        var self = this;
        var _self_callback = null;
        typeof option.success != 'function' && (option.success = function () {

        });

        typeof option.cancel != 'function' && (option.cancel = function () {

        });

        typeof option.fail != 'function' && (option.fail = function () {

        });

        var param = window.OPEN_DATA ? window.sdw.getUrlObj(window.OPEN_DATA.appurl) : window.sdw.getUrlObj();
        var platform = param['plt'];

        // 第三方的分享
        if (platform && platform != 'null') {
            if (window._LOADED_JS) {
                // 已经加载了文件，直接执行
                self.isFun(window._onSetShareOperate) && window._onSetShareOperate(option);
            } else {
                // 需要保存
                window._onSetShareOperateCacheFn = function () {
                    self.isFun(window._onSetShareOperate) && window._onSetShareOperate(option);
                }
            }
            return;
        }

        var postMsgObj = {
            postSdwData: true,
            operate: 'setSDWShareInfo'
        };

        postMsgObj.shareInfo = option;

        // ******************************************************************************
        // 微信中的分享设置
        // ******************************************************************************

        if (APP.onWeiXin) {
            var wxShare = __sdw__._shareItems.slice(0);
            postMsgObj.source = 'weixin';
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
            // _self_callback = function () {
            //     // 配置分享微信的信息
            //     APP.onWeiXin && sdwShareState.configWXShare(option);
            // }
        }

        // ******************************************************************************
        // 微信中的分享设置
        // ******************************************************************************


        // ******************************************************************************
        // 闪电玩中的分享设置
        // ******************************************************************************

        else if (APP.onShandw || APP.onMDZZHelper) {
            var self = this;
            _self_callback = function () {
                // 闪电玩APP中，配置分享
                option.target = option.target || __sdw__._shareItems.slice(0);
                for (var i = 0; i < option.target.length; i++) {
                    var optionItem = self.clone(option);
                    var callback = self.createCallback(optionItem);
                    optionItem.target = option.target[i];
                    window.NativeBridge.call('onSetShareOperate', optionItem, callback);
                }
            };
        }

        else if (APP.onKD) {

            var self = this;

            var optionItem = self.clone(option);
            var callback = self.createCallback(optionItem);
            window.NativeBridge.call('onSetShareOperate', optionItem, callback);
        }

        // ******************************************************************************
        // 闪电玩中的分享设置
        // ******************************************************************************

        // console.log(APP.ky);

        if (APP.ky) {

            // 跨域，保存回调函数方法，通知父级进行分享设置，然后回调执行
            window.sdw.childSuccessCallback = option.success;
            window.sdw.childCancelCallback = option.cancel;
            window.sdw.childFailCallback = option.fail;
            var postStr = JSON.stringify(postMsgObj);
            parent.postMessage(postStr, '*');

        }

        // else {
        //
        //     window.sdw.childSuccessCallback = option.success;
        //     window.sdw.childCancelCallback = option.cancel;
        //     window.sdw.childFailCallback = option.fail;
        // }
    },

    /**
     * 关闭SDK的支付界面
     */
    closeSDWPay: function () {

        if (this.hasSDK()) {

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

    /**
     * 设置localStorage
     * @param key
     * @param data
     */
    setLocalStorage: function (key, data) {

        // 在IOS的口袋中，localStorage无效的问题
        // flag [2017-12-13 09:39:52] 新增闪电玩的IOS的Storage问题
        if (APP.onIOS && (APP.onKD || APP.onShandw || APP.onMDZZHelper) && APP.ky) {

            // 通知父级页面进行数据的设置
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'sdw_setLocalStorage',
                key: key,
                data: data
            }), '*');

        } else {

            // 其他环境下，直接设置数据
            localStorage['_SDW_' + key] = JSON.stringify({
                name: 'sdw_data',
                data: data
            });
        }
    },

    /**
     *
     * @param key
     * @param callback
     */
    readLocalStorage: function (key, callback) {

        // 在IOS的口袋中，localStorage无效的问题
        if (APP.onIOS && (APP.onKD || APP.onShandw || APP.onMDZZHelper) && APP.ky) {

            // 存储回调函数
            sdw._readLocalStorageCallback = callback;

            // 向父级页面请求数据
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                key: key,
                operate: 'sdw_getLocalStorage'
            }), '*');

        } else {

            // 其他环境下，直接读取
            var _data = localStorage['_SDW_' + key];
            try {

                _data = JSON.parse(_data);
                callback(_data.data);

            } catch (e) {
                callback(null);
            }
        }
    },

    /**
     * 向服务器上报用户创角的服务大区ID号
     * @param option
     */
    postServerId: function (option) {

        console.log('此方法【postServerId】已失效');
        return;

        // if (typeof option.time === 'undefined') {
        //     option.time = +new Date() / 1000 >> 0;
        // }
        //
        // // 王座的进行服务数据的上报
        // if (option.appid === '1414483796') {
        //     var oKey = '' + option.channel + option.appid + option.uid + option.time + option.subject + 'ad8be929a4be929227e72772a05695de';
        //     option.sign = sdw._MD5(oKey);
        // }
        //
        // var uri = 'https://auth.shandw.com/wzupsid?channel=' + option.channel +
        //     '&appid=' + option.appid +
        //     '&uid=' + option.uid +
        //     '&time=' + option.time +
        //     '&subject=' + option.subject +
        //     '&sign=' + option.sign;
        //
        // // if(!window.sjdks){
        // //     window.sjdks = true;
        // sdw.getAjaxData(uri, function (data) {
        //     option.complete && option.complete(data);
        // });
        // // }

    },

    /**
     * CP方上报游戏的详细信息
     * @param option
     */

    postGameInfo: function (option) {

        // console.log('此方法【postGameInfo】还未生效');
        // return;

        console.log('sdw_postGameInfo---sdw.js');


        /*校验数据的合法性*/
        option = option || {};

        var params = ['uid', 'appid', 'channel', 'sid', 'level', 'type', 'vip', 'power', 'new'];
        var params2 = ['id', 'sname', 'nick'];
        for (var i = 0; i < params.length; i++) {
            if (typeof option[params[i]] === 'undefined') {
                console.log('缺少必填参数字段', params[i]);
                return;
            }
        }

        for (var i = 0; i < params2.length; i++) {
            if (typeof option[params2[i]] === 'undefined') {
                option[params2[i]] = '';
            }
        }

        /**
         * uid    用户闪电玩平台id（必带）    Long
         appid    游戏id，闪电玩分配的游戏id（必带）    String
         channel    闪电玩平台带过去的channelid（必带）    Int
         id    玩家在游戏大区中游戏的id（可选）    String
         nick    玩家游戏中的昵称（可先）    String
         sid    玩家所在游戏大区id（如果游戏没有分大区，使用0）（必带）    String
         sname    游戏大区名称 （可选）    String
         level    用户等级（必带）    Int
         type    游戏类型（必带）    String
         vip    用户vip等级（没有为0）（必带）    Int
         power    玩家综合能力。如战斗力（必带）    Int
         new    是否创角0/1（必带）    Int
         sign    sign=Md5（appid+channel+uid+sid+id+sname+nick+level+type+vip+power+new+token）
         Token：校验原始token
         sdw_extdata:透传参数，跟channel一致
         如果参数为空这不加入到md5中，所有参数md5前都不需要urlencode,网络传输的时候需要urlencode    String
         */

        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;

        // 第三方
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._getGameUserInfo) && window._getGameUserInfo(option);

            } else {

                // 需要保存
                var _getGameUserInfoCacheFn = function () {
                    self.isFun(window._getGameUserInfo) && window._getGameUserInfo(option);
                };

                self.th_callback.push(_getGameUserInfoCacheFn);
            }
        }


        // 向域名
        if (APP.ky) {
            // 向父级页面请求数据
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                data: option,
                operate: 'sdw_postGameInfo'
            }), '*');
        }

    },


    clone: function (resource) {

        if (typeof resource == 'object') {
            var result = {};

            for (var i in resource) {
                result[i] = resource[i];
            }
        }

        return result;
    },

    /**
     * 获取授权信息，会有与第三方的auth有关联
     *
     * @param option   {platform:'平台的代号',gid:'闪电玩平台的游戏id',channel:''}
     * @param callback function(data){ // 游戏授权信息，跟之前url的参数一致}
     */
    getAuthInfo: function (option, callback) {

        var platform = option.platform, gid = option.gid, authJsUrl = '';

        if (platform === 'sdw') {

            // 在闪电玩中，获取授权的信息（跨域的，iframe获取）
        }

        if (platform && gid && platform !== 'null') {

            window.sdw._authCallback = callback;

            window.sdw._authParam = window.sdw._authParam || {};

            window.sdw._authParam.cGid = gid;  // 保存游戏的id

            window.sdw._authParam.plt = platform;

            window.sdw._authParam.channel = option.channel;

            authJsUrl = 'https://www.shandw.com/3th/' + platform + '/auth.js?m=' + (+new Date());

            window.sdw.addJsFile(authJsUrl, function () {

                console.log('加载第三方的用户授权js文件...');

            });

        } else {

            alert('[sdw.getAuthInfo]:缺少platform和gid字段');
        }

    },

    /**
     * 获取闪电玩的关注信息
     * @param callback
     * @private
     */
    _getQCode: function () {

        if (APP.onWeiXin) {
            return {
                atSDW: sdw._atSdwInfo.atSDW,
                result: 1
            }
        } else {
            return {
                atSDW: 1,
                result: 1
            }
        }

    },


    getSdwQcodeInfo: function (gid, callback) {

        if (arguments.length === 0) {
            console.log('缺少参数');
            return;
        }

        if (arguments.length === 1) {
            callback = gid;
        }

        // if (!(SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid)) return;
        // if (!APP.onWeiXin) {
        //     sdw._atSdwInfo = {atSDW: 1, qrcode: ''}
        // }

        if (sdw._atSdwInfo) {
            if (this.isFun(callback)) {
                callback(sdw._getQCode());
            }

        } else if (APP.ky) {
            sdw._getQcodeInfo_callback = callback;
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                gid: gid,
                operate: 'getSdwQcodeInfo'
            }), '*');
        }
    },


    // 显示二维码
    onShowQcode: function (gid, callback) {

        if (arguments.length === 1) {
            callback = gid;
        }

        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;

        // 第三方的分享
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._onShowQcode) && window._onShowQcode(callback);

            } else {

                // 需要保存
                var _onShowQcodeCacheFn = function () {
                    self.isFun(window._onShowQcode) && window._onShowQcode(callback);
                };

                self.th_callback.push(_onShowQcodeCacheFn);
            }

        } else {

            // if (APP.onWeiXin) {

            // 显示闪电玩的二维码 动态生成二维码地址
            if (APP.ky) {
                window.parent.postMessage(JSON.stringify({
                    postSdwData: true,
                    gid: gid,
                    operate: 'onShowQcode'
                }), '*');
            }

            // } else {
            //
            //     console.log('非微信登录的环境，暂未开放。');
            // }
        }
    },

    // 带回调的显示二维码
    onFocus: function (callback) {

        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;

        // 第三方的分享
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._onFocus) && window._onFocus(callback);

            } else {

                // 需要保存
                var _onFocusCacheFn = function () {
                    self.isFun(window._onFocus) && window._onFocus(callback);
                };

                self.th_callback.push(_onFocusCacheFn);
            }
        }

    },

    // 显示分享引导
    onShowShareLayer: function () {
        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;
        // 第三方的分享
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._onShowShareLayer) && window._onShowShareLayer();
            } else {
                // 需要保存
                var _onShowShareLayerCacheFn = function () {
                    self.isFun(window._onShowShareLayer) && window._onShowShareLayer();
                };
                self.th_callback.push(_onShowShareLayerCacheFn);
            }
        }
    },

    // 平台分享（暂时只用新浪分享）
    pltShare: function (data) {
        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;
        // 第三方的分享
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._pltShare) && window._pltShare(data);
            } else {
                // 需要保存
                var _pltShareCacheFn = function () {
                    self.isFun(window._pltShare) && window._pltShare(data);
                };
                self.th_callback.push(_pltShareCacheFn);
            }
        }
    },

    // 获取游戏的用户的信息
    getGameUserInfo: function (data, isNew) {

        console.log('此方法【getGameUserInfo】已失效，请调用新的方法');
        return;

        var param = window.sdw.getUrlObj();
        var platform = param['plt'];
        var self = this;

        isNew = isNew || false;

        // 第三方
        if (platform && platform !== 'null') {
            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._getGameUserInfo) && window._getGameUserInfo(data, isNew);

            } else {

                // 需要保存
                var _getGameUserInfoCacheFn = function () {
                    self.isFun(window._getGameUserInfo) && window._getGameUserInfo(data, isNew);
                };

                self.th_callback.push(_getGameUserInfoCacheFn);
            }
        }

    },

    // 设置保存到桌面，具体是啥需求。
    addDesktop: function (option) {

        var self = this;

        // 玩吧添加桌面
        var param = window.OPEN_DATA ? window.sdw.getUrlObj(window.OPEN_DATA.appurl) : window.sdw.getUrlObj();
        var platform = param['plt'];

        // 第三方的分享
        if (platform && platform != 'null') {

            option = option || {};

            var option = {
                title: option.name,
                icon: option.icon,
                url: option.linkUrl,
                success: option.success
            };


            if (window._LOADED_JS) {

                // 已经加载了文件，直接执行
                self.isFun(window._addDesktop) && window._addDesktop(option);

            } else {

                // 需要保存
                window._addDesktop_callback = function () {
                    self.isFun(window._addDesktop) && window._addDesktop(option);
                };

                // 保存回调函数
                window.th_callback.push(_addDesktop_callback);
            }
            return;
        }


        // 闪电玩平台的生成桌面
        if (APP.ky) {
            // 向父级页面请求数据
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'sdw_addDesktop'
            }), '*');
        } else {

            console.log('只能在IFRAME模式下调用');
        }
    },

    // 开启全屏的
    requestFullScreen: function () {

        // flag [2018-01-31 15:15:29] 闪电玩APP全屏位置偏移bug
        if (APP.onShandw && APP.onIOS) return;

        if (APP.ky) {
            // 向父级页面请求数据
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'requestFullScreen'
            }), '*');
        } else {
            console.log('只能在IFRAME模式下调用');
        }
    },

    // 退出全屏
    exitFullScreen: function () {
        if (APP.ky) {
            // 向父级页面请求数据
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'exitFullScreen'
            }), '*');
        } else {
            console.log('只能在IFRAME模式下调用');
        }
    },

    // 子通知父级页面，打开页面
    openUrlToRoot: function (option) {
        option = option || {};
        option.url = option.url || location.href;
        if (APP.ky) {
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'openUrlToRoot',
                option: option
            }), '*');
        } else {
            location.href = option.url;
        }
    },

    // flag [2018-01-18 16:14:32] 游戏数据传给客户端
    postGameInfoToClient: function (data) {

        // alert('postGameInfoToClient  sdwJS');

        if (APP.ky) {
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'postGameInfoToClient',
                data: data
            }), '*');
        }
    },

    // flag [2018-01-22 16:23:06] 游戏打开活动的地址
    // openActivityPage: function (aid) {
    //     if (APP.ky) {
    //         window.parent.postMessage(JSON.stringify({
    //             postSdwData: true,
    //             operate: 'openActivityPage',
    //             aid: aid
    //         }), '*');
    //     }
    // },

    // flag [2018-01-25 11:29:17] 游戏创角
    postGamePlayerInfo: function (option) {
        if (!APP.onMicroSDWAPP) return;

        if (APP.ky) {
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'postGamePlayerInfo',
                data: option
            }), '*');
        }
    },

    // flag [2018-01-25 11:29:17] 支付成功
    postPaySuccessInfo: function (option) {

        if (!APP.onMicroSDWAPP) return;

        option = option || {};

        option.paymentType = 'wxpay';

        if (APP.ky) {
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'postPaySuccessInfo',
                data: option
            }), '*');
        }
    },

    // flag [2018-01-25 11:31:21] 唤起支付
    postChoosePayInfo: function (option) {
        if (!APP.onMicroSDWAPP) return;
        option = option || {};
        option.paymentType = option.paymentType || 'wxpay';
        if (APP.ky) {
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                operate: 'postChoosePayInfo',
                data: option
            }), '*');
        }
    }
};

// 父级页面消息通知到本页面 ****************
if (APP.ky) {

    window.addEventListener('message', function (e) {

        if (typeof e.data === 'string') {

            try {
                var postData = JSON.parse(e.data);
                // console.log('sdw...', postData)
                if (postData.postSdwData) {
                    var type = postData.oprate;
                    // 分享回调
                    if (type == 'shareCallback_success') {
                        window.sdw.childSuccessCallback && window.sdw.childSuccessCallback();
                    }

                    if (type == 'shareCallback_cancel') {
                        window.sdw.childFailCallback && window.sdw.childCancelCallback();
                    }

                    if (type == 'shareCallback_fail') {
                        window.sdw.childFailCallback && window.sdw.childFailCallback();
                    }

                    if (type == 'choosePayCheckState_ok') {
                        // 执行支付
                        var useweb = postData.useweb;
                        sdw.cachePayHandler && sdw.cachePayHandler(useweb);
                    }
                    if (type == 'getLocalStorage_ok') {
                        // 读取数据
                        var data = postData.data;
                        sdw._readLocalStorageCallback && sdw._readLocalStorageCallback(data);
                    }
                    if (type == 'createNativeBridgeCallback_callback') {
                        // 根据ID进行回调
                        var callbackFn = window.NativeBridge.callbacks[postData.callbackId];
                        if (callbackFn) {
                            // 苹果支付需要传入一下
                            if (postData.fncName === 'ApplePayment') {
                                callbackFn(postData.res);
                            } else {
                                callbackFn();
                            }
                        }
                    }
                    if (postData.operate == 'window_size_change') {

                        if (typeof sdw.onResize === 'function') {
                            sdw.onResize(postData.width, postData.height);
                        } else {
                            console.log(postData.width, postData.height, 'resize');
                        }
                    }


                    if (postData.operate == 'getSdwQcodeInfo_callback') {
                        sdw._atSdwInfo = postData.data;
                        sdw._getQcodeInfo_callback && sdw._getQcodeInfo_callback(sdw._getQCode());
                    }

                }

            } catch (e) {

                console.log(e);
            }

        }


    }, false);
}

window.sdw._MD5 = function (q) {

    function to_zerofilled_hex(n) {
        var a = (n >>> 0).toString(16);
        return "00000000".substr(0, 8 - a.length) + a
    }

    function chars_to_bytes(a) {
        var b = [];
        for (var i = 0; i < a.length; i++) {
            b = b.concat(str_to_bytes(a[i]))
        }
        return b
    }

    function int64_to_bytes(a) {
        var b = [];
        for (var i = 0; i < 8; i++) {
            b.push(a & 0xFF);
            a = a >>> 8
        }
        return b
    }

    function rol(a, b) {
        return ((a << b) & 0xFFFFFFFF) | (a >>> (32 - b))
    }

    function fF(b, c, d) {
        return (b & c) | (~b & d)
    }

    function fG(b, c, d) {
        return (d & b) | (~d & c)
    }

    function fH(b, c, d) {
        return b ^ c ^ d
    }

    function fI(b, c, d) {
        return c ^ (b | ~d)
    }

    function bytes_to_int32(a, b) {
        return (a[b + 3] << 24) | (a[b + 2] << 16) | (a[b + 1] << 8) | (a[b])
    }

    function str_to_bytes(a) {
        var b = [];
        for (var i = 0; i < a.length; i++) if (a.charCodeAt(i) <= 0x7F) {
            b.push(a.charCodeAt(i))
        } else {
            var c = encodeURIComponent(a.charAt(i)).substr(1).split('%');
            for (var j = 0; j < c.length; j++) {
                b.push(parseInt(c[j], 0x10))
            }
        }
        return b
    }

    function int128le_to_hex(a, b, c, d) {
        var e = "";
        var t = 0;
        var f = 0;
        for (var i = 3; i >= 0; i--) {
            f = arguments[i];
            t = (f & 0xFF);
            f = f >>> 8;
            t = t << 8;
            t = t | (f & 0xFF);
            f = f >>> 8;
            t = t << 8;
            t = t | (f & 0xFF);
            f = f >>> 8;
            t = t << 8;
            t = t | f;
            e = e + to_zerofilled_hex(t)
        }
        return e
    }

    function typed_to_plain(a) {
        var b = new Array(a.length);
        for (var i = 0; i < a.length; i++) {
            b[i] = a[i]
        }
        return b
    }

    var r = null;
    var s = null;
    if (typeof q == 'string') {
        r = str_to_bytes(q)
    } else if (q.constructor == Array) {
        if (q.length === 0) {
            r = q
        } else if (typeof q[0] == 'string') {
            r = chars_to_bytes(q)
        } else if (typeof q[0] == 'number') {
            r = q
        } else {
            s = typeof q[0]
        }
    } else if (typeof ArrayBuffer != 'undefined') {
        if (q instanceof ArrayBuffer) {
            r = typed_to_plain(new Uint8Array(q))
        } else if ((q instanceof Uint8Array) || (q instanceof Int8Array)) {
            r = typed_to_plain(q)
        } else if ((q instanceof Uint32Array) || (q instanceof Int32Array) || (q instanceof Uint16Array) || (q instanceof Int16Array) || (q instanceof Float32Array) || (q instanceof Float64Array)) {
            r = typed_to_plain(new Uint8Array(q.buffer))
        } else {
            s = typeof q
        }
    } else {
        s = typeof q
    }
    if (s) {
        alert('MD5 type mismatch, cannot process ' + s)
    }

    function _add(a, b) {
        return 0x0FFFFFFFF & (a + b)
    }

    return do_digest();

    function do_digest() {
        function updateRun(e, f, g, h) {
            var i = d;
            d = c;
            c = b;
            b = _add(b, rol(_add(a, _add(e, _add(f, g))), h));
            a = i
        }

        var j = r.length;
        r.push(0x80);
        var k = r.length % 64;
        if (k > 56) {
            for (var i = 0; i < (64 - k); i++) {
                r.push(0x0)
            }
            k = r.length % 64
        }
        for (i = 0; i < (56 - k); i++) {
            r.push(0x0)
        }
        r = r.concat(int64_to_bytes(j * 8));
        var l = 0x67452301;
        var m = 0xEFCDAB89;
        var n = 0x98BADCFE;
        var o = 0x10325476;
        var a = 0, b = 0, c = 0, d = 0;
        for (i = 0; i < r.length / 64; i++) {
            a = l;
            b = m;
            c = n;
            d = o;
            var p = i * 64;
            updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(r, p), 7);
            updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(r, p + 4), 12);
            updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(r, p + 8), 17);
            updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(r, p + 12), 22);
            updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(r, p + 16), 7);
            updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(r, p + 20), 12);
            updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(r, p + 24), 17);
            updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(r, p + 28), 22);
            updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(r, p + 32), 7);
            updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(r, p + 36), 12);
            updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(r, p + 40), 17);
            updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(r, p + 44), 22);
            updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(r, p + 48), 7);
            updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(r, p + 52), 12);
            updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(r, p + 56), 17);
            updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(r, p + 60), 22);
            updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(r, p + 4), 5);
            updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(r, p + 24), 9);
            updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(r, p + 44), 14);
            updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(r, p), 20);
            updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(r, p + 20), 5);
            updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(r, p + 40), 9);
            updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(r, p + 60), 14);
            updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(r, p + 16), 20);
            updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(r, p + 36), 5);
            updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(r, p + 56), 9);
            updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(r, p + 12), 14);
            updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(r, p + 32), 20);
            updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(r, p + 52), 5);
            updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(r, p + 8), 9);
            updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(r, p + 28), 14);
            updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(r, p + 48), 20);
            updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(r, p + 20), 4);
            updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(r, p + 32), 11);
            updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(r, p + 44), 16);
            updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(r, p + 56), 23);
            updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(r, p + 4), 4);
            updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(r, p + 16), 11);
            updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(r, p + 28), 16);
            updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(r, p + 40), 23);
            updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(r, p + 52), 4);
            updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(r, p), 11);
            updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(r, p + 12), 16);
            updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(r, p + 24), 23);
            updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(r, p + 36), 4);
            updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(r, p + 48), 11);
            updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(r, p + 60), 16);
            updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(r, p + 8), 23);
            updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(r, p), 6);
            updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(r, p + 28), 10);
            updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(r, p + 56), 15);
            updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(r, p + 20), 21);
            updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(r, p + 48), 6);
            updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(r, p + 12), 10);
            updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(r, p + 40), 15);
            updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(r, p + 4), 21);
            updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(r, p + 32), 6);
            updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(r, p + 60), 10);
            updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(r, p + 24), 15);
            updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(r, p + 52), 21);
            updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(r, p + 16), 6);
            updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(r, p + 44), 10);
            updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(r, p + 8), 15);
            updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(r, p + 36), 21);
            l = _add(l, a);
            m = _add(m, b);
            n = _add(n, c);
            o = _add(o, d)
        }
        return int128le_to_hex(o, n, m, l).toUpperCase()
    }
};

window.sdw.getAjaxData = function (url, success) {

    if (!url) {
        console.log('[getAjaxData]: url error');
        return;
    }

    function createXMLHTTPRequest() {
        var xmlHttpRequest;
        if (window.XMLHttpRequest) {
            xmlHttpRequest = new XMLHttpRequest();

            if (xmlHttpRequest.overrideMimeType) {
                xmlHttpRequest.overrideMimeType("text/xml");
            }
        } else if (window.ActiveXObject) {
            var activexName = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
            for (var i = 0; i < activexName.length; i++) {
                try {
                    xmlHttpRequest = new ActiveXObject(activexName[i]);
                    if (xmlHttpRequest) {
                        break;
                    }
                } catch (e) {
                }
            }
        }
        return xmlHttpRequest;
    }

    var req = createXMLHTTPRequest();

    if (req) {
        req.open("GET", url, true);

        req.onreadystatechange = function () {

            if (req.readyState == 4 && req.status == 200) {

                var data = JSON.parse(req.responseText);

                success && success(data);

            } else {
                console.log('[AJAX ERROR]:', req)
            }
        };
        req.send(null);
    }
};

window.sdw.getUrlObj = function (url) {

    var urls = url || location.search;

    var qs = (urls.length > 0 ? urls.substring(1) : ""),
        args = {},
        items = qs.length ? qs.split("&") : [],
        item = null, name = null, value = null;
    for (var i = 0; i < items.length; i++) {
        item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        if (name.length)
            args[name] = value;
    }
    return args;
};

window.sdw.addJsFile = function (url, callback) {

    var oHead = document.getElementsByTagName('HEAD').item(0);
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    oScript.src = url;
    oHead.appendChild(oScript);

    oScript.onload = function () {
        typeof callback === 'function' && callback();
    };

};

window.sdw.onResize = function (width, height) {

    console.log('resize...此处CP可重新定义此函数...');

};


window.sdw.dialogMessage = function (option) {

    if (APP.ky) {
        // 向父级页面请求数据
        window.parent.postMessage(JSON.stringify({
            postSdwData: true,
            option: option,
            operate: 'sdw_dialogMessage'
        }), '*');
    } else {
        console.log('只能在IFRAME模式下调用');
    }
};


// 游戏界面，设置悬浮窗的垂直位置
window.sdw.setGameToolPositionY = function (y) {

    if (y < 0 || y > 1) {
        console.log('y的范围错误');
        return;
    }

    if (APP.ky) {
        // 向父级页面请求数据
        window.parent.postMessage(JSON.stringify({
            postSdwData: true,
            y: y,
            operate: 'sdw_setGameToolPositionY'
        }), '*');
    } else {
        console.log('只能在IFRAME模式下调用');
    }
};

window.sdw.openSafari = function (option) {
    option.isSet = false;
    window.NativeBridge.call('createDesktop', option, null, option, 'kd');
};

window.sdw.dialogMessage = function (option) {

    if (APP.ky) {
        // 向父级页面请求数据
        window.parent.postMessage(JSON.stringify({
            postSdwData: true,
            option: option,
            operate: 'sdw_dialogMessage'
        }), '*');
    } else {
        console.log('只能在IFRAME模式下调用');
    }
};


// 游戏界面，设置悬浮窗的垂直位置
window.sdw.setGameToolPositionY = function (y) {

    if (y < 0 || y > 1) {
        console.log('y的范围错误');
        return;
    }

    if (APP.ky) {
        // 向父级页面请求数据
        window.parent.postMessage(JSON.stringify({
            postSdwData: true,
            y: y,
            operate: 'sdw_setGameToolPositionY'
        }), '*');
    } else {
        console.log('只能在IFRAME模式下调用');
    }

};


window.sdw.openSafari = function (option) {
    option.isSet = false;
    window.NativeBridge.call('createDesktop', option, null, option, 'kd');
};

// 设置分享
window.sdw.canSetShare = OS.onKD || OS.onShandw || OS.onWeiXin;

// 玩吧分享
window.sdw.canAddDesktop = OS.onKD || OS.onShandw || window.OPEN_DATA;

// 载入第三方的文件
(function () {

    if (window.OPEN_DATA && window.OPEN_DATA.appurl) {
        var param = window.sdw.getUrlObj(window.OPEN_DATA.appurl.split('?')[1]);
        var supportPay = true;
    } else {
        var param = window.sdw.getUrlObj();
        var supportPay = param['pltpay'];
    }


    var platform = param['plt'];

    // 对于支持第三方支付的平台，加载第三方的支付函数
    if (platform && supportPay && platform !== 'null') {

        // 第三方平台支付js文件路径
        var jsFileUrl = 'https://www.shandw.com/3th/' + platform + '/pay.js?m=' + (+new Date());
        // 加载文件，异步
        window.sdw.addJsFile(jsFileUrl, function () {
            window._LOADED_JS = true;
            // 对缓存的函数，进行统一处理
            for (var i = 0; i < window.sdw.th_callback.length; i++) {
                // console.log('callback', window.sdw.th_callback[i]);
                window.sdw.th_callback[i]();
            }
        });
    }
})();


// window.sdw.MOBILE_GAME = 'http://wwww.shandw.com/m/ngame/';





