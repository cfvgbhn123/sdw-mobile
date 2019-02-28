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


/**
 * 变更搜索页面的初始信息
 * @param indexData
 */
function initSearchSate(indexData) {

    // 头部显示全部
    var queryParam = SDW_WEB.queryParam;

    var S_TIP = {
        'ZUIRE': '最热',
        'ZUIXIN': '最新',
        'XIAOYOUXI': '休闲小游戏'
    };


    var sTip = queryParam['s_tip'];
    var sType = queryParam['s_type'];

    indexData.showSearchHeader = queryParam['s_header'] ? false : true;
    indexData.searchType = S_TIP[sType] || '';
    indexData.searchTip = S_TIP[sTip] || '';

    if (sTip && sTip == 'ZUIRE') {
        var item = foundItem('最热');
        if (item) {
            item.select = 1;
        }
    } else if (sTip && sTip == 'ZUIXIN') {
        var item = foundItem('最新');
        if (item) {
            item.select = 1;
        }
    } else {
        var item = foundItem('全部');
        if (item) {
            item.select = 1;
        }
    }

    function foundItem(type) {
        for (var i = 0; i < indexData.searchAllTips.length; i++) {
            if (indexData.searchAllTips[i].type == type) {
                return indexData.searchAllTips[i];
            }
        }

        return false;
    }

}

var indexData = {

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

    // 条件筛选字段 tip
    searchAllTips: [{
        type: '全部',
        select: 0
    }, {
        type: '最热',
        select: 0
    }, {
        type: '最新',
        select: 0
    }],

    // 搜索的数据缓存，防止频繁请求数据
    searchDataCache: {},

    searchState: {
        'test': {
            notMore: false,
            page: 0
        }
    },

    preSearchKeyMap: {}

};

var indexMethods = {

    gotoSearch: function () {

        // 游戏搜索页面
        var links = SDW_PATH.MOBILE_ROOT + 'classify/search.html?channel=' + SDW_WEB.channel + '&ver=' + SDW_PATH.ver;

        // 打开玩游戏的界面
        SDW_WEB.openNewWindow({
            link: links,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        });
    },

    // 加载游戏列表
    loadSearchGame: function (mustLoad) {

        var self = this;

        // 首先检查是否有缓存数据
        if (self.checkSearchCacheKey() && !mustLoad && self.pageHasLoading) return;

        var _cacheKey = this.searchType + this.searchTip;

        if (!mustLoad && self.preSearchKeyMap['' + _cacheKey]) return;

        mustLoad || (self.preSearchKeyMap['' + _cacheKey] = true);

        if (this.searchState[_cacheKey].notMore) return;

        self.pageHasLoading = true;

        var searchUri = SDW_WEB.URLS.addParam({
            key: this.searchKey,
            type: this.searchType,
            tip: this.searchTip,
            flag: this.searchFlag,
            page: this.searchState[_cacheKey].page++
        }, true, HTTP_STATIC + 'search');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                self.addSearchAllTypes(data.typeList);

                // 添加到缓存中
                self.addDataToCache(data.list);

                self.$nextTick(function () {
                    // 重新通过缓存读取数据
                    setTimeout(function () {
                        self.checkSearchCacheKey();
                    }, 20);

                });

            }

        })
    },

    addSearchAllTypes: function (list) {

        var queryParam = SDW_WEB.queryParam;


        var sType = queryParam['s_type'];
        var S_TIP = {
            'ZUIRE': '最热',
            'ZUIXIN': '最新',
            'XIAOYOUXI': '休闲小游戏'
        };


        if (this.searchAllTypes.length !== 1) return;

        if (list) {
            var _typeList = list.split(',');

            for (var i = 0; i < _typeList.length; i++) {

                var _item = {
                    type: _typeList[i],
                    select: 0
                };

                // 修改对应的字段
                if (sType && S_TIP[sType] == _typeList[i]) {
                    this.searchAllTypes[0].select = 0;
                    _item.select = 1;
                }

                this.searchAllTypes.push(_item);
            }
        }

    },

    // 变更选择的按钮
    changeTypeItem: function (type, item) {

        var self = this;
        var _checkLists = self['searchAll' + type + 's'];

        for (var i = 0; i < _checkLists.length; i++) {

            if (_checkLists[i].type === item.type) {
                _checkLists[i].select = 1;

                // 动态赋值需要搜索的类型
                self['search' + type] = item.type === '全部' ? '' : item.type;

            } else {
                _checkLists[i].select = 0;
            }
        }

        self.$nextTick(function () {
            // 重新加载
            self.loadSearchGame();
        })

    },

    // 生成缓存的key
    checkSearchCacheKey: function () {

        // type + tip
        var _cacheKey = this.searchType + this.searchTip;

        if (!this.searchState[_cacheKey]) {
            this.searchState[_cacheKey] = {
                notMore: false,
                page: 0
            };
        }

        if (this.searchDataCache[_cacheKey]) {

            var self = this;

            setTimeout(function () {
                self.pageHasLoading = false;
                self.searchGameList = self.searchDataCache[_cacheKey];
            }, 20);

            return true;
        }

        return false;
    },

    // 添加到缓存中
    addDataToCache: function (list) {

        list = list || [];
        var _cacheKey = this.searchType + this.searchTip;
        var _cacheList = this.searchDataCache[_cacheKey] || [];

        this.searchDataCache[_cacheKey] = _cacheList.concat(list);

        if (!this.searchState[_cacheKey]) {
            this.searchState[_cacheKey] = {};
        }

        if (list.length === 0)
            this.searchState[_cacheKey].notMore = true;

        this.$nextTick(function () {

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

            // flag [2017-11-01 16:45:28]
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
};

// 初始化
initSearchSate(indexData);

var _searchView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        longGameItem: longGameItem,
        fastLogin: fastLogin,
        loadingView: loadingView
    }
});


if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {

        _searchView.loadSearchGame();

    }, function (msg) {

        // 获取闪电玩用户数据失败
        SDW_WEB.USER_INFO = {};
        _searchView.loadSearchGame();

    });

} else {
    _searchView.loadSearchGame();
}


window.onload = function () {

    var allGameScroll = new WindowScroll(function () {
        _searchView.loadSearchGame(true);
    }, true, 200, 10);

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


