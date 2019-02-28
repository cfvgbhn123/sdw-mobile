
//处理跳转问题
require('./js/url');

require('../init.scss');
require('./index.scss');
//库
var SliderBanner = require('./libs/SliderBanner.js');
var $ = require('./libs/jquery-3.1.0.min');
import './libs/MD5.min';
import './libs/q.min';

//组件
var lGameItem = require('../components/l-game-item/l-game-item.vue');
var sGameItem = require('./component/s-game-item/s-game-item.vue');
var xlGameItem = require('./component/xl-game-item/xl-game-item.vue');
var searchInput = require('../components/search-input/search-input.vue');
var serverGameItem = require('../components/server-game-item/server-game-item.vue');
var giftItem = require('../components/gift-item/gift-item.vue');
var alertGame = require('../components/alert-game/alert-game.vue');
/*var gamesModal = require('./component/games-modal/games-modal.vue');*/
var leftPart = require('./component/games-modal/left-part.vue');
var rightPart = require('./component/games-modal/right-part.vue');
var homePageTop = require('../components/home-page-top/top.vue');
var topLogin = require('../components/top-login/login.vue');
var newsList = require('../components/news-top/news.vue');
var topDownload = require('../components/top-download/download.vue');
var topContact = require('../components/top-contact/contact.vue');
var tipsDialog  = require('../components/tips-dialog/tip.vue');
var giftCodeMask = require('../components/gift-code-mask/gift-code-mask.vue');
var giftAlert = require('../index/component/games-modal/gift-alert.vue');

//js
var TransServerDate = require('../../mobile/game/libs/TransServerDate.js');
var CheckOpenGame = require('../components/js/CheckOpenGame.js');
var TransDate = require('../components/js/TransDate.js');
import CheckInfo from './js/check';
import Fn from './js/Fn';

//数据处理
window.APP = {};
APP.guid = Fn.GUID2();
APP.APP_ROOT = './';
APP.width = document.documentElement.clientWidth || document.body.clientWidth;
APP.height = document.documentElement.clientHeight || document.body.clientHeight;
APP.os = 0;
var path = require('path');
var indexData = {
    //礼包
    hidegiftCode: false,
    giftCode: "",
    tipPot: "",
    mytips: {
        ok: false,
        error: true,
        ct: "dsdfdsfd"
    },
    //下载页面
    downloadApp: false,
    //用户信息
    usrInfo: {
        avatar:  SDW_WEB.USER_INFO.avatar || '',
        nick:    SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid || ''
    },
    //登录相关
    loginShow: {
        'visibility': 'hidden',
        'opacity': 0,
        'isclose': true
    },
    "APP": APP,
    contactContainer: {
        display: 'none'
    },
    // 新闻资讯
    newsData: [],
    //更多资讯
    moreNews: "../news/",
    //玩游戏相关
    gamesModal:{
        isPlaying: false,
        collectList:[],
        gamePlayList:[]
    },
    // 当前弹窗的二维码地址
    currentGameUrl: '',
    CLASSIFY_URL: '../classify/?channel=' + SDW_WEB.channel,
    myGameUrl: '../my-game/?channel=' + SDW_WEB.channel,
    serverGameUrl: '../new-server/?channel='+ SDW_WEB.channel,
    sliderBanner: [],
    myGameListData: [],
    serverGameModuleList: [],
    hotGameListData: [],
    lastGameListData: [],
    clsGameListData: {},
    clsGameListNav: [],
    currentClsNav: '',
    giftListData: [],

    // 开服模块的信息
    currentServerNav: 'open',

    serverGameListData: {
        'new': [],
        'open': [],
    },
    serverGameListNav: [{
        title: 'open',
        name: '已开新服',
        tap: 1
    }, {
        title: 'new',
        name: '新服预告',
        tap: 0
    }],
};

