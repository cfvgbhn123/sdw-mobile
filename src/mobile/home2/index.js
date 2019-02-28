/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// document.addEventListener('touchmove', function (e) {
//     e.preventDefault();
// }, false);
require('../../components/initcss.scss');
require('./index.scss');
var fastLogin = require('../../components/mobile/login/login.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');
var gameCard = require('../../components/mobile/game-card/game-card.vue');
var homeView;

SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};

var navList = [{
    title: '我的消息',
    type: 'message',
    link: ''
}];

if (SDW_WEB.onShandw) {
    navList.push({
        title: '红包提现',
        type: 'gift',
        link: ''
    });
    navList.push({
        title: '话费领取',
        type: 'phone',
        link: ''
    });

} else {

    navList.push({
        title: '下载闪电玩APP',
        type: 'app',
        link: 'http://www.shandw.com/app/download/'
    });
}


var indexData = {
    initFlg: false,
    onShandw: SDW_WEB.onShandw,
    user: {
        avatar: SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png',
        uid: '-1',
        nick: '闪电玩用户',
        phone: '11111111111',
        gold: 0,
        sex: 1
    },
    navList: navList,
    recent: [],     // 我玩过的记录
    likeList: [],   // 我喜欢的游戏（3款）
    hotList: [],    // 热游推荐,
    morePage: SDW_PATH.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel,      // 我的历游界面
    gamePage: SDW_PATH.MOBILE_ROOT + 'thematic/?channel=' + SDW_WEB.channel,  // 专题页面
    mydataUrl: SDW_PATH.MOBILE_ROOT + 'mydata/?channel=' + SDW_WEB.channel,  // 专题页面
};

var indexMethods = {

    // 检查导航栏
    checkNavList: function (item) {

        if (item.type === 'message') {
            dialog.show('ok', '此功能暂未开放', 1);
            return;
        }
        this.goLink(item.link);
    },


    // 跳转到相应的页面处理
    goLink: function (link) {
        var openObj = {
            link: link,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        };
        SDW_WEB.openNewWindow(openObj);
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

                if (data.recent) {
                    self.recent = data.recent.slice(0, 5);
                }

                for (var i = 0; i < self.recent.length; i++) {
                    var item = self.recent[i];
                    // item.dateStr = self.transDate(item.time);
                }

                // 获取喜好

                if (data.likeList && data.likeList.length >= 3) {
                    self.likeList = data.likeList;
                } else if (data.recommand) {
                    self.hotList = data.recommand;
                }

                // 修改个人的信息
                var myInfo = data.info;
                self.user.avatar = myInfo.avatar || SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
                self.user.uid = myInfo.id;
                self.user.nick = myInfo.nick;
                self.user.phone = myInfo.phone || '';
                self.user.sex = myInfo.sex;
                self.user.gold = myInfo.gold || 0; // 金币

                self.initFlg = true;

                self.$nextTick(function () {
                    setTimeout(function () {
                        imgScroll.runCallback();
                    }, 200);

                });
            }
        });

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
        fastLogin: fastLogin,
        sdwFooter: sdwFooter,
        gameCard: gameCard,
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
