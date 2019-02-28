/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// var gameItem = require('../../components/mobile/game-item/game-item.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');
var loadingView = require('../../components/mobile/loading/loading.vue');

require('./index.scss');
require('../../components/initcss.scss');

// var GAME_URL = require('../GAME_URL');

function starLists(oStar) {

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
}

var indexData = {

    onShandw: SDW_WEB.onShandw,
    pageHasLoading: false,
    rankNavType: 3,

    activeRankTops: [
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        },
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        },
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        }
    ],
    richRankTops: [
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        },
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        },
        {
            avatar: '',
            nick: '虚位以待',
            scole: 0
        }
    ],
    hotRankTops: [
        {
            id: '',
            cover: '',
            title: '虚位以待',
            starLists: starLists(0),
            quantity: '',
            desc: '',
            time: ''
        },
        {
            id: '',
            cover: '',
            title: '虚位以待',
            starLists: starLists(0),
            quantity: '',
            desc: '',
            time: ''
        },
        {
            id: '',
            cover: '',
            title: '虚位以待',
            starLists: starLists(0),
            quantity: '',
            desc: '',
            time: ''
        }
    ],
    hotRankList: [],
    activeRankList: [],
    richRankList: [],
    hotRanks: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    activeRanks: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    richRanks: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    }
};

