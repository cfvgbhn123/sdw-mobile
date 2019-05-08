//处理跳转
require('../index/js/url');

require('../init.scss');
require('./index.scss');
require('./swiper.min.scss');
// 计算右侧的定位
var calRightFixed = function () {
    var width = document.documentElement.clientWidth || document.body.clientWidth;
    var offset = 0;

    if (width < 990) {
        offset = 990 - width;
        width = 990;
    }

    return (width - 980) / 2 - 6 - offset;
};

//libs
import '../index/libs/MD5.min';
import '../index/libs/q.min';
require('jquery-circle-progress');
var $ = require('jquery');
var Swiper = require('./libs/swiper.min');

var searchInput = require('../components/search-input/search-input.vue');
var giftCodeMask = require('../components/gift-code-mask/gift-code-mask.vue');
var alertGame = require('../components/alert-game/alert-game.vue');
var leftPart = require('../index/component/games-modal/left-part.vue');
var rightPart = require('../index/component/games-modal/right-part.vue');
var fullPart = require('../index/component/games-modal/full-part.vue');
var topLogin = require('../components/top-login/login.vue');
var tipsDialog  = require('../components/tips-dialog/tip.vue');
var homePageTop = require('../components/home-page-top/top.vue');
var topDownload = require('../components/top-download/download.vue');
var topContact = require('../components/top-contact/contact.vue');
var giftAlert = require('../index/component/games-modal/gift-alert.vue');
var gameDetail = require('./components/game-detail.vue');
var footerItem = require('../components/footer-item/footer-item.vue');

//js
import Fn from '../index/js/Fn'
import CheckInfo from '../index/js/check';
var TransServerDate = require('../../mobile/game/libs/TransServerDate.js');

//数据处理
window.APP = {};
APP.guid = Fn.GUID2();
APP.APP_ROOT = '../index/?channel='+ SDW_WEB.channel;
APP.width = document.documentElement.clientWidth || document.body.clientWidth;
APP.height = document.documentElement.clientHeight || document.body.clientHeight;
APP.os = 0;

var indexData = {
    //m3plt 样式控制
    m3pltC: SDW_WEB.onM3plt ? 'm3plt-container' : '',
    m3pltL: SDW_WEB.onM3plt ? 'm3plt-l-container' : '',
    m3pltR: SDW_WEB.onM3plt ? 'm3plt-r-container' : '',
    onM3plt: !!SDW_WEB.onM3plt,
    //m3pltGame样式控制
    onM3pltGame: SDW_WEB.onM3pltGame,
    m3pltCGame: SDW_WEB.onM3pltGame ? "m3pltGame-container" : "",
    m3pltLGame: SDW_WEB.onM3pltGame ? 'm3plt-l-container' : '',
    m3pltRGame: SDW_WEB.onM3pltGame ? 'm3plt-r-container' : '',
    //下载页面
    downloadApp: false,
    // 礼包
    hidegiftCode: false,
    giftCode: {
        code: "",
        id: ""
    },
    //游戏详情数据
    detailDataList: [],
    giftDataList: [],
    //玩游戏相关
    gamesModal:{
        isFull: false,
        isPlaying: false,
        collectList:[],
        gamePlayList:[]
    },
    //游戏数据
    ServerDataList: {
        'al': [],
        'new': []
    },
    currentServer: 'al',
    //tab选择
    titleSelected: 0,
    titleList: ['已开新服', '新服预告'],
    //联系客服
    contactContainer: "",
    //用户信息
    usrInfo: {
        avatar:  SDW_WEB.USER_INFO.avatar || '',
        nick: SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid || ''
    },
    //提示
    mytips: {
        ok: false,
        error: false,
        ct: ""
    },
    //位置
    tipPot: {

    },
    //登录相关
    loginShow: {
        'visibility': 'hidden',
        'opacity': 0
    },
    "APP": APP,
    currentGameUrl: '',
    rightFixed: calRightFixed(),
    load: false,
    loaded: false,
    gameListMap: [
        {id: -1, isClick: true, name: '全部'},
    ],
    APP_ROOT_HOME: '../index/?channel=' + SDW_WEB.channel,
    APP_ROOT_GIFT: '../gift/?channel=' + SDW_WEB.channel,
    showMoreBtn: true,
    // showMoreTips: false,
    giftListData: [
        // {
        //     gname: '',
        //     gifts: [],
        // },
    ],
    gameSet: {},
    //控制游戏界面切换账号时，关闭登录界面是否刷新页面
    unloginClose: false
};

