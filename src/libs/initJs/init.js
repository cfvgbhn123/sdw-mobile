/**
 * Created by CHEN-BAO-DENG on 2017/3/24.
 */

var Promise = require('promise');
var sdwShareConfig = require('./sdwShareConfig');
window.SDW_WEB = require('./OS');
SDW_WEB.Store = require('./Store');
SDW_WEB.URLS = require('./URLS');
SDW_WEB.queryParam = SDW_WEB.URLS.queryUrl(true);
SDW_WEB.sdw = require('../sdwJs.js');
SDW_WEB.MD5 = require('./MD5.js');
var _protocol_ = location.protocol;
SDW_WEB.sender_sdw_id = '_sender_sdw_rfid_';
SDW_WEB.verReg = /v=/;
SDW_WEB.version = '315';
// alert(location.href);

SDW_WEB.addJSFile = function (url, callback) {
    var oHead = document.getElementsByTagName('HEAD').item(0);
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    oScript.src = url;
    oHead.appendChild(oScript);
    oScript.onload = function () {
        typeof callback === 'function' && callback();
    };
};


SDW_WEB.addCSSFile = function (path) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = path;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
};


// 对用户信息数据进行重新刷新
SDW_WEB._refreshUserData = function (url) {

    // 清空缓存
    SDW_WEB.Store.clearItem(SDW_WEB.localItem, true);
    localStorage.removeItem(window.DATAITEM);
    SDW_WEB.USER_INFO = {};

    // 重新加载
    if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper) {
        SDW_WEB.sdw.logout();
    }

    else if (SDW_WEB.onAPPs) {
        // APP内强制重新进行授权操作
        // var goToUri = location.href.split('#')[0];
        // var checkUrl = SDW_WEB.URLS.addParam({
        //     datatype: window.DATAITEM,
        //     goto: goToUri,
        //     channel: SDW_WEB.channel,
        // }, true, SDW_WEB.CHECK_URL);
        // // 获取用的信息
        // SDW_WEB.getUserInfo(null, checkUrl);
        SDW_WEB.checkUserInfo();
    } else {
        // 外部游戏可进行游客模式登录
        if (/authgame/.test(url)) {
            location.href = location.href.split('#')[0] + '&r=1';
        } else {

        }
    }
};

// flag [2017-11-07 15:53:21] 判断是否在梦平台中
(function () {

    var sessionFlag = SDW_WEB.Store.get('m3plt');
    var onM3plt = SDW_WEB.queryParam['accountid'] && SDW_WEB.queryParam['sessionid'];

    // 对梦平台进行缓存操作
    if (onM3plt) {
        SDW_WEB.Store.set('m3plt', 1);
    }

    SDW_WEB.onM3plt = sessionFlag || onM3plt;

})();

// flag [2017-12-01 14:20:08] 判断是否在梦三游戏客户端内
(function () {

    var sessionFlag = SDW_WEB.Store.get('m3plt_game');
    var onM3plt = SDW_WEB.queryParam['btnName'] === 'M32GW' || (SDW_WEB.queryParam['account'] && SDW_WEB.queryParam['session']);

    // 对梦平台进行缓存操作
    if (onM3plt) {
        SDW_WEB.Store.set('m3plt_game', 1);
    }

    SDW_WEB.onM3pltGame = sessionFlag || onM3plt;

})();


// 用于QQ，微信等授权
SDW_WEB.CHECK_URL = _protocol_ + '//www.shandw.com/v2/check.html?v=' + SDW_WEB.version;

(function () {
    var sId = SDW_WEB.queryParam[SDW_WEB.sender_sdw_id];
    if (sId) {
        var sStr = SDW_WEB.sender_sdw_id + '=' + sId;
        if (location.href.indexOf('?') === -1)
            SDW_WEB.CHECK_URL += '?' + sStr;
        else
            SDW_WEB.CHECK_URL += '&' + sStr;
    }
})();


// 微信公众号地址
SDW_WEB.SDW_WEIXIN_URL = 'http://mp.weixin.qq.com/s/fkXbslNVCZ2gwlONoswN5A';

// ---------------------------------------------------------------------------------------------------------------------
// 获取channel、userInfo
// ---------------------------------------------------------------------------------------------------------------------

SDW_WEB.channel = getChannel();
SDW_WEB.localItem = 'SDW_USER_DATA_';
window.DATAITEM = 'H5_DATA15' + SDW_WEB.channel;

// 王座特殊的地址
var url_type = SDW_WEB.queryParam['url_Type'];

if (url_type) {
    SDW_WEB.localItem += url_type;
    window.DATAITEM += url_type;
}

SDW_WEB.callbacks = {};
SDW_WEB.callbackId = 0;

// 存储当前的ext_data字段
// 每次都会带入，移动端读取session缓存，如果跳到PC端，则需要加入相应的字段来做处理
SDW_WEB.addExtData = function () {
    if (SDW_WEB.queryParam['sdw_extdata']) {
        var KEY = 'SDW_EXT_DATA';
        SDW_WEB.Store.set(KEY, {
            channel: SDW_WEB.channel,
            extData: SDW_WEB.queryParam['sdw_extdata'],
        });
    }
};
SDW_WEB.addExtData();

SDW_WEB.getExtData = function () {
    var cacheData = SDW_WEB.Store.get('SDW_EXT_DATA');
    if (cacheData) {
        if (SDW_WEB.channel === cacheData.channel) {
            return cacheData.extData;
        }
    }
    return null;
};

