/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 闪电玩首页
 *
 */
// var ScrollDom = require('./ScrollDom');
require('./index2.scss');
require('../../components/initcss.scss');
//var loadingView = require('../../components/mobile/loading/loading.vue');
// var longGameItem = require('./long-game-item/long-game-item.vue');
//var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var ActivityConfig = require('../libs/config');
// 首页活动悬浮按钮
if (ActivityConfig.state) {
    require('../game/tool-icon.scss');
    var DragTouch = require('../game/DragTouch');
}
if (ActivityConfig.dropType) {
    var DropAnimation = require('./libs/DropAnimation');
}
// 初始化活动小浮窗
function initToolIcon() {

    if (!ActivityConfig.state) return;
    /*新建一个拖动对象*/
    window.touch = new DragTouch({
        id: '#my-menu',
        position: '1,0.5',
        notRotate: true,
        width: 80,
        height: 90
    });
    window.touch.target.style.visibility = 'visible';


    var startPoint = null;
    var endPoint = null;

    function getPosition(e) {
        var touch = e.touches[0];
        return {
            x: touch.clientX,
            y: touch.clientY
        }
    }

    var myMenu = document.querySelector('#menu-btn');

    myMenu.addEventListener('touchstart', function (e) {
        startPoint = getPosition(e);
        startPoint.time = +new Date();
        endPoint = null;
    }, false);

    myMenu.addEventListener('touchmove', function (e) {
        endPoint = getPosition(e);
        endPoint.time = +new Date();
    }, false);

    myMenu.addEventListener('touchend', function (e) {
        endPoint = endPoint || startPoint;
        var dT = endPoint.time - startPoint.time;
        var dX = endPoint.x - startPoint.x;
        var dY = endPoint.y - startPoint.y;
        var dd = dX * dX + dY * dY;

        if (dT <= 300 && dd <= 36) {

            // 统计赛事按钮
            SDW_WEB.addCount('saishiIndex');

            // setTimeout(function () {
            //     location.href = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
            // }, 100);

            var links = ActivityConfig.activityPage+'?channel=' + SDW_WEB.channel;
            if(ActivityConfig.openState == 1){
                dialog.show('ok','敬请期待<br>新年活动将于2月2号开启哦~！',1);
                return ;
            }

            if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {
                // 跳转到活动页面
                SDW_WEB.openNewWindow({
                    link: links,
                    isFullScreen: false,
                    showMoreBtn: true,
                    // title: ActivityConfig.name
                });
            } else {
                // console.log('no login');

                // 调用登录界面
                if (SDW_WEB.onShandw) {
                    // 闪电玩登录
                    SDW_WEB.sdw.openLogin({
                        success: function () {
                        }
                    });
                } else {
                    // 普通短信登录
                    _indexView.__showLoginPage();
                }
            }

        }
    }, false);
}



var indexData = {

    gameList: [],
    showLogin:false,
    gameListFirst:[],
    gameListSecond:[],
    tempGame:null,
};


var indexMethods = {
    login:function () {
        this.showLogin = true ;
        this.createQ();

    },
    createQ: function() {
        var gid = SDW_WEB.URLS.queryUrl['gid'] || 1;
        var src = 'http://www.shandw.com/pc/auth/qAuth.html?channel=' + SDW_WEB.channel +
            '&unitid=' + SDW_WEB.guid +
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
        if(this.tempGame){
            this.checkGameSate('play',this.tempGame);
        }
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
    checkGameSate: function (type, gameInfo, item) {
        if(!SDW_WEB.USER_INFO.uid ){
            this.tempGame = gameInfo ;
            this.login();
            return ;
        }
        // 获取游戏地址
        var targetUrl = SDW_WEB.URLS.addParam({
            channel: '12212'||SDW_WEB.channel,
            gid:gameInfo.id,
            screen:gameInfo.screen
        },false,'http://www.shandw.com/geely/game/'+gameInfo.id+'.html');
        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: '',
        };

        if (type === 'play') {
            openObj = SDW_WEB._checkWebViewObject(openObj, item);
            // 打开玩游戏的界面
            SDW_WEB.openNewWindow(openObj);
        }
    },
    getGameInfo:function () {
        var self = this;
        var sec = new Date().getTime();

       var gameid = '1954719945_2021828808_1145326931_2022222024_1482185299' ;
        var postUri = SDW_WEB.URLS.addParam({
            sec:sec,
            sign:SDW_WEB.MD5(''+gameid+sec+'df84bdadbbf846a899e3237c0deb056b'),
            gameId:gameid,
        }, false, HTTP_STATIC + 'getGameInfoList');
        //var channel = '12212';
        // var postUri = SDW_WEB.URLS.addParam({
        //     sec:sec,
        //     sign:SDW_WEB.MD5(''+channel+sec+'df84bdadbbf846a899e3237c0deb056b'),
        //     channelId:channel,
        // }, false, HTTP_STATIC + 'getGameInfoList');
       // console.log(''+gameid+SDW_WEB.USER_INFO.secheme+'df84bdadbbf846a899e3237c0deb056b');
        SDW_WEB.getAjaxData(postUri, function (data) {
            if(data.result == 1) {
                if(data.list.length>=8){
                    var middle = Math.ceil(data.list.length/2);
                    data.list.forEach(function (item,i) {
                        if( i < middle ){
                            self.gameListFirst.push(item) ;
                        }else{
                            self.gameListSecond.push(item) ;
                        }
                    });
                    self.$nextTick(function () {
                        var lists = document.querySelectorAll('.game-container') ;
                        var width = middle-6 >=0 ? (112+(18*(middle-6)))+'%' :100+'%' ;
                        for(var i=0 ;i<lists.length;i++){
                            lists[i].style.width = width ;
                        }
                        //lists.style.width = 100+'%' ;
                    })
                }else{
                    self.gameListFirst = data.list;
                }

            }
        });
    },


};

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    mounted:function () {
        SDW_WEB.qrcode = new QRCode(document.querySelector('#ewm'), {
            width: 260,
            height: 260
        });

    },
    components: {
       // loadingView: loadingView,
       // longGameItem: longGameItem,
       // recentGame:recentGame
    }
});

SDW_WEB.getSdwUserData().then(function (userData) {
    _indexView.getGameInfo();
   // _indexView.loadMainData();
    //_indexView.getRecentList();
}, function (msg) {
    _indexView.getGameInfo();
    // 获取闪电玩用户数据失败
    SDW_WEB.USER_INFO = {};
   // _indexView.loadMainData();
    //_indexView.getRecentList();
});





