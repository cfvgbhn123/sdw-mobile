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
function WindowScroll(callback, type, delayTime, offset) {

    if (typeof callback != 'function') {
        console.log('WindowScroll error: callback must be a Function!');
        return;
    }

    this.toBottom = type || false;

    this.enable = true;
    this.callback = callback || null;
    this.delayTime = delayTime || 200;
    this.offset = offset || 200;

    this.clientHeigth = document.documentElement.clientHeight || document.body.clientHeight;

    this._init();
}

/**
 * 初始化
 * @private
 */
WindowScroll.prototype._init = function () {

    var self = this;
    self.timer = null;

    if (!self.callback) return;

    window.addEventListener('scroll', function (e) {

        if (!self.enable) return;

        var nowScrollHeight = document.body.scrollTop + self.clientHeigth;
        var totalScrollHeight = document.documentElement.scrollHeight - self.offset;

        var hasToBottom = nowScrollHeight >= totalScrollHeight;
        var execute = (self.toBottom == true && hasToBottom) || (self.toBottom == false);

        if (execute && !self.timer) {

            self.timer = setTimeout(function () {
                self.callback(e);
                self.timer = null;
            }, self.delayTime);
        }

    }, false);
};

/**
 * 设置回调函数
 * @param callback {Function}
 */
WindowScroll.prototype.setCallback = function (callback) {

    if (typeof callback == 'function') {
        self.callback = callback;
    } else {
        console.log('[WindowScroll error]: callback must be a Function!');
    }

};

WindowScroll.prototype.runCallback = function () {

    this.callback && this.callback();
};


module.exports = WindowScroll;
