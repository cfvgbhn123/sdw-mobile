/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 搜索游戏的页面
 */

var fastLogin = require('../../components/mobile/login/login.vue');
var serverGameItem = require('../../components/mobile/server-game-item/server-game-item.vue');
var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var loadingView = require('../../components/mobile/loading/loading.vue');
var WindowScroll = require('../../libs/WindowScroll');

require('../../components/initcss.scss');
require('./index.scss');

var query = SDW_WEB.queryParam;


var indexData = {
    serverGameModuleList: [],
    isShowHotGame: query['_s_fl_'],
};

var TransServerDate = require('../game/libs/TransServerDate');


var indexMethods = {

    transServerDate: function (time, isPrv) {
        return TransServerDate(time, window.SERVER_TIME, isPrv);
    },


    // 加载游戏列表
    loadServerGame: function () {

        var self = this;

        // 0已经开服，1预计开服   isShowHotGame(已经开服)
        var getUri = HTTP_STATIC + 'serverinfo?type=' + self.isShowHotGame;

        SDW_WEB.getAjaxData(getUri, function (data) {

            window.PAGE_TIME = data.ct;
            window.SERVER_TIME = data.ct;

            if (data.result === 1) {

                var addType = 'serverGameModuleList';

                for (var i = 0; i < data.list.length; i++) {
                    var item = data.list[i];
                    item.serverDateStr = self.transServerDate(item.sTime, self.isShowHotGame !== '0');
                    item.serverDateStr && self[addType].push(item)
                }

            } else {

                dialog.show('error', data.msg, 1);
            }

        });

    },


    __showLoginPage: function (index) {
        // 普通短信登录
        this.$refs.login.show = '1';
        this.__footIndex__ = index;
    },

    // 检查是否可以玩游戏
    checkGameSate: function (type, id, item) {

        // 在闪电玩中，对于
        var hasLogin = SDW_WEB.USER_INFO.uid;
        var targetUrl = SDW_PATH.GAME_URL(type, id);

        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        };

        if (type === 'play') {

            // flag [2017-11-01 16:47:19]
            if (item && item.screen) {
                openObj.landscape = true;
                targetUrl += '&screen=' + item.screen;
                openObj.link = targetUrl;
            }

            if (hasLogin) {
                // 打开玩游戏的界面
                SDW_WEB.openNewWindow(openObj);

            } else if (SDW_WEB.onShandw) {

                // 闪电玩登录
                SDW_WEB.sdw.openLogin({
                    success: function () {
                    }
                });

            } else {

                // 普通短信登录
                this.__showLoginPage();
            }

        } else {

            // 打开游戏的详情，不需要登录*********
            SDW_WEB.openNewWindow(openObj);
        }
    },

};


var _searchView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        serverGameItem: serverGameItem,
        fastLogin: fastLogin,
        loadingView: loadingView
    }
});


if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {
        _searchView.loadServerGame();

    }, function (msg) {

        // 获取闪电玩用户数据失败
        SDW_WEB.USER_INFO = {};
        _searchView.loadServerGame();

    });

} else {
    _searchView.loadServerGame();
}

// window.onload = function () {
//     _searchView.loadServerGame();
// };

function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}


// 图片懒加载
var imgScroll = new WindowScroll(loadDelayImg);

function loadImg(arr) {

    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].getBoundingClientRect().top < document.documentElement.clientHeight && !arr[i].isLoad) {
            arr[i].isLoad = true;
            arr[i].dataset.loaded = '1';
            arr[i].style.cssText = "transition: ''; opacity: 0;";
            aftLoadImg(arr[i], arr[i].dataset.src);
        }
    }
}

function aftLoadImg(obj, url) {
    if (!url) return;
    var oImg = new Image();
    oImg.onload = function () {
        obj.src = oImg.src;
        obj.style.cssText = "transition: 1s; opacity: 1;";
        var parentNode = obj.parentNode;
        if (parentNode && parentNode.classList.contains('game-cover-info')) {

            parentNode.style.transition = '.4s';
            parentNode.style.background = 'rgba(0,0,0,0)';
        }
    };
    oImg.src = url;
}

