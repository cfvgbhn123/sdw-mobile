/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

document.addEventListener('touchstart', function (e) {
    e.stopPropagation();
}, false);


var taskItem = require('../../components/mobile/task-item/task-item.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer-n.vue');
var taskInfo = require('../../components/mobile/task-info/task-info.vue');
var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');
var taskGetAlert = require('../../components/mobile/task-get-alert/task-get-alert.vue');
require('./index.scss');
require('../../components/initcss.scss');
require('./goldDrop');

var indexData = {};

initViewData();

function initViewData() {
    indexData = {
        onShandw: SDW_WEB.onShandw,
        currentTaskItem: {},
        bindPhoneItem: {},
        taskListMap: {
            day: {
                min: 10,
                max: 13,
                len: 0,
                list: []
            },
            week: {
                min: 14,
                max: 16,
                len: 0,
                list: []
            },
            month: {
                min: 17,
                max: 19,
                len: 0,
                list: []
            },
            all: {
                min: 20,
                max: 27,
                len: 0,
                list: []
            },
            shareFriend: {
                min: 5,
                max: 9,
                len: 0,
                list: []
            }
        },

        rcDay: 0,
        rcWeek: 0,
        rcMonth: 0,

        user: {
            avatar: SDW_WEB.USER_INFO.avatar,
            uid: '',
            nick: '',
            phone: null,
            gold: 0,
            offset: 0
        },
        taskList: []
    };
}

