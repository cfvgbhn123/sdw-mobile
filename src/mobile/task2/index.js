require('./index.scss');
// require('../../components/mobile/bind-phone/bind-phone.scss');
var APP_ROOT = "https://www.shandw.com/mobile/shop/";

require('../../components/initcss.scss');

// import Vuex from 'vuex'
// import store from './vuex/store'

var userInfo = require('../shop2/template/user-info/user-info.vue');
var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');


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

// var HTTP_STATIC = 'http://192.168.218.117:9061/';
// var HTTP_USER_STATIC = 'http://192.168.218.117:9060/';

var indexData = {

    totalTaskFlag: 0,

    bindPhoneItem: {},

    scrollView: null,
    loading: false,

    showAlert: false,
    showAlertDay: false,

    /*用户信息*/
    userInfos: {},

    showIndex: 0,

    // 内容导航
    contentNav: [
        {
            title: '每日任务',
            index: 0,
            show: false,
            page: 0,
            method: 'dailytasklt'
        },
        {
            title: '成就任务',
            index: 1,
            show: false,
            page: 0,
            method: 'achitasklt'
        },
    ],

    dayList: [], // 每日任务
    tList: [], // 成就任务

    alertDayInfo: {},

    cTaskListMap: {},  // 成就系列映射表

    /*单个成就*/
    alertItemInfo: {
        current: {},
        list: []
    },

    showBindPhoneFlag: 0,
};

