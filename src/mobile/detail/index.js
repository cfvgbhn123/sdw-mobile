/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var giftItem = require('../../components/mobile/gift-item/gift-item.vue');
// var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');

// var GAME_URL = require('../GAME_URL');
var fastLogin = require('../../components/mobile/login/login.vue');

require('../../components/initcss.scss');
require('./index.scss');

var detailView = new Vue({
    el: '#app',
    data: {
        user: {
            avatar: '',
            uid: '',
            nick: '',
            phone: null
        },
        showGift: 0,

        detail: {
            cover: '',
            icon: '',
            title: '',
            info: '',
            desc: '',
            type: '',
            star: ['star0', 'star0', 'star0', 'star0', 'star0'],
            quantity: 0,
            screen: 0,
        },

        giftLists: [],

        giftCode: '',

        banners: [],
        onShandw: SDW_WEB.onShandw
    },
    methods: {

        tapToSliderImg: function (index) {
            if (index == -1) {
                document.querySelector('.swiper-container').style.left = '999999999px';
                return;
            }

            swiper.slideTo(parseInt(index + 1), 0);
            document.querySelector('.swiper-container').style.left = '0px';

        },
        // 加载首页的数据
        loadDetailData: function () {

            var self = this;

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                // uid: SDW_WEB.USER_INFO.uid,
                // token: SDW_WEB.USER_INFO.token,
                // sec: SDW_WEB.USER_INFO.secheme,
                gid: SDW_WEB.queryParam['gid']
            }, false, HTTP_STATIC + 'gameinfo');

            SDW_WEB.getAjaxData(postUri, function (data) {

                var gameInfo = data.info;

                self.detail.cover = gameInfo.bg;
                self.detail.icon = gameInfo.icon;
                self.detail.title = gameInfo.name;
                self.detail.desc = gameInfo.sub;
                self.detail.info = gameInfo.info;
                self.detail.type = gameInfo.type;
                self.detail.star = self.starLists(gameInfo.vStar);
                self.detail.quantity = gameInfo.vPv;
                self.detail.screen = gameInfo.screen;

                document.title = gameInfo.name;
                self.banners = gameInfo.img;

                data.gift = data.gift || [];
                var _giftList = [];
                for (var i = 0; i < data.gift.length; i++) {
                    var _gifts = data.gift[i];
                    _gifts._hasGet = 0;
                    _giftList.push(_gifts);

                }
                self.giftLists = _giftList;


                self.$nextTick(function () {
                    loadDelayImg();

                    swiper = new Swiper('.swiper-container', {
                        pagination: '.swiper-pagination',
                        //                slidesPerView: 'auto',
                        loop: true
                    });
                });

                setShandwShareInfo(data);
            });
        },

        // 计算剩余的数量
        computedQuantity: function (item) {
            return item.num / item.count * 100 >> 0
        },

        // 检查领取的
        checkGiftState: function (item) {

            var self = this;

            if (!SDW_WEB.USER_INFO.uid) {

                if (SDW_WEB.onShandw) {
                    SDW_WEB.sdw.openLogin({
                        success: function () {

                        }
                    })
                } else {
                    this.$refs.login.show = 1;
                }

                return;
            }

            if (item._hasGet) {

                this.showGift = 1;
                this.giftCode = item.code;

            } else {
                // 请求领取礼包的接口

                dialog.show('loading', '礼包领取中');

                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    token: SDW_WEB.USER_INFO.token,
                    sec: SDW_WEB.USER_INFO.secheme,
                    uid: SDW_WEB.USER_INFO.uid,
                    gid: SDW_WEB.queryParam['gid'],
                    id: item.id
                }, false, HTTP_STATIC + 'getgift');

                SDW_WEB.getAjaxData(postUri, function (data) {

                    if (data.result == 1) {

                        item._hasGet = 1;
                        self.showGift = 1;
                        item.code = data.code;
                        self.giftCode = data.code;

                        dialog.show('ok', '礼包领取成功', 1);

                    } else {
                        dialog.show('error', data.msg, 1);
                    }
                });
            }
        },

        // 点击到游戏
        checkGameSate: function () {

            if (SDW_WEB.USER_INFO.uid) {
                var targetUrl = SDW_PATH.GAME_URL('play', SDW_WEB.queryParam['gid']);

                var openObj = {
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                };

                // flag [2017-11-01 16:48:20] 横屏游戏
                // if (this.detail.screen) {
                //     openObj.landscape = true;
                //     targetUrl += '&screen=' + this.detail.screen;
                //     openObj.link = targetUrl;
                // }

                openObj = SDW_WEB._checkWebViewObject(openObj, this.detail);

                SDW_WEB.openNewWindow(openObj);

            } else {
                // this.showGift = 0;
                if (SDW_WEB.onShandw) {
                    SDW_WEB.sdw.openLogin({
                        success: function () {
                        }
                    })

                } else {
                    this.$refs.login.show = 1;
                }

            }

        },


        transformQuantity: function (num) {

            if (num < 10000) return num;

            if (num < 100000000) {
                var res = (num / 10000).toFixed(1).split('.');
                if (res[1] == '0') {
                    return res[0] + '万';
                }
                return res[0] + '.' + res[1] + '万';
            }

            if (num < 10000000000) {
                var res = (num / 100000000).toFixed(1).split('.');
                if (res[1] == '0') {
                    return res[0] + '亿';
                }
                return res[0] + '.' + res[1] + '亿';
            }
        },
        starLists: function (oStar) {

            // 星级数量为 0~10 的整型
            var star = Math.max(0, oStar >> 0);
            star = Math.min(10, star);

            var stars = [], pStar = star / 2 >> 0, lStar = star % 2, i;

            // 添加满星个数
            for (i = 0; i < pStar; i++) stars.push('star2');

            // 修正单颗星
            if (lStar == 1) {
                stars.push('star1');
                pStar++;
            }

            // 填补剩余的星
            for (i = pStar; i < 5; i++) stars.push('star0');

            return stars;
        }
    },
    components: {
        giftItem: giftItem,
        fastLogin: fastLogin
    }
});


