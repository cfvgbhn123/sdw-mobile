/**
 * Created by CBDTTF on 2017/4/11.
 */

var Ball = function (option) {

    option = option || {};

    this.__init__(option);

};

Ball.prototype.__init__ = function (option) {

    this.x = option.x || 0;
    this.y = option.y || 0;
    this.r = option.r || 3;

    this.vx = option.vx || 0;
    this.vy = option.vy || 0;

    this.color = option.color || '#3399ff';

    this.ctx = null;
    this.visible = true;

};

Ball.prototype.draw = function () {

    var ctx = this.stage.ctx;

    if (!ctx || !this.visible) return;
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    // ctx.fillStyle = this.color;
    // ctx.fill();
    // ctx.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
    var texture = this.textures[this.drawIndex];
    ctx.drawImage(texture, 0, 0, 72, 72, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);

    this.update();
};

Ball.prototype.update = function () {

    // 可重构

};


module.exports = Ball;