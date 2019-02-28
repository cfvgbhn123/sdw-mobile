/**
 * Created by CHEN-BAO-DENG on 2018/1/25 0025.
 */

module.exports = function (gid) {

    var doc = document;

    // var addJsFile = function (url, callback) {
    //     var oHead = doc.getElementsByTagName('HEAD').item(0);
    //     var oScript = doc.createElement("script");
    //     oScript.type = "text/javascript";
    //     oScript.src = url;
    //     oHead.appendChild(oScript);
    //     oScript.onload = function () {
    //         typeof callback === 'function' && callback();
    //     };
    // };

    var actionFn = function () {

        // 获取绑定的单个游戏信息
        var codeInfo = SDW_WEB.qrCodeManage.getCodes(gid);

        if (!codeInfo) {
            console.log('关注二维码数据不存在');
            return;
        }

        if (codeInfo.atSDW) {
            console.log('已经关注了闪电玩');
            return;
        }

        if (SDW_WEB.onWeiXin && codeInfo.qrcode) {
            window.sdwQCodeView.showCodeView('qr-code', "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + codeInfo.qrcode);
            // 非微信环境下才显示绑定码
        } else if (!SDW_WEB.onWeiXin && codeInfo.BDDSWTOKEN) {

            window.sdwQCodeView.showCodeView('bd-code', codeInfo.BDDSWTOKEN);

        }
    };

    if (!window.sdwQCodeView) {

        dialog && dialog.show('loading', '请稍等');

        SDW_WEB.addJSFile('http://www.shandw.com/m/service-pack/qr-code/qr-code.min.js?v=' + SDW_WEB.getNow(), function () {
            dialog && dialog.hidden();
            actionFn();
        });
        return;
    }

    // 不同的环境显示如下：
    // 微信：显示二维码页面
    // 其余：显示绑定码
    actionFn();
};