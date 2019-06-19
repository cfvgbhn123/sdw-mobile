/**
 * Created by April.Jiang on 2019/5/27.
 *
 * 闪电玩首页  = 简易版黑白底+大图标版白底
 *
 */
// var ScrollDom = require('./ScrollDom');
require('./index2.scss');
require('../../components/initcss.scss');
var loadingView = require('../../components/mobile/loading/loading.vue');
// var longGameItem = require('./long-game-item/long-game-item.vue');
var longGameItem = require('../../components/mobile/long-game-item/long-game-item.vue');
var WindowScroll = require('../../libs/WindowScroll');
var recentGame = require('./recent-game/recent-game.vue');
// var ActivityConfig = require('./config');
var ActivityConfig = require('../libs/config');
// 首页活动悬浮按钮
if (ActivityConfig.state) {
    require('../game/tool-icon.scss');
    var DragTouch = require('../game/DragTouch');
}
if (ActivityConfig.dropType) {
    var DropAnimation = require('./libs/DropAnimation');
}
// 初始化活动小浮窗
function initToolIcon() {

    if (!ActivityConfig.state) return;
    /*新建一个拖动对象*/
    window.touch = new DragTouch({
        id: '#my-menu',
        position: '1,0.5',
        notRotate: true,
        width: 80,
        height: 90
    });
    window.touch.target.style.visibility = 'visible';


    var startPoint = null;
    var endPoint = null;

    function getPosition(e) {
        var touch = e.touches[0];
        return {
            x: touch.clientX,
            y: touch.clientY
        }
    }

    var myMenu = document.querySelector('#menu-btn');

    myMenu.addEventListener('touchstart', function (e) {
        startPoint = getPosition(e);
        startPoint.time = +new Date();
        endPoint = null;
    }, false);

    myMenu.addEventListener('touchmove', function (e) {
        endPoint = getPosition(e);
        endPoint.time = +new Date();
    }, false);

    myMenu.addEventListener('touchend', function (e) {
        endPoint = endPoint || startPoint;
        var dT = endPoint.time - startPoint.time;
        var dX = endPoint.x - startPoint.x;
        var dY = endPoint.y - startPoint.y;
        var dd = dX * dX + dY * dY;

        if (dT <= 300 && dd <= 36) {

            // 统计赛事按钮
            SDW_WEB.addCount('saishiIndex');

            // setTimeout(function () {
            //     location.href = 'http://www.shandw.com/activities/competition/index.html?channel=' + SDW_WEB.channel;
            // }, 100);

            var links = ActivityConfig.activityPage+'?channel=' + SDW_WEB.channel;
            if(ActivityConfig.openState == 1){
                dialog.show('ok','敬请期待<br>'+ActivityConfig.activityName+'活动将于'+ActivityConfig.startTime[1]+'月'+ActivityConfig.startTime[2]+'号开启哦~！',1);
                // dialog.show('ok','敬请期待<br>新年活动将于2月2号开启哦~！',1);
                return ;
            }

            if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {
                // 跳转到活动页面
                SDW_WEB.openNewWindow({
                    link: links,
                    isFullScreen: false,
                    showMoreBtn: true,
                    // title: ActivityConfig.name
                });
            } else {
                // console.log('no login');

                // 调用登录界面
                if (SDW_WEB.onShandw) {
                    // 闪电玩登录
                    SDW_WEB.sdw.openLogin({
                        success: function () {
                        }
                    });
                } else {
                    // 普通短信登录
                    _indexView.__showLoginPage();
                }
            }

        }
    }, false);
}

