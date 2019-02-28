require('../init.scss');
require('./index.scss');

// 计算右侧的定位
var calRightFixed = function () {
    var width = document.documentElement.clientWidth || document.body.clientWidth;
    var offset = 0;

    if (width < 990) {
        offset = 990 - width;
        width = 990;
    }

    return (width - 980) / 2 - 6 - offset;
};

var searchInput = require('../components/search-input/search-input.vue');
var giftListItem = require('./component/gift-list-item/gift-list-item.vue');
var giftCodeMask = require('../components/gift-code-mask/gift-code-mask.vue');
var alertGame = require('../components/alert-game/alert-game.vue');

var indexData = {
    currentGameUrl: '',
    rightFixed: calRightFixed(),
    load: false,
    page: 0,
    loaded: false,
    gameListMap: [
        {gid: -1, isClick: true, name: '全部'},
    ],
    APP_ROOT_HOME: 'http://www.shandw.com/m3plt/index/?channel=' + SDW_WEB.channel,
    APP_ROOT_GIFT: 'http://www.shandw.com/m3plt/gift/?channel=' + SDW_WEB.channel,
    showMoreBtn: true,
    // showMoreTips: false,
    giftListData: [
        // {
        //     gname: '',
        //     gifts: [],
        // },
    ],
    gameSet: {},
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

    // 变更游戏礼包
    changeGameItem: function (item) {

        this.showMoreBtn = item.gid === -1 && !this.loaded;

        // this.showMoreTips = item.gid !== -1;

        for (var i = 0; i < this.gameListMap.length; i++) {
            var ite = this.gameListMap[i];
            ite.isClick = ite.gid === item.gid;
        }

        for (var i = 0; i < this.giftListData.length; i++) {
            var ite = this.giftListData[i];

            if (item.gid === -1) {
                ite.show = true;
            } else {
                ite.show = ite.gid === item.gid;
            }

        }

        this.$nextTick(this.voidFn);
    },

    loadGiftListData: function () {

        var self = this;

        if (this.load) return;
        this.load = true;

        var postUri = SDW_WEB.URLS.addParam({
            page: this.page++,
        }, false, HTTP_STATIC + 'gift');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {

                if (data.game && data.game.length && data.gift && data.gift.length) {

                    var _gameSet = {};

                    for (var i = 0; i < data.game.length; i++) {

                        var item = data.game[i];

                        var _set = {

                            myGameName: item.name,
                            myGameCover: item.bIcon,
                            myGameSub: item.sub,
                            gifts: [],
                            gid: item.id,
                            show: true,

                        };

                        if (!_gameSet[item.id]) {
                            _gameSet[item.id] = _set;
                        }
                    }


                    // 礼包分类
                    for (var i = 0; i < data.gift.length; i++) {
                        var item = data.gift[i];
                        _gameSet[item.gid] && _gameSet[item.gid].gifts.push(item);
                    }


                    // 游戏礼包赋值
                    for (i in _gameSet) {

                        if (_gameSet.hasOwnProperty(i)) {

                            indexData.gameListMap.push({
                                gid: _gameSet[i].gid,
                                isClick: false,
                                name: _gameSet[i].myGameName
                            });


                            indexData.giftListData.push(_gameSet[i]);
                        }
                    }

                } else {

                    self.showMoreBtn = false;
                    self.loaded = true;
                    dialog.show('error', '没有更多的礼包数据了', 1);

                }

                self.$nextTick(function () {
                    self.load = false;
                });

            } else {

                console.log('get gift data error.')
            }
        })
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
            giftListItem: giftListItem,
            giftCodeMask: giftCodeMask,
            alertGame: alertGame,
        }
    });

    _indexView.loadGiftListData();

    var rightContainer = document.querySelector('.right-container');
    window.onresize = function () {
        rightContainer.style.right = calRightFixed() + 'px';
    };

    window._indexView = _indexView;
};

// 模拟数据
// indexData = require('./data/data');
main();

