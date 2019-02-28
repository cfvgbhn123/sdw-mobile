/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

require('../compSCSS/compB.scss');
// var Vue = require('vue');
var compA = require('../components/test/compA.vue');
var compB = require('../components/test/compB.vue');
var Log = require('./log');
// var gameItem = require('../components/mobile/game-item/game-item.vue');
var sdwFooter = require('../components/mobile/main-footer/main-footer.vue');
var login = require('../components/mobile/login/login.vue');

Log('组件测试');


setTimeout(function () {
    var app = new Vue({
        el: '#app',
        data: {
            msg: 'hello，组件的学习',
            gameList: (function () {

                var list = [];
                for (var i = 0; i < 10; i++) {
                    list.push({
                        id: 123,
                        cover: 'http://app.m3guo.com/h5/2016/h5gameimg/YQW03.png',
                        title: '我是游戏的名称',
                        star: i,
                        desc: '我是文字的描述',
                        quantity: i * 1000
                    })
                }

                return list;
            })()
        },
        methods: {
            sayHello: function (type) {

                if (type == 'play') {
                    alert('开游戏')
                } else {
                    alert('进详情')
                }

            }
        },
        components: {
            // compa: compA,
            // compb: compB,
            // gameItem: gameItem,
            sdwFooter: sdwFooter,
            login: login
        }
    });
}, 1000)


var aImages = document.querySelectorAll('img[data-loaded="0"]');
loadImg(aImages);


var WindowScroll = require('../libs/WindowScroll');

// 图片懒加载
var imgScroll = new WindowScroll(function () {
    loadImg(document.querySelectorAll('img[data-loaded="0"]'));
});


var winScroll = {
    scrollImgTimer: null,
    scrollSateTimer: null,
    callbackState: false
};
// 滚到底部自动加载更多
var addMoreScroll = new WindowScroll(function () {
    if (winScroll.callbackState) return;

    var list = [];
    for (var i = 0; i < 10; i++) {
        list.push({
            id: 123,
            cover: 'http://app.m3guo.com/h5/2016/h5gameimg/YQW03.png',
            title: '我是游戏的名称',
            star: i,
            desc: '我是文字的描述',
            quantity: i * 1000
        })
    }

    setTimeout(function () {
        app.gameList = app.gameList.concat(list);
        winScroll.callbackState = false;
    }, 100);

}, true);


setTimeout(function () {
    addMoreScroll.enable = false;
}, 5000);

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
    };
    oImg.src = url;
}