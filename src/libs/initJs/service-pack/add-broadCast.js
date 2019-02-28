/**
 * Created by CHEN-BAO-DENG on 2018/1/25 0025.
 */

SDW_WEB._ADD_BROADCAST_ID = 0;
// var pageList = [];
var urlReg = /^http/i;

module.exports = function (url) {
    // if (!url) return;
    if (!urlReg.test(url)) return;

    var id = 'broadCastPage' + (SDW_WEB._ADD_BROADCAST_ID++);
    var iframe = document.createElement('iframe');

    iframe.id = id;
    var src = SDW_WEB.URLS.addParam({
        channel: SDW_WEB.channel,
        broadCastPage: id
    }, true, url);
    iframe.src = src;
    iframe.frameborder = '0';

    var cssText = 'border:none;box-shadow:none;' +
        'position:fixed;z-index:99999999999999999;height:100%;width:100%;' +
        'display:block;top:0;left:0;opacity:0;visibility:hidden;' +
        'transition:.3s;-webkit-transition:.3s';

    iframe.style.frameborder = '0';
    iframe.style.cssText += cssText;

    document.body.appendChild(iframe);

    iframe.onload = function () {
        iframe.style.visibility = 'visible';
        iframe.style.opacity = '1';
    }
};
