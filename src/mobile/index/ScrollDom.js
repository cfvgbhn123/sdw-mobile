/**
 * Created by CHEN-BAO-DENG on 2017/6/28 0028.
 */


var Tween = require('./Tween');

var ScrollDom = function (option) {

    if (!option.list instanceof Array) {
        option.list = [];
    }

    this.init(option);
};

ScrollDom.prototype = {

    init: function (option) {

        this.scrollListPos = {};
        this.domList = [];
        if (typeof option.callback === 'function') {
            this.callback = option.callback;
        }

        // 开始
        this.refreshList(option.list);

    },

    scrollToPos: function (pos, index) {

        var self = this;
        var start = this.getNoWPos();


        // 滚动的时间需要重新计算，获得更好的时间差
        Tween.animation(start, pos, 450, 'Quad.easeOut', function (value, end) {

            self.callback && self.callback(index, value, end);

            if (end) {

                document.documentElement.scrollTop = document.body.scrollTop = pos;

            } else {

                document.documentElement.scrollTop = document.body.scrollTop = value;
            }

        });

    },

    scrollToIndex: function (index, offset) {

        var end = this.scrollListPos['' + index];

        if (typeof end === 'undefined') {
            console.log('[scrollToIndex]: index not found!');
            return;
        }

        end = end - (offset || 0);

        this.scrollToPos(end, index);
    },

    getNoWPos: function (dom) {

        if (dom) {
            var scrollPos = dom.offsetTop;
            return scrollPos;
        }

        // 返回当前的滚动
        return document.documentElement.scrollTop || document.body.scrollTop;
    },

    refreshList: function (list) {

        if (list) {
            for (var i = 0; i < list.length; i++) {
                var _dom = document.querySelector('[data-module = "' + list[i] + '"]') || -1;
                this.scrollListPos[list[i]] = this.getNoWPos(_dom);
                this.domList.push(_dom);
            }

        } else {

            for (var i = 0; i < this.domList.length; i++) {
                var _dom = this.domList[i];
                this.scrollListPos[_dom.dataset.module] = this.getNoWPos(_dom);
            }
        }
    }
};

module.exports = ScrollDom;
