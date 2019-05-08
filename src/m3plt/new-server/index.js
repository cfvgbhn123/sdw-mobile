//处理跳转
require('../index/js/url');

require('../init.scss');
require('./index.scss');

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
// import '../index/libs/q.min';
import '../index/libs/qrcode';
var $ = require('../index/libs/jquery-3.1.0.min');

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
var gameInfo = require('./components/game-info.vue');
var footerItem = require('../components/footer-item/footer-item.vue');

//js
import Fn from '../index/js/Fn'
import CheckInfo from '../index/js/check';

var TransServerDate = require('../../mobile/game/libs/TransServerDate.js');
// import  transServerDate from ('./libs/transServerDate.js');
console.log("11111",TransServerDate)
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
    fromM3plt: SDW_WEB.queryParam['from'] === 'm3plt',
    //m3pltGame样式控制
    onM3pltGame: SDW_WEB.onM3pltGame,
    m3pltCGame: SDW_WEB.onM3pltGame ? "m3pltGame-container" : "",
    m3pltLGame: SDW_WEB.onM3pltGame ? 'm3plt-l-container' : '',
    m3pltRGame: SDW_WEB.onM3pltGame ? 'm3plt-r-container' : '',
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
    //下载页面
    downloadApp: false,
    //提示
    mytips: {
        ok: false,
        error: false,
        ct: ""
    },
    //位置
    tipPot: {

    },
    // 礼包
    hidegiftCode: false,
    giftCode: "",
    //登录相关
    loginShow: {
        'visibility': 'hidden',
        'opacity': 0
    },
    //用户信息
    usrInfo: {
        avatar:  SDW_WEB.USER_INFO.avatar || '',
        nick:    SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid || ''
    },
    "APP": APP,
    //玩游戏相关
    gamesModal:{
        isFull: false,
        isPlaying:false,
        collectList:[],
        gamePlayList:[]
    },
    currentGameUrl: '',
    rightFixed: calRightFixed(),
    load: false,
    page1: 0,
    page2: 0,
    loaded: false,
    gameListMap: {
        'al': [{id: -1, isClick: true, name: '全部'}],
        'new': [{id: -1, isClick: true, name: '全部'}]
    },
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
    //统一在父页面进行相对路径跳转
    gotoDetail: function (gid) {
        location.href = '../detail/?gid='+ gid + "&channel="+SDW_WEB.channel;
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
        location.href = "../gift/?channel="+ SDW_WEB.channel;
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
    //获取开服信息对应数据
    getServerType: function(type) {
        var self = this;
        switch(type) {
            case 0:
            self.titleSelected = 0;
            self.currentServer = 'al';
            self.showMoreBtn = true;
            _indexView.loadServerList(0);
            break;
            case 1:
            self.titleSelected = 1;
            self.currentServer = 'new';
            self.showMoreBtn = true;
            _indexView.loadServerList(1);
            break;
            default:
            self.titleSelected = 0;
            self.currentServer = 'al';
            self.showMoreBtn = true;
            _indexView.loadServerList(0);
        }
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
    changeGameItem: function (item) {
        this.showMoreBtn = item.id === -1 && !this.loaded;
        // this.showMoreTips = item.gid !== -1;
        for (var i = 0; i < this.gameListMap[this.currentServer].length; i++) {
            var ite = this.gameListMap[this.currentServer][i];
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
        var serverDate = new TransServerDate(time, window.SERVER_TIME, isPrv);
        return serverDate.formatDate();
    },
    getMoreServer: function () {
        var self = this;
        var type = self.currentServer==='al' ? 0 : 1;
        var page = type === 0 ? self.page1++ : self.page2++;
        if(self.load) return ;
        self.load = true;
        var getUri = SDW_WEB.URLS.addParam({
            page: page,
            type: type
        }, false, HTTP_STATIC + 'serverinfo');
        SDW_WEB.getAjaxData(getUri, function (data) {

            window.PAGE_TIME = data.ct;
            window.SERVER_TIME = data.ct;
            if (data.result === 1){
                if (data.list && data.list.length) {
                    var SERVER_MAP = {};
                    for(var i=0; i<data.list.length; i++) {
                        var temp = data.list[i];
                        /* if(!SERVER_MAP[temp.appId]) {
                            SERVER_MAP[temp.appId] = 1;
                            temp.id = temp.appId;
                            temp.serverDateStr = self.transServerDate(temp.sTime, type);
                            temp.serverDateStr && self.ServerDataList[self.currentServer].push(temp);
                        } */
                        var _temp ={
                            new : type === 1 ? 1: 0,
                            id: temp.appId,
                            serverDateStr: self.transServerDate(temp.sTime, type),
                            icon: temp.icon,
                            bIcon: temp.bIcon,
                            name: temp.name,
                            sName: temp.sName,
                            show: true
                        }
                        _temp.serverDateStr && self.ServerDataList[self.currentServer].push(_temp);
                        //处理右边显示游戏名
                        if(!SERVER_MAP[_temp.id]) {
                            SERVER_MAP[_temp.id] = 1;
                            self.gameListMap[self.currentServer].push({
                                'isClick': false,
                                'name': _temp.name,
                                'id': _temp.id
                            });
                        }
                    }
                    console.log("ss", self.ServerDataList[self.currentServer]);
                }else {
                    self.showMoreBtn = false;
                    self.load = true;
                    dialog.show('error', '没有更多开服信息了！', 1);
                }
                self.$nextTick(function () {
                    self.load = false;
                });
            }else {
                console.log('get server data error.');
            }
        })
    },
    //加载游戏开服数据
    loadServerList: function (type) {
        var self =this;
        //已有数据不在加载
        if(self.ServerDataList[self.currentServer].length) {
            return false;
        }
        var page = type === 0 ? self.page1++ : self.page2++;
        var getUri = SDW_WEB.URLS.addParam({
            page: page,
            type: type
        }, false, HTTP_STATIC + 'serverinfo');
        SDW_WEB.getAjaxData(getUri, function (data) {

            window.PAGE_TIME = data.ct;
            window.SERVER_TIME = data.ct;
            if (data.result === 1 && data.list && data.list.length) {
                var SERVER_MAP = {};
                for(var i=0; i<data.list.length; i++) {
                    var temp = data.list[i];
                    /* if(!SERVER_MAP[temp.appId]) {
                        SERVER_MAP[temp.appId] = 1;
                        temp.id = temp.appId;
                        temp.serverDateStr = self.transServerDate(temp.sTime, type);
                        temp.serverDateStr && self.ServerDataList[self.currentServer].push(temp);
                    } */
                    var _temp ={
                        new : type === 1 ? 1: 0,
                        id: temp.appId,
                        serverDateStr: self.transServerDate(temp.sTime, type),
                        icon: temp.icon,
                        bIcon: temp.bIcon,
                        name: temp.name,
                        sName: temp.sName,
                        show: true
                    }
                    _temp.serverDateStr && self.ServerDataList[self.currentServer].push(_temp);
                    //处理右边显示游戏名
                    if(!SERVER_MAP[_temp.id]) {
                        SERVER_MAP[_temp.id] = 1;
                        self.gameListMap[self.currentServer].push({
                            'isClick': false,
                            'name': _temp.name,
                            'id': _temp.id
                        });
                    }
                }
                // console.log(self.gameListMap)
            }
        })
        // console.log(self.gameListMap)
    }
};

var _indexView;

// 页面的主入口
var main = function () {

    _indexView = new Vue({
        el: '#app',
        data: indexData,
        computed: {
            //针对梦平台兼容
            m3plRrightFixed: function() {
                return (SDW_WEB.onM3plt ? '863px' : 'auto');
            }
        },
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
            gameInfo: gameInfo,
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
    
    //底部兼容梦平台
    (function() {
        if(indexData.onM3plt) {
            $(".my_footer").addClass("m3plt-footer-l");
        }
    })();
    //初始化开服信息
    _indexView.loadServerList(0);
    window._indexView = _indexView;
    // 2018.9.10新增兼容梦平台游戏内进入
    if(indexData.onM3pltGame){
        SDW_WEB.getM3pltUserData(function (data) {
            APP.dhLogin(data);
        }, function (data) {
            dialog.show('error', '用户信息获取失败，请重新进入', 1);
        })
    }
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
            var gameUrl = DATA.option.gid ? SDW_PATH.GAME_URL('play',  DATA.option.gid) : DATA.option.url;
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