/**
 * 在口袋中，需要做如下处理：
 *
 * 1.账号切换
 * 2.口袋未登录
 *
 */
if (SDW_WEB.onKD) {

    var kdUser = SDW_WEB.Store.get('kd_user');

    if (kdUser) {

        // alert('get__' + JSON.stringify(kdUser));
        // return;
    } else {

        var userObj = {};

        if (SDW_WEB.onIOS) {

            if (typeof getKDUid !== 'undefined') {
                userObj.uid = getKDUid();
                userObj.token = getKDToken(SDW_WEB.channel);
                userObj.secheme = getKDTokenSecheme();
            } else {
                // 没有登录
            }

        } else {

            if (kdjs.getKDUid()) {
                userObj.uid = kdjs.getKDUid();
                userObj.token = kdjs.getKDToken(SDW_WEB.channel);
                userObj.secheme = kdjs.getKDTokenSecheme();
            } else {
                // 没有登录
            }
        }

        SDW_WEB.Store.set('kd_user', userObj);
    }
}


// 在获取用户信息的时候，提前获取分享者的ID，并保存到session中

var sender_uid = SDW_WEB.queryParam[SDW_WEB.sender_sdw_id];

if (sender_uid) {

    SDW_WEB.URL_SENDER_ID = sender_uid;

    if (!SDW_WEB.Store.get('get_first_share')) {
        SDW_WEB.Store.set('get_first_share', sender_uid);
    } else {
        SDW_WEB.URL_SENDER_ID = SDW_WEB.Store.get('get_first_share');
    }

} else {

    SDW_WEB.URL_SENDER_ID = null;
}

/**
 * 获取用户的信息
 * @param success
 * @param authUrl
 * @param ignoreLogin 是否忽略强制登录（APP内部此字段无效）
 * @param loginFn 登录的回调
 *
 * SDW_WEB.getUserInfo(function(user){},'http://');
 */
SDW_WEB.getUserInfo = function (success, authUrl, ignoreLogin, loginFn) {

    // 加上缓存
    authUrl = SDW_WEB.URLS.addParam({
        'sdwVers': SDW_WEB.version
    }, true, authUrl);


    var outerAuthInfo = SDW_WEB.Store.get('outer_auth', true);

    // APP内强制登录**
    if (SDW_WEB.onAPPs || outerAuthInfo) ignoreLogin = false;

    var self = this;

    var authConfig = {
        qq: 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101359011&redirect_uri=URLREPLACE&scope=get_user_info&state=123456&display=mobile',
        wb: 'https://api.weibo.com/oauth2/authorize?client_id=530008665&redirect_uri=URLREPLACE&response_type=code',
        wx: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfd695e777664b347&redirect_uri=URLREPLACE&response_type=code&scope=snsapi_userinfo&state=125455#wechat_redirect',
        ali: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2017101109247098&scope=auth_user&redirect_uri=URLREPLACE',
        jdjr: 'https://open.jr.jd.com/oauth2/authorization/forward?appid=JD0000418&redirect_uri=URLREPLACE&scope=base&state=cba',
    };

    // 在闪电玩中，或者在微端中，直接退出，采用其他的方式获取...
    if (this.onShandw || this.onMicroSDWAPP || this.onM3plt || this.onM3pltGame || SDW_WEB.onMDZZHelper) {
        SDW_WEB.USER_INFO = {};
        return;
    }

    // 来自梦三国客户端
    if (this.queryParam['s_from'] == 'm3g') {
        return;
    }

    // 具体参数同sdw的getUserInfo的参数 web端的用户信息
    var userInfo = this.Store.get(this.localItem, true);
    var oldUserInfo = localStorage[window.DATAITEM];
    if (oldUserInfo) {
        oldUserInfo = JSON.parse(oldUserInfo);
    }

    // 检查口袋的账号问题（待测试）
    var checkKdUid = function (cacheUser) {
        cacheUser = cacheUser || {uid: -2};
        // 判断是否有登录口袋
        var kdUser = SDW_WEB.Store.get('kd_user');
        kdUser.uid = kdUser.uid || -1;
        if (kdUser.uid != cacheUser.uid) {
            cacheUser = null;
            return true;
        }
        return false;
    };

    if (SDW_WEB.onKD) {
        if (checkKdUid(userInfo)) {
            userInfo = null;
        }
        if (checkKdUid(oldUserInfo)) {
            oldUserInfo = null;
        }
    }
    // 进行账号的校验检查
    if (userInfo) {
        userInfo.secheme = +new Date();
        userInfo.token = this.MD5('' + this.channel + userInfo.uid + userInfo.secheme + userInfo.otoken);
        userInfo.avatar = userInfo.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
        SDW_WEB.USER_INFO = userInfo;
        addUserUid();
        success && success(userInfo);
    }

    // #################################################################################################################
    // #################################################################################################################
    // 如果没有新版的用户数据，则：
    // 1.先获取老用户信息
    // 2.对APP环境内进行强制授权
    // 3.其他没有登录的情况
    // #################################################################################################################
    // #################################################################################################################

    // 1.提取老的用户信息
    else if (oldUserInfo) {
        // 将旧的用户信息转成新的格式
        // v2版本的用户数据  id => uid
        var v2UserData = {
            uid: oldUserInfo.uid || oldUserInfo.id,
            otoken: oldUserInfo.otoken || oldUserInfo.token,
            nick: oldUserInfo.nick,
            sex: oldUserInfo.sex,
            avatar: oldUserInfo.avatar,
            city: oldUserInfo.city,
            fl: oldUserInfo.fl
        };

        SDW_WEB.Store.set(SDW_WEB.localItem, v2UserData, true);

        v2UserData.secheme = +new Date();
        v2UserData.token = this.MD5('' + this.channel + v2UserData.uid + v2UserData.secheme + v2UserData.otoken);
        v2UserData.avatar = v2UserData.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';

        // console.log(v2UserData);
        this.USER_INFO = v2UserData;

        addUserUid();
        success && success(v2UserData);
    }


    // 2.需要强行进行授权的
    else if (!ignoreLogin) {
        // 获取外部曾用QQ，微博等授权过的信息，用于直接跳转登录
        var outer_platform = null, auth_platform = null;
        if (outerAuthInfo) {
            outer_platform = outerAuthInfo.platform;
        }

        // =============================================================================================================
        // 没有登入信息，进行各个渠道的授权；

        if (typeof authUrl !== 'string' || !/^(https|http)/.test(authUrl)) {
            alert('[SDW_WEB.getUserInfo]: authUrl 参数必须是回调地址');
            return;
        }

        // 微信授权
        if (this.onWeiXin) {
            location.href = authConfig['wx'].replace(/URLREPLACE/, encodeURIComponent(authUrl));
        }


        // 口袋授权
        else if (this.onKD) {
            location.href = authUrl;
        }
        
        // QQ授权
        else if (this.onQQ || (this.onQQBrowser && !this.onJDJR) || outer_platform === 'qq') {
            location.href = authConfig['qq'].replace(/URLREPLACE/, encodeURIComponent(authUrl));
        }


        // 微博授权
        else if (this.onWeiBo || outer_platform === 'wb') {
            location.href = authConfig['wb'].replace(/URLREPLACE/, encodeURIComponent(authUrl));
        }
        
        // 京东金融授权
        else if (this.onJDJR || outer_platform === 'jdjr') {
            if(_protocol_ === "http:"){
                authUrl = authUrl.replace(/http/,"https");
            }
            location.href = authConfig['jdjr'].replace(/URLREPLACE/, encodeURIComponent(authUrl));
        }
        else if (this.onAliPay) {
            location.href = authConfig['ali'].replace(/URLREPLACE/, encodeURIComponent(authUrl));
        }

        // 外部的，进行短信登录
        else {
            var loginPage = this.queryParam['lg_to'];
            var gid = this.queryParam['gid'];
            SDW_WEB.__needLogin__ = true;
            SDW_WEB.USER_INFO = {};
        }

    }
    // 3.外部没有登录情况
    else {
        SDW_WEB.USER_INFO = {};
    }

};


