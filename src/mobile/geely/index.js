/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

require('./index.scss');

// require('postcss-write-svg').process('./pay.css', { /* options */ });

require('./tool-icon.scss');
require('./pay.css');

// require('./test.css');

// window.toolWindow = require('./fuchuang.js');
// require('./libs/swiper');
window.loadPageTime = +new Date();
SDW_WEB.playGameTimer = require('./playTime');
SDW_WEB.setLoadText = require('./libs/setLoadText.js');
SDW_WEB.setLoadText.setText('default');
var DragTouch = require('./DragTouch');
console.log('------'+SDW_WEB.MOBILE_GAME_GID);
var landscape = SDW_WEB.queryParam['screen'] == '1' || SDW_WEB.queryParam['screen'] == '3';  // 是否是横屏游戏
var indexData = {
    landscape: landscape,   // 是否是横屏游戏
    gameName: '',
    gid:SDW_WEB.MOBILE_GAME_GID,
    fullscreen: false,
    showLogin:false,
    showfocus:false,
};
var methods = {
    init:function () {
        // 悬浮按钮事件-显示小弹窗
        // 初始化小浮窗的图标
        var myMenuBtn = document.querySelector('#my-menu');
        myMenuBtn.style.visibility = 'visible';
        window.touch = new DragTouch({
            id: '#my-menu',
            position: '0.97,0.2',
            // width:'8%',
            // height:'18%',
        });
        var self = this ;
        $('#menu-btn').tap(function (e) {
            e.stopPropagation();
            // flag [2018-01-05 13:44:42] 添加统计--

            // console.log('tool');

            //SDW_WEB.addCount('tool');
            SDW_WEB.onIOS && $('#my-game-container').addClass('my-game-container-ani');

            window.touch.hiddenState();  // 隐藏起来

            window.touch.clearTimer();
            myMenuBtn.style.opacity = '0';
            self.showfocus = true ;
            // if (!window.touch.firstTap) {
            //     window.touch.firstTap = true;
            //     indexData.navsTap[navConfigs[0]] = 1;
            //     //toolWindow.initLoadData();
            //     //_myFuchuang.getIdInfo();
            // }

            // setTimeout(function () {
            //     _myFuchuang.fchiddenFn(0);
            // }, 20)

        });

        var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
        var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
        if(landscape){
            $('#g-container').css({
                height: HEIGHT + 'px',
                width:WIDTH+'px'
            });
        }else{
            $('#g-container').css({
                height: HEIGHT + 'px',
                width:HEIGHT*0.6+'px'
            });
        }
    },
    closeMask:function () {
        this.showfocus = false ;
        window.touch.hiddenState();  // 隐藏起来
    },
    // 切换账号
    refreshUser: function () {
        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.logout();
        } else {
            this.loginFlagV2 = 1;
        }
    },
    /*二维码登录*/
    login:function () {
        this.showLogin = true ;
        this.createQ();
    },
    createQ: function() {
        var gid = SDW_WEB.URLS.queryUrl['gid'] || 1;
        var src = 'http://www.shandw.com/pc/auth/qAuth.html?channel=' + SDW_WEB.channel +
            '&unitid=' + SDW_WEB.guid +
            // '&unitid=' +'df1cbe3efd7486d280306abe62cccda1' +
            '&gid=' + gid +
            '&os=' + SDW_WEB.os +
            '&w=' + SDW_WEB.width +
            '&h=' + SDW_WEB.height +
            '&m=' + (+new Date());
        SDW_WEB.qrcode.clear();
        SDW_WEB.qrcode.makeCode(src);
        this.qLoginData();
        //显示二维码
        // if (this.$refs.tabs.childNodes[0].className.indexOf('subs select') > -1) {
        //     // this.isQrcode = true;
        // }
        // this.$refs.reQ.style.display = 'none';
    },
    loginSuccessFn: function(data) {
        this.showLogin = false ;
        var usrInfo = {
            avatar: data.avatar,
            fl: data.fl,
            nick: data.nick,
            otoken: data.token,
            sex: data.sex,
            uid: data.id,
            day: data.day,
            month: data.month,
            result: data.result,
            secheme: +new Date(),
            year: data.year
        }
        usrInfo.token = SDW_WEB.MD5('' + SDW_WEB.channel + usrInfo.uid + usrInfo.secheme + usrInfo.otoken)
        SDW_WEB.USER_INFO = usrInfo;
        //登录信息
        var USER_DATA = {
            nick: usrInfo.nick || usrInfo.uid,
            avatar: usrInfo.avatar
        };
        // CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
        SDW_WEB.Store.set(SDW_WEB.localItem, usrInfo, true);
        SDW_WEB.checkUserInfo(true);
        authGame();
        // //获取用户游戏信息
        // SDW_WEB.getMyData({
        //     channel: SDW_WEB.channel,
        //     uid: usrInfo.uid,
        //     sec: usrInfo.secheme,
        //     token: usrInfo.token,
        //     type: 1,
        //     flag: 1
        // }, 'pltmain', function(data) {
        //     // 获取我最近玩过的
        //     _indexView.myGameListData = data.recent.splice(0, 4);
        // });
        // //打开游戏授权后直接登录
        // APP.loginCallback&&APP.loginCallback();
    },
    qLoginData: function() {
        var self = this;
        // 等待扫描中...
        var t = +new Date() / 1000 >> 0;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            unitid: SDW_WEB.guid,
            token: SDW_WEB.MD5(SDW_WEB.guid + t + 'b30e0224d659cfac' + SDW_WEB.guid + SDW_WEB.channel),
            t: t,
        }, false, HTTP_USER_STATIC + 'pcauthget');
        // 等待服务端的验证；
        SDW_WEB.getAjaxData(postUri, function(data) {
            if(data.result === 1) {
                self.loginSuccessFn(data);
            }
        })
    },


};