var indexData = {
    onJD:SDW_WEB.onJDJR,
    activity :ActivityConfig,
    theme:SDW_WEB.URLS.queryUrl()['theme']?SDW_WEB.URLS.queryUrl()['theme']:'easyDark',//默认简版黑色
    allGameList: [],
    recentList:[],
    pageHasLoading: false,
    navList: [
        {
            title: "网游",
            page: 0,
            loaded: false,
            loading: false,
            current: 0,
            list: [],
            type: 0,
        },
        {
            title: "小游戏",
            page: 0,
            loaded: false,
            loading: false,
            current: 0,
            list: [],
            type: 1,
        },
        {
            title: "全部",
            page: 0,
            loaded: false,
            loading: false,
            current: 0,
            list: [],
        }
    ],
    currentNav: null,
};

if (indexData.theme.startsWith('easy')){
    var linkParams = SDW_WEB.URLS.queryUrl();
    if( linkParams && linkParams['initTab'] == 'freegame'){
        var  temp = indexData.navList[0];
        indexData.navList[0] = indexData.navList[1];　
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

var indexMethods = {
    switchNav: function (item) {

        this.currentNav = item; // 保存当前的导航信息

        for (var i = 0; i < this.navList.length; i++) {
            var _item = this.navList[i];
            if (_item.title === item.title) {
                _item.current = 1;
            } else {
                _item.current = 0;
            }
        }
    },

    checkGameSate: function (type, id, item) {

        // 获取游戏地址
        if (SDW_WEB.channel == '10911') {
            var targetUrl = 'http://www.shandw.com/maopao/game/index.html?gid=' + id + '&channel=10911'
        } else {
            var targetUrl = SDW_PATH.GAME_URL(type, id);
        }

        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: '',
        };

        if (type === 'play') {
            openObj = SDW_WEB._checkWebViewObject(openObj, item);
            // 打开玩游戏的界面
            SDW_WEB.openNewWindow(openObj);
        }
    },

    createBanner: function (data) {

        var banner = data.adList || [];

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
    goMorePage:function () {
        var targetUrl = SDW_PATH.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: ''
        });


    },
    loadMainData: function () {

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            type: 1,
            flag: 1
        }, false, HTTP_STATIC + 'channelSimplePltMain');//pltmain

        SDW_WEB.getAjaxData(postUri, function (data) {
            if(data.recentGames){//最近玩
                self.recentList = data.recentGames.splice(0, 3);
            }

            //轮播图
            self.bannerList = self.createBanner(data);
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
                var imgSrc = self.bannerList[0].adImg;
                document.querySelector('#topBanner').src = imgSrc;
            }

            self.$nextTick(function () {
                // var goBackBtn = document.querySelector('#goBackBtn');
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
                }, 200);
            });
            initToolIcon();

            //游戏列表
            if(data.channelGames){

                if (indexData.theme.startsWith('easy')){
                    indexData.navList[2].list = data.channelGames
                    indexData.navList[0].loaded = true
                    for(var index = 0;index < data.channelGames.length;index++){
                        var item = data.channelGames[index];
                        if (item.type==='休闲小游戏'){
                            indexData.navList[1].list.push(item);
                        } else{
                            indexData.navList[0].list.push(item);
                        }
                    }
                } else{
                    indexData.navList[0].list = data.channelGames
                    indexData.navList[0].loaded = true
                    var typeArr = [];
                    for(var index = 0;index < data.channelGames.length;index++){
                        var item = data.channelGames[index];
                        //console.log("类型",item.type,typeArr);
                        if (!typeArr.includes(item.type)){
                            typeArr.push(item.type);
                            indexData.navList.push({
                                title: item.type,
                                page: 0,
                                loaded: true,
                                loading: false,
                                current: 0,
                                list: [],
                                type: item.type,
                            })
                            indexData.navList[indexData.navList.length-1].list.push(item);
                        }else{
                            for (var i = 0; i < indexData.navList.length; i++) {
                                var item1 = indexData.navList[i];
                                if (item1.title === item.type) {
                                    indexData.navList[i].list.push(item);
                                    break;
                                }
                            }
                        }
                    }
                }
                _indexView.switchNav(indexData.navList[0]);
            }
        });
    },

    // 加载数据
    loadListData: function (postUri, item) {
        SDW_WEB.getAjaxData(postUri, function (data) {
            if (data.result === 1) {
                if (data.list && data.list.length) {
                    item.list = item.list.concat(data.list);
                } else {
                    item.loaded = true;
                }
                item.page++;
            }

            item.loading = false;
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
        } else {
            this.checkGameSate('play', this.bannerList[index].id);
        }
    },


    gotoTopFn: function () {
        // 1表示滚动到顶部后，收起导航栏
        document.documentElement.scrollTop = document.body.scrollTop = 0;
        //scrollDom && scrollDom.scrollToPos(0, '1');
    },

    moreNav:function () {
        var navCtx = this.$refs.navCtx ;
        console.log(navCtx.scrollWidth,navCtx.scrollLeft+navCtx.scrollWidth/3);
        navCtx.scrollLeft = Math.min(navCtx.scrollWidth,navCtx.scrollLeft+navCtx.scrollWidth/4);

    },
};

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    mounted:function () {
        if (indexData.theme == 'bigIconBright'){
            this.navList = [{
                title: "全部",
                page: 0,
                loaded: false,
                loading: false,
                current: 0,
                list: [],
                // type: null,
            }];
            // var navlist = ['传奇类','回合制','古装仙侠','休闲小游戏','角色扮演','策略','放置挂机','模拟经营','卡牌','女生'];
            // navlist.forEach( (i) =>{
            //     this.navList.push({
            //         title: i,
            //         page: 0,
            //         loaded: false,
            //         loading: false,
            //         current: 0,
            //         list: [],
            //         type: i,
            //     })
            // })
        }
    },
    components: {
        loadingView: loadingView,
        longGameItem: longGameItem,
        recentGame:recentGame
    }
});