var indexMethods = {
    //统一在父页面进行相对路径跳转
    gotoDetail: function (gid) {
        location.href = '../detail/?gid='+ gid;
    },
    //针对横屏游戏切换
    switchGame: function (e) {
    e = parseInt(e);
    //横屏游戏存在时，把点击游戏放在数组第一位
    var first =  this.gamesModal.gamePlayList[e];
    var temp = {
        gameUri: first.gameUri,
        icon: first.icon,
        id: first.id,
        name:first.name,
        playing: first.playing,
        screen: first.screen
    };
    // this.gamesModal.gamePlayList.splice(e, 1);
    // this.gamesModal.gamePlayList.unshift(temp);
    },
    //礼包方法
    hideCode: function () {
        this.hidegiftCode = false;
    },
    getCode: function (e) {
        this.hidegiftCode = true;
        this.giftCode = e;
    },
    gotCode: function (e) {
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
     /*打开单个游戏*/
     openGame:function(index){
        for(var x = 0 ;x < this.gamesModal.gamePlayList.length ; x++){
            if(x == index ){
                this.gamesModal.gamePlayList[x].playing = true ;
                document.querySelectorAll('.game-box')[x].style.width = '475px' ;
            }else{
                this.gamesModal.gamePlayList[x].playing = false ;
                document.querySelectorAll('.game-box')[x].style.width = '0px' ;
            }

        }
        //this.gamesModal.gamePlayList[index].playing = true ;
        this.gamesModal.isPlaying = true ;
        sessionStorage.isPlaying = true ;
        sessionStorage.collect = JSON.stringify({
            data:this.gamesModal.gamePlayList
        });

    },
    /*打开全部游戏*/
    openAllGames:function () {
        for(var x = 0 ;x < this.gamesModal.gamePlayList.length ; x++){
            this.gamesModal.gamePlayList[x].playing = true ;
            // document.querySelectorAll('.game-box')[x].style.width = '475px' ;
        }
        this.gamesModal.isPlaying = true ;
        sessionStorage.isPlaying = true ;
        sessionStorage.collect = JSON.stringify({
            data:this.gamesModal.gamePlayList
        });
    },
    qCodeOver: function () {

        var self = this;
        this.showQCode = true;

        if (!self.hasQCode) {

            var dom = self.$refs.myCode;
            var qcode = new QRCode(dom, {
                width: 75,
                height: 75
            });

            var src = CheckOpenGame.createQCode(self.gameItem.id);
            qcode.makeCode(src);

            self.hasQCode = true;
        }

    },
    qCodeOut: function () {
        this.showQCode = false;
    },
    goUrl: function (type) {
        if (type === 'gift') {
            location.href = '../gift/?channel=' + SDW_WEB.channel + '&v=' + (+new Date());
        }
    },
    gotoNSever: function () {
        location.href = this.serverGameUrl;
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
        }
    },

    // 导航栏的切换
    clsNavOver: function (item, type) {

        var self = this;

        // 切换server
        if (type === 'server') {

            this.currentServerNav = item.title;

            for (var i = 0; i < this.serverGameListNav.length; i++) {
                var ite = this.serverGameListNav[i];
                ite.tap = item.title === ite.title;
            }

        } else if (type === 'classify') {

            // 分类的游戏
            this.currentClsNav = item.title;
            for (var i = 0; i < this.clsGameListNav.length; i++) {
                var ite = this.clsGameListNav[i];
                ite.tap = item.title === ite.title;
            }
        }


        this.$nextTick(function () {

            if (type === 'server') {

                self.loadServerGame();

            } else if (type === 'classify') {

                // 请求搜索游戏的接口
                self.getClassifyGameData(item.title);
            }
        })
    },


    // 开服列表的鼠标事件
    onMouseOver: function (type, item) {
        var list = this[type];
        // 开服模块
        if (type == 'serverGameListData') {
            list = list[this.currentServerNav];
        }

        for (var i = 0; i < list.length; i++) {
            list[i].tap = list[i].id === item.id;
        }

        this.$nextTick(function () {

        })
    },

    hideMask: function () {
        this.currentGameUrl = '';
        this.$nextTick(function () {

        })
    },

    // 获取平台的数据
    getPlatformData: function () {

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid || SDW_WEB.USER_INFO.id,
            token: SDW_WEB.USER_INFO.token || SDW_WEB.USER_INFO.otoken,
            sec: SDW_WEB.USER_INFO.secheme,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + 'pltmain');

        SDW_WEB.getAjaxData(postUri, function (data) {
            document.querySelector('#myOwnTip').innerHTML = JSON.stringify(data);
            // 热门游戏
            self.hotGameListData = data.hot.splice(0, 4);

            // 获取最新的
            self.lastGameListData = data.last.splice(0, 4);
            
            // 获取我最近玩过的
            if(data.recent) {
                self.myGameListData = data.recent.splice(0, 4);
            }
            // 获取轮播信息
            for (var i = 0; i < data.ad.length; i++) {
                var item = data.ad[i];
                CheckOpenGame.createMyUrl(item);
            }

            self.sliderBanner = data.ad;

            // 获取游戏的分类
            var types = data.typeList.split(',');
            var _tL = {};
            for (var i = 0; i < types.length && i < 6; i++) {

                self.clsGameListNav.push({
                    title: types[i],
                    tap: i === 0
                });

                // 初始化
                _tL[types[i]] = null;
            }

            indexData.clsGameListData = _tL;

            self.currentClsNav || (self.currentClsNav = types[0]);

            self.$nextTick(function () {

                // 初始化轮播
                var slider = new SliderBanner({
                    id: '.banner-container',
                    autoPlay: true,
                });

                // 请求游戏的数据
                self.getClassifyGameData(self.currentClsNav);
            })

        });
    },

    // 转换时间
    transDate: function (time) {
        return TransDate(time);
    },

    // 获取游戏类型
    getClassifyGameData: function (type) {

        type = '' + type;

        var self = this;
        if (indexData.clsGameListData[type]) return;

        var searchUri = SDW_WEB.URLS.addParam({
            key: '',
            type: type,
            tip: '',
            flag: 1,
            page: 0
        }, true, HTTP_STATIC + 'search');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {
                indexData.clsGameListData[type] = data.list;
            }


            self.$nextTick(function () {
                // console.log(indexData.clsGameListData);
            });

        });
    },

    // 获取礼包数据
    getGiftListData: function () {

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            // token: SDW_WEB.USER_INFO.token,
            // sec: SDW_WEB.USER_INFO.secheme,
            page: 0,
        }, false, HTTP_STATIC + 'gift');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result === 1) {

                if (data.game && data.game.length && data.gift && data.gift.length) {

                    var giftSet = {}, gameSet = {};

                    for (var i = 0; i < data.game.length; i++) {

                        var item = data.game[i];

                        if (!gameSet[item.id]) {
                            gameSet[item.id] = item.name;
                        }

                    }

                    // 礼包最多显示5个
                    for (var i = 0; i < data.gift.length && self.giftListData.length < 6; i++) {

                        var item = data.gift[i];

                        // 不重复，并且有礼包可以领取
                        if (!giftSet[item.gid] && item.num !== item.count) {
                            giftSet[item.gid] = 1;
                            item.tap = 0;
                            item.myGameName = gameSet[item.gid];
                            self.giftListData.push(item);
                        }
                    }

                    self.giftListData[0].tap = 1;
                    // console.log(self.giftListData);
                }

            } else {

                console.log('get gift data error.')
            }
        })

    },

    transServerDate: function (time, isPrv) {
        return TransServerDate(time, window.SERVER_TIME, isPrv);
    },

    // 加载开服的游戏
    loadServerGame: function () {

        var self = this;

        var type = self.currentServerNav === 'open' ? 0 : 1;   // 0已经开服，1预计开服

        // 说明已经有数据了，不进行加载
        if (self.serverGameListData[self.currentServerNav].length) {
            return;
        }

        var getUri = HTTP_STATIC + 'serverinfo?type=' + type;

        SDW_WEB.getAjaxData(getUri, function (data) {

            window.PAGE_TIME = data.ct;
            window.SERVER_TIME = data.ct;

            if (data.result === 1 && data.list && data.list.length) {

                var addType = self.currentServerNav;

                var SERVER_MAP = {}, j = 0;

                for (var i = 0; i < data.list.length && j < 5; i++) {

                    var item = data.list[i];

                    if (!SERVER_MAP[item.appId]) {
                        SERVER_MAP[item.appId] = 1;
                        item.tap = 0;
                        item.id = item.appId;
                        item.serverDateStr = self.transServerDate(item.sTime, type);
                        item.serverDateStr && self.serverGameListData[addType].push(item);
                        j++;
                    }
                }

                // 初始划过状态
                if (self.serverGameListData[addType].length) {
                    self.serverGameListData[addType][0].tap = 1;
                }
            }
        });
    },
    showGiftPage: function (e) {
        location.href = "../gift/";
    },
    // CheckOpenGame: CheckOpenGame.checkOpenUrl,
    checkOpenGame: Fn.checkOpenGame,
    authToGame: Fn.authToGame,
    getQuery: Fn.getQuery,
    findGame: Fn.findGame,
