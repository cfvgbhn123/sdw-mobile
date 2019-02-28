/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 闪电玩首页
 *
 */

// var path = require('path');

var ActivityConfig = require('./config');

require('./index2.scss');
require('../../components/initcss.scss');
var _protocol_ = location.protocol;
var gameItem = require('../../components/mobile/game-item2/game-item2.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer-n.vue');
var loadingView = require('../../components/mobile/loading/loading.vue');
var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');
var fastLogin = require('../../components/mobile/login/login.vue');
var taskInfo = require('../../components/mobile/task-info/task-info.vue');
var taskGetAlert = require('../../components/mobile/task-get-alert/task-get-alert.vue');
var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var smallGameItem = require('../../components/mobile/small-game-item/small-game-item.vue');
var serverGameItem = require('../../components/mobile/server-game-item/server-game-item.vue');


// if (ActivityConfig.checkInType) {
//
//     var qiandao = require('../../components/mobile/qiandao-' + ActivityConfig.checkInType + '/qiandao-' + ActivityConfig.checkInType + '.vue');
//     console.log(qiandao)
//
// } else {


// 正常的签到组件

// var qiandao = require('../../components/mobile/qiandao/qiandao.vue');

// console.log('12-25', qiandao);

// console.log('nromal', qiandao);

// }


if (ActivityConfig.dropType) {
    var DropAnimation = require('./libs/DropAnimation');
}

var _cacheKey = '_drop_flag_';


var WindowScroll = require('../../libs/WindowScroll');
var ScrollDom = require('./ScrollDom');
var scrollDom, userTap = false, _dom = null;
var TransServerDate = require('../game/libs/TransServerDate');
var KDReward = require('./libs/KDReward');
var CheckServerData = require('./libs/CheckServerData');


// flag [2018-01-22 10:25:43] 车来了APP
var cheLaiLeAPP = SDW_WEB.queryParam['channel'] == '10542';

var checkInTime, checkUrl = '';

var indexData = {

    activity :ActivityConfig,
    activityType: ActivityConfig.state ? ActivityConfig.navType : '',  // 活动类型

    //toolIconType: ActivityConfig.toolIconType,  // 活动类型

    // showQiandao: false,
    // qiandaoShowMask: false,
    // qiandaoMoney: 0,
    // qiandaoCheckIn: false,

    // checkList: [],

    cheLaiLeAPP: cheLaiLeAPP,  // 隐藏下载APP按钮checkinref

    showServerPop: false,
    showBindPhoneFlag: 0,
    showBackTop: false,
    hasShowMoreNav: false,
    onAPPs: SDW_WEB.onAPPs,

    hideDownlaodApp: SDW_WEB.onShandw || (SDW_WEB.onIOS && SDW_WEB.channel == '10083') || cheLaiLeAPP || SDW_WEB.readParam('sdw_dl'),

    showSaishi: true,
    onSafari: SDW_WEB.onSafari && SDW_WEB.onIOS && !SDW_WEB.onAPPs,
    __footIndex__: null,

    showTopNav: SDW_WEB.channel != '10041',

    // 隐藏二维码入口
    showCodes: SDW_WEB.onWeiXin && !cheLaiLeAPP && !SDW_WEB.readParam('sdw_qd'),

    onShandw: SDW_WEB.onShandw,
    bindPhoneItem: {},

    fontsize: SDW_WEB.fontSize,

    showEwmV2: 0,
    user: {
        isLogin: 0,
        gold: 0,
        avatar: '',
        nick: '',
        phone: 0,
        showPhoneTips: false
    },
    // NOW_PAGE: 0,
    pageHasLoading: false,
    hotGameList: [],
    newGameList: [],

    recommendModuleList: [],
    hotGameModuleList: [],
    newGameModuleList: [],
    smallGameModuleList: [],
    thematicModuleList: [],
    newsModuleList: [],

    allGameList: [],
    allGamePage: 0,

    serverGameModuleList: [],
    bServerGameModuleList: [],

    isShowHotGame: true,
    hotGames: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    newGames: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    recommendList: [],
    bannerList: [],
    currentTaskItem: {},

    // 1 每日推荐
    // 2 爆款必玩
    // 3 专题推荐
    // 4 新游推荐
    // 5 开服模块
    // 6 资讯模块
    // 7 小游戏
    // 8 全部游戏
    sliderNavList: [],
    tapId: '',
    menuList: []
};


// 首页活动悬浮按钮
if (ActivityConfig.state) {
    require('../game/tool-icon.scss');
    var DragTouch = require('../game/DragTouch');
}


// 初始化活动小浮窗
function initToolIcon() {

    if (!ActivityConfig.state) return;

    /*新建一个拖动对象*/
    window.touch = new DragTouch({
        id: '#my-menu',
        position: '1,0.5',
        notRotate: true,
        width: 80,
        height: 90
    });
    window.touch.target.style.visibility = 'visible';


    var startPoint = null;
    var endPoint = null;

    function getPosition(e) {
        var touch = e.touches[0];
        return {
            x: touch.clientX,
            y: touch.clientY
        }
    }

    var myMenu = document.querySelector('#menu-btn');

    myMenu.addEventListener('touchstart', function (e) {
        startPoint = getPosition(e);
        startPoint.time = +new Date();
        endPoint = null;
    }, false);

    myMenu.addEventListener('touchmove', function (e) {
        endPoint = getPosition(e);
        endPoint.time = +new Date();
    }, false);

    myMenu.addEventListener('touchend', function (e) {
        endPoint = endPoint || startPoint;
        var dT = endPoint.time - startPoint.time;
        var dX = endPoint.x - startPoint.x;
        var dY = endPoint.y - startPoint.y;
        var dd = dX * dX + dY * dY;

        if (dT <= 300 && dd <= 36) {

            // 统计赛事按钮
            SDW_WEB.addCount('saishiIndex');

            // setTimeout(function () {
            //     location.href = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
            // }, 100);

            var links = ActivityConfig.activityPage+'?channel=' + SDW_WEB.channel;

            if(ActivityConfig.openState == 1){
                dialog.show('ok','敬请期待<br>新年活动将于2月2号开启哦~！',1);
                return ;
            }

           if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {
            // 跳转到活动页面
            SDW_WEB.openNewWindow({
                link: links,
                isFullScreen: false,
                showMoreBtn: true,
                // title: ActivityConfig.name
            });
            } else {
                // console.log('no login');

                // 调用登录界面
                if (SDW_WEB.onShandw) {
                    // 闪电玩登录
                    SDW_WEB.sdw.openLogin({
                        success: function () {
                        }
                    });
                } else {
                    // 普通短信登录
                    _indexView.__showLoginPage();
                }
            }

        }
    }, false);
}


