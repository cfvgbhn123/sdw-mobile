require('./index.scss');
// require('../../components/mobile/bind-phone/bind-phone.scss');
var APP_ROOT = "http://www.shandw.com/mobile/shop/";

require('../../components/initcss.scss');

// import Vuex from 'vuex'
// import store from './vuex/store'

var userInfo = require('./template/user-info/user-info.vue');
var scrollText = require('./template/scroll-text/scroll-text.vue');
var shopItem = require('./template/shop-item/shop-item.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer-n.vue');
var qiandao = require('../../components/mobile/qiandao/qiandao.vue');


(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}());

var WindowScroll = require('../../libs/WindowScroll');

// var HTTP_STATIC = 'http://192.168.218.117:9061/';

var indexData = {

    pageType: SDW_WEB.onShandw ? '' : 'normal',
    // oneScreen: true,  // 一屏幕的限制

    user: {
        avatar: SDW_WEB.USER_INFO.avatar,
        id: SDW_WEB.USER_INFO.id,
        nick: SDW_WEB.USER_INFO.nick,
        gold: 0,
        stamp: 0,
        luckyDrawCost: 0,
        luckyEggCost: 0
    },

    // 玩蛋模块的信息
    egg: {
        init: false,
        timer: null,
        show: 0,
        egg: [
            {
                type: 'yellow',
                state: 1,
                cz: 0
            },
            {
                type: 'red',
                state: 1,
                cz: 0
            },
            {
                type: 'blue',
                state: 1,
                cz: 0
            },
            {
                type: 'green',
                state: 1,
                cz: 0
            }
        ],
        result: {
            show: 0,
            money: 0
        },
        cz: 0,
        request: 0,
        rule: 0,
        pos: 1
    },

    // 触电抽奖
    lottery: {
        init: false,
        show: 0,
        timer: null,
        stateIndex: 0,
        items: null, // dom数组
        startTime: +new Date(),
        stamp: 0,
        // 摇奖盘的奖励信息
        lottery: [],
        result: {
            show: 0,
            // code: '23'
        },
        btnState: 'normal',
        aniObj: {
            time: 0,
            stop: 0,
            aniTime: 100,
            canplay: 1
        }
    },

    showGameContainer: SDW_WEB.queryParam['sgame'] == '1',   // 是否有参数判断

    showQiandao: false,
    qiandaoShowMask: false,
    qiandaoMoney: 0,
    qiandaoCheckIn: false,
    checkList: [],

    toolInfo: {
        title: '',
        timer: null
    },
    // loading: false,

    currentRef: null,

    /*用户信息*/
    userInfos: {
        avatar: '',
        gold: 0,
        stamp: 0,
        money: 0
    },

    // 内容导航
    contentNav: [{
        title: '活动热销',
        index: 0,
        show: false,
        shopType: 'shopType1'
    },
        {
            title: '游戏礼包',
            index: 1,
            show: false,
            shopType: 'shopType2'
        },
        {
            title: '实物商品',
            index: 2,
            show: false,
            shopType: 'shopType3'
        },
        {
            title: '虚拟商品',
            index: 3,
            shopType: 'shopType4'
        }
    ]
};

var map = {
    '0': {
        title: 'hotItems',
        page: 0
    },
    '1': {
        title: 'ggItems',
        page: 0
    },
    '2': {
        title: 'goItems',
        page: 0
    },
    '3': {
        title: 'shopItems',
        page: 0
    },
};


// 加载砸蛋的资源
function loadEggImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var all = 5 * 4, loadLen = 0;
    var eggs = ['yellow', 'blue', 'green', 'red'];
    eggs.forEach(function (item) {
        for (var i = 1; i < 6; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/egg-' + item + '-' + i + '.png';
            img.onload = loaded;
        }
    });

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.egg.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}

