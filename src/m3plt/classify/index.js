//处理跳转
require('../index/js/url');

require('../init.scss');
require('./index.scss');

//库
var $ = require('../index/libs/jquery-3.1.0.min');
import '../index/libs/MD5.min';

var searchInput = require('../components/search-input/search-input.vue');
var lGameItem = require('./component/l-game-item/l-game-item.vue');
var alertGame = require('../components/alert-game/alert-game.vue');
var leftPart = require('../index/component/games-modal/left-part.vue');
var rightPart = require('../index/component/games-modal/right-part.vue');
var fullPart = require('../index/component/games-modal/full-part.vue');
var homePageTop = require('../components/home-page-top/top.vue');
var topDownload = require('../components/top-download/download.vue');
var topContact = require('../components/top-contact/contact.vue');
var topLogin = require('../components/top-login/login.vue');
var giftAlert = require('../index/component/games-modal/gift-alert.vue');
var footerItem = require('../components/footer-item/footer-item.vue');
import Fn from "../index/js/Fn";
import CheckInfo from '../index/js/check';

//数据处理
window.APP = {};
APP.guid = Fn.GUID2();
APP.APP_ROOT = '../index/?channel=' + SDW_WEB.channel;
APP.width = document.documentElement.clientWidth || document.body.clientWidth;
APP.height = document.documentElement.clientHeight || document.body.clientHeight;
APP.os = 0;

var calRightFixed = function () {
    var width = document.documentElement.clientWidth || document.body.clientWidth;
    var offset = 0;

    if (width < 990) {
        offset = 990 - width;
        width = 990;
    }

    return (width - 980) / 2 - 6 - offset;
};


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
    //登录相关
    loginShow: {
        'visibility': 'hidden',
        'opacity': 0
    },
    "APP": APP,
    //下载页面
    downloadApp: false,
    //用户信息
    usrInfo: {
        avatar:  SDW_WEB.USER_INFO.avatar || '',
        nick: SDW_WEB.USER_INFO.nick || SDW_WEB.USER_INFO.uid || ''
    },
    //联系客服
    contactContainer: "",
    firstSearchFlg: false,
    currentGameUrl: '',
    rightFixed: calRightFixed(),
    load: false,
    page: 0,
    searchTypes: [
        {id: -1, isClick: true, name: '全部'},
    ],
    searchTips: [
        {id: -1, isClick: true, name: '全部'},
        {id: 0, isClick: false, name: '最新'},
        {id: 1, isClick: false, name: '最热'},
    ],

    searchGameListData: [],

    APP_ROOT_HOME: '../index/?channel=' + SDW_WEB.channel,
    APP_ROOT_GIFT: '../gift/?channel=' + SDW_WEB.channel,

    showMoreBtn: false,
    searchKey: '',
    searchType: '',
    searchFlag: 1,
    searchTip: '',
    //玩游戏相关
    gamesModal:{
        isFull: false,
        isPlaying:false,
        collectList:[],
        gamePlayList:[]
    },
    //控制游戏界面切换账号时，关闭登录界面是否刷新页面
    unloginClose: false
};

var indexMethods = {
    //统一在父页面进行相对路径跳转
    gotoDetail: function (gid) {
        location.href = '../detail/?gid='+ gid + "&channel="+SDW_WEB.channel;
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
        //游戏界面切换账号关闭登录刷新
        if(this.unloginClose) {
            location.reload();
        }
    },
    //关闭下载页面
    closeDialog: function () {
        this.downloadApp = false;
    },
    //显示客服
    showConDialog: function () {
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
    //礼包
    showGiftPage: function (e) {
    location.href = "../gift/";
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

            var self = this;
            this.searchKey = type;
            this.searchType = '';
            this.searchFlag = '';
            this.page = 0;

            this.$nextTick(function () {
                self.loadSearchGame();
            })

        }
    },

    // 变更右侧点击的事件
    changeSearch: function (item, type) {

        if (this.load) return;

        var self = this;
        var list = this[type];

        for (var i = 0; i < list.length; i++) {
            var ite = list[i];
            ite.isClick = ite.id === item.id;
        }

        // 点击完成后，要查询不同的类型的游戏
        if (type === 'searchTypes') {

            this.searchType = item.id === -1 ? '' : item.name;
        } else {

            this.searchTip = item.id === -1 ? '' : item.name;
        }

        this.page = 0;
        this.searchKey = '';

        this.$nextTick(function () {
            // 重新加载游戏
            self.loadSearchGame();
        })
    },


    loadSearchGame: function (add) {

        if (this.load) return;
        this.load = true;

        var self = this;
        var searchUri = SDW_WEB.URLS.addParam({
            key: this.searchKey,
            type: this.searchType,
            tip: this.searchTip,
            flag: this.searchFlag,
            page: this.page++
        }, true, HTTP_STATIC + 'search');

        SDW_WEB.getAjaxData(searchUri, function (data) {

            if (data.result === 1) {

                self.firstSearchFlg = true;

                self.initSearchTypes(data.typeList);

                if (data.list && data.list.length) {

                    if (add) {
                        self.searchGameListData = self.searchGameListData.concat(data.list);
                    } else {
                        self.searchGameListData = data.list;
                    }

                    if (data.list.length < data.pageSize) {
                        self.showMoreBtn = false;
                    } else {
                        self.showMoreBtn = true;
                    }

                } else {
                    if (add) {
                        self.searchGameListData = self.searchGameListData.concat(data.list);
                    } else {
                        //未搜索到则回复初始值
                        self.searchGameListData = [];
                    }
                    self.showMoreBtn = false;
                }
            }

            self.$nextTick(function () {
                self.load = false;
            });

        })
    },

    loadMoreSearchGame: function () {

        this.loadSearchGame(true);

    },

    initSearchTypes: function (types) {

        if (this.searchTypes.length !== 1)return;

        var _types = types.split(',');

        for (var i = 0; i < _types.length; i++) {

            this.searchTypes.push(
                {id: i, isClick: false, name: _types[i]},
            )
        }
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
            lGameItem: lGameItem,
            alertGame: alertGame,
            leftPart: leftPart,
            rightPart: rightPart,
            homePageTop: homePageTop,
            topDownload: topDownload,
            topContact: topContact,
            topLogin: topLogin,
            giftAlert: giftAlert,
            fullPart: fullPart,
            footerItem: footerItem,
        },
        mounted: function () {
            //获取sessionStorage初始化gamesModal值，防止刷新首页左侧信息消失
            if(sessionStorage && sessionStorage.collect){
                this.gamesModal.gamePlayList = JSON.parse(sessionStorage.collect).data;
            }
            if( sessionStorage && sessionStorage.isPlaying == 'true' ){
                this.gamesModal.isPlaying = true ;
            }
        }
    });


    // 默认有搜索的游戏

    if (SDW_WEB.queryParam['searchKey']) {
        _indexView.searchKey = SDW_WEB.queryParam['searchKey'];
    }

    _indexView.$nextTick(function () {
        _indexView.loadSearchGame();
    });
    window._indexView = _indexView;
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
            });
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
        console.log("授权信息", DATA.data);
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
                console.log(data);
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