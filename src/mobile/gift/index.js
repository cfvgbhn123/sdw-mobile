/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// var gameItem = require('../../components/mobile/game-item/game-item.vue');
// var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');

var giftItem = require('../../components/mobile/gift-item/gift-item.vue');
var fastLogin = require('../../components/mobile/login/login.vue');
// var Clipboard = require('clipboard');

// var GAME_URl = require('../GAME_URL');
var clipboard, $giftBgContainer = document.querySelector('.gift-bg-container'),
    $gameCode = document.querySelector('.game-code'),
    $gotoGameBtn = document.querySelector('.goto-game-btn');

require('../../components/initcss.scss');
require('./index.scss');
var _gid = 0;
var indexData = {
    giftPage: 0,
    isLoad: false,
    currentGame: 0,  // 点击到当前的游戏
    currentGame_screen: 0,
    showGift: 0,
    giftCode: '',
    giftLists: [],
    gamesMap: {},
    giftsMap: {}
};
var giftView = new Vue({
    el: '#app',
    data: indexData,
    methods: {

        // 所有游戏信息的映射表
        createGameMap: function (list) {
            list = list || [];
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (!indexData.gamesMap[item.id]) {
                    item._mygid = _gid++;
                    indexData.gamesMap[item.id] = item;
                }
            }
        },

        // 游戏礼包的映射列表
        createGiftMap: function (gift) {

            gift = gift || [];

            for (var i = 0; i < gift.length; i++) {

                var item = gift[i];

                if (!indexData.giftsMap[item.gid]) {
                    indexData.giftsMap[item.gid] = [];
                }

                item._hasGet = 0;
                indexData.giftsMap[item.gid].push(item);
            }
        },

        loadGiftsList: function () {

            var self = this;

            if (self.isLoad) return;
            self.isLoad = true;

            var postUri = SDW_WEB.URLS.addParam({
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
                page: self.giftPage,
            }, false, HTTP_STATIC + 'gift');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result === 1 && data.gift && data.gift.length) {

                    self.createGameMap(data.game);
                    self.createGiftMap(data.gift);

                    var newList = [];


                    /*根据游戏映射表来生成新的礼包数据*/
                    for (var i in indexData.gamesMap) {
                        var sItem = {};
                        sItem.id = i;
                        sItem._mygid = indexData.gamesMap[i]._mygid;
                        sItem.icon = indexData.gamesMap[i].icon;
                        sItem.name = indexData.gamesMap[i].name;
                        sItem.sub = indexData.gamesMap[i].sub;
                        sItem.list = indexData.giftsMap[i];
                        newList.push(sItem);
                    }

                    newList = newList.sort(function (v1, v2) {
                        return v1._mygid - v2._mygid;
                    });

                    indexData.giftLists = newList;

                    self.$nextTick(function () {

                        if (self.giftPage === 0) {
                            initBtnCode();
                        }

                        self.giftPage++;

                        setTimeout(function () {
                            self.isLoad = false;
                        }, 300);


                        setTimeout(function () {
                            loadDelayImg();
                        }, 200)

                    });

                }

            })
        },

        // 计算剩余的数量
        computedQuantity: function (item) {
            return item.num / item.count * 100 >> 0
        },

        showCurrentCode: function () {

            if (SDW_WEB.onShandw) {

                SDW_WEB.sdw.setClipboard(this.giftCode);
                dialog.show('ok', '复制成功，快快去游戏中领取吧', 1);

            } else {

                // prompt('游戏礼包', 'lkijn');
            }

        },

        setCopyContext: function (text) {
            setCopyBtnText(text);
            setGiftContainerView('block');

            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.setClipboard(text);
                dialog.show('ok', '礼包码已经复制到剪切板，快去玩游戏吧', 1);
            } else {
                dialog.hidden();
            }

        },


        // 检查领取的
        checkGiftState: function (item) {

            var self = this;

            if (!SDW_WEB.USER_INFO.uid) {
                if (SDW_WEB.onShandw) {

                    SDW_WEB.sdw.openLogin({
                        success: function () {

                        }
                    })

                } else {
                    this.$refs.login.show = 1;
                }

                return;
            }

            self.currentGame = item.gid;
            self.currentGame_screen = item.screen;

            if (item._hasGet) {

                this.showGift = 1;
                this.giftCode = item.code;
                this.setCopyContext(item.code);

            } else {
                // 请求领取礼包的接口

                dialog.show('loading', '礼包领取中');

                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    token: SDW_WEB.USER_INFO.token,
                    sec: SDW_WEB.USER_INFO.secheme,
                    uid: SDW_WEB.USER_INFO.uid,
                    gid: item.gid,
                    id: item.id
                }, false, HTTP_STATIC + 'getgift');


                SDW_WEB.getAjaxData(postUri, function (data) {

                    if (data.result == 1) {

                        item._hasGet = 1;
                        self.showGift = 1;
                        item.code = data.code;
                        self.giftCode = data.code;
                        self.setCopyContext(data.code);

                    } else {

                        dialog.show('error', data.msg, 1);
                    }
                });
            }
        },


        // 点击到游戏
        checkGameSate: function (id) {

            var hasLogin = SDW_WEB.USER_INFO.uid;
            var targetUrl = SDW_PATH.GAME_URL('play', id || this.currentGame);

            // 玩游戏
            if (hasLogin) {

                // flag [2017-11-01 16:53:54]
                var openObj = {
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ' '
                };


                // if (this.currentGame_screen) {
                //     openObj.landscape = true;
                //     targetUrl += '&screen=' + item.screen;
                //     openObj.link = targetUrl;
                // }

                openObj = SDW_WEB._checkWebViewObject(openObj, {screen: this.currentGame_screen || 0});

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
                this.$refs.login.show = 1;
            }
        },
    },

    components: {
        giftItem: giftItem,
        fastLogin: fastLogin
    }
});


function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}

var WindowScroll = require('../../libs/WindowScroll');

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


if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {
        giftView.loadGiftsList();
    }, function () {
        giftView.loadGiftsList();
    });

} else {
    giftView.loadGiftsList();
}

// 加载更多的数据
var giftScroll = new WindowScroll(function () {
    giftView.loadGiftsList();
}, true, 200, 100);

// 初始化点击的
function initBtnCode() {
    // 初始化
    clipboard = new Clipboard('.game-code');

    clipboard.on('success', function (e) {
        dialog.show('ok', '礼包码已经复制到剪切板，快去玩游戏吧', 1);
    });

    clipboard.on('error', function (e) {
        dialog.show('error', '请长按礼包码进行复制', 1);
    });

    // 去游戏
    $gotoGameBtn.onclick = function () {
        giftView.checkGameSate();
    };

    // 隐藏主界面
    $giftBgContainer.onclick = function (e) {

        var target = e.target;
        if (target.className === 'gift-bg-container') {
            setGiftContainerView('none');
        }
    }
}

function setCopyBtnText(text) {
    $gameCode.dataset.clipboardText = text;
    $gameCode.innerText = text;
}

function setGiftContainerView(show) {
    $giftBgContainer.style.display = show;
}