// 往地址后面添加当前用的信息
function addUserUid() {

    /*微信中不进行链接的更改*/
    if (SDW_WEB.onWeiXin) {
        return;
    }

    var _oldUrl = location.href.split('?')[0];
    var userInfo = SDW_WEB.USER_INFO;
    var oldUrl = location.href;
    var querySendId = SDW_WEB.queryParam[SDW_WEB.sender_sdw_id];


    /*如果已经存在*/
    if (querySendId) {
        // 当前的用户与链接上的用户id不一致，修改当前的用户
        if (!SDW_WEB.URL_SENDER_ID && SDW_WEB.URL_SENDER_ID != userInfo.uid) {
            // 变更当前分享用户的id
            SDW_WEB.queryParam[SDW_WEB.sender_sdw_id] = userInfo.uid;
            oldUrl = SDW_WEB.URLS.addParam(SDW_WEB.queryParam, true, _oldUrl);
        }
    }

    else if (!SDW_WEB.URL_SENDER_ID) {
        // 添加发送者的用户id

        if (oldUrl.indexOf('?') === -1) {
            oldUrl += '?' + SDW_WEB.sender_sdw_id + '=' + userInfo.uid;
        } else {
            oldUrl += '&' + SDW_WEB.sender_sdw_id + '=' + userInfo.uid;
        }
    }

    var stateObj = {foo: "uid"};
    history.replaceState(stateObj, "", oldUrl);
}

// 获取渠道值
function getChannel() {
    var channel = SDW_WEB.queryParam['channel'];
    var defaultChannel = SDW_WEB.onPC ? '10250' : '10000';
    if (channel == 'undefined' || !/^\d+$/.test(channel)) {
        channel = defaultChannel;
    } else {
        channel = channel || defaultChannel;
    }
    return channel;
}

// ---------------------------------------------------------------------------------------------------------------------
// 变更url地址
// ---------------------------------------------------------------------------------------------------------------------

SDW_WEB.changeUrl = function () {

    var oldUrl = location.href;

    // 添加channel
    if (oldUrl.indexOf('channel') == -1) {
        // 如果没有渠道，则加入原渠道
        oldUrl += '&channel=' + this.channel;
    }

    if (oldUrl.indexOf('?') == -1) {
        var res = oldUrl.replace(/&/, '?')
    } else {
        res = oldUrl;
    }

    var stateObj = {foo: "bar"};
    history.replaceState(stateObj, "", res);
};


if (SDW_WEB.onWeiXin && SDW_WEB.onIOS) {
    // IOS微信，闪电玩不变更URL地址

} else if (!(SDW_WEB.onShandw || SDW_WEB.onMDZZHelper)) {
    SDW_WEB.changeUrl();
}


// ---------------------------------------------------------------------------------------------------------------------
// 接口地址
// ---------------------------------------------------------------------------------------------------------------------

