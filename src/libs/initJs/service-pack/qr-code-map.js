/**
 * Created by CHEN-BAO-DENG on 2018/2/12 0012.
 */

module.exports = {

    codeKey: '_code_info_',

    mapInfo: {},

    /***
     * 解析请求链接返回的二维码相关信息
     * @param resUrl
     * @param data
     */
    filterCode: function (resUrl, data) {

        // 游戏授权请求返回信息
        if (/authgame/.test(resUrl)) {
            var codes = {
                atSDW: data.atSDW,
                BDDSWTOKEN: data.BDDSWTOKEN,
                qrcode: data.qrcode
            };
            var _query = SDW_WEB.URLS.queryUrl(true, resUrl);
            var gid = _query['gid'];
            /*resUrl上的请求参数*/
            if (gid) {
                this.mapInfo[gid] = codes;
                SDW_WEB.Store.set(this.codeKey + gid, codes);
            }
        }
    },

    /**
     * 获取二维码绑定信息
     * @param gid
     * @returns {*}
     */
    getCodes: function (gid) {
        // 对移动端的游戏id做兼容
        gid = gid || SDW_WEB.MOBILE_GAME_GID;
        var info = this.mapInfo['' + gid] || SDW_WEB.Store.get(this.codeKey + gid);
        return info;
    }
};