var indexMethods = {
    //礼包
    hideCode: function () {
        this.hidegiftCode = false;
    },
    gotCode: function (e) {
        console.log(e);
        this.tipPot = {
            position: "fixed"
        };
        this.mytips = {
            ok: false,
            error: false,
            ct: e,
            isShow: true,
            autoHidden: true
        };
    },
    getCode: function (code, id) {
        this.hidegiftCode = true;
        this.giftCode.code = code;
        this.giftCode.id = id;  
    },
    //登录弹框
    getDialog: function(e1, e2) {
        this.loginShow = {
            'visibility': 'visible',
            'opacity': 1
        }
        //游戏界面账号切换
        if(e1==="unloginPlay") {
            this.unloginClose = true;
        }
    },
    closeContact: function () {
        this.contactContainer={
            display: 'none'
        };
    },
    choseConContainer: function () {
        this.contactContainer={
            display: 'none'
        }
    },
    //显示客服
    showConDialog: function () {
        $('body').css({
            height: '100%',
            overflow: 'auto'
        });
        var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
        var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
        this.contactContainer = {
            display: 'block',
            width: WIDTH+'px',
            height: HEIGHT+'px',
        }
         //关闭下载界面
         this.downloadApp = false;
     },
    //关闭下载页面
    closeDialog: function () {
        this.downloadApp = false;
    },
    //下载页面
    showDownloadDialog: function () {
        this.downloadApp = true;
        $('body').css({
            height: '100%',
            overflow: 'hidden'
        });
        var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
        var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
        this.$nextTick(function () {
            $(".download-container .download-wrap").css({
                width: WIDTH + "px",
                height: HEIGHT+ 'px',
                overflow: "auto"
            });
        })
    },
    //礼包
    showGiftPage: function (e) {
        location.href = "../gift/?channel=" + SDW_WEB.channel;
    },
    //授权登录
    onLogin: function (param, dhurl) {
        var port = location.protocol + '//';
        if(param === "qq") {
            var tU = port + 'www.shandw.com/pc/auth/qq/?channel=' + SDW_WEB.channel;
            $('body').eq(0).append("<iframe id='third-authorize-page' frameborder='0' src='https://graph.qq.com/oauth2.0/authorize?client_id=101359011&response_type=code&scope=all&redirect_uri=" + encodeURIComponent(tU) +"'"+"></iframe>");    
        }else if(param === "weixin") {

        }else if(param === "weibo") {
            var tU = port + 'www.shandw.com/pc/auth/weibo/?channel=' + SDW_WEB.channel;
            $('body').eq(0).append("<iframe id='third-authorize-page' frameborder='0' src='https://api.weibo.com/oauth2/authorize?client_id=530008665&response_type=code&scope=all&redirect_uri=" + encodeURIComponent(tU) +"'"+"></iframe>");
        }else if(param === "dh") {
            window.open(dhurl, '电魂授权登入', 'height=600,width=600, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');
        }
        if(param !== "weixin" && param !== "dh") {
            $('body').eq(0).append("<div id='closeAuthPage'>关闭</div>");
        }
    },
    loginClose: function(e){
        _indexView.loginShow =  {
            'visibility': 'hidden',
            'opacity': 0
        };
        //游戏界面切换账号关闭登录刷新
        if(this.unloginClose) {
            location.reload();
        }
    },
    voidFn: function () {

    },

    hideMask: function () {
        this.currentGameUrl = '';
        this.$nextTick(function () {

        })
    },
    // 搜索游戏
    searchBtnFn: function (type) {

        if (type) {

            var uri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                v: +new Date(),
                searchKey: type
            }, false, '../classify/');

            location.href = uri;

        } else {

            dialog.show('error', '请输入需要搜索的内容', 1);
        }
    },

    // 变更游戏礼包
    changeGameItem: function (item, index) {
        // this.showMoreBtn = item.id === -1 && !this.loaded;
        // this.showMoreTips = item.gid !== -1;
        for (var i = 0; i < this.gameListMap.length; i++) {
            var ite = this.gameListMap[i];
            ite.isClick = ite.id === item.id ? true : false;
        }
        for (var i = 0; i < this.ServerDataList[this.currentServer].length; i++) {
            var ite = this.ServerDataList[this.currentServer][i];

            if (item.id === -1) {
                ite.show = true;
            } else {
                ite.show = ite.id === item.id;
            }

        }

        this.$nextTick(this.voidFn);
    },
    transServerDate: function (time, isPrv) {
        return TransServerDate(time, window.SERVER_TIME, isPrv);
    },
    //加载游戏详情数据  id {int} 游戏gid
    getDetailList: function (id) {
        var self =this;
        var getUri = SDW_WEB.URLS.addParam({
          gid: id
        }, false, HTTP_STATIC + 'gameinfo');
        SDW_WEB.getAjaxData(getUri, function (data) {
            if(data.result == 1) {
                if(data.info&&data.gift) {
                    self.detailDataList = data.info;
                    self.giftDataList = data.gift;
                    self.$nextTick(function () {
                        $('.gift-num-circle').each(function () {
                            $(this).circleProgress({
                                value              : parseFloat(this.dataset.num),
                                size               : 50,
                                lineCap            : 'round',
                                startAngle         : -Math.PI / 2,
                                reverse            : true,
                                fill               : {
                                    gradient: ["#f2580f", "#ff9841"]
                                },
                                animationStartValue: 1
                            });
                        });

                        //图片轮播
                        var swiper = new Swiper('.swiper-container', {
                            scrollbar        : '.swiper-scrollbar',
                            scrollbarHide    : false,
                            direction        : 'horizontal',
                            spaceBetween     : 10,
                            slidesPerView    : 'auto',
                            mousewheelControl: true,
                            freeMode         : true
                        });  
                    })
                }
            }
        })
    }
};