SDW_WEB.MOBILE_ROOT = _protocol_ + '//www.shandw.com/m/'; // 首页


(function () {

    // if (!SDW_WEB.onMobile) return;

    // 游戏界面
    if (/\./.test(location.pathname) && /game/.test(location.pathname)) {
        var arr = location.pathname.split('.')[0].split('/');
        SDW_WEB.MOBILE_GAME_GID = arr[arr.length - 1];
    } else {
        SDW_WEB.MOBILE_GAME_GID = SDW_WEB.queryParam['gid'];
    }

})();

// SDW_WEB.MOBILE_GAME = SDW_WEB.MOBILE_ROOT + 'game/';  // 游戏地址

window.HTTP_STATIC = 'https://platform.shandw.com/';// 平台首页
window.HTTP_USER_STATIC = 'https://auth.shandw.com/';  // 账号类

// ---------------------------------------------------------------------------------------------------------------------
// 闪电玩的唯一ID值
// ---------------------------------------------------------------------------------------------------------------------

SDW_WEB.createGUI = function (length) {

    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    var keyItem = 'SDW_GUID';
    var GUI = this.Store.get(keyItem, true) || '';

    if (GUI.length != 32) {
        GUI = '';
        for (var i = 0; i < length; i++) GUI += S4();
        this.Store.set(keyItem, GUI, true);
    }

    return GUI;
};

SDW_WEB.guid = SDW_WEB.createGUI(8);

SDW_WEB.createXMLHTTPRequest = function () {
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
};


/**
 * 请求数据
 * @param url
 * @param success
 * @param checkResult
 */
SDW_WEB.getAjaxData = function (url, success, checkResult,options) {

    if (!url) {
        alert('[getAjaxData]: url error');
        return;
    }

    var _params = SDW_WEB.URLS.queryUrl(false, url);
    var _res = {};

    var dpi = window.devicePixelRatio || 1;

    _res.imei = SDW_WEB.guid;
    _res.os = SDW_WEB.os;
    _res.tg = _params.tg || 0;  // 社区字段兼容
    _res.w = SDW_WEB.width * dpi;
    _res.h = SDW_WEB.height * dpi;
    _res.channel = SDW_WEB.channel;
    if(SDW_WEB.USER_INFO){

        _res.sec = SDW_WEB.USER_INFO.secheme;
        _res.token = SDW_WEB.USER_INFO.token;
        if(url.indexOf('pageGameShopOrde') == -1){
            _res.uid = SDW_WEB.USER_INFO.uid;
        }
    }
    // 判断是否是有fl标记；
    if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.fl) {
        _res.fl = SDW_WEB.USER_INFO.fl;
    }

    // 邀请者ID
    var query = SDW_WEB.queryParam;
    if (query[SDW_WEB.sender_sdw_id]) {
        _res.rfid = query[SDW_WEB.sender_sdw_id];
    }
    for (var i in _params) {
        if (typeof _params[i] != "undefined") {
            _res[i] = _params[i];
        }
    }

    var _url = url.split('?')[0];
    url = SDW_WEB.URLS.addParam(_res, false, _url);

    var req = this.createXMLHTTPRequest();
    if (req) {
        req.open("GET", url, true);
       if(options){
           req.timeout = options.timeout || 6000 ;
           req.ontimeout  = function () {
               options.timeoutFun && options.timeoutFun();
           };

       }

        req.onerror = function () {
            options && options.fail && options.fail();
            dialog.show('error', '服务器开小差了', 2);
        };

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                var data = JSON.parse(req.responseText);
                /*二维码记录，
                如果是移动端，只需要记录单个即可，
                PC端出现多个游戏，巨坑埋点*/
                SDW_WEB.qrCodeManage && SDW_WEB.qrCodeManage.filterCode(url, data);

                if (data.result === -4) {

                    // 渠道值不存在，跳转到默认的channel
                    dialog.show('error', '您当前的渠道值不合法');

                    setTimeout(function () {

                        dialog.hidden();
                        var oUrl = '';
                        if (SDW_WEB.onPC) {
                            oUrl = _protocol_ + '//www.shandw.com/pc/index/?channel=10000';
                        } else {
                            oUrl = SDW_WEB.MOBILE_ROOT + 'index/?channel=10000';
                        }

                        if (location.replace) {
                            location.replace(oUrl);
                        } else {
                            location.href = oUrl;
                        }
                    }, 600);
                }

                var needRefreshUserData = ajaxDataFilter(url, data);

                // 重新授权用户信息
                if (needRefreshUserData) {
                    SDW_WEB._refreshUserData(url);
                    return;
                }

                if (typeof success !== 'function') return;

                if (checkResult) {
                    if (data.result === 1) {
                        success(data);
                    } else {
                        alert(JSON.stringify(data));
                    }
                } else {
                    success(data);
                }
            }
        };

        req.send(null);
    }
};

