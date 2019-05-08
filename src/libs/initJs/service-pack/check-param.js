/**
 * Created by CHEN-BAO-DENG on 2018/1/29 0029.
 *
 * 用于特殊平台的定制隐藏选项，只用于同一入口的环境（不含扫一扫从PC进入移动端等情况）
 *
 * sdw_qd=1       隐藏所有的二维码图        【移动端 --> 首页；PC端 --> 首页】
 * sdw_dl=1       隐藏所有的下载按钮        【移动端 --> 退弹界面，首页】
 * sdw_ac=1       隐藏悬浮窗内活动tab页面   【移动端 --> 首页的悬浮悬窗，游戏界面的活动悬浮类型】
 * sdw_kf=1       隐藏所有的客服按钮        【移动端 --> 游戏页面】
 * sdw_simple=1   闪电玩简易版             【移动端：首页和游戏页面有效】
 * sdw_tl=1       隐藏游戏界面的悬浮窗      【移动端：游戏页面】
 * sdw_ld=1       隐藏开始的加载页面        【移动端：游戏页面】
 * sdw_tt=1       隐藏退弹功能             【移动端：游戏界面】
 *
 */


module.exports = (function () {

    var _key = 'sdw_sb_param';
    var _map = {};
    // 合并原先的字段
    var cacheParams = SDW_WEB.Store.get(_key);
    if (cacheParams) {
        for (var j in cacheParams) {
            _map[j] = cacheParams[j];
        }
    }
    // 读取参数上的字段
    for (var i in SDW_WEB.queryParam) {
       // _map[i] = true;
        _map[i] = SDW_WEB.queryParam[i];
    }


    SDW_WEB.Store.set(_key, _map); // 缓存参数值，用于会话缓存，更新

    // 暴露一个读取的接口
    return function (type, value) {

        if (typeof value !== 'undefined') {
            _map[type] = value;
            SDW_WEB.Store.set(_key, _map); // 缓存参数值，用于会话缓存，更新
            return value;
        }
        return _map[type];
    }

})();