var methods = {

    // 显示绑定手机的界面
    showPhoneBindFn: function () {
        this.$refs.bindPhone.showbind = 1;
        this.showBindPhoneFlag = 1;
    },

    // 绑定手机的回调
    bindPhoneCallback: function () {
        this.$refs.bindPhone.showbind = 0;
        this.showBindPhoneFlag = 0;
        // 绑定成功，立刻领取奖励
        this.bindPhoneItem.flag = 1;
        this.checkDayTaskItem(this.bindPhoneItem);
    },

    myInit: function () {
        var self = this;
        // window.onload = function () {
        setTimeout(function () {
            // alert('hjkhk');

            self.switchNavList({
                index: 0,
            });
        }, 0)
        // };
    },
    forbidden: function (e) {
        e.preventDefault();
    },

    switchNavList: function (item) {
        // alert('switchNavList');
        for (var i = 0; i < this.contentNav.length; i++) {
            var _item = this.contentNav[i];
            if (item.index == _item.index) {
                _item.show = true;
                this.showIndex = item.index;

                if (_item.page === 0) {
                    /*加载数据*/
                    // console.log('loading')
                    this.getTaskListInfo(_item);
                }
            } else {
                _item.show = false;
            }
        }
    },

    getFinishTask: function (item) {

        if (this.loading) return;
        this.loading = true;

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            tid: item._id,
        }, false, HTTP_STATIC + 'taskaw');

        dialog.show('loading', '领取中...');

        SDW_WEB.getAjaxData(postUri, function (data) {

            self.loading = false;
            // self.userInfos.gold = data.userInfo.gold;
            // self.userInfos.stamp = data.userInfo.stamp;
            if (data.result === 1) {
                dialog.show('ok', '领取成功', 1);
                /*数据重新请求*/
                self.updateList();

            } else {

                dialog.show('error', data.msg, 1);
            }
        })

    },

    updateList: function () {

        if (this.showIndex === 0) {
            this.dayList = [];
        } else if (this.showIndex === 1) {
            this.tList = [];
            this.cTaskListMap = {};
        }
        this.contentNav[this.showIndex].page = 0;
        this.getTaskListInfo(this.contentNav[this.showIndex], true);

    },

    getTaskListInfo: function (item, update) {

        if (this.loading) return;
        this.loading = true;

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            page: item.page++
        }, false, HTTP_STATIC + item.method);

        if (!update)
            dialog.show('loading', '数据加载中...');

        SDW_WEB.getAjaxData(postUri, function (data) {

            self.loading = false;
            self.userInfos = data.userInfo;

            if (data.result === 1) {
                if (item.method === 'dailytasklt') {
                    self.createList(data.list, self.dayList, 'dailytasklt');
                }
                if (item.method === 'achitasklt') {
                    self.createList(data.list, self.tList);
                }

                self.loading = false;

            } else {

                dialog.show('error', data.msg, 1);
            }

            if (!update)
                dialog.hidden();

        })

    },

    isToday: function (d1, d2) {
        var eY = d1.getFullYear();
        var eM = d1.getMonth() + 1;
        var eD = d1.getDate();
        var nY = d2.getFullYear();
        var nM = d2.getMonth() + 1;
        var nD = d2.getDate();
        if (eY === nY && eM === nM && eD === nD) {
            return true;
        }
        return false;
    },

    convertType: function (_item) {
        if (_item.pType === 3) {
            _item.typeUrl = 'stamp';
        } else if (_item.pType === 1) {
            _item.typeUrl = 'gold';
        } else if (_item.pType === 4 || _item.pType === 7) {
            _item.typeUrl = 'money';
            _item.coin = (_item.coin / 100).toFixed(2)
        }
    },

    /*创建任务*/
    createList: function (list, target, type) {

        var finishList = [], normalList = [], currentList = [];


        var gListen = [];

        // 判断是否分享完成单独的游戏（每日任务）
        if (type === 'dailytasklt') {
            var dayGame = 'day_game_list' + SDW_WEB.USER_INFO.uid;
            var listObj = SDW_WEB.Store.get(dayGame, true);
            if (listObj) {
                var curTime = new Date();
                var hisTime = new Date(listObj.time);
                if (this.isToday(curTime, hisTime)) {
                    // 只是读取今日分享的游戏列表
                    gListen = listObj.list;
                }
            }
        }

        for (var i = 0; i < list.length; i++) {

            /*flag 0 1 2*/
            var _item = list[i];

            /*对分享类做筛选处理*/
            if (_item.classic === 12) {

                if (_item.flag !== 2) {
                    _item.flag = 0; // 默认是未完成
                }

                for (var j = 0; j < gListen.length; j++) {
                    if (gListen[j] == _item.appid && _item.flag !== 2) {
                        _item.flag = 1;
                    }
                }
            }

            // 兑换的币种
            // if (_item.pType === 3) {
            //     _item.typeUrl = 'stamp';
            // } else if (_item.pType === 1) {
            //     _item.typeUrl = 'gold';
            // } else if (_item.pType === 4 || _item.pType === 7) {
            //     _item.typeUrl = 'money';
            //     _item.coin = (_item.coin / 100).toFixed(2)
            // }

            this.convertType(_item);

            /*剔除成就总任务项*/
            if (_item._id !== 1059) {

                if (_item.flag === 0) {
                    _item.btnMsg = (_item._id === 1 ? '去绑定' : '去完成');
                    normalList.push(_item);
                } else if (_item.flag === 1) {
                    _item.btnMsg = '领取';
                    currentList.push(_item);
                } else if (_item.flag === 2) {
                    _item.btnMsg = (_item._id === 1 ? '已绑定' : '已完成');
                    finishList.push(_item);
                }
            } else {

                this.totalTaskFlag = _item.flag;
            }


        }

        currentList.push.apply(currentList, normalList);
        currentList.push.apply(currentList, finishList);

        target.push.apply(target, currentList);
    },

    /*检查任务的状态*/
    checkDayTaskItem: function (item, type) {

        /*成就总任务*/
        if (type === 'all') {

            if (this.totalTaskFlag === 2) {
                return dialog.show('error', '您已经完成任务', 1);
            }
            
            if (this.userInfos.atAll >= this.userInfos.atSize) {
                this.getFinishTask({
                    _id: 1059
                });
            } else {
                dialog.show('error', '请先完成任务', 1);
            }

            return;
        }

        if (item.flag === 2) {
            return;
        }

        if (item.flag === 1) {
            /*领取奖励*/
            this.getFinishTask(item);
            return;
        }

        if (item.flag === 0) {


            if (item._id === 1) {
                // 绑定手机
                // console.log('绑定手机');
                this.bindPhoneItem = item;
                this.showPhoneBindFn();
                return;
            }

            if (/^http/.test(item.link)) {

                /*发生跳转链接*/
                var url = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel
                }, false, item.link);

                var openObj = {
                    link: url,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                };
                openObj = SDW_WEB._checkWebViewObject(openObj);
                SDW_WEB.openNewWindow(openObj);

            } else {

                return dialog.show('error', item.link || '请先完成任务', 1);
            }
        }

    },

    showAlertInfo: function (item) {

        /*判断是否存在映射表中*/
        if (this.cTaskListMap['' + item.series]) {
            this.getAlertItemList(this.cTaskListMap['' + item.series]);
            return;
        }

        /*请求系列任务*/
        if (this.loading) return;
        this.loading = true;

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            series: item.series
        }, false, HTTP_STATIC + 'achitasklt');

        dialog.show('loading', '数据加载中...');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {

                data.list = data.list || [];
                for (var i = 0; i < data.list.length; i++) {
                    var _item = data.list[i];
                    // 兑换的币种
                    // if (_item.pType === 3) {
                    //     _item.typeUrl = 'stamp';
                    // } else if (_item.pType === 1) {
                    //     _item.typeUrl = 'gold';
                    // } else if (_item.pType === 4 || _item.pType === 7) {
                    //     _item.typeUrl = 'money';
                    //     _item.coin = (_item.coin / 100).toFixed(2)
                    // }

                    self.convertType(_item);
                }
                self.cTaskListMap['' + item.series] = data.list;
                self.getAlertItemList(self.cTaskListMap['' + item.series]);
                self.showAlert = true;
                dialog.hidden();
            } else {
                dialog.show('error', data.msg, 1);
            }

            self.loading = false;
        })

    },

    getAlertItemList: function (olist) {

        var list = olist.slice(0);  // 复制一个新的数组

        /*遍历所有的系列，找到最先完成的*/
        for (var i = 0; i < list.length; i++) {
            var _item = list[i];
            if (_item.flag !== 2) {
                // 完成
                this.alertItemInfo.current = _item;
                break;
            }
        }

        /*最后一个*/
        if (i === list.length) {
            this.alertItemInfo.current = list[i - 1];
        }

        this.alertItemInfo.list = list.reverse();
        this.showAlert = true;

    },

    showAlertDayInfo: function (item) {
        this.alertDayInfo = item;
        this.showAlertDay = true;
    },

    hiddenAlert: function () {
        this.showAlert = false;
        this.showAlertDay = false;
    }
};


