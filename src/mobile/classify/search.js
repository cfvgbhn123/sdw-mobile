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
// var GAME_URL = require('../GAME_URL');

require('../../components/initcss.scss');
require('./index.scss');


var indexData = {

    searchResultList: [],
    pageHasLoading: false,
    showSearchHeader: true,

    // 显示的游戏列表
    searchGameList: [],

    // 请求的参数字段
    searchKey: '',
    searchType: '',
    searchTip: '',
    searchFlag: 1,

    // 分类字段（读取服务器）
    searchAllTypes: [{
        type: '全部',
        select: 1
    }],

    hotSearchList: [],

    // 条件筛选字段 tip
    searchAllTips: [],

    // 搜索的数据缓存，防止频繁请求数据
    searchDataCache: {},

    searchState: {
        'test': {
            notMore: false,
            page: 0
        }
    },

    userSearchCache: {},

    showClearBtn: false,

};

var indexMethods = {

    // 加载游戏列表
    loadSearchGame: function (flag) {

        /**
         * key 模糊搜索的关键字
         * type 游戏类型
         * tip 全部、最新、最热
         * flag 返回游戏类型，2，返回关键词
         * @type {indexMethods}
         */
        var self = this;

        var searchUri = SDW_WEB.URLS.addParam({
            key: this.searchKey,
            type: this.searchType,
            tip: this.searchTip,
            flag: flag,
        }, true, HTTP_STATIC + 'search');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                var _hotSearch = data.hotSearch || [];

                // 循环遍历游戏
                for (var i = 0; i < _hotSearch.length; i++) {
                    self.hotSearchList.push({
                        type: _hotSearch[i].name,
                        select: 0,
                        tags: self.createTags(_hotSearch[i].tip, _hotSearch[i].gift),
                        id: _hotSearch[i].id
                    })
                }


                // 游戏的类型
                if (data.typeList) {
                    var _typeList = data.typeList.split(',');
                    for (var i = 0; i < _typeList.length; i++) {
                        self.searchAllTips.push({
                            type: _typeList[i],
                            select: 0,
                        })
                    }
                }

            }

        })
    },

    createTags: function (tags, gift) {

        var colorMap = {
            '热门': 'g-l-5',
            '精品': 'g-l-3',
            '礼包': 'g-l-4',
            '最新': 'g-l-1',
            '独家': 'g-l-2',
            '首发': 'g-l-6',
            '删档': 'g-l-7',
        };

        var res = [];

        if (tags) {

            var _tags = tags.split(',');
            for (var i = 0; i < _tags.length; i++) {
                res.push({
                    type: _tags[i],
                    cl: colorMap[_tags[i]]
                });
            }
        }

        if (gift) {
            res.push({
                type: '礼包',
                cl: 'g-l-4'
            });
        }

        return res;
    },

    addSearchAllTypes: function (list) {
        if (this.searchAllTypes.length !== 1) return;
        var _typeList = list.split(',');

        for (var i = 0; i < _typeList.length; i++) {
            this.searchAllTypes.push({
                type: _typeList[i],
                select: 0
            });
        }
    },


    /**
     * 点击标签进入游戏的详情页面
     * @param item
     */
    checkGameState: function (item) {

        var goUrl = SDW_PATH.MOBILE_ROOT + 'detail/?channel=' + SDW_WEB.channel +
            '&gid=' + item.id + '&ver=' + SDW_PATH.ver;

        // 打开玩游戏的界面
        SDW_WEB.openNewWindow({
            link: goUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        });
    },

    /**
     * 搜索游戏
     */
    searchGame: function (type, tap) {

        /**
         * key 模糊搜索的关键字
         * type 游戏类型
         * tip 全部、最新、最热
         * flag 返回游戏类型，2，返回关键词
         * @type {indexMethods}
         */
        var self = this;
        var _key = '';

        type = type || window.USER_TYPE || '';
        window.USER_TYPE = type;

        if (!this.searchKey && !type) {
            this.searchResultList = [];
            dialog.show('error', '请输入需要搜索的内容哦', 1);
            return;
        }


        if (type) {
            indexData.searchType = type;
            indexData.searchKey = type;
        } else {
            _key = this.searchKey;
        }

        // 防止没有字段搜索
        if (!indexData.searchKey) {
            return;
        }


        if (tap) {
            indexData.searchResultList = [];
        }

        window._cacheKey = _key + type;
        var page = 0;


        if (indexData.userSearchCache[window._cacheKey]) {

            if (indexData.userSearchCache[window._cacheKey].canLoad) {
                indexData.userSearchCache[window._cacheKey].canLoad = false;
                page = indexData.userSearchCache[window._cacheKey].page;
            } else {
                return;
            }

        } else {
            // 首次加载
            indexData.userSearchCache[window._cacheKey] = {
                canLoad: true,
                page: 0
            }
        }


        var searchUri = SDW_WEB.URLS.addParam({
            key: _key,
            type: type,
            tip: this.searchTip,
            flag: 1,
            page: page
        }, true, HTTP_STATIC + 'search');

        dialog.show('loading', '拼命加载中...');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                if (data.list && data.list.length) {

                    indexData.userSearchCache[window._cacheKey].canLoad = true;

                    self.searchResultList = self.searchResultList.concat(data.list || []);

                    if (type) {
                        self.searchKey = type;
                    }

                    indexData.userSearchCache[window._cacheKey].page++;

                    dialog.hidden();

                } else {

                    dialog.hidden();
                    // dialog.show('error', '没有相关的游戏', 1);
                }

            } else {
                dialog.show('error', data.msg, 1)
            }

        })
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

            // flag [2017-11-01 16:46:55]
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
    },

    __showLoginPage: function (index) {
        // 普通短信登录
        this.$refs.login.show = '1';
        this.__footIndex__ = index;
    },

    // 清除所有的搜索结果
    clearAllSearchList: function () {
        this.searchKey = '';
    }

};

// 初始化
// initSearchSate(indexData);

var _searchView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        longGameItem: longGameItem,
        fastLogin: fastLogin,
        loadingView: loadingView
    },
    watch: {
        searchKey: function (_new, _old) {

            if (!_new) {
                this.showClearBtn = false;
                this.searchResultList = [];

                window.USER_TYPE = '';

                indexData.userSearchCache[window._cacheKey] = {
                    canLoad: true,
                    page: 0
                };

                this.$nextTick(function () {

                });
            } else {
                // this.searchGame();
                this.showClearBtn = true;
            }
        }
    }
});

if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {

        _searchView.loadSearchGame(2);

    }, function (msg) {

        // 获取闪电玩用户数据失败
        SDW_WEB.USER_INFO = {};
        _searchView.loadSearchGame(2);

    });

} else {
    _searchView.loadSearchGame(2);
}


var allGameScroll = new WindowScroll(function () {
    _searchView.searchGame();
}, true, 200, 10);


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

