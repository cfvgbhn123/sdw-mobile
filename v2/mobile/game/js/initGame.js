/**
 * Created by CHEN-BAO-DENG on 2017/3/20.
 *
 * 游戏部分功能初始化
 *
 * 1.游客模式的检查
 * 2.闪电玩分享对象
 *
 */

// 对下架的游戏做跳转处理
(function () {

    var closeLink = {
        '1397969747': 'http://cdn.app.m3guo.com/html/201710/59ef016b275a4.html'
    };

    if (closeLink[SDW_WEB.MOBILE_GAME_GID]) {
        location.href = closeLink[SDW_WEB.MOBILE_GAME_GID];
    }

})();

var HTTP_AUTH = HTTP_USER_STATIC + 'authgame';
var _protocol_ = location.protocol;
var meiweiTimer = null ;
var tipClock = false ;
function meiWeiGetQueue(thirdSign,shouldTip) {
    if(tipClock) {
        clearInterval(meiweiTimer);
        return ;
    }
    var postUri = SDW_WEB.URLS.addParam({
        channel: SDW_WEB.channel,
        wxCode:SDW_WEB.URLS.queryUrl()['wxCode'],
        thirdSign:thirdSign,
        // }, false, HTTP_USER_STATIC + 'meiWeiGetQueue');
    }, false, 'http://meiwei.shandw.com/meiWeiGetQueue');
    // 等待服务端的验证；
    SDW_WEB.getAjaxData(postUri, function(data) {
        if(data.result === 1) {
            if(data.data){
                var content = 	data.data ;
                if(content.state == 4){
                   // dialog.show('ok', '【'+content.shopName+'】提醒您：您的排队号'+content.num+'可以用餐了', 1);
                    shouldTip && dialog.show('ok','【'+content.shopName+'】提醒您：您的排队号'+content.num+'可以用餐了',false,{title:'叫号提醒',btn:'知道了'});
                    clearInterval(meiweiTimer);
                    tipClock = true ;
                    return ;
                }

                if(content.state == 6){
                    shouldTip && dialog.show('ok','【'+content.shopName+'】提醒您：您的排队号'+content.num+'已过号',false,{title:'过号提醒',btn:'知道了'});
                    clearInterval(meiweiTimer);
                    tipClock = true ;
                    return ;
                }
                if(content.state == 2 || content.state == 3){
                    if (shouldTip)  return ;
                    meiweiTimer = setInterval(function () {
                        meiWeiGetQueue(thirdSign,true);
                    },10000);
                }else{
                    clearInterval(meiweiTimer);
                }

            }


        }else{
            clearInterval(meiweiTimer);
        }
    })
}

