/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var _protocol_ = location.protocol;

var gameItem = require('../../components/mobile/game-item/game-item.vue');
var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');
var loadingView = require('../../components/mobile/loading/loading.vue');
var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');
var fastLogin = require('../../components/mobile/login/login.vue');
var taskInfo = require('../../components/mobile/task-info/task-info.vue');
var taskGetAlert = require('../../components/mobile/task-get-alert/task-get-alert.vue');

var WindowScroll = require('../../libs/WindowScroll');

require('./index.scss');
require('../../components/initcss.scss');


// console.log(SDW_WEB.onSafari && SDW_WEB.onIOS && !SDW_WEB.onAPPs)
var indexData = {

    onAPPs: SDW_WEB.onAPPs,

    hideDownlaodApp: SDW_WEB.onShandw || (SDW_WEB.onIOS && SDW_WEB.channel == '10083'),

    showSaishi: true,

    // showSaishi: false,

    onSafari: SDW_WEB.onSafari && SDW_WEB.onIOS && !SDW_WEB.onAPPs,

    __footIndex__: null,

    showTopNav: SDW_WEB.channel != '10041',

    showCodes: SDW_WEB.onWeiXin,
    onShandw: SDW_WEB.onShandw,
    bindPhoneItem: {},

    showEwmV2: 0,
    user: {
        isLogin: 0,
        gold: 0,
        avatar: '',
        nick: '',
        phone: 0,
        showPhoneTips: false
    },
    // NOW_PAGE: 0,
    pageHasLoading: false,
    hotGameList: [],
    newGameList: [],
    isShowHotGame: true,
    hotGames: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    newGames: {
        isLoad: false,
        page: 0,
        hasMoreData: true
    },
    recommendList: [],
    bannerList: [],
    currentTaskItem: {}
};

