/**
 *
 * 移动版-游戏界面（如果在PC端，移动地址会自动跳转到PC的游戏界面）
 *
 * #####################################################################################################################
 * #####################################################################################################################
 *
 * -------- 闪电玩游戏地址运行环境（除闪电玩APP） --------
 *
 * QQ|微信|微博|支付宝 等APP（无游客，有退弹）
 *
 * 外部环境[指常规浏览器]（可游客-不能支付|已登录-可支付，有退弹）
 *
 * 口袋|野蛮人助手（无游客，无退弹）
 *
 * #####################################################################################################################
 * #####################################################################################################################
 *
 * -------- 闪电玩APP的版本分类 --------
 *
 * 普通APP（无游客，无退弹），单款游戏的微端（初始IMEI模式进入-可支付|已绑定登录-可支付，无退弹）
 *
 * 安卓特有版本：普通APP+游戏的微端（无游客，有特殊退弹，需要手机号登录）
 *
 * #####################################################################################################################
 * #####################################################################################################################
 *
 * -------- 游戏横竖屏兼容性问题 --------
 *
 * 1.在闪电玩APP中，横屏和竖屏不能随意切换，需要进去的时候确认。换言之，横屏只能玩横屏的游戏，竖屏只能玩竖屏的游戏。
 *
 * 2.在口袋梦三APP中，只有全屏、非全屏，不存在横屏。
 *
 * 3.其余环境，一律都是竖屏模式、非全屏。
 *
 * 局部变量landscape用于标记是否是横屏（目前是闪电玩APP中-安卓新版本）
 *
 * #####################################################################################################################
 * #####################################################################################################################
 *
 */

// var ChatRoom = require('./ChatRoom');
// var Barrage = require('./Barrage-canvas');
var ActivityConfig = require('../libs/config');
var DragTouch = require('./DragTouch');
var TransServerDate = require('./libs/TransServerDate');
//var identifyContainer = require('../../components/identify/identify.vue');
//console.log(identifyContainer);
var toolWindow = {};
require('../../components/mobile/login/login.scss');
window.touch = null;
window.loadPageTime = +new Date();
window.NOW_TIME = +new Date();
window.SERVER_TIME = null;
var refreshTime = 0;

var $giftBgContainer = document.querySelector('.gift-bg-container'),
    $gameCode = document.querySelector('.game-code'),
    $gotoGameBtn = document.querySelector('.goto-game-btn');

var Clipboard = require('./libs/clipboard.min');

// 初始化点击的
function initBtnCode() {
    // 初始化
    var clipboard, clipboard2,clipboard2;

    clipboard = new Clipboard('.game-code');
    clipboard2 = new Clipboard('.goto-game-btn');
    clipboard3 = new Clipboard('.clip-uid');
   var test = document.querySelector('.clip-uid');
   test.dataset.clipboardText = SDW_WEB.USER_INFO.uid;
   //  test.onclick =function () {
   //      dialog.show('ok', '请长按用户id进行复制', 1);
   //  }
    clipboard.on('success', function (e) {
        dialog.show('ok', '礼包码已经复制到剪切板，快去玩游戏吧', 1);
    });

    clipboard.on('error', function (e) {
        dialog.show('error', '请长按礼包码进行复制', 1);
    });

    clipboard2.on('success', function (e) {
        dialog.show('ok', '礼包码已经复制到剪切板，快去玩游戏吧', 1);
    });

    clipboard2.on('error', function (e) {
        dialog.show('error', '请长按礼包码进行复制', 1);

    });

    clipboard3.on('success', function (e) {
        dialog.show('ok', '复制成功', 1);
    });

    clipboard3.on('error', function (e) {
        dialog.show('error', '请长按用户id进行复制', 1);

    });
    // 隐藏主界面
    $giftBgContainer.onclick = function (e) {
        var target = e.target;
        if (target.className === 'gift-bg-container') {
            setGiftContainerView('none');
        }
    }
}



function setCopyBtnText(text) {
    $gameCode.dataset.clipboardText = text;
    $gameCode.innerText = text;
    $gotoGameBtn.dataset.clipboardText = text;
}

function setGiftContainerView(show) {
    $giftBgContainer.style.display = show;
}



// var serverGameItem = require('../../components/mobile/server-game-item/server-game-item.vue');
// var microBingPhone = require('../../components/mobile/micro-bind-phone/micro-bind-phone.vue');

var landscape = SDW_WEB.queryParam['screen'] == '1' || SDW_WEB.queryParam['screen'] == '3';  // 是否是横屏游戏

if (landscape) {
    landscape = SDW_WEB.onShandw && SDW_WEB.onAndriod; // 目前就安卓才有
}

if (!SDW_WEB.onAPPs) {

    if (SDW_WEB.width > SDW_WEB.height) {
        landscape = true;
    }
}

// 滚动导航管理对象
var SliderNavManager = {

    _init: false,

    aniClassName: landscape ? 'm-s-l-trans-2' : 'm-s-l-trans',
    delTime: landscape ? 250 : 80,

    init: function (id) {

        this._init = true;

        this.sliderDom = document.querySelector(id);
        this.sliderNavList = document.querySelectorAll('[data-slider="1"]');

        for (var i = 0; i < this.sliderNavList.length; i++) {
            this.sliderNavList[i].classList.add(this.aniClassName);
        }
        initBtnCode();
    },

    sliderTo: function (x, y) {

        if (!this._init) return;
        if (!this.sliderDom) return;

        // 设置动画的时间
        this.setAnimation(0.38);

        var tranSty = 'translate3d(' + x + 'px,' + y + 'px,0)';

        this.sliderDom.style.transform = tranSty;
        this.sliderDom.style.webkitTransform = tranSty;
        this.sliderDom.style.msTransform = tranSty;

    },

    refreshNavList: function () {
        this.sliderNavList = document.querySelectorAll('[data-slider="1"]');
    },

    setAnimation: function (time, delay, dom) {

        if (!this._init) return;

        delay = delay || 0;
        dom = dom || this.sliderDom;

        var timeStr = time + 's ' + delay + 's';
        dom.style.transition = timeStr;
        dom.style.webkitTransition = timeStr;
        dom.style.msTransition = timeStr;

    },

    // 显示导航
    showNavList: function () {
        if (!this._init) return;
        for (var i = 0; i < this.sliderNavList.length; i++) {
            this.setAnimation(0.19, i * 0.1, this.sliderNavList[i]);
            this.sliderNavList[i].classList.remove(this.aniClassName);
        }
    },


    // 隐藏导航
    hiddenNavList: function () {
        if (!this._init) return;
        for (var i = 0; i < this.sliderNavList.length; i++) {
            this.setAnimation(0, 0, this.sliderNavList[i]);
            this.sliderNavList[i].classList.add(this.aniClassName);
        }
    }

};