/*  */
    //登录弹框
    getDialog: function(e1, e2) {
        this.loginShow = {
            'visibility': 'visible',
            'opacity': 1
        }
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
            console.log('src',dhurl);
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
    },
    //获取新闻资讯
    getNewsList: function () {
        var self = this;
        Fn.getMyData({
            t:1,
            type:"",
            page:0
        }, 'bbsget', function (data) {
            self.newsData = data.list;
        })
    },
    showDownloadDialog: function () {
        this.downloadApp = true;
        $('body').css({
            height: '100%',
            overflow: 'hidden'
        });
    },
    showConDialog: function () {
        this.contactContainer = {
            width: APP.width+'px',
            height: APP.height+'px',
            visibility: 'visible',
            opacity: 1
        };
        //关闭下载界面
        this.downloadApp = false;
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
    //关闭下载页面
    /* closeDialog: function () {
        this.downloadApp = false;
    } */
};

var _indexView;

// 页面的主入口
var main = function () {

    _indexView = new Vue({
        el: '#app',
        data: indexData,
        methods: indexMethods,
        components: {
            lGameItem: lGameItem,
            sGameItem: sGameItem,
            xlGameItem: xlGameItem,
            searchInput: searchInput,
            serverGameItem: serverGameItem,
            giftItem: giftItem,
            alertGame: alertGame,
            leftPart:leftPart,
            rightPart:rightPart,
            /*gamesModal:gamesModal,*/
            homePageTop: homePageTop,
            topLogin: topLogin,
            newsList: newsList,
            topDownload: topDownload,
            topContact: topContact,
            tipsDialog: tipsDialog,
            giftCodeMask: giftCodeMask,
            giftAlert: giftAlert
        },
        mounted: function () {
            var self = this;
            this.$on("login-dialog", function () {
                self.getDialog();
            });
            //获取sessionStorage初始化gamesModal值，防止刷新首页左侧信息消失
            if(sessionStorage && sessionStorage.collect){
                this.gamesModal.gamePlayList = JSON.parse(sessionStorage.collect).data;
            }
            if( sessionStorage && sessionStorage.isPlaying == 'true' ){
                this.gamesModal.isPlaying = true ;
            }
            //根据地址直接打开游戏
           var params = Fn.getQuery();
           var bUrl = location.href.indexOf('www.shandw.com')>-1
           if(params.gid&&bUrl) {
               self.authToGame(params);
           }
        }
    });
    _indexView.getPlatformData();
    _indexView.loadServerGame();
    _indexView.getNewsList();

    setTimeout(function () {
        _indexView.getGiftListData();
    }, 200);
    window._indexView = _indexView;
    // //初始化登录信息
    // var USER_DATA = {
    //     nick: SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid,
    //     avatar: SDW_WEB.USER_INFO.avatar
    // }
    // CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
    //当下载页面关闭时，恢复页面滚动
    _indexView.$watch('downloadApp', function () {
        if(_indexView.downloadApp === false) {
            $('body').css({
                overflow: 'auto'
            })
        }
    })
};

main();
window.onmessage = function (e) {
    var DATA = (typeof e.data ==='object')? e.data : JSON.parse(e.data);
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
            // 变换后的token校验值
            var token = faultylabs.MD5('' + data.channel + data.uid + secheme + oToken);
            data.token = token;
            var postUri = SDW_WEB.URLS.addParam(data, true, HTTP_STATIC + 'pltupgi');
            //send ajax
            SDW_WEB.getAjaxData(postUri, function (data) {
                console.log(data);
            })
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