var sliderNavManager = {
    displayContainer: null,
    // list: [],
    currentList: [],


    items: ['每日推荐', '必玩爆款', '专题推荐', '新游新服', '//开服模块', '闪电资讯', '小游戏', '全部游戏'],
    // items: ['每日推荐', '小游戏', '新游新服', '闪电资讯', '全部游戏'],

    initNav: function () {

        for (var i = 0; i < this.items.length; i++) {
            var _item = {
                title: this.items[i],
                id: i + 1,
                isTap: i === 0,
                show: false
            };
            this.currentList.push(_item);
        }

        // this.list = this.currentList.slice(0);
        indexData.sliderNavList = this.currentList;
    },

    /**
     * 添加导航栏（将选项显示出来）；改成添加顺序
     * @param itemIdx
     */

    addItem: function (itemIdx) {
        // var _item = this.found(itemIdx);
        // _item && (_item.show = true);
        // indexData.sliderNavList = this.currentList;

        if (!this.displayContainer) {
            this.displayContainer = document.querySelector('#display-container');
        }


        var index = parseInt(itemIdx);

        var _item = {
            title: this.items[index - 1],
            id: index,
            isTap: (index - 1) === 0,
            show: true
        };

        this.currentList.push(_item);
        // console.log(itemIdx, index, this.currentList);

        indexData.sliderNavList = this.currentList;

    },

    found: function (id) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].id == id) {
                return this.currentList[i];
            }
        }
        return false;
    }
};

// sliderNavManager.initNav();

