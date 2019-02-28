/**
 * Created by CHEN-BAO-DENG on 2017/2/28.
 *
 * 闪电玩游戏弹幕
 *
 */


(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = +new Date();
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

/**
 *
 * @param option
 * @constructor
 */
function Barrage(option) {

    this._init(option)
}

/**
 *
 * @param option
 * @private
 */
Barrage.prototype._init = function (option) {

    this.MAX_NUM = option.max || 2;

    this.ROOT = document.querySelector(option.el);
    this.ROOT_WIDTH = document.documentElement.clientWidth;
    this.ROOT_HEIGHT = this.ROOT.offsetHeight;

    this.CLIENT_WIDTH = document.documentElement.clientWidth;
    this.CLIENT_HEIGHT = document.documentElement.clientHeight;
    this.CLIENT_DPR = window.devicePixelRatio || 1;

    this.TEXT_ID = 1;
    this.texts = [];
    this.queueText = [];
    this.textPool = [];
    this.TEXT_HEIGHT = 20;
    this.sliceText = [];

    this.stage = this.createCanvas(this.ROOT_WIDTH * this.CLIENT_DPR, 72 * this.CLIENT_DPR);
    // this.stage = this.createCanvas(this.ROOT_WIDTH, 72);
    this.stageContext = this.stage.getContext('2d');

    this.stage.style.width = this.ROOT_WIDTH + 'px';
    this.stage.style.height = '72px';
    this.stage.style.position = 'absolute';
    this.stage.style.backgroundImage = '-webkit-linear-gradient(right, rgba(0,0, 0, 0) 0%, rgba(0,0, 0, 0.6) 100%)';
    this.stage.style.backgroundImage = 'linear-gradient(right, rgba(0,0, 0, 0) 0%, rgba(0,0, 0, 0.6) 100%)';

    // this.stageContext.shadowColor='#000'
    this.stageContext.font = (16 * this.CLIENT_DPR) + 'px arial';
    this.stageContext.fillStyle = "#fff";
    // this.stageContext.strokeStyle = "#000";
    this.stageContext.textBaseline = 'top';

    this.stageContext.shadowColor = '#000';

    this.stageContext.shadowOffsetX = 0;
    this.stageContext.shadowOffsetY = 1;
    // 轻微模糊阴影
    this.stageContext.shadowBlur = 1;

    this.ROOT.appendChild(this.stage);
    this.createPool();
    this.animate();

    this.defalutText = ['点我可以弹字幕哦', '闪电玩平台，指尖的精彩', '闪电玩快来玩'];
};

/**
 *
 * @param width {Number}
 * @param height {Number}
 */
Barrage.prototype.createCanvas = function (width, height) {

    var canvas = document.createElement('canvas');
    canvas.width = width || this.CLIENT_WIDTH;
    canvas.height = height || this.CLIENT_HEIGHT;

    return canvas;
};

/**
 * 创建一个dom池
 */
Barrage.prototype.createPool = function () {

    for (var i = 0; i < this.MAX_NUM; i++) {

        var text = new TextSprite();
        text.textId = this.TEXT_ID++;

        text.y = (text.textId - 1) * 18 * this.CLIENT_DPR;
        this.textPool.push(text);
    }

};

/**
 * 追加弹幕文字
 * @param option
 */
Barrage.prototype.addText = function (option) {

    var text, offset;

    if (this.texts.length >= this.MAX_NUM) {

        this.queueText.push(option);

    } else {

        text = this.textPool.shift();
        text.text = option.msg;

        text.x = this.stage.width + this.selectFrom(0, 10);

        offset = Math.random();
        text.speed = (this.selectFrom(2, 3) + (offset > 0.4 ? 0.4 : offset )) * this.CLIENT_DPR / 2;
        // text.speed = 2.5;
        text.width = this.stageContext.measureText(option.msg).width;

        this.texts.push(text);
    }

};

/**
 * 删除文字对象
 * @param text
 */
Barrage.prototype.removeText = function (text) {

    // text.visible = false;
    for (var i = 0; i < this.texts.length; i++) {
        if (this.texts[i].textId == text.textId) {
            this.texts.splice(i, 1);
            this.textPool.push(text);
            text.text = '';
            return;
        }
    }
};

Barrage.prototype.selectFrom = function (low, up) {
    var t = up - low + 1;
    return (Math.random() * t + low) >> 0;
};

Barrage.prototype.updateTexts = function () {

    for (var i = 0; i < this.sliceText.length; i++) {

    }
};

Barrage.prototype.animate = function () {

    this.timer = window.requestAnimationFrame(this.loop.bind(this));
    // this.timer = setTimeout(this.loop.bind(this), 20);
};

Barrage.prototype.loop = function () {

    this.stageContext.clearRect(0, 0, this.stage.width, this.stage.height);

    for (var i = 0, len = this.texts.length; i < len;) {

        var text = this.texts[i];

        if (text && text.text) {

            // // 到达文字边界
            if ((text.x >> 0) <= -text.width) {

                this.removeText(text);

                // 读取队列文字 || 默认的文字库
                var aText = this.queueText.length ? this.queueText.shift() : {
                        msg: this.defalutText[this.selectFrom(0, this.defalutText.length - 1)]
                    };

                this.addText(aText);

            } else {
                text.x = text.x - text.speed;
                this.stageContext.fillText(text.text, text.x, text.y);
                i++;
            }
        }
    }

    this.timer = window.requestAnimationFrame(this.loop.bind(this));
    // this.timer = setTimeout(this.loop.bind(this), 20);
};


function TextSprite(text) {

    this._init(text);

}

TextSprite.prototype._init = function (text) {

    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.text = text || '';
    this.width = 0;

};

TextSprite.prototype.updateCache = function () {

    this.stageContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stageContext.fillText(this.text, 0, 0);

    this.cacheText = this.stageContext.getImageData(0, 0, 32 * 32, 40);
};

// window.Barrage = Barrage;
module.exports = Barrage;