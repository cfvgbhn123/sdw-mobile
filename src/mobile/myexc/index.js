require('./index.scss');


/**
 * Created by CHEN-BAO-DENG on 2017/3/15.
 *
 * 页面滚动事件构造函数，可实现页面滚动的相关执行函数
 *
 * var scroll = new WindowScroll(function(){
 *
 * })
 *
 * @param callback  {Function}  滚动到底部的回调函数
 * @param type      {Boolean}   是否到达底部执行
 * @param delayTime {Number}    每次执行间隔
 * @param offset    {Number}    距离底部多少间隔触发
 * @constructor
 */
// function WindowScroll(callback, type, delayTime, offset) {
//
//     if (typeof callback != 'function') {
//         console.log('WindowScroll error: callback must be a Function!');
//         return;
//     }
//
//     this.toBottom = type || false;
//
//     this.enable = true;
//     this.callback = callback || null;
//     this.delayTime = delayTime || 200;
//     this.offset = offset || 200;
//
//     this.clientHeigth = document.documentElement.clientHeight || document.body.clientHeight;
//
//     this._init();
// }
//
// /**
//  * 初始化
//  * @private
//  */
// WindowScroll.prototype._init = function () {
//
//     var self = this;
//     self.timer = null;
//
//     if (!self.callback) return;
//
//     window.addEventListener('scroll', function (e) {
//
//         if (!self.enable) return;
//
//         var nowScrollHeight = document.body.scrollTop + self.clientHeigth;
//         var totalScrollHeight = document.documentElement.scrollHeight - self.offset;
//
//         var hasToBottom = nowScrollHeight >= totalScrollHeight;
//         var execute = (self.toBottom == true && hasToBottom) || (self.toBottom == false);
//
//         if (execute && !self.timer) {
//
//             self.timer = setTimeout(function () {
//                 self.callback(e);
//                 self.timer = null;
//             }, self.delayTime);
//         }
//
//     }, false);
// };
//
// /**
//  * 设置回调函数
//  * @param callback {Function}
//  */
// WindowScroll.prototype.setCallback = function (callback) {
//
//     if (typeof callback == 'function') {
//         self.callback = callback;
//     } else {
//         console.log('WindowScroll error: callback must be a Function!');
//     }
//
// };



var WindowScroll = require('../../libs/WindowScroll');

var indexData = {
    list: [],
    taskInfo: {
        show: 0,
        item: {}
    }
};

var methods = {

    gotoWeixinShandw: function () {
        location.href = SDW_WEB.SDW_WEIXIN_URL;
    },

    showCode: function (code) {
        if (SDW_WEB.onShandw) {
            dialog.show('ok', '已复制到剪切板', 1);
            SDW_WEB.sdw.setClipboard(code);
        } else {
            window.prompt('您的兑换码', code);
        }
    },

    showTaskInfo: function (item) {
        // console.log(item)
        if (!item.codeInfo || item.iType != 2) return;
        this.taskInfo.show = 1;
        this.taskInfo.item = item;
    },

    transCoins: function (coin) {

        if (coin < 10000) return coin;

        if (coin < 100000000) {
            var big = coin / 10000 >> 0;
            var small = (coin % 10000) + '';

            if (small == 0) {
                return big + '万';
            }

            return big + '.' + small[0] + '万';
        }

        if (coin < 10000000000) {
            var big = coin / 100000000 >> 0;
            var small = (coin % 100000000) + '';

            if (small == 0) {
                return big + '亿';
            }

            return big + '.' + small[0] + '亿';
        }
    },

    // 加载列表
    loadList: function (page) {

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            uid: SDW_WEB.USER_INFO.uid,
            page: page
        }, false, HTTP_STATIC + 'useritem');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1) {

                // 将数据转换
                data.list = data.list || [];
                var newList = data.list.map(function (item) {

                    item.msgs = [];

                    // 点券类型，前面加上 +
                    item.oTitle = item.iType == 5 ? '+' + item.name : item.name;

                    // cdk发放的兑换码
                    if (item.iType == 2 && item.key) {
                        item.codeInfo = item.key;
                        item.msgs.push('兑换码：' + item.key);
                    }

                    // 普通的描述
                    var typeMap = {
                        1: '闪电币',
                        2: '钻石',
                        3: '点券',
                        4: '人民币'
                    };

                    item.msgs.push(item.msg + ',消耗<span>' + self.transCoins(item.gold) + '</span>' + typeMap[item.pType]);

                    return item;
                });

                self.list = self.list.concat(newList);

            } else {
                dialog.show('error', data.msg, 1);

            }

        });

    },
    /**
     * 时间转换函数
     * @param time
     * @return {string}
     */
    transTime: function (time) {
        var oDate = new Date(time);

        var year = oDate.getFullYear();
        var month = oDate.getMonth() + 1;
        var day = oDate.getDate();

        return year + '.' + month + '.' + day;
    }
};

var currPage = 0;

var _shopRoot = new Vue({
    el: '#shop-root',
    data: indexData,
    methods: methods
});

var scroll = new WindowScroll(function () {
    _shopRoot.loadList(currPage++)
}, true);

if (SDW_WEB.onShandw) {

    SDW_WEB.getSdwUserData().then(function (res) {
        _shopRoot.loadList(currPage++);
    })

} else {
    _shopRoot.loadList(currPage++);
}