var indexMethods = {

    transformQuantity: SDW_WEB.transformQuantity,

    gotoTopFn: function () {
        // 1表示滚动到顶部后，收起导航栏
        scrollDom && scrollDom.scrollToPos(0, '1');
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
        return m + '.' + d;
    },


    // 检查主按钮的点击状态
    menuBtnSate: function (item, index) {


        var type = ['classify', 'Competition', 'gift', 'task2'][index];

        var openObj = {};
        SDW_WEB.addCount(type);
        openObj.isFullScreen = false;
        openObj.showMoreBtn = true;
        if (index === 1) {
            // http://www.shandw.com/activities/competition/index.html
            openObj.link = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
        } else {
            openObj.link = SDW_PATH.MOBILE_ROOT + type + '/?channel=' + SDW_WEB.channel;
        }

        openObj.title = '';
        SDW_WEB.openNewWindow(openObj);
    },

    transServerDate: function (time, isPrv) {
        return TransServerDate(time, window.SERVER_TIME, isPrv);
    },

    // 加载开服的游戏
    loadServerGame: function () {

        var self = this;

        var type = self.isShowHotGame ? 0 : 1;   // 0已经开服，1预计开服   isShowHotGame(已经开服)

        var getUri = HTTP_STATIC + 'serverinfo?type=' + type;

        SDW_WEB.getAjaxData(getUri, function (data) {

            window.PAGE_TIME = data.ct;
            window.window.SERVER_TIME = data.ct;

            if (data.result === 1 && data.list && data.list.length) {

                var addType = self.isShowHotGame ? 'serverGameModuleList' : 'bServerGameModuleList';

                /**
                 * 开服游戏需要去重
                 */
                var SERVER_MAP = {};

                var endLen = Math.min(5, data.list.length);
                var j = 0;

                for (var i = 0; i < data.list.length && j < 5; i++) {

                    var item = data.list[i];

                    if (!SERVER_MAP[item.appId]) {
                        SERVER_MAP[item.appId] = 1;
                        item.serverDateStr = self.transServerDate(item.sTime, type);
                        item.serverDateStr && self[addType].push(item);
                        j++;
                    }

                }

                // 判断是否显示新服的红点
                if (addType === 'serverGameModuleList') {
                    self.showServerPop = CheckServerData(data.list);
                    // console.log(self.showServerPop);
                }

                self.$nextTick(function () {
                    scrollDom.refreshList(['1', '2', '3', '4', '5', '6', '7', '8']);
                })

            }
        });

    },

    // 加载所有的游戏
    loadAllGameList: function () {

        if (this.pageHasLoading) return;

        var self = this;
        var getUri = HTTP_STATIC + 'search?page=' + this.allGamePage;

        self.pageHasLoading = true;

        SDW_WEB.getAjaxData(getUri, function (data) {

            if (self.allGamePage === 0) {
                allGameScroll.enable = true;
            }

            if (data.result === 1) {

                if (data.list && data.list.length === 0) {
                    // 全部加载完了
                    allGameScroll.enable = false;
                }

                self.allGameList = self.allGameList.concat(data.list || []);
                self.allGamePage++;

                self.$nextTick(function () {

                    if (self.allGamePage === 1) {
                        scrollDom.refreshList(['1', '2', '3', '4', '5', '6', '7', '8']);
                        sliderNavManager.addItem('8');
                    }

                    setTimeout(function () {
                        self.pageHasLoading = false;
                    }, 300);
                });

            }

        });

    },

    // 打开新的游戏列表界面
    openMoreGameList: function (type, word, link, index) {

        var openObj = {};
        openObj.isFullScreen = false;
        openObj.showMoreBtn = true;
        if (type === 'classify') {
            openObj.link = SDW_PATH.MOBILE_ROOT + type + '/?' + word + '&channel=' + SDW_WEB.channel;
            openObj.title = '更多游戏';
        }
        if (type === 'thematic') {
            openObj.link = SDW_PATH.MOBILE_ROOT + type + '/?channel=' + SDW_WEB.channel;
            openObj.title = '专题列表';
        }
        // 跳转到专题列表
        if (type === 'thematic/start.html') {


            if (index == 0) {
                SDW_WEB.addCount('3-1');
            }
            if (/^http/.test(link)) {
                openObj.link = link;
            } else {
                openObj.link = SDW_PATH.MOBILE_ROOT + type + '?channel=' + SDW_WEB.channel + '&tid=' + word;
            }
            openObj.title = '专题列表';
        }

        if (type === 'news') {
            openObj.link = SDW_PATH.MOBILE_ROOT + type + '/?channel=' + SDW_WEB.channel;
            openObj.title = '资讯列表';
        }

        // 开服
        if (type === 'classify/server.html') {
            openObj.link = SDW_PATH.MOBILE_ROOT + type + '?channel=' + SDW_WEB.channel + '&' + word;
            openObj.title = '开服列表';
        }

        SDW_WEB.openNewWindow(openObj);
    },

    // 打开新的资讯页面
    openInformationUrl: function (url) {

        SDW_WEB.openNewWindow({
            link: url,
            isFullScreen: false,
            showMoreBtn: true,
            title: '游戏资讯'
        });
    },


    // 显示更多的导航栏信息
    showMoreNav: function () {
        this.hasShowMoreNav = !this.hasShowMoreNav;
        this.$nextTick(function () {

        })
    },

    // 变更导航栏的子项目
    changeNavItem: function (item) {

        this.showNavItem(item.id);

        SDW_WEB.addCount(item.id + '');

        if (!_dom) return;
        // 90px+20px    180px+20px  [data-nav="slider"]

        var offset = _dom.offsetHeight;
        userTap = true;
        scrollDom && scrollDom.scrollToIndex(item.id, offset);


    },

    // 显示对应的选中标签样式
    showNavItem: function (id) {

        if (userTap) return;

        var currentInd = -1;

        for (var i = 0; i < this.sliderNavList.length; i++) {
            if (this.sliderNavList[i].id == id) {
                currentInd = i;
                this.sliderNavList[i].isTap = true;
                this.tapId = id;
            } else {
                this.sliderNavList[i].isTap = false;
            }
        }


        // 新服模块
        if (id == '4') {
            this.showServerPop = false;
        }

        // 在区间内才会移动
        if (this.hasShowMoreNav) {
            sliderNavManager.displayContainer.style.transition = '0s';
            sliderNavManager.displayContainer.style.webkitTransition = '0s';
        } else {
            var slidPos = (currentInd - 3) * 25;
            if (slidPos < 0) slidPos = 0;
            var styles = 'translateX(-' + slidPos + '%)';
            sliderNavManager.displayContainer.style.transition = '.22s';
            sliderNavManager.displayContainer.style.webkitTransition = '.22s';
            sliderNavManager.displayContainer.style.webkitTransform = styles;
            sliderNavManager.displayContainer.style.transform = styles;
        }

        // // 变更
        this.$nextTick(function () {

        })
    },

    computedQcode: function () {

        // 只在微信中显示二维码，并且channel大于9000000
        if (!SDW_WEB.onWeiXin || SDW_WEB.channel < 9000000) {
            this.showEwmV2 = false;
            return;
        }

        function isToday(old, date) {

            old = parseInt(old) || 0;
            date = parseInt(date) || 0;

            var oldDate = new Date(old), nowDate = new Date(date);

            return oldDate.getFullYear() == nowDate.getFullYear() &&
                oldDate.getMonth() == nowDate.getMonth() &&
                oldDate.getDate() == nowDate.getDate();
        }


        var localDate = SDW_WEB.Store.get('_qCode', true);
        localDate = localDate || 0;
        var nowDate = +new Date();

        // 只显示当天的
        if (!isToday(localDate, nowDate)) {

            SDW_WEB.Store.set('_qCode', nowDate, true);
            this.showEwmV2 = true;

        } else {
            this.showEwmV2 = false;
        }

    },

    downloadSdwApp: function () {

        // 下载闪电玩APP
        location.href = 'http://dhurl.cn/iE7Rv2';

    },

    gotoSDWWEIXIN: function () {
        // alert(SDW_WEB.SDW_WEIXIN_URL)
        location.href = SDW_WEB.SDW_WEIXIN_URL;
    },

    // 跳转到我的任务界面
    gotoTaskPage: function () {

        this.$refs.taskgetalert.showInfo = 0;
        this.user.phone = 0;

        if (SDW_WEB.onShandw) {

            SDW_WEB.sdw.switchTab('task');
            return;
        }


        location.href = SDW_PATH.MOBILE_ROOT + 'task/?channel=' + SDW_WEB.channel + '&v=' + SDW_WEB.version;
    },

    /**
     * 去我的首页
     */
    gotoMyHome: function () {

        if (SDW_WEB.USER_INFO.uid) {

            SDW_WEB.onShandw ? (SDW_WEB.sdw.switchTab('home')) : (location.href = SDW_PATH.MOBILE_ROOT + 'home/?channel=' + SDW_WEB.channel + '&v=' + SDW_WEB.version);

        } else {

            SDW_WEB.onShandw ? (SDW_WEB.sdw.openLogin({
                success: function () {
                    // SDW_WEB.sdw.switchTab('home');
                }
            })) : (this.__showLoginPage());
        }
    },

    // 显示APP的底部工具栏
    showSdwAPPMoreBtn: function () {

        SDW_WEB.addCount('m-share');
        SDW_WEB.onShandw && SDW_WEB.sdw.onShowToolBar();
    },

    // 跳转到礼包的界面
    gotoGiftPage: function () {

        var targetUrl = SDW_PATH.MOBILE_ROOT + 'gift/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: '游戏礼包'
        });

    },

    // 跳转到搜索页面
    gotoSearchPage: function () {

        var targetUrl = SDW_PATH.MOBILE_ROOT + 'classify/search.html?channel=' + SDW_WEB.channel;

        SDW_WEB.addCount('m-search');

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: '搜索'
        });

    },


    // 显示绑定手机的界面
    showPhoneBindFn: function () {

        var self = this;
        this.user.showPhoneTips = 0;
        clearInterval(window.bindPhoneTimer);

        setTimeout(function () {
            self.$refs.bindPhone.showbind = 1;
            self.showBindPhoneFlag = 1;
        }, 20);

    },

    // 转换金币
    transCoins: function (coin) {
        var big, small;

        if (coin < 10000) return coin;

        if (coin < 100000000) {
            big = coin / 10000 >> 0;
            small = (coin % 10000) + '';

            if (small == 0) {
                return big + '万';
            }

            return big + '.' + small[0] + '万';
        }

        if (coin < 10000000000) {
            big = coin / 100000000 >> 0;
            small = (coin % 100000000) + '';

            if (small == 0) {
                return big + '亿';
            }

            return big + '.' + small[0] + '亿';
        }
    },

    /**
     * 转换时间
     * @param date
     */
    transDate: function (date) {


        if (!date) return null;

        var NOW_TIME = window.PAGE_TIME;

        // console.log(date, NOW_TIME, date - NOW_TIME);

        var obj = new Date(date), dT = NOW_TIME - date,
            year = obj.getFullYear(), month = obj.getMonth() + 1,
            day = obj.getDate();

        if (dT < 24 * 60 * 60 * 1000) {

            // 显示时间形式   25秒前  |  16分钟前  |  1小时前
            if (dT < 60 * 60 * 1000) {

                if (dT < 1000 * 10) return '刚刚开服';

                if (dT < 60 * 1000) return '已开服' + (dT / 1000 >> 0) + '秒';

                return '已开服' + (dT / (60 * 1000) >> 0) + '分钟';

            }

            return '已开服' + (dT / (60 * 60 * 1000) >> 0) + '小时';
        }

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return '开服:' + month + '.' + day;
    },

    // 变更游戏的显示  1已经开新服  0新服预告
    changeGameListState: function (isHot) {

        this.isShowHotGame = isHot;


        // 加载初始的新服预告
        if (isHot === 0 && this.bServerGameModuleList.length === 0) {

            this.loadServerGame();

        } else {
            // 重新刷新定位
            this.$nextTick(function () {
                scrollDom && scrollDom.refreshList(['1', '2', '3', '4', '5', '6', '7', '8']);
            });
        }
    },

    // 点击到游戏，需要进行用户登录状态的检测
    // APP（微信，微博，QQ）内是要求强制登录的
    checkGameSate: function (type, id, item, btnCount) {
        if (btnCount) {
            SDW_WEB.addCount(btnCount);
        }
        var hasLogin = SDW_WEB.USER_INFO.uid;
        // 获取游戏地址
        var targetUrl = SDW_PATH.GAME_URL(type, id);

        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: '',
        };

        if (type === 'play') {

            // 玩游戏
            if (hasLogin) {
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

    __showLoginPage: function (index) {
        // 普通短信登录
        this.$refs.login.show = '1';
        this.__footIndex__ = index;
    },

    // 登录成功的回调
    loginOkCallback: function () {

        // 需要重新刷新用户信息
        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + (SDW_WEB.channel === '10041' ? 'hts10041' : 'pltmain'));

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1 && SDW_WEB.channel != '10041') {
                self.user.avatar = data.avatar;
                self.user.gold = data.gold || 0;
                self.bindPhoneItem = data.phoneTask;
                self.currentTaskItem = data.phoneTask;
                self.user.phone = data.phone;
                self.user.isLogin = 1;

                // self.currentTaskItem.title = '绑定手机成功';
                self.currentTaskItem.info = '新的成就已经解锁，请前往成就领取奖励';
            }

            // 我最近玩的
            self.recommendList = self.createRecommend(data);
            self.user.showPhoneTips = !data.phone;

            // 默认10秒隐藏
            window.bindPhoneTimer = setTimeout(function () {
                self.user.showPhoneTips = 0;
            }, 10 * 1000);

            function toolWindowFn(e) {
                window.bindPhoneTimer && clearTimeout(window.bindPhoneTimer);

                window.bindPhoneTimer = setTimeout(function () {
                    self.user.showPhoneTips = false;
                }, 3 * 1000);

                document.removeEventListener('touchstart', toolWindowFn, false);
            }

            // 点击任意位置，3秒钟悬浮窗消失
            document.addEventListener('touchstart', toolWindowFn, false);

            self.$nextTick(function () {
                var aImages = document.querySelectorAll('img[data-loaded="0"]');
                loadImg(aImages);

                scrollDom && scrollDom.refreshList()
            });

            self.$refs.login.show = '';
            dialog.show('ok', '登录成功', 1);


            // 需要进行签到
            // self.loadSignData();

            // flag [2017-12-18 16:02:59] 需要进行悬浮窗的数据请求
            if (ActivityConfig.toolIconType) {
                _indexView.loadActivityToolInfo();
            }
        });

    },

    // 加载最新的游戏列表
    loadNewGameList: function () {
        if (this.newGames.isLoad || !this.newGames.hasMoreData) return;
        this.newGames.isLoad = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            page: this.newGames.page,
            type: '',
            flag: 1
        }, false, HTTP_STATIC + 'pcgg');

        // this.pageHasLoading = true;

        // 请求数据
        SDW_WEB.getAjaxData(postUri, function (data) {
            // self.pageHasLoading = false;

            if (data.result == 1) {

                self.newGames.page++;

                if (data.list.length == 0) {
                    self.newGames.hasMoreData = false;
                }

                var gameList = data.list, _hotList = [];

                for (var i = 0; i < gameList.length; i++) {
                    var item = gameList[i];
                    _hotList.push({
                        id: item.id,
                        cover: item.bIcon,
                        title: item.name,
                        time: item.time,
                        star: item.vStar,
                        quantity: item.vPv,
                        desc: item.sInfo,
                        tags: item.gift ? ['gift'] : [],
                        url: item.url
                    })
                }

                self.newGameList = self.newGameList.concat(_hotList);
            }

            self.$nextTick(function () {

                loadDelayImg();

                setTimeout(function () {
                    self.newGames.isLoad = false;
                }, 300);
            })
        });
    },

    // 轮播图的点击
    clickBannerEvt: function (index) {

        // 轮播有不同的状态，具体跳转什么有个定义的值
        if (this.bannerList[index].url) {

            // 读取轮播上的跳转地址
            var links = this.bannerList[index].url;

            if (links.indexOf('?') === -1) {
                links += '?channel=' + SDW_WEB.channel;
            } else {
                links += '&channel=' + SDW_WEB.channel;
            }

            // 打开玩游戏的界面
            SDW_WEB.openNewWindow({
                link: links,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

        } else {

            this.checkGameSate('play', this.bannerList[index].id);
        }

    },

    // 返回最近玩过的4款游戏
    createRecommend: function (data) {
        var recent = data.recent || [];
        return recent.splice(0, 4);
    },

    sliceDataList: function (list, length) {
        var recent = list || [];
        recent[0].tags = this.cTags(recent[0]);
        return recent.splice(0, length);
    },

    // 检测赛事状态
    checkSaishi: function () {

        var hasLogin = SDW_WEB.USER_INFO.uid;

        // 玩游戏
        if (hasLogin) {

            // 打开赛事的链接
            SDW_WEB.openNewWindow({
                link: _protocol_ + '//www.shandw.com/Competition/?channel=' + SDW_WEB.channel,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

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

    },

    createBanner: function (data) {

        var banner = data.ad || [];

        var TEMP_HTML = '<img data-src=D_IMG class="swiper-slide slider-img" data-index=D_INDEX data-loaded="5">';

        var allInners = '';
        banner.forEach(function (item, index) {

            if (SDW_WEB.channel == '10041') {
                var inners = TEMP_HTML.replace(/D_IMG/, item['670x280']).replace(/D_INDEX/, index);
            } else {
                var inners = TEMP_HTML.replace(/D_IMG/, item.adImg).replace(/D_INDEX/, index);
            }

            allInners += inners;
        });

        document.querySelector('#bannercont').innerHTML = allInners;
        return banner;
    },

    // 绑定手机的回调
    bindPhoneCallback: function () {

        this.$refs.taskgetalert.showInfo = 1;
        this.$refs.bindPhone.showbind = 0;
        this.showBindPhoneFlag = 0;

    },

    // 更多的界面
    goMorePage: function () {

        var targetUrl = SDW_PATH.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: ''
        });

    },


    // 加载活动悬浮框的数据
    loadActivityToolInfo: function () {

        var self = this;

        if (!SDW_WEB.USER_INFO.uid) {
            self.eggInfo.state = 'normal';
            window.touch.target.style.visibility = 'visible';
            return;
        }
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
        }, false, ActivityConfig.toolInfoUrl);

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {

                if (!data.data) {
                    // 没有任何蛋
                    self.eggInfo.state = 'normal';

                } else {


                    // self.eggInfo.baseTime = data.ct;

                    var eggData = data.data;
                    // 0待孵化，1倒计时，2已经孵化完成。
                    if (eggData.flag === 0) {

                        self.eggInfo.state = 'normal';
                    } else if (eggData.flag === 1) {

                        self.eggInfo.setBaseTime(data.ct);

                        self.eggInfo.startTimer(eggData.endtime);

                    } else if (eggData.flag === 2) {

                        self.eggInfo.state = 'finish';
                    }

                }

                window.touch.target.style.visibility = 'visible';
            }
        })

    },

    /**
     * 加载资讯
     */
    loadNewsDate: function () {

        if (cheLaiLeAPP) return;  // 车来了APP不加载资讯模块


        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            t: 1,
            page: 0,
        }, false, HTTP_STATIC + 'bbsget');


        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {

                if (data.list && data.list.length) {

                    var endLen = Math.min(5, data.list.length);
                    var resList = [];

                    var clsMap = {
                        '攻略': 'purple-tag-l',
                        '公告': 'green-tag-l',
                        '活动': 'orange-tag-l',
                        '资讯': 'blue-tag-l',
                    };

                    for (var i = 0; i < endLen; i++) {
                        data.list[i].mcls = clsMap[data.list[i].type] || 'green-tag-l';
                        resList.push(data.list[i]);
                    }

                    self.newsModuleList = resList;

                    self.$nextTick(function () {
                        scrollDom.refreshList(['1', '2', '3', '4', '5', '6', '7', '8']);
                        sliderNavManager.addItem('6');
                    })

                } else {


                    // self.$nextTick(function () {
                    //     scrollDom.refreshList(['1', '2', '3', '4', '5', '7', '8']);
                    // })
                }


            } else {
                dialog.show('error', data.msg, 1);
            }
        });

    },


    cTags: function (item) {

        var res = [], _tags = item.tip.split(',');

        // 大标签的样式对应
        var colorMap = {
            '热门': 'g-l-5',
            '精品': 'g-l-3',
            '礼包': 'g-l-4',
            '最新': 'g-l-1',
            '独家': 'g-l-2',
            '首发': 'g-l-6',
            '删档': 'g-l-7',
            '限号': 'g-l-8',
            '封测': 'g-l-9',
        };

        if (item.gift) {
            res.push({
                type: '礼包',
                cl: 'g-l-4'
            });
        }

        for (var i = 0; i < _tags.length; i++) {
            res.push({
                type: _tags[i],
                cl: colorMap[_tags[i]]
            });
        }

        return res;
    },

    // 获取主页数据 包括第一个游戏列表
    loadMainData: function () {

        if (this.hotGames.isLoad || !this.hotGames.hasMoreData) return;
        this.hotGames.isLoad = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + (SDW_WEB.channel === '10041' ? 'hts10041' : 'pltmain'));

        // this.pageHasLoading = true;

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {
                // var now = data.ciTime || (+new Date());
                // checkInTime = (data.ciETime >= now) && (data.ciSTime <= now);

                // if (typeof data.checkinex !== 'undefined') {
                //     checkUrl = 'decheckin';
                // } else {
                // checkUrl = 'checkin';
                // }

                // self.loadSignData();  // 立马签到23
            }

            // =========================================================================================================
            // 首次加载
            // =========================================================================================================

            // flag [2017-12-15 11:08:43] 如果有活动，需要替换相应的素材

            // if (ActivityConfig.menuType && activityOpenFlag) {
            //     for (var i = 0; i < data.menu.length; i++) {
            //         data.menu[i].icon = 'images/' + ActivityConfig.menuType + '-' + (i + 1) + '.png';
            //     }
            // }

            /*如果是活动期间，需要变更icon*/

            if (ActivityConfig.menuType && activityOpenFlag) {
                for (var i = 0; i < data.menu.length; i++) {
                    data.menu[i].acIcon = ActivityConfig.menuType + '-' + i;
                }
            }

            self.menuList = data.menu;

            if (data.result == 1 && SDW_WEB.channel != '10041') {

                self.user.avatar = data.avatar;
                self.user.gold = data.gold || 0;
                self.bindPhoneItem = data.phoneTask;
                self.currentTaskItem = data.phoneTask;
                self.user.phone = data.phone;
                self.user.isLogin = 1;

                // self.currentTaskItem.title = '绑定手机成功';
                self.currentTaskItem.info = '新的成就已经解锁，请前往成就领取奖励';

            }

            // 我最近玩的
            self.recommendList = self.createRecommend(data);
            // 轮播
            self.bannerList = self.createBanner(data);
            self.user.showPhoneTips = !data.phone;

            var ListTags = [];

            // var ListTagsMap = {
            //     '1':'recommand',
            //     '2':'hot',
            //     '3':'thematic',
            //     '4':'last',
            //     '2':'hot',
            // }

            // 获取每日推荐 --- 1
            if (data.recommand && data.recommand.length) {
                self.recommendModuleList = data.recommand;
                ListTags.push('1');
            }

            // 小游戏 --- 7
            if (data.small && data.small.length) {
                // self.smallGameModuleList = self.sliceDataList(data.small, 5);
                self.smallGameModuleList = data.small;
                ListTags.push('7');
            }


            // // 获取爆款必玩 --- 2
            // if (data.hot && data.hot.length) {
            //     self.hotGameModuleList = self.sliceDataList(data.hot, 6);
            //     ListTags.push('2');
            // }


            // 专题推荐 --- 3
            // if (data.thematic && data.thematic.length) {
            //     self.thematicModuleList = data.thematic;
            //     ListTags.push('3');
            // }


            // 新游推荐 --- 4
            if (data.last && data.last.length) {
                self.newGameModuleList = self.sliceDataList(data.last, 6);
            }

            ListTags.push('4');


            // 默认10秒隐藏
            window.bindPhoneTimer = setTimeout(function () {
                self.user.showPhoneTips = 0;
            }, 10 * 1000);

            function toolWindowFn(e) {
                window.bindPhoneTimer && clearTimeout(window.bindPhoneTimer);

                window.bindPhoneTimer = setTimeout(function () {
                    self.user.showPhoneTips = false;
                }, 3 * 1000);

                document.removeEventListener('touchstart', toolWindowFn, false);
            }

            // 点击任意位置，3秒钟悬浮窗消失
            document.addEventListener('touchstart', toolWindowFn, false);

            swiper = new Swiper('.banner-conatiner', {
                pagination: '.swiper-pagination',
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                loop: true,
                autoplay: 5000,
                autoplayDisableOnInteraction: false,
                coverflow: {
                    rotate: 45,
                    stretch: 0,
                    depth: 145,
                    modifier: 1,
                    slideShadows: true
                }
            });

            if (self.bannerList.length) {
                var imgSrc = SDW_WEB.channel == '10041' ? self.bannerList[0]['670x280'] : self.bannerList[0].adImg;
                document.querySelector('#topBanner').src = imgSrc;
            }


            if (ActivityConfig.dropType && self.checkDropDate() && activityOpenFlag) {

                swiper && swiper.stopAutoplay();


            } else {

                document.addEventListener('touchstart', function (e) {
                    swiper && swiper.update(true);
                    swiper && swiper.startAutoplay();
                }, false);

            }

            // 初始化活动的相关内容
            self._initToolIcon();

            self.$nextTick(function () {

                var aImages = document.querySelectorAll('img[data-loaded="0"]');
                loadImg(aImages);

                setTimeout(function () {
                    var aImages2 = document.querySelectorAll('img[data-loaded="5"]');
                    loadImg(aImages2, true);
                    var bannerImg = document.querySelectorAll('.slider-img');
                    for (var i = 0; i < bannerImg.length; i++) {
                        // 轮播图的点击事件
                        bannerImg[i].onclick = function () {
                            self.clickBannerEvt(this.dataset.index)
                        }
                    }
                }, 200);


                _dom = document.querySelector('[data-nav="slider"]');

                // 初始化导航滚动的实例
                scrollDom = new ScrollDom({
                    list: ['1', '2', '3', '4', '5', '6', '7', '8'],
                    /**
                     * 滚动动画的回调函数
                     * @param index
                     * @param value
                     * @param end
                     */
                    callback: function (index, value, end) {
                        if (end) {
                            userTap = false;
                            if (index == '1') {
                                self.hasShowMoreNav = false;
                                self.$nextTick(function () {
                                });
                            }
                        }
                    }
                });


                // 初始化滚动的事件
                addScrollFn(self);

                for (var i = 0; i < ListTags.length; i++) {
                    sliderNavManager.addItem(ListTags[i]);
                }


                // 加载开服的
                setTimeout(function () {
                    _indexView.loadServerGame();
                }, 100);


                // 加载资讯
                setTimeout(function () {
                    _indexView.loadNewsDate();
                }, 300);


                // 加载全部的游戏
                setTimeout(function () {
                    _indexView.loadAllGameList();
                }, 500);

            });
        })

    },

    checkDropDate: function () {

        // function checkDate() {
        // return true;
        var cacheDate = SDW_WEB.Store.get(_cacheKey, true);
        var oNowDate = new Date();
        if (cacheDate) {
            var oCacheDate = new Date(cacheDate);
            return !(oCacheDate.getFullYear() === oNowDate.getFullYear() &&
                oCacheDate.getMonth() === oNowDate.getMonth() &&
                oCacheDate.getDate() === oNowDate.getDate());
        }
        return true;
        // }

    },


    _initToolIcon: function () {

        var drop;

        // 节日礼物掉落
        if (ActivityConfig.dropType && this.checkDropDate() && activityOpenFlag) {

            SDW_WEB.Store.set(_cacheKey, +new Date(), true);

            var app = document.querySelector('#app');

            ActivityConfig.dropType.startCallback = function () {
                app.style.transition = '0.5s';
                app.style.opacity = 0.45;
                _sliderTimerInterval = 1000;
            };

            ActivityConfig.dropType.endCallback = function () {
                app.style.opacity = 1;
                drop = null;

                // 开启自动轮播
                swiper && swiper.startAutoplay();

                document.addEventListener('touchstart', function (e) {
                    swiper && swiper.update(true);
                    swiper && swiper.startAutoplay();
                }, false);

                // 开启活动小浮窗按钮
                initToolIcon();
                _sliderTimerInterval = 50;
                DropAnimation = null;

            };


            /*对于安卓机子，只截取前5个*/
            if (SDW_WEB.onAndriod) {
                var max = Math.min(ActivityConfig.dropType.textures.length, 5);
                ActivityConfig.dropType.textures = ActivityConfig.dropType.textures.splice(0, max);

                // console.log(ActivityConfig.dropType.textures)
            }

            ActivityConfig.dropType.textures.sort(function () {
                return Math.random() > 0.5;
            });

            // 根据手机不同，掉落的数量有所差异
            ActivityConfig.dropType.num = SDW_WEB.onAndriod ? 5 : 12;

            // 实例化掉落的动画
            setTimeout(function () {
                drop = new DropAnimation(ActivityConfig.dropType);
            }, 500);


        } else if (ActivityConfig.toolIconType) {

            // 初始化小浮窗按钮
            initToolIcon();
        }

    },

    // 检查签到的情况
    showCheckIn: function () {
        document.querySelector('#qiandao-container').style.display = 'block';
    },


    // 加载签到数据
    // loadSignData: function () {
    //
    //     // 车来了APP不进行签到
    //     if (cheLaiLeAPP) return;
    //
    //     // 校验时间
    //     if (!checkInTime) return;
    //
    //     var self = this;
    //     var postUri = SDW_WEB.URLS.addParam({
    //         channel: SDW_WEB.channel,
    //         uid: SDW_WEB.USER_INFO.uid,
    //         token: SDW_WEB.USER_INFO.token,
    //         sec: SDW_WEB.USER_INFO.secheme,
    //     }, false, HTTP_STATIC + checkUrl);
    //
    //     SDW_WEB.getAjaxData(postUri, function (data) {
    //
    //         var lastCheckIn = 0;
    //
    //         if (data.result === 1) {
    //
    //             data.list = data.list || [];  // 防止没有数据
    //
    //             // flag 0 查看  1 签到
    //             for (var i = 0; i < data.list.length; i++) {
    //                 var item = data.list[i];
    //
    //                 // 显示圣诞的文案
    //                 if (item.type === 6) {
    //                     item.num = '铜银金'.charAt(item.quality - 1) + '蛋1个';
    //                 }
    //
    //                 var _checkin = data.checkin;
    //                 // var _checkin = data.checkinex;
    //
    //                 if (i < _checkin) {
    //                     data.list[i].checkin = true;
    //                     lastCheckIn = item.num;
    //
    //                     if (item.type === 4) {
    //                         item.num = item.num / 100 + '元';
    //                     }
    //                 } else {
    //
    //                     data.list[i].checkin = false;
    //                     if (item.type === 4) {
    //                         item.num = '现金红包';
    //                     }
    //                 }
    //             }
    //
    //             self.checkList = data.list;
    //             self.qiandaoMoney = data.redPkt;
    //
    //             // 当日首次签到
    //             if (data.flag) {
    //                 self.qiandaoCheckIn = 1;
    //                 self.showCheckIn();
    //                 // 新增签到的金币
    //                 indexData.user.gold += lastCheckIn;
    //             }
    //
    //             self.$nextTick(function () {
    //                 // 签到的小浮窗按钮
    //                 indexData.showQiandao = 1;
    //             });
    //
    //         } else {
    //
    //             dialog.show('error', data.msg, 1);
    //         }
    //
    //     });
    //
    // },
    //
    // hideQiandaoMask: function () {
    //
    //     document.querySelector('#qiandao-container').style.display = 'none';
    //     // this.qiandaoShowMask = false;
    //     // this.$refs.checkinref.showmask = false;
    //
    // },
};

