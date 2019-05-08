/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 闪电玩首页
 *
 */

require('./index2.scss');
require('../../components/initcss.scss');
var loadingView = require('../../components/mobile/loading/loading.vue');
var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var recentGame = require('./recent-game/recent-game.vue');
// var ActivityConfig = require('./config');
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
                dialog.show('ok','敬请期待<br>'+ActivityConfig.activityName+'活动将于'+ActivityConfig.startTime[1]+'月'+ActivityConfig.startTime[2]+'号开启哦~！',1);
                //dialog.show('ok','敬请期待<br>新年活动将于2月2号开启哦~！',1);
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
    activity:ActivityConfig,
    allGameList: [],
    bannerList:[],
    recentList:[],
};



var indexMethods = {

    getTopicList:function (type) {
        var t = this ;
        var postUri = SDW_WEB.URLS.addParam({
            uid:SDW_WEB.USER_INFO.uid,
            sec:SDW_WEB.USER_INFO.secheme,
            token:SDW_WEB.USER_INFO.token,
            channel:SDW_WEB.channel,
            type:0,
        }, false, 'https://platform.shandw.com/topiclist');
        SDW_WEB.getAjaxData(postUri,function (res) {
            if( res.result == 1 ){
                t.bannerList = res.adList ;
            }else{
                dialog.show('error','服务器开小差了~',1);
            }
        });
    },

    getRecentList:function () {
        var t = this ;
        var postUri = SDW_WEB.URLS.addParam({
            uid:SDW_WEB.USER_INFO.uid,
            sec:SDW_WEB.USER_INFO.secheme,
            token:SDW_WEB.USER_INFO.token,
            channel:SDW_WEB.channel,
            type:1,
        }, false, 'https://platform.shandw.com/pltmain');
        SDW_WEB.getAjaxData(postUri,function (res) {
            if( res.result == 1 ){
                t.recentList = res.recent.splice(0, 4);
                console.log(t.recentList);
            }else{
                dialog.show('error','服务器开小差了~',1);
            }
        });
    },
    checkGameSate: function (type, url, item) {
        id = url.split('.htm')[0].replace(/[^0-9]/ig,"");
        // 获取游戏地址
        if (SDW_WEB.channel == '10911') {
            var targetUrl = 'http://www.shandw.com/maopao/game/index.html?gid=' + id + '&channel=10911'
        } else {
            var targetUrl = SDW_PATH.GAME_URL(type, id);
        }

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
    openMore:function () {
        var targetUrl = SDW_PATH.MOBILE_ROOT + 'indexTemp/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: ''
        });
    },
};

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        recentGame: recentGame,
    }
});

SDW_WEB.getSdwUserData().then(function (userData) {
    _indexView.getTopicList() ;
    _indexView.getRecentList() ;
    initToolIcon();
   // _indexView.loadMainData();
   // _indexView.switchNav(indexData.navList[0]);
}, function (msg) {
    // 获取闪电玩用户数据失败
    SDW_WEB.USER_INFO = {};
    _indexView.getTopicList() ;
    _indexView.getRecentList() ;
    initToolIcon();
    //_indexView.loadMainData();
    //_indexView.switchNav(indexData.navList[0]);
});








