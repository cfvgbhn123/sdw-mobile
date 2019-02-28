/**
 * Created by CHEN-BAO-DENG on 2017/8/14 0014.
 */

var CheckOpenGame = {
    //
    createMyUrl: function (item) {

        item = item || {};

        if (item.pc) {

            item.myUrl = 'javascript:void(0);';

        } else {
            item.myUrl = item.adUrl || 'http://www.shandw.com/pc/game/?gid=' + item.id + '&channel=' + SDW_WEB.channel;
        }

        return item.myUrl;
    },

    checkOpenUrl: function (item) {

        if (item.pc) {
            // 设置移动端的弹窗二维码
            var url = this.createQCode(item.id);
            window._indexView.currentGameUrl = url;
        }

    },
    createQCode: function (gid) {

        return 'http://www.shandw.com/m/game/?gid=' + gid + '&channel=' + SDW_WEB.channel + '&from_plt=m3plt';
    }
};


module.exports = CheckOpenGame;