var indexMethods = {

    computedQcode: function () {

        // 只在微信中显示二维码，并且channel大于9000000
        if (!SDW_WEB.onWeiXin || SDW_WEB.channel < 9000000) {
            this.showEwmV2 = false;
            return;
        }

        function isToday(old, date) {

            old = parseInt(old) || 0;
            date = parseInt(date) || 0;

            var oldDate = new Date(old), nowDate = new Date(date);

            return oldDate.getFullYear() == nowDate.getFullYear() &&
                oldDate.getMonth() == nowDate.getMonth() &&
                oldDate.getDate() == nowDate.getDate();
        }


        var localDate = SDW_WEB.Store.get('_qCode', true);
        localDate = localDate || 0;
        var nowDate = +new Date();

        // 只显示当天的
        if (!isToday(localDate, nowDate)) {

            SDW_WEB.Store.set('_qCode', nowDate, true);
            this.showEwmV2 = true;

        } else {
            this.showEwmV2 = false;
        }

    },

    downloadSdwApp: function () {

        // 下载闪电玩APP
        location.href = 'http://dhurl.cn/iE7Rv2';

    },

    gotoSDWWEIXIN: function () {
        // alert(SDW_WEB.SDW_WEIXIN_URL)
        location.href = SDW_WEB.SDW_WEIXIN_URL;
    },

    // 跳转到我的任务界面
    gotoTaskPage: function () {

        this.$refs.taskgetalert.showInfo = 0;
        this.user.phone = 0;

        if (SDW_WEB.onShandw) {

            SDW_WEB.sdw.switchTab('task');
            return;
        }

        location.href = SDW_WEB.MOBILE_ROOT + 'task/?channel=' + SDW_WEB.channel + '&v=' + SDW_WEB.version;
    },

    /**
     * 去我的首页
     */
    gotoMyHome: function () {

        if (SDW_WEB.USER_INFO.uid) {

            SDW_WEB.onShandw ? (SDW_WEB.sdw.switchTab('home')) : ( location.href = SDW_WEB.MOBILE_ROOT + 'home/?channel=' + SDW_WEB.channel + '&v=' + SDW_WEB.version);

        } else {

            SDW_WEB.onShandw ? (SDW_WEB.sdw.openLogin({
                success: function () {
                    // SDW_WEB.sdw.switchTab('home');
                }
            })) : (this.__showLoginPage());
        }
    },

    // 显示APP的底部工具栏
    showSdwAPPMoreBtn: function () {
        SDW_WEB.onShandw && SDW_WEB.sdw.onShowToolBar();
    },

    // 跳转到礼包的界面
    gotoGiftPage: function () {

        var targetUrl = SDW_WEB.MOBILE_ROOT + 'gift/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: '游戏礼包'
        });

    },

    showPhoneBindFn: function () {

        var self = this;
        this.user.showPhoneTips = 0;
        clearInterval(window.bindPhoneTimer);

        setTimeout(function () {
            self.$refs.bindPhone.showbind = 1;
        }, 20);

    },

    // 转换金币
    transCoins: function (coin) {
        var big, small;

        if (coin < 10000) return coin;

        if (coin < 100000000) {
            big = coin / 10000 >> 0;
            small = (coin % 10000) + '';

            if (small == 0) {
                return big + '万';
            }

            return big + '.' + small[0] + '万';
        }

        if (coin < 10000000000) {
            big = coin / 100000000 >> 0;
            small = (coin % 100000000) + '';

            if (small == 0) {
                return big + '亿';
            }

            return big + '.' + small[0] + '亿';
        }
    },
    /**
     * 转换时间
     * @param date
     */
    transDate: function (date) {

        if (!date) return null;

        var NOW_TIME = +new Date();

        var obj = new Date(date), dT = NOW_TIME - date,
            year = obj.getFullYear(), month = obj.getMonth() + 1,
            day = obj.getDate();

        if (dT < 24 * 60 * 60 * 1000) {

            // 显示时间形式   25秒前  |  16分钟前  |  1小时前
            if (dT < 60 * 60 * 1000) {

                if (dT < 1000 * 10) return '刚刚玩过';

                if (dT < 60 * 1000) return (dT / 1000 >> 0) + '秒前';

                return (dT / ( 60 * 1000) >> 0) + '分前';

            }

            return (dT / ( 60 * 60 * 1000) >> 0) + '时前';
        }

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return month + '.' + day;
    },

    // 变更游戏的显示  1是热游  0是新游
    changeGameListState: function (isHot) {

        if (this.pageHasLoading) return;

        this.isShowHotGame = isHot;

        hotGameScroll.enable = (isHot == 1);
        newGameScroll.enable = (isHot == 0);

        if (isHot == 0 && this.newGames.page == 0) {
            this.loadNewGameList();
        }
    },

    // 点击到游戏，需要进行用户登录状态的检测
    // APP（微信，微博，QQ）内是要求强制登录的
    checkGameSate: function (type, id, gameUrl) {

        // 在闪电玩中，对于

        var hasLogin = SDW_WEB.USER_INFO.uid;

        var goUrlParam = {
            gid: id,
            channel: SDW_WEB.channel
        };

        var Url = type == 'play' ? SDW_WEB.MOBILE_ROOT + 'game/' :
            SDW_WEB.MOBILE_ROOT + 'detail/';

        var targetUrl = SDW_WEB.URLS.addParam(goUrlParam, false, Url);

        if (type == 'play') {

            // 玩游戏
            if (hasLogin) {

                // 打开玩游戏的界面
                SDW_WEB.openNewWindow({
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                });

            } else if (SDW_WEB.onShandw) {

                // 闪电玩登录
                SDW_WEB.sdw.openLogin({
                    success: function () {
                    }
                });

            } else {

                // 普通短信登录
                this.__showLoginPage();
            }

        } else {

            // 打开游戏的详情，不需要登录*********
            SDW_WEB.openNewWindow({
                link: targetUrl,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

        }
    },

    __showLoginPage: function (index) {
        // 普通短信登录
        this.$refs.login.show = '1';
        this.__footIndex__ = index;
    },

    // 登录成功的回调
    loginOkCallback: function () {

        // 需要重新刷新用户信息
        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            page: 0,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + (SDW_WEB.channel == '10041' ? 'hts10041' : 'main'));

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1 && SDW_WEB.channel != '10041') {
                self.user.avatar = data.avatar;
                self.user.gold = data.gold;
                self.bindPhoneItem = data.phoneTask;
                self.currentTaskItem = data.phoneTask;
                self.user.phone = data.phone;
                self.user.isLogin = 1;

                // self.currentTaskItem.title = '绑定手机成功';
                self.currentTaskItem.info = '新的成就已经解锁，请前往成就领取奖励';
            }

            // 我最近玩的
            self.recommendList = self.createRecommend(data);
            self.user.showPhoneTips = !data.phone;

            // 默认10秒隐藏
            window.bindPhoneTimer = setTimeout(function () {
                self.user.showPhoneTips = 0;
            }, 10 * 1000);

            function toolWindowFn(e) {
                window.bindPhoneTimer && clearTimeout(window.bindPhoneTimer);

                window.bindPhoneTimer = setTimeout(function () {
                    self.user.showPhoneTips = false;
                }, 3 * 1000);

                document.removeEventListener('touchstart', toolWindowFn, false);
            }

            // 点击任意位置，3秒钟悬浮窗消失
            document.addEventListener('touchstart', toolWindowFn, false);

            self.$nextTick(function () {
                var aImages = document.querySelectorAll('img[data-loaded="0"]');
                loadImg(aImages);
            });

            self.$refs.login.show = '';
            dialog.show('ok', '登录成功', 1);
        });

    },

    // 加载最新的游戏列表
    loadNewGameList: function () {
        if (this.newGames.isLoad || !this.newGames.hasMoreData) return;
        this.newGames.isLoad = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            page: this.newGames.page,
            type: '',
            flag: 1
        }, false, HTTP_STATIC + 'pcgg');

        this.pageHasLoading = true;

        // 请求数据
        SDW_WEB.getAjaxData(postUri, function (data) {
            self.pageHasLoading = false;

            if (data.result == 1) {

                self.newGames.page++;

                if (data.list.length == 0) {
                    self.newGames.hasMoreData = false;
                }

                var gameList = data.list, _hotList = [];

                for (var i = 0; i < gameList.length; i++) {
                    var item = gameList[i];
                    _hotList.push({
                        id: item.id,
                        cover: item.bIcon,
                        title: item.name,
                        time: item.time,
                        star: item.vStar,
                        quantity: item.vPv,
                        desc: item.sInfo,
                        tags: item.gift ? ['gift'] : [],
                        url: item.url
                    })
                }

                self.newGameList = self.newGameList.concat(_hotList);
            }

            self.$nextTick(function () {

                loadDelayImg();

                setTimeout(function () {
                    self.newGames.isLoad = false;
                }, 300);
            })
        });
    },

    // 轮播图的点击
    clickBannerEvt: function (index) {

        // 轮播有不同的状态，具体跳转什么有个定义的值
        if (this.bannerList[index].url) {


            // 读取轮播上的跳转地址
            var links = this.bannerList[index].url;

            if (links.indexOf('?') === -1) {

                links += '?channel=' + SDW_WEB.channel;

            } else {

                links += '&channel=' + SDW_WEB.channel;
            }


            // 打开玩游戏的界面
            SDW_WEB.openNewWindow({
                link: links,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

            // console.log('click banner');

        } else {

            this.checkGameSate('play', this.bannerList[index].id);
        }

    },

    createRecommend: function (data) {
        var recent = data.recent || [];
        var recommend = data.recommand || [];  // 推荐

        var recommend_split = [];

        if (recent.length) {

            for (var i = 0; i < recommend.length; i++) {

                for (var j = 0; j < recent.length; j++) {
                    if (recommend[i].id == recent[j].id) {
                        break;
                    }
                }

                if (j == recent.length) {
                    recommend_split.push(recommend[i]);
                }
            }

        } else {
            recommend_split = recommend;
        }

        var recommendList = recent.concat(recommend_split);

        var _len = this.showSaishi ? 3 : 5;
        return recommendList.splice(0, _len);
    },

    // 检测赛事状态
    checkSaishi: function () {

        var hasLogin = SDW_WEB.USER_INFO.uid;

        // 玩游戏
        if (hasLogin) {

            // 打开赛事的链接
            SDW_WEB.openNewWindow({
                link: _protocol_ + '//www.shandw.com/Competition/?channel=' + SDW_WEB.channel,
                isFullScreen: false,
                showMoreBtn: true,
                title: ''
            });

        } else if (SDW_WEB.onShandw) {

            // 闪电玩登录
            SDW_WEB.sdw.openLogin({
                success: function () {
                }
            });

        } else {

            // 普通短信登录
            this.__showLoginPage();
        }

    },

    createBanner: function (data) {

        var banner = data.ad || [];

        var TEMP_HTML = '<img data-src=D_IMG class="swiper-slide slider-img" data-index=D_INDEX data-loaded="5">';

        var allInners = '';
        banner.forEach(function (item, index) {

            if (SDW_WEB.channel == '10041') {
                var inners = TEMP_HTML.replace(/D_IMG/, item['670x280']).replace(/D_INDEX/, index);
            } else {
                var inners = TEMP_HTML.replace(/D_IMG/, item.adImg).replace(/D_INDEX/, index);
            }

            allInners += inners;
        });

        document.querySelector('#bannercont').innerHTML = allInners;
        return banner;
    },

    // 绑定手机的回调
    bindPhoneCallback: function () {

        this.$refs.taskgetalert.showInfo = 1;
        this.$refs.bindPhone.showbind = 0;

    },

    // 更多的界面
    goMorePage: function () {

        var targetUrl = SDW_WEB.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: ''
        });

    },

    // 获取主页数据 包括第一个游戏列表
    loadMainData: function () {

        if (this.hotGames.isLoad || !this.hotGames.hasMoreData) return;
        this.hotGames.isLoad = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            page: this.hotGames.page,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + (SDW_WEB.channel == '10041' ? 'hts10041' : 'main'));

        this.pageHasLoading = true;

        SDW_WEB.getAjaxData(postUri, function (data) {

            self.pageHasLoading = false;

            // =========================================================================================================
            // 首次加载
            // =========================================================================================================
            if (self.hotGames.page == 0) {


                self.user.avatar = data.avatar;
                self.user.gold = data.gold;

                if (data.result == 1 && SDW_WEB.channel != '10041') {

                    self.bindPhoneItem = data.phoneTask;
                    self.currentTaskItem = data.phoneTask;
                    self.user.phone = data.phone;
                    self.user.isLogin = 1;

                    // self.currentTaskItem.title = '绑定手机成功';
                    self.currentTaskItem.info = '新的成就已经解锁，请前往成就领取奖励';

                }

                // 我最近玩的
                self.recommendList = self.createRecommend(data);
                // 轮播
                self.bannerList = self.createBanner(data);
                self.user.showPhoneTips = !data.phone;

                // 默认10秒隐藏
                window.bindPhoneTimer = setTimeout(function () {
                    self.user.showPhoneTips = 0;
                }, 10 * 1000);

                function toolWindowFn(e) {
                    window.bindPhoneTimer && clearTimeout(window.bindPhoneTimer);

                    window.bindPhoneTimer = setTimeout(function () {
                        self.user.showPhoneTips = false;
                    }, 3 * 1000);

                    document.removeEventListener('touchstart', toolWindowFn, false);
                }

                // 点击任意位置，3秒钟悬浮窗消失
                document.addEventListener('touchstart', toolWindowFn, false);

                var swiper = new Swiper('.banner-conatiner', {
                    pagination: '.swiper-pagination',
                    effect: 'coverflow',
                    grabCursor: true,
                    centeredSlides: true,
                    slidesPerView: 'auto',
                    loop: true,
                    autoplay: 5000,
                    autoplayDisableOnInteraction: false,
                    coverflow: {
                        rotate: 45,
                        stretch: 0,
                        depth: 145,
                        modifier: 1,
                        slideShadows: true
                    }
                });

                if (self.bannerList.length) {
                    var imgSrc = SDW_WEB.channel == '10041' ? self.bannerList[0]['670x280'] : self.bannerList[0].adImg;
                    document.querySelector('#topBanner').src = imgSrc;
                }

                document.addEventListener('touchstart', function (e) {
                    swiper && swiper.update(true);
                    swiper && swiper.startAutoplay();
                }, false)

            }

            self.hotGames.page++;

            var gameList = data.list, _hotList = [];

            for (var i = 0; i < gameList.length; i++) {
                var item = gameList[i];
                _hotList.push({
                    id: item.id,
                    cover: item.bIcon,
                    title: item.name,
                    time: item.time,
                    star: item.vStar,
                    quantity: item.vPv,
                    desc: item.sInfo,
                    tags: item.gift ? ['gift'] : [],
                    url: item.url
                })
            }

            self.hotGameList = self.hotGameList.concat(_hotList);

            if (data.list.length == 0) {
                self.hotGames.hasMoreData = false;
            }

            self.$nextTick(function () {

                var aImages = document.querySelectorAll('img[data-loaded="0"]');
                loadImg(aImages);

                setTimeout(function () {
                    self.hotGames.isLoad = false;
                }, 300);


                if (self.hotGames.page == 1) {
                    setTimeout(function () {
                        var aImages2 = document.querySelectorAll('img[data-loaded="5"]');
                        loadImg(aImages2, true);
                        var bannerImg = document.querySelectorAll('.slider-img');
                        for (var i = 0; i < bannerImg.length; i++) {

                            // 轮播图的点击事件
                            bannerImg[i].onclick = function () {
                                self.clickBannerEvt(this.dataset.index)
                            }
                        }
                    }, 200)
                }


                // this.$refs.taskContainer.showInfo = 1;
            })
        })

    }
};

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {
        gameItem: gameItem,
        sdwFooter: sdwFooter,
        loadingView: loadingView,
        bindPhone: bindPhone,
        fastLogin: fastLogin,
        taskInfo: taskInfo,
        taskGetAlert: taskGetAlert,
    }
});