(function () {

    function toGamePageMessage(data) {
        var ifm = document.querySelector('#my-game-container');
        if (ifm) {
            ifm.contentWindow.postMessage(JSON.stringify(data), '*');
        }
    }

    if (SDW_WEB.onAndriod) {
        window.onDHSDKResult = function () {
            toGamePageMessage({
                postSdwData: true,
                operate: 'DH_WAP_PAY_CALLBACK'
            });
            // var ifm = document.querySelector('#my-game-container');
            // if (ifm) {
            //     ifm.contentWindow.postMessage(JSON.stringify({
            //
            //     }), '*');
            // }
        };
    }

    // 分享成功的回调函数
    SDW_WEB.share_success_callback = function () {
        dialog.show('ok', '您已经分享成功', 1);
        var PAGE_TIME = SDW_WEB.getNow();
        // 分享成功，设置分享的时间
        SDW_WEB.Store.set('_SDW_SHARE_TIME_' + SDW_WEB.USER_INFO.uid, PAGE_TIME, true);
        localStorage['_SDW_SHARE_TIME_' + SDW_WEB.USER_INFO.uid] = '' + PAGE_TIME;
        addShareGameList();
    };


    var addShareGameList = function () {
        var dayGame = 'day_game_list' + SDW_WEB.USER_INFO.uid;
        var isToday = function (d1, d2) {
            var eY = d1.getFullYear();
            var eM = d1.getMonth() + 1;
            var eD = d1.getDate();
            var nY = d2.getFullYear();
            var nM = d2.getMonth() + 1;
            var nD = d2.getDate();
            if (eY === nY && eM === nM && eD === nD) {
                return true;
            }
            return false;
        };

        /*添加每日游戏分享的记录*/
        if (SDW_WEB.MOBILE_GAME_GID) {

            var listObj = SDW_WEB.Store.get(dayGame, true);
            var curTime = new Date();

            if (listObj) {
                var hisTime = new Date(listObj.time);
                listObj.list = listObj.list || [];
                if (!isToday(curTime, hisTime)) {
                    // 如果不是今日，清空list数据
                    listObj.list = [];
                }
            } else {
                listObj = {};
                listObj.list = [];
            }

            listObj.time = +curTime;
            listObj.list.push(SDW_WEB.MOBILE_GAME_GID);

            SDW_WEB.Store.set(dayGame, listObj, true);
        }
    };

    // 设置游戏的分享链接
    // flag [2018-04-27 10:46:34] 给CP设置的链接强制加上平台的分享者ID
    SDW_WEB.changeShareLinks = function (link) {

        if (!link) {
            if (SDW_WEB.onWyqq) {
                link = 'http://www.shandw.com/wyqq/game/' + SDW_WEB.MOBILE_GAME_GID + '.html?channel=' + SDW_WEB.channel;
            } else {
                link = SDW_PATH.GAME_URL('play', SDW_WEB.MOBILE_GAME_GID);
            }

        }
        // var gUrl = SDW_PATH.GAME_URL('play', SDW_WEB.MOBILE_GAME_GID);
        // var shareLinks = gUrl + '&_sender_sdw_rfid_=' + SDW_WEB.USER_INFO.uid;
        var shareLinks = link;

        // 只对_sender_sdw_rfid_进行一次追加
        if (!/_sender_sdw_rfid_/.test(link) && SDW_WEB.USER_INFO.uid) {
            shareLinks = SDW_WEB.URLS.addParam({
                '_sender_sdw_rfid_': SDW_WEB.USER_INFO.uid,
            }, true, link);
        }

        return shareLinks;
    };

    function checkVisitor() {

        if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {
            visitorMode.isVisitor = false;
        } else {
            visitorMode.isVisitor = true;
        }
    }

    // 游客模式对象
    window.visitorMode = {
        isVisitor: true,
        visitorToken: '',

        /**
         *
         * 游客模式授权游戏，
         * 如果在微端中，需要授权用户信息，然后保存下来
         *
         * @param callback
         * @param isReview
         *
         */
        authGame: function (callback, isReview) {
            var gid = SDW_WEB.MOBILE_GAME_GID, self = this;

            if (!gid) {
                alert('缺少游戏id');
                return;
            }

            var channel = SDW_WEB.channel;
            var sec = +new Date();
            var token = SDW_WEB.MD5('' + channel + gid + SDW_WEB.guid + sec + '0ef7a6ba9d8d288fbeca1cdebf13c03e');

            var postParam = {
                channel: channel,
                token: token,
                gid: gid,
                sec: sec,
                loginType: 0
            };

            // 闪电玩微端，采用新的请求
            if (typeof isReview !== 'undefined') {

                var postUri = SDW_WEB.URLS.addParam(postParam, false, HTTP_USER_STATIC + 'divauth');

            } else {
                if(SDW_WEB.wxLoginPay){
                    alert('请先登陆');
                    return ;
                }

               var postUri = SDW_WEB.URLS.addParam(postParam, false, HTTP_USER_STATIC + 'vstgame');
            }
            console.log('postUri',postUri);
            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result == 1) {

                    SDW_WEB.setLoadText.setText('auth');

                    if (typeof isReview !== 'undefined') {
                        // 需要重新
                        SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};
                        SDW_WEB.USER_INFO.uid = data.uid;
                    }

                    setShareInfo(data);

                    window.visitorIconSrc = data.sIcon;

                    self.visitorToken = data.vstToken;

                    visitorMode._visitorToken = data.vstToken;

                    checkGameUrl(data);

                    callback && callback(data.sIcon);

                    // console.log('auth game', data)

                    SDW_WEB.sdw.onSetShareOperate({
                        title: data.sTit,
                        desc: data.sDes,
                        link: SDW_WEB.changeShareLinks(),
                        imgUrl: SDW_WEB._sIcon,  // 服务端的
                        success: function () {
                            SDW_WEB.share_success_callback();
                        },
                        cancel: function () {

                        }
                    });

                } else {

                    alert(data.msg);
                }
            });
        },

    };

    function setShareInfo(data) {
        document.title = data.name;
        $('.sIcon').attr('href', data.sIcon);
        $('.sTitle').attr('content', data.name);
        $('#setShareImg').attr('src', data.sIcon);
        // 设置分享的文案
        $('.sDesc').attr('content', data.sDes);
    }


    // 接收子页面的消息传递
    window.addEventListener('message', function (e) {

        // console.log(e);
        if (typeof e.data === 'string') {

            try {
                var postData = JSON.parse(e.data);
                // ello小游戏消息传递
                if (postData.postElloData) {
                    _myFuchuang.fchiddenFn(0);
                    _myFuchuang.tabNav(window.moreGame, window.moreGame.$index);
                    SDW_WEB.onIOS && $('#my-game-container').addClass('my-game-container-ani');
                } else if (postData.postSdwData) {

                    // 微端的支付
                    if (postData.operate == 'DH_WAP_PAY_CALLBACK') {

                        var callbackId = window.NativeBridge.callbacksCount++;
                        var callback = function () {
                            // // 创建ios回调的通知，父级页面告知子页面，执行用户设置的回调函数
                            e.source.postMessage(JSON.stringify({
                                postSdwData: true,
                                operate: 'DH_WAP_PAY_CALLBACK'
                            }), '*');
                        };

                        var jsonString = JSON.stringify({
                            callbackId: callbackId,
                            args: JSON.stringify(postData.args)
                        });

                        window.NativeBridge.callbacks[callbackId] = callback;

                        var uri = 'tongjunling://wapPayment#' + jsonString;

                        var iFrame = document.createElement("IFRAME");
                        iFrame.src = uri;
                        document.documentElement.appendChild(iFrame);
                        iFrame.parentNode.removeChild(iFrame);
                        iFrame = null;
                    }

                    // 全屏化
                    else if (postData.operate === 'requestFullScreen') {
                        _SDW_MessageEvents.requestFullScreen();
                    }
                    // 退出全屏化
                    else if (postData.operate === 'exitFullScreen') {
                        _SDW_MessageEvents.exitFullScreen();
                    }

                    // 添加到桌面的接口
                    else if (postData.operate === 'sdw_addDesktop') {
                        setShandwDesktop({}, false);
                    }

                    // 创建跨域回调
                    else if (postData.operate == 'createNativeBridgeCallback') {

                        var option = JSON.parse(postData.optionStr);
                        var callback = function (res) {
                            e.source.postMessage(JSON.stringify({
                                postSdwData: true,
                                fncName: postData.fncName,
                                callbackId: postData.callbackId,
                                res: res,
                                operate: 'createNativeBridgeCallback_callback'
                            }), '*');

                        };

                        window.NativeBridge.callbacks[postData.callbackId] = callback;

                        var jsonString = JSON.stringify({
                            callbackId: postData.callbackId,
                            args: postData.args
                        });

                        var uri = '';

                        if (postData.fncName === 'quickPayment' || postData.fncName === 'ApplePayment') {
                            uri = 'payment://';
                        } else if (SDW_WEB.onShandw) {
                            uri = 'sdw://';
                        } else if (SDW_WEB.onKD) {
                            uri = 'kd://';
                        }

                        uri += postData.fncName + '#' + jsonString;

                        var iFrame = document.createElement("IFRAME");
                        iFrame.src = uri;
                        document.documentElement.appendChild(iFrame);
                        iFrame.parentNode.removeChild(iFrame);
                        iFrame = null;

                    } else if (postData.operate == 'callquickPayment_Android') {

                        var option = JSON.parse(postData.optionStr);
                        option.complete = option.complete && eval("(" + option.complete + ")");

                        var callback = top.NativeBridge.createSDKCallback(option);

                        CDLAndroid.quickPayment(JSON.stringify(option));
                        top.onDHSDKResult = callback;

                    } else if (postData.operate === 'setSDWShareInfo') {

                        _SDW_MessageEvents.setSDWShareInfo(e, postData);

                    } else if (postData.operate === 'checkVisitorMode') {

                        _SDW_MessageEvents.checkVisitorMode(e, postData);

                    } else if (postData.operate === 'sdw_setLocalStorage') {

                        _SDW_MessageEvents.sdw_setLocalStorage(e, postData);

                    } else if (postData.operate === 'sdw_getLocalStorage') {

                        _SDW_MessageEvents.sdw_getLocalStorage(e, postData);

                    } else if (postData.operate === 'to_competition') {

                        _SDW_MessageEvents.to_competition(e, postData);

                    } else if (postData.operate === 'sdw_postGameInfo') {

                        _SDW_MessageEvents.sdw_postGameInfo(e, postData);
                    }

                    else if (postData.operate === 'openUrlToRoot') {
                        _SDW_MessageEvents.openUrlToRoot(e, postData.option);
                    }


                    // flag [2017-12-22 09:31:53] 显示通知弹窗（游戏浮窗）
                    else if (postData.operate === 'sendMsg') {

                        var type = postData.data.iconClass;
                        var message = postData.data.message;
                        var time = postData.data.duration || 0;

                        if (type === 'fail') {
                            type = 'error';
                        }

                        if (type === 'success') {
                            type = 'ok';
                        }

                        dialog.show(type || 'ok', message);
                        dialog.hidden(time);

                    } else {

                        /*统一的处理*/
                        var _callback = _SDW_MessageEvents[postData.operate];
                        if (_callback) {
                            _callback(e, postData);
                        }
                    }


                } else if (postData.wxappId && postData.wxpaySign) {
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                            "appId": postData.wxappId,//公众号名称，由商户传入
                            "timeStamp": postData.wxtimeStamp, //时间戳
                            "nonceStr": postData.wxnonceStr, //随机串
                            "package": postData.wxpackage,
                            "signType": postData.wxsignType, //微信签名方式
                            "paySign": postData.wxpaySign //微信签名
                        },
                        function (res) {
                            if (res.err_msg === "get_brand_wcpay_request:ok") {
                                //  alert("OK");
                            }
                        }
                    );
                } else if (postData.operate === 'requestOpenAPP_wxPay') {

                    var url = postData.resultInfo;

                    // 微信采用跳转地址
                    if (url) {


                        var tUrl = SDW_WEB.URLS.addParam({
                            'go': url
                        }, true, 'http://www.shandw.com/libs/weixin.html');

                        if (SDW_WEB.onAndriod && window.Android && window.Android.openURL) {
                            window.Android.openURL(tUrl);
                            return;
                        }

                        if (SDW_WEB.onIOS && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openURL && window.webkit.messageHandlers.openURL.postMessage) {
                            window.webkit.messageHandlers.openURL.postMessage(tUrl);
                            return;
                        }
                        // console.log(url);
                        location.href = url;
                    }

                } else if (postData.operate === 'requestOpenAPP_alipayPay') {

                    // 采用支付宝
                    if (postData.resultInfo) {
                        // 写入支付信息
                        document.querySelector('#alipay_form').innerHTML = postData.resultInfo;
                        // console.log(postData.resultInfo);
                        var inputs = document.querySelectorAll('#alipaysubmit>input');
                        // console.log(inputs);
                        var iObj = {};
                        for (var i = 0; i < inputs.length; i++) {
                            var ipt = inputs[i];
                            iObj[ipt.name] = ipt.value;
                        }
                        var urlS = SDW_WEB.URLS.addParam(iObj, true, 'http://www.shandw.com/libs/aliPay.html');
                        // console.log(urlS)

                        if (SDW_WEB.onAndriod && window.Android && window.Android.openURL) {
                            window.Android.openURL(urlS);
                            return;
                        }

                        if (SDW_WEB.onIOS && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openURL && window.webkit.messageHandlers.openURL.postMessage) {
                            window.webkit.messageHandlers.openURL.postMessage(urlS);
                            return;
                        }

                        document.querySelector('#alipaysubmit').submit();
                    }

                } else if (postData.operate === 'requestShowQrcode') {
                    // 展示微信二维码
                    showPayModelMask(postData.codeUrl);

                } else if (postData.operate === 'requestHideQrcode') {
                    // 关闭微信二维码;
                    hidePayModelMask();
                }

            } catch (e) {

                // console.log('wode  error', e);
                // alert('wode  error')
            }
        }
    }, false);


    // flag [2018-11-21 16:20:57] 网易圈圈APP分享回调
    if (SDW_WEB.onWyqq) {

        window.addEventListener('message', function (e) {

            /**
             *监听message事件
             *e.data:{code:200 | 400, type:'分享所在app',messageType:'WebviewNCGObject.shareCallBack'}
             200 成功，400 失败，206取消分享
             */
            if (e.source === window.parent && e.origin.indexOf('open.game.163.com') >= 0) {

                // alert(JSON.stringify(e));

                var result = JSON.parse(e.data);

                // alert(e.data);

                /*分享回调*/
                if (result.messageType === 'WebviewNCGObject.shareCallBack') {

                    if (result.code === 200) {
                        dialog.show('ok', '分享成功', 1);
                        // 分享成功，向游戏页面进行通知回调
                        toGamePageMessage({
                            postSdwData: true,
                            oprate: 'shareCallback_success'
                        });

                    } else if (result.code === 206 || result.code === 400) {
                        // 分享失败，向游戏页面进行通知回调
                        dialog.show('error', '分享取消', 1);
                        toGamePageMessage({
                            postSdwData: true,
                            oprate: 'shareCallback_cancel'
                        });
                    }
                }

            }
        }, false);
    }

    // 消息通知函数集合
    var _SDW_MessageEvents = {

        logMsg: '',
        /*获取游戏开始的token*/
        'sdw_getGameToken': function (e, postData) {

            /*不在网易圈圈，返回错误*/
            // if (!SDW_WEB.onWyqq) {
            //     e.source.postMessage(JSON.stringify({
            //         postSdwData: true,
            //         data: {
            //             result: -1,
            //             msg: '环境错误'
            //         },
            //         operate: 'getGameToken_callback'
            //     }), '*');
            //     return;
            // }

            // 请求token
            var data = postData.data;
            var postUrl = 'https://sttc.shandw.com/getUploadSecret';
            var postUrlData = {
                miniProId: data.gid,
                uid: data.uid,
                time: +new Date()
            };
            var key = '1fb964b3f62d471080fd7e465646379e';

            // miniProId+uid+time+key
            postUrlData.sign = SDW_WEB.MD5('' + postUrlData.miniProId + postUrlData.uid + postUrlData.time + key);

            SDW_WEB.postAjaxData(postUrl, postUrlData,
                function (res) {
                    e.source.postMessage(JSON.stringify({
                        postSdwData: true,
                        data: res,
                        operate: 'getGameToken_callback'
                    }), '*');
                });
        },

        'sdw_goBackstage': function (e, postData) {
            /*创建一个通知iframe的函数*/
            var clk = function () {
                e.source.postMessage(JSON.stringify({
                    postSdwData: true,
                    operate: 'goBackstage_callback'
                }), '*');
            };
            SDW_WEB.sdw.goBackstage(clk);
        },

        'sdw_recoverBackstage': function (e, postData) {
            /*创建一个通知iframe的函数*/
            var clk = function () {
                e.source.postMessage(JSON.stringify({
                    postSdwData: true,
                    operate: 'recoverBackstage_callback'
                }), '*');
            };
            SDW_WEB.sdw.recoverBackstage(clk);
        },

        'sdw_setGameToolPositionY': function (e, postData) {
            var y = postData.y;
            // console.log('sdw_setGameToolPositionY', y)
            if (window.touch) {
                window.touch.setPositionY(y);
            } else {
                window.touch_initY = y; // 初始的y
            }
        },

        // 微端发送唤起支付的信息
        postChoosePayInfo: function (e, postData) {
            SDW_WEB.sdw.postChoosePayInfo(postData.data);
        },

        // 微端发送支付成功的信息
        postPaySuccessInfo: function (e, postData) {
            SDW_WEB.sdw.postPaySuccessInfo(postData.data);
        },

        // 微端发送创角的信息
        postGamePlayerInfo: function (e, postData) {
            SDW_WEB.sdw.postGamePlayerInfo(postData.data);
        },

        changeEggStatus: function () {
            // 重新授权数据
            _myFuchuang && _myFuchuang.loadActivityToolInfo();
        },

        // 闪电币发生变化
        changeSDCoin: function (e, postData) {
            var data = postData.data;
            _myFuchuang.myGold = _myFuchuang.myGold + data.SDCoins;
        },

        // flag [2017-12-13 16:42:13]
        tokenOverTime: function () {
            // 内嵌页用户信息过期 重新清除数据，并且授权
            SDW_WEB._refreshUserData();

        },

        // flag [2017-12-13 15:26:03] 获取闪电玩的用户信息
        getSDWUserInfo: function (e) {

            var data = {};

            SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};
            for (var i in SDW_WEB.USER_INFO) {
                data[i] = SDW_WEB.USER_INFO[i];
            }

            data.imei = SDW_WEB.guid;
            data.os = SDW_WEB.os;
            data.w = SDW_WEB.width;
            data.h = SDW_WEB.height;

            // 读取到后，消息通知给子页面，进行相应的回调操作；
            e.source.postMessage(JSON.stringify({
                postSdwData: true,
                data: data,
                operate: 'getSDWUserInfo_callback'
            }), '*');

        },

        // 地址跳转
        openUrlToRoot: function (e, data) {
            if (data.gid) {
                // 如果有游戏的id，直接跳游戏地址
                var url = SDW_PATH.GAME_URL('play', data.gid);
                location.href = url;
            } else {
                location.href = data.url;
            }
        },

        // 退出全屏
        exitFullScreen: function () {
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.exitFullScreen({
                        success: function () {
                            window._fullScreen = false;
                            setTimeout(function () {
                                window.onresize && window.onresize();
                            }, 300);
                        }
                    }
                );
            } else if (SDW_WEB.onKD) {
                // 口袋的
                if (SDW_WEB.onIOS) {
                    callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 5})));
                    window._fullScreen = false;
                } else {
                    window._fullScreen = false;
                    kdjs && kdjs.callOpenKDTopBar()
                }
                setTimeout(function () {
                    window.onresize && window.onresize();
                }, 300);
            }
        },

        requestFullScreen: function () {
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.requestFullScreen({
                    success: function () {
                        window._fullScreen = true;
                        setTimeout(function () {
                            window.onresize && window.onresize();
                        }, 300);
                    }
                });
            } else if (SDW_WEB.onKD) {
                // 口袋的
                if (SDW_WEB.onIOS) {
                    callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 4})));
                    window._fullScreen = true;
                } else {
                    window._fullScreen = true;
                    kdjs && kdjs.callCloseKDTopBar();
                }

                setTimeout(function () {
                    window.onresize && window.onresize();
                }, 300);
            }

        },

        // 提交游戏的数据
        sdw_postGameInfo: function (e, postData) {

            var data = postData.data, secheme = +new Date(), oToken = '';

            // 校验appid的合法性
            if (SDW_WEB.MOBILE_GAME_GID != data.appid) {
                return;
            }

            data.sec = secheme;

            // 微端或者游客模式
            if (visitorMode.isVisitor || SDW_WEB.onMicroSDWAPP) {

                oToken = visitorMode._visitorToken || '';
                data.vst = '1';

            } else {
                oToken = SDW_WEB.USER_INFO.otoken;
            }

            var oStr = '' + data.appid + data.channel +
                data.uid + data.sid + data.id +
                data.sname + data.nick + data.level +
                data.type + data.vip + data.power +
                data.new + oToken;

            data.sign = SDW_WEB.MD5(oStr);

            // 变换后的token校验值
            var token = SDW_WEB.MD5('' + data.channel + data.uid + secheme + oToken);
            data.token = token;

            // 读取ext字段(如果有)
            var _extData = SDW_WEB.getExtData();
            if (_extData) {
                data.sdw_extdata = _extData;
            }
            var uri = SDW_WEB.URLS.addParam(data, true, 'https://platform.shandw.com/pltupgi');
            SDW_WEB.getAjaxData(uri, function (data) {

            })

        },

        requestHideQrcode: function (e) {
            hidePayModelMask();
        },

        to_competition: function (e, postData) {

            // 赛事游戏的跳转地址
            var link = postData.link;
            location.href = link + '&v=' + SDW_WEB.version;

        },

        sdw_getLocalStorage: function (e, postData) {
            // 读取本地数据
            var _key = postData.key;
            var _data = SDW_WEB.Store.get(_key, true);

            // 读取到后，消息通知给子页面，进行相应的回调操作；
            e.source.postMessage(JSON.stringify({
                postSdwData: true,
                data: _data,
                oprate: 'getLocalStorage_ok'
            }), '*');
        },

        sdw_setLocalStorage: function (e, postData) {
            // 设置本地数据
            var _key = postData.key;
            var _data = postData.data;

            SDW_WEB.Store.set(_key, _data, true);
        },

        checkVisitorMode: function (e, postData) {
            // 检查是否是游客模式
            if (visitorMode.isVisitor) {

                dialog.show('error', '充值请先登录', 1);
                _myFuchuang && _myFuchuang.fchiddenFn(0);

            } else {

                var ifm = document.querySelector('#my-game-container');
                ifm.contentWindow.postMessage(JSON.stringify({
                    postSdwData: true,
                    useweb: SDW_WEB.useweb,
                    oprate: 'choosePayCheckState_ok'
                }), '*');
            }
        },

        // flag [2018-03-21 11:37:40] 给CP新开唤起底部的功能
        onShowToolBar: function (e, postData) {
            SDW_WEB.sdw.onShowToolBar();
        },

        // 通过sdw.js游戏调用
        setSDWShareInfo: function (e, postData) {

            var postShareData = postData.shareInfo;

            postShareData.title = postShareData.title || SDW_WEB._sTitle || '闪电玩游戏平台';
            postShareData.desc = postShareData.desc || SDW_WEB._sDes || '无需下载，1秒开战，一起撸怪，我等你！';
            postShareData.imgUrl = postShareData.imgUrl || SDW_WEB._sIcon || 'https://www.shandw.com/app/tabicon/sdw.png';

            // 设置分享的文案
            if (postShareData.desc) {
                $('.sDesc').attr('content', postShareData.desc);
            }

            // 跨域页面通过父级的sdw接口进行设置分享
            // 需要保存本页面的回调函数
            SDW_WEB.sdw.onSetShareOperate({
                share: postShareData.share || false,  // 兼容网易圈圈系列的快速分享
                title: postShareData.title,
                desc: postShareData.desc,
                imgUrl: postShareData.imgUrl,
                link: SDW_WEB.changeShareLinks(postShareData.link),
                notSave: true,
                success: function () {
                    // SDW_WEB.share_success_callback();  // 分享的
                    // 执行本页面的回调
                    /*父级页面的回调*/
                    window.sdwShareState && window.sdwShareState.successCallback
                    && window.sdwShareState.successCallback();

                    /*子页面的回调*/
                    e.source.postMessage(JSON.stringify({
                        postSdwData: true,
                        oprate: 'shareCallback_success'
                    }), '*');

                },

                cancel: function () {
                    // 执行本页面的回调
                    window.sdwShareState && window.sdwShareState.cancelCallback
                    && window.sdwShareState.cancelCallback();

                    // 通知子页面，取消
                    e.source.postMessage(JSON.stringify({
                        postSdwData: true,
                        oprate: 'shareCallback_cancel'
                    }), '*');
                }
            })

        },

        sdw_logout: function () {
            // if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.logout();
            // } else {
            //     alert('不在对应的环境中');
            // }
        }
    };


    function readShareInfo_Random() {
        var random = Math.random() * _gameShareData_.shareInfo.length >> 0;
        return _gameShareData_.shareInfo[random];
    }

    // 正常的授权游戏
    function authGame(callback) {

        callback = callback || function () {
        };

        var query = SDW_WEB.queryParam, gid = SDW_WEB.MOBILE_GAME_GID, link,
            params = {gid: gid}, userInfo = SDW_WEB.USER_INFO, isM3guo = query['s_from'] == 'm3g';

        if (typeof gid != 'undefined') {

            params.uid = isM3guo ? query['uid'] : userInfo['uid'];
            params.token = isM3guo ? query['token'] : userInfo['token'];
            params.sec = isM3guo ? query['sec'] : userInfo['secheme'];
            params.channel = isM3guo ? query['channel'] : SDW_WEB.channel;
            query['wxCode']?params.thirdOpenId = query['wxCode']:'';
            // 添加赛事id
            if (query['gmUnitId']) {
                params.mthid = query['gmUnitId'];
            }

            // 游戏的授权地址
            link = SDW_WEB.URLS.addParam(params, false, HTTP_AUTH);

            // 获取到游戏的信息
            SDW_WEB.getAjaxData(link, function (data) {

                if (data.result == 1) {

                    SDW_WEB._sIcon = data.sIcon || data.icon;   // 分享图片
                    SDW_WEB._sTitle = data.sTit;  // 分享title
                    SDW_WEB._sDes = data.sDes;  // 分享描述

                    if (SDW_WEB.onWyqq) {
                        // 对网易圈圈设置启动的图片
                        var imgIcon = document.querySelector('#wy-game-icon');
                        if (imgIcon) {
                            var img = new Image();
                            img.src = SDW_WEB._sIcon;
                            img.onload = function () {
                                imgIcon.src = img.src;
                            };
                            imgIcon.style.opacity = '1';
                        }

                        // 设置游戏名称
                        window.top.postMessage(JSON.stringify({
                            method: 'WebviewNCGObject.setPageTitle',
                            data: {title: data.name}
                        }), '*');

                    }

                    SDW_WEB.setLoadText.setText('auth');
                    SDW_WEB.gameName = data.name;
                    (data.thirdSign && SDW_WEB.channel == '12240') ? meiWeiGetQueue(data.thirdSign):'';
                    // 如果存在分享配置项，随机读取里面的内容.
                    if (typeof _gameShareData_ != 'undefined') {
                        var shareRandomInfo = readShareInfo_Random();
                        data.sTit = shareRandomInfo[0];
                        data.sDes = shareRandomInfo[1];

                        /*如果存在分享图片的列表*/
                    }

                    setShareInfo(data);
                    setShandwDesktop(data);

                    var targets = ['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo'];

                    // 设置APP的底部工具栏按钮
                    SDW_WEB.onShandw && SDW_WEB.sdw.onSetToolBarOperation(targets.concat(['addDesktop', 'copyLink']));

                    SDW_WEB.sdw.onSetShareOperate({
                        target: targets,
                        title: data.sTit,
                        desc: data.sDes,
                        link: SDW_WEB.changeShareLinks(),
                        imgUrl: SDW_WEB._sIcon,  // 服务端的
                        success: function () {
                            SDW_WEB.share_success_callback();
                        },
                        cancel: function () {

                        }
                    });

                    // 设置服务器的时间
                    checkGameUrl(data);


                } else if (data.result == -3) {
                    // 重新授权
                    alert('-3');
                } else {
                    alert(data.msg);
                }

                // 如果有自定的添加的回调
                callback && callback(data);
            });

        } else SDW_WEB.Log('缺少游戏参数');

    }

    // 设置保存到桌面
    var setShandwDesktop = (function () {

        var gameInfo = {};

        return function (data, isSet) {

            if (SDW_WEB.onKD || SDW_WEB.onShandw) {

                if (!gameInfo.name) {

                    gameInfo.name = data.name;
                    gameInfo.icon = data.icon;

                    if (SDW_WEB.onIOS) {

                        var tranUrl = SDW_PATH.MOBILE_ROOT + 'gotoApp/';

                        gameInfo.linkUrl = SDW_WEB.URLS.addParam({
                            'gid': SDW_WEB.MOBILE_GAME_GID,
                            'channel': SDW_WEB.channel,
                            'myType': SDW_WEB.onKD ? 'kd' : 'sdw'
                        }, true, tranUrl);

                    } else {

                        gameInfo.linkUrl = location.href.split('#')[0] + '&v=' + SDW_WEB.version + '&sdw_from=sdw_desktop';
                    }
                }

                if (typeof isSet === 'undefined') {
                    gameInfo.isSet = true;
                } else {
                    gameInfo.isSet = false;
                }

                SDW_WEB.sdw.createDesktop({
                    isSet: gameInfo.isSet,
                    title: gameInfo.name,
                    icon: gameInfo.icon,
                    link: gameInfo.linkUrl,
                    isFullScreen: false,
                    showMoreBtn: true
                });
            }
        }
    })();

    /**
     * 检测游戏地址
     * @param data
     */
    function checkGameUrl(data) {

        // 获取游戏的地址
        if (data.param) {

            // 初始化游戏地址
            var gameUrl = (SDW_WEB.queryParam['sdw_test'] == 'true') ? (data.testUrl || data.url) : data.url;

            // [2017-10-30 15:27] 重置IOS的审核地址
            if (SDW_WEB.MICRO_REVIEW && SDW_WEB.MICRO_REVIEW_LINK) {
                gameUrl = SDW_WEB.MICRO_REVIEW_LINK;
            }

            if (gameUrl.indexOf('?') === -1) {
                gameUrl += '?' + data.param;
            } else {
                gameUrl += '&' + data.param;
            }

            // 重置当前游戏地址，防止被篡改 # ios中的各种乱七八糟的参数
            // 之前王座的特殊地址参数url_Type;
            if (SDW_WEB.onWyqq) {
                var o_url = 'http://www.shandw.com/wyqq/game/' + SDW_WEB.MOBILE_GAME_GID + '.html?channel=' + SDW_WEB.channel;
            } else {
                var o_url = SDW_PATH.GAME_URL('play', SDW_WEB.MOBILE_GAME_GID);
            }


            if (SDW_WEB.queryParam['url_Type']) {
                gameUrl += '&url_Type=' + SDW_WEB.queryParam['url_Type'];
                o_url += '&url_Type=' + SDW_WEB.queryParam['url_Type'];
            }

            // 处于审核状态
            if (SDW_WEB.MICRO_REVIEW) {
                gameUrl += '&app_review=1';
            }

            var cb_url = encodeURIComponent(o_url);

            gameUrl += '&cburl=' + cb_url;
            gameUrl += '&reurl=' + cb_url;

            // flag [2017-12-26 13:44:03] 添加fl，登录方式
            if (SDW_WEB.USER_INFO.fl)
                gameUrl += '&fl=' + SDW_WEB.USER_INFO.fl;

            // 添加赛事的参数
            gameUrl = addSaiShiParam(gameUrl);

            // 兼容https加载http的情况
            gameUrl = compatibleOldUrl(gameUrl, data.gid);

            // flag [2018-01-23 17:56:33] 判断是否关注微信公众号
            SDW_WEB._atSDW = data.atSDW;
            SDW_WEB._BDDSWTOKEN = data.BDDSWTOKEN;
            SDW_WEB._qrcode = data.qrcode;
            // flag [2018-01-23 17:56:33] 判断是否关注微信公众号

            if (SDW_WEB.useweb) {
                gameUrl += '&sdw_useweb=1';
            }

            if (SDW_WEB.onWyqq) {
                gameUrl += '&wyqq=1';
            }

            // 载入游戏地址
            appendGameContainer(gameUrl);

        } else {

            alert('[Error]: 缺少游戏参数字段param')
        }
    }

    // 添加赛事参数
    function addSaiShiParam(gameUrl) {

        // 添加游戏的赛事gmUnitId **
        if (SDW_WEB.queryParam['gmUnitId']) {
            gameUrl += '&gmUnitId=' + SDW_WEB.queryParam['gmUnitId'];
        }

        // 添加游戏的赛事recordId **
        if (SDW_WEB.queryParam['recordId']) {
            gameUrl += '&recordId=' + SDW_WEB.queryParam['recordId'];
        }

        // 添加游戏的赛事recordId **
        if (SDW_WEB.queryParam['gmType']) {
            gameUrl += '&gmType=' + SDW_WEB.queryParam['gmType'];
        }

        return gameUrl;
    }

    function compatibleOldUrl(gameUrl, gid) {

        // 需要保留第三方的信息
        var _gParam = SDW_WEB.URLS.queryUrl(true, gameUrl);
        var _3thParam = get3thParam(_gParam);

        gameUrl += _3thParam;

        if (!/^https:\/\//.test(gameUrl) && _protocol_ !== 'http:') {

            // // 判断是否是游客模式
            var isVisitor = visitorMode.isVisitor ? '&isVisitor=1' : '';

            // 在闪电玩APP中，不需要用户信息的保存，直接跳转。
            if (SDW_WEB.onShandw) {

                // 此处可在点击进去的时候对地址进行判断
                location.href = location.href.replace(/https:\/\//, 'http://');

            } else {

                window.FIRST_TRANS = true;
                var nUrl = 'http://www.shandw.com/libs/addUserInfo2.html?channel=' + SDW_WEB.channel + '&userInfo='
                    + encodeURIComponent(JSON.stringify(SDW_WEB.USER_INFO)) + '&gid=' + gid + isVisitor + '&storeType=' + window.DATAITEM + _3thParam;
                location.href = nUrl;

            }
        }

        return gameUrl;
    }

    // 添加游戏内容
    function appendGameContainer(gameUrl) {

        var gameContainer = document.querySelector('#my-game-container');

        if (gameContainer) {

            gameContainer.src = gameUrl;

        } else {

            var gameContainer = document.createElement('iframe');
            gameContainer.id = 'my-game-container';
            gameContainer.className = 'my-game-container my-game-opacity';
            gameContainer.name = 'my-game-container';

            gameContainer.src = gameUrl;
            gameContainer.frameborder = '0';
            gameContainer.style.frameborder = '0';
            gameContainer.style.border = 'none';
            gameContainer.style.boxShadow = 'none';

            // gameContainer.style.height = SDW_WEB.height + 'px';

            // window._calPageHeight
            $('#g-container').append(gameContainer).css({
                height: (document.documentElement.clientHeight || document.body.clientHeight) + 'px',
                display: 'block'
            });

            SDW_WEB.MOBILR_GAME_URL_IFRM = gameUrl + '&REFRESH_TAG';

            var timer = setTimeout(function () {
                dialog.show('loading', '游戏可能加载过慢，请耐心稍等....', 1);
            }, 10 * 1000);


            // iframe已经加载完
            gameContainer.onload = function () {
                window._calPageHeight && window._calPageHeight();
                hideLoadPage();
                timer && clearTimeout(timer); // 清除定时器
            }

            // $('body').append('<iframe frameborder="0" id="my-game-container" class="my-game-container my-game-opacity" src="' + gameUrl + '"></iframe>');
        }


        var resizeTimer = null;

        var onResizeFn = function () {

            // 清除之前的定时器
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }

            // 延后读取
            resizeTimer = setTimeout(function () {

                var width = document.documentElement.clientWidth || document.body.clientWidth;
                var height = document.documentElement.clientHeight || document.body.clientHeight;

                if (gameContainer) {
                    gameContainer.style.height = height + 'px';
                    gameContainer.style.width = width + 'px';
                    gameContainer.width = width + 'px';
                    gameContainer.height = height + 'px';
                    // 通知子页面页面大小已经发生改变了
                    gameContainer.contentWindow.postMessage(JSON.stringify({
                        postSdwData: true,
                        operate: 'window_size_change',
                        width: width,
                        height: height
                    }), '*');
                }

                window.touch && window.touch.update();

                window._calPageHeight && window._calPageHeight();

            }, 400);

        };

        function orientationChange() {
            switch (window.orientation) {
                case 0:
                    onResizeFn();
                    break;
                case -90:
                    onResizeFn();
                    break;
                case 90:
                    onResizeFn();
                    break;
                case 180:
                    // onResizeFn();
                    break;
            }
        }

        window.onresize = function () {
            onResizeFn();
        };

        // 设备旋转事件
        window.onorientationchange = orientationChange;
    }

    /**
     * 截取第三方的参数
     * @returns {string}
     */
    function get3thParam(oldParam) {
        var _res = {};
        var nowParam = SDW_WEB.queryParam;

        for (var i in nowParam) {

            if (i == 'gid' || i == 'channel' || i == '_sender_sdw_rfid_' || i == 'v') {

            } else if (!oldParam[i]) {
                // 添加第三方的
                _res[i] = nowParam[i];

            } else {

                console.log('参数【' + i + '】冲突');
            }
        }

        var _r = SDW_WEB.URLS.param(_res, true);

        if (_r) {
            return '&' + _r;
        } else {
            return '';
        }
    }

    // 在非闪电玩APP中，进行游客模式的检查
    SDW_WEB.onShandw || checkVisitor();

    // 隐藏启动加载页面
    function hideLoadPage() {

        SDW_WEB.setLoadText.setText('loaded');

        var now = +new Date(), totalTime = 300,
            del = now - loadPageTime;

        del = del > totalTime ? 0 : totalTime - del;

        setTimeout(function () {
            $('.loading-container').addClass('loading-hidden');
            $('.my-game-opacity').removeClass('my-game-opacity');
        }, del + 200);

        document.body.style.background = '#333';

        // flag [2017-11-23 15:40:38] 添加统计游戏时间
        SDW_WEB.playGameTimer.start(SDW_WEB.MOBILE_GAME_GID);

        // window.initToolFn();
    }

    window.authGame = authGame;
})();