var controller =  new Vue({
    el: '#app',
    data: indexData,
    methods: methods,
    // mounted:function () {
    //     console.log(visitorMode);
    //
    // }
});

if (visitorMode.isVisitor) {
    SDW_WEB.qrcode = new QRCode(document.querySelector('#ewm'), {
        width: 260,
        height: 260
    });
    controller.login();
    // 游客模式授权
    //visitorMode.authGame();
    // initToolFn();
} else {
    normalAuthFn();
}
controller.init();
// 是否是全屏的标记
window._fullScreen = false;

var delTime = 4000; // 延迟初始化悬浮窗

// 悬浮窗初始化函数
// var initToolFn = function (isMicroLogin) {
//     return;
//     // flag [2018-10-18 09:45:48] 没有任何悬浮窗
//     if (SDW_WEB.readParam('sdw_tl')) return;
//     setTimeout(function () {
//         toolWindow.init(visitorMode.isVisitor, isMicroLogin);
//     }, delTime);
// };
//

// 根据不同的环境做不同的判断
// if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper) {
//
//     // 获取闪电玩的用户信息，成功后进行数据加载
//     normalAuthFn();
//
// } else if (SDW_WEB.onMicroSDWAPP) {
//
//     // 首先需要判断是否有登录的信息
//     var userInfo = SDW_WEB.Store.get(SDW_WEB.localItem, true);
//
//     var postUserInfoFn = function () {
//         SDW_WEB.sdw.postPltLoginInfo({
//             accountId: '' + SDW_WEB.USER_INFO.uid
//         });
//     };
//
//     // 微端的授权，采用游客的授权
//     SDW_WEB.sdw.getMicroAPPInfo({
//
//         success: function (res) {
//             SDW_WEB.MICRO_REVIEW = res.review;
//             SDW_WEB.channel = res.channel;
//             SDW_WEB.guid = res.imei;
//             visitorMode.isVisitor = false;
//
//             // [2017-10-30 15:28] APP下发审核的地址
//             SDW_WEB.MICRO_REVIEW_LINK = res.link || false;
//
//             // flag [2018-03-07 11:36:48] 过审之后，不采用苹果支付，采用网页支付
//             SDW_WEB.useweb = res.useweb;
//
//             // alert('getMicroAPPInfo' + JSON.stringify(res) + '\n' + navigator.userAgent);
//
//             if (userInfo) {
//                 // postUserInfo.accountId = '' + SDW_WEB.USER_INFO.uid;
//                 // SDW_WEB.sdw.postPltLoginInfo(postUserInfo);
//                 postUserInfoFn();
//                 userInfo.secheme = +new Date();
//                 userInfo.token = SDW_WEB.MD5('' + SDW_WEB.channel + userInfo.uid + userInfo.secheme + userInfo.otoken);
//                 userInfo.avatar = userInfo.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
//                 SDW_WEB.USER_INFO = userInfo;
//                 authGame();
//                // initToolFn(true);
//
//             } else {
//
//                 // review字段是判断是否审核  1审核  0不审核  屏蔽小浮窗和支付（需要游戏做判断）
//                 // alert('channel:' + res.channel + '，imei:' + res.imei + '，review:' + res.review);
//                 // 微端-游客模式-但是需要用户信息
//                 visitorMode.authGame(function () {
//                     // postUserInfo.accountId = '' + SDW_WEB.USER_INFO.uid;
//                     // SDW_WEB.sdw.postPltLoginInfo(postUserInfo);
//                     postUserInfoFn();
//
//                     // 非审核状态，显示悬浮窗-暂且隐藏悬浮窗
//                     if (!res.review) {
//                         initToolFn();
//                     }
//
//                 }, res.review);
//             }
//         }
//     });
// } else if (visitorMode.isVisitor) {
//
//     // 游客模式授权
//     //visitorMode.authGame();
//    // initToolFn();
// } else {
//     normalAuthFn();
// }

function normalAuthFn() {

    visitorMode.isVisitor = false;

    SDW_WEB.getSdwUserData().then(function () {

        window.unloadStorageFlg += SDW_WEB.USER_INFO.uid;

        // setTimeout(function () {
        //     window.addUnloadPage();
        // }, 100);
        // 授权成功后，开始游戏
        authGame();
       // if (!SDW_WEB.hasH5NativePay)
            //initToolFn();

    },function () {
        SDW_WEB._refreshUserData();
    });

    (SDW_WEB.onShandw && !SDW_WEB.hasH5NativePay) && SDW_WEB.sdw.onShowToolBarItems(['addDesktop']);
}

setTimeout(function () {
    document.body.style.display = 'block';
}, 20);