_indexView.$nextTick(function () {
    document.querySelector('body').style.display = 'block';
});


loadDelayImg();

// 图片懒加载
var imgScroll = new WindowScroll(loadDelayImg);

function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}
function loadImg(arr, not) {

    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].getBoundingClientRect().top < document.documentElement.clientHeight && !arr[i].isLoad) {
            arr[i].isLoad = true;
            arr[i].dataset.loaded = '1';
            !not && (arr[i].style.cssText = "transition: ''; opacity: 0;");
            aftLoadImg(arr[i], arr[i].dataset.src, not);
        }
    }
}
function aftLoadImg(obj, url, not) {
    if (!url) return;
    var oImg = new Image();
    oImg.onload = function () {
        obj.src = oImg.src;
        !not && (obj.style.cssText = "transition: 1s; opacity: 1;");
        var parentNode = obj.parentNode;
        if (parentNode && (hasClass(parentNode, 'game-cover-info') || hasClass(parentNode, 'recommend-list'))) {

            parentNode.style.transition = '.4s';
            parentNode.style.background = 'rgba(0,0,0,0)';
        }
    };
    oImg.src = url;

    function hasClass(node, className) {
        return node.classList.contains(className);
    }
}

// 热门游戏的
var hotGameScroll = new WindowScroll(function () {
    _indexView.loadMainData();
}, true, 200, 10);
// hotGameScroll.enable = false;