SDW_WEB.postAjaxData = function (url, data, success,options) {

    var ajax = this.createXMLHTTPRequest();

    var _params = SDW_WEB.URLS.queryUrl(false, url);
    var _res = {};

    for (var i in _params) {
        if (typeof _params[i] != "undefined") {
            _res[i] = _params[i];
        }
    }

    var dpi = window.devicePixelRatio || 1;

    _res.imei = SDW_WEB.guid;
    _res.os = SDW_WEB.os;
    _res.w = SDW_WEB.width * dpi;
    _res.h = SDW_WEB.height * dpi;
    _res.uid = SDW_WEB.USER_INFO.uid;
    _res.sec = SDW_WEB.USER_INFO.secheme;
    _res.token = SDW_WEB.USER_INFO.token;
    _res.channel = SDW_WEB.channel;
    // 判断是否是有fl标记；
    if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.fl) {
        _res.fl = SDW_WEB.USER_INFO.fl;
    }

    var _url = url.split('?')[0];
    url = SDW_WEB.URLS.addParam(_res, false, _url);
    ajax.open('post', url);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    if(options && options.contentType){
        console.log(options.contentType);
        ajax.setRequestHeader("Content-type", options.contentType);
    }

    // 发送

    // post请求 发送的数据 写在 send方法中
    var _data = this.URLS.param(data);
    ajax.send(_data);

    // 注册事件
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            try {
                var res = JSON.parse(ajax.responseText);
                success && success(res);
            } catch (e) {

            }
        }
    }

};



function ajaxDataFilter(url, data) {

    var PAGE_INDEX = /\/index/.test(location.href);
    var GET_CODE_URL = /getcode/.test(url);
    var wcjsapi = /wcjsapi/.test(url);
    var usergame = /usergame/.test(url);
    var notShandw = SDW_WEB.onAPPs && !SDW_WEB.onShandw;

    if (data.result !== -3) {
        return false;
    }

    if (data.result === -3) {

        // flag [2017-11-10 17:43:16] 签到出错需要重新登录授权
        if (/checkin/.test(url)) {
            return true;
        }

        if (GET_CODE_URL || wcjsapi || usergame || SDW_WEB.onM3plt) return false;

        if (PAGE_INDEX) {
            return notShandw;
        } else {
            return true;
        }
    }

    return false;
}


// 获取闪电玩（平台）的用户信息（异步）此处需要整合所有的获取
SDW_WEB.checkUserInfo = function (ignore) {

    var goToUri = location.href.split('#')[0];
    var checkUrl = SDW_WEB.URLS.addParam({
        datatype: window.DATAITEM,
        goto: goToUri,
        channel: SDW_WEB.channel,
    }, true, SDW_WEB.CHECK_URL);

    // 只是获取初始的用户信息，不用强制登录
    SDW_WEB.getUserInfo(null, checkUrl, ignore);
};


SDW_WEB.getSdwUserData = function () {

    var promise = new Promise(function (resolve, reject) {

        if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper) {

            SDW_WEB.sdw.getUserInfo({
                success: function (res) {
                    SDW_WEB.channel = res.channel;
                    SDW_WEB.USER_INFO = res;
                    resolve && resolve(SDW_WEB.USER_INFO);
                },
                fail: function (res) {
                    reject && reject(res);
                }
            });

        } else if (this.onM3plt || this.onM3pltGame) {

            // 获取梦三平台的相关用户信息
            SDW_WEB.getM3pltUserData(resolve, reject);

        } else {

            if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {
                resolve && resolve(SDW_WEB.USER_INFO);
            } else {
                reject && reject({result: -1, msg: '用户没有登录'});
            }
        }

    });

    return promise;
};

// flag [2017-11-08 09:37:01] 获取梦平台的账号信息
/**
 * SDW_WEB.getM3pltUserData(function(res){
 *   console.log('成功获取到梦平台的信息')
 * },function(err){
 *   console.log('获取失败')
 * })
 *
 * @param success
 * @param fail
 */
SDW_WEB.getM3pltUserData = function (success, fail) {

    // 优先读取本地的缓存数据
    var userInfo = this.Store.get(this.localItem);
    if (userInfo && userInfo.uid) {
        SDW_WEB.USER_INFO = userInfo;
        success && success(SDW_WEB.USER_INFO);

        SDW_WEB._USER_AUTH_CALLBACK && SDW_WEB._USER_AUTH_CALLBACK();

    } else {
        // 重新获取信息
        var data = {
            channel: SDW_WEB.channel,

            // flag [2017-12-01 14:29:10] 修改平台标记
            accountid: this.onM3plt ? SDW_WEB.queryParam['accountid'] : SDW_WEB.queryParam['account'],
            sessionid: this.onM3plt ? SDW_WEB.queryParam['sessionid'] : SDW_WEB.queryParam['session']
        };
        var uri = SDW_WEB.URLS.addParam(data, false, 'https://auth.shandw.com/pcm3gauth');
        SDW_WEB.getAjaxData(uri, function (data) {

            if (data.result === 1) {
                var v2UserData = {
                    uid: data.id,
                    otoken: data.token,
                    nick: data.nick,
                    sex: data.sex,
                    avatar: data.avatar,
                    city: data.city,
                    fl: data.fl
                };
                v2UserData.secheme = +new Date();
                v2UserData.token = SDW_WEB.MD5('' + SDW_WEB.channel + v2UserData.uid + v2UserData.secheme + v2UserData.otoken);
                SDW_WEB.Store.set(SDW_WEB.localItem, v2UserData);
                SDW_WEB.USER_INFO = v2UserData;
                success && success(v2UserData);
                SDW_WEB._USER_AUTH_CALLBACK && SDW_WEB._USER_AUTH_CALLBACK();
            } else {
                fail && fail('Ajax [请求用户授权信息]:' + JSON.stringify(data));
            }
        });
    }
};