// document.addEventListener('touchstart', function (e) {
//
// }, false);


var _shopRoot = new Vue({
    el: '#task-root',
    data: indexData,
    methods: methods,
    components: {
        userInfo: userInfo,
        bindPhone: bindPhone,
    },
    watch: {
        showAlert: function (newValue) {
            // console.log(newValue)
            /*需要刷新scroll*/
            if (newValue) {
                // console.log(newValue)
                // document.body.addEventListener('touchmove', this.forbidden.bind(this), false);
                setTimeout(function () {
                    var a = new IScroll('#scroll-view', {
                        probeType: 3,
                        scrollbars: false,
                        mouseWheel: false,
                        hScrollbar: false,
                        interactiveScrollbars: false,
                        fadeScrollbars: false
                    });
                }, 200);

            } else {

                // document.body.removeEventListener('touchmove', this.forbidden);
            }

        }

    },


    mounted: function () {
        document.addEventListener('touchmove', function (e) {
            if (indexData.showAlert) {
                if (e.cancelable) {
                    // 判断默认行为是否已经被禁用
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }
                }
            }
        }, {passive: false});
    },

    computed: {

        totalType: function () {

            if (this.totalTaskFlag === 2) return 'gray';
            if (!this.userInfos.atAll) return '';
            if (this.userInfos.atAll >= this.userInfos.atSize) {
                return 'finish';
            }
        }
    }

});


//
// if (SDW_WEB.onShandw) {
//
//     SDW_WEB.getSdwUserData().then(function (res) {
//
//         _shopRoot.userInfos.avatar = SDW_WEB.USER_INFO.avatar || 'http://www.shandw.com/pc/images/mandef.png';
//         _shopRoot.userInfos.uid = SDW_WEB.USER_INFO.uid;
//         _shopRoot.userInfos.nick = SDW_WEB.USER_INFO.nick;
//         _shopRoot.myInit();
//
//
//     }, function () {
//
//         SDW_WEB.sdw.openLogin({
//             success: function () {
//
//             }
//         })
//
//     });
//
//
//     // 设置APP的底部工具栏按钮
//     // SDW_WEB.sdw.onSetToolBarOperation(['QQ', 'Timeline', 'AppMessage', 'QZone', 'Weibo']);
//
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