(function ($) {

    var isSimple = SDW_WEB.readParam('sdw_simple');  // 简易版闪电玩

    var PRE_DATE = {}, chatRoom = null, scrolls = [], barrage, navConfigs = [];
    var Image_URL = 'https://www.shandw.com/v2/mobile/game/images/';

    /*右侧导航栏配置*/
    var navMap = {
        desktop: '保存',
        gift: '礼包',
        game: '游戏',
        chat: '畅聊',
        close: '收起',
        server: '新服',
        kf: '客服',
        activity: ActivityConfig.activityName,
        refresh: '刷新',
        checkin: '签到'
    };
    if (SDW_WEB.onMicroSDWAPP) {
        navConfigs.push('gift');
    }
    if (ActivityConfig.state) {
        navConfigs.push('activity');
    }
    if (SDW_WEB.onMicroSDWAPP) {
        navConfigs.push('server');
    } else {
        navConfigs.push('game');
        if (!isSimple) {
            navConfigs.push('checkin');
        }
        if (!SDW_WEB.onAPPs && !isSimple) {
            navConfigs.push('desktop');
        }
        navConfigs.push('gift');
        navConfigs.push('server');
    }
    // flag [2018-01-11 16:29:52] 横屏模式下，不显示收起
    if (!landscape) {
        navConfigs.push('refresh');
        navConfigs.push('close');
    }
    // 客服按钮
    navConfigs.push('kf');

    /*右侧导航栏配置*/

    function initNavs() {

        var navs = [];
        for (var i = 0; i < navConfigs.length; i++) {
            var item = navConfigs[i];
            navs.push({
                index: item,
                showPop: true,
                title: navMap[item],
                icons: item,
                firstTap: false
            });
        }

        return navs;
    }

    function initNavsTap() {
        var navs = {};

        for (var i = 0; i < navConfigs.length; i++) {
            var item = navConfigs[i];
            navs[item] = 0;
        }

        return navs;
    }

    function checkBrowser() {

        if (SDW_WEB.onQQ || SDW_WEB.onWeiXin || SDW_WEB.onWeiBo) {
            return [];
        }

        return ['weixin', 'weibo', 'qq', 'dh'];
    }

    var ratio = 1;

    // var c = SDW_WEB.height;
    // var t = 120 * ratio, t2 = 240 * ratio;
    // var chatH = 100 * ratio;

    var myGameMap = {};

    function setUserAvatar() {
        SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};
        var avatar = SDW_WEB.USER_INFO.avatar;
        avatar = avatar || 'https://www.shandw.com/pc/images/mandef.png';
        indexData.myAvatar = avatar;
        return avatar;
    }

    function setUserNick() {
        SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};
        var nick = SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid;
        indexData.myNick = nick;
        indexData.myUid = SDW_WEB.USER_INFO.uid
        return nick;
    }

    function setUserBarrage() {
        SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};
        var uid = SDW_WEB.USER_INFO.uid;
        var flag = localStorage['_my_barrageFlag' + uid] == 'true';

        indexData.barrageFlag = ''; // 现在全部为关闭
        return flag;
    }

    // flag [2018-01-22 11:10:49] 车来了APP
    var hideDownLoadAPP = SDW_WEB.queryParam['channel'] == '10542' || SDW_WEB.readParam('sdw_dl');


    var indexData = {
        id:null,
        name:null,
        errorTip:null,
        hasIdInfo:true,
        showIdContainer:false,
        onBwt:SDW_WEB.channel == '11915',
        activity : ActivityConfig,
        myNickTop: 0.75,
        showMyGolds: true,
        showRes: null,
        showGoldRes: false,
        showMoneyRes: false,
        showNum: '',
        showactivity:0,
        showDownloadC: false,
        myMoney: 500,
        checkList: [],

        showSaishi: false,

        hideDownLoadAPP: hideDownLoadAPP,  // 车来了
        landscape: landscape,   // 是否是横屏游戏
        showMoreBtn: SDW_WEB.onShandw,
        gameName: '',
        fullscreen: false,
        hasActivity: false,
        eggInfo: {
            state: 'sdw'
        },
        bannerTags: [
            {
                type: '礼包',
                cl: 'g-l-5'
            }
        ],
        unloadInfo: {
            alert: {
                icon: '',
                url: ''
            },
            alertGames: []

        },

        isShowHotGame: true,

        // 是否显示绑定提示框
        tipWindow: 0,

        // ==================================================s======
        // 4个顶部的UI展示设置
        // ========================================================
        // 闪电玩不显示【下载APP】
        showDownload: !(SDW_WEB.onShandw || (SDW_WEB.onIOS && SDW_WEB.channel === '10083') || hideDownLoadAPP),
        // 微信中显示【收藏订阅】
        showCollect: true,
        // 返回首页,只在闪电玩APP中显示
        showGotoIndex: SDW_WEB.onShandw,
        // APP中出现切换账号
        showLogout: false,

        // 4个顶部的UI展示设置 ========================================================

        // safari原生浏览器展示底部的小浮窗
        onSafari: 0,

        loginIcons: checkBrowser(),
        loginMask: SDW_WEB.onIOS ? 'ios-mask' : 'and-mask',

        loginFlagV2: 0,

        APP_ROOT_PAGE: SDW_PATH.MOBILE_ROOT + 'index/?channel=' + SDW_WEB.channel + '&ver=' + SDW_WEB.version,

        visitorNavs: {
            index: 1
        },

        newBottomNav: ['我的游戏', '返回平台', '残忍离开'],

        isVisitor: visitorMode.isVisitor,
        chatFlag: true,          // 聊天开启标志
        showUnloadPage: false,   // 退弹标记
        pageWidth: SDW_WEB.width,
        // pagesHeight: c - t,          // 不减去高度
        // visitorPagesHeight: c - t2,
        pagesHeight: 0,          // 不减去高度
        visitorPagesHeight: 0,
        // chatHeight: chatH,
        myAvatar: '',
        myNick: '',
        myUid:'',
        browserTips: checkBrowserTips(),
        myGold: 0,
        showEwm: 0,
        showEwmFlag: 0,
        fchidden: 1,
        myGifts: 0,    // 礼包的数量
        myServer: 0,   // 开服的数量
        appType: checkType(),
        gid: SDW_WEB.MOBILE_GAME_GID,
        navs: initNavs(),
        navsTap: initNavsTap(),
        giftLists: [],
        userInputWindow: 0,

        // 判断微端退弹是否被选中
        microUnloadSelect: false,

        // 闪电玩APP+推荐游戏 安卓微端
        microApp: SDW_WEB.onShandwMicroGame && SDW_WEB.onAndriod,
        // microApp: SDW_WEB.queryParam['micro'],

        // 推荐游戏的版块
        tuijianLists: [],

        // 最近游戏的版块
        zuijinLists: [],

        // 已经开服
        serverGameModuleListCurrent: [],
        serverGameModuleList: [],

        // 预计开服
        bServerGameModuleListCurrent: [],
        bServerGameModuleList: [],

        firstLoadHotGame: true,

        // 退弹的推荐游戏
        unloadLists: [],

        userInputsMsg: '',

        // 弹幕开关标志
        barrageFlag: '',
        // barrageFlag: true,

        // 聊天的记录
        chatsLists: [
            // {
            //     isMe: true,
            //     chatMsg: '你好啊，我是其他人的聊天记',
            //     userName: '魔性的名称'
            // },
            // {
            //     isTime: '15:19'
            // },
        ],

        phoneLoginData: {
            getCodeFlag: false,
            phoneNum: '',
            phoneCode: '',
            RES_TIME: '',
            timerHand: null
        },

        phoneBindData: {
            bindTime: '',
            getCodeFlag: false,
            phoneNum: '',
            phoneCode: '',
            RES_TIME: '',
            timerHand: null,
            bindMsg: '获取验证码',
            bindStartTimer: 60,
        },

        // 在微端才有登录
        showMicroBingPhone: SDW_WEB.onMicroSDWAPP,

        timerHand: null,
        codeMessage: '获取验证码'
    };

    // flag [2018-09-14 10:29:56] 新增隐藏客服的按钮
    if (SDW_WEB.readParam('sdw_kf')) {
        indexData.showCollect = false;
    }


    // flag [2018-09-20 10:07:57] 对简易版做处理
    if (isSimple) {
        indexData.showMyGolds = !isSimple; // 简易版不显示闪电币
        indexData.showGotoIndex = true; // 显示返回首页
        indexData.showDownload = false; // 关闭下载按钮
        //indexData.myNickTop = 1.45;   // 昵称的高度
    }

    // if (ActivityConfig.toolIconType) {
    //
    //     var ActivityTimer = require('./libs/ActivityTimer.js');
    //
    //     // 活动的信息管理
    //     indexData.eggInfo = new ActivityTimer();
    //
    //     indexData.eggInfo.computeTimeStr = function (dT) {
    //         var hours = parseInt(dT / 1000 / 60 / 60 % 24, 10); //计算剩余的小时
    //         var minutes = parseInt(dT / 1000 / 60 % 60, 10);//计算剩余的分钟
    //         var seconds = parseInt(dT / 1000 % 60, 10);//计算剩余的秒数
    //         return hours + ':' + minutes + ':' + seconds;
    //     };
    //
    //     indexData.eggInfo.timerMessage = '';
    //
    //     indexData.eggInfo.scheduleUpdate(function () {
    //         var self = indexData.eggInfo;
    //         self.timerMessage = self.computeTimeStr(self.endTime - self.getNow());
    //     });
    //
    //     indexData.hasActivity = true;
    // } else {
    //     indexData.eggInfo.state = 'sdw';
    // }


    function ERROR_FN(data) {
        dialog.show('error', data.msg, 1);
    }


    // 计算高度
    window._calPageHeight = function () {

        var fullScreenTop = document.querySelector('.full-screen-top');

        var myTopCont = document.querySelector('#my-top-cont') || {};
        var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
        var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
        WIDTH = Math.min(WIDTH, HEIGHT);

        ratio = ((WIDTH / 320 * 16) / 32 * 0.853);

        var t = myTopCont.offsetHeight || 0, t2 = 240 * ratio;
        indexData.fullscreen = window._fullScreen;

        // 横屏或全屏游戏下的高度需要减去
        if (indexData.fullscreen || indexData.landscape) {
            indexData.pagesHeight = HEIGHT - t - fullScreenTop.offsetHeight;
        } else {
            indexData.pagesHeight = HEIGHT - t;
        }


        indexData.visitorPagesHeight = HEIGHT - t2;
        SDW_WEB.setHTMLFontSize();
        setTimeout(methods.refreshScrollDom, 200);

        $('#g-container').css({
            height: HEIGHT + 'px'
        });

        // 需要实现判断是否被初始化了
        window.touch && window.touch.hiddenState(); // 悬浮窗是收起状态
    };


    window.pageSwiper = null;
    var unloadBannerList = [];
    var methods = {

        getIdInfo:function () {
            var self = this,
                getUrl = SDW_WEB.URLS.addParam({
                    uid: SDW_WEB.USER_INFO.uid,
                }, false, HTTP_STATIC + 'queryAccessRealName');

            SDW_WEB.getAjaxData(getUrl, function (data) {
                console.log(data);
                if (data.result === 1) {
                    self.hasIdInfo = false ;

                }else if(data.result === 2 ){
                    self.hasIdInfo = true ;
                    self.name = data.data.name ;
                    self.id = data.data.idcard.replace(/^(.{4})(?:\d+)(.{4})$/,"$1******$2")
                }
                else{
                    dialog.show('error',data.msg,1);
                }
            })
        },
        identify:function () {
            var self = this;
            var checkIdResult = this.cidInfo(String(this.id)) ;
            if(checkIdResult){
                this.errorTip = checkIdResult;
                return ;
            }
            if(!this.name){
                this.errorTip = '请填写真实姓名';
                return ;
            }
            this.errorTip = null;
            dialog.show('loading', '正在认证...');
            var postUri = SDW_WEB.URLS.addParam({
                userid:SDW_WEB.USER_INFO.uid,
                name:this.name,
                idcard:this.id,
               // regip:returnCitySN.cip,
            },false,'https://platform.shandw.com/accessRealName');
            SDW_WEB.getAjaxData(postUri,function (data) {
                dialog.hidden();
                if (data.result === 1) {
                    self.hasIdInfo = true ;
                    dialog.show('ok','认证成功',1);
                }else{
                    dialog.show('error',data.msg,1);
                }
            });
        },
        cidInfo:function(sId){
            var aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"}
            var iSum=0
            var info=""
            if(!/^\d{17}(\d|x)$/i.test(sId))return '身份证号格式有误';
            console.log(sId);
            sId=sId.replace(/x$/i,"a");
            if(aCity[parseInt(sId.substr(0,2))]==null) return "非法地区";
            sBirthday=sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2));
            var d=new Date(sBirthday.replace(/-/g,"/"));

            if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate())) return "非法生日";

            for(var i = 17;i>=0;i --) iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11)
            if(iSum%11!=1) return "非法证号";
            //if(!this.IsAdult(d)) return "未成年不支持认证";
            return false ;
            // return aCity[parseInt(sId.substr(0,2))]+","+sBirthday+","+(sId.substr(16,1)%2?"男":"女")
        },

        goCUrl: function () {

            if (SDW_WEB.onShandw) {
                SDW_WEB.openNewWindow({
                    title: '红包提现',
                    link: 'http://www.shandw.com/redPacket/?v=' + SDW_WEB.version,
                    isFullScreen: false,
                    showMoreBtn: true
                })
            } else {
                // 显示提示到闪电玩中打开
                this.showDownloadC = true;
            }

        },

        // showTools: function () {
        //     SDW_WEB.sdw.onShowToolBar();
        // },

        replaceHref: function (url) {
            if (!url) return;
            if (location.replace) {
                location.replace(url)
            } else {
                location.href = url;
            }
        },
        gotoSaishiPage: function (hidden) {
            if (hidden) {
                this.showSaishi = 0;
                this.fchiddenFn(1);
            } else {
                this.replaceHref('http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel);
            }
        },
        saishiInfo: function () {
            SDW_WEB.addCount('saishiGame');
            this.showSaishi = 1;
        },


        // switchFullScreen: function () {
        //
        //     if (this.fullscreen) {
        //         window._SDW_MessageEvents.exitFullScreen();
        //         // this.fullscreen = false;
        //     } else {
        //         window._SDW_MessageEvents.requestFullScreen();
        //         // this.fullscreen = true;
        //     }
        // },
        closeWebView: function () {
            // dialog.show('loading', '页面切换中...');
            if (SDW_WEB.onKD) {

                if (SDW_WEB.onIOS) {
                    callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 5})));

                    setTimeout(function () {
                        callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 3})))
                    }, 300);

                } else {
                    kdjs.callOpenKDTopBar();
                    kdjs.callCloseCurPage();
                }


            } else if (SDW_WEB.onShandw || SDW_WEB.onMDZZHelper) {

                SDW_WEB.sdw.exitFullScreen({
                    success: function () {
                        setTimeout(function () {
                            SDW_WEB.sdw.closeWindow();
                        }, 300);
                    }
                });

            } else {
                this.gotoIndexPage();
            }
        },

        // 加载活动的数据
        loadActivityToolInfo: function () {
            var self = this;
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
            }, false, ActivityConfig.toolInfoUrl);

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result === 1) {

                    if (!data.data) {

                        // 没有任何蛋
                        self.eggInfo.state = 'normal';
                    } else {

                        var eggData = data.data;
                        // 0待孵化，1倒计时，2已经孵化完成。
                        if (eggData.flag === 0) {

                            self.eggInfo.state = 'normal';
                        } else if (eggData.flag === 1) {

                            self.eggInfo.setBaseTime(data.ct);

                            self.eggInfo.startTimer(eggData.endtime);

                        } else if (eggData.flag === 2) {

                            self.eggInfo.state = 'finish';
                        }
                    }

                } else {
                    // 普通状态
                    self.eggInfo.state = 'sdw';
                }

                window.touch.target.style.visibility = 'visible';
            })

        },

        // 获取退弹的数据信息
        getUnloadPageInfo: function (callback) {
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                id: SDW_WEB.MOBILE_GAME_GID
                // id: '123'
            }, false, 'http://platform.shandw.com/tuitan');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.banners) {
                    methods.createBanner(data.banners);
                    indexData.unloadLists = data.games;
                    callback && callback();
                }

            });
        },

        // 创建退弹的轮播信息
        createBanner: function (banner) {
            var tagsFn = function (tip) {
                var res = [], _tags = tip.split(',');
                // 大标签的样式对应
                var colorMap = {
                    '热门': 'g-l-5',
                    '精品': 'g-l-3',
                    '礼包': 'g-l-4',
                    '最新': 'g-l-1',
                    '独家': 'g-l-2',
                    '首发': 'g-l-6',
                    '删档': 'g-l-7',
                    '限号': 'g-l-8',
                    '封测': 'g-l-9',
                    '走心': 'g-l-10',
                };
                for (var i = 0; i < _tags.length; i++) {
                    res.push({
                        type: _tags[i],
                        cl: colorMap[_tags[i]]
                    });
                }
                return res;
            };

            var tags_HTML = '<div class="tag-list">TAG_HTML</div>';
            var TEMP_HTML = '<div class="swiper-slide slider-img"><img src=D_IMG  data-index=D_INDEX><div class="tag-list">TAG_HTML</div>',
                allInners = '';

            unloadBannerList = banner || [];
            unloadBannerList.forEach(function (item, index) {
                // 动态生成tags
                var tags = tagsFn(item.tip);
                var tStr = '';
                for (var j = 0; j < tags.length; j++) {
                    tStr += '<i class="tags ' + tags[j].cl + '"></i>';
                }
                var innerTag = tags_HTML.replace(/TAG_HTML/, tStr);
                var inners = TEMP_HTML.replace(/D_IMG/, item.icon).replace(/D_INDEX/, index).replace(/TAG_HTML/, innerTag);
                allInners += inners;
            });

            document.querySelector('#bannercont').innerHTML = allInners;

            setTimeout(function () {

                var swiperOption = {
                    centeredSlides: true,
                    slidesPerView: 'auto',
                    grabCursor: true,
                };

                swiperOption.autoplayDisableOnInteraction = false;

                if (banner.length > 1) {
                    swiperOption.loop = true;
                    swiperOption.autoplay = 5000;
                }
                pageSwiper || (pageSwiper = new Swiper('.banners', swiperOption));

                // 添加点击事件
                var sliderImg = document.querySelectorAll('.slider-img img') || [];
                for (var i = 0; i < sliderImg.length; i++) {
                    sliderImg[i].onclick = function (e) {
                        methods.clickBannerEvt(parseInt(this.dataset.index));
                    }
                }
            }, 200);
        },

        // 轮播图的点击
        clickBannerEvt: function (index) {

            // console.log(index);
            var item = unloadBannerList[index];
            if (item.link) {
                this.replaceHref(unloadBannerList[index].link);
            } else {
                this.goToGames({id: item.gid});
            }
        },

        /**
         * 底部的功能按钮
         * @param index
         */
        bottomNavFn: function (index) {
            if (index === 2) {
                window.history.back();
            } else if (index === 1) {
                // 返回平台
                this.gotoIndexPage();
            } else if (index === 0) {
                // 去我玩过的界面
                this.replaceHref(SDW_PATH.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel);
            }
        },

        addQQChat: function () {

            var QQ_SRC = 'https://jq.qq.com/?_wv=1027&k=5W2KHo7';


            if (SDW_WEB.onMicroSDWAPP && SDW_WEB.onIOS) {
                SDW_WEB.sdw.kd.openSafari({'link': QQ_SRC})
            } else {
                // var ifm = document.createElement('iframe');
                // ifm.src = QQ_SRC;
                // ifm.style.display = 'none';
                // document.body.appendChild(ifm);
                location.href = QQ_SRC;
            }
        },

        // 关闭APP的页面
        closeCurrentPage: function () {
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.closeWindow();
            }
        },

        // 变更微端的选中样式
        changeUnloadSelect: function () {

            // 设置本地缓存
            SDW_WEB.Store.set(window.unloadStorageFlg, {
                show: this.microUnloadSelect,
                time: +new Date()
            }, 1);

            this.microUnloadSelect = !this.microUnloadSelect;

            this.$nextTick(function () {

            });
        },

        setCopyContext: function (text) {

            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.setClipboard(text);
                dialog.show('ok', '礼包码已经复制到剪切板，快到游戏中领取吧', 1);
            } else {
                dialog.hidden();
            }

            setGiftContainerView('block');
            setCopyBtnText(text);
        },

        setCopyUid: function () {

            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.setClipboard();
                dialog.show('ok', '复制成功', 1);
            } else {
                dialog.hidden();
            }
            setCopyBtnText(text);
        },
        transServerDate: function (time, isPrv) {
            return TransServerDate(time, window.SERVER_TIME, isPrv);
        },

        changeGameListState: function (isHot) {

            var self = this;

            self.isShowHotGame = isHot;

            // 加载初始的新服预告
            if (isHot === 0 && self.firstLoadHotGame) {
                self.firstLoadHotGame = false;
                self.loadServerGame();
            }

            // 强制刷新
            this.$nextTick(function () {
                setTimeout(self.refreshScrollDom, 200);
            })
        },

        // 加载开服游戏列表
        loadServerGame: function () {

            var self = this;

            var type = self.isShowHotGame ? 0 : 1;   // 0已经开服，1预计开服   isShowHotGame(已经开服)
            var getUri = HTTP_STATIC + 'serverinfo?type=' + type;

            SDW_WEB.getAjaxData(getUri, function (data) {

                window.SERVER_TIME = data.ct;
                window.PAGE_TIME = data.ct;

                if (data.result === 1 && data.list && data.list.length) {

                    // 开服的类型
                    var addType = type ? 'bServerGameModuleList' : 'serverGameModuleList';
                    var addTypeCurrent = type ? 'bServerGameModuleListCurrent' : 'serverGameModuleListCurrent';

                    for (var i = 0; i < data.list.length; i++) {

                        var item = data.list[i];

                        item.serverDateStr = self.transServerDate(item.sTime, type);

                        item.id = item.appId;

                        // 筛选显示  ===
                        if (item.appId == SDW_WEB.MOBILE_GAME_GID) {
                            type || self.myServer++;

                            self[addTypeCurrent].push(item);
                        } else {
                            self[addType].push(item);
                        }

                    }

                    // self[addType] = self[addType].concat(data.list || []);

                    self.$nextTick(function () {

                        setTimeout(self.refreshScrollDom, 200);
                        // self.refreshScrollDom();
                    })

                } else if (data.result !== 1) {

                    dialog.show('error', data.msg, 1);
                }

            });

        },

        // 返回闪电玩首页
        gotoIndexPage: function () {
            // dialog.show('error',SDW_WEB.TLCJ);
            // return ;
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.switchTab('index');
            } else if(SDW_WEB.TLCJ){
                setTimeout(function () {
                    window.history.back(-1) ;
                },20);
                return ;
            }else {
                var url = this.APP_ROOT_PAGE;
                switch(Number(isSimple)){
                    // 1简化版黑主题
                    case 1:
                        url = "http://www.shandw.com/m/indexTemp/?channel=" + SDW_WEB.channel;
                        break;
                    // 2简化版白主题
                    case 2:
                        url = "http://www.shandw.com/m/indexTemp/?theme=bright&channel=" + SDW_WEB.channel;
                        break;
                    // 3简化版大图标
                    case 3:
                        url = "http://www.shandw.com/m/indexTemp/brightindex.html?channel=" + SDW_WEB.channel;
                        break;
                    // 4京东版大图标
                    case 4:
                        url = "http://www.shandw.com/m/indexTemp/jdcenter.html?channel=" + SDW_WEB.channel;
                        break;
                    default:
                        url = "http://www.shandw.com/m/index/?channel=" + SDW_WEB.channel;
                        break;
                }
                //console.log(isSimple);
                if (location.replace) {
                    location.replace(url);
                } else {
                    location.href = url;
                }
            }
        },

        // 重置手机数据
        refreshPhoneData: function () {
            this.tipWindow = 0;

            this.phoneLoginData.getCodeFlag = false;
            this.phoneLoginData.phoneNum = '';
            this.phoneLoginData.phoneCode = '';
            this.phoneLoginData.RES_TIME = '';
            this.phoneLoginData.timerHand = null;
            this.codeMessage = '获取验证码';
            clearInterval(this.timerHand);
            this.timerHand = null;
            var codeBtn = document.querySelector('#getCode') || document.querySelector('#getCode-v2') || document.querySelector('#getCode-v3');
            codeBtn.className = 'codenormal';
        },

        /**
         * 验证码倒计时
         */
        timers: function () {

            var self = this, TIMES_ALL = 60;

            var codeBtn = document.querySelector('#getCode') || document.querySelector('#getCode-v2') || document.querySelector('#getCode-v3');
            codeBtn.className = 'codetimer';

            self.codeMessage = (TIMES_ALL--) + '秒后获取';

            self.timerHand = setInterval(function () {
                if (TIMES_ALL <= 0) {
                    clearInterval(self.timerHand);
                    codeBtn.className = 'codenormal';
                    self.codeMessage = '获取验证码';
                    self.phoneLoginData.getCodeFlag = false;
                } else {
                    self.codeMessage = (TIMES_ALL--) + '秒后获取';
                }

            }, 1000);
        },

        // 切换账号
        refreshUser: function () {
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.logout();
            } else {
                this.loginFlagV2 = 1;
            }
        },

        // 下载APP
        downloadFn: function () {

            var uri = 'http://dhurl.cn/jY3yMf';

            if (SDW_WEB.onMicroSDWAPP && SDW_WEB.onIOS) {
                // 微端IOS跳转到safari
                SDW_WEB.sdw.kd.openSafari({
                    link: uri
                });
                return;
            }

            // 下载闪电玩APP的
            if (SDW_WEB.onAndriod && SDW_WEB.onMicroSDWAPP) {
                location.href = 'http://dhurl.cn/2InyQr';
                return;
            }

            location.href = uri;
        },

        // 获取手机验证码
        getPhoneCode: function () {

            var self = this, _data = this.phoneLoginData;

            if (_data.getCodeFlag) return;

            if (/^1\d{10}$/.test(_data.phoneNum)) {

                _data.getCodeFlag = true;

                var visitorToken = self.isVisitor ? '&vst=1&vsttoken=' + visitorMode.visitorToken : '';
                var channel = SDW_WEB.channel;

                // 游戏微端是游客模式
                if (SDW_WEB.onMicroSDWAPP) {
                    visitorToken = '&vst=1&vsttoken=' + visitorMode.visitorToken;
                }

                var times = (+new Date()) / 1000 >> 0;
                var date = new Date().Format("yyyyMMdd");

                var postUri = SDW_WEB.URLS.addParam({
                    channel: channel,
                    phone: _data.phoneNum,
                    time: times,
                    sign: SDW_WEB.MD5("SDW" + date + channel + SDW_WEB.guid + _data.phoneNum + times)
                }, false, HTTP_USER_STATIC + 'telcode');

                dialog.show('loading', '验证码获取中...');

                SDW_WEB.getAjaxData(postUri + visitorToken, function (data) {
                    if (data.result == 1) {
                        _data.RES_TIME = data.time;
                        _data.getCodeFlag = true;
                        self.timers();

                        if (data.phone == 1) {

                            dialog.hidden();
                            // 此手机已经登录过
                            self.tipWindow = 1;

                        } else {
                            dialog.show('ok', '验证码已发送', 1);
                        }
                    } else {
                        _data.getCodeFlag = false;
                        dialog.show('error', data.msg, 1);
                    }
                });

            } else {
                dialog.show('error', '请输入正确的手机号', 1);
            }
        },

        // 手机登录
        phoneLogin: function (isVisitor) {

            var self = this, _data = this.phoneLoginData;

            if (/^1\d{10}$/.test(_data.phoneNum)) {

                if (/^\d+$/.test(_data.phoneCode)) {

                    var visitorToken = isVisitor ? '&vst=1&vsttoken=' + visitorMode.visitorToken : '';

                    var postUri = SDW_WEB.URLS.addParam({
                        channel: SDW_WEB.channel,
                        phone: _data.phoneNum,
                        time: _data.RES_TIME,
                        sign: SDW_WEB.MD5(SDW_WEB.channel + SDW_WEB.guid + _data.phoneNum + _data.RES_TIME + _data.phoneCode)
                    }, false, HTTP_USER_STATIC + 'telcheck');

                    dialog.show('loading', '数据更新中...');

                    SDW_WEB.getAjaxData(postUri + visitorToken, function (data) {

                        if (data.result == 1) {
                            // 重置手机数据
                            self.refreshPhoneData();

                            // v2版本的用户数据  id => uid
                            var v2UserData = {
                                uid: data.id,
                                otoken: data.token,
                                nick: data.nick,
                                sex: data.sex,
                                avatar: data.avatar,
                                city: data.city,
                                fl: data.fl
                            };

                            SDW_WEB.Store.set(SDW_WEB.localItem, v2UserData, true);
                            localStorage.setItem(window.DATAITEM, JSON.stringify(v2UserData));

                            dialog.show('ok', '登录成功', 1);

                            v2UserData.secheme = +new Date();
                            v2UserData.token = SDW_WEB.MD5('' + SDW_WEB.channel + v2UserData.uid + v2UserData.secheme + v2UserData.otoken);

                            SDW_WEB.USER_INFO = v2UserData;

                            self.myNick = data.nick || data.id;
                            self.myUid = data.id;
                            self.myAvatar = v2UserData.avatar || 'https://www.shandw.com/pc/images/mandef.png';

                            toolWindow.setVisitorMode(false);

                            self.$nextTick(function () {

                            });

                            // alert('authGame');
                            authGame(function (data) {
                                dialog.show('ok', '您已登录成功', 1);
                                self.loginFlagV2 = 0;
                                self.showMicroBingPhone = false;
                            });

                        } else {

                            dialog.show('error', data.msg, 1);
                        }
                    });


                } else dialog.show('error', '请输入正确的验证码', 1);

            } else dialog.show('error', '请输入正确的手机号', 1);
        },

        // 使用进行第三方的授权
        visitorAuthTo: function (type) {

            /**
             * 需要带上游客模式下的信息，带入到用户授权
             */

            var authConfig = {
                qq: 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101359011&redirect_uri=URLREPLACE&scope=get_user_info&state=123456&display=mobile',
                wb: 'https://api.weibo.com/oauth2/authorize?client_id=530008665&redirect_uri=URLREPLACE&response_type=code'
            };

            var goToUri = location.href.split('#')[0];

            var authUrl_callback = SDW_WEB.URLS.addParam({

                datatype: window.DATAITEM,
                goto: goToUri,
                channel: SDW_WEB.channel,
                vst: 1,
                vsttoken: visitorMode.visitorToken

            }, true, SDW_WEB.CHECK_URL);


            // 授权成功后返回 check.html页面
            if (type === 'qq') {
                authUrl_callback += '&sdw_authFlag=qq';
                location.href = authConfig['qq'].replace(/URLREPLACE/, encodeURIComponent(authUrl_callback));
            } else if (type === 'wb') {
                authUrl_callback += '&sdw_authFlag=wb';
                location.href = authConfig['wb'].replace(/URLREPLACE/, encodeURIComponent(authUrl_callback));
            }


        },

        showDialog: function (msg) {
            dialog.show('error', msg, 1);
        },

        // 显示退弹页面
        showUnloadPageFn: function () {

            if (this.microUnloadSelect) {

                /*选中不在提醒*/
                this.showUnloadPage = false;

            } else {

                location.href = '#pop';
            }

            // this.showUnloadPage = false;
            // window.history.pushState({oprate: 'show'}, "", '#');
        },

        // 隐藏输入框
        cancelInput: function () {
            document.querySelector('#user-input').blur();
            var self = this;
            setTimeout(function () {
                self.userInputWindow = 0;
            }, 320);
        },

        // 显示输入框
        showUserInput: function () {
            this.userInputWindow = 1;
            document.querySelector('#my-menu').click();
        },

        // 发送文字
        sendUserChatMsg: function () {
            document.querySelector('#user-input').blur();
            // 发送消息指令
            sendMessageFormInput();
        },

        // 变更弹幕
        changeBarrage: function () {

            this.barrageFlag = !this.barrageFlag;

            var uid = SDW_WEB.USER_INFO.uid;
            SDW_WEB.Store.set('_my_barrageFlag' + uid, this.barrageFlag, true);
            // localStorage['_my_barrageFlag' + uid] = this.barrageFlag + '';
        },

        refreshScrollDom: function () {

            for (var i = 0; i < scrolls.length; i++) {
                scrolls[i].refresh();
            }
        },

        // 显示APP的底部工具栏
        showSdwAPPMoreBtn: function () {
            SDW_WEB.onShandw && SDW_WEB.sdw.onShowToolBar();
        },

        refreshGamePage: function () {

            var self = this;

            // 刷新游戏
            dialog.show('loading', '游戏刷新中...');

            var gameContainer = document.querySelector('#my-game-container');
            if (gameContainer && SDW_WEB.MOBILR_GAME_URL_IFRM) {

                // gameContainer.src = SDW_WEB.MOBILR_GAME_URL_IFRM.replace(/&REFRESH_TAG/, '&r_v_=' + refreshTime);
                // refreshTime++;

                gameContainer.contentWindow.location.replace(SDW_WEB.MOBILR_GAME_URL_IFRM.replace(/&REFRESH_TAG/, '&r_v_=' + refreshTime));

                // parent.frames["my-game-container"].location.reload();

                setTimeout(function () {
                    dialog.hidden();
                    // 隐藏悬浮窗
                    self.fchiddenFn(1);
                }, 1000);
            }
        },

        //切换tab页面 -- 已经登录
        tabNav: function (item, index) {

            var self = this;

            // 退出的按钮
            if (item.icons === 'close') {

                // 隐藏悬浮窗
                this.fchiddenFn(1);

            } else if (item.icons === 'refresh') {

                this.refreshGamePage();

            } else {

                // 点击到其他的按钮
                for (var i = 0; i < this.navs.length; i++) {

                    var isCurrent = i == index;

                    this.navs[i].tap = isCurrent;

                    // 首次点击，需要请求数据啥的，进行优化操作
                    if (isCurrent && this.navs[i].firstTap === false) {
                        this.navs[i].firstTap = true;

                        // console.log(this.navs[i].icons);
                        if (this.navs[i].icons === 'checkin') {
                            this.loadSignData();  // 加载签到数据
                        }
                    }

                    // 点击到当前的，隐藏数字气泡
                    this.navs[i].showPop = !isCurrent;

                    // 更新视图模块
                    this.navsTap[this.navs[i].index] = (this.navs[i].index == item.index)
                }

                // 底部的滚动条圆圈  90 + 36 +20
                SliderNavManager.sliderTo(0, index * 146 * ratio);
            }

            this.showEwm = 0;

            this.$nextTick(function () {
                setTimeout(self.refreshScrollDom, 200);
            });
        },

        //切换tab页面 -- 游客模式
        tabNav2: function (index) {

            this.visitorNavs.index = index;

            this.showEwm = 0;

            // console.log(scrolls)
            setTimeout(function () {
                for (var i = 0; i < scrolls.length; i++) {
                    scrolls[i].refresh();
                }
            }, 100)
        },

        getResult: function () {
            // 取最后一个的签到结果
            for (var i = this.checkList.length - 1; i >= 0; i--) {
                var item = this.checkList[i];
                if (item.checkin) {
                    this.showRes = item;
                    this.showNum = item.num;
                    return item;
                }
            }
            return {};
        },

        hideResContainer: function () {
            this.showGoldRes = false;
            this.showMoneyRes = false;
            this.showEggRes = false;
        },

        // 加载签到数据
        loadSignData: function () {

            // 校验时间
            // if (!checkInTime) return;

            var checkUrl = 'checkin';

            var self = this;
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
            }, false, HTTP_STATIC + checkUrl);

            SDW_WEB.getAjaxData(postUri, function (data) {

                var lastCheckIn = 0;

                if (data.result === 1) {

                    data.list = data.list || [];  // 防止没有数据

                    // flag 0 查看  1 签到
                    for (var i = 0; i < data.list.length; i++) {
                        var item = data.list[i];

                        var _checkin = data.checkin;  // 已经签到的数据

                        if (i < _checkin) {
                            data.list[i].checkin = true;
                            lastCheckIn = item.num;
                            if (item.type === 4) {
                                item.num = (item.num / 100).toFixed(2) + '元';
                            }
                        } else {
                            data.list[i].checkin = false;
                            if (item.type === 4) {
                                item.num = '现金红包';
                            }
                        }


                        if (item.icon) {
                            item.myType = -1;
                            // 采用给定的素材
                        } else {
                            item.myType = item.type
                        }

                    }


                    self.checkList = data.list;

                    self.myMoney = (data.redPkt / 100).toFixed(2);


                    // 当日首次签到
                    if (data.flag) {

                        var res = self.getResult();
                        self.showMoneyRes = (res.type === 4);
                        self.showGoldRes = (res.type === 1);
                        self.showEggRes = (res.type === 5);


                        // self.qiandaoCheckIn = 1;
                        // self.showCheckIn();
                        // 新增签到的金币
                        // indexData.userInfos.gold += lastCheckIn;
                    }


                    // self.$nextTick(function () {
                    //     // 签到的小浮窗按钮
                    //     indexData.showQiandao = 1;
                    // });

                } else {

                    dialog.show('error', data.msg, 1);
                }

            });

        },

        // 切换显示二维码
        showEwmFn: function (flag) {

            var self = this;
            for (var i = 0; i < this.navs.length; i++) {
                this.navsTap[this.navs[i].index] = 0;
            }

            this.navsTap['kf'] = 1;

            this.$nextTick(function () {

                setTimeout(function () {
                    self.refreshScrollDom();
                }, 200);

            });
        },

        gotoShandwFn: function () {
            location.href = 'http://dhurl.cn/z2YNNr';
        },

        // 领取礼包或者复制礼包码的功能
        giftBtnFn: function (item) {

            var self = this;

            // 单款游戏微端需要登录后才给领取
            if (SDW_WEB.onMicroSDWAPP && self.showMicroBingPhone) {
                dialog.show('error', '请先登录后再领取礼包', 1);
                return;
            }

            if (item.code == '') {

                if (item.request == 0) {

                    item.request = 1;

                    var postUri = SDW_WEB.URLS.addParam({
                        channel: SDW_WEB.channel,
                        token: SDW_WEB.USER_INFO.token,
                        sec: SDW_WEB.USER_INFO.secheme,
                        uid: SDW_WEB.USER_INFO.uid,
                        gid: this.gid,
                        id: item.id
                    }, false, HTTP_STATIC + 'getgift');

                    dialog.show('loading', '礼包领取中');

                    SDW_WEB.getAjaxData(postUri, function (data) {

                        if (data.result == 1) {
                            item.code = data.code;
                            _myFuchuang.myGifts--;

                            // 提示文字
                            dialog.hidden();
                            self.setCopyContext(item.code);

                        } else {

                            dialog.show('error', data.msg, 1);
                        }
                    });
                }

            } else {
                self.setCopyContext(item.code);
            }
        },

        // 隐藏浮窗主页面
        fchiddenFn: function (flag) {

            indexData.fchidden = flag;
            if (flag) {
                // 非游客模式下，没有右侧导航栏
                if (!visitorMode.isVisitor) {
                    SliderNavManager.setAnimation(0);
                    SliderNavManager.hiddenNavList();
                }
                $('#my-game-container').removeClass('my-game-container-ani');
                // 重新显示悬浮窗按钮
                document.querySelector('#my-menu').style.opacity = '0.5';

            } else {
                // 显示导航栏
                setTimeout(function () {
                    SliderNavManager.showNavList();
                }, SliderNavManager.delTime);
            }

            setTimeout(function () {
                for (var i = 0; i < scrolls.length; i++) {
                    scrolls[i].refresh();
                }
            }, 300);

            this.$nextTick(function () {

            });

        },

        transformQuantity: SDW_WEB.transformQuantity,

        // 游戏礼包
        getGameInfo: function () {

            var self = this;
            var postUri = SDW_WEB.URLS.addParam({
                gid: this.gid
            }, false, HTTP_STATIC + 'gameinfo');

            SDW_WEB.getAjaxData(postUri, function (data) {
                if (data.result === 1) {

                    _myFuchuang.myGifts = data.gift.length;

                    // flag [2018-01-08 13:46:51] 屏蔽礼包为空的悬浮窗切换页面
                    if (data.gift.length === 0 && !SDW_WEB.onMicroSDWAPP) {


                        for (var i = 0; i < self.navs.length; i++) {
                            if (self.navs[i].index === 'gift') {
                                self.navs.splice(i, 1);
                                SliderNavManager.refreshNavList();
                            }
                        }

                    } else {

                        var gifts = [];
                        for (var i = 0; i < data.gift.length; i++) {
                            gifts.push({
                                title: data.gift[i].name,
                                des: data.gift[i].info,
                                num: _myFuchuang.transNum(data.gift[i].num, data.gift[i].count),
                                code: '',
                                id: data.gift[i].id,
                                request: 0
                            });
                        }

                        _myFuchuang.giftLists = gifts;
                    }

                    self.$nextTick(function () {
                        setTimeout(self.refreshScrollDom, 100);
                    })
                }
            });

        },

        /**
         * 获取玩家的游戏记录
         */
        getUserGames: function () {

            var sec = +new Date(), self = this;

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                sec: SDW_WEB.USER_INFO.secheme,
                uid: SDW_WEB.USER_INFO.uid,
                type: 1,
                page: 0
            }, false, HTTP_STATIC + 'usergame');


            // alert(JSON.stringify(SDW_WEB.USER_INFO));

            // alert(postUri);

            SDW_WEB.getAjaxData(postUri, function (data) {

                var myLists = data.list || [];
                var recommend = data.recommend || [];

                var mergerList = mergerData(myLists, recommend, 4);
                var list = [];

                for (var i = 0; i < mergerList.length; i++) {
                    var item = mergerList[i];
                    list.push({
                        title: item.name,
                        icon: item.icon,
                        id: item.id,
                        time: transDate(item.time)
                    });
                }

                // 退弹
                // self.unloadLists = list;

                self.$nextTick(function () {
                    setTimeout(self.refreshScrollDom, 100);
                    // self.createBanner();
                })
            });

            function mergerData(arr1, arr2, len) {

                arr1 = arr1 || [];
                arr2 = arr2 || [];
                var totalLen = arr1.length + arr2.length;
                var minLen = Math.min(totalLen, len);
                var result = arr1.slice(0);
                var i = len - arr1.length;
                for (var i = minLen, j = 0; i > 0; i--, j++) {
                    result.push(arr2[j]);
                }
                return result;
            }
        },

        transNum: function (num, all) {
            return num / all * 100 >> 0;
        },

        // 获取热游游戏
        getGamesInfo: function (option) {

            if (isSimple) {

                // 简易版
                var postUri = SDW_WEB.URLS.addParam({
                    page: 0,
                    type: 0, // 0 网游  1 小游戏
                }, false, HTTP_STATIC + 'simpleGameList');

            } else {
                var postUri = SDW_WEB.URLS.addParam({
                    token: SDW_WEB.USER_INFO.token,
                    sec: SDW_WEB.USER_INFO.secheme,
                    uid: SDW_WEB.USER_INFO.uid,
                    flag: option.flag,
                    type: option.type,
                    page: option.page
                }, false, HTTP_STATIC + 'pcgg');
            }

            SDW_WEB.getAjaxData(postUri, function (data) {
                if (data.result == 1) {
                    var list = [];
                    for (var i = 0; i < data.list.length; i++) {
                        if (!myGameMap[data.list[i].id]) {
                            list.push({
                                title: data.list[i].name,
                                des: data.list[i].sub,
                                icon: data.list[i].icon,
                                id: data.list[i].id,
                                gift: data.list[i].gift
                            });
                        }
                    }
                    _myFuchuang.tuijianLists = list;
                    _myFuchuang.$nextTick(function () {
                        setTimeout(_myFuchuang.refreshScrollDom, 100);
                    });
                }
            });
        },

        // 获取用户的信息
        getUserInfo: function () {

            SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme,
                token: SDW_WEB.USER_INFO.token,
                type: 1
            }, false, HTTP_STATIC + 'userinfo');

            // alert('getUserInfo:' + postUri);
            SDW_WEB.getAjaxData(postUri, function (data) {

                // alert(JSON.stringify(data));

                if (data.result == 1) {
                    NOW_TIME = +new Date();
                    var list = [];
                    var len = Math.min(4, _myFuchuang.zuijinLists.length);
                    data.recent = data.recent || [];

                    for (var i = 0; i < data.recent.length; i++) {
                        list.push({
                            title: data.recent[i].name,
                            icon: data.recent[i].icon,
                            id: data.recent[i].id,
                            time: transDate(data.recent[i].time)
                        });

                        if (i <= len)
                            myGameMap[data.recent[i].id] = 1;
                    }

                    _myFuchuang.zuijinLists = list;
                    // _myFuchuang.myGold = SDW_WEB.transformQuantity(data.info.gold || 0);
                    _myFuchuang.myGold = data.info.gold || 0;

                    // 判定是否绑定了手机
                    // _myFuchuang.showMicroBingPhone = SDW_WEB.onMicroSDWAPP && !data.info.phone;

                    // 获取热门游戏
                    _myFuchuang.getGamesInfo({
                        type: '',
                        page: 0,
                        flag: 1
                    });
                }
            });
        },

        /**
         * 变更游戏的id，重新授权游戏，iframe赋值，悬浮窗的部分数据更新（页面不跳转）
         * @param item
         */

        // 退弹跳转到游戏（v2版本）
        goToGames: function (item, url) {

            // flag [2018-01-08 11:16:30] 如果是跟当前一样的游戏，则不进行跳转
            var gid = item.id || item.gid;
            if (gid == SDW_WEB.MOBILE_GAME_GID) {
                dialog.show('error', '已在当前游戏', 1);
                return;
            }

            // 修改游戏地址
            var time = 300;

            // if (this.fullscreen) {
            dialog.show('loading', '游戏切换中...');
            if (SDW_WEB.onKD) {
                if (SDW_WEB.onIOS) {
                    callKDMSGToResponse(encodeURI(JSON.stringify({"responseType": 5})));
                } else {
                    kdjs.callOpenKDTopBar();
                }
                time = 500;
            } else if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.exitFullScreen({
                    success: function () {

                    }
                });
                time = 500;
            }
            // }

            setTimeout(function () {
                dialog.hidden();
                var gUrl = url || SDW_PATH.GAME_URL('play', item.id || item.gid);

                if (location.replace) {
                    location.replace(gUrl);
                } else {
                    location.href = gUrl;
                }

            }, time);

        },

        // 微端的退弹跳转
        goToGames2: function (item) {
            // location.href = item.url + '&v=' + SDW_WEB.version + '&channel=' + SDW_WEB.channel;
            var url = item.url + '&v=' + SDW_WEB.version + '&channel=' + SDW_WEB.channel;
            this.goToGames(item, url);
        },
        activityCtl:function () {
            if(this.activity.openState ==  1 ){
                dialog.show('ok','敬请期待<br>'+this.activity.activityName+'活动将于'+this.activity.startTime[1]+'月'+this.activity.startTime[2]+'号开启哦~！',1);
            }else{
                this.showactivity = 1 ;
            }
        },
        gotoactivityPage:function (type) {
            if(!type) {
                this.showactivity = 0 ;
                return ;
            }
            SDW_WEB.openNewWindow({
                title: '',
                // link: 'http://www.shandw.com/activities/nationalFare/getfare.html',
                link: ActivityConfig.activityPage+'?channel='+SDW_WEB.channel+'&v=' + SDW_WEB.version,
                isFullScreen: false,
                showMoreBtn: true
            })
        },
    };

    var _myFuchuang;

    // 隐藏悬浮框游戏的配置
    var hiddenWindow_Game = {
        '1146308431': 1
    };

    // 悬浮窗接口
    toolWindow = {
        /**
         * 初始化悬浮窗
         * @param visitor {Boolean} 是否是游客模式
         */
        init: function (visitor, isMicroLogin) {

            // var self = this;

            setUserAvatar();
            setUserNick();
            setUserBarrage();

            indexData.isVisitor = visitor;
            indexData.showMicroBingPhone = SDW_WEB.onMicroSDWAPP && !isMicroLogin;
            indexData.gameName = SDW_WEB.gameName;

            // 初始化根view
            _myFuchuang = new Vue({
                el: '#app',
                data: indexData,
                methods: methods,
                mounted:function () {

                },
                components: {
                   // identifyContainer:identifyContainer,
                    // serverGameItem: serverGameItem,
                    // microBingPhone: microBingPhone,
                }
            });


            _myFuchuang.$nextTick(function () {
                // 获取玩家的最近记录
                // indexData.isVisitor || _myFuchuang.getUserGames();
                window._calPageHeight();
            });

            if (indexData.chatFlag) {
                // -----------------------------------------------------------------------------------------------------
                // ----------------------------------------新建聊天------------------------------------------------------

                // chatRoom = new ChatRoom({
                //     url: 'ws://192.168.110.148:8200/?uid=' + USER_DATA.id + '&token=123&sec=987&appid=123',
                //     openFn: function () {
                //         console.log('您已连接...');
                //     },
                //     messageFn: function (instructions, data) {
                //         switch (instructions) {
                //             case 2010:
                //                 addToChat(data);
                //                 break;
                //             case 2011:
                //                 console.log('确认指令INSTRUCT', instructions, data);
                //                 break;
                //         }
                //     }
                // });

                // -----------------------------------------------------------------------------------------------------
                // ------------------------------------------------------弹幕功能----------------------------------------
                // barrage = new Barrage({
                //     el: '#barrage-cont'
                // });
                //
                // barrage.addText({
                //     msg: '快来闪电玩'
                // });
                //
                // barrage.addText({
                //     msg: '指尖的乐趣，就来闪电玩'
                // });
            }

            // 如果是隐藏的
            if (hiddenWindow_Game[SDW_WEB.MOBILE_GAME_GID]) {
                return;
            }

            // 初始化小浮窗的图标
            window.touch = new DragTouch({
                id: '#my-menu',
                position: '1,0.2'
            });

            // 获取砸蛋的信息

            // 获取赛事
            //console.log(ActivityConfig.toolIconType,activityOpenFlag);
            if (ActivityConfig.state) {
                // if (SDW_WEB.USER_INFO.uid) {
                //     _myFuchuang.loadActivityToolInfo();
                // } else {

                indexData.hasActivity = true;

                window.touch.target.style.visibility = 'visible';

                // }
            } else {

                _myFuchuang.eggInfo = {
                    state: 'sdw'
                };
                window.touch.target.style.visibility = 'visible';
            }


            // 开启定时器
            window._myFuchuang = _myFuchuang;

            // 5秒钟后safari提示弹窗自动消失
            _myFuchuang.$nextTick(function () {

                setTimeout(function () {
                    _myFuchuang.onSafari = SDW_WEB.onSafari && SDW_WEB.onIOS && !SDW_WEB.onAPPs;
                }, 0);

                setTimeout(function () {
                    _myFuchuang.onSafari = 0;
                }, 4000);

            });

        },


        /**
         * 添加活动的iFrame页面
         * 【bug】IOS中，iFrame的fixed定位不能正确定位
         */
        addActivityFrame: function () {

            if (!ActivityConfig.state) return;


            // if (!_myFuchuang.hasActivity) return;
            //
            // var _width = document.querySelector('#my-fuchuang-container');
            // var activityIframe = document.querySelector('#activity-iframe');
            //
            // if (activityIframe) {
            //     var ifParam = {
            //         channel: SDW_WEB.channel,
            //         width: parseInt(window.getComputedStyle(_width).width),
            //         height: _myFuchuang.pagesHeight,
            //         pageFrom: 'sdw_game_tool',
            //         v: +new Date()
            //     };
            //
            //     var url = SDW_WEB.URLS.addParam(ifParam, false, ActivityConfig.link);
            //
            //     activityIframe.src = url;
            //     activityIframe.style.width = ifParam.width + 'px';
            //     activityIframe.style.height = ifParam.height + 'px';
            //     activityIframe.width = ifParam.width;
            //     activityIframe.height = ifParam.height;
            // }
        },

        /**
         * 初始加载数据，首次点开浮窗后加载数据
         */
        initLoadData: function () {

            // 非游客模式下，初始化用户的信息
            indexData.isVisitor ? addScroll('#my-zm-s2') : toolWindow.initUserView();

            window.visitorIconSrc && document.querySelector('#visitorIcon')
            && (document.querySelector('#visitorIcon').src = window.visitorIconSrc);

            // 初始化滚动的导航
            if (!indexData.isVisitor) {
                SliderNavManager.init('.current-nav-bg');
                SliderNavManager.sliderTo(0, 0);
                // 添加活动页面
                this.addActivityFrame();
            }

        },

        /**
         * 切换游客模式
         * @param visitor {Boolean} 是否是游客模式
         */
        setVisitorMode: function (visitor) {

            _myFuchuang.isVisitor = visitor;
            visitorMode.isVisitor = visitor;

            scrolls = [];  // 重置

            setTimeout(function () {
                if (visitor) {
                    // 重置游客的视图
                    addScroll('#my-zm-s2');
                } else {
                    // 重置登录后的视图
                    toolWindow.initUserView()
                }
            }, 100);
        },


        /**
         * 初始化【非游客】模式下的界面
         */
        initUserView: function () {

            // alert(indexData.isVisitor);

            // flag [2017-12-18 15:21:20] 登录成功后，重新获取砸蛋的信息
           // activityOpenFlag && _myFuchuang.loadActivityToolInfo();
            toolWindow.addActivityFrame();

            // 获取玩家的最近记录
            if (!indexData.isVisitor) {
                _myFuchuang.getUserGames();
            }

            addScroll('#my-check');  // 签到页面
            addScroll('#my-lb-s');
            addScroll('#my-zm-s');
            addScroll('#my-gm-s');
            addScroll('#my-gm-server');
            addScroll('#my-zm-kf');
            // addScroll('#my-zm-activity');

            // indexData.chatFlag && addScroll('#my-zm-kf');

            setTimeout(function () {
                _myFuchuang.getGameInfo();
            }, 100);

            setTimeout(function () {
                _myFuchuang.loadServerGame()
            }, 200);

            setTimeout(function () {
                _myFuchuang.getUserInfo();
            }, 50);


            if (!indexData.isVisitor) {
                SliderNavManager.init('.current-nav-bg');
                SliderNavManager.sliderTo(0, 0);

                setTimeout(function () {
                    SliderNavManager.showNavList();
                }, SliderNavManager.delTime);
            }
        },

    };

    /**
     * 根据时间搓转换不同的时间字符串
     * @param date
     * @return {string}
     */
    function transDate(date) {

        var obj = new Date(date), dT = NOW_TIME - date, year = obj.getFullYear(),
            month = obj.getMonth() + 1, day = obj.getDate();

        if (dT < 24 * 60 * 60 * 1000) {
            if (dT < 60 * 60 * 1000) {

                if (dT < 0) return '刚刚玩过';

                if (dT < 60 * 1000) return (dT / 1000 >> 0) + '秒前';

                return (dT / (60 * 1000) >> 0) + '分前';
            }
            return (dT / (60 * 60 * 1000) >> 0) + '时前';
        }

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        return month + '-' + day;
    }

    // 检测当前浏览器的环境
    function checkType() {

        if (SDW_WEB.onIOS) {
            // ios需要使用safari浏览器
            return Image_URL + 'ios.jpg';

        } else {
            if (SDW_WEB.onQQBrowser) return Image_URL + 'qq.jpg';
            if (SDW_WEB.onBaiduBrowser) return Image_URL + 'baidu.jpg';
            if (SDW_WEB.onUCBrowser) return Image_URL + 'uc.jpg';
            if (SDW_WEB.onLiebao) return Image_URL + 'liebao.jpg';
            if (SDW_WEB.onShandw) {
                // 安卓-闪电玩环境下，可调用JS接口进行添加到桌面
            }
            return ''; // 默认的安卓添加方式
        }
    }

    function checkBrowserTips() {
        if (SDW_WEB.onIOS) {
            return '*若您在微信、QQ、微博等APP内，需先通过右上角分享功能，将页面用safari浏览器打开。';
        } else {
            if (SDW_WEB.onQQBrowser) return '';
            if (SDW_WEB.onBaiduBrowser) return '';
            if (SDW_WEB.onUCBrowser) return '';
            if (SDW_WEB.onLiebao) return '';
            return '请根据当前的浏览器，添加到桌面'; // 默认的安卓添加方式
        }
    }

    /**
     * 根据元素id添加scroll界面
     * @param id
     */
    function addScroll(id) {

        var scroll = new IScroll(id, {
            probeType: 3,
            scrollbars: false,
            mouseWheel: false,
            hScrollbar: false,
            interactiveScrollbars: false,
            fadeScrollbars: false
        });

        scrolls.push(scroll);
    }

    // 禁止页面滚动
    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, {passive: false});

    // 悬浮按钮事件-显示小弹窗
    var myMenuBtn = document.querySelector('#my-menu');
    $('#menu-btn').tap(function (e) {
        e.stopPropagation();

        // flag [2018-01-05 13:44:42] 添加统计--

        // console.log('tool');

        SDW_WEB.addCount('tool');

        SDW_WEB.onIOS && $('#my-game-container').addClass('my-game-container-ani');

        window.touch.hiddenState();  // 隐藏起来

        window.touch.clearTimer();
        myMenuBtn.style.opacity = '0';

        if (!window.touch.firstTap) {
            window.touch.firstTap = true;
            indexData.navsTap[navConfigs[0]] = 1;
            toolWindow.initLoadData();
            _myFuchuang.getIdInfo();
        }

        setTimeout(function () {
            _myFuchuang.fchiddenFn(0);
        }, 20)

    });

    // 点击弹幕
    // document.querySelector('#my-menu').addEventListener('click', function (e) {
    //     e.preventDefault();
    //     // e.stopPropagation();
    //
    //     if (chatRoom) {
    //         $('#outer-chat-cont').css('display', 'block');
    //         document.querySelector('#user-input').focus();
    //         _myFuchuang.showUserInput();
    //     } else {
    //         // dialog.show('error', '聊天功能还没开启', 1);
    //     }
    //
    // }, false);

    /**
     * 解析聊天的时间
     * @param date
     */
    function parseDate(date) {

        date = date * 1000;

        var oDate = new Date(date),
            h = oDate.getHours(), m = oDate.getMinutes();

        if (PRE_DATE.h != h || PRE_DATE.m != m) {

            PRE_DATE.h = h;
            PRE_DATE.m = m;

            _myFuchuang.chatsLists.push({
                isTime: h + ':' + m
            })
        }

        oDate = null;
    }

    function addToChat(data) {

        parseDate(data.time);

        _myFuchuang.chatsLists.push({
            isMe: Math.random() > 0.5,
            // isMe: data.sender == USER_DATA.id,
            chatMsg: data.content,
            userName: data.sender
        });

        barrage.addText({
            msg: data.content
        });
    }

    // 发送消息
    function sendMessageFormInput() {

        var msg = _myFuchuang.userInputsMsg;

        if (!msg) return;

        chatRoom.sendMessage(2010, {
            uid: USER_DATA.id,
            msg: msg,
            buffer: true
        });

        _myFuchuang.userInputsMsg = '';
        _myFuchuang.userInputWindow = 0;
    }

    function isToday(old, date) {
        old = parseInt(old);
        date = parseInt(date);
        var oldDate = new Date(old), nowDate = new Date(date);
        return oldDate.getFullYear() == nowDate.getFullYear() &&
            oldDate.getMonth() == nowDate.getMonth() &&
            oldDate.getDate() == nowDate.getDate();
    }


    /**
     * 添加弹窗
     */
    window.addUnloadPage = function () {

        // 闪电玩、口袋、微端并没有退弹
        var hasUnloadPage = !(SDW_WEB.onShandw || SDW_WEB.onKD || SDW_WEB.onMicroSDWAPP);

        // 如果是网易星球技术APP环境下，隐藏退弹
        // if (navigator.userAgent.match(/star_client/)) {
        if (/star_client/.test(navigator.userAgent)) {
            hasUnloadPage = false;
        }

        // flag [2018-09-20 10:40:35] 简易版游戏，去掉退弹
        if (isSimple) {
            hasUnloadPage = false;
        }

        // flag [2018-10-18 10:00:03] 屏蔽退弹
        if (SDW_WEB.readParam("sdw_tt")) {
            hasUnloadPage = false;
        }

        // 在安卓的游戏微端中
        if (indexData.microApp) {
            // 获取安卓APP的退弹信息
            SDW_WEB.sdw.getUnloadInfo({
                success: function (res) {
                    indexData.unloadInfo.alertGames = res.alertGames;
                    indexData.unloadInfo.alert.icon = res.alertBg;
                    indexData.unloadInfo.alert.url = res.alertUrl;
                }
            });
            var unloadStorage = SDW_WEB.Store.get(window.unloadStorageFlg, 1);
            if (unloadStorage) {
                if (isToday(unloadStorage.time, +new Date()) && !unloadStorage.show) {
                    hasUnloadPage = false;
                } else {
                    hasUnloadPage = true;
                }
            } else {
                hasUnloadPage = true;
            }
        }

        // 开启退弹
        if (hasUnloadPage) {
            methods.getUnloadPageInfo(function () {
                setTimeout(function () {
                    location.hash = '#pop';
                    var unLoadFun = function () {
                        var hash = location.hash;
                        // 如果有hash值，不进行弹窗
                        indexData.showUnloadPage = (hash == "");
                        if (_myFuchuang) {
                            _myFuchuang.$nextTick(function () {
                                if (indexData.showUnloadPage && pageSwiper) {
                                    pageSwiper.update(true);
                                    pageSwiper.startAutoplay();
                                }
                            });
                        }
                    };
                    if (SDW_WEB.onQQ) {
                        window._unLoadTimer = setInterval(unLoadFun, 100);
                    } else {
                        window.onhashchange = unLoadFun;
                    }
                }, 100);
            }); // 获取弹窗的数据
            window._calPageHeight && window._calPageHeight();  // 重新计算高度
        }
    };

    // 非APP环境下，展示退弹
    if (!SDW_WEB.onShandw) {
        window.addUnloadPage();
    }

})(Zepto);

module.exports = toolWindow;

