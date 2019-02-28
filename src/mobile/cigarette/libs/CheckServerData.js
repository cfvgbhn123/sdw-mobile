/**
 * Created by CHEN-BAO-DENG on 2017/7/6 0006.
 *
 * 检测是否有新的开服信息
 *
 * 判断开服信息的第一条信息是否相同即可
 *
 */

function CheckServerData(serverList) {

    serverList = serverList || [];

    if (serverList.length === 0) {
        return false;
    }

    var cacheKey = '_SERVER_LIST_INFO_';
    var cacheServerInfo = SDW_WEB.Store.get(cacheKey, true);

    // appId + name + sName + sTime
    this.createServerKey = function (server) {

        server = server || {};

        var _key = '';
        _key += server.appId;
        _key += server.name;
        _key += server.sName;
        _key += server.sTime;

        return _key;
    };

    var serverKey = this.createServerKey(serverList[0]);

    // 更新开服的信息
    SDW_WEB.Store.set(cacheKey, serverKey, true);

    if (cacheServerInfo) {

        return cacheServerInfo !== serverKey;

    }

    return true;
}

module.exports = CheckServerData;