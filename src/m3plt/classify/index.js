require('../init.scss');
require('./index.scss');


var searchInput = require('../components/search-input/search-input.vue');
var lGameItem = require('./component/l-game-item/l-game-item.vue');
var alertGame = require('../components/alert-game/alert-game.vue');

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

        })
    },

    // 搜索游戏
    searchBtnFn: function (type) {

        if (type) {

            var self = this;
            this.searchKey = type;
            this.searchType = '';
            this.searchFlag = '';
            this.page = 0;

            this.$nextTick(function () {
                self.loadSearchGame();
            })

        } else {

            dialog.show('error', '请输入需要搜索的内容', 1);
        }
    },

    // 变更右侧点击的事件
    changeSearch: function (item, type) {

        if (this.load) return;

        var self = this;
        var list = this[type];

        for (var i = 0; i < list.length; i++) {
            var ite = list[i];
            ite.isClick = ite.id === item.id;
        }

        // 点击完成后，要查询不同的类型的游戏
        if (type === 'searchTypes') {

            this.searchType = item.id === -1 ? '' : item.name;
        } else {

            this.searchTip = item.id === -1 ? '' : item.name;
        }

        this.page = 0;
        this.searchKey = '';

        this.$nextTick(function () {
            // 重新加载游戏
            self.loadSearchGame();
        })
    },


    loadSearchGame: function (add) {

        if (this.load) return;
        this.load = true;

        var self = this;
        var searchUri = SDW_WEB.URLS.addParam({
            key: this.searchKey,
            type: this.searchType,
            tip: this.searchTip,
            flag: this.searchFlag,
            page: this.page++
        }, true, HTTP_STATIC + 'search');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                self.firstSearchFlg = true;

                self.initSearchTypes(data.typeList);

                if (data.list && data.list.length) {

                    if (add) {
                        self.searchGameListData = self.searchGameListData.concat(data.list);
                    } else {
                        self.searchGameListData = data.list;
                    }

                    if (data.list.length < data.pageSize) {
                        self.showMoreBtn = false;
                    } else {
                        self.showMoreBtn = true;
                    }

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

    initSearchTypes: function (types) {

        if (this.searchTypes.length !== 1)return;

        var _types = types.split(',');

        for (var i = 0; i < _types.length; i++) {

            this.searchTypes.push(
                {id: i, isClick: false, name: _types[i]},
            )
        }
    }


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

// 模拟数据
// indexData = require('./data/data');
main();