// flag [2017-11-08 10:20:05] 梦平台跳转外部的地址
SDW_WEB.m3pltOpenGame = function (gid, screen) {

    if (!gid) {
        alert('请传入gid参数');
        return;
    }

    //
    var uData = SDW_WEB.Store.get(SDW_WEB.localItem, true);

    // 传入一些游戏及用户的信息
    var oParam = {
        gid: gid,
        channel: SDW_WEB.channel,
        uid: uData.uid,
        otoken: uData.otoken,
        nick: uData.nick,
        sex: uData.sex,
        // avatar: encodeURIComponent(uData.avatar.split('?')[0]),  // 头像的地址
        fl: uData.fl,
        plt: this.onM3plt ? 'm3plt' : 'm3pltGame',  // flag [2017-12-01 14:28:57] 修改平台标记
        v: +new Date()
    };

    // 传入是否是横屏游戏
    if (screen) {
        oParam.screen = screen;
    }

    var goUri = SDW_WEB.URLS.addParam(oParam, false, 'http://www.shandw.com/login/m3plt.html');
    // dialog.show('ok', goUri);
    window.open(goUri);
};

// 页面适配
(function (doc) {

    SDW_WEB.setHTMLFontSize = function () {


        // 页面初始化字体，用于简单的页面适配
        if (SDW_WEB.onMobile) {
            var WIDTH = doc.documentElement.clientWidth || doc.body.clientWidth;
            var HEIGHT = doc.documentElement.clientHeight || doc.body.clientHeight;
            WIDTH = Math.min(WIDTH, HEIGHT);
            var fontSize = WIDTH / 375 * 16;
            fontSize = Math.min(fontSize, 19);
            fontSize = fontSize.toFixed(2);
            SDW_WEB.fontSize = fontSize;
        } else {
            SDW_WEB.fontSize = 16;
        }

        doc.documentElement.style.fontSize = SDW_WEB.fontSize + 'px';

    };

    SDW_WEB.setHTMLFontSize();

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

})(document);

// 通用对话提示框
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
            var dom = document.createElement('div');
            dom.innerHTML = '<section class="dialogs"><div id="icons"></div><div class="msg"></div></section>';

            dom.className = 'dialogsCont';

            if (document.body) {
                document.body.appendChild(dom);
                dialog.dom = dom;
                dialog.msgCont = document.querySelector('.dialogs .msg');
                dialog.icons = document.querySelector('#icons');
            }
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

    // 开始设置分享
    sdwShareConfig.start();

}, false);

SDW_WEB.transformQuantity = function (coin) {

    var big, small;

    if (coin < 10000) return coin;

    if (coin < 100000000) {
        big = coin / 10000 >> 0;
        small = (coin % 10000) + '';

        if (small == 0) {
            return big + '万';
        }

        return big + '.' + small[0] + '万';
    }


    if (coin < 10000000000) {
        big = coin / 100000000 >> 0;
        small = (coin % 100000000) + '';

        if (small == 0) {
            return big + '亿';
        }

        return big + '.' + small[0] + '亿';
    }
};

SDW_WEB.debug = true;

SDW_WEB.Log = function (message) {

    if (this.debug == false) return;

    if (this.onMobile) {
        alert(message);
    } else {
        console.log('[SDW_WEB Log]: ' + message);
    }

};

// 打开新的界面
SDW_WEB.openNewWindow = function (option) {

    if (!SDW_WEB.verReg.test(option.link)) {
        if (option.link.indexOf('?') === -1) {
            option.link += '?v=' + SDW_WEB.version;
        } else {
            option.link += '&v=' + SDW_WEB.version;
        }
    }

    // flag [2018-01-12 14:42:24] 添加野蛮人的
    if (this.onShandw || this.onMDZZHelper) {

        SDW_WEB.sdw.openWindow(option);

    } else if (this.onKD) {
        // flag [2018-01-02 17:44:59] 需要加上口袋的新开页面操作
        if (this.onIOS) {
            callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 9, "url": option.link})))
        } else {
            kdjs.openNewWebView(option.link + ";");
        }

    } else {
        location.href = option.link;
    }
};

// 设置默认的分享的内容***********************************************************************
SDW_WEB.senderIdParam = SDW_WEB.URL_SENDER_ID ? '&' + SDW_WEB.sender_sdw_id + '=' + SDW_WEB.URL_SENDER_ID : '';

function setShareInfo(data) {
    document.title = data.name;
    $('.sIcon').attr('href', data.sIcon);
    $('.sTitle').attr('content', data.name);
    $('#setShareImg').attr('src', data.sIcon);
}

// 全局的设置方法-用于各个页面的自定义设置 ====

SDW_WEB.mySetShare = sdwShareConfig.setShare;


// *****************************************************************************************
// *****************************************************************************************
// flag [2017-12-26 14:13:02] 添加事件监听（消息通知模板）
// *****************************************************************************************
// *****************************************************************************************

// 添加消息iframe广播页面
SDW_WEB.addBroadCastPage = require('./service-pack/add-broadCast');

SDW_WEB.getBroadCastData = function () {
    /*请求广播*/
    SDW_WEB.broadCastPageList = [];

    var urlReg = /^http/i;

    var postUri = SDW_WEB.URLS.addParam({
        channel: SDW_WEB.channel,
        token: SDW_WEB.USER_INFO.token,
        uid: SDW_WEB.USER_INFO.uid,
        sec: SDW_WEB.USER_INFO.secheme,
    }, false, HTTP_STATIC + 'broadcast');

    SDW_WEB.getAjaxData(postUri, function (data) {

        if (data.result === 1) {

            data.list = data.list || [];  // 防止为空

            for (var i = 0; i < data.list.length; i++) {
                var _item = data.list[i];
                if (urlReg.test(_item.link)) {
                    SDW_WEB.broadCastPageList.push(_item.link);
                }
            }
            var page = SDW_WEB.broadCastPageList.shift();
            if (page) {
                SDW_WEB.addBroadCastPage(page);
            }
        }
    });
};