// 最新游戏
var newGameScroll = new WindowScroll(function () {
    _indexView.loadNewGameList();
}, true, 200, 10);
newGameScroll.enable = false;


function mainSetShare() {

    // 添加版本号
    var shareLinks = SDW_WEB.MOBILE_ROOT + 'index/?channel=' + SDW_WEB.channel + '&v=' + SDW_WEB.version;

    if (SDW_WEB.USER_INFO.uid) {
        shareLinks += '&' + SDW_WEB.sender_sdw_id + '=' + SDW_WEB.USER_INFO.uid
    }

    SDW_WEB.sdw.onSetShareOperate({
        title: '闪电玩 - 能提现的游戏平台',
        desc: '王座红包昼夜派送，一起开启掘金之旅',
        link: shareLinks,
        imgUrl: 'https://www.shandw.com/app/tabicon/sdw.png'
    });

    document.querySelector('.sDesc').content = '王座红包昼夜派送，一起开启掘金之旅';

}


if (SDW_WEB.onShandw) {

    // 获取闪电玩的用户信息，成功后进行数据加载
    SDW_WEB.getSdwUserData().then(function (userData) {

        // alert(JSON.stringify(userData));
        _indexView.loadMainData();
        mainSetShare();

    }, function (msg) {

        // 获取闪电玩用户数据失败
        SDW_WEB.USER_INFO = {};
        _indexView.loadMainData();
        mainSetShare();

    });

    // 设置APP的底部工具栏按钮
    SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo', 'copyLink']);

} else {

    // 加载首页数据
    _indexView.loadMainData();
    mainSetShare();
}

_indexView.$nextTick(function () {
    var hasShowSB = SDW_WEB.Store.get('_SB_CIGARETTE_FLAG_', true);

    // 计算是否显示二维码

    _indexView.computedQcode();

    if (SDW_WEB.channel == '10041') {

        if (!hasShowSB) {

            SDW_WEB.Store.set('_SB_CIGARETTE_FLAG_', 1, true);

            var ifm = document.createElement('iframe');
            ifm.src = location.protocol + '//www.shandw.com/h5/cigarette/dialog.html?v=' + SDW_WEB.version;
            ifm.id = 'sbmh';
            document.body.appendChild(ifm);

            window.addEventListener('message', function (e) {
                try {
                    postData = JSON.parse(e.data);

                    // 关闭手册
                    if (postData.oprate == 'closeIframe') {
                        var ifm = document.querySelector('#sbmh');
                        if (ifm) document.body.removeChild(ifm);
                    }

                    // 跳转到首页
                    if (postData.oprate == 'goBack') {
                        location.href = _protocol_ + '//www.shandw.com/h5/cigarette/?v=' + SDW_WEB.version;
                    }

                } catch (e) {

                }
            }, false);
        }

        document.querySelector('.top-split-line').style.marginBottom = '.625rem';
    }

});




