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

var ActivityConfig = require('../index/config');
var DragTouch = require('./DragTouch');
var TransServerDate = require('./libs/TransServerDate');


var toolWindow = {};
require('../../components/mobile/login/login.scss');
// var loginContainer = require('./top-login/login.vue') ;
window.touch = null;
window.loadPageTime = +new Date();
window.NOW_TIME = +new Date();
window.SERVER_TIME = null;
var refreshTime = 0;

var landscape = SDW_WEB.queryParam['screen'] == '1' || SDW_WEB.queryParam['screen'] == '3';  // 是否是横屏游戏

// if (landscape) {
//     landscape = SDW_WEB.onShandw && SDW_WEB.onAndriod; // 目前就安卓才有
// }

//landscape = SDW_WEB.landscape;

(function ($) {

    var isSimple = SDW_WEB.readParam('sdw_simple');  // 简易版闪电玩

    var indexData = {
        showSaishi: false,
        landscape: landscape,   // 是否是横屏游戏
        gameName: '',
        fullscreen: false,
        showLogin:false,
    };



    // 计算高度
    window._calPageHeight = function () {

       // var fullScreenTop = document.querySelector('.full-screen-top');

        var myTopCont = document.querySelector('#my-top-cont') || {};
        var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
        var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
       // WIDTH = Math.min(WIDTH, HEIGHT);

        ratio = ((WIDTH / 320 * 16) / 32 * 0.853);

        var t = myTopCont.offsetHeight || 0, t2 = 240 * ratio;
        indexData.fullscreen = window._fullScreen;

        // 横屏或全屏游戏下的高度需要减去
        // if (indexData.fullscreen || indexData.landscape) {
        //     indexData.pagesHeight = HEIGHT - t - fullScreenTop.offsetHeight;
        // } else {
        //     indexData.pagesHeight = HEIGHT - t;
        // }
        indexData.visitorPagesHeight = HEIGHT - t2;
        SDW_WEB.setHTMLFontSize();
        //setTimeout(methods.refreshScrollDom, 200);
        if(indexData.landscape){
            $('#g-container').css({
                height: HEIGHT + 'px',
                width:WIDTH+'px'
            });
        }else{
            $('#g-container').css({
                height: HEIGHT + 'px',
                width:HEIGHT*0.6+'px'
            });
        }


        // 需要实现判断是否被初始化了
        window.touch && window.touch.hiddenState(); // 悬浮窗是收起状态
    };


    window.pageSwiper = null;
    //var unloadBannerList = []
    var methods = {
        // 切换账号
        refreshUser: function () {
            if (SDW_WEB.onShandw) {
                SDW_WEB.sdw.logout();
            } else {
                this.loginFlagV2 = 1;
            }
        },
        /*二维码登录*/
        login:function () {
            this.showLogin = true ;
            this.createQ();
        },
        createQ: function() {
            // if (!APP.qrcode) {
            SDW_WEB.qrcode = new QRCode(document.querySelector('#ewm'), {
                width: 260,
                height: 260
            });
            //}
            var gid = SDW_WEB.URLS.queryUrl['gid'] || 1;
            var src = 'http://www.shandw.com/pc/auth/qAuth.html?channel=' + SDW_WEB.channel +
                '&unitid=' + SDW_WEB.guid +
                // '&unitid=' +'df1cbe3efd7486d280306abe62cccda1' +
                '&gid=' + gid +
                '&os=' + SDW_WEB.os +
                '&w=' + SDW_WEB.width +
                '&h=' + SDW_WEB.height +
                '&m=' + (+new Date());
            SDW_WEB.qrcode.clear();
            SDW_WEB.qrcode.makeCode(src);
            this.qLoginData();
            //显示二维码
            // if (this.$refs.tabs.childNodes[0].className.indexOf('subs select') > -1) {
            //     // this.isQrcode = true;
            // }
            // this.$refs.reQ.style.display = 'none';
        },
        loginSuccessFn: function(data) {
            this.showLogin = false ;
            var usrInfo = {
                avatar: data.avatar,
                fl: data.fl,
                nick: data.nick,
                otoken: data.token,
                sex: data.sex,
                uid: data.id,
                day: data.day,
                month: data.month,
                result: data.result,
                secheme: +new Date(),
                year: data.year
            }
            usrInfo.token = SDW_WEB.MD5('' + SDW_WEB.channel + usrInfo.uid + usrInfo.secheme + usrInfo.otoken)
            SDW_WEB.USER_INFO = usrInfo;
            //登录信息
            var USER_DATA = {
                nick: usrInfo.nick || usrInfo.uid,
                avatar: usrInfo.avatar
            };
            // CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
            SDW_WEB.Store.set(SDW_WEB.localItem, usrInfo, true);
            SDW_WEB.checkUserInfo(true);
            // //获取用户游戏信息
            // SDW_WEB.getMyData({
            //     channel: SDW_WEB.channel,
            //     uid: usrInfo.uid,
            //     sec: usrInfo.secheme,
            //     token: usrInfo.token,
            //     type: 1,
            //     flag: 1
            // }, 'pltmain', function(data) {
            //     // 获取我最近玩过的
            //     _indexView.myGameListData = data.recent.splice(0, 4);
            // });
            // //打开游戏授权后直接登录
            // APP.loginCallback&&APP.loginCallback();
        },
        qLoginData: function() {
            var self = this;
            // 等待扫描中...
            var t = +new Date() / 1000 >> 0;
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                unitid: SDW_WEB.guid,
                token: SDW_WEB.MD5(SDW_WEB.guid + t + 'b30e0224d659cfac' + SDW_WEB.guid + SDW_WEB.channel),
                t: t,
            }, false, HTTP_USER_STATIC + 'pcauthget');
            // 等待服务端的验证；
            SDW_WEB.getAjaxData(postUri, function(data) {
                if(data.result === 1) {
                    self.loginSuccessFn(data);
                }
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
                components: {
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
            if (ActivityConfig.toolIconType && activityOpenFlag) {
                // if (SDW_WEB.USER_INFO.uid) {
                //     _myFuchuang.loadActivityToolInfo();
                // } else {

                indexData.hasActivity = true;

                _myFuchuang.eggInfo = {
                    state: 'saishi'
                };

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

            if (!activityOpenFlag) return;
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
            activityOpenFlag && _myFuchuang.loadActivityToolInfo();
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


    // 禁止页面滚动
    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, {passive: false});


    // 悬浮按钮事件-显示小弹窗
    var myMenuBtn = document.querySelector('#my-menu');
    $('#menu-btn').tap(function (e) {
        e.stopPropagation();
        // flag [2018-01-05 13:44:42] 添加统计--
        SDW_WEB.showGameTools();
    });

    // 预留暴露接口
    SDW_WEB.showGameTools = function () {
        SDW_WEB.addCount('tool');
        SDW_WEB.onIOS && $('#my-game-container').addClass('my-game-container-ani');
        window.touch.hiddenState();  // 隐藏起来
        window.touch.clearTimer();
        myMenuBtn.style.opacity = '0';
        if (!window.touch.firstTap) {
            window.touch.firstTap = true;
            indexData.navsTap[navConfigs[0]] = 1;
            toolWindow.initLoadData();
        }
        setTimeout(function () {
            _myFuchuang.fchiddenFn(0);
        }, 20);
    };

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

    };

    // 非APP环境下，展示退弹
    if (!SDW_WEB.onShandw) {
        window.addUnloadPage();
    }

})(Zepto);

module.exports = toolWindow;

