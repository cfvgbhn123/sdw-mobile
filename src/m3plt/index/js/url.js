/**
 * Created by Administrator on 2017/2/6.
 */
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
OS.onKD = /KDM3G/.test(u) || /KDM3GNEW/.test(u) || typeof kdjs != 'undefined' || typeof callKDMSGToResponse != 'undefined';
OS.width = document.documentElement.clientWidth || document.body.clientWidth;
OS.height = document.documentElement.clientHeight || document.body.clientHeight;
OS.onShandw = /Shandw/.test(u);

OS.onMicroSDWAPP = /Micro-SDW-APP/.test(u) || /Micro-SDW-APP-WapPay/.test(u);  // 闪电玩的微端标记（只有包含游戏）
OS.onShandwMicroGame = /Shandw-Micro-Game/.test(u);  // 安卓的微端，包含游戏和闪电玩的平台，此环境下有特定的退弹（需要采用接口获取）
OS.hasIOSMicroWapPay = /Micro-SDW-APP-WapPay/.test(u);

OS.onAPPs = OS.onMobile && (OS.onWeiXin || OS.onQQ || OS.onKD || OS.onShandw || OS.onWeiBo);
OS.ky = window !== parent;

OS.os = 0;
if (OS.onIOS) {
    OS.os = (OS.onShandw || OS.onMicroSDWAPP || OS.hasIOSMicroWapPay) ? 2 : 4;
} else if (OS.onAndriod) {
    OS.os = (OS.onShandw || OS.onMicroSDWAPP || OS.onShandwMicroGame) ? 1 : 3;
}


OS.getNow = function () {
    return +new Date();
};
var gameLink = "";
var isPlaying = sessionStorage.isPlaying === 'true';
//玩游戏界面跳转移动端
if(sessionStorage && sessionStorage.collect) {
    var gameLists = JSON.parse(sessionStorage.collect).data;
    if(gameLists[0]) {
        gameLink = SDW_PATH.GAME_URL('play', gameLists[0].id)
    }
}
if(OS.onMobile && /pc/.test(location.href)&&isPlaying) {
    gameLink = gameLink.split('?')[0];
    location.href = gameLink + spliceParam();
}
// 移动端打开了PC的页面
if (OS.onMobile && /pc/.test(location.href)&&!isPlaying) {
    // mobile : pc ==> mobile
    // var mobileURL = port + 'www.shandw.com/mobile/';
    // var mobileURL = 'https://www.shandw.com/mobile/';
    var mobileURL = SDW_PATH.MOBILE_ROOT;
    var tUrl = '';
    if (/my-game/.test(location.href)) {
        // tUrl = mobileURL + 'game/';
        tUrl = mobileURL + "more/";
    } else if (/detail/.test(location.href)) {
        tUrl = mobileURL + 'detail/';
    } else if (/gift/.test(location.href)) {
        tUrl = mobileURL + 'gift/';
    } else if (/m3pc/.test(location.href)) {
        tUrl = mobileURL + 'game/';
    } else if (/news/.test(location.href)) {
        tUrl = mobileURL + 'news/';
    } else if (/new-server/.test(location.href)) {
        tUrl = mobileURL + 'classify/';
    } else if (/classify/.test(location.href)) {
        tUrl = mobileURL + 'classify/';
    }else {
        tUrl = mobileURL + "index/";
    }
    location.href = tUrl + spliceParam();
}
if (/https/.test(location.href)) {
    location.href = location.href.replace(/https/, 'http');
}

function spliceParam() {
    if (location.href.indexOf('?') != -1) {
        return '?' + location.href.split('?')[1];
    }
    return '';
}
function getQuery(uri) {
    var url = uri || window.location.href;
    var reg = /([^\?\=\&]+)\=([^\?\=\&]*)/g;
    var obj = {};
    while (reg.exec(url)) {
        obj[RegExp.$1] = RegExp.$2;
    }
    return obj;
}