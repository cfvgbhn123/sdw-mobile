/**
 * 用于检测移动端的函数
 */


var OS = require('../OS');
var Store = require('../Store');

function getUserObjToJs(id) {

    var userObj = {};
    //	利用js接口获取口袋APP中用户信息
    if (typeof kdjs != 'undefined' || typeof callKDMSGToResponse != 'undefined') {

        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

            if (typeof getKDUid != 'undefined') {
                userObj.uid = getKDUid();
                userObj.token = getKDToken(id);
                userObj.secheme = getKDTokenSecheme();
                userObj.area = getKDAreaId();
                userObj.notLogin = 0;
            } else {
                userObj.uid = 'undefined';
                userObj.notLogin = 1;
            }

        } else {
            if (kdjs.getKDUid()) {
                userObj.uid = kdjs.getKDUid();
                userObj.token = kdjs.getKDToken(id);
                userObj.secheme = kdjs.getKDTokenSecheme();
                userObj.area = kdjs.getKDAreaId();
                userObj.notLogin = 0;
            } else {
                userObj.uid = 'undefined';
                userObj.notLogin = 1;
            }
        }
    } else {
        userObj.notKD = 1;
    }
    return userObj;
}

// 对于是否是口袋，第一次进行判断，针对IOS！
if (typeof sessionStorage['ON_KDAPP'] == 'undefined') {
    sessionStorage['ON_KDAPP'] = (typeof kdjs != 'undefined' || typeof callKDMSGToResponse != 'undefined') ? 'true' : 'false';
}

if (typeof sessionStorage['ON_FIRST_PAGE'] == 'undefined') {
    sessionStorage['ON_FIRST_PAGE'] = location.href;
}