window.scrollForbFn = function (e) {
    e.preventDefault();
};


var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        gameItem: gameItem,
        sdwFooter: sdwFooter,
        loadingView: loadingView,
        bindPhone: bindPhone,
        fastLogin: fastLogin,
        taskInfo: taskInfo,
        taskGetAlert: taskGetAlert,
        longGameItem: longGameItem,
        smallGameItem: smallGameItem,
        serverGameItem: serverGameItem,
        // qiandao: qiandao,
    }, watch: {
        hasShowMoreNav: function (_nV, oV) {

            if (_nV) {
                sliderNavManager.displayContainer.style.transition = '0s';
                sliderNavManager.displayContainer.style.webkitTransition = '0s';
                sliderNavManager.displayContainer.style.webkitTransform = 'translateX(0)';
                sliderNavManager.displayContainer.style.transform = 'translateX(0)';
            } else {

            }

        }
    }
});

_indexView.$nextTick(function () {
    document.querySelector('body').style.display = 'block';
});


loadDelayImg();

// 图片懒加载
var imgScroll = new WindowScroll(loadDelayImg);

function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}

function loadImg(arr, not) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].getBoundingClientRect().top < document.documentElement.clientHeight && !arr[i].isLoad) {
            arr[i].isLoad = true;
            arr[i].dataset.loaded = '1';
            !not && (arr[i].style.cssText = "transition: ''; opacity: 0;");
            aftLoadImg(arr[i], arr[i].dataset.src, not);
        }
    }
}

