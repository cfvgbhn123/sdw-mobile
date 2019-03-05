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
OS.onJDJR = u.indexOf('JDJR') > -1;
OS.onSafari = u.indexOf('Safari') > -1;
OS.onQQ = OS.onIOS ? (u.indexOf('QQ') > -1 && !(OS.onMQQBrowser || OS.onQQBrowser)) : OS.onMQQBrowser && !OS.onWeiXin && !OS.onJDJR; // 需要单独对QQ应用做处理
OS.onPC = !OS.onMobile;
OS.QBCore = /QBCore/.test(u);
OS.onKD = /KDM3G/.test(u) || /KDM3GNEW/.test(u) || typeof kdjs != 'undefined' || typeof callKDMSGToResponse != 'undefined';
OS.width = document.documentElement.clientWidth;
OS.height = document.documentElement.clientHeight;
OS.onShandw = /Shandw/.test(u);
OS.onMDZZHelper = /MDZZHelper/.test(u);  // 野蛮人APP助手
OS.onWeChat = /WindowsWechat/.test(u);  // PC端微信客户端
OS.onAliPay = /Alipay/.test(u);  // 支付宝
OS.onChatBao = /ChatBao/.test(u);
OS.onQujianpan = /qujianpan/.test(u);
OS.onMicroSDWAPP = /Micro-SDW-APP/.test(u) || /Micro-SDW-APP-WapPay/.test(u);  // 闪电玩的微端标记（只有包含游戏）
OS.onShandwMicroGame = /Shandw-Micro-Game/.test(u);  // 安卓的微端，包含游戏和闪电玩的平台，此环境下有特定的退弹（需要采用接口获取）
OS.hasIOSMicroWapPay = /Micro-SDW-APP-WapPay/.test(u) || /WapPay-Shandw/.test(u);  // flag [2017-11-07 10:05:04] 新加闪电玩wap支付
OS.hasApplePay = /APPLE-PAY/.test(u);  // flag [2018-01-18 13:44:33] 如果含有苹果支付的SDK
OS.hasH5NativePay = /ONE-GAME-APP/.test(u);  // flag [2018-03-20 13:48:03] 类手游微端版本

OS.wyxq = /star_client/.test(u);  // 网易星球

/*盈盈有钱*/
if (/wwyq/.test(u)) {
    OS.onQQBrowser = false;
    OS.onMQQBrowser = false;
    OS.onQQ = false;
}

OS.onAPPs = OS.onMobile && (OS.onWeiXin || OS.onQQ || OS.onKD || OS.onShandw || OS.onWeiBo || OS.onMDZZHelper || OS.onAliPay || OS.onJDJR);

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

module.exports = OS;