//var APP = (function () {
var APP = {}, u = navigator.userAgent;
APP.onIOS = !!u.match(/\(i[^;]+;(U;)? CPU.+Mac OS X/);
APP.onMobile = !!u.match(/AppleWebKit.*Mobile.*/);
APP.onIPhone = u.indexOf("iPhone") > -1;
APP.onIPad = u.indexOf("iPad") > -1;
APP.onAndriod = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
APP.onWP = u.indexOf("Windows Phone") > -1;
APP.onQQBrowser = u.indexOf("QQBrowser") > -1;
APP.onMQQBrowser = u.indexOf("MQQBrowser") > -1;
APP.onBaiduBrowser = u.indexOf("Baidu") > -1;
APP.onUCBrowser = u.indexOf("UCBrowser") > -1;
APP.onLiebao = u.indexOf("LieBao") > -1;
APP.onSogo = u.indexOf("Sogou") > -1;
APP.onWeiXin = u.indexOf('MicroMessenger') > -1;
APP.onWeiBo = u.indexOf('Weibo') > -1;
APP.onQQ = APP.onIOS ? u.indexOf('QQ') > -1 : APP.onMQQBrowser && !APP.onWeiXin; // 需要单独对QQ应用做处理
APP.onPC = !APP.onMobile;
APP.onKD = sessionStorage['ON_KDAPP'] == 'true';
APP.width = document.documentElement.clientWidth || document.body.clientWidth;
APP.height = document.documentElement.clientHeight || document.body.clientHeight;
APP.onShandw = /Shandw/.test(navigator.userAgent);

APP.os = 0;
if (APP.onIOS) {
    APP.os = 2
} else if (APP.onAndriod) {
    APP.os = 1;
}

var C_url = getUrlObj();
var channel = '';

if (C_url['WZTOKD'] == '1' && !APP.onKD) {
    // 王座PC界面只能通过口袋扫一扫
    location.href = 'https://www.shandw.com/mobile/wangzuo/outside.html';
}

getChannels();

var DATAITEM = 'H5_DATA15' + channel;

var url_type = getUrlObj()['url_Type'];

if (url_type) {
    DATAITEM = 'H5_DATA15' + channel + url_type;
}

var USER_DATA = {
    nick: '',
    id: '',
    avatar: '',
    year: '',
    month: '',
    day: ''
};
var Shandw_USER = {};
var reAuth = false;

// 授权登入地址
var authConfig = {
    qq: 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101359011&redirect_uri=URLREPLACE&scope=get_user_info&state=123456&display=mobile',
    wb: 'https://api.weibo.com/oauth2/authorize?client_id=530008665&redirect_uri=URLREPLACE&response_type=code',
    wx: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd695e777664b347&redirect_uri=URLREPLACE&response_type=code&scope=snsapi_userinfo&state=125455#wechat_redirect'
};

// getChannelFn();

// console.log(channel, location.href, reAuth);

function getChannels() {
    channel = C_url['channel'] || '10000';
}

function getChannelFn() {

    if (C_url['s_from'] == 'm3g') {
        channel = C_url['channel'];
        return;
    }

    if (!C_url['channel'] && sessionStorage['channel']) {
        channel = sessionStorage['channel'];
    }

    if (!channel && localStorage['channel']) {
        channel = localStorage['channel'];
    }

    // 读取参数上的值
    var ochannel = C_url['channel'] || '10000';

    // 如果参数上的值跟保存的channel不一致，需要重新授权
    if (ochannel != channel) {
        channel = ochannel;
        reAuth = true;
        localStorage['channel'] = channel;
        sessionStorage['channel'] = channel;
    }

}

if (typeof sessionStorage['KD_USER'] == 'undefined') {
    sessionStorage['KD_USER'] = JSON.stringify(getUserObjToJs(channel));
}

// 内网测试专用-pc
// var APP_ROOT = 'http://192.168.110.149:1234/pc/';
// 内网测试专用-mobile
// var APP_ROOT = 'http://192.168.110.149:1234/mobile/';
// var HTTP_STATIC = 'http://192.168.110.148:9061/';// 平台首页-内
// var HTTP_USER_STATIC = 'http://192.168.110.148:9060/';  // 账号类-内

var port = location.protocol + '//';
var APP_ROOT = port + 'www.shandw.com/mobile/';
var HTTP_STATIC = port + 'platform.shandw.com/';// 平台首页
var HTTP_USER_STATIC = port + 'auth.shandw.com/';  // 账号类

var CHECK_URL = APP_ROOT + 'check2.html';

// 检查是否有用户信息
function checkUserData(success, error, readCache) {

    if (APP.onShandw) {
        return;
    }

    // 消息来自梦三平台客户端的
    if (C_url['s_from'] == 'm3g') {
        return;
    }

    if (readCache && localStorage && localStorage[DATAITEM] && !reAuth) {

        USER_DATA = JSON.parse(localStorage[DATAITEM]);

        // 针对口袋的切换账号问题
        if (APP.onKD && (JSON.parse(sessionStorage['KD_USER']).uid != USER_DATA.id)) {
            location.href = error;
        } else {
            if (success) location.href = success;
        }

    } else {

        // 没有登入信息，进行各个渠道的授权，或者是登入界面的（具体流程还未定）

        if (APP.onWeiXin) {
            // 微信授权
            location.href = authConfig['wx'].replace(/URLREPLACE/, encodeURIComponent(error));
        } else if (APP.onKD) {
            // 口袋授权
            location.href = error;
        }
        else if (APP.onQQ || APP.onQQBrowser) {
            // QQ授权
            location.href = authConfig['qq'].replace(/URLREPLACE/, encodeURIComponent(error));
        }
        else if (APP.onWeiBo) {
            // 微博授权
            location.href = location.href = authConfig['wb'].replace(/URLREPLACE/, encodeURIComponent(error));
        } else {

            // 外部的，进行短信登录
            var loginPage = C_url['lg_to'];
            var gid = C_url['gid'];

            if (loginPage) {
                location.href = APP_ROOT + 'message/' + loginPage + '/?channel=' + channel + '&lg_to=' + loginPage + '&gid=' + gid;
            } else {
                location.href = APP_ROOT + 'login.html?lg_to=' + encodeURIComponent(location.href) + '&channel=' + channel;
            }

        }

    }
}

// 获取用户信息
// function readUserCache() {
//
//     if (localStorage && localStorage[DATAITEM] && !reAuth) {
//
//         USER_DATA = JSON.parse(localStorage[DATAITEM]);
//
//         // 针对口袋的切换账号问题
//         if (APP.onKD && (JSON.parse(sessionStorage['KD_USER']).uid != USER_DATA.id)) {
//             USER_DATA = {
//                 nick: '',
//                 id: '',
//                 avatar: '',
//                 year: '',
//                 month: '',
//                 day: ''
//             };
//         }
//
//     }
//
// }

// readUserCache();

function GUID2() {

    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    // 确保有32位的唯一码
    if (localStorage && localStorage['H5_GUID'] && localStorage['H5_GUID'].length == 32) {
        // 如果存在
        APP.guid = localStorage['H5_GUID'];

    } else {
        APP.guid = '';

        for (var i = 0; i < 8; i++) {
            APP.guid += S4();
        }

        localStorage['H5_GUID'] = APP.guid;
    }
}

GUID2();
changeUrl();

function GUID() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + S4());
}

function changeUrl() {
    var oldUrl = location.href;

    if (oldUrl.indexOf('channel') == -1) {
        // 如果没有渠道，则加入原渠道
        oldUrl += '&channel=' + channel;
    }

    if (oldUrl.indexOf('?') == -1) {
        var res = oldUrl.replace(/&/, '?')
    } else {
        res = oldUrl;
    }

    var stateObj = {foo: "bar"};
    history.replaceState(stateObj, "", res);
}

function getUrlObj() {
    var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
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
}

var WIDTH = document.documentElement.clientWidth;

// 控制最大的宽度
if (WIDTH > 450) {
    WIDTH = 450;
}

var fontSize = Math.min(19, WIDTH / 320 * 16);
//var fontSize = WIDTH / 320 * 16 >> 0;

document.documentElement.style.fontSize = fontSize + 'px';

