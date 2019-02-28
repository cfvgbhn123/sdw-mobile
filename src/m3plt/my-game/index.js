require('../init.scss');
require('./index.scss');


var searchInput = require('../components/search-input/search-input.vue');
var lGameItem = require('../classify/component/l-game-item/l-game-item.vue');
var alertGame = require('../components/alert-game/alert-game.vue');

var TransDate = require('../components/js/TransDate.js');

var calRightFixed = function () {
    var width = document.documentElement.clientWidth || document.body.clientWidth;
    var offset = 0;

    if (width < 990) {
        offset = 990 - width;
        width = 990;
    }

    return (width - 980) / 2 - 6 - offset;
};


var indexData = {
    firstSearchFlg: false,
    currentGameUrl: '',
    rightFixed: calRightFixed(),
    load: false,
    page: 0,
    searchTypes: [
        {id: -1, isClick: true, name: '全部'},
    ],
    searchTips: [
        {id: -1, isClick: true, name: '全部'},
        {id: 0, isClick: false, name: '最新'},
        {id: 1, isClick: false, name: '最热'},
    ],

    searchGameListData: [],

    APP_ROOT_HOME: 'http://www.shandw.com/m3plt/index/?channel=' + SDW_WEB.channel,
    APP_ROOT_GIFT: 'http://www.shandw.com/m3plt/gift/?channel=' + SDW_WEB.channel,

    showMoreBtn: false,
    searchKey: '',
    searchType: '',
    searchFlag: 1,
    searchTip: '',
};

var indexMethods = {

    voidFn: function () {

    },

    hideMask: function () {
        this.currentGameUrl = '';
        this.$nextTick(function () {

        });
    },


    // 搜索游戏
    searchBtnFn: function (type) {

        if (type) {

            var uri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                v: +new Date(),
                searchKey: type
            }, false, 'http://www.shandw.com/m3plt/classify/');

            location.href = uri;

        } else {

            dialog.show('error', '请输入需要搜索的内容', 1);
        }

    },

    loadSearchGame: function (add) {

        if (this.load) return;
        this.load = true;

        var self = this;
        var postUrl = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            token: SDW_WEB.USER_INFO.token,
            type: 1,
            page: 0
        }, false, HTTP_STATIC + 'userinfo');


        SDW_WEB.getAjaxData(postUrl, function (data) {

            if (data.result === 1) {

                // 追加我最近玩过的所有游戏
                if (data.recent && data.recent.length) {

                    self.searchGameListData = self.searchGameListData.concat(data.recent);

                } else {

                    self.showMoreBtn = false;
                }
            }


            self.$nextTick(function () {
                self.load = false;
            });

        })
    },

    loadMoreSearchGame: function () {

        this.loadSearchGame(true);

    },


};

var _indexView;

// 页面的主入口
var main = function () {

    _indexView = new Vue({
        el: '#app',
        data: indexData,
        methods: indexMethods,
        components: {
            searchInput: searchInput,
            lGameItem: lGameItem,
            alertGame: alertGame,
        }
    });


    // 默认有搜索的游戏

    if (SDW_WEB.queryParam['searchKey']) {
        _indexView.searchKey = SDW_WEB.queryParam['searchKey'];
    }


    _indexView.$nextTick(function () {
        _indexView.loadSearchGame();
    });

    var rightContainer = document.querySelector('.right-container');
    window.onresize = function () {
        rightContainer.style.right = calRightFixed() + 'px';
    }
};

main();