// 任务
window.taskView = new Vue({
    el: '#app',
    data: indexData,
    methods: {

        // 刷新当前页面
        refreshPage: function () {

            if (SDW_WEB.onShandw) {

                SDW_WEB.sdw.refreshPage(true);

            } else {
                // 重新请求数据，减少页面的跳转
                // taskView.loadList();
                location.href = location.href;
            }
        },

        gotoMyexcPage: function () {

            var pageUrl = SDW_PATH.MOBILE_ROOT + 'myexc/?channel=' + SDW_WEB.channel + '&ver=' + SDW_PATH.ver;

            SDW_WEB.openNewWindow({
                link: pageUrl,
                isFullScreen: false,
                showMoreBtn: false,
                title: '兑换记录'
            });
        },

        gotoShopPage: function () {
            var targetUrl = SDW_PATH.MOBILE_ROOT + 'shop/?channel=' + SDW_WEB.channel + '&ver=' + SDW_PATH.ver;
            SDW_WEB.openNewWindow({
                link: targetUrl,
                isFullScreen: false,
                showMoreBtn: false,
                title: '成就商城'
            });
        },

        // 绑定手机回调
        bindPhoneCallback: function (data) {

            var tItem = this.searchTaskForId(1);
            tItem.flag = 1;
            tItem.btnMsg = '领取';
            this.$refs.bindPhone.showbind = 0;
        },

        /**
         * 将item放置到list最后面
         * @param item {Object}
         * @param list {Array}
         */
        appendToLast: function (item, list) {

            for (var i = 0; i < list.length; i++) {

                if (list[i] == item) {
                    list.splice(i, 1);
                }
            }

            list.push(item);
        },

        clickTaskItem: function (param) {

            var self = this;

            var item = param.item;
            this.currentTaskItem = item;

            this.$nextTick(function () {
                self.$refs.taskContainer.showInfo = 1;
            });

        },
        /**
         * 检测任务的状态
         * @param param
         */
        finishTaskCheck: function (param) {

            var item = param.item;
            var self = this;

            // 完成任务的，无视掉
            if (item.flag == 2) return;

            if (item.flag == 0) {

                if (item.id == 1) {
                    // 对于绑定手机任务，显示绑定任务
                    // dialog.show('ok', JSON.stringify(this.bindPhoneItem), 1);
                    this.$refs.bindPhone.showbind = 1;
                } else {

                    // 开启
                    // goldStage.start();
                    dialog.show('error', '您还没有完成任务', 1);
                }

                return;
            }

            dialog.show('loading', '领取中...');

            // setTimeout(function () {
            //     dialog.hidden();
            //     goldStage.start();
            // }, 300);
            //
            // return;

            // 执行完成任务的操作，完成后的任务需要放置到最后面；
            var postUrl = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
                tid: item.id
            }, false, HTTP_STATIC + 'taskaw');

            SDW_WEB.getAjaxData(postUrl, function (data) {
                if (data.result == 1) {
                    // 变更任务的个数
                    self.changeList(item);

                    // 将任务追加到最后
                    self.appendToLast(item, self.taskList);

                    item.flag = 2;
                    item.btnMsg = '已领取';

                    // 如果得到奖励，需要重新更改 >>>
                    self.user.gold += item.coin;

                    self.currentTaskItem = item;

                    dialog.hidden();

                    self.$nextTick(function () {
                        goldStage.start();
                        // self.taskView.$refs.taskgetalert.showInfo = 1;
                    });
                } else {
                    dialog.show('error', data.msg, 1);
                }
            });

        },

        // 关闭金币弹窗
        closetap: function () {
            // alert('yes');

            goldStage.canvas.style.visibility = 'hidden';
            document.querySelector('.gold-flash-ani').style.opacity = 0;
            document.querySelector('.gold-flash-ani').style.visibility = 'hidden';
        },

        hideTaskGetAlert: function () {
            var self = this;

            this.closetap();
            self.$nextTick(function () {
                self.$refs.taskgetalert.showInfo = 0;
            });
        },

        isBetween: function (value, min, max) {

            return value >= min && value <= max;

        },

        searchTaskForId: function (id) {

            for (var i = 0; i < this.taskList.length; i++) {
                var item = this.taskList[i];

                if (item.id == id) {
                    return item;
                }
            }
        },

        changeList: function (item) {

            var type = '';
            if (this.isBetween(item.id, 10, 13)) {
                type = 'day';
            }

            if (this.isBetween(item.id, 14, 16)) {
                type = 'week';
            }

            if (this.isBetween(item.id, 17, 19)) {
                type = 'month';
            }

            // 判定累计充值的任务
            if (this.isBetween(item.id, 20, 27)) {
                type = 'all';
            }

            // 判断拉新
            if (this.isBetween(item.id, 5, 9)) {
                type = 'shareFriend';
            }

            if (type && this.taskListMap[type].list.length) {
                var tItem = this.taskListMap[type].list.shift();
                tItem.showFlag = 1;
            }
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

        // 加载任务列表-------
        loadList: function () {

            var self = this;
            var postUrl = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
            }, false, HTTP_STATIC + 'tasklt');

            SDW_WEB.getAjaxData(postUrl, function (data) {

                if (data.result == 1) {

                    window.PAGE_TIME = data.ct;

                    // 用户已经充值的数量
                    self.user.chAll = data.rcAll || 0;
                    self.user.ivAll = data.ivAll || 0;

                    self.rcDay = data.rcDay || 0;
                    self.rcWeek = data.rcWeek || 0;
                    self.rcMonth = data.rcMonth || 0;

                    self.user.gold = data.gold;

                    self.user.avatar = SDW_WEB.USER_INFO.avatar || (SDW_WEB.USER_INFO.sex == 2 ? 'http://www.shandw.com/pc/images/womandef.png' : 'http://www.shandw.com/pc/images/mandef.png');

                    var list = data.list, finishedList = [], unFinishedList = [];

                    for (var i = 0; i < list.length; ++i) {
                        self.dealWithTaskItem(list[i], data, finishedList, unFinishedList);
                    }

                    // 合并任务列表
                    self.taskList = unFinishedList.concat(finishedList);

                } else {
                    dialog.show('error', '列表请求失败', 1);
                }
            });

        },

        /**
         * 处理单个任务
         * @param item
         * @param data
         * @param finishedList
         * @param unFinishedList
         */
        dealWithTaskItem: function (item, data, finishedList, unFinishedList) {

            var self = this;

            item.showFlag = 1;

            // 每日充值
            var dayCharge = self.rcDay >= (item.data / 100 >> 0);
            self.changeTaskItem(dayCharge, 'day', item, 10, 13);
            // 每周充值
            var weekCharge = self.rcWeek >= (item.data / 100 >> 0);
            self.changeTaskItem(weekCharge, 'week', item, 14, 16);
            // 每月充值
            var monthCharge = self.rcMonth >= (item.data / 100 >> 0);
            self.changeTaskItem(monthCharge, 'month', item, 17, 19);
            // 累计充值
            var allCharge = self.user.chAll >= (item.data / 100 >> 0);
            self.changeTaskItem(allCharge, 'all', item, 20, 27);

            // 判断首次充值
            if (item.id === 2 && item.flag === 0 && self.user.chAll > 0) {
                item.flag = 1;
            }

            // 分享游戏任务
            var localShareTime = localStorage['_SDW_SHARE_TIME_' + SDW_WEB.USER_INFO.uid] || 0;
            if (item.id === 4 && item.flag === 1 && !self.isToday(localShareTime, PAGE_TIME)) {
                item.flag = 0;
            }

            self.changeTaskItemState(item, data);

            // 任务完成与未完成分开
            if (item.flag === 2) {
                finishedList.push(item);
            } else if (item.flag === 1) {
                unFinishedList.unshift(item);
            } else {
                unFinishedList.push(item);
            }

            // 绑定手机
            if (item.id === 1) {
                self.bindPhoneItem = item;
            }

            // 分享任务只出现在闪电玩APP和微信
            var isAdrWeixin = SDW_WEB.onWeiXin;
            var onshandw = SDW_WEB.onShandw;

            if (item.id == 4 && !(isAdrWeixin || onshandw)) {
                item.showFlag = 0;
            }

        },

        /**
         * 判断是否是今日
         * @param old
         * @param date
         * @returns {boolean}
         */
        isToday: function (old, date) {

            old = parseInt(old);
            date = parseInt(date);

            var oldDate = new Date(old), nowDate = new Date(date);

            return oldDate.getFullYear() == nowDate.getFullYear() &&
                oldDate.getMonth() == nowDate.getMonth() &&
                oldDate.getDate() == nowDate.getDate();
        },

        /**
         * 变更充值任务的显示
         * @param typeCharge
         * @param type
         * @param item
         * @param start
         * @param end
         */
        changeTaskItem: function (typeCharge, type, item, start, end) {
            if (this.isBetween(item.id, start, end) && item.flag == 0) {
                if (typeCharge) item.flag = 1;

                if (this.taskListMap[type].len++ < 2) {
                    item.showFlag = 1;
                } else {
                    item.showFlag = 0;
                    this.taskListMap[type].list.push(item);
                }
            }
        },

        /**
         * 变更任务的按钮状态
         * @param item 单个任务
         * @param data 数据信息
         */
        changeTaskItemState: function (item, data) {

            if (item.btnMsg) return;

            if (item.flag > 0) return item.btnMsg = ['领取', '已领取'][item.flag - 1];

            if (item.id === 1) return item.btnMsg = '绑定';

            if (!this.isBetween(item.id, 5, 9)) return item.btnMsg = '0/1';

            // 拉新人数特殊处理
            var type = ['ivDay', 'ivWeek', 'ivMonth', 'ivAll'][item.type - 1],
                ivNum = data[type] || 0;

            if (ivNum >= item.data) {
                item.flag = 1;
                return item.btnMsg = '领取';
            }

            item.btnMsg = ivNum + '/' + item.data;
        }

    },
    components: {
        taskItem: taskItem,
        sdwFooter: sdwFooter,
        taskInfo: taskInfo,
        bindPhone: bindPhone,
        taskGetAlert: taskGetAlert
    }
});

// MAIN == INIT
if (SDW_WEB.onShandw) {

    SDW_WEB.getSdwUserData().then(function () {

        taskView.loadList();

    }, function () {

        SDW_WEB.sdw.logout();
    });

} else {

    taskView.loadList();
}




