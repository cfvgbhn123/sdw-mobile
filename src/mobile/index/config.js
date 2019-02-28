/**
 * Created by CHEN-BAO-DENG on 2017/12/15 0015.
 *
 * 活动入口及展示的配置
 *
 * 目前关联处：index、game
 *
 */

var ActivityConfig = {

    // 活动总体的类型
    activityType: '',
    activityPage:'http://www.shandw.com/activities/newYear2019/index.html',
    title:'活动提醒',
    desc:'即将前往【春节红包】<br>活动会场',
    // 首页悬浮窗的类型
    toolIconType: 'newyear',
    activityName:'红包',
    // 首页主按钮的类型
    menuType: '',

    // 小的导航栏
    navType: '',

    // 签到的类型
    checkInType: '',


    // 首页节日素材掉落的类型
    // dropType: {
    //
    //     textures: [
    //         'images/d1.png',
    //         'images/d2.png',
    //         'images/d3.png',
    //         'images/d4.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //         'images/d5.png',
    //     ],
    //     num: 8
    // },
    // dropType: null,

    // 活动的地址
    link: '',
    name: '',

    // 活动的接口
    toolInfoUrl: '',

   // startTime: [2018, 1, 25],
   // endTime: [2018, 2, 22],  // 晚一天
    startTime: [2019, 2, 2],
    endTime: [2019, 2, 7],
    checkActivityState:function () {
        // 活动屏蔽字段
        if (SDW_WEB.readParam('sdw_ac')) {
            return false;
        }

        var now = +new Date();

        var _s = ActivityConfig.startTime;
        var startTimeObj = new Date();
        startTimeObj.setFullYear(_s[0]);
        startTimeObj.setMonth(_s[1] - 1);
        startTimeObj.setDate(_s[2]);
        startTimeObj.setHours(0);
        startTimeObj.setMinutes(0);
        startTimeObj.setSeconds(0);
        var startTime = +startTimeObj;
        var _e = ActivityConfig.endTime;
        var endTimeObj = new Date();
        endTimeObj.setFullYear(_e[0]);
        endTimeObj.setMonth(_e[1] - 1);
        endTimeObj.setDate(_e[2]);
        endTimeObj.setHours(0);
        endTimeObj.setMinutes(0);
        endTimeObj.setSeconds(0);
        var endTime = +endTimeObj;
        if( now < startTime){
            return 1;
        }
        if((startTime <= now) && (now < endTime)) return 2;

        if(now > endTime){
            return false ;
        }
        return false;
    }
};
var state = ActivityConfig.checkActivityState();
ActivityConfig.openState = state ;
ActivityConfig.state = state ? ActivityConfig.toolIconType+'-'+state : false;
window._ActivityConfig = ActivityConfig;

module.exports = ActivityConfig;