// 加载触电的资源
function loadLotteryImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var imgRes = ['blue-node', 'cl-bottom', 'cl-left', 'cl-right',
        'lottery-border-1', 'lottery-border-2', 'red-node',
        'lottery-btn-bottom', 'lottery-btn-click', 'lottery-btn-light',
        'lottery-btn-normal', 'line-blue', 'line-red'];

    var all = imgRes.length + 16, loadLen = 0;

    imgRes.forEach(function (item) {
        for (var i = 1; i < 16; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/' + item + '.png';
            img.onload = loaded;
        }
    });

    for (var i = 1; i < 16; i++) {
        var img = new Image();
        img.src = APP_ROOT + 'images/light' + i + '.png';
        img.onload = loaded;
    }

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.lottery.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}

var methods = {


    /*初始化*/
    myInit: function () {
        this.getShopInfo();

        this.loadSignData();

        // 初始化滚动的事件
        setTimeout(function () {
            addScrollFn();
        }, 1000);

        function addScrollFn() {

            window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            document.documentElement.scrollTop = document.body.scrollTop = 0;

            var _sliderTimerInterval = 20;
            var sliderNavLists, sliderTop, sliderNavDom, goBackBtn = document.querySelector('#goBackBtn');
            // var nowIdx = null;
            var sliderNavDomHasFixed = false;
            // var goBackBtnHasHidden = false;
            // 需要继续优化滚动函数！！！
            var sliderFn = function () {

                setTimeout(function () {
                    window.requestAnimationFrame(sliderFn);
                }, _sliderTimerInterval);

                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

                // 实时显示导航栏的位置，防止多次的变更DOM
                if (scrollTop > sliderTop) {
                    if (!sliderNavDomHasFixed) {
                        sliderNavDomHasFixed = true;
                        sliderNavDom.dataset.type = 'fixed';
                    }
                } else {
                    if (sliderNavDomHasFixed) {
                        sliderNavDomHasFixed = false;
                        sliderNavDom.dataset.type = '';
                    }
                }
            };

            setTimeout(function () {
                sliderNavLists = document.querySelector('.content-nav-list');
                sliderTop = sliderNavLists.getBoundingClientRect().top || sliderNavLists.offsetTop;
                // alert(sliderTop);
                sliderNavDom = document.querySelector('.content-nav-list');
                window.requestAnimationFrame(sliderFn);
            }, 20);

        }

        var self = this;

        /*加载更多*/
        var allGameScroll = new WindowScroll(function () {
            self.currentRef.$emit('getShopList');  // 发送请求
        }, true, 200, 5);

        allGameScroll.enable = true;
    },

    // 初始化砸蛋的功能
    initEgg: function () {

        var self = this;
        if (this.egg.init) {

            this.egg.result.show = 0;
            this.egg.cz = 0;
            this.egg.request = 0;
            this.egg.timer = null;
            this.egg.pos = 1;
            this.egg.egg.forEach(function (item) {
                item.state = 1;
            });

            var eggCz = document.querySelector('#egg-cz');
            eggCz.className = 'egg-cz-0';

            setTimeout(function () {
                _shopRoot.egg.pos = 0;
            }, 20);


            // 显示砸蛋
            this.egg.show = 1;
        } else {
            loadEggImagesRes(function () {
                self.initEgg();
            });
        }

    },

    eggAnimation: function (item) {

        item.state = 2;

        _shopRoot.egg.timer = setInterval(function () {
            if (item.state == 5) {
                item.state = 4;
            } else {
                item.state++;
            }
        }, 220);

    },

    // 砸蛋
    eggFn: function (item, index, e) {

        if (this.egg.request) return;

        if (this.userInfos.gold < this.userInfos.luckyEggCost) {
            // this.coinTipWindow = 1;
            dialog.show('error', '您的闪电币不足！', 1);
            return;
        }

        var self = this;

        this.egg.cz = index;

        var eggCz = document.querySelector('#egg-cz');
        eggCz.className = 'egg-cz-' + index;

        setTimeout(function () {
            _shopRoot.eggAnimation(item);
        }, 450);

        this.egg.request = 1;

        // 砸蛋请求
        setTimeout(function () {

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'luckyegg');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result == 1) {
                    _shopRoot.egg.result.money = data.stamps + '点券';
                    _shopRoot.egg.result.show = 1;

                    // 修正用户的金币数量
                    _shopRoot.userInfos.gold -= self.userInfos.luckyEggCost;
                    _shopRoot.userInfos.stamp += data.stamps;

                } else {
                    dialog.show('error', data.msg, 1);
                }

            });


        }, 1200);
    },

    // 初始化摇奖
    initLotteryFn: function () {

        var self = this, lottery = this.lottery;

        if (lottery.init) {

            lottery.btnState = 'normal';
            lottery.stateIndex = 0;

            // 根据请求回来的数据进行处理
            var t = Math.max(0, 40);
            var n = /^\+?[1-9][0-9]*$/.test(t / 8 + '') ? t / 8 : t / 8 + 1;

            lottery.aniObj.time = n * 8;
            lottery.aniObj.stop = 0;  // 设置停止的位置INDEX
            lottery.aniObj.aniTime = 100;
            lottery.aniObj.canplay = 1;

            !lottery.items && (lottery.items = document.querySelectorAll('.lottery-items'));


            var lIS = document.querySelector('.lottery-items-select');
            if (lIS) {
                lIS.classList.remove('lottery-items-select');
            }


            setTimeout(function () {
                lottery.show = 1;
            }, 100);


        } else {

            loadLotteryImagesRes(function () {
                self.initLotteryFn();
            })
        }

    },

    // 触电的按钮操作
    lotteryBtnClick: function (state, e) {
        // e.stopPropagation();

        var self = this;

        if (this.lottery.btnState === 'light') return;

        this.lottery.btnState = state;


        // 请求响应的数据，开启动画
        if (state === 'light') {

            if (this.userInfos.gold < this.userInfos.luckyDrawCost) {
                e.stopPropagation();
                self.lottery.btnState = 'normal';
                dialog.show('error', '您的闪电币不足', 1);
                return;
            }

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'luckydraw');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result === 1) {
                    self.lottery.aniObj.stop = data.index - 1;  // 设置停止的位置INDEX

                    var item = self.lottery.lottery[data.index - 1];
                    self.lottery.result.icon = item.item;
                    self.lottery.result.name = item.name;

                    // 需要修正的金币和点券
                    self.lottery.stamp = data.stamps || 0;
                    // self.user.glod -= data.glod;

                    self.lottery.result.code = data.code;
                } else {
                    dialog.show('error', data.msg, 1);
                }
            });


            setTimeout(function () {
                _shopRoot.lottery.startTime = +new Date();
                _shopRoot.lottery.items[_shopRoot.lottery.stateIndex].classList.add('lottery-items-select');
                _shopRoot.lottery.timer = requestAnimationFrame(_shopRoot.lotteryLight);
            }, 120 + 150 + 800);
        }
    },

    // 触电旋转动画
    lotteryLight: function () {

        var self;
        var lot = this.lottery;
        if (lot.btnState == 'normal') return;

        var now = +new Date();

        if (now - lot.startTime >= lot.aniObj.aniTime) {
            lot.startTime = now;

            // 删除上一个选中的样式
            lot.items[lot.stateIndex % 8].classList.remove('lottery-items-select');

            // 添加下一个选中的样式
            lot.stateIndex++;
            lot.items[lot.stateIndex % 8].classList.add('lottery-items-select');

            // 判断是否减缓速度
            if (lot.aniObj.time < lot.stateIndex) {

                lot.aniObj.aniTime = 150 + Math.min(150, (lot.stateIndex - lot.aniObj.time + 1) * 2.1 * 40);

                // 终止动画，显示奖励
                if (lot.aniObj.stop <= lot.stateIndex - 40) {

                    lot.aniObj.canplay = 0;

                    // 延迟显示动画
                    setTimeout(function () {

                        // 修正玩家的金币和点券
                        _shopRoot.userInfos.gold -= _shopRoot.userInfos.luckyDrawCost;
                        _shopRoot.userInfos.stamp += lot.stamp;

                        lot.result.show = 1;

                    }, lot.aniObj.aniTime * 3);

                }
            }
        }

        if (lot.aniObj.canplay)
            lot.timer = requestAnimationFrame(this.lotteryLight);
    },

    clickTabList: function (index) {
        // alert(index);

        /*签到*/
        if (index === 1) {
            this.showCheckIn();
            return;
        }


        /*成就*/
        if (index === 2) {
            SDW_WEB.addCount('s-task-btn');
            var pageUrl = 'http://www.shandw.com/mi/task2/?channel=' + SDW_WEB.channel;
            SDW_WEB.openNewWindow({
                link: pageUrl,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });
        }

        /*抽点券*/
        if (index === 3) {
            SDW_WEB.addCount('s-game-btn');
            this.showGameContainer = 1;
            return;
        }

        /*跳转兑换记录*/
        if (index === 4) {
            SDW_WEB.addCount('s-his-btn');
            /*跳转到记录*/
            var pageUrl = 'http://www.shandw.com/mi/myexc2/?channel=' + SDW_WEB.channel;
            SDW_WEB.openNewWindow({
                link: pageUrl,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });
        }
    },


    refreshPage: function () {

        if (location.reload) {
            location.reload();
        } else {
            location.href = location.href + '#p' + (+new Date());
        }

    },

    changeUserInfo: function (data) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                this.userInfos[i] = data[i];
            }
        }
        this.$nextTick(function () {
            // console.log(this.userInfos);
        })
    },

    startGame: function (type) {
        if (type === 'egg') {
            this.initEgg();
        } else if (type === 'lottery') {
            this.initLotteryFn();
        }

        this.showGameContainer = false;
    },

    // 关闭页面
    closePage: function (type, e) {
        if (type == 'result') {
            this.lottery.result.show = 0;
            this.egg.result.show = 0;
            this.closePage('games', e);
            clearInterval(this.egg.timer);
        } else if (type == 'games') {
            this.egg.show = 0;
            this.lottery.show = 0;
            this.egg.rule = 0;
        }
        this.egg.pos = 1;
    },

    startToolInfo: function (p) {
        var self = this;

        /*弹窗提示悬浮窗*/
        var obj = self.toolInfo;
        this.toolInfo.list = ['赚取闪电币', '成就' + p];
        this.toolInfo.index = 0;

        // 单步执行
        this.toolInfo.stepFn = function () {

            /*展示3秒，隐藏5秒*/
            setTimeout(function () {

                obj.title = '';
                setTimeout(function () {
                    obj.title = obj.list[obj.index++];
                    if (obj.index === obj.list.length) {
                        obj.index = 0;
                    }
                    obj.stepFn();
                }, 3000)
            }, 5000);
        };

        this.toolInfo.stepFn();
    },

    /*变更内容导航栏的状态*/
    changeContentNav: function (item) {
        for (var i = 0; i < this.contentNav.length; i++) {
            var _it = this.contentNav[i];
            if (item.index === _it.index) {
                SDW_WEB.addCount('s-' + item.shopType);  // 添加点击的统计按钮
            }
            _it.show = item.index === _it.index
        }
        /*通知组件请求数据*/
        // console.log(map[item.index].title)
        var $ref = this.$refs[map[item.index].title];

        document.body.scrollTop = document.documentElement.scrollTop = 0;

        this.currentRef = $ref;

        $ref.mpage = map[item.index].page;
        var isFirst = map[item.index].page++ === 0;
        if ($ref && isFirst) {
            $ref.$emit('getShopList');
        }
    },

    /*加载商城的总体信息*/
    getShopInfo: function () {
        // if (this.loading) return;
        // this.loading = true;
        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            // }, false, 'http://192.168.218.117:9061/shop');
        }, false, HTTP_STATIC + 'shop');

        SDW_WEB.getAjaxData(postUri, function (data) {
            if (data.result == 1) {

                // 记录当前时间
                SDW_WEB.SERVER_TIME = data.ct;
                SDW_WEB.SERVER_TIME_DEL = data.ct - (+new Date());

                // SDW_WEB.SERVER_TIME_DEL = +new Date();
                // console.log(SDW_WEB.SERVER_TIME, SDW_WEB.SERVER_TIME_DEL);
                // console.log(self.userInfos)
                self.userInfos = data.userInfo || {}; // 用户信息
                self.userInfos.luckyEggCost = data.luckyEggCost; // 砸蛋的价钱
                self.userInfos.luckyDrawCost = data.luckyDrawCost; // 抽奖的价钱
                self.lottery.lottery = data.luckyDrawItem;

                SDW_WEB.USER_INFO.shopInfo = data.userInfo;  // 全局缓存

                // 兑换的玩家名单
                var texts = [];
                if (data.uilist && data.uilist.length) {

                    var userMaps = {};
                    for (var i = 0; i < data.ulist.length; i++) {
                        if (!userMaps[data.ulist[i].id])
                            userMaps[data.ulist[i].id] = data.ulist[i].nick;
                    }

                    for (var i = 0; i < data.uilist.length; i++)
                        texts.push('玩家 ' + (userMaps[data.uilist[i].uid] || data.uilist[i].uid) + '，兑换了' + data.uilist[i].name);
                }

                self.$refs.mscroll.$emit('start', texts);  // 初始化滚动条
                /*默认展示第一个*/
                self.changeContentNav({
                    index: 0
                });

                data.userInfo.atAll = data.userInfo.atAll || 0;
                data.userInfo.atSize = data.userInfo.atSize || 0;

                // 边界值控制
                data.userInfo.atAll = Math.min(data.userInfo.atAll, data.userInfo.atSize);

                var p;
                if (data.userInfo.atAll === data.userInfo.atSize) {
                    p = '已完成';
                } else {
                    p = (data.userInfo.atAll / data.userInfo.atSize * 100).toFixed(2) + '%';
                }
                self.startToolInfo(p);

            } else {

                dialog.show('error', data.msg);
            }

            self.$el.style.display = 'block';

        })
    },


    // 加载签到数据
    loadSignData: function () {

        // 校验时间
        // if (!checkInTime) return;

        var checkUrl = 'checkin';

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
        }, false, HTTP_STATIC + checkUrl);

        SDW_WEB.getAjaxData(postUri, function (data) {

            var lastCheckIn = 0;

            if (data.result === 1) {

                data.list = data.list || [];  // 防止没有数据

                // flag 0 查看  1 签到
                for (var i = 0; i < data.list.length; i++) {
                    var item = data.list[i];

                    var _checkin = data.checkin;

                    if (i < _checkin) {
                        data.list[i].checkin = true;
                        lastCheckIn = item.num;
                        if (item.type === 4) {
                            item.num = item.num / 100 + '元';
                        }
                    } else {
                        data.list[i].checkin = false;
                        if (item.type === 4) {
                            item.num = '现金红包';
                        }
                    }
                }

                self.checkList = data.list;
                self.qiandaoMoney = data.redPkt;

                // 当日首次签到
                if (data.flag) {
                    self.qiandaoCheckIn = 1;
                    self.showCheckIn();
                    // 新增签到的金币
                    // indexData.userInfos.gold += lastCheckIn;
                }

                self.$nextTick(function () {
                    // 签到的小浮窗按钮
                    indexData.showQiandao = 1;
                });

            } else {

                dialog.show('error', data.msg, 1);
            }

        });

    },

    showCheckIn: function () {
        document.querySelector('#qiandao-container').style.display = 'block';
    },

    hideQiandaoMask: function () {
        document.querySelector('#qiandao-container').style.display = 'none';
    },

    eggClassObj: function (item, index) {
        return "eggs-" + item.type + "-" + item.state + " " + "egg-" + (this.egg.pos ? 5 : index + 1);
    },

    lotteryClassObj: function (pre, lottery) {
        return pre + (lottery.btnState == 'light' ? 'light' : 'normal');
    },
    lotteryClassObj2: function (lottery) {
        return lottery.btnState == 'light' ? 'node-light' : '';
    },
    lotteryClassObj3: function (lottery) {
        return "lottery-btn-" + lottery.btnState;
    }, lotteryClassObj4: function (index) {
        return "lottery-items-" + (index + 1);
    }
};

