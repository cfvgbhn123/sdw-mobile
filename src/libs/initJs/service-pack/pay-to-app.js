/**
 * Created by CHEN-BAO-DENG on 2018/10/19 0019.
 *
 * 用于IOS支付完成后不能跳转至APP的处理（APP -> Safari -> 微信|支付宝  -> safari（游戏地址） --(跳转判断)--> app），依赖于SDW_WEB
 *
 * 第三方APP需要给出如下条件：
 * 1.channel                用于判断支付的渠道                         11478
 * 2.navigator.userAgent    用于判断APP的特定字段 或 其他的判断方法      /hahaapp/.test(navigator.userAgent)
 * 3.URL Schemes            用于跳转至APP                             qufenqian://pingangame/payback/
 *
 * config结构：
 * channel - appItem
 *
 * appItem结构：
 * name：app的名字
 * onApp：用于判断在当前app的方法
 * getUrl：获取跳转至当前app的URL Schemes地址
 *
 *
 *
 * 没有用于判断APP的特定字段 或 其他的判断方法的
 * 需要在第三方授权页面，存入一个session或local的值，用于程序判断
 *
 */

var ua = navigator.userAgent;
var currentUrl = location.href;

/*各类APP的判断条件配置*/
var l = [
    {
        channel:11478,
        userAgent:'hahaapp',
        schemes:'qufenqian://pingangame/payback/',
        name:'链上未来-HAHA小视频',
    },
    {
        channel:11601,
        userAgent:'yxbl',
        schemes:'yxbl://webgame/payback',
        name:'友熊APP',
    },
    {
        channel:11709,
        userAgent:'',
        schemes:'heybox://',
        name:'小黑盒APP',
    },
    {
        channel:10890,
        userAgent:'star_client',
        schemes:'neteasestar://star.8.163.com',
        name:'网易星球',
    },
    {
        channel:11816,
        userAgent:'',
        schemes:'https://open.game.163.com/c/h5game_pay_result',
        name:'网易圈圈',
    },
    {
        channel:11884,
        userAgent:'tctravel',
        schemes:'https://m.17u.cn/app/la?sUrl=appnew.ly.com%7Cactivity%7C%3Ftcwvclogin%23%7CgameRouter',
        name:'同程艺龙',
    },
    {
        channel:11842,
        userAgent:'qunqun',
        schemes:'qunqun://',
        name:'QunQun',
    },
]
var config = {

    '11478': {
        name: '链上未来-HAHA小视频',
        onApp: function () {
            return /hahaapp/.test(ua);
        },
        getUrl: function () {
            return 'qufenqian://pingangame/payback/' + currentUrl;
        }
    },
    '11601': {
        name: '友熊APP',
        onApp: function () {
            return /yxbl/.test(ua);
        },
        getUrl: function () {
            return 'yxbl://webgame/payback';
        }
    },
    '11709': {
        name: '小黑盒APP',
        onApp: function () {
            return false;
        },
        getUrl: function () {
            return 'heybox://';
        }
    },
    '10890': {
        name: '网易星球',
        onApp: function () {
            return /star_client/.test(ua);
        },
        getUrl: function () {
            return 'neteasestar://star.8.163.com';
        }
    },
    '11816': {
        name: '网易圈圈',
        onApp: function () {
            return false;
        },
        getUrl: function () {
            return 'https://open.game.163.com/c/h5game_pay_result?sdw_channel=' + SDW_WEB.channel + '&sdw_gid=' + SDW_WEB.MOBILE_GAME_GID;
        }
    },
    '11884': {
        name: '同程艺龙',
        onApp: function () {
            return /tctravel/.test(ua);
        },
        getUrl: function () {
            return 'https://m.17u.cn/app/la?sUrl=appnew.ly.com%7Cactivity%7C%3Ftcwvclogin%23%7CgameRouter';
        }
    },
    '11842':{
        name: 'QunQun',
        onApp: function () {
            return /qunqun/.test(ua);
        },
        getUrl: function () {
            return 'qunqun://';
        }
    },
    'WangYi': ['11816'],
    'QianKa':{
        name: '钱咖',
        onApp: function () {
            return  false ;
        },
        getUrl: function () {

            return 'http://www.shandw.com/gotoApp/chargeFinishi.html';
        }
    }
};

module.exports = function () {

    // 外部safari浏览器、游戏界面
    var flag = SDW_WEB.onMobile && SDW_WEB.onSafari && SDW_WEB.MOBILE_GAME_GID && SDW_WEB.onIOS;
    if (!flag) return;


    // 网易游戏地址做统一跳转
    if (/wyqq/.test(location.href)) {
        location.href = 'https://open.game.163.com/c/h5game_pay_result?sdw_channel=' + SDW_WEB.channel + '&sdw_gid=' + SDW_WEB.MOBILE_GAME_GID;
    }

    var channel = SDW_WEB.queryParam.channel;
    var sec = new Date().getTime();
    var key = '400654fbecf64cbfab04db5ba4970e7e' ;
    var uri = SDW_WEB.URLS.addParam({
        channel:channel,
        sec:sec,
        sign:SDW_WEB.MD5(""+channel+sec+key),
    },false,'https://platform.shandw.com/payRedirection');
    SDW_WEB.getAjaxData(uri,function (res) {
        if(res.result == 1) {
            var config = {
                name: res.data.name,
                onApp: function () {
                    if(!res.data.userAgent) return false ;
                    return ua.indexOf(res.data.userAgent) > -1;
                },
                getUrl: function () {
                    if(channel == '11478'){
                        return  res.data.schemes + currentUrl;
                    }else if(channel == '11816'){
                        return    res.data.schemes+'?sdw_channel=' + SDW_WEB.channel + '&sdw_gid=' + SDW_WEB.MOBILE_GAME_GID;
                    }

                    else{
                        return res.data.schemes ;
                    }
                }
            }
            if (!config.onApp()) location.href = config.getUrl(); // 不在指定的APP中，跳转至APP
        }
    });



};
