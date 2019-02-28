/**
 * Created by CHEN-BAO-DENG on 2017/3/21.
 *
 * 初始化页面信息
 */


(function (doc) {

    // 页面初始化字体，用于简单的页面适配
    var WIDTH = doc.documentElement.clientWidth;
    var fontSize = WIDTH / 375 * 16;
    fontSize = Math.min(fontSize, 19);
    doc.documentElement.style.fontSize = fontSize + 'px';

})(document);