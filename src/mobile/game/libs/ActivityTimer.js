/**
 * Created by CHEN-BAO-DENG on 2017/12/14 0014.
 *
 * 简单的活动倒计时管理构造器
 *
 */

function ActivityTimer(option) {
    this._init(option);
}

ActivityTimer.prototype._init = function (option) {

    option = option || {};
    this.state = option.state || 'normal';
    this.baseTime = option.baseTime || (+new Date()); // 基于服务器的时间

    this.dT = 0;  // 用于计算时间差
    this.startTime = +new Date();

    this.endTime = option.endTime || this.getNow();
    this.lastUpdateTime = 0;
    this.updateTime = option.updateTime || 300;
    this.updateCallbacks = [];

};


ActivityTimer.prototype.setBaseTime = function (time) {
    this.baseTime = time || (+new Date());
    this.startTime = +new Date();
};


ActivityTimer.prototype.scheduleUpdate = function (callback) {
    if (typeof callback === 'function') {
        this.updateCallbacks.push(callback);
    }
};

ActivityTimer.prototype.refresh = function (option) {
    window.cancelAnimationFrame(this.RAF);
    this._init(option);
};

ActivityTimer.prototype.startTimer = function (endTime) {

    this.RAF && window.cancelAnimationFrame(this.RAF);

    this.endTime = endTime || this.endTime || this.getNow();

    // console.log('this.baseTime, this.endTime', this.baseTime, this.endTime)

    if (this.getNow() < this.endTime) {
        this.state = 'timer';
        this.update();
    } else {
        this.state = 'finish';
    }
};

ActivityTimer.prototype.update = function () {

    var now = this.getNow();
    var dT = now - this.lastUpdateTime;

    // 执行更新
    if (this.getNow() >= this.endTime) {
        this.state = 'finish';
        return;
    }

    if (dT >= this.updateTime) {
        this.lastUpdateTime = now;

        for (var i = 0; i < this.updateCallbacks.length; i++) {
            this.updateCallbacks[0]();
        }
    }

    this.RAF = window.requestAnimationFrame(this.update.bind(this));
};

ActivityTimer.prototype.getNow = function () {
    var now = +new Date();
    this.dT = now - this.startTime;
    return this.baseTime + this.dT;
};


module.exports = ActivityTimer;
