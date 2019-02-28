/**
 * Created by CHEN-BAO-DENG on 2017/12/18 0018.
 */

function Loader(option) {
    option = option || {};

    this.files = option.files || [];
    this.loaded = 0;
    this.loadLength = this.files.length;
    this.RES = {};

    if (typeof option.callback === 'function') {
        this.callback = option.callback;
    }

    for (var i = 0; i < this.loadLength; i++) {
        this.loadFile(this.files[i]);
    }
}

Loader.prototype.loadFile = function (url) {
    var self = this;
    var img = new Image();
    img.src = url;
    img.onload = function () {
        self.loadedFile(url, img);
    }
};

Loader.prototype.loadedFile = function (url, file) {

    this.RES[url] = file;
    this.loaded++;
    if (this.loaded === this.loadLength) {
        this.callback && this.callback();
    }
};

Loader.prototype.getRes = function (url) {
    var file = this.RES[url];
    if (file) {
        return file;
    }
    return null;
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

// 一个简单的对象
function Sprite(option) {
    option = option || {};
    // this.dom = option.dom;
    this.angle = option.angle;
    this.vAngle = option.vAngle;
    this.context = option.context;
    this.x = 0;
    this.y = 0;
    this.texture = option.texture;
}

Sprite.prototype.draw = function () {
    // console.log('draw', this.x, this.y);
    this.context.drawImage(this.texture, this.x, this.y);
};


function DropAnimation(option) {

    option = option || {};

    this.textures = option.textures;
    this.ended = false;
    this.oFragment = document.createDocumentFragment();
    this.num = option.num || 15;

    this.OS = {
        DPI: 2,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };

    this.dropList = [];
    this.SIN_MAP = {};

    if (typeof option.startCallback === 'function') {
        this.startCallback = option.startCallback;
    }
    if (typeof  option.endCallback === 'function') {
        this.endCallback = option.endCallback;
    }

    this.init();
}

DropAnimation.prototype.init = function () {
    var self = this;

    this.createCanvas();

    this.loader = new Loader({
        files: self.textures,
        callback: function () {

            // console.log(self.num);
            for (var i = 0; i < self.num; i++) {
                var index = i % self.textures.length;
                var texture = self.loader.getRes(self.textures[index]);
                self.createDropItem(texture);
            }
            self.update();
            self.startCallback && self.startCallback();
        }
    });
};

DropAnimation.prototype.createCanvas = function () {
    var canvas = document.createElement('canvas');
    canvas.width = this.OS.width * this.OS.DPI;
    canvas.height = this.OS.height * this.OS.DPI;
    canvas.style.width = this.OS.width + 'px';
    canvas.style.height = this.OS.height + 'px';
    canvas.id = 'drop-canvas';
    document.body.appendChild(canvas);
    this.context = canvas.getContext('2d');
    this.canvas = canvas;
};

DropAnimation.prototype.getSin = function (angle) {

    if (this.SIN_MAP[angle]) {
        return this.SIN_MAP[angle];
    }

    this.SIN_MAP[angle] = Math.sin(angle);
    return this.SIN_MAP[angle];

};


DropAnimation.prototype.createDropItem = function (texture) {
    // 正态分布
    var x = getNumberInNormalDistribution(this.OS.width * this.OS.DPI / 2, this.OS.width * this.OS.DPI / 3.4);

    var obj = new Sprite({
        context: this.context,
        angle: Math.PI * Math.random(),
        vAngle: 0.02 * Math.random() + 0.01,
        texture: texture
    });

    obj.vx = Math.random() * 40 + 15;
    obj.vy = Math.random() * 1.2 + 1.2;
    obj.x = x;
    obj.sx = x;
    obj.y = -Math.random() * texture.height * 4 + 30;

    obj.vx *= this.OS.DPI;
    obj.vy *= this.OS.DPI;

    this.dropList.push(obj);
};


DropAnimation.prototype.update = function () {

    if (this.ended) return;
    window.requestAnimationFrame(this.update.bind(this));

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.dropList.length;) {
        var item = this.dropList[i];

        var y = item.y + item.vy;
        // 进行预判断
        if (y > this.canvas.height) {

            this.dropList.splice(i, 1);
            item = null; // 手动释放
            if (this.dropList.length === 0) {
                this.ended = true;
                this.endCallback && this.endCallback();
            }

        } else {
            i++;
            item.angle += item.vAngle;
            if (item.angle > 2 * Math.PI) {
                item.angle = 0;
            }
            var vx = this.getSin(item.angle) * item.vx;
            item.vy += 0.001;
            var x = item.sx + vx;
            item.x = x;
            item.y = y;
            item.draw();
        }
    }
};


module.exports = DropAnimation;