// flag [2018-01-16 14:35:15] 新增QQ支付，由父页面进行调用
(function () {
    // 只在游戏界面加载
    if (/game/.test(location.href)) {
        SDW_WEB.onQQ && SDW_WEB.onMobile && SDW_WEB.addJSFile('https://open.mobile.qq.com/sdk/qqapi.js?_bid=152');
    }
})();

// 接收子页面的消息传递
window.addEventListener('message', function (e) {
    // alert(JSON.stringify(e.data));
    // console.log(e.origin);

    // if (e.origin !== 'http://www.shandw.com') return;

    if (typeof e.data === 'string') {
        try {
            var dataObj = JSON.parse(e.data);
            // 闪电玩的全局消息
            if (dataObj.postSdwData) {
                var callback = _MESSAGE_FUNCTION_[dataObj.operate];
                // console.log(dataObj.operate);
                if (callback) {
                    callback(e, dataObj);
                } else {
                    console.log('not callback');
                }
            }

        } catch (e) {
            console.log('init.js catch: ', e);
        }
    }
});

var _MESSAGE_FUNCTION_ = {

    'sdwMiniSDK_getSDWUserInfo': function (e, postData) {

        var userInfo = SDW_WEB.USER_INFO || {};
        userInfo.imei = SDW_WEB.guid;

        // console.log('initGame.js sdwMiniSDK_getSDWUserInfo[userInfo]', userInfo);

        // 读取到后，消息通知给子页面，进行相应的回调操作；
        e.source.postMessage(JSON.stringify({
            postSdwData: true,
            data: userInfo,
            operate: 'sdwMiniSDK_getSDWUserInfo_callback'
        }), '*');
    },

    // 关闭iframe广播页面方法
    "broadcast_close_frame": function (e, dataObj) {
        var iframe = document.querySelector('#' + dataObj.frameId);
        if (iframe) {
            iframe.parentNode.removeChild(iframe);
        }
        if (SDW_WEB.broadCastPageList) {
            /*next*/
            var page = SDW_WEB.broadCastPageList.shift();
            if (page) {
                SDW_WEB.addBroadCastPage(page);
            }
        }
    },

    // 调用QQ支付
    'CHOOSE_QQ_APP_PAY': function (e, dataObj) {
        var param = dataObj.args;
        // alert('QQpay');

        if (mqq && mqq.tenpay && mqq.tenpay.pay) {
            mqq.tenpay.pay(param, function (result, resultCode) {
                // 直接回调给子页面
                e.source.postMessage(JSON.stringify({
                    postSdwData: true,
                    operate: 'CHOOSE_QQ_APP_PAY_CALLBACK',
                    result: result,
                    resultCode: resultCode
                }), '*');
            });
        } else {
            console.log('CHOOSE_QQ_APP_PAY: mqq undefined');
        }
    },


    // flag [2018-01-18 16:16:59] 获取游戏的参数（新年活动 -- 俗称红包现金赛事）
    'postGameInfoToClient': function (e, dataObj) {

        /*CP通知父级页面，非游戏界面退出*/
        if (!SDW_WEB.MOBILE_GAME_GID) return;
        if (!(SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid)) return;

        // 请求后台接口，并跳转赛事结算页面
        var data = dataObj.data;

        if (!data) return;

        var postUrl = SDW_WEB.URLS.addParam({
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            channel: SDW_WEB.channel,
            fl: SDW_WEB.USER_INFO.fl
        }, true, HTTP_STATIC + 'hbsubmitdata');

        SDW_WEB.postAjaxData(postUrl, data, function (res) {

            function goUrl(myUrl) {

                // if (myUrl) {
                //     if (location.replace) {
                //         location.replace(myUrl);
                //     } else {
                // alert(myUrl);
                location.href = myUrl;

                // }
                // }
            }

            var myUrl = '';

            if (res.result === 1) {

                if (SDW_WEB.queryParam['gmUnitId'] && SDW_WEB.queryParam['matchId']) {
                    var url = SDW_WEB.URLS.addParam({
                        channel: SDW_WEB.channel,
                        gmUnitId: SDW_WEB.queryParam['gmUnitId'],
                        matchId: SDW_WEB.queryParam['matchId'],
                        gid: SDW_WEB.MOBILE_GAME_GID,
                        v: SDW_WEB.getNow()
                    }, true, 'http://www.shandw.com/activities/competition/hbgameover.html');
                    myUrl = url;
                } else {

                    myUrl = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
                }
                //
                goUrl(myUrl);
            } else {

                dialog.show('error', res.msg);
                setTimeout(function () {
                    dialog.hidden();
                    myUrl = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
                    goUrl(myUrl);
                }, 3000);

            }

        });
    },

    // 显示关注的二维码
    'onShowQcode': function (e, dataObj) {
        var gid = dataObj.gid;
        SDW_WEB.onShowQcode(gid);
    },

    // 获取关注的信息
    'getSdwQcodeInfo': function (e, dataObj) {
        var codeInfo = SDW_WEB.qrCodeManage.getCodes(dataObj.gid);
        if (!codeInfo) {
            return console.log('[getSdwQcodeInfo]游戏id错误');
        }
        e.source.postMessage(JSON.stringify({
            postSdwData: true,
            data: {
                atSDW: codeInfo.atSDW,
                qrcode: codeInfo.qrcode || '',
            },
            operate: 'getSdwQcodeInfo_callback'
        }), '*');
    },

    'get_sdw_userInfo_message': function (e, dataObj) {
        e.source.postMessage(JSON.stringify({
            postSdwData: true,
            operate: 'get_sdw_userInfo_message_callback',
            userInfo: SDW_WEB.USER_INFO
        }), '*');
    },

    // 显示对话框
    'sdw_dialogMessage': function (e, dataObj) {
        var msg = dataObj.option;
        dialog[msg.fn](msg.type, msg.msg, msg.hidden);
    },

    // 发送数据
    'postInfoH5Native': function (e, dataObj) {
        var data = dataObj.data;
        SDW_WEB.sdw.postInfoH5Native(data);
    },

    'openUrl': function (e, dataObj) {
        var link = dataObj.link;
        /*发生跳转链接*/
        var url = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel
        }, false, link);

        var openObj = {
            link: url,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        };
        openObj = SDW_WEB._checkWebViewObject(openObj);
        SDW_WEB.openNewWindow(openObj);
    },

};
// *****************************************************************************************
// *****************************************************************************************
// flag [2017-12-26 14:13:02] 添加事件监听（消息通知模板）
// *****************************************************************************************
// *****************************************************************************************


