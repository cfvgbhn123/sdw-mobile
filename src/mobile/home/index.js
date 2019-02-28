/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// document.addEventListener('touchmove', function (e) {
//     e.preventDefault();
// }, false);

require('../../components/initcss.scss');

var _protocol_ = location.protocol;

var gameItem = require('../../components/mobile/game-item/game-item.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer-n.vue');
var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');
var taskGetAlert = require('../../components/mobile/task-get-alert/task-get-alert.vue');
var fastLogin = require('../../components/mobile/login/login.vue');
// var GAME_URL = require('../GAME_URL');

require('./index.scss');

// 放置
SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};

var indexData = {
    onSafari: !(SDW_WEB.onAPPs),
    onKD: SDW_WEB.onKD,
    onShandw: SDW_WEB.onShandw,
    bindPhoneItem: {},
    SCROLL_HEIGHT: document.documentElement.clientHeight,
    item: {
        name: '测试'
    },
    user: {
        avatar: SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png',
        uid: '',
        nick: '',
        phone: ''
    },
    gameList: []
};

var indexMethods = {

    gotoTaskPage: function () {
        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.switchTab('task');
        } else {
            // 跳转到页面
        }
    },

    gotoMySet: function () {
        var goUrlParam = {
            channel: SDW_WEB.channel
        };

        var Url = SDW_PATH.MOBILE_ROOT + 'myset/';
        var targetUrl = SDW_WEB.URLS.addParam(goUrlParam, false, Url);

        // 打开设置界面
        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: ''
        });
    },

    refreshUser: function () {

        if (SDW_WEB.onShandw) {
            // alert('ok');
            SDW_WEB.sdw.openLogin();
        }

    },

    clearAppCache: function () {

        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.clearAPPCache();
            dialog.show('ok', 'clear', 1)
        }
    },

    // 绑定成功后的回调
    bindPhoneCallback: function (data) {
        var self = this;
        dialog.hidden();
        self.$nextTick(function () {
            self.$refs.taskgetalert.showInfo = 1;
            self.user.phone = data.myPhoneStr;
        });
    },

    // 获取我的个人信息
    getMyData: function () {

        var self = this, sec = +new Date(),

            getUrl = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme,
                token: SDW_WEB.USER_INFO.token,
                type: 1,
                page: 0
            }, false, HTTP_STATIC + 'userinfo');

        SDW_WEB.getAjaxData(getUrl, function (data) {
            // =================================================================================================
            // 显示我玩过的游戏列表
            // =================================================================================================

            if (data.result == 1) {

                var recent = data.recent || [], myGameList = [], i;

                for (i = 0; i < recent.length; i++) {
                    var item = recent[i];
                    myGameList.push({
                        id: item.id,
                        cover: item.bIcon,
                        title: item.name,
                        time: item.time
                    })
                }
                // console.log(myGameList)
                self.gameList = myGameList;

                // 修改个人信息
                var myInfo = data.info;
                self.user.avatar = myInfo.avatar || SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
                self.user.uid = myInfo.id;
                self.user.nick = myInfo.nick;
                self.user.phone = myInfo.phone || '';
                self.user.sex = myInfo.sex;

                self.bindPhoneItem = data.phoneTask;

                self.$nextTick(function () {

                    setTimeout(function () {
                        imgScroll.runCallback();
                    }, 200);

                });
            }
        });

    },

    /**
     * 跳转到红包提现的界面
     */
    gotoCollect: function () {
        SDW_WEB.openNewWindow({
            title: '红包提现',
            // link: 'http://www.shandw.com/redPacket/?v=' + SDW_WEB.version,
            link: 'http://www.shandw.com/activities/exchange/getmoney.html?v=' + SDW_WEB.version,
            isFullScreen: false,
            showMoreBtn: true
        })
    },

    // 跳往赛事
    gotoSaishi: function () {

        SDW_WEB.openNewWindow({
            title: '',
            // link: 'http://www.shandw.com/activities/nationalFare/getfare.html',
            link: 'http://www.shandw.com/activities/exchange/getfare.html?v=' + SDW_WEB.version,
            isFullScreen: false,
            showMoreBtn: true
        })
    },

    gotoActivity: function () {
        SDW_WEB.openNewWindow({
            title: '',
            // link: 'http://www.shandw.com/activities/nationalFare/getfare.html',
            link: 'http://www.shandw.com/mi/shop2/?v=' + SDW_WEB.version,
            isFullScreen: false,
            showMoreBtn: true
        })
    },


    gotoActivity2: function () {
        SDW_WEB.openNewWindow({
            title: '',
            // link: 'http://www.shandw.com/activities/nationalFare/getfare.html',
            link: 'http://www.shandw.com/mi/task2/?v=' + SDW_WEB.version,
            isFullScreen: false,
            showMoreBtn: true
        })
    },


    logoutFn: function () {

        var self = this;
        dialog.show('loading', '正在登出...', 1);

        SDW_WEB.Store.clearItem(SDW_WEB.localItem, true);
        localStorage.removeItem(window.DATAITEM);
        sessionStorage.clear();

        SDW_WEB.USER_INFO = {};

        setTimeout(function () {
            dialog.hidden();
            self.$refs.login.show = 1;
        }, 320);


    },
    /**
     * 检查我的手机绑定情况
     */
    checkMyPhone: function () {

        if (this.user.phone) {
            // alert('您已经绑定了手机');
        } else {
            this.$refs.binPhone.showbind = 1;
        }
    },

    loginOkCallback: function () {

        // 加载初始的数据
        homeView.getMyData();
    },

    /**
     * 检查游戏的状态
     * @param type
     * @param id
     */
    checkGameSate: function (type, id, item) {

        var hasLogin = SDW_WEB.USER_INFO.uid;
        var targetUrl = SDW_PATH.GAME_URL(type, id);

        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        };

        if (type === 'play') {

            // flag [2017-11-01 16:58:19]
            if (item && item.screen) {
                openObj.landscape = true;
                targetUrl += '&screen=' + item.screen;
                openObj.link = targetUrl;
            }

            // 玩游戏
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
    }
};

var homeView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        gameItem: gameItem,
        sdwFooter: sdwFooter,
        bindPhone: bindPhone,
        taskGetAlert: taskGetAlert,
        fastLogin: fastLogin,
    }
});

var WindowScroll = require('../../libs/WindowScroll');

// 图片懒加载
var imgScroll = new WindowScroll(function () {
    loadImg(document.querySelectorAll('img[data-loaded="0"]'));
});

imgScroll.runCallback();

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

if (SDW_WEB.onShandw) {
    SDW_WEB.getSdwUserData().then(function () {
        homeView.getMyData();
    });

} else if (SDW_WEB.__needLogin__) {
    if (SDW_WEB.onAPPs) {

    } else {
        homeView.$nextTick(function () {
            this.$refs.login.show = '1';
        })
    }
} else {

    homeView.getMyData();
}
