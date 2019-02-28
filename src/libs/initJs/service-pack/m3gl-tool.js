/**
 * Created by CHEN-BAO-DENG on 2018/1/25 0025.
 */



var start = [2018, 2, 1];
var end = [2018, 2, 13];

var checkTime = require('./check-activity-time');

module.exports = function (doc) {

    // 移动端或跨域，退出
    if (SDW_WEB.onMobile || SDW_WEB.ky) return;

    // 不在【梦三国】游戏中，退出
    if (!SDW_WEB.onM3pltGame) return;

    // 时间跨度不正确，退出
    if (!checkTime(start, end)) return;

    // 非PC首页，退出
    var is_pc_index = /\/pc\/index\//.test(location.href);
    if (!is_pc_index) return;


    /*正常显示悬浮窗*/
    var div = doc.createElement('div');
    div.className = 'm3gl-tool-icon';

    var loadCSSFile = function (path) {
        var head = doc.getElementsByTagName('head')[0];
        var link = doc.createElement('link');
        link.href = path;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        head.appendChild(link);
    };

    loadCSSFile('http://www.shandw.com/h5/activity/css/m3gl.css?v=' + SDW_WEB.getNow());

    // 点击事件
    div.onclick = function () {
        var url = SDW_WEB.URLS.addParam({
            m3plt: 1,
            v: SDW_WEB.getNow()
        }, true, 'http://www.shandw.com/h5/m3gl/');
        SDW_WEB.addBroadCastPage(url);
    };

    doc.addEventListener('DOMContentLoaded', function () {

        doc.body.appendChild(div);

        // 判断首次进入
        var isFirst = SDW_WEB.Store.get('m3gl-tool');

        if (!isFirst) {
            SDW_WEB.Store.set('m3gl-tool', 1);

            var url = SDW_WEB.URLS.addParam({
                m3plt: 1,
                v: SDW_WEB.getNow()
            }, true, 'http://www.shandw.com/h5/m3gl/');


            // 登录回调
            SDW_WEB._USER_AUTH_CALLBACK = function () {
                SDW_WEB.addBroadCastPage(url);
            }

        }

    }, false);


};