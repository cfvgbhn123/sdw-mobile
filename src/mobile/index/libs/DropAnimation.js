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
function SimpleObj(option) {
    option = option || {};
    this.dom = option.dom;
    this.angle = option.angle;
    this.vAngle = option.vAngle;
}

function DropAnimation(option) {

    option = option || {};

    this.textures = option.textures;
    this.ended = false;
    this.oFragment = document.createDocumentFragment();
    this.num = option.num || 15;

    this.finished = 0;

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
    this.loader = new Loader({
        files: self.textures,
        callback: function () {

            var pDiv = document.createElement('div');
            pDiv.style.position = 'fixed';
            document.body.appendChild(pDiv);
            self.stage = pDiv;

            for (var i = 0; i < self.num; i++) {
                var index = i % self.textures.length;
                var texture = self.loader.getRes(self.textures[index]);
                self.createDropItem(texture);
            }
            pDiv.appendChild(self.oFragment);
            document.body.appendChild(pDiv);
            self.update();

            self.startCallback && self.startCallback();
        }
    });
};

DropAnimation.prototype.getSin = function (angle) {

    if (this.SIN_MAP[angle]) {
        return this.SIN_MAP[angle];
    }

    this.SIN_MAP[angle] = Math.sin(angle);
    return this.SIN_MAP[angle];

};

DropAnimation.prototype.createDropItem = function (texture) {


    var div = document.createElement('div');
    div.className = 'drop-item';
    div.style.width = texture.width / this.OS.DPI + 'px';
    div.style.height = texture.height / this.OS.DPI + 'px';
    div.style.backgroundImage = 'url(' + texture.src + ')';
    this.oFragment.appendChild(div);

    // 正态分布
    var x = getNumberInNormalDistribution(this.OS.width / 2, this.OS.width / 3.4);

    var obj = new SimpleObj({
        dom: div,
        angle: Math.PI * Math.random(),
        vAngle: 0.02 * Math.random() + 0.01
    });

    this.dropList.push(obj);


    this.setDropItemSpeed(obj, Math.random() * 40 + 20, Math.random() * 2.4 + 2);

    this.setDropItemPosition(obj, x, -Math.random() * texture.height * 4 - 30);

    this._setPosition(obj);
};

DropAnimation.prototype.setDropItemPosition = function (item, x, y) {
    item.x = x;
    item.sx = item.sx || x;
    item.y = y;
};

DropAnimation.prototype._setPosition = function (item) {
    if (item.dom) {
        var positionStr = 'translate3d(' + item.x + 'px,' + item.y + 'px,0)';
        // item.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + item.scale + ') rotate(' + item.rotate + 'deg)';
        item.dom.style.transform = item.dom.style.webkitTransform = positionStr;
    }
};

DropAnimation.prototype.setDropItemSpeed = function (item, vx, vy) {
    item.vx = vx;
    item.vy = vy;
};


DropAnimation.prototype.update = function () {

    if (this.ended) return;

    window.requestAnimationFrame(this.update.bind(this));

    // var scale = 60 / this.getFPS();
    for (var i = 0; i < this.dropList.length; ++i) {
        var item = this.dropList[i];

        var y = item.y + item.vy;
        // 进行预判断
        if (y > this.OS.height) {

            // document.body.removeChild(item.dom);
            item.dom.style.display = 'none';
            this.dropList.splice(i, 1);
            // this.finished++;
            item = null; // 手动释放

            if (this.dropList.length === 0) {
                this.ended = true;
                this.stage.parentNode.removeChild(this.stage);
                this.endCallback && this.endCallback();
                return;
            }

        } else {
            item.angle += item.vAngle;
            if (item.angle > 2 * Math.PI) {
                item.angle = 0;
            }
            var vx = this.getSin(item.angle) * item.vx;

            item.vy += 0.0013;

            var x = item.sx + vx;
            this.setDropItemPosition(item, x, y);
        }
    }


    // 单独渲染
    for (var i = 0; i < this.dropList.length; i++) {
        var item = this.dropList[i];
        this._setPosition(item);
    }
};


module.exports = DropAnimation;