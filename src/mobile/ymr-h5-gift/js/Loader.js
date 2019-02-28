/**
 * Created by CHEN-BAO-DENG on 2018/1/10 0010.
 */
function Loader(option) {
    option = option || {};

    this.__startTime = +new Date();
    this.files = option.files || [];
    this.loaded = 0;
    this.loadLength = this.files.length;
    this.RES = {};

    if (typeof option.callback === 'function') {
        this.callback = option.callback;
    }

    if (typeof option.progress === 'function') {
        this.progress = option.progress;
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

    this.progress && this.progress(this.loaded, this.loadLength);


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

module.exports = Loader;