function loadDelayImg() {
    var aImages = document.querySelectorAll('img[data-loaded="0"]');
    loadImg(aImages);
}

// loadDelayImg();


var WindowScroll = require('../../libs/WindowScroll');

// 图片懒加载
var imgScroll = new WindowScroll(loadDelayImg);

function loadImg(arr) {

    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].getBoundingClientRect().top < document.documentElement.clientHeight && !arr[i].isLoad) {
            arr[i].isLoad = true;
            arr[i].dataset.loaded = '1';
            arr[i].style.cssText = "transition: ''; opacity: 0;";
            aftLoadImg(arr[i], arr[i].dataset.src);
        }
    }
}

function aftLoadImg(obj, url) {
    if (!url) return;
    var oImg = new Image();
    oImg.onload = function () {
        obj.src = oImg.src;
        obj.style.cssText = "transition: 1s; opacity: 1;";
        var parentNode = obj.parentNode;
        if (parentNode && parentNode.classList.contains('game-cover-info')) {

            parentNode.style.transition = '.4s';
            parentNode.style.background = 'rgba(0,0,0,0)';
        }
    };
    oImg.src = url;
}

if (SDW_WEB.onShandw) {
    SDW_WEB.getSdwUserData().then(function (res) {

    })
}

// 加载游戏详情
if (SDW_WEB.queryParam['gid']) {
    detailView.loadDetailData();
}


function changeShareLinks(link) {

    link = link || location.href.split('#')[0];

    // 游戏界面分享带上分享者的uid
    link = SDW_WEB.URLS.addParam({
        'sdw_sender_id': SDW_WEB.USER_INFO.uid
    }, false, link);

    // 保证分享出去全部是https的地址
    // var shareLinks = /https/.test(link) ? link : link.replace(/http/, 'https');
    var shareLinks = link;

    // if (SDW_WEB.onShandw) {
    //     alert(shareLinks);
    // }

    return shareLinks;
}

// 设置闪电玩的分享
function setShandwShareInfo(data) {

    var info = data.info;

    // 设置APP的底部工具栏按钮
    SDW_WEB.onShandw && SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo']);

    // 设置游戏分享的内容
    SDW_WEB.sdw.onSetShareOperate({
        title: info.name,
        desc: info.sInfo,
        imgUrl: info.sIcon,
        link: location.href,
        success: function () {
            dialog.show('ok', '分享成功', 1);
        },
        fail: function () {
            dialog.show('error', '分享失败了', 1);
        },
        cancel: function () {
            dialog.show('error', '您取消了分享', 1);
        }
    });

}



