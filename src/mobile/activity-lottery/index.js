/**
 * Created by CHEN-BAO-DENG on 2017/7/12.
 *
 * 闪电玩摇奖提现活动
 *
 * 1.在微信中，闪电玩APP（微信登录）中，才会出现活动界面：
 *   非闪电玩APP && 非微信中，提示（微信或者APP）
 *   闪电玩APP（非微信登录），提示（采用微信登录）
 *
 * 2.成功分享给微信好友，即可获得一次抽奖的机会（前端需要做一下处理）
 *
 * 3.提现操作：
 *   APP内，直接跳转提现的界面；
 *   微信内，提示提现的流程
 *
 */

require('../../components/initcss.scss');
require('./index.scss');

var scrollText = require('./scrollText');


var indexData = {
    showNotWindow: '',
    pageType: '0',
    showTixian: false,
    showNotNum: false,
    startLottery: false,
    showTip:false,
    userInfo: {
        all: 0,
        uid: 0,
        maxAll: 0,
        money: 0,
        num: 0,   // 玩家目前可抽取的次数
        type: 0
    },
    achive:{
        gamename:''
    },
    callback: null,
    showLotteryResult: false,
    showLotteryResultMoney: 0,

    // 触电抽奖
    lottery: {

        init: false,
        show: 0,
        timer: null,
        stateIndex: 0,
        items: null, // dom数组
        startTime: +new Date(),

        // 摇奖盘的奖励信息
        // lottery: [0.1, 100, 1, 2.5, 0.5, 20, 10, 3],
        lottery: [100, 0.1, 3, 20, 2.5, 0.5, 10, 1],

        // 动画相关
        aniObj: {
            time: 0,
            stop: 0,
            aniTime: 100,
            canplay: 1
        }

    },
    gameBox:[
        {
            intro:'完成游戏小任务，增加抽奖次数',
            gameList:[
                {
                    img:'images/XZSC.png',
                    task:'达到60级',
                    name:'血战沙城',
                    playUrl:SDW_PATH.MOBILE_ROOT+'game/1482314563.html' , //1482314563
                },
                {
                    img:'images/FKLM.png',
                    task:'通过30关',
                    name:'方块联盟',
                    playUrl:SDW_PATH.MOBILE_ROOT+'game/1179339853.html' , //1179339853
                }
            ],

        },
    ],
};


