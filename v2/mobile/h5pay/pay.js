/*
	dhpay.js
	@version 1.41
	@date 2018-01-19
	@author baosheng,malong
    v1.1 增加微信iframe发送数据
    v1.2 解决closepay内存溢出
    v1.3 wxjsapi去除closecallback
    v1.4 优化hidepay回调函数
    v1.5 微信支付宝移动端top跳转
    v1.6 兼容最新版Jq size
	v1.7 修复iframe下微信无法二维码识别bug
	v1.8 修复二维码设别bug，pc
	v1.9 使用微博打开去掉微信支付
	v1.10 在支付宝环境中直接调用支付，取消选择环节
	v1.11 增加手机QQ支付场景
	v1.12 在手机QQ环境下，动态加载QQ JSAPI文件地址
	v1.13 取消手机QQ环境自动打开QQ支付，改为展示付款方式增加QQ支付
    v1.4 增加了微信使用H5支付
    v1.41 增加了支付统计上报
*/
(function (global) {
    var browser,//检测浏览器
        weburl = 'http://pay.17m3.com/gamepay/',//资源地址
        posturl = 'https://sandboxpay.17m3.com/sdk/CodeWappay.aspx',//ajax请求地址
        queryurl = 'http://sandboxpay.17m3.com/wbsrv/ajax_query.ashx',
        // posturl='http://pay.17m3.com/sdk/CodeWappay.aspx',//ajax请求地址
        orderStatusUrl = '/gateway/qrcodeinfo.aspx',
        loadFiles,//加载外部文件方法
        parseParam,//json转url方法
        userInfo,//支付信息
        dhpayObj,//外接接口对象
        paylistHtml = '',//html支付结构
        startviewObj,//初始化界面对象
        paystrJson = {
            'alipay': ['alipay', weburl + 'alipay_web.png', '支付宝支付'],
            'weixin': ['weixin', weburl + 'pay_weixin_qr.png', '微信支付'],
            'qpay': ['qpay', weburl + 'qpay.png', 'QQ支付']
        },//显示的支付方式
        showpayAry = [],//显示的元素的ary
        dhpayFn,//支付功能
        isUseClose = false,//关闭回调函数只调用一次
        interfaceObj = null,
        isResultPost = false;//对方订单处理结果请求是否生效，兼容订单结果的处理

    //fastclick
    ;(function () {
        'use strict';

        function FastClick(layer, options) {
            var oldOnClick;
            options = options || {};
            this.trackingClick = false;
            this.trackingClickStart = 0;
            this.targetElement = null;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.lastTouchIdentifier = 0;
            this.touchBoundary = options.touchBoundary || 10;
            this.layer = layer;
            this.tapDelay = options.tapDelay || 200;
            this.tapTimeout = options.tapTimeout || 700;
            if (FastClick.notNeeded(layer)) {
                return
            }

            function bind(method, context) {
                return function () {
                    return method.apply(context, arguments)
                }
            }

            var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
            var context = this;
            for (var i = 0, l = methods.length; i < l; i++) {
                context[methods[i]] = bind(context[methods[i]], context)
            }
            if (deviceIsAndroid) {
                layer.addEventListener('mouseover', this.onMouse, true);
                layer.addEventListener('mousedown', this.onMouse, true);
                layer.addEventListener('mouseup', this.onMouse, true)
            }
            layer.addEventListener('click', this.onClick, true);
            layer.addEventListener('touchstart', this.onTouchStart, false);
            layer.addEventListener('touchmove', this.onTouchMove, false);
            layer.addEventListener('touchend', this.onTouchEnd, false);
            layer.addEventListener('touchcancel', this.onTouchCancel, false);
            if (!Event.prototype.stopImmediatePropagation) {
                layer.removeEventListener = function (type, callback, capture) {
                    var rmv = Node.prototype.removeEventListener;
                    if (type === 'click') {
                        rmv.call(layer, type, callback.hijacked || callback, capture)
                    } else {
                        rmv.call(layer, type, callback, capture)
                    }
                };
                layer.addEventListener = function (type, callback, capture) {
                    var adv = Node.prototype.addEventListener;
                    if (type === 'click') {
                        adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
                            if (!event.propagationStopped) {
                                callback(event)
                            }
                        }), capture)
                    } else {
                        adv.call(layer, type, callback, capture)
                    }
                }
            }
            if (typeof layer.onclick === 'function') {
                oldOnClick = layer.onclick;
                layer.addEventListener('click', function (event) {
                    oldOnClick(event)
                }, false);
                layer.onclick = null
            }
        }

        var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
        var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;
        var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
        var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);
        var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);
        var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;
        FastClick.prototype.needsClick = function (target) {
            switch (target.nodeName.toLowerCase()) {
                case'button':
                case'select':
                case'textarea':
                    if (target.disabled) {
                        return true
                    }
                    break;
                case'input':
                    if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                        return true
                    }
                    break;
                case'label':
                case'iframe':
                case'video':
                    return true
            }
            return (/\bneedsclick\b/).test(target.className)
        };
        FastClick.prototype.needsFocus = function (target) {
            switch (target.nodeName.toLowerCase()) {
                case'textarea':
                    return true;
                case'select':
                    return !deviceIsAndroid;
                case'input':
                    switch (target.type) {
                        case'button':
                        case'checkbox':
                        case'file':
                        case'image':
                        case'radio':
                        case'submit':
                            return false
                    }
                    return !target.disabled && !target.readOnly;
                default:
                    return (/\bneedsfocus\b/).test(target.className)
            }
        };
        FastClick.prototype.sendClick = function (targetElement, event) {
            var clickEvent, touch;
            if (document.activeElement && document.activeElement !== targetElement) {
                document.activeElement.blur()
            }
            touch = event.changedTouches[0];
            clickEvent = document.createEvent('MouseEvents');
            clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
            clickEvent.forwardedTouchEvent = true;
            targetElement.dispatchEvent(clickEvent)
        };
        FastClick.prototype.determineEventType = function (targetElement) {
            if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
                return 'mousedown'
            }
            return 'click'
        };
        FastClick.prototype.focus = function (targetElement) {
            var length;
            if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
                length = targetElement.value.length;
                targetElement.setSelectionRange(length, length)
            } else {
                targetElement.focus()
            }
        };
        FastClick.prototype.updateScrollParent = function (targetElement) {
            var scrollParent, parentElement;
            scrollParent = targetElement.fastClickScrollParent;
            if (!scrollParent || !scrollParent.contains(targetElement)) {
                parentElement = targetElement;
                do {
                    if (parentElement.scrollHeight > parentElement.offsetHeight) {
                        scrollParent = parentElement;
                        targetElement.fastClickScrollParent = parentElement;
                        break
                    }
                    parentElement = parentElement.parentElement
                } while (parentElement)
            }
            if (scrollParent) {
                scrollParent.fastClickLastScrollTop = scrollParent.scrollTop
            }
        };
        FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {
            if (eventTarget.nodeType === Node.TEXT_NODE) {
                return eventTarget.parentNode
            }
            return eventTarget
        };
        FastClick.prototype.onTouchStart = function (event) {
            var targetElement, touch, selection;
            if (event.targetTouches.length > 1) {
                return true
            }
            targetElement = this.getTargetElementFromEventTarget(event.target);
            touch = event.targetTouches[0];
            if (deviceIsIOS) {
                selection = window.getSelection();
                if (selection.rangeCount && !selection.isCollapsed) {
                    return true
                }
                if (!deviceIsIOS4) {
                    if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                        event.preventDefault();
                        return false
                    }
                    this.lastTouchIdentifier = touch.identifier;
                    this.updateScrollParent(targetElement)
                }
            }
            this.trackingClick = true;
            this.trackingClickStart = event.timeStamp;
            this.targetElement = targetElement;
            this.touchStartX = touch.pageX;
            this.touchStartY = touch.pageY;
            if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
                event.preventDefault()
            }
            return true
        };
        FastClick.prototype.touchHasMoved = function (event) {
            var touch = event.changedTouches[0], boundary = this.touchBoundary;
            if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
                return true
            }
            return false
        };
        FastClick.prototype.onTouchMove = function (event) {
            if (!this.trackingClick) {
                return true
            }
            if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
                this.trackingClick = false;
                this.targetElement = null
            }
            return true
        };
        FastClick.prototype.findControl = function (labelElement) {
            if (labelElement.control !== undefined) {
                return labelElement.control
            }
            if (labelElement.htmlFor) {
                return document.getElementById(labelElement.htmlFor)
            }
            return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea')
        };
        FastClick.prototype.onTouchEnd = function (event) {
            var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
            if (!this.trackingClick) {
                return true
            }
            if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
                this.cancelNextClick = true;
                return true
            }
            if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
                return true
            }
            this.cancelNextClick = false;
            this.lastClickTime = event.timeStamp;
            trackingClickStart = this.trackingClickStart;
            this.trackingClick = false;
            this.trackingClickStart = 0;
            if (deviceIsIOSWithBadTarget) {
                touch = event.changedTouches[0];
                targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
                targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent
            }
            targetTagName = targetElement.tagName.toLowerCase();
            if (targetTagName === 'label') {
                forElement = this.findControl(targetElement);
                if (forElement) {
                    this.focus(targetElement);
                    if (deviceIsAndroid) {
                        return false
                    }
                    targetElement = forElement
                }
            } else if (this.needsFocus(targetElement)) {
                if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                    this.targetElement = null;
                    return false
                }
                this.focus(targetElement);
                this.sendClick(targetElement, event);
                if (!deviceIsIOS || targetTagName !== 'select') {
                    this.targetElement = null;
                    event.preventDefault()
                }
                return false
            }
            if (deviceIsIOS && !deviceIsIOS4) {
                scrollParent = targetElement.fastClickScrollParent;
                if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                    return true
                }
            }
            if (!this.needsClick(targetElement)) {
                event.preventDefault();
                this.sendClick(targetElement, event)
            }
            return false
        };
        FastClick.prototype.onTouchCancel = function () {
            this.trackingClick = false;
            this.targetElement = null
        };
        FastClick.prototype.onMouse = function (event) {
            if (!this.targetElement) {
                return true
            }
            if (event.forwardedTouchEvent) {
                return true
            }
            if (!event.cancelable) {
                return true
            }
            if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
                if (event.stopImmediatePropagation) {
                    event.stopImmediatePropagation()
                } else {
                    event.propagationStopped = true
                }
                event.stopPropagation();
                event.preventDefault();
                return false
            }
            return true
        };
        FastClick.prototype.onClick = function (event) {
            var permitted;
            if (this.trackingClick) {
                this.targetElement = null;
                this.trackingClick = false;
                return true
            }
            if (event.target.type === 'submit' && event.detail === 0) {
                return true
            }
            permitted = this.onMouse(event);
            if (!permitted) {
                this.targetElement = null
            }
            return permitted
        };
        FastClick.prototype.destroy = function () {
            var layer = this.layer;
            if (deviceIsAndroid) {
                layer.removeEventListener('mouseover', this.onMouse, true);
                layer.removeEventListener('mousedown', this.onMouse, true);
                layer.removeEventListener('mouseup', this.onMouse, true)
            }
            layer.removeEventListener('click', this.onClick, true);
            layer.removeEventListener('touchstart', this.onTouchStart, false);
            layer.removeEventListener('touchmove', this.onTouchMove, false);
            layer.removeEventListener('touchend', this.onTouchEnd, false);
            layer.removeEventListener('touchcancel', this.onTouchCancel, false)
        };
        FastClick.notNeeded = function (layer) {
            var metaViewport;
            var chromeVersion;
            var blackberryVersion;
            var firefoxVersion;
            if (typeof window.ontouchstart === 'undefined') {
                return true
            }
            chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
            if (chromeVersion) {
                if (deviceIsAndroid) {
                    metaViewport = document.querySelector('meta[name=viewport]');
                    if (metaViewport) {
                        if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                            return true
                        }
                        if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                            return true
                        }
                    }
                } else {
                    return true
                }
            }
            if (deviceIsBlackBerry10) {
                blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
                if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                    metaViewport = document.querySelector('meta[name=viewport]');
                    if (metaViewport) {
                        if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                            return true
                        }
                        if (document.documentElement.scrollWidth <= window.outerWidth) {
                            return true
                        }
                    }
                }
            }
            if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
                return true
            }
            firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
            if (firefoxVersion >= 27) {
                metaViewport = document.querySelector('meta[name=viewport]');
                if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                    return true
                }
            }
            if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
                return true
            }
            return false
        };
        FastClick.attach = function (layer, options) {
            return new FastClick(layer, options)
        };
        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
            define(function () {
                return FastClick
            })
        } else if (typeof module !== 'undefined' && module.exports) {
            module.exports = FastClick.attach;
            module.exports.FastClick = FastClick
        } else {
            window.FastClick = FastClick
        }
    }());

    /*
        加载外部文件
        @method loadFiles
        @param src 外部文件链接
        @param type 外部文件类型 link或者script
        @param callback optional 当类型为script时，文件加载完成的回调函数
    */
    loadFiles = function (src, type, callback) {
        var tag = document.createElement(type);
        if (type == "script") {
            tag.src = src;
            tag.type = "text/javascript";
            tag.onload = tag.onreadystatechange = function () {
                if (!tag.readyState || /loaded|complete/.test(tag.readyState)) {
                    tag.onload = tag.onreadystatechange = null;
                    if (callback) callback();
                }
            }
        } else {
            tag.href = src;
            tag.rel = "stylesheet";
            tag.type = "text/css";
        }
        ;
        document.getElementsByTagName("head")[0].appendChild(tag);
    }

    /*
    @method toDecimal2 制保留2位小数，如：2，会在2后面补上00.即2.00
    @param x {number} 需要转换的数字
    */
    toDecimal2 = function (x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }

    /*
    @method parseParam json转url
    @param {string} json对象
    */
    parseParam = function (param, key) {
        var paramStr = "";
        if (param instanceof String || param instanceof Number || param instanceof Boolean) {
            paramStr += "&" + key + "=" + encodeURIComponent(param);
        } else {
            $.each(param, function (i) {
                var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
                paramStr += '&' + parseParam(this, k);
            });
        }
        return paramStr.substr(1);
    };

    /*
    @method confirmDialog 显示提示框
    @param {string} json对象
    */
    confirmDialog = function (txt, oklabel, cancellabel, okcallback, cancelcallback, title, callback) {
        hideConfirmDialog();
        var html = '<div id="confirmDialog" class="mask dialog-box">';
        html += '<div class="r5">';
        html += "<div>" + (title ? title : "提示信息") + "</div>";
        html += "<div>" + txt + "</div>";
        html += '<div class="flex">';
        html += '<a href="javascript:;" data-type="cancel" class="flex-list unselect">' + (cancellabel ? cancellabel : "关闭") + "</a>";
        if (oklabel) {
            html += '<a href="javascript:;" data-type="ok" class="flex-list unselect ok">' + oklabel + "</a>"
        }
        html += "</div></div></div>";
        $("body").append(html);
        if (callback) {
            callback()
        }
        $("#confirmDialog .flex a").click(function () {
            var type = $(this).attr("data-type");
            if (type == "cancel") {
                if (cancelcallback) {
                    cancelcallback()
                }
            } else if (type == "ok") {
                if (okcallback) {
                    okcallback()
                }
            }
            $(this).parents("#confirmDialog").remove()
        })
    }
    hideConfirmDialog = function () {
        $("#confirmDialog").remove()
    }

    //判断打开方式
    browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
                qq: u.indexOf("QQ") > -1, //是否QQ
                weibo: u.toLowerCase().match(/WeiBo/i) == "weibo"//是否微博
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };

    loadFiles('https://sandboxpay.17m3.com/sdwJs/gamepay/dhpay.css', 'link');
    // loadFiles(weburl+'dhpay.css','link');
    if (typeof(jQuery) == "undefined") {
        loadFiles('https://static.m3guo.com/passport/v1/js/jquery-1.8.3.min.js', 'script');
    }

    if (browser.versions.ios) {
        if (window !== parent) {
            // if(parent !== top){      宝灯修改，跨域下不加载
            interfaceObj = {};
        } else {
            loadFiles("https://static.m3guo.com/pay/gamepay/NativeBridge.js", "script", function () {
                interfaceObj = IosJsInterface;
            });
        }
    }
    if (typeof CDLAndroid != 'undefined') {
        interfaceObj = CDLAndroid;
    }


    //外接接口
    dhpayObj = {
        payMethod: 'web',
        closecallback: function () {
        },
        /*
         * payObj={
        *	postjson:用户信息,
        *	resultpost:false(订单处理结果请求是否生效),
        *	config:{
        *		alipay:true,
        *		weixin:true
        *	},
        *	closecallback:function
        *}
        */
        payfor: function (payObj) {

            // alert(JSON.stringify(payObj))
            if (payObj.closecallback) {
                isUseClose = false;
                this.closecallback = payObj.closecallback;
                // window.onDHSDKResult = this.closecallback;
            }
            if (payObj.resultpost) {
                isResultPost = payObj.resultpost;
            } else {
                isResultPost = false;
            }
            userInfo = payObj.postjson;
            paylistHtml = '';
            if (payObj.config.method) {
                this.payMethod = payObj.config.method;
            }

            var alipayStr = '<li class="' + paystrJson['alipay'][0] + '"><a href="javascript:void(0);" data-type="' + paystrJson['alipay'][0] + '"><img src="' + paystrJson['alipay'][1] + '"><span>' + paystrJson['alipay'][2] + '</span></a></li>',
                weixinStr = '<li class="' + paystrJson['weixin'][0] + '"><a href="javascript:void(0);" data-type="wxwappay"><img src="' + paystrJson['weixin'][1] + '"><span>' + paystrJson['weixin'][2] + '</span></a></li>',
                qpayStr = '<li class="' + paystrJson['qpay'][0] + '"><a href="javascript:void(0);" data-type="' + paystrJson['qpay'][0] + '"><img src="' + paystrJson['qpay'][1] + '"><span>' + paystrJson['qpay'][2] + '</span></a></li>';
            //20171108添加，支付宝环境下直接调用支付宝，忽略微信
            if (/Alipay/.test(navigator.userAgent)) {
                dhpayFn.userData = userInfo;
                dhpayFn.userData.payChannel = 'alipay';
                $('#pay-model-mask').hide();
                dhpayFn.getpayBydata();
                return false;
            }
            // else if(browser.versions.mobile && browser.versions.qq){	//20171128 添加手机QQ直接支付
            // 	loadFiles("https://open.mobile.qq.com/sdk/qqapi.js?_bid=152", "script", function(){
            // 	    dhpayFn.userData = userInfo;
            // 		dhpayFn.userData.payChannel='qpay';
            // 		dhpayFn.userData.payScene = 4;
            // 		$('#pay-model-mask').hide();
            // 		dhpayFn.getpayBydata();
            //     });

            // 	return false;
            // }
            else {
                if (payObj.config) {
                    if (payObj.config.alipay || typeof payObj.config.alipay == 'undefined') {
                        paylistHtml += alipayStr;
                        showpayAry.push('alipay');
                    }
                    if (payObj.config.weixin || typeof payObj.config.weixin == 'undefined') {
                        paylistHtml += weixinStr;
                        showpayAry.push('weixin');
                    }
                    if ((payObj.config.qpay || typeof payObj.config.qpay == 'undefined') &&
                        (browser.versions.mobile && browser.versions.qq)) {
                        paylistHtml += qpayStr;
                        showpayAry.push('qpay');
                    }
                } else {
                    paylistHtml = alipayStr + weixinStr + qpayStr;
                }
            }


            if ((browser.versions.ios || browser.versions.android) && browser.versions.weixin) {//手机微信端
                dhpayFn.userData = userInfo;
                dhpayFn.userData['payChannel'] = 'weixin';
                dhpayFn.getpayBydata();
            }

            FastClick.attach(document.body);
            dhpayFn.int();
        },
        hidepay: function (flag) {
            if (isResultPost || flag == 1) {
                var _t = this;
                showpayAry.length = 0;
                if ($('#payModelMask').length > 0) {
                    $('#payModelMask').remove();
                }
                if (typeof _t.closecallback == 'function' && !isUseClose) {
                    isUseClose = true;
                    _t.closecallback();
                }
                return true;
            } else {
                return true;
            }
        }
    }

    //初始化界面
    startviewObj = {
        int: function () {
            this.startHTML();
            this.startview();
        },
        /*
        @method startview 初始化界面
        */
        startview: function () {
            var _t = this;
            new function () {
                var _self = this;
                _self.width = 640;
                _self.fontSize = 40;
                _self.widthProportion = function () {
                    var p = (document.body && document.body.clientWidth || document.getElementsByTagName("html")[0].offsetWidth) / _self.width;
                    return p > 1 ? 1 : p < 0.5 ? 0.5 : p;
                };
                _self.changePage = function () {
                    document.getElementsByTagName("html")[0].setAttribute("style", "font-size:" + _self.widthProportion() * _self.fontSize + "px !important");
                }
                _self.changePage();
                window.addEventListener('resize', function () {
                    _self.changePage();
                }, false);
            };

            var iswx = (browser.versions.ios || browser.versions.android) && browser.versions.weixin,
                iswb = (browser.versions.ios || browser.versions.android) && browser.versions.weibo;
            if (!iswx) {
                if (iswb) {
                    _t.showSection({eleary: ['.alipay']});
                } else {
                    _t.showSection({eleary: ['all']});
                }
            }
        },
        /*
        @method startHTML 初始化html
        */
        startHTML: function () {
            var payhtml = '<div class="pay-model-mask" id="payModelMask">' +
                '<div id="PayModelBox" class="pay-model-box">' +
                '<section id="PaywayBox" class="paywayBox">' +
                '<div class="pay-model-hd"><div class="payborder"></div><p>￥' + toDecimal2(userInfo.amount / 100) + '</p><span>' + userInfo.subject + '</span><a class="closepaybtn" href="javascript:void(0);">&#10005;</a></div>' +
                '<div class="pay-model-bd">' +
                '<ul class="payway-list" id="DHpaylist">' + paylistHtml + '</ul>' +
                '</div>' +
                '</section>' +
                '<section id="PayboxCode" class="payboxCode">' +
                '<div class="pay-model-bd">' +
                '<div class="pay-model-wayer">支付<a href="javascript:void(0);" class="closepaybtn">&#10005;</a></div><div id="payWayerTit" class="pay-wayer-tit">请长按二维码识别支付</div>' +
                '<div class="codecon" id="CodeContent"><img src=""></div>' +
                '</div>' +
                '</section>' +
                '<section id="PayTip" class="paytip">' +
                '<div class="pay-model-tip"><span>请点击确认支付</span><a id="tipcloseBtn" class="close">&#10005;</a></div>' +
                '<a id="paysureBtn" href="javascript:void(0);">确认支付</a>' +
                '</section>' +
                '</div>' +
                '</div>';
            if ($('#payModelMask').length > 0) {
                $('#payModelMask').remove();
            }
            $('body').append(payhtml);
            if ($('#DHpaylist li').length == 1) {
                $('#DHpaylist li').addClass('center')
            }
            ;
            if ($('#DHpaylist li').length == 3) {
                $('#DHpaylist li').css('width', '3.9rem');
            }
        },
        /*
        @method showSection 按需显示模块
        @param showJson {json} showJson={section:'',eleary:[]}
        */
        showSection: function (showJson) {
            var DHpaylist = $('#DHpaylist');
            if (typeof showJson.section == 'undefined') {
                showJson.section = '#PaywayBox';
            }
            if (showJson.section == '#PayLoading') {
                $('#payModelMask').css('display', 'none');
                var loadhtml = '<div id="PayLoading"><div class="spinner">' +
                    '<div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div>' +
                    '<div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div>' +
                    '<div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div>' +
                    '</div></div>';
                $('body').append(loadhtml);
                return;
            }
            if (showJson.section == '#PayTip') {
                $('#PayModelBox').addClass('small');
            }
            $('#payModelMask').css('display', 'block');
            $(showJson.section).css('display', 'block');
            $(showJson.section).siblings('section').css('display', 'none');
            if (typeof showJson.eleary == 'undefined' || showJson.eleary.length == 0) {
                return;
            } else if (showJson.eleary.length == 1) {
                if (showJson.eleary[0] == 'all') {
                    $('#DHpaylist li').css('display', 'block');
                } else {
                    $('#DHpaylist ' + showJson.eleary[0]).css({
                        'display': 'block',
                        'margin-left': '3.02rem',
                        'border': 'none'
                    });
                }
            } else if (showJson.eleary.length > 1) {
                for (var i = 0; i < showJson.eleary.length; i++) {
                    $('#DHpaylist ' + showJson.eleary[i]).css({
                        'display': 'block'
                    });
                }
                ;
            }
        },
        removeLoading: function () {
            $('#PayLoading').remove();
        }
    };

    //支付功能
    dhpayFn = {
        userData: {},
        int: function () {
            startviewObj.int();
            this.userData = userInfo;
            this.bind();
        },
        bind: function () {
            var _t = this;
            $('#DHpaylist').on('click', 'a', function () {
                var datatype = $(this).attr('data-type');
                _t.userData['payChannel'] = datatype;
                _t.getpayBydata();

                /*微端数据上报接口代码*/
                var postChooseData = {
                    transactionId: '' + _t.userData.cpOrderId,  // CP的订单号
                    currencyType: 'CNY',                          // 支付类型，人民币
                    currencyAmount: _t.userData.amount / 100    // 支付的金额，元
                };

                // 支付类型判断
                if (/wx/.test(datatype)) {
                    postChooseData.paymentType = 'wxpay';
                } else if (/alipay/.test(datatype)) {
                    postChooseData.paymentType = 'alipay';
                }

                // 调用闪电玩的接口，上报数据
                sdw && sdw.postChoosePayInfo && sdw.postChoosePayInfo(postChooseData);
                /*微端数据上报接口代码*/
            });

            $('#tipcloseBtn').click(function () {
                dhpayObj.hidepay(1);
            });

            $('#paysureBtn').click(function () {
                $('#alipaysubmit').submit();
                dhpayObj.hidepay(1);
            });

            $('#payModelMask').click(function () {
                dhpayObj.hidepay(1);
            });

            $('#PayModelBox').click(function (event) {
                event.stopPropagation();
            });

            $('.closepaybtn').click(function () {
                dhpayObj.hidepay(1);
            });

            window.addEventListener('message', function (e) {
                var mesgJson = {};
                if (typeof e.data == 'object') {
                    mesgJson = e.data;
                } else {
                    mesgJson = JSON.parse(e.data);
                }

                if (mesgJson['closeCode']) {
                    dhpayObj.hidepay(1);
                } else if (mesgJson['postSdwData'] && mesgJson['operate'] && mesgJson['operate'] == 'DH_WAP_PAY_CALLBACK') { //20070807
                    dhpayObj.closecallback();


                    // flag [2018-01-16 14:31:28] 新增QQ支付的消息通知回调
                } else if (mesgJson['postSdwData'] && mesgJson['operate'] && mesgJson['operate'] == 'CHOOSE_QQ_APP_PAY_CALLBACK') {
                    // alert('父页面传过来的QQ支付回调数据\n' + mesgJson.result + '\n' + mesgJson.resultCode)
                    dhpayObj.closecallback();
                }
            }, false);

        },
        /*
        @method onBridgeReady 向微信浏览器提交
        */
        onBridgeReady: function (wxdataJson) {
            if (parent === window) {
                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest', {
                        "appId": wxdataJson.wxappId,//公众号名称，由商户传入
                        "timeStamp": wxdataJson.wxtimeStamp, //时间戳，自1970年以来的秒数
                        "nonceStr": wxdataJson.wxnonceStr, //随机串
                        "package": wxdataJson.wxpackage,
                        "signType": wxdataJson.wxsignType, //微信签名方式
                        "paySign": wxdataJson.wxpaySign //微信签名
                    },
                    function (res) {
                        if (res.err_msg == "get_brand_wcpay_request:ok") {
                            alert("OK");
                        }
                    }
                );
            } else {
                parent.postMessage(JSON.stringify(wxdataJson), '*');
            }
        },
        /*
        @method template form模板替换
        @param {Array} aryjson json数组数据
        @param {bool} isSubmit 是否支持自动提交
        @param {bool} isblank 是否新窗口打开
        @return {string} 拼接的字符串
        */
        template: function (aryjson, isSubmit, isblank) {
            if ($('#alipaysubmit').length > 0) {
                $('#alipaysubmit').each(function () {
                    $(this).remove();
                });
            }
            var formstr = '', newhtml = '', formurl = '', forcharset = '', balnkstr = '_self';
            for (var i = 0; i < aryjson.length; i++) {
                if (aryjson[i]['name'] == 'actionurl') {
                    formurl = aryjson[i]['value'];
                } else if (aryjson[i]['name'] == '_input_charset') {
                    forcharset = aryjson[i]['value'];
                } else {
                    newhtml += '<input type="hidden" name="' + aryjson[i]['name'] + '" value="' + aryjson[i]['value'] + '">';
                }
            }
            if (isblank) {
                balnkstr = '_bank';
            }
            formstr = '<form id="alipaysubmit" name="alipaysubmit" action="' + formurl + '_input_charset=' + forcharset + '" target="' + balnkstr + '" method="POST">' + newhtml + '<input type="submit" value="确认" style="display:none;"></form>';
            if (isSubmit) {
                formstr += '<script>document.forms["alipaysubmit"].submit();</script>';
            }
            return formstr;
        },
        /*
        @method payforBydata 支付调用功能
        */
        payforBydata: function () {
            var _t = this, userstr = parseParam(_t.userData);
            if (parent == window) {
                window.onDHSDKResult = dhpayObj.closecallback;
            }
            $.ajax({
                type: "GET",
                cache: false,
                url: posturl + "?" + userstr,
                dataType: 'jsonp',
                jsonpCallback: 'callback' + (new Date().getTime()),
                beforeSend: function () {
                    startviewObj.showSection({section: '#PayLoading'});
                },
                success: function (data) {
                    console.log(_t.userData);
                    console.log(data);
                    startviewObj.removeLoading();
                    if (data.result == 1) {
                        switch (_t.userData['payScene']) {
                            case 1://PC浏览器
                                if (_t.userData['payChannel'] == 'alipay') {//PC+支付宝 => 支付宝PC支付
                                    $('body').append(_t.template(data.data, false, true));
                                    startviewObj.showSection({section: '#PayTip'});
                                } else if (_t.userData['payChannel'] == 'weixin') { //PC+微信(星启天) =>二维码
                                    if ((browser.versions.ios || browser.versions.android) && browser.versions.weixin && parent != window) {
                                        parent.postMessage(JSON.stringify({
                                            operate: 'requestShowQrcode',
                                            codeUrl: data.data
                                        }), '*');
                                    } else {
                                        $('#CodeContent img').attr('src', data.data);
                                        if (browser.versions.weixin) {
                                            $('#payWayerTit').html('长按二维码识别');
                                        } else {
                                            $('#payWayerTit').html('请使用微信扫码支付');
                                        }
                                        startviewObj.showSection({section: '#PayboxCode'});
                                    }
                                }
                                break;
                            case 2://手机第三方浏览器
                                var postData = {};
                                if (_t.userData['payChannel'] == 'alipay') {//移动H5+支付宝 =>支付宝H5支付 跳转
                                    if (interfaceObj != null) {
                                        // if(interfaceObj.sdkAvaliable()=='true'){//使用sdk支付
                                        if (dhpayObj.payMethod && dhpayObj.payMethod == 'wap') {//使用sdk支付
                                            postData.operate = 'requestOpenAPP_alipayPay';
                                            postData.app = '支付宝';
                                            //postData.resultInfo=_t.template(data.data,true,false);
                                            var resultjson = {};
                                            for (var i = 0; i < data.data.length; i++) {
                                                resultjson[data.data[i]['name']] = data.data[i]['value'];
                                            }
                                            postData.resultInfo = resultjson;
                                            postData.mod = 'alipay';
                                            //20170807
                                            if (browser.versions.ios && parent !== window) {
                                                parent.postMessage(JSON.stringify({
                                                    args: postData,   // 支付数据
                                                    postSdwData: true,
                                                    operate: 'DH_WAP_PAY_CALLBACK'
                                                }), '*');
                                            } else {
                                                interfaceObj.wapPayment(JSON.stringify(postData));
                                            }
                                            //20070807
                                        } else {//使用网页打开
                                            if (parent !== window) {//iframe内
                                                postData.operate = 'requestOpenAPP_alipayPay';
                                                postData.app = '支付宝';
                                                postData.resultInfo = _t.template(data.data, true, false);
                                                parent.postMessage(JSON.stringify(postData), '*');
                                            } else {
                                                $('body').append(_t.template(data.data, true, false));
                                            }
                                        }
                                    } else {//使用网页打开
                                        if (parent !== window) {//iframe内
                                            postData.operate = 'requestOpenAPP_alipayPay';
                                            postData.app = '支付宝';
                                            postData.resultInfo = _t.template(data.data, true, false);
                                            parent.postMessage(JSON.stringify(postData), '*');

                                        } else {
                                            $('body').append(_t.template(data.data, true, false));
                                        }
                                    }
                                } else if (_t.userData['payChannel'] == 'wxwappay') { //移动H5+微信(星启天) =>微信WAPPAY接口 跳转
                                    var intervalId = setInterval(function () {
                                        confirmDialog("确认支付完成了吗？", "确定", "取消", function () {
                                            // 检测订单状态.
                                            $.ajax({
                                                url: queryurl,
                                                type: 'GET',
                                                // cache: false,
                                                dataType: 'json',
                                                // jsonpCallback:'callback'+(new Date().getTime()),
                                                data: {
                                                    type: data.data.type,
                                                    payOrderId: data.data.payOrderId,
                                                    ctoken: data.data.ctoken
                                                },
                                                success: function (response) {
                                                    console.log(response);
                                                    clearInterval(intervalId);
                                                    if (response.result == 1) {
                                                        // 付款成功
                                                    } else if (response.result == -2) {
                                                        confirmDialog("支付没有完成，如果确认已支付但游戏内未显示，请尝试刷新游戏，避免重复支付！")
                                                    } else {
                                                        confirmDialog("参数错误，请联系游戏人员")
                                                    }
                                                }
                                            });
                                        })
                                    }, 2e3);


                                    if (parent !== window) {
                                        postData.operate = 'requestOpenAPP_wxPay';
                                        postData.app = '';
                                        postData.resultInfo = decodeURIComponent(data.data.redirect_uri);
                                        parent.postMessage(JSON.stringify(postData), '*');
                                    } else {
                                        // interfaceObj.wapPayment(JSON.stringify(postData));

                                        window.location.href = decodeURIComponent(data.data.redirect_uri);

                                    }

                                    // window.location.href = decodeURIComponent(data.data.redirect_uri);
                                    /*
                                        if(interfaceObj!=null){
                                            if(dhpayObj.payMethod && dhpayObj.payMethod == 'wap'){//使用sdk打开
                                                // if(interfaceObj.sdkAvaliable()=='true'){//使用sdk打开
                                                postData.operate='requestOpenAPP_wxPay';
                                                postData.app='微信';
                                                postData.resultInfo=data.data;
                                                postData.mod='xqtweixin';
                                                //20070807
                                                if(browser.versions.ios&&parent !==window){
                                                    parent.postMessage(JSON.stringify({
                                                            args: postData,   // 支付数据
                                                            postSdwData: true,
                                                            operate: 'DH_WAP_PAY_CALLBACK'
                                                        }), '*');
                                                }else{
                                                    interfaceObj.wapPayment(JSON.stringify(postData));
                                                }
                                            }else{//使用网页打开
                                                if(parent !== window){//iframe内
                                                    postData.operate='requestOpenAPP_wxPay';
                                                    postData.app='微信';
                                                    postData.resultInfo=data.data;
                                                    parent.postMessage(JSON.stringify(postData), '*');
                                                }else{
                                                    console.log(data.data);
                                                    window.location.href=data.data;
                                                }
                                            }
                                        }else{//使用网页打开
                                            if(parent !== window){//iframe内
                                                postData.operate='requestOpenAPP_wxPay';
                                                postData.app='微信';
                                                postData.resultInfo=data.data;
                                                parent.postMessage(JSON.stringify(postData), '*');
                                            }else{
                                                window.location.href=data.data;
                                            }
                                        }
                                    */
                                }

                                break;
                            case 3://微信浏览器(无支付宝)
                                if (_t.userData['payChannel'] == 'weixin') {//微信浏览器(无Openid模式)=>二维码
                                    if (parent !== window) {
                                        parent.postMessage(JSON.stringify({
                                            operate: 'requestShowQrcode',
                                            codeUrl: data.data
                                        }), '*');
                                    } else {
                                        $('#CodeContent img').attr('src', data.data);
                                        $('#payWayerTit').html('长按二维码识别');
                                        startviewObj.showSection({section: '#PayboxCode'});
                                    }
                                } else if (_t.userData['payChannel'] == 'wxjsapi') {//微信浏览器(必须具有公众号Openid)=>目前为闪电玩
                                    // if(dhpayObj.closecallback){
                                    // 	dhpayObj.closecallback();
                                    // }
                                    var weixinJson = {
                                        wxappId: data.data.appId,
                                        wxtimeStamp: data.data.timeStamp,
                                        wxnonceStr: data.data.nonceStr,
                                        wxpackage: data.data.package,
                                        wxsignType: data.data.signType,
                                        wxpaySign: data.data.paySign
                                    }
                                    if (parent !== window) {
                                        _t.onBridgeReady(weixinJson);
                                    } else {
                                        if (typeof WeixinJSBridge == "undefined") {
                                            if (document.addEventListener) {
                                                document.addEventListener('WeixinJSBridgeReady', function () {
                                                    _t.onBridgeReady(weixinJson);
                                                }, false);
                                            } else if (document.attachEvent) {
                                                document.attachEvent('WeixinJSBridgeReady', function () {
                                                    _t.onBridgeReady(weixinJson);
                                                });
                                                document.attachEvent('onWeixinJSBridgeReady', function () {
                                                    _t.onBridgeReady(weixinJson);
                                                });
                                            }
                                        } else {
                                            _t.onBridgeReady(weixinJson);
                                        }
                                    }
                                }
                                break;
                            case 4://QQ支付
                                if (data.result == 1) {
                                    var param = {};
                                    param.tokenId = data.data.tokenId;
                                    if (data.data.appinfo != '') param.appInfo = data.data.appinfo;
                                    if (data.data.pubAcc != '') param.pubAcc = data.data.pubAcc;
                                    if (data.data.pubAccHint != '') param.pubAccHint = data.data.pubAccHint;

                                    if (window === parent) {
                                        mqq.tenpay.pay(param, function (result, resultCode) {
                                            if (resultCode == 0) {
                                                if (dhpayFn.userData.success && typeOf(dhpayFn.userData.success) == 'function') {
                                                    dhpayFn.userData.success();
                                                }
                                            }
                                        });

                                    } else {
                                        // 通知父页面去调用
                                        parent.postMessage(JSON.stringify({
                                            args: param,   // 支付数据
                                            postSdwData: true,
                                            operate: 'CHOOSE_QQ_APP_PAY'
                                        }), '*');
                                    }

                                } else {
                                    // if(dhpayFn.userData.fail && typeOf (dhpayFn.userData.fail) == 'function')
                                    // 	dhpayFn.userData.fail();
                                    console.log('接口调用失败');
                                }

                                break;
                        }
                    } else {
                        if (dhpayObj.closecallback && !isUseClose) {
                            isUseClose = true;
                            dhpayObj.closecallback();
                        }
                        alert(data.data);
                    }

                }
            });
        },
        /*
        @method getpayBydata 通过userdata设置请求数据
        */
        getpayBydata: function () {
            var _t = this;
            if (browser.versions.mobile && !browser.versions.weixin) {//手机第三方浏览器 payScene=2
                if (browser.versions.mobile && browser.versions.qq && dhpayFn.userData.payChannel == 'qpay') {
                    // _t.userData['payScene'] = 4;
                    loadFiles("https://open.mobile.qq.com/sdk/qqapi.js?_bid=152", "script", function () {

                        dhpayFn.userData.payScene = 4;
                        _t.payforBydata();
                    });
                    return false;
                } else {
                    _t.userData['payScene'] = 2;	//20171128 增加手机QQ支付场景
                }

            } else if (browser.versions.mobile
                && browser.versions.weixin) {//微信浏览器(无支付宝) payScene=3
                if (_t.userData['payChannel'] == 'weixin'
                    && typeof _t.userData['wxopenid'] != 'undefined'
                    && _t.userData['wxopenid'] != '') {//微信浏览器(必须具有公众号Openid)=>目前为闪电玩
                    _t.userData['payScene'] = 3;
                    _t.userData['payChannel'] = 'wxjsapi';
                } else {
                    _t.userData['payScene'] = 1;
                    if (_t.userData['payChannel'] == 'wxwappay') {
                        _t.userData['payChannel'] == 'weixin';
                    }
                }
            } else {//PC浏览器 payScene=1
                _t.userData['payScene'] = 1;
                if (_t.userData['payChannel'] == 'wxwappay') {
                    _t.userData['payChannel'] = 'weixin';
                }
            }
            _t.payforBydata();
        }
    };

    global.dhpayObj = dhpayObj;
})(window);/**
 * Created by CHEN-BAO-DENG on 2018/11/12 0012.
 */