SDW_WEB.getSdwUserData().then(function (userData) {
    _indexView.loadMainData();
    // _indexView.switchNav(indexData.navList[0]);

}, function (msg) {
    // 获取闪电玩用户数据失败
    SDW_WEB.USER_INFO = {};
    // _indexView.loadMainData();
    // _indexView.getRecentList();
    // _indexView.switchNav(indexData.navList[0]);
});


if (indexData.theme == 'bigIconBright'){
    var _sliderTimerInterval = 50;

    function addScrollFn() {

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        document.documentElement.scrollTop = document.body.scrollTop = 0;

        var sliderNavLists, sliderTop, sliderNavDom, goBackBtn = document.querySelector('#goBackBtn');
        var nowIdx = null;
        var sliderNavDomHasFixed = false;
        var goBackBtnHasHidden = false;


        // 需要继续优化滚动函数！！！
        var sliderFn = function () {

            setTimeout(function () {
                window.requestAnimationFrame(sliderFn);
            }, _sliderTimerInterval);


            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            // 实时显示导航栏的位置，防止多次的变更DOM
            if (scrollTop > sliderTop) {
                if (!sliderNavDomHasFixed) {
                    sliderNavDomHasFixed = true;
                    sliderNavDom.className = 'nav-view slider-nav-fixed';
                }
            } else {
                if (sliderNavDomHasFixed) {
                    sliderNavDomHasFixed = false;
                    sliderNavDom.className = 'nav-view';
                }
            }

            // 快抵达到顶部，收起【返回顶部】
            if (scrollTop <= 10) {
                if (!goBackBtnHasHidden) {
                    goBackBtnHasHidden = true;
                    goBackBtn.style.display = 'none';
                }
            } else {
                if (goBackBtnHasHidden) {
                    goBackBtnHasHidden = false;
                    goBackBtn.style.display = 'block';
                }
            }
        };


        setTimeout(function () {
            sliderNavLists = document.querySelector('.nav-view');
            sliderTop = sliderNavLists.getBoundingClientRect().top || sliderNavLists.offsetTop;
            sliderNavDom = document.querySelector('.nav-view');
            window.requestAnimationFrame(sliderFn);
        }, 20);

    }

    addScrollFn();
}