function aftLoadImg(obj, url, not) {
    if (!url) return;
    var oImg = new Image();
    oImg.onload = function () {
        obj.src = oImg.src;
        !not && (obj.style.cssText = "transition: 1s; opacity: 1;");
        var parentNode = obj.parentNode;
        if (parentNode && (hasClass(parentNode, 'game-cover-info') || hasClass(parentNode, 'recommend-list'))) {

            parentNode.style.transition = '.4s';
            parentNode.style.background = 'rgba(0,0,0,0)';
        }
    };
    oImg.src = url;

    function hasClass(node, className) {
        return node.classList.contains(className);
    }
}

// 加载更多

var allGameScroll = new WindowScroll(function () {
    _indexView.loadAllGameList();
}, true, 200, 5);

allGameScroll.enable = false;

// if (SDW_WEB.onShandw) {

// 获取闪电玩的用户信息，成功后进行数据加载
// alert('hkj' + SDW_WEB.onMDZZHelper)

SDW_WEB.getSdwUserData().then(function (userData) {

    _indexView.loadMainData();
    // mainSetShare();
}, function (msg) {
    // 获取闪电玩用户数据失败
    SDW_WEB.USER_INFO = {};
    _indexView.loadMainData();
    // mainSetShare();
});

if (SDW_WEB.onShandw) {
    SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo', 'copyLink']);
}