// 数字转换
function transToNum(num) {

    if (num < 10000) {
        return num;
    }

    if (num < 100000000) {
        var res = (num / 10000).toFixed(1).split('.');
        if (res[1] == '0') {
            return res[0] + '万';
        }
        return res[0] + '.' + res[1] + '万';
    }

    if (num < 10000000000) {
        var res = (num / 100000000).toFixed(1).split('.');
        if (res[1] == '0') {
            return res[0] + '亿';
        }
        return res[0] + '.' + res[1] + '亿';
    }
}

// 获取数据
function getData(url, successFn, errorFn, appOption) {

    url += '&imei=' + APP.guid + '&os=' + APP.os + '&tg=0&w=' + APP.width + '&h=' + APP.height;

    var start = +new Date();

    var aj = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        jsonp: 'cb',
        timeout: 30 * 60 * 1000,
        jsonpCallback: 'callFn' + (+new Date()) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
        success: function (data, xhr) {

            // 开始的时间
            data.callStartTimes = start;

            if (data.result == 1) {
                successFn(data, 1);

            } else if (data.result == -3) {

                // alert('返回-3' + data.msg);

                if (APP.onShandw && appOption && appOption.request == 1) {
                    appOption.callback();
                    return;
                }

                // 如果授权失败，进行登入授权操作
                localStorage.removeItem(DATAITEM + '');
                sessionStorage.clear();

                var trans = CHECK_URL + '?datatype=' + DATAITEM + '&goto=' + encodeURIComponent(location.href);
                checkUserData(null, trans, false);

            } else {
                errorFn(data);
            }

        },
        error: function (xhr, type) {

            // errorFn({msg: 'ajax请求失败', xhr: xhr});
        }

    });

}

function showError(msg) {
    $('#errorMsg')[0].innerHTML = msg;
    $('#errorCont').css('display', 'block');
}

// 地址跳转---->

if (APP.onMobile && /pc/.test(location.href)) {
    // mobile :         pc ==> mobile
    // var mobileURL = port + 'www.shandw.com/mobile/';
    var mobileURL = 'https://www.shandw.com/mobile/';
    var tUrl = '';
    if (/[game]/.test(location.href)) {
        tUrl = mobileURL + 'games.html';
    } else if (/detail/.test(location.href)) {
        tUrl = mobileURL + 'details.html';
    } else if (/gift/.test(location.href)) {
        tUrl = mobileURL + 'gifts.html';
    } else {
        tUrl = mobileURL;
    }
    location.href = tUrl + spliceParam();
}

if (!APP.onMobile && /mobile/.test(location.href)) {
    // pc    :          mobile ==> pc
    // var pcURL = port + 'www.shandw.com/pc/';
    var pcURL = 'https://www.shandw.com/pc/';
    var tUrl = '';
    if (/games/.test(location.href)) {
        tUrl = pcURL + 'game/';
    } else if (/details/.test(location.href)) {
        tUrl = pcURL + 'detail/';
    } else if (/gifts/.test(location.href)) {
        tUrl = pcURL + 'gift/';
    } else {
        tUrl = pcURL;
    }

    location.href = tUrl + spliceParam();
}

//    http -> https
if (/^http:\/\//.test(location.href)) {
    location.href = location.href.replace(/http:\/\//, 'https://');
}

function spliceParam() {
    if (location.href.indexOf('?') != -1) {
        return '?' + location.href.split('?')[1];
    }
    return '';
}

document.addEventListener('DOMContentLoaded', function () {
    //对话框 type类型：
    // 1.ok
    // 2.error
    // 3.loading
    window.dialog = {
        dom: null,
        msgCont: null,
        icons: null,
        timer: null,
        types: ['ok', 'error', 'loading'],
        init: function () {
            $('body').append('<section class="dialogsCont"><section class="dialogs"><div id="icons"></div><div class="msg"></div></section></section>');
            dialog.dom = $('.dialogsCont')[0];
            dialog.msgCont = $('.dialogs .msg')[0];
            dialog.icons = $('#icons')[0];
        },
        show: function (type, msg, autoHidden) {

            if (dialog.timer) {
                clearTimeout(dialog.timer);
                dialog.timer = null;
            }

            dialog.msgCont.innerHTML = msg;
            dialog.icons.className = 'icon-' + type;
            dialog.dom.style.visibility = 'visible';
            dialog.dom.style.opacity = '1';

            if (autoHidden) {
                dialog.hidden(2000);
            }
        },
        hidden: function (time) {
            time = time || 0;
            dialog.timer = setTimeout(function () {
                dialog.dom.style.visibility = 'hidden';
                dialog.dom.style.opacity = '0';
                dialog.timer = null;
            }, time);
        }
    };
    dialog.init();

}, false);


function loadDelayImg() {
    var img = document.querySelectorAll('img[data-loaded="0"]');
    for (var i = 0; i < img.length; i++) {
        var im = new Image(), ii = img[i];
        im.src = ii.dataset.url;
        im.onload = function () {
            ii.src = im.src;
            ii.dataset.loaded = '1';
        }
    }
}