var _indexView;

// 页面的主入口
var main = function () {

    _indexView = new Vue({
        el: '#app',
        data: indexData,
        methods: indexMethods,
        components: {
            searchInput: searchInput,
            giftCodeMask: giftCodeMask,
            alertGame: alertGame,
            leftPart: leftPart,
            rightPart: rightPart,
            topLogin: topLogin,
            tipsDialog: tipsDialog,
            homePageTop: homePageTop,
            topDownload: topDownload,
            topContact: topContact,
            giftAlert: giftAlert,
            gameDetail: gameDetail,
            fullPart: fullPart,
            footerItem: footerItem
        },
        mounted: function() {
            //获取sessionStorage初始化gamesModal值，防止刷新首页左侧信息消失
            if(sessionStorage && sessionStorage.collect){
                this.gamesModal.gamePlayList = JSON.parse(sessionStorage.collect).data;
            }
            if( sessionStorage && sessionStorage.isPlaying == 'true' ){
                this.gamesModal.isPlaying = true ;
            }
        }
    });
    var rightContainer = document.querySelector('.right-container');
    window.onresize = function () {
        rightContainer.style.right = calRightFixed() + 'px';
        //处理下载页面
        (function() {
            var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
            var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
            $(".download-container .download-wrap").css({
                width: WIDTH + "px",
                height: HEIGHT+ 'px',
                overflow: "auto"
            })
        })();
        //处理联系客户弹框
        (function() {
            var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
            var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
            $(".contact-container").css({
                width: WIDTH + "px",
                height: HEIGHT+ 'px',
            })
        })();
    };
    //初始化开服信息
    _indexView.getDetailList(SDW_WEB.queryParam['gid']);
    window._indexView = _indexView;
    //梦平台登录数据
    if(indexData.onM3plt) {
        SDW_WEB.getM3pltUserData(function (data) {
            SDW_WEB.USER_INFO = data;
        }, function (data) {
            dialog.show('error', '用户信息获取失败，请重新进入', 1);
        })
    }
    // 2018.9.10新增兼容梦平台游戏内进入
    if(indexData.onM3pltGame){
        SDW_WEB.getM3pltUserData(function (data) {
            APP.dhLogin(data);
        }, function (data) {
            dialog.show('error', '用户信息获取失败，请重新进入', 1);
        })
    }
    //底部兼容梦平台
    (function() {
        if(indexData.onM3plt) {
            $(".my_footer").addClass("m3plt-footer-l");
        }
    })();
};