var indexMethods = {

    checkPlayState: function (item) {

        var hasLogin = SDW_WEB.USER_INFO.uid;
        var targetUrl = SDW_PATH.GAME_URL('play', item.id);

        // 玩游戏
        if (hasLogin) {

            // 打开玩游戏的界面
            SDW_WEB.openNewWindow({
                link: targetUrl,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

        } else if (SDW_WEB.onShandw) {

            // 闪电玩登录
            SDW_WEB.sdw.openLogin({
                success: function () {
                    // 获取成功，重新刷新用户的信息
                    SDW_WEB.getSdwUserData().then(function (userData) {

                        alert(JSON.stringify(SDW_WEB.USER_INFO));
                        // _indexView.loadMainData();
                    });
                }
            });

        } else {

            // 普通短信登录
            this.__showLoginPage();
        }

    },


    /**
     * 转换人数显示
     * @param num
     */
    transformQuantity: SDW_WEB.transformQuantity,

    checkUserNick: function (user) {

        var nick = user.nick || '';

        nick = nick.replace(/\s/gi, '');

        if (nick == '') {
            return user.id;
        }

        return nick;

    },
    // 变更排行榜
    changeRankListState: function (type) {

        if (this.pageHasLoading) return;

        this.rankNavType = type;

        hotRankScroll.enable = (type == 1);
        activeRankScroll.enable = (type == 2);
        richRankScroll.enable = (type == 3);

        if (type == 1 && this.hotRanks.page == 0) {
            this.hotRankScroll();
        }

        if (type == 2 && this.activeRanks.page == 0) {
            this.activeRankScroll();
        }
        if (type == 3 && this.richRanks.page == 0) {
            this.richRankScroll();
        }

    },
    slotAjax: function (_rankType, _listType, type, complete) {

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            type: type,
            page: _rankType.page,
        }, false, HTTP_STATIC + 'ranking');

        this.pageHasLoading = true;

        SDW_WEB.getAjaxData(postUri, function (data) {

            self.pageHasLoading = false;

            if (data.result == 1) {

                data.list = data.list || [];
                complete(data);
            }

            self.$nextTick(function () {
                loadDelayImg();
                setTimeout(function () {
                    _rankType.isLoad = false;
                }, 300);
            })
        });

    },
    hotRankScroll: function () {

        var _rankType = this.hotRanks, _listType = this.hotRankList;

        if (_rankType.isLoad || !_rankType.hasMoreData) return;
        _rankType.isLoad = true;

        // 通过slotAjax创建同一的请求链接
        this.slotAjax(_rankType, _listType, 1, function (data) {


            if (data.list.length == 0) {
                _rankType.hasMoreData = false;
                return;
            }

            var gameList = data.list, index = 0;
            var _hotList = [];

            // 首次加载筛选数据
            if (_rankType.page == 0) {

                var maxLen = Math.min(3, gameList.length);
                index = maxLen;

                for (var i = 0; i < maxLen; i++) {
                    var item = gameList[i];
                    _rankView.hotRankTops[i] = {
                        id: item.id,
                        cover: item.icon,
                        title: item.name,
                        starLists: starLists(item.vStar),
                        quantity: item.vPv,
                        desc: item.sub
                    };
                }
            }

            for (var i = index; i < gameList.length; i++) {
                var item = gameList[i];
                _hotList.push({
                    id: item.id,
                    cover: item.icon,
                    title: item.name,
                    starLists: starLists(item.vStar),
                    quantity: item.vPv,
                    desc: item.sub
                });
            }

            _listType = _listType.concat(_hotList);

            _rankType.page++;

            _rankView.hotRankList = _listType;

        });

    },
    richRankScroll: function () {

        var _rankType = this.richRanks, _listType = this.richRankList;

        if (_rankType.isLoad || !_rankType.hasMoreData) return;
        _rankType.isLoad = true;

        // 通过slotAjax创建同一的请求链接
        this.slotAjax(_rankType, _listType, 4, function (data) {


            if (data.list.length == 0) {
                _rankType.hasMoreData = false;
                return;
            }

            var gameList = data.list, index = 0;
            var _hotList = [];

            // 首次加载筛选数据
            if (_rankType.page == 0) {

                var maxLen = Math.min(3, gameList.length);
                index = maxLen;

                for (var i = 0; i < maxLen; i++) {
                    _rankView.richRankTops[i] = gameList[i];
                }
            }

            for (var i = index; i < gameList.length; i++) {
                var item = gameList[i];
                _hotList.push(item);
            }


            _listType = _listType.concat(_hotList);

            _rankType.page++;

            _rankView.richRankList = _listType;
        });

    },
    activeRankScroll: function () {

        var _rankType = this.activeRanks, _listType = this.activeRankList;

        if (_rankType.isLoad || !_rankType.hasMoreData) return;
        _rankType.isLoad = true;

        // 通过slotAjax创建同一的请求链接
        this.slotAjax(_rankType, _listType, 2, function (data) {

            if (data.list.length == 0) {
                _rankType.hasMoreData = false;
                return;
            }

            var gameList = data.list, index = 0;
            var _hotList = [];

            // 首次加载筛选数据
            if (_rankType.page == 0) {

                var maxLen = Math.min(3, gameList.length);
                index = maxLen;

                for (var i = 0; i < maxLen; i++) {
                    _rankView.activeRankTops[i] = gameList[i];
                }
            }

            for (var i = index; i < gameList.length; i++) {
                var item = gameList[i];
                _hotList.push(item);
            }

            _listType = _listType.concat(_hotList);
            _rankType.page++;

            _rankView.activeRankList = _listType;
        });


    },
    ajaxData: function (url, complete) {

        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            jsonp: 'cb',
            timeout: 30 * 60 * 1000,
            jsonpCallback: 'callFn' + (+new Date()) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
            success: function (data, xhr) {
                complete && complete(data)
            },
            error: function (xhr, type) {
                console.log('[AJAX ERROR]:', xhr, type)
            }
        });

    }
};

var _rankView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        sdwFooter: sdwFooter,
        loadingView: loadingView,
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


// 热游榜1
var hotRankScroll = new WindowScroll(function () {
    _rankView.hotRankScroll();
}, true, 200, 10);
hotRankScroll.enable = false;

// 活跃榜单2
var activeRankScroll = new WindowScroll(function () {
    _rankView.activeRankScroll();
}, true, 200, 10);
activeRankScroll.enable = false;

// 富豪榜单3
var richRankScroll = new WindowScroll(function () {
    _rankView.richRankScroll();
}, true, 200, 10);
richRankScroll.enable = false;

// MAIN == INIT
if (SDW_WEB.onShandw) {

    SDW_WEB.getSdwUserData().then(function () {
        _rankView.changeRankListState(3);
    }, function () {

        // alert('没有登录');
        SDW_WEB.sdw.openLogin({
            success: function () {
            }
        })
    })

} else {
    // 加载初始的数据
    _rankView.changeRankListState(3);
}


