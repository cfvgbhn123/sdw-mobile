/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// var gameItem = require('../../components/mobile/game-item/game-item.vue');
// var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');
var loadingView = require('../../components/mobile/loading/loading.vue');

require('./index.scss');
require('../../components/initcss.scss');


var indexData = {

    onShandw: SDW_WEB.onShandw,
    pageHasLoading: false,
    rankNavType: 1,

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
            // starLists: starLists(0),
            quantity: '',
            desc: '',
            time: ''
        },
        {
            id: '',
            cover: '',
            title: '虚位以待',
            // starLists: starLists(0),
            quantity: '',
            desc: '',
            time: ''
        },
        {
            id: '',
            cover: '',
            title: '虚位以待',
            // starLists: starLists(0),
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
    // 变更排行榜 1 2 3
    changeRankListState: function (type) {

        if (this.pageHasLoading) return;

        this.rankNavType = type;

        hotRankScroll.enable = (type === 1);
        activeRankScroll.enable = (type === 2);
        richRankScroll.enable = (type === 3);

        if (type === 1 && this.hotRanks.page === 0) {
            this.hotRankScroll();
        }

        if (type === 2 && this.activeRanks.page === 0) {
            this.activeRankScroll();
        }

        if (type === 3 && this.richRanks.page === 0) {
            this.richRankScroll();
        }

    },
    slotAjax: function (_rankType, _listType, type, complete) {

        var self = this;

        /**
         * 获取评论相关的数据
         * id：查找精准的id资讯
         * t：类型：1-资讯，2-游戏，3-涂墙
         * type：内容资讯的种类（花边什么的）
         * gid：获取关于某个游戏的内容列表
         * city：关于某个城市的内容
         * page：页码，传入的参数从1开始计算
         * ct：模糊匹配搜索（暂未开放）
         */

        var postUri = SDW_WEB.URLS.addParam({
            type: ['攻略', '公告', '活动'][type - 1],
            t: 1,
            page: _rankType.page,
        }, false, HTTP_STATIC + 'bbsget');

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
    // 攻略的
    hotRankScroll: function () {

        var _rankType = this.hotRanks, _listType = this.hotRankList;

        if (_rankType.isLoad || !_rankType.hasMoreData) return;
        _rankType.isLoad = true;

        // 通过slotAjax创建同一的请求链接
        this.slotAjax(_rankType, _listType, 1, function (data) {

            if (data.list.length === 0) {
                _rankType.hasMoreData = false;
                return;
            }

            var gameList = data.list;
            _listType = _listType.concat(gameList);
            _rankType.page++;

            _rankView.hotRankList = _listType;

        });

    },
    richRankScroll: function () {

        var _rankType = this.richRanks, _listType = this.richRankList;

        if (_rankType.isLoad || !_rankType.hasMoreData) return;
        _rankType.isLoad = true;

        var self = this;
        // 通过slotAjax创建同一的请求链接
        this.slotAjax(_rankType, _listType, 3, function (data) {

            if (data.list.length == 0) {
                _rankType.hasMoreData = false;
                return;
            }


            var gameList = data.list;
            _listType = _listType.concat(gameList);
            _rankType.page++;


            _rankView.richRankList = _listType;
            self.$nextTick(function () {

            })
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

            var gameList = data.list;
            _listType = _listType.concat(gameList);
            _rankType.page++;

            _rankView.activeRankList = _listType;
        });

    },

    openNewPage: function (url) {
        // 打开玩游戏的界面
        SDW_WEB.openNewWindow({
            link: url,
            isFullScreen: false,
            showMoreBtn: true,
            title: ''
        });
    },

    /**
     * 转换时间
     * @param date
     * @returns {string}
     */
    transDateObj: function (date) {

        var res = {}, oD = new Date(date),
            m = oD.getMonth() + 1 >= 10 ? (oD.getMonth() + 1) : '0' + (oD.getMonth() + 1),
            d = oD.getDate() >= 10 ? oD.getDate() : '0' + oD.getDate();

        // res.sDate = oD.getFullYear();
        // res.bDate = m + '-' + d;
        return m + '.' + d;
    }
};

var _rankView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
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


// 攻略1
var hotRankScroll = new WindowScroll(function () {
    _rankView.hotRankScroll();
}, true, 200, 10);
hotRankScroll.enable = false;

// 公告2
var activeRankScroll = new WindowScroll(function () {
    _rankView.activeRankScroll();
}, true, 200, 10);
activeRankScroll.enable = false;

// 活动3
var richRankScroll = new WindowScroll(function () {
    _rankView.richRankScroll();
}, true, 200, 10);
richRankScroll.enable = false;

// 加载资讯
_rankView.changeRankListState(3);