// 设置APP的底部工具栏按钮
// SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo', 'copyLink']);

// } else {
//
//     // 加载首页数据
//     _indexView.loadMainData();
//     // mainSetShare();
// }

// 初始化
_indexView.$nextTick(function () {

    var goBackBtn = document.querySelector('#goBackBtn');
    if (SDW_WEB.onShandw) {
        goBackBtn.style.bottom = '1rem';
    }

    var hasShowSB = SDW_WEB.Store.get('_SB_CIGARETTE_FLAG_', true);

    // 计算是否显示二维码
    _indexView.computedQcode();

    if (SDW_WEB.channel == '10041') {

        if (!hasShowSB) {

            SDW_WEB.Store.set('_SB_CIGARETTE_FLAG_', 1, true);

            var ifm = document.createElement('iframe');
            ifm.src = location.protocol + '//www.shandw.com/h5/cigarette/dialog.html?v=' + SDW_WEB.version;
            ifm.id = 'sbmh';
            document.body.appendChild(ifm);

            window.addEventListener('message', function (e) {
                try {
                    postData = JSON.parse(e.data);

                    // 关闭手册
                    if (postData.oprate == 'closeIframe') {
                        var ifm = document.querySelector('#sbmh');
                        if (ifm) document.body.removeChild(ifm);
                    }

                    // 跳转到首页
                    if (postData.oprate == 'goBack') {
                        location.href = _protocol_ + '//www.shandw.com/h5/cigarette/?v=' + SDW_WEB.version;
                    }

                } catch (e) {

                }
            }, false);
        }

        document.querySelector('.top-split-line').style.marginBottom = '.625rem';
    }

});


