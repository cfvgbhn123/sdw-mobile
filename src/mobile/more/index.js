/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */


require('./index.scss');
require('../../components/initcss.scss');

var gameCard = require('../../components/mobile/game-card/game-card.vue');

var moreVm = new Vue({
    el: '#app',
    data: {
        initFlg: false,
        myGameList: [],
        page: 0,
        loading: false,
    },
    methods: {
        loadMyGameList: function () {

            if (this.loading) return;
            this.loading = true;

            var self = this;
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                type: 1,
                sec: SDW_WEB.USER_INFO.secheme,
                page: this.page,
            }, false, HTTP_STATIC + 'usergame');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result == 1) {

                    if (self.page === 0) {
                        allGameScroll.enable = true;
                    }

                    if (data.list && data.list.length) {
                        self.page++;
                        self.myGameList = self.myGameList.concat(data.list);
                    } else {
                        allGameScroll.enable = false;
                    }

                } else if (data.result === -3) {
                    SDW_WEB._refreshUserData();
                }

                self.$nextTick(function () {
                    loadImgFn();
                    self.initFlg = true;
                    setTimeout(function () {
                        self.loading = false;
                    }, 200);
                })

            });

        },

        checkGameState: function (type, item) {
            // 修改游戏地址
            var targetUrl = SDW_PATH.GAME_URL(type, item.id);

            var openObj = {
                link: targetUrl,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            };

            // flag [2017-11-01 16:59:27]
            // if (type === 'play' && item.screen) {
            //     openObj.landscape = true;
            //     targetUrl += '&screen=' + item.screen;
            //     openObj.link = targetUrl;
            // }
            openObj = SDW_WEB._checkWebViewObject(openObj, item);

            SDW_WEB.openNewWindow(openObj);
        },
    },
    components: {
        gameCard: gameCard
    }
});

function loadImgFn() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}

var WindowScroll = require('../../libs/WindowScroll');

// 图片懒加载
var imgScroll = new WindowScroll(loadImgFn);

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

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {
        moreVm.loadMyGameList();
    });

} else {
    moreVm.loadMyGameList();
}

loadImgFn();

var allGameScroll = new WindowScroll(function () {
    moreVm.loadMyGameList();
}, true, 200, 5);

allGameScroll.enable = false;