/**
 * Created by CHEN-BAO-DENG on 2017/3/13.
 */

function DragTouch(option) {

    this.id = option.id || '';
    this.adsorbed = option.adsorbed || true;
    this.duration = option.duration || 0.3;
    this.position = option.position || '1,0.5';
    this.adsorb = option.adsorb || false;

    this.notRotate = option.notRotate || false;


    this.init(option);
    return this;
}

DragTouch.prototype.init = function (option) {

    if (!this.id) return;
    this.target = document.querySelector(this.id);


    this.WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
    this.HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
    this.offX = 0;
    this.offY = 0;

    this.width = option.width || this.target.offsetWidth;
    this.height = option.height || this.target.offsetHeight;
   // console.log(this.WIDTH+'-------------'+this.width) ;
  //  console.log(this.HEIGHT+'-------------'+this.HEIGHT) ;
    if (option.width) {
        this.target.style.width = option.width + 'px';
    }

    if (option.height) {
        
        this.target.style.height = option.height + 'px';
    }

    this.tapFlag = false;
    this.timer = null;
    this.hasMove = false;

    var pos = this.position.split(',');
    var left = parseFloat(pos[0]) * (this.WIDTH - this.width) >> 0;

    // CP的初始化位置
    var y = window.touch_initY || parseFloat(pos[1]);
    var top = y * (this.HEIGHT - this.height) >> 0;

    this.top = top;
    this.left = left;
    this.hiddenState();

    // var _transStr = 'translate3d(' + left + 'px,' + top + 'px,0)';
    //
    // this.target.style.transform = this.target.style.webkitTransform = _transStr;
    // this.target.style.opacity = '0.5';

    this.target.addEventListener('touchstart', this.touchDown.bind(this), false);
    document.addEventListener('touchmove', this.touchMove.bind(this), false);
    this.target.addEventListener('touchend', this.touchUp.bind(this), false);

    // this.target.addEventListener('mousedown', this.touchDown.bind(this), false);
    // document.addEventListener('mousemove', this.touchMove.bind(this), false);
    // document.addEventListener('mouseup', this.touchUp.bind(this), false);
};

// 对视图进行更新
DragTouch.prototype.update = function () {

    this.WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
    this.HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;

    var left = this.WIDTH - this.width;
    var top = 0;

    this.top = top;
    this.left = left;

    var _transTimer = 'cubic-bezier(0.5,1.95,.49,.73)  ' + this.duration + 's';
    this.target.style.webkitTransition = this.target.style.transition = _transTimer;

    var _transStr = 'translate3d(' + left + 'px,' + top + 'px,0)';
    this.target.style.webkitTransform = this.target.style.transform = _transStr;

};


// y => 0.5

DragTouch.prototype.setPositionY = function (y, update) {
    var top = this.HEIGHT * (y || 0.5) - this.height / 2;

    top = Math.max(0, top);
    top = Math.min(this.HEIGHT - this.height, top);

    this.top = top;
    var _transStr = 'translate3d(' + this.left + 'px,' + top + 'px,0)';
    this.target.style.webkitTransform = this.target.style.transform = _transStr;
    if (!update) {
        this.hiddenState();
    }

};


DragTouch.prototype.touchDown = function (e) {
    e.preventDefault();
    // e.stopPropagation();

    if (this.tapFlag) return;

    this.hasMove = false;

    this.target.style.opacity = '1';
    var c = this.target.getBoundingClientRect();

    if (e.touches) {
        var touch = e.touches[0];
    } else {
        var touch = e;
    }

    this.offX = touch.clientX - c.left;
    this.offY = touch.clientY - c.top;

    this.tapFlag = true;

    this.clearTimer();
    this.touchMove(e);  // 初始的时候归位

    this.target.style.transition = this.target.style.webkitTransition = 'none';

};

DragTouch.prototype.touchMove = function (e) {

    if (!this.tapFlag) return;
    // e.preventDefault();
    // e.stopPropagation();
    this.hasMove = true;

    // 判断是touch还是mouse事件
    if (e.changedTouches) {
        var touch = e.changedTouches[0];
    } else {
        var touch = e;
    }

    var top = touch.clientY - this.offY;
    var left = touch.clientX - this.offX;

    top = Math.max(0, top);
    top = Math.min(this.HEIGHT - this.height, top);

    left = Math.max(0, left);
    left = Math.min(this.WIDTH - this.width, left);

    var str = 'translate3d(' + left + 'px,' + top + 'px,0)';
    this.target.style.transform = this.target.style.webkitTransform = str;

};


DragTouch.prototype.touchUp = function (e) {
    e.preventDefault();

    // e.stopPropagation();
    if (!this.tapFlag) return;

    this.tapFlag = false;

    if (e.changedTouches) {
        var touch = e.changedTouches[0];
    } else {
        var touch = e;
    }

    var left = touch.clientX - this.offX;
    var top = touch.clientY - this.offY;

    // 限定移动尺寸
    top = Math.max(0, top);
    top = Math.min(this.HEIGHT - this.height, top);

    if (left <= this.WIDTH / 2 - this.width / 2 && this.adsorb) {
        left = 0;
    } else {
        left = this.WIDTH - this.width;
    }

    this.top = top;
    this.left = left;

    this.target.style.webkitTransition = 'cubic-bezier(0.5,1.95,.49,.73)  ' + this.duration + 's';
    this.target.style.transition = 'cubic-bezier(0.5,1.95,.49,.73)  ' + this.duration + 's';

    this.target.style.webkitTransform = 'translate3d(' + left + 'px,' + top + 'px,0)';
    this.target.style.transform = 'translate3d(' + left + 'px,' + top + 'px,0)';

    this.timer = setTimeout((function () {
        this.hiddenState();
    }).bind(this), 2000);

    if (!this.hasMove) {
        // alert(e.target.className)
        var isCanvas = e.target.tagName.toLocaleLowerCase() == 'canvas';
        // alert(isCanvas)
        if (e.target.className == 'barrage-cont' || e.target.className == 'barrage-text' || isCanvas) {
            this.target.click();
        }
    }

};


DragTouch.prototype.clearTimer = function () {
    clearTimeout(this.timer);
};

// 收起状态
DragTouch.prototype.hiddenState = function () {

    this.target.style.opacity = '1';

    if (this.notRotate) {
        var left = this.left;
        var str = 'translate3d(' + left + 'px,' + this.top + 'px,0)';

    } else {
        var left = this.left + this.width / 2;
        var str = 'translate3d(' + left + 'px,' + this.top + 'px,0) rotate(-45deg)';
    }

    this.target.style.webkitTransform = this.target.style.transform = str;
};

module.exports = DragTouch;