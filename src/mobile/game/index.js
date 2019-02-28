/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

require('./index.scss');

// require('postcss-write-svg').process('./pay.css', { /* options */ });

require('./tool-icon.scss');
require('./pay.css');

// require('./test.css');

window.toolWindow = require('./fuchuang.js');
require('./libs/swiper');
SDW_WEB.playGameTimer = require('./playTime');
SDW_WEB.setLoadText = require('./libs/setLoadText.js');
SDW_WEB.setLoadText.setText('default');




// 是否是全屏的标记
window._fullScreen = false;

var delTime = 4000; // 延迟初始化悬浮窗

// 悬浮窗初始化函数
var initToolFn = function (isMicroLogin) {

    // flag [2018-10-18 09:45:48] 没有任何悬浮窗
    if (SDW_WEB.readParam('sdw_tl')) return;

    setTimeout(function () {
        toolWindow.init(visitorMode.isVisitor, isMicroLogin);
    }, delTime);
};

// 只有安卓+游戏微端才有退弹
window.unloadStorageFlg = '_UNLOAD_FLG_';

// 根据不同的环境做不同的判断
if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    normalAuthFn();

} else if (SDW_WEB.onMicroSDWAPP) {

    // 首先需要判断是否有登录的信息
    var userInfo = SDW_WEB.Store.get(SDW_WEB.localItem, true);


    var postUserInfoFn = function () {
        SDW_WEB.sdw.postPltLoginInfo({
            accountId: '' + SDW_WEB.USER_INFO.uid
        });
    };

    // 微端的授权，采用游客的授权
    SDW_WEB.sdw.getMicroAPPInfo({

        success: function (res) {
            SDW_WEB.MICRO_REVIEW = res.review;
            SDW_WEB.channel = res.channel;
            SDW_WEB.guid = res.imei;
            visitorMode.isVisitor = false;

            // [2017-10-30 15:28] APP下发审核的地址
            SDW_WEB.MICRO_REVIEW_LINK = res.link || false;

            // flag [2018-03-07 11:36:48] 过审之后，不采用苹果支付，采用网页支付
            SDW_WEB.useweb = res.useweb;

            // alert('getMicroAPPInfo' + JSON.stringify(res) + '\n' + navigator.userAgent);

            if (userInfo) {

                // postUserInfo.accountId = '' + SDW_WEB.USER_INFO.uid;
                // SDW_WEB.sdw.postPltLoginInfo(postUserInfo);
                postUserInfoFn();
                userInfo.secheme = +new Date();
                userInfo.token = SDW_WEB.MD5('' + SDW_WEB.channel + userInfo.uid + userInfo.secheme + userInfo.otoken);
                userInfo.avatar = userInfo.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
                SDW_WEB.USER_INFO = userInfo;
                authGame();
                initToolFn(true);

            } else {

                // review字段是判断是否审核  1审核  0不审核  屏蔽小浮窗和支付（需要游戏做判断）
                // alert('channel:' + res.channel + '，imei:' + res.imei + '，review:' + res.review);
                // 微端-游客模式-但是需要用户信息
                visitorMode.authGame(function () {
                    // postUserInfo.accountId = '' + SDW_WEB.USER_INFO.uid;
                    // SDW_WEB.sdw.postPltLoginInfo(postUserInfo);
                    postUserInfoFn();

                    // 非审核状态，显示悬浮窗-暂且隐藏悬浮窗
                    if (!res.review) {
                        initToolFn();
                    }
                }, res.review);
            }
        }
    });
} else if (visitorMode.isVisitor) {
    // 游客模式授权
    visitorMode.authGame();
    initToolFn();
} else {
    normalAuthFn();
}

function normalAuthFn() {

    visitorMode.isVisitor = false;

    SDW_WEB.getSdwUserData().then(function () {

        window.unloadStorageFlg += SDW_WEB.USER_INFO.uid;

        setTimeout(function () {
            window.addUnloadPage();
        }, 100);
        // 授权成功后，开始游戏
        authGame();
        if (!SDW_WEB.hasH5NativePay)
            initToolFn();

    }, function () {

        SDW_WEB._refreshUserData();
    });

    (SDW_WEB.onShandw && !SDW_WEB.hasH5NativePay) && SDW_WEB.sdw.onShowToolBarItems(['addDesktop']);
}



