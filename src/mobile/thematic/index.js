/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 搜索游戏的页面
 */

// var fastLogin = require('../../components/mobile/login/login.vue');
// var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var WindowScroll = require('../../libs/WindowScroll');

require('../../components/initcss.scss');
require('./index.scss');
// var GAME_URL = require('../GAME_URL');

var indexData = {
    loaded: false,
    page: 0,
    thematicList: []
};

var indexMethods = {

    // 加载游戏列表
    loadSearchGame: function () {

        var self = this;

        if (self.loaded) return;

        self.loaded = true;
        dialog.show('loading', '玩命加载...');

        var searchUri = SDW_WEB.URLS.addParam({
            page: self.page
        }, true, HTTP_STATIC + 'thematic');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                if (data.list && data.list.length === 0) {
                    self.loaded = true;
                } else {
                    self.loaded = false;
                }

                self.thematicList = data.list;

                self.$nextTick(function () {

                    self.page++;
                    dialog.hidden();
                })

            } else {
                dialog.show('error', data.msg, 1);
            }

        })
    },

    /**
     * 跳转到具体的专题详情
     * @param item
     */
    gotoThematic: function (item) {

        var goUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            tid: item.id
        }, false, SDW_PATH.MOBILE_ROOT + 'thematic/start.html');
        SDW_WEB.openNewWindow({
            link: goUri,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        });
    }

};


var _searchView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        // longGameItem: longGameItem,
        // fastLogin: fastLogin
    }
});


window.onload = function () {

    // 加载列表
    _searchView.loadSearchGame();
};


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

