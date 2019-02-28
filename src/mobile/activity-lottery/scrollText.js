/**
 * Created by CHEN-BAO-DENG on 2017/7/13 0013.
 */

function scrollText(config) {

    this.id = config.id || 'undefined';
    this.scroll_width = document.documentElement.clientWidth * 0.86 >> 0;
    this.current_scroll_width = 0;
    this.current_index = 0;
    this.textArry = config.texts || [];
    this.isLoop = config.isLoop || true;
    this.text_dom_width = 0;
    this.delTime = config.delTime || 1000;
}

scrollText.prototype.init = function () {

    if (this.id == 'undefined' || this.textArry.length == 0) return;
    var scrollDom = document.querySelector('#' + this.id);
    this.scroll_width = scrollDom.offsetWidth;

    scrollDom.innerHTML = "<div class='scroll-texts-cont'><div class='text'></div></div>";
    this.text_dom = document.querySelector('#' + this.id + ' .text');

    this.start();
};

scrollText.prototype.start = function () {
    if (this.current_index == this.textArry.length) {
        if (this.isLoop) this.current_index = 0;
        else  return;
    }

    this.text_dom.innerHTML = this.textArry[this.current_index] + '';

    var styleStr = 'translate3d(' + this.scroll_width + 'px,0,0)';
    this.text_dom.style.transform = styleStr;
    this.text_dom.style.webkitTransform = styleStr;
    this.text_dom.style.display = 'block';

    this.text_dom_width = this.text_dom.offsetWidth;
    this.current_scroll_width = this.scroll_width;

    requestAnimationFrame(this.timerFn.bind(this));
    this.current_index++;

};

scrollText.prototype.timerFn = function () {
    if (this.current_scroll_width > -(this.text_dom_width + 20)) {
        this.current_scroll_width--;

        var styleStr = 'translate3d(' + this.current_scroll_width + 'px,0,0)';
        this.text_dom.style.transform = styleStr;
        this.text_dom.style.webkitTransform = styleStr;
        requestAnimationFrame(this.timerFn.bind(this));
    } else {
        this.text_dom.style.display = 'none';
        setTimeout(this.start.bind(this), this.delTime);
    }
};

module.exports = scrollText;