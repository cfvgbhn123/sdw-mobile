var $ = require('../libs/jquery-3.1.0.min');
var CheckOpenGame = require('../../components/js/CheckOpenGame');
import bus from './eventBus';
import { setTimeout } from 'timers';

var firstAuthed = 0;     //防止authToGame无限执行
var m3pltGame = [1296320599, 1247433539];   //梦三游戏内默认打开游戏
var onM3pltGame = SDW_WEB.onM3pltGame;

export default {
    GUID: function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4());
    },
    GUID2: function () {
        var guid = "";
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        if (localStorage && localStorage['H5_GUID']) {
            // 如果存在
            guid = localStorage['H5_GUID'];

        } else {
            for (var i = 0; i < 8; i++) {
                guid += S4();
            }
            localStorage['H5_GUID'] = guid;
        }
        return guid;
    },
    /**
     * @params {object} 请求参数
     */
    getMyData: function (params, url, callback, myUrl) {
        var postUri = myUrl ? SDW_WEB.URLS.addParam(params, false, myUrl + url) : SDW_WEB.URLS.addParam(params, false, HTTP_STATIC + url);
        SDW_WEB.getAjaxData(postUri, callback);
    },
    /**
     * 游戏授权
     */
    authToGame: function (gameItem) {
        var self = this;
        var gid = gameItem.id || gameItem.gid;
        //处理轮播广告链接
        if(!(/^[0-9]*$/.test(gid))&&gameItem.url) {
            window.open(gameItem.url);
            return false;
        }
        //处理梦平台游戏打开
        if(SDW_WEB.onM3plt) {
            SDW_WEB.m3pltOpenGame(gid);
            return false;
        }
        if (!SDW_WEB.USER_INFO.uid && !SDW_WEB.USER_INFO.id) { //未登录状态
            //登录
            this.$emit("login-dialog", "", "");
            bus.$emit("get-qrcode");
            APP.loginCallback = function () {
                self.authToGame(gameItem);
            };
            return;
        }
        if (/^[0-9]*$/.test(gid)) {
            var HTTP_CHECK = HTTP_USER_STATIC + 'authgame';
            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme,
                gid: gid,
            }, false, HTTP_USER_STATIC + 'authgame');
            // 进行授权
            SDW_WEB.getAjaxData(postUri, function (data) {
                if (data.result == 1) {
    
                    if (sessionStorage['HTTP_MAIN#0']) {
                        var CACHE = JSON.parse(sessionStorage['HTTP_MAIN#0']);
    
                        if (!CACHE.recent) {
                            CACHE.recent = [];
                        }
                        // 剔除重复的游戏项目
                        for (var i = 0; i < CACHE.recent.length; i++) {
                            var item = CACHE.recent[i];
                            if (item.id + '' == '' + _gamesRoot.gid) {
                                CACHE.recent.splice(i, 1);
                                break;
                            }
                        }
    
                        // 将目前玩的游戏追加到最前面
                        CACHE.recent.unshift({
                            "id": _gamesRoot.gid,
                            "icon": data.icon,
                            "name": data.name,
                            "time": +new Date()
                        });
    
                        sessionStorage['HTTP_MAIN#0'] = JSON.stringify(CACHE);
                    }
    
                    if (data.param) {
                        var param = self.getQuery();
                        var gameUrl;
                        // 请求使用测试地址
                        if (param['sdw_test'] == 'true') {
    
                            if (data.testUrl) {
                                gameUrl = data.testUrl;
                            } else {
                                gameUrl = data.url;
                            }
    
                        } else {
                            gameUrl = data.url;
                        }
    
                        var gameLink = SDW_PATH.MOBILE_ROOT+"game/"+gid+".html"+"/?channel="+SDW_WEB.channel;
                        var urlExa = "";
                        for (var urlK in param) {
                            if (param.hasOwnProperty(urlK) && param[urlK] && urlK != "channel" && urlK != "gid") {
                                urlExa += urlK + "=" + param[urlK] + "&";
                            }
                        }
                        urlExa = urlExa.substr(0, urlExa.length - 1);
                        if (gameUrl.indexOf('?') == -1) {
                            gameUrl += '?' + urlExa;
                        } else {
                            gameUrl += '&' + urlExa;
                        }
                        if (gameUrl.indexOf('?') == -1) {
                            gameUrl += '?' + data.param;
                        } else {
                            gameUrl += '&' + data.param;
                        }
                        gameUrl += '&cburl=' + encodeURIComponent(gameLink);
                        gameUrl += '&reurl=' + encodeURIComponent(gameLink);
                        //传递fl
                        gameUrl += '&fl=' + SDW_WEB.USER_INFO.fl;
                        var currentProtocol = location.protocol;
    
                        // 非https游戏，跳转到http的用户授权
                        if (!/https:\/\//.test(gameUrl) && currentProtocol != 'http:') {
                            var nUrl = 'http://www.shandw.com/libs/addUserInfo.html?channel=' + channel + '&userInfo=' + encodeURIComponent(localStorage['H5_DATA15' + channel]) + '&gid=' + _gamesRoot.gid;
                            location.href = nUrl;
                            return;
                        }
                        gameItem.gameUri = gameUrl;
                        //添加横屏字段
                        gameItem.screen = data.screen;
                        gameItem.icon = data.icon;
                        //添加左侧游戏切换字段
                        gameItem.sOn = false;
                        //移动端跳转时需添加name字段
                        gameItem.name = (gameItem.name) ? gameItem.name : data.name;
                        //添加礼包数字段
                        $.ajax({
                            url: 'https://platform.shandw.com/gameinfo?gid='+gid+'&uid=' +data.uid,
                            success: function (data) {
                                var dataT = (typeof data === "object") ? data : JSON.parse(data);
                                gameItem.giftNum = dataT.gift.length;
                                self.checkOpenGame(gameItem);
                            }
                        })
                    } else {
                        location.href = APP_ROOT;
                    }
    
    
                } else {
                    // dialog.show('error', data.msg, 2);
                    // dialog.show('error', '登录过期请重新登录', 1);
                    //授权出错重新登录
                    localStorage.clear();
                    sessionStorage.clear();
                    // dialog.show('error', '游戏授权错误', 1);
                    self.$emit("login-dialog", "", "");
                    bus.$emit("get-qrcode");
                    APP.loginCallback = function() {
                        self.authToGame(gameItem);
                    };
                    return;
                }
            });
        }
        //梦三游戏内默认加载的游戏
        if(onM3pltGame) {
            if(!firstAuthed) {
                setTimeout(function () {
                    m3pltGame.forEach(function (v, index) {
                        var gameItem = {
                            "gid": v,
                            "defGame": true
                        }
                        setTimeout(function () {
                            self.authToGame(gameItem);
                        }, 100*index);
                    })
                }, 100);
            }
            firstAuthed = 1;
        }
    },
    //url->obj
    getQuery: function (uri) {
        var url = uri || window.location.href;
        var reg = /([^\?\=\&]+)\=([^\?\=\&]*)/g;
        var obj = {};
        while (reg.exec(url)) {
            obj[RegExp.$1] = RegExp.$2;
        }
        return obj;
    },
    checkOpenGame: function (item) {
        var data = {
            playing: true,
            icon: item.icon || item.adImg,
            id: item.id || item.gid,
            name: item.name || item.myGameName,
            gameUri: item.gameUri,
            screen: item.screen,
            giftNum: item.giftNum,
            sOn: item.sOn
        }
        this.gamesModal.isPlaying = true;
    
        //判断是否全屏 默认游戏初次打开要过滤掉
        if(data.screen ==2 || data.screen == 3) {
            this.gamesModal.isFull = true;
        }else if(!item.defGame){
            this.gamesModal.isFull = false;
        }
        // if(data.screen !=2 && !item.defGame) {
        //     this.gamesModal.isFull = false;
        // }

        /*对列表中已存在的游戏不进行操作*/
        var index = this.findGame(data.id, this.gamesModal.gamePlayList);
        if (!index) { //列表中无该游戏
            if (this.gamesModal.gamePlayList.length < 3) {
                if(item.defGame) {  //针对默认游戏排版
                    data.playing = false;
                    this.gamesModal.gamePlayList.push(data);
                }else {
                    this.gamesModal.gamePlayList.unshift(data);
                }
            } else {
                this.gamesModal.gamePlayList.pop();// 移除最後一元素*/
                this.gamesModal.gamePlayList.unshift(data);
            }
        } else {//列表中已存在该游戏
            this.gamesModal.gamePlayList[index - 1].playing = true;
            if(this.gamesModal.gamePlayList[0].screen !=2 && this.gamesModal.gamePlayList[0].screen !=3) {
                //点击了全屏,全屏游戏已存在但非第一个游戏,显示非全屏游戏
                this.gamesModal.isFull = false;
            }else {
                //点击了非全屏游戏 全屏游戏已存在第一个游戏,显示全屏游戏
                this.gamesModal.isFull = true;
            }
        }
        //打开所有游戏
        if (sessionStorage) {
            this.gamesModal.gamePlayList.forEach(function (v, index) {
                if(onM3pltGame) {
                    //兼容梦三游戏情况，只打开第一个游戏
                    v.playing = index==0 ? true : false;
                } else {
                    v.playing = true;
                }
            });
            //处理左侧侧换的情况
            //跳转页面打开游戏，根据条件显示所有游戏
            if(this.gamesModal.gamePlayList[0].screen) {
                this.gamesModal.gamePlayList.forEach(function (v, index) {
                    // 情况1  新页面打开横屏，其他均置位不开
                    if(index!==0) {
                        v.sOn = false;
                    }
                });
            }
            //情况2 若已经打开了横屏游戏，则关闭横屏
            if(!this.gamesModal.gamePlayList[0].screen) {
                this.gamesModal.gamePlayList.forEach(function (v, index) {
                    // 情况1  新页面打开横屏，其他均置位不开
                    if(index!==0&&v.screen&&v.sOn) {
                        v.sOn = false;
                    }
                });
            }
            sessionStorage.isPlaying = true;
            sessionStorage.collect = JSON.stringify({
                data: this.gamesModal.gamePlayList,
            })
        }
        CheckOpenGame.checkOpenUrl(data);
    },
    findGame: function (id, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (id == arr[i].id) {
                return i + 1;
            }
        };
        return false;
    },
    /**
     * 负责请求数据，只对请求的返回的数据进行处理
     * @param url {string}
     * @param callback {Function}
     */
    getAjaxData: function (url, callback) {
        var o = SDW_WEB.URLS.queryUrl(!1, url);
        var  r = {};
        for (var a in o) {
            if(o.hasOwnProperty(a)) {
                r[a] = o[a];
            }
        }
        var s = window.devicePixelRatio || 1;
        r.imei = SDW_WEB.guid;
        r.os = SDW_WEB.os;
        r.tg = 0;
        r.w = SDW_WEB.width * s;
        r.h = SDW_WEB.height * s;
        SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.fl && (r.fl = SDW_WEB.USER_INFO.fl);
        var l = SDW_WEB.queryParam;
        l[SDW_WEB.sender_sdw_id] && (r.rfid = l[SDW_WEB.sender_sdw_id]);
        var u = url.split("?")[0];
        var url2 = SDW_WEB.URLS.addParam(r, false, u);
        var f = function () {
            var e;
            if (window.XMLHttpRequest) {
                e = new XMLHttpRequest();
                e.overrideMimeType && e.overrideMimeType("text/xml");
            }else if (window.ActiveXObject) {
                for (var t = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], n = 0; n < t.length; n++) {
                    try {
                        if (e = new ActiveXObject(t[n])) break;
                    }
                    catch (e) {
    
                    }
                }
            }
            return e
        }();
        f&&(f.open("GET", url2, true));
        f.onreadystatechange = function() {
            if(4===f.readyState&&200===f.status) {
                var o =(typeof (f.responseText) == 'object') ? f.responseText : JSON.parse(f.responseText);
                callback(o);
            }
        };
        f.send(null);
    }
}