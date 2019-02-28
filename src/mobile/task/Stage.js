/**
 * Created by CBDTTF on 2017/4/11.
 */

var Stage = function (option) {
    var _opt_ = {};

    if (typeof option == 'string') {
        _opt_.id = option;
    }

    if (option instanceof Object) {
        _opt_ = option;
    }

    this.__init__(_opt_);
};

Stage.prototype.__init__ = function (option) {

    var cltWidth = document.documentElement.clientWidth || document.body.clientWidth;
    var cltHeight = document.documentElement.clientHeight || document.body.clientHeight;
    var devicePixelRatio = 2 || window.devicePixelRatio;

    this.canvas = document.querySelector(option.id);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = option.width || (cltWidth * devicePixelRatio);
    this.canvas.height = option.width || (cltHeight * devicePixelRatio);

    this.pause = false;

    this.sprites = [];
};

Stage.prototype.draw = function () {

    var self = this;

    if (!this.pause) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sprites.forEach(function (sprite, index, arrray) {
            sprite.draw();
        });
    }

    this.update();
};

Stage.prototype.addSprite = function (sprite) {
    this.sprites.push(sprite);
    sprite.stage = this;
};

Stage.prototype.update = function () {

    requestAnimationFrame(this.draw.bind(this));
};


Stage.prototype.createCanvas = function () {
    var canvas = document.createElement('canvas');
    return canvas;
};

module.exports = Stage;