// 加载砸蛋的资源
function loadEggImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var all = 5 * 4, loadLen = 0;
    var eggs = ['yellow', 'blue', 'green', 'red'];
    eggs.forEach(function (item) {
        for (var i = 1; i < 6; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/egg-' + item + '-' + i + '.png';
            img.onload = loaded;
        }
    });

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.egg.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}

// 加载触电的资源
function loadLotteryImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var imgRes = ['blue-node', 'cl-bottom', 'cl-left', 'cl-right',
        'lottery-border-1', 'lottery-border-2', 'red-node',
        'lottery-btn-bottom', 'lottery-btn-click', 'lottery-btn-light',
        'lottery-btn-normal', 'line-blue', 'line-red'];

    var all = imgRes.length + 16, loadLen = 0;

    imgRes.forEach(function (item) {
        for (var i = 1; i < 16; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/' + item + '.png';
            img.onload = loaded;
        }
    });

    for (var i = 1; i < 16; i++) {
        var img = new Image();
        img.src = APP_ROOT + 'images/light' + i + '.png';
        img.onload = loaded;
    }

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.lottery.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}


var goodsList = ['10MB流量', '30MB流量', '100MB流量'];

function selectFrom(low, up) {
    var t = up - low + 1;
    return (Math.random() * t + low) >> 0;
}

