/**
 * Created by CHEN-BAO-DENG on 2017/4/19.
 */

var Stage = require('./Stage');
var Ball = require('./Ball');

window.goldStage = new Stage('#stage');

goldStage.drawFlash = false;
goldStage.draw = function () {

    var self = this;

    if (!this.pause) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sprites.forEach(function (sprite, index, arrray) {

            var now = +new Date();
            sprite.start = sprite.start || now;

            if (now - sprite.start > sprite.delay) {

                sprite.draw();

                // 判断所有的精灵已经全部显示了；
                if (typeof sprite.firstTimeShow == 'undefined') {

                    sprite.firstTimeShow = true;

                    self.showSprites++;
                    if (self.showSprites >= self.sprites.length) {

                        document.querySelector('.gold-flash-ani').style.opacity = 0;
                        document.querySelector('.gold-flash-ani').style.visibility = 'hidden';

                        setTimeout(function () {
                            window.taskView.$nextTick(function () {
                                window.taskView.$refs.taskgetalert.showInfo = 1;
                            });
                        }, 2000);
                    }
                }
            }
        });
    }

    this.update();
};


// var ang = 0.01;
var VEL_WIDTH = goldStage.canvas.width;
var VEL_HEIGHT = goldStage.canvas.height;
var Gravitation = 105;

var random = function (t1, t2, t3) {//t1为下限，t2为上限，t3为需要保留的小数位
    function isNum(n) {
        return /^\d+$/.test(n);
    }

    if (!t1 || (!isNum(t1))) {
        t1 = 0;
    }
    if (!t2 || (!isNum(t2))) {
        t2 = 1;
    }
    if (!t3 || (!isNum(t3))) {
        t3 = 0;
    }
    t3 = t3 > 15 ? 15 : t3; // 小数位不能大于15位
    var ra = Math.random() * (t2 - t1) + t1, du = Math.pow(10, t3);
    ra = Math.round(ra * du) / du;

    return ra;
};


function getNumberInNormalDistribution(mean, std_dev) {
    return mean + (uniform2NormalDistribution() * std_dev);
}

function uniform2NormalDistribution() {
    var sum = 0.0;
    for (var i = 0; i < 12; i++) {
        sum = sum + Math.random();
    }
    return sum - 6.0;
}

// goldStage.ctx.globalAlpha = 0.95;

//显示即将绘制的图像，忽略临时canvas中已存在的图像
// offsetContext.globalCompositeOperation = 'copy';


// initBall((Math.random() * 40 >> 0) + 3);

var goldIcons = [];
var load = 0;


for (var i = 1; i < 7; i++) {

    goldIcons[i] = loadImg('images/gold-' + i + '.png');

}

function loadImg(src) {
    var coinImg = new Image();
    coinImg.src = src;
    coinImg.onload = function () {
        load++;
        loadedImg();
    };
    return coinImg;
}

function loadedImg() {
    if (load == 6) {
        goldStage.draw();
    }

}


var scale = (document.body.clientWidth || document.documentElement.clientWidth) / 375;
var COIN_RADIUS = 42 * scale >> 0;

var coins = [2000, 100000, 4000, 50000, 250000, 500000];
var coinss = [2, 100, 4, 50, 250, 500];
// var coinss = [1];
var coinss = [0.6, 0.65, 0.75, 0.85, 0.95, 1, 1.05, 1.1];


// 开启动画
goldStage.start = function () {
    goldStage.canvas.style.visibility = 'visible';
    document.querySelector('.gold-flash-ani').style.opacity = 1;
    document.querySelector('.gold-flash-ani').style.visibility = 'visible';
    var num = (Math.random() * 37 >> 0) + 20;
    if (num > 45) num = 45;
    initBall(num);
};


function initBall(num) {

    goldStage.drawFlash = true;
    // var BASE_COINS_RATIO = 1000;
    // var COINS = num / BASE_COINS_RATIO;
    var coins_scale = 1;

    COINS = num;


    goldStage.sprites = [];
    goldStage.showSprites = 0;

    // console.log(' ====== init');

    for (var i = 0; i < COINS; i++) {
        // var cx = goldStage.canvas.width / 100 * i * Math.random();
        var ball = new Ball();
        ball.x = VEL_WIDTH / 2;
        ball.y = VEL_HEIGHT / 2;
        ball.color = '#ffd86b';
        ball.id = 'ball_' + i;
        ball.textures = goldIcons;
        ball.drawIndex = 4;
        ball.drawIndex = (Math.random() * 6 >> 0) + 1;
        // ball.rotate = Math.random() > 0.5;
        // ball.drawTime = +new
        // ball.texture = goldIcons[i];

        ball.Gravitation = Gravitation;

        var coin_ratio = coinss[(Math.random() * coinss.length >> 0)];
        ball.r = COIN_RADIUS * coin_ratio;

        var BASE_VX = getNumberInNormalDistribution(ball.r, ball.r * 5) * scale;
        var BASE_VY = (Math.random() * VEL_HEIGHT - VEL_HEIGHT * 3.75) * scale / coin_ratio;

        ball.vx = BASE_VX / 100;
        ball.vy = BASE_VY / 100 * Math.min(1, coin_ratio);

        ball.energyY = 0.45 / Math.max(1, coin_ratio);
        ball.energyX = 0.8;

        if (i < 15) {
            ball.delay = Math.random() * 800;
        } else {
            ball.delay = 45 * i;
        }

        ball.dashed = 0;

        // console.log(JSON.stringify(ball));
        goldStage.addSprite(ball);

        // 对小球的update进行重写
        ball.update = function () {

            var stageWidth = this.stage.canvas.width;
            var stageHeight = this.stage.canvas.height;

            this.vy += this.Gravitation / 100;
            this.x += this.vx;
            this.y += this.vy;

            if (this.x > stageWidth - this.r) {
                this.vx = -this.vx * this.energyX;
                this.x = stageWidth - this.r;
            }

            if (this.x < this.r) {
                this.vx = -this.vx * this.energyX;
                this.x = this.r;
            }

            if (this.y > stageHeight - this.r) {

                this.dashed++;

                if (this.dashed == 4) {
                    this.vx = 0;
                } else {
                    this.vy = -this.vy * this.energyY;
                    this.y = stageHeight - this.r;
                }

            }
        };
    }
}



