/**
 * Created by CHEN-BAO-DENG on 2017/8/11 0011.
 */


function SliderBanner(option) {

    this.slideTimer = null;

    this.timer = null;
    this.sliderDom = [];
    this.pointDom = [];
    this.direction = 'next';
    this.blurImg = null;

    this._init(option);
}

SliderBanner.prototype._init = function (option) {

    var sliderItems = document.querySelectorAll('.banner-item');

    this.container = document.querySelector(option.id);

    var img = document.createElement('img');
    img.className = 'blur-img';
    this.container.appendChild(img);
    this.blurImg = img;

    for (var i = 0; i < sliderItems.length; i++) {
        this.sliderDom.push(sliderItems[i]);
    }

    this.currentIdx = 0;
    this.perIdx = sliderItems.length - 1;
    this.nextIdx = 1;

    this.createPoint();
    this.addEvent();

    this.updateView();

    option.autoPlay && this.autoPlay();
};

SliderBanner.prototype.createPoint = function () {

    var self = this;

    var pitContainer = document.createElement('div');
    pitContainer.className = 'point-nav-container';
    this.container.appendChild(pitContainer);

    for (var i = 0; i < this.sliderDom.length; i++) {
        var point = document.createElement('div');
        point.className = 'point-nav';
        point.dataset.idx = i;
        pitContainer.appendChild(point);

        (function (idx) {
            point.onclick = function () {
                self.sliderTo(idx);
            };
        })(i);

        this.pointDom.push(point)
    }

};

SliderBanner.prototype.sliderTo = function (index) {

    if (this.slideTimer) return;

    this.currentIdx = index;

    if (index === this.sliderDom.length - 1) {
        this.nextIdx = 0;
    } else {
        this.nextIdx = index + 1;
    }

    if (index === 0) {
        this.perIdx = this.sliderDom.length - 1;
    } else {
        this.perIdx = index - 1;
    }

    this.updateView();
};

SliderBanner.prototype.addEvent = function () {

    var self = this;
    this.perBtn = document.querySelector('.slider-btn.left');
    this.nextBtn = document.querySelector('.slider-btn.right');

    this.perBtn.onclick = function (e) {
        e.stopPropagation();
        self.pre();
    };

    this.nextBtn.onclick = function (e) {
        e.stopPropagation();
        self.next();
    };

    this.container.onmouseover = function (e) {
        e.stopPropagation();
        self.stop();
    };

    this.container.onmouseout = function (e) {
        e.stopPropagation();
        self.autoPlay();
    };

};

SliderBanner.prototype.autoPlay = function () {

    var self = this;
    this.timer = setInterval(function () {
        self.next();
    }, 3000);
};

SliderBanner.prototype.stop = function () {
    clearInterval(this.timer);
};

SliderBanner.prototype.updateView = function () {

    // 轮播视图
    for (var i = 0; i < this.sliderDom.length; i++) {

        var item = this.sliderDom[i];

        item.style.transition = '.32s';
        if (this.currentIdx === i) {
            item.className = 'banner-item current-item'
        } else if (this.perIdx === i) {
            item.className = 'banner-item pre-item'
        } else if (this.nextIdx === i) {
            item.className = 'banner-item next-item'
        } else {

            item.style.transition = '0s';
            item.className = 'banner-item'
        }
    }

    // 圆点视图
    for (var i = 0; i < this.pointDom.length; i++) {

        var item = this.pointDom[i];

        if (this.currentIdx === i) {
            item.className = 'point-nav point-nav-active'
        } else {
            item.className = 'point-nav'
        }
    }

    // 更新模糊焦点图
    this.blurImg.src = this.sliderDom[this.currentIdx].dataset.img;

    var self = this;
    this.slideTimer = setTimeout(function () {
        self.slideTimer = null;
    }, 400);

};


SliderBanner.prototype.next = function () {

    if (this.slideTimer) return;

    this.direction = 'next';

    this.perIdx = this.currentIdx;
    this.currentIdx = this.nextIdx;

    if (this.nextIdx === this.sliderDom.length - 1) {
        this.nextIdx = 0;
    } else {
        this.nextIdx++;
    }

    this.updateView();
};

SliderBanner.prototype.pre = function () {

    if (this.slideTimer) return;

    this.direction = 'pre';

    this.nextIdx = this.currentIdx;
    this.currentIdx = this.perIdx;

    if (this.perIdx === 0) {
        this.perIdx = this.sliderDom.length - 1;
    } else {
        this.perIdx--;
    }

    this.updateView();
};


module.exports = SliderBanner;