var indexMethods = {

    showTiXianContainer: function () {

        this.showLotteryResult = false;
        this.initLotteryFn();

        if (SDW_WEB.onShandw) {

            // 跳转到领取界面
            SDW_WEB.openNewWindow({
                title: '红包提现',
                link: 'http://www.shandw.com/redPacket/?v=' + SDW_WEB.version,
                isFullScreen: false,
                showMoreBtn: true
            });

        } else {

            this.showTixian = true;
        }

    },
    /*处理页面跳转*/
    openNewPage:function (url) {
        var _t = this ;
        var targetLink = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,

        }, false,url);
        if(SDW_WEB.onShandw){

            SDW_WEB.sdw.openWindow({
                link:targetLink,
                title:'游戏加载中',
                showMoreBtn:true,
                fail:function () {
                    _t.$messagebox.alert('哦哦，崩溃啦！正在查明原因~~~','加载失败') ;
                }
            });

            return null ;
        }
        window.location.href = targetLink;
    },
    forbiddenScroll: function (forbidden) {

        var scrollFn = function (e) {
            e.stopPropagation();
            e.preventDefault();
        };

        if (forbidden) {
            document.addEventListener('touchmove', scrollFn, false);
        } else {
            document.removeEventListener('touchmove', scrollFn, false);
        }

    },

    _init: function () {

        document.body.style.display = 'block';

        // 非微信和闪电玩APP
        if (!SDW_WEB.onShandw && !SDW_WEB.onWeiXin) {
            this.showNotWindow = '1';
            this.forbiddenScroll(true);
        }

        this.startLightAnimation();
        this.initLotteryFn();
        this.getInitInfo();

        this.$nextTick(function () {

        })
    },

    /**
     * 初始化奖励框的灯
     * @type {Element}
     */
    startLightAnimation: function () {

        var lightAnimation = document.querySelector('#light-animation');
        var lightAnimationTimerTime = 600;

        var lightAnimationTimerFn = function () {

            if (lightAnimation.dataset.light === '1') {
                lightAnimation.dataset.light = '2';
                lightAnimation.className = 'light-animation light2';

            } else {
                lightAnimation.dataset.light = '1';
                lightAnimation.className = 'light-animation light1';
            }

            setTimeout(function () {
                requestAnimationFrame(lightAnimationTimerFn);
            }, lightAnimationTimerTime);
        };

        var lightAnimationTimer = setTimeout(function () {
            requestAnimationFrame(lightAnimationTimerFn);
        }, lightAnimationTimerTime);
    },

    // 创建滚动条的字
    createScrollText: function (data) {

        data.user = data.user || [];
        data.order = data.order || [];

        // 构建玩家的用户映射表
        var userMap = {};
        for (var i = 0; i < data.user.length; i++) {
            userMap[data.user[i].id] = data.user[i].nick || '' + data.user[i].id;
        }


        // 构建滚动的信息列表
        var texts = [];
        for (var i = 0; i < data.order.length; i++) {
            var item = data.order[i];

            texts.push(userMap[item.uid] + '成功提取了' + (item.money / 100).toFixed(2) + '元现金');
        }

        var myText = new scrollText({
            id: 'cbd',
            texts: texts
        });

        myText.init();
    },

    // 初始化信息-main
    getInitInfo: function () {

        var indexData = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme
        }, false, HTTP_STATIC + 'hbwhh');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1) {

                indexData.createScrollText(data);

                // 重置用户的信息
                indexData.userInfo.num = data.info.num;
                indexData.userInfo.money = data.info.money / 100;
                /*单位分*/
                if(indexData.userInfo.num > 0 ){
                    indexData.showTip = true ;
                }
                // 设置分享的文案
                var setShareLink = function () {
                    return SDW_WEB.MOBILE_ROOT + 'activity-lottery/?channel=' + SDW_WEB.channel +
                        '&_sender_sdw_rfid_=' + SDW_WEB.USER_INFO.uid;
                };

                // 清除之前的分享设置
                if (SDW_WEB.mySetTimer) {
                    clearTimeout(SDW_WEB.mySetTimer);
                    SDW_WEB.mySetTimer = null;
                }




                SDW_WEB.sdw.onSetShareOperate({
                    title: '疯狂摇奖瓜分500万，手慢即将错过',
                    desc: '海量福利大派送，现在参加，享受双倍福利。',
                    link: setShareLink(),

                    imgUrl: 'https://www.shandw.com/m/activity-lottery/images/activitylotteryicon.png',
                    success: indexData.successShareFn
                });


                setTimeout(function () {

                    var meta = document.getElementsByTagName('meta');
                    for (var i = 0; i < meta.length; i++) {
                        var _item = meta[i];
                        if (_item.name == 'description') {
                            _item.content = '红包随时提现，现在开抢，享受双倍福利~'
                        }
                    }

                }, 300);


            }else{
                dialog.show('error', data.msg, 1);
            }

        });

    },

    // 分享成功后的回调方法--
    successShareFn: function () {

        dialog.show('ok', '分享成功', 1);

        var _key = '_HB_ACTIVITY_LOTTERY_' + SDW_WEB.USER_INFO.uid + SDW_WEB.version;

        var FIRST_TIME = SDW_WEB.Store.get(_key, true);

        if (!FIRST_TIME) {

            SDW_WEB.Store.set(_key, 'finished', 1);

            // 发送请求--
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'hbwhhshare');


            SDW_WEB.getAjaxData(postUri, function (data) {
                if (data.result == 1) {
                    dialog.show('ok', '分享成功，额外获得一次摇奖机会', 1);
                    indexData.userInfo.num++;
                }
            });
        }

    },

    // 点击提现，只能在APP内
    getMoneyBtn: function () {

        if (SDW_WEB.onShandw) {

            // 跳转到领取界面
            SDW_WEB.openNewWindow({
                title: '红包提现',
                link: 'http://www.shandw.com/redPacket/?v=' + SDW_WEB.version,
                isFullScreen: false,
                showMoreBtn: true
            });

        } else {
            this.showTixian = true;
        }
    },

    goToRule: function () {

        document.body.scrollTop = document.documentElement.scrollTop = 10000;
    },

    findIdx: function (item) {

        for (var i = 0; i < indexData.lottery.lottery.length; i++) {

            if (indexData.lottery.lottery[i] * 100 == item) {
                return i;
            }
        }

        return 0;
    },

    // 开始摇奖
    getLotteryFn: function () {
        var self = this;

        // 防止多次点击
        if (indexData.startLottery || indexData.showNotWindow != '') return;


        if (indexData.userInfo.num <= 0) {

            dialog.show('error', '您的摇奖次数不足', 1);
            // this.showNotNum = true;
        } else {

            indexData.startLottery = true;

            // 请求摇奖
            self.lottery.startTime = +new Date();
            self.lottery.items[self.lottery.stateIndex].classList.add('cell-box-container-select');
            self.lottery.timer = requestAnimationFrame(self.lotteryLight);

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'hbwhhlotto');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result == 1) {

                    indexData.lottery.aniObj.stop = self.findIdx(data.money);

                    indexData.callback = function () {
                        indexData.showLotteryResult = true;
                        indexData.showLotteryResultMoney = data.money / 100;
                        indexData.userInfo.money += data.money / 100;
                        indexData.userInfo.num--;
                    }

                } else {
                    dialog.show('error', data.msg, 1);
                }
            });

        }

    },

    // 初始化摇奖
    initLotteryFn: function () {

        var self = this, lottery = indexData.lottery;

        indexData.startLottery = false;
        lottery.stateIndex = 0;

        // 根据请求回来的数据进行处理
        var t = Math.max(0, 40);
        var n = /^\+?[1-9][0-9]*$/.test(t / 8 + '') ? t / 8 : t / 8 + 1;

        lottery.aniObj.time = n * 8;
        lottery.aniObj.stop = 1;  // 设置停止的位置INDEX
        lottery.aniObj.aniTime = 100;
        lottery.aniObj.canplay = 1;

        !lottery.items && (lottery.items = document.querySelectorAll('.cell-box-container'));

        var lIS = document.querySelector('.cell-box-container-select');
        if (lIS) {
            lIS.classList.remove('cell-box-container-select');
        }

        // 初始化摇奖的回调函数
        indexData.callback = null;
    },

    // 触电旋转动画
    lotteryLight: function () {

        var lot = indexData.lottery;

        var now = +new Date();

        if (now - lot.startTime >= lot.aniObj.aniTime) {

            lot.startTime = now;

            if (lot.aniObj.stop > lot.stateIndex - 40) {

                lot.items[lot.stateIndex % 8].classList.remove('cell-box-container-select');

                // 添加下一个选中的样式
                lot.stateIndex++;
                lot.items[lot.stateIndex % 8].classList.add('cell-box-container-select');
            }


            // 判断是否减缓速度
            if (lot.aniObj.time <= lot.stateIndex) {

                lot.aniObj.aniTime = 150 + Math.min(150, (lot.stateIndex - lot.aniObj.time + 1) * 2.01 * 40);

                // 终止动画，显示奖励 == >
                if (lot.aniObj.stop == lot.stateIndex - 40) {

                    lot.aniObj.canplay = 0;
                    // 延迟显示动画
                    setTimeout(function () {

                        if (indexData.callback) {
                            indexData.callback();
                        } else {
                            indexData.startLottery = false;
                            dialog.show('error', '系统繁忙，请稍后再试', 1);
                        }

                    }, lot.aniObj.aniTime * 2);
                }

            }
        }

        if (lot.aniObj.canplay)
            lot.timer = requestAnimationFrame(this.lotteryLight);
    },

    // 关闭弹窗界面
    closeMaskContainer: function () {
        this.showTixian = false;
        this.showLotteryResult = false;
        this.showNotNum = false;
        this.showTip = false ;
        this.initLotteryFn();
    },

    // 下载APP
    downloadApp: function () {
        location.href = 'http://www.shandw.com/app/download/'
    },

    // 切换用户
    switchUser: function () {
        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.logout();
        }
    }
};

var activityLotteryView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods
});

if (SDW_WEB.onShandw) {

    // 设置APP的底部工具栏按钮
    SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo', 'copyLink']);


    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {

        // 没有使用微信登录，提示要使用微信账号登录。   8代表APP的微信登录
        if (userData.fl != 8) {
            indexData.showNotWindow = '2';
            indexMethods.forbiddenScroll(true);
        }

        activityLotteryView.$nextTick(function () {
            activityLotteryView._init();
        });

    }, function () {
        alert('获取用户信息失败')
    });

} else {
    activityLotteryView.$nextTick(function () {
        activityLotteryView._init();
    });
}