// 模拟数据
// indexData = require('./data/data');
main();
window.onmessage = function (e) {
    var DATA = (typeof e.data ==='object')? e.data : (e.data&&JSON.parse(e.data));
    if(DATA.sdwAuth) {
        _indexView.loginShow =  {
            'visibility': 'hidden',
            'opacity': 0
        };
        var usrInfo = {
            avatar: DATA.data.avatar,
            fl: DATA.data.fl,
            nick: DATA.data.nick,
            otoken: DATA.data.token,
            sex: DATA.data.sex,
            uid: DATA.data.id,
            day: DATA.data.day,
            month: DATA.data.month,
            result: DATA.data.result,
            secheme: +new Date(),
            year: DATA.data.year
        }
    usrInfo.token = faultylabs.MD5('' + SDW_WEB.channel + usrInfo.uid + usrInfo.secheme + usrInfo.otoken)
    SDW_WEB.USER_INFO = usrInfo;
    //登录信息
    var USER_DATA = {
        nick: usrInfo.nick,
        avatar: usrInfo.avatar
    };

    CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
    SDW_WEB.Store.set(SDW_WEB.localItem, usrInfo, true);
    $('#third-authorize-page').remove();
    $('#closeAuthPage').remove();
    //获取用户游戏信息
    Fn.getMyData({
        channel: SDW_WEB.channel,
        uid: usrInfo.uid,
        sec: usrInfo.secheme,
        token: usrInfo.token,
        type: 1,
        flag: 1
    }, 'pltmain', function (data) {
         // 获取我最近玩过的
         _indexView.myGameListData = data.recent.splice(0, 4);
    })
    //玩游戏界面切换账号后刷新
    APP.unLoginCallback&&APP.unLoginCallback();
    //打开游戏授权后直接登录
    APP.loginCallback&&APP.loginCallback();
    }else if(DATA.postSdwData) {
        if (DATA.operate === 'checkVisitorMode') {
            e.source&&e.source.postMessage(JSON.stringify({
                postSdwData: true,
                oprate: 'choosePayCheckState_ok'
            }), '*');
        }else if(DATA.operate === 'to_competition') {
            location.assign(DATA.link);
        }else if(DATA.operate === 'sdw_postGameInfo') {
            var data = DATA.data, secheme = +new Date(), oToken;
            data.sec = secheme;
            oToken = SDW_WEB.USER_INFO.otoken;
            var oStr = '' + data.appid + data.channel +
            data.uid + data.sid + data.id +
            data.sname + data.nick + data.level +
            data.type + data.vip + data.power +
            data.new + oToken;
            data.sign = faultylabs.MD5(oStr);
            // data.id = encodeURI(data.id);
            // data.sname = encodeURI(data.sname);
            // 变换后的token校验值
            var token = faultylabs.MD5('' + data.channel + data.uid + secheme + oToken);
            data.token = token;
            var postUri = SDW_WEB.URLS.addParam(data, true, HTTP_STATIC + 'pltupgi');
            //send ajax
            SDW_WEB.getAjaxData(postUri, function (data) {
                // console.log(data);
            })
        }else if(DATA.operate === 'openUrlToRoot') {
            var gameUrl = DATA.option.gid ? SDW_PATH.GAME_URL('play',  DATA.option.gid) : "";
            location.href = gameUrl ? gameUrl : "#";
        }
    }else if(DATA.postElloData){
        if (DATA.url) {
            location.href = DATA.url;
        }
    }
};

//关闭授权页
$('html').on('click', '#closeAuthPage', function (e) {
    $('#third-authorize-page').remove();
    $(this).remove();
});
//单独处理电魂授权登录
APP.dhLogin = function (data) {
    _indexView.loginShow =  {
        'visibility': 'hidden',
        'opacity': 0
    };
    var usrInfo = {
        avatar: data.avatar,
        fl: data.fl,
        nick: data.nick,
        otoken: data.token,
        sex: data.sex,
        uid: data.id ||data.id,
        day: data.day,
        month: data.month,
        result: data.result,
        secheme: data.secheme,
        year: data.year
    }
    usrInfo.token = faultylabs.MD5('' + SDW_WEB.channel + usrInfo.uid + usrInfo.secheme + usrInfo.otoken)
    SDW_WEB.USER_INFO = usrInfo;
    //登录信息
    var USER_DATA = {
        nick: usrInfo.nick,
        avatar: usrInfo.avatar
    }
    CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
    SDW_WEB.Store.set(SDW_WEB.localItem, usrInfo, true);
       //获取用户游戏信息
       Fn.getMyData({
        channel: SDW_WEB.channel,
        uid: usrInfo.uid,
        sec: usrInfo.secheme,
        token: usrInfo.token,
        type: 1,
        flag: 1
    }, 'pltmain', function (data) {
         // 获取我最近玩过的
         _indexView.myGameListData = data.recent.splice(0, 4);
    })
    //打开游戏授权后直接登录
    APP.loginCallback&&APP.loginCallback();
    //玩游戏界面切换账号后刷新
    APP.unLoginCallback&&APP.unLoginCallback();
}