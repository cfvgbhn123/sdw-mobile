/**
 * Created by CHEN-BAO-DENG on 2017/9/19 0019.
 */


var GAME_URL = function (type, id) {
    var goUrlParam = {
        channel: SDW_WEB.channel
    };

    var Url = type == 'play' ? SDW_WEB.MOBILE_GAME.replace('APP_ID', id) :
        SDW_WEB.MOBILE_ROOT + 'detail/?gid=' + id;

    var targetUrl = SDW_WEB.URLS.addParam(goUrlParam, false, Url);

    return targetUrl;
};

module.exports = GAME_URL;