var _sliderTimerInterval = 50;

function addScrollFn(view) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    document.documentElement.scrollTop = document.body.scrollTop = 0;

    var sliderNavLists, sliderTop, sliderNavDom, goBackBtn = document.querySelector('#goBackBtn');
    var nowIdx = null;
    var sliderNavDomHasFixed = false;
    var goBackBtnHasHidden = false;


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
                sliderNavDom.className = 'slider-nav slider-nav-fixed';
            }
        } else {
            if (sliderNavDomHasFixed) {
                sliderNavDomHasFixed = false;
                sliderNavDom.className = 'slider-nav slider-nav-normal';
            }
        }

        // 快抵达到顶部，收起【返回顶部】
        if (scrollTop <= 10) {
            if (!goBackBtnHasHidden) {
                goBackBtnHasHidden = true;
                goBackBtn.style.display = 'none';
            }
        } else {
            if (goBackBtnHasHidden) {
                goBackBtnHasHidden = false;
                goBackBtn.style.display = 'block';
            }
        }

        // 需要实时判断定位导航栏的位置 ，点击tap的时候，就不要计算了
        if (_dom && !userTap) {

            var offset = _dom.offsetHeight;

            for (var i = view.sliderNavList.length - 1; i >= 0; i--) {
                var item = view.sliderNavList[i];

                var differTop = scrollDom.scrollListPos[item.id] - offset <= scrollTop;

                if (scrollTop && scrollDom.scrollListPos[item.id] && differTop) {

                    // 只是在发生需要变更的时候进行更新
                    if (nowIdx !== item.id) {
                        nowIdx = item.id;
                        view.showNavItem(nowIdx);
                    }
                    break;
                }
            }
        }
    };


    setTimeout(function () {
        sliderNavLists = document.querySelector('.slider-nav-lists');
        sliderTop = sliderNavLists.getBoundingClientRect().top || sliderNavLists.offsetTop;
        sliderNavDom = document.querySelector('.slider-nav');
        window.requestAnimationFrame(sliderFn);
    }, 20);

}

// 发送奖励的请求
KDReward();

// 请求广播弹窗
// console.log('getBroadCastData')
SDW_WEB.getBroadCastData && SDW_WEB.getBroadCastData();






