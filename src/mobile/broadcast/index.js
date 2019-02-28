/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 *
 * 搜索游戏的页面
 */

// require('../../components/initcss.scss');
require('./index.scss');

document.addEventListener('DOMContentLoaded', function () {

    var ky = window.parent !== window;

    //获取url中的参数
    function getQueryString(name) {

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 匹配目标参数
        var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
        if (result != null) {
            return decodeURIComponent(result[2]);
        } else {
            return null;
        }
    }

    // if (ky) {

    // 通知父级页面关闭iFrame页面
    function closePage() {
        window.parent.postMessage(JSON.stringify({
            postSdwData: true,
            frameId: getQueryString('broadCastPage'),  // 参数上的id
            operate: 'broadcast_close_frame'
        }), "*");
    }

    var closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target;
        if (target === closeBtn) {
            closePage();
        }
    }, false);

    var bg = document.querySelector('.bg');
    bg.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target;
        if (target === bg) {
            closePage();
        }
    }, false);

    var links = document.querySelectorAll('.links');

    for (var i = 0; i < links.length; i++) {
        var l = links[i];
        l.dataset.link = l.href;
        l.href = 'javascript:';
        l.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            window.parent.postMessage(JSON.stringify({
                postSdwData: true,
                link: this.dataset.link,
                operate: 'openUrl'
            }), "*");

        }, false);
    }
    // }

});