// *****************************************************************************************
// *****************************************************************************************
// flag [2018-01-05 09:40:30] 添加按钮统计
// 将需要统计的类型预先储存到本地数据中，等待下一次页面进入后，一次发送统计请求。
// 数据可能存在丢失
// *****************************************************************************************
// *****************************************************************************************
(function () {

    var postCount = {
        _map: require('./btnCountConfig'),
        _key: '_links_btn_',
        btnLinks: [],
        postBtn: function () {
            var self = this;
            self.btnLinks = self.getStorageInfo();
            self.setStorageInfo(null);   // 清除数据
            // 依次发送请求
            for (var i = 0; i < self.btnLinks.length; i++) {
                (function (i) {
                    setTimeout(function () {
                        var img = new Image();
                        // console.log(self._map[self.btnLinks[i]]);
                        img.src = self._map[self.btnLinks[i]];
                    }, i * 80);
                })(i);
            }
        },

        getStorageInfo: function () {
            var storeLinks = SDW_WEB.Store.get(this._key, true);
            return storeLinks || [];
        },

        setStorageInfo: function (links) {
            SDW_WEB.Store.set(this._key, links, true);
        },

        addCount: function (type) {
            if (!this._map[type]) return;
            var link = this.getStorageInfo();
            link.push(type);
            this.setStorageInfo(link);
        }
    };

    // 暴露一个添加统计的接口
    SDW_WEB.addCount = function (type) {
        if (!type) return;
        postCount.addCount(type);
    };

    // 预计5秒钟后进行统计发送
    document.addEventListener('DOMContentLoaded', function () {
        postCount.timer = setTimeout(function () {
            postCount.postBtn();
        }, 1000);
    }, false);

})();
// *****************************************************************************************
// *****************************************************************************************
// flag [2018-01-05 09:40:30] 添加按钮统计
// *****************************************************************************************
// *****************************************************************************************


// 检查打开webView的参数
SDW_WEB._checkWebViewObject = function (obj, item) {

    obj = obj || {};
    if (item && item.screen) {
        obj.link += '&screen=' + item.screen;
        // 移动端是横屏
        if (item.screen == 1 || item.screen == 3) {
            obj.landscape = true;
        }
    }
    return obj;
};


// 梦三国-端游内的悬浮框
// var m3glTool = require('./service-pack/m3gl-tool');
// m3glTool(document);

// 屏蔽码管理
SDW_WEB.readParam = require('./service-pack/check-param');

// 游戏二维码关注的信息
SDW_WEB.qrCodeManage = require('./service-pack/qr-code-map');

// 显示闪电玩二维码
SDW_WEB.onShowQcode = require('./service-pack/show-qCode');

// 底部的导航栏配置
SDW_WEB._pageList = require('./service-pack/footer');


(function () {

    // flag [2018-09-13 10:10:49] 包子荟萃补丁包
    if (SDW_WEB.queryParam.channel === '11212') {
        SDW_WEB.onMobile && SDW_WEB.addJSFile('http://www.shandw.com/m/service-pack/bzhc/expJs.min.js?m' + (+new Date()));
    }

    // 牛哄哄APP-JS
    if (/nhhapp/.test(navigator.userAgent)) {
        SDW_WEB.onMobile && SDW_WEB.addJSFile('https://nwk.bitgm.com/h5game/sdw.js');
    }

})();

// flag [2018-09-25 15:12:28]  支付跳转至对应的APP
var ToApp = require('./service-pack/pay-to-app');
ToApp();

// (function () {
//
//     var ua = navigator.userAgent;
//
//     // 外部safari浏览器、游戏界面
//     var flag = SDW_WEB.onMobile && SDW_WEB.onSafari && SDW_WEB.MOBILE_GAME_GID;
//     if (!flag) return;
//
//     // 链上未来  --  HAHA小视频 (只针对IOS)
//     if (SDW_WEB.queryParam.channel == '11478' && !/hahaapp/.test(ua) && SDW_WEB.onIOS) {
//         location.href = 'qufenqian://pingangame/payback/' + location.href;
//     }
//
// })();