//1820004649
function createOldUid() {
    var uid = '182****';
    uid += selectFrom(100, 999);
    return uid;
}

function createUidList(num) {

    var list = [];
    for (var i = 0; i < num; i++) {

        var uid = createOldUid();
        var goods = goodsList[selectFrom(0, goodsList.length - 1)];

        list.push('玩家 ' + uid + '，兑换了' + goods);
    }

    return list;
}

function randomNum(list, num, slice) {

    num = num || 5;
    list = list || [];
    slice = slice || list.length;

    while (num--) {

        list = list.sort(function () {
            return Math.random() - 0.5;
        });
    }

    return list.slice(0, slice);
}

function createUidListResult() {

    var randomLists = createUidList(30);
    return randomNum(randomLists, 3);

}


var _shopRoot = new Vue({
    el: '#shop-root',
    data: indexData,
    methods: methods,
    // store,
    components: {
        userInfo: userInfo,
        scrollText: scrollText,
        shopItem: shopItem,
        qianDao: qiandao,
        sdwFooter: sdwFooter,
    },

    // computed:{
    //     eggClassObj:function (item) {
    //         return {
    //             eggs-{{item.type}}-{{item.state}}
    //         }
    //     }
    // },


    mounted: function () {

        function checkMaskContainer() {

            var disable = indexData.showAlert;  // 默认的弹窗
            disable = disable || indexData.showGameContainer; // 砸蛋游戏
            disable = disable || window.oneScreen; // 砸蛋游戏
            return disable;
        }

        document.addEventListener('touchmove', function (e) {
            if (checkMaskContainer()) {
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
        }, {passive: false});
    }


});


//
// if (SDW_WEB.onShandw) {
//
//     SDW_WEB.getSdwUserData().then(function (res) {
//         // alert(JSON.stringify(res));
//
//         _shopRoot.user.avatar = SDW_WEB.USER_INFO.avatar || 'http://www.shandw.com/pc/images/mandef.png';
//         _shopRoot.user.uid = SDW_WEB.USER_INFO.uid;
//         _shopRoot.user.nick = SDW_WEB.USER_INFO.nick;
//
//         _shopRoot.myInit();
//     }, function () {
//
//         SDW_WEB.sdw.openLogin({
//             success: function () {
//
//             }
//         })
//     });
//
//     // 设置APP的底部工具栏按钮
//     // SDW_WEB.sdw.onSetToolBarOperation(['QQ', 'Timeline', 'AppMessage', 'QZone', 'Weibo']);
// } else {
//     _shopRoot.myInit();
// }


SDW_WEB.getSdwUserData().then(function (userData) {

    _shopRoot.myInit();
    // mainSetShare();
}, function (msg) {
    // 获取闪电玩用户数据失败
    if (SDW_WEB.onShandw)
        SDW_WEB.sdw.openLogin({
            success: function () {

            }
        })
});
