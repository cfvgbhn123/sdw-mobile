/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 搜索游戏的页面
 */

var fastLogin = require('../../components/mobile/login/login.vue');
// var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var WindowScroll = require('../../libs/WindowScroll');

require('../../components/initcss.scss');
require('./index.scss');
// var GAME_URL = require('../GAME_URL');

var indexData = {
    initInfo: {
        bg: '',
        info: ''
    },
    page: 0,
    loading: false,
    thematicGameList: [],
};

var indexMethods = {

    // 加载游戏列表
    loadThematicGame: function (mustLoad) {
        if (this.loading) return;
        var self = this;
        var searchUri = SDW_WEB.URLS.addParam({
            id: SDW_WEB.queryParam['tid'],
            page: this.page++
        }, true, HTTP_STATIC + 'thematic');
        this.loading = true;
        SDW_WEB.getAjaxData(searchUri, function (data) {
            if (data.result === 1) {
                // 修整专题的标题名称
                document.title = data.info.name;
                self.initInfo.bg = data.info.bg;
                self.initInfo.info = data.info.info;
                var dInfo = data.info;

                if (dInfo.sTitle) {
                    SDW_WEB.sdw.onSetShareOperate({
                        title: dInfo.sTitle,
                        desc: dInfo.sSub,
                        imgUrl: dInfo.sIcon,
                        link: checkShareLink()
                    });
                }
                // 添加对应的游戏列表
                var gList = data.ctList || [];
                for (var i = 0; i < gList.length; i++) {
                    gList[i].vStar = self.starLists(gList[i].vStar);
                }
                self.thematicGameList = self.thematicGameList.concat(gList);
                self.$nextTick(function () {
                    if (gList.length)
                        self.loading = false;
                })
            } else {
                dialog.show('error', data.msg, 1);
            }
        })
    },

    /**
     * 计算星星的数量
     * @param oStar
     * @returns {Array}
     */
    starLists: function (oStar) {

        // 星级数量为 0~10 的整型
        var star = Math.max(0, oStar >> 0);
        star = Math.min(10, star);

        var stars = [], pStar = star / 2 >> 0, lStar = star % 2, i;

        // 添加满星个数
        for (i = 0; i < pStar; i++) stars.push('star2');

        // 修正单颗星
        if (lStar == 1) {
            stars.push('star1');
            pStar++;
        }

        // 填补剩余的星
        for (i = pStar; i < 5; i++) stars.push('star0');

        return stars;
    },

    // 检查是否可以玩游戏
    checkGameSate: function (type, item) {

        var hasLogin = SDW_WEB.USER_INFO.uid;

        // 优先采用配置的地址
        var targetUrl = item.link || SDW_PATH.GAME_URL(type, item.appid);

        // flag [2017-11-01 17:02:05]
        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        };

        if (type === 'play') {

            // 玩游戏
            if (hasLogin) {

                // if (item && item.screen) {
                //     openObj.landscape = true;
                //     targetUrl += '&screen=' + item.screen;
                //     openObj.link = targetUrl;
                // }

                openObj = SDW_WEB._checkWebViewObject(openObj, item);

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
        // longGameItem: longGameItem,
        fastLogin: fastLogin
    }
});


if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {

        _searchView.loadThematicGame();

    }, function (msg) {

        // 获取闪电玩用户数据失败
        SDW_WEB.USER_INFO = {};
        _searchView.loadThematicGame();

    });

} else {
    _searchView.loadThematicGame();
}


function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}


// 加载更多

var allGameScroll = new WindowScroll(function () {
    _searchView.loadThematicGame();
}, true, 200, 5);

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

function checkShareLink() {
    var cLink = location.href;
    if (/sSdw/.test(cLink)) {
        return cLink;
    }
    return cLink + '&sSdw=1';
}


(function () {

    var shareConfig = {
        "9": 'http://dhurl.cn/BBBbu2',
        "10": 'http://dhurl.cn/3iIBZj',
        "11": 'http://dhurl.cn/NnUfua',
        "12": 'http://dhurl.cn/Qr6NRz',
        "13": 'http://dhurl.cn/FRNRfm',
        "14": 'http://dhurl.cn/yuEvYr',
        "15": 'http://dhurl.cn/BZJf2y',
        "16": 'http://dhurl.cn/QVjy2y',
        "17": 'http://dhurl.cn/yIbUvu',
        "19": 'http://dhurl.cn/y6JzIf',
        "20": 'http://dhurl.cn/aYJZfy',
        "49": 'http://dhurl.cn/buQBBv',
        '50': 'http://dhurl.cn/bu6b6f',
        '51': 'http://dhurl.cn/bUrqaa',
        '52': 'http://dhurl.cn/AbYFVj',
        '53': 'http://dhurl.cn/umUfUj',
        '54': 'http://dhurl.cn/ieEnMv',
        '55': 'http://dhurl.cn/Ij2imy',
        '56': 'http://dhurl.cn/yUZRRz',
        '57': 'http://dhurl.cn/yyeMre',
    };

    // 页面统计，来自分享的页面
    if (SDW_WEB.queryParam['sSdw'] === '1' && shareConfig[SDW_WEB.queryParam['tid']]) {
        var ifm = document.createElement('iframe');
        ifm.style.display = 'none';
        ifm.src = shareConfig[SDW_WEB.queryParam['tid']];
        document.body.appendChild(ifm);
    }

})();
