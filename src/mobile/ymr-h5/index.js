require("./index.scss");
// require("./animate.css");

// window.Velocity = require('./js/velocity.min');
//
// require('./js/velocity.ui');

// var OS = require('../../libs/initJs/OS');
var Loader = require('./js/Loader');
// var Banner = require('./js/carousel');

// 加载资源
var loadText = document.querySelector('#loading-text');
var loader = new Loader({
    files: ["images/1.png",
        "images/2.png",
        "images/3.png",
        "images/4.png",
        "images/appicon.png",
        "images/appicon2.png",
        "images/5.png",
        "images/box.png",
        "images/bx2.png",
        "images/bx1.png",
        "images/bx3.png",
        "images/bx5.png",
        "images/bx4.png",
        "images/egg-info.png",
        "images/flash.png",
        "images/go-arr-info.png",
        "images/grass.png",
        "images/icon-egg.png",
        "images/last-bg.png",
        "images/mmk-icon.png",
        "images/loop-bg.jpg.png",
        "images/mmk-t.png",
        "images/page-0-title.png",
        "images/page-2-title.png",
        "images/page-3-title.png",
        "images/page-1-title.png",
        "images/tap-icon.png",
        "images/page-4-title.png",
        "images/yemanren_run_0_001.png"],
    progress: function (loaded, allLength) {
        var p = (loaded / allLength * 100).toFixed(2);
        loadText.innerText = p + '%';
    },
    callback: function () {

        var del = +new Date() - loader.__startTime;
        if (del >= 1200) {
            del = 0;
        } else {
            del = 1200 - del;
        }
        setTimeout(function () {
            main();
        }, del)
    }
});

function main() {
    pageManager.start();
}


var firstShow = false;  // 下载页面的


var SPEED_PRE = 370;  // 每秒移动的距离

window.pageManager = (function () {

    var _m = {
        REM_MAP: {},
        canNext: false,
        playAudio: false,
        changeRem: function (px) {

            if (this.REM_MAP[px]) {
                return this.REM_MAP[px];
            } else {
                var value = px / 32 + 'rem';
                this.REM_MAP[px] = value;
                return value;
            }

        },
        getDom: function (doc) {

            /*加载页面*/
            this.loadingContainer = doc.querySelector('.loading-container');
            /*所有可滚动的页面*/
            this.pages = doc.querySelectorAll('.page');

            /*所有文案的界面*/
            this.titleContainers = doc.querySelectorAll('.title-container');

            // 首屏元素
            this.grass = doc.querySelector('.grass-container');  // 草地
            this.cloud1 = doc.querySelector('.cloud[data-index="1-1"]');
            this.cloud2 = doc.querySelector('.cloud[data-index="1-2"]');
            this.cloud3 = doc.querySelector('.cloud[data-index="1-3"]');
            this.go = doc.querySelector('#go');

            // 宝箱屏幕元素
            this.box = doc.querySelector('#box');
            this.tap = doc.querySelector('#tap');
            this.tips = doc.querySelector('#tips');

            // 野蛮人
            this.player = doc.querySelector('.player');
            // this.cloudContainer = document.querySelector('.cloud-container');
            this.loopLayer = doc.querySelector('#loop-layer');  // 循环背景
            this.goArr = doc.querySelector('#go-arr');  // 循环背景
            this.audio = doc.querySelector('#audio');
            this.mask = doc.querySelector('#mask');   // 遮罩层


            // 下载的按钮
            this.downHelp = doc.querySelector('.download-btn[data-type="help"]');
            // 下载游戏
            this.downGame = doc.querySelector('.download-btn[data-type="game"]');

            this.cloud11 = doc.querySelector('.cloud[data-index="4-1"]');
            this.cloud22 = doc.querySelector('.cloud[data-index="4-2"]');
            this.cloud33 = doc.querySelector('.cloud[data-index="4-3"]');


            // 奖励页面
            this.bxAni = doc.querySelector('.bx-ani');
            this.canNextFlag = false;
            this.giftCont = doc.querySelector('.gift-cont');
            this.giftPlayerContainer = doc.querySelector('.gift-player-container');


            // 注册事件
            this.addEventListener();

        },


        addEventListener: function () {

            var self = this;

            // 开始播放音乐
            function playAudio(e) {
                if (self.playAudio) {
                    return;
                }
                self.playAudio = true;
                self.audio.play();
                // document.removeEventListener('touchstart', playAudio);
            }

            document.addEventListener('touchstart', playAudio, false);

            // 开启首屏人物动画
            function playerMain(e) {
                Velocity(self.go, "transition.slideDownOut", {
                    duration: 600
                });
                self.hiddenNextPageArr();
                self.player.dataset.play = 'run';
                setTimeout(function () {
                    pageManager.playAnimation('playerMain');
                }, 200)
            }

            // 添加首页的go按钮
            this.go.addEventListener('click', playerMain, false);

            // 下一页的事件
            this.goArr.addEventListener('click', function (e) {
                nextPage(e);
            });


            function nextPage(e) {
                if (!self.canNext) return;
                if (_pageManager.currentPage === 0) {
                    playerMain(e);
                } else {
                    self.playerRunOut();
                }
            }

            var touchObj = {
                isTap: false,
                start: {x: 0, y: 0},
                current: {x: 0, y: 0}
            };


            function getPosition(e) {
                if (e.touches.length) {
                    return {x: e.touches[0].clientX, y: e.touches[0].clientY};
                } else if (e.changedTouches.length) {
                    return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
                }
            }


            /*页面滑动事件*/
            document.addEventListener('touchstart', function (e) {
                // e.stopPropagation();
                touchObj.start = getPosition(e);

            }, false);

            document.addEventListener('touchend', function (e) {
                // e.stopPropagation();
                touchObj.current = getPosition(e);


                if (_pageManager.currentPage === 5) {

                    /*轮播*/
                    if (touchObj.current.x - touchObj.start.x < -20) {
                        // console.log('left');

                        Banners.next();
                    } else if (touchObj.current.x - touchObj.start.x > 20) {
                        // console.log('right');
                        Banners.pre();
                    }

                    if (touchObj.current.y - touchObj.start.y > 20) {
                        _pageManager.prePage(true);
                    }


                }


                if (touchObj.current.y - touchObj.start.y < -20) {
                    nextPage(e);
                }


            }, false);


            this.downGame.addEventListener('click', function (e) {

                // 下载游戏
                location.href = 'http://www.barbarq.com/download.html';

            }, false);


            this.downHelp.addEventListener('click', function (e) {
                // 下载助手APP
                if (SDW_WEB.onIOS) {
                    location.href = 'https://itunes.apple.com/cn/app/%E9%87%8E%E8%9B%AE%E4%BA%BA%E5%A4%A7%E4%BD%9C%E6%88%98%E5%8A%A9%E6%89%8B-%E9%80%81%E5%AE%A0%E7%89%A9%E8%9B%8B/id1276069073?l=zh&ls=1&mt=8';
                } else {


                    location.href = 'download.html?v' + (+new Date());
                }

            }, false);


            this.box.addEventListener('click', function (e) {
                // 显示礼物层
                self.giftPlayerContainer.classList.remove('hidden');
                self.playerRunOut();

                var mySequence = [
                    {e: self.bxAni, p: 'transition.bounceUpIn', o: {duration: 600}},
                    {
                        e: self.bxAni, p: "callout.tada", o: {
                        duration: 600, complete: function () {
                            // 动画结束后
                            self.bxAni.classList.add('box-ani-list');
                            setTimeout(function () {
                                setTimeout(function () {
                                    self.bxAni.classList.add('hidden');
                                }, 0);
                                self.giftCont.classList.remove('hidden');
                                self.canNextFlag = true;  // 可以点击进入下一页（至下载界面）
                            }, 1500);
                        }
                    }
                    },
                ];

                // 调用这个自定义的序列名称 还可以在其他地方复用
                Velocity.RunSequence(mySequence);
            }, false);


            // 隐藏动画，进入下一页
            this.giftPlayerContainer.addEventListener('click', function (e) {

                if (!self.canNextFlag) return;

                Velocity(self.giftPlayerContainer, {
                    opacity: 0,
                }, {
                    complete: function () {
                        self.giftPlayerContainer.classList.add('hidden');
                        self.showNextPageArr();
                    }
                });
            }, false)
        },

        showNextPageArr: function () {
            var self = this;
            // 最后一页不显示箭头
            if (_pageManager.currentPage === _pageManager.allPageLength - 1) {
                return;
            }

            Velocity(this.goArr, "transition.slideUpIn", {
                duration: 600,
                complete: function () {
                    self.canNext = true;
                }
            });
        },

        hiddenNextPageArr: function () {

            this.canNext = false;

            Velocity(this.goArr, "transition.slideDownOut", {
                duration: 600,
            });
        },

        // 从底部抛出屏幕外面
        playerRunOut: function () {

            var self = this;
            self.hiddenNextPageArr();

            // 即将进入第四屏-下载页面，界面渐黑
            if (_pageManager.currentPage >= 3) {

                // this.mask.style.visibility = 'visible';
                // this.mask.style.opacity = 1;
                // setTimeout(function () {
                //     // 隐藏背景层
                self.loopLayer.classList.add('hidden');
                //     self.mask.style.opacity = 0;
                //     self.mask.style.visibility = 'hidden';
                _pageManager.nextPage();

                // }, 1200);

                return;
            }

            this.loopLayer.classList.remove('paused-ani');

            var DURATION = 530 / SPEED_PRE * 1000;

            Velocity(this.player, {
                scale: [1, 1],
                bottom: [this.changeRem(-400), this.changeRem(130)]
            }, {
                duration: DURATION,
                easing: 'linear',
                complete: function () {
                    // 进入下一页

                    _pageManager.nextPage();
                }
            });

            // 如果有预设的离开动画，则执行
            var currIndex = 'leavePage' + _pageManager.currentPage;
            self[currIndex] && self[currIndex]();

        },

        // 主角从上面往下跑（离开屏幕）
        playerRunBottom: function (args) {
            var self = this;
            var startY = document.documentElement.clientHeight * 2; // 获取需要乘上2倍
            var to = (args && args.to) || 130;

            // console.log(startY, to);
            // var SPEED_PRE = 350;  // 每秒移动的距离
            var DURATION = (startY - to) / SPEED_PRE * 1000;

            Velocity(this.player, {
                scale: [1, 1],
                bottom: [this.changeRem(to), this.changeRem(startY)]
            }, {

                duration: DURATION,  // 移动时间需要计算
                easing: 'linear',
                complete: function () {
                    // 主角抵达到目的地，暂停背景的滚动效果
                    // 出现页面的信息文字
                    // 出现底部的箭头，可进入下一页状态
                    var currIndex = 'nextPage' + _pageManager.currentPage;
                    self[currIndex] && self[currIndex]();
                }
            })
        },

        // 首页-主角奔跑动画

        playerMain: function () {
            var self = this;
            Velocity(this.player, {
                scale: [1.6, 1],
                bottom: [this.changeRem(-450), this.changeRem(400)]
            }, {
                duration: 3.5 * 1000,
                easing: 'linear',
                complete: function () {
                    // 首页主角完成后，进入下一页。
                    self.mask.style.visibility = 'visible';
                    self.mask.style.opacity = 1;
                    setTimeout(function () {
                        self.mask.style.opacity = 0;
                        self.mask.style.visibility = 'hidden';
                        pageManager.nextPage();
                    }, 1200);
                }
            })
        },

        showCurrentTitleInfo: function () {
            this.titleContainers[_pageManager.currentPage].classList.remove('hidden');
            Velocity(this.titleContainers[_pageManager.currentPage], "transition.slideUpIn", {duration: 650});
        },

        hiddenCurrentTitleInfo: function () {
            Velocity(this.titleContainers[_pageManager.currentPage], "transition.slideDownOut", {duration: 650});
        },

        stopPage0: function () {
            this.stopCloudAni(this.cloud1, this.cloud2, this.cloud3);
        },

        stopCloudAni: function (c1, c2, c3) {
            Velocity(c1, "stop");
            Velocity(c2, "stop");
            Velocity(c3, "stop");
            Velocity(c1, "finish");
            Velocity(c2, "finish");
            Velocity(c3, "finish");
        },

        // 获取云的位置

        getCloudPosition: function (type, isFirst) {
            var firstPosition = [650, 260, -100];
            var endPosition = [-380, -280, -370];
            if (isFirst) {
                return firstPosition[type];
            }
            return endPosition[type];
        },

        // 计算云层的时间
        getCloudMoveTime: function (s, e) {
            var len = s - e;
            var time = len / 960 * 22 * 1000;
            return time;
        },

        initCloudAni: function (c1, c2, c3) {
            var self = this;
            c1.index = 0;
            c2.index = 1;
            c3.index = 2;

            // 云的初始字段
            c1.first = c2.first = c3.first = true;

            function cloud1Ani() {
                // 开始的位置
                var sX = c1.first ? self.getCloudPosition(c1.index, c1.first) : 780;
                var eX = self.getCloudPosition(c1.index);
                Velocity(c1, {
                    translateX: [self.changeRem(eX), self.changeRem(sX)],
                    translateY: [self.changeRem(380), self.changeRem(380)]
                }, {
                    duration: self.getCloudMoveTime(sX, eX),
                    easing: 'linear',
                    complete: function () {
                        c1.first = false;
                        cloud1Ani();
                    }
                });
            }

            function cloud2Ani() {
                var sX = c2.first ? self.getCloudPosition(c2.index, c2.first) : 780;
                var eX = self.getCloudPosition(c2.index);

                Velocity(c2, {
                    translateX: [self.changeRem(eX), self.changeRem(sX)],
                    translateY: [self.changeRem(110), self.changeRem(110)]
                }, {
                    duration: self.getCloudMoveTime(sX, eX),
                    easing: 'linear',
                    complete: function () {
                        c2.first = false;
                        cloud2Ani();
                    }
                });
            }

            function cloud3Ani() {
                var sX = c3.first ? self.getCloudPosition(c3.index, c3.first) : 780;
                var eX = self.getCloudPosition(c3.index);
                Velocity(c3, {
                    translateX: [self.changeRem(eX), self.changeRem(sX)],
                    translateY: [self.changeRem(260), self.changeRem(260)]
                }, {
                    duration: self.getCloudMoveTime(sX, eX),
                    easing: 'linear',
                    complete: function () {
                        c3.first = false;
                        cloud3Ani();
                    }
                });
            }

            cloud1Ani();
            cloud2Ani();
            cloud3Ani();
        },

        page0: function () {
            var self = this;
            self.showCurrentTitleInfo();
            Velocity(this.grass, "transition.slideUpIn", {
                duration: 1000
            });
            this.initCloudAni(this.cloud1, this.cloud2, this.cloud3);
        },

        // page2: function () {
        //     this.hiddenNextPageArr();
        // },

        /*
       *  页面即将离开的动画（标题）
       *
       * */
        leavePage1: function () {
            this.hiddenCurrentTitleInfo();
        },
        leavePage2: function () {
            this.hiddenCurrentTitleInfo();
        },
        leavePage3: function () {
            this.hiddenCurrentTitleInfo();
        },

        /*
        *  页面后续的动画控制函数（人物行走完成后的动画）
        *
        * */
        nextPage1: function () {
            this.showCurrentTitleInfo();
            this.loopLayer.classList.add('paused-ani');
            this.goArr.dataset.type = 'normal';
            this.showNextPageArr();
        },
        nextPage2: function () {
            this.showCurrentTitleInfo();
            this.loopLayer.classList.add('paused-ani');
            this.showNextPageArr();
        },
        nextPage3: function () {
            var self = this;
            this.showCurrentTitleInfo();
            this.loopLayer.classList.add('paused-ani');
            document.querySelector('#box-cont-3').classList.remove('hidden');
            Velocity(this.box, 'transition.bounceUpIn', {
                duration: 600,
                complete: function () {
                    // 文字和手势
                    self.tap.classList.remove('hidden');
                    self.tips.classList.remove('hidden');
                }
            })
        },

        nextPage4: function () {

            var self = this;
            this.showCurrentTitleInfo();


            if (firstShow) {
                this.showNextPageArr();
            }

            firstShow = true;

            this.goArr.dataset.type = 'info';
            this.initCloudAni(this.cloud11, this.cloud22, this.cloud33);
        },

        nextPage5: function () {
            var self = this;
            // 开启轮播
            Banners.start();
        }
    };

    var Banners = {
        timer: null,
        time: 3000,
        start: function () {

            var self = this;
            var banners = document.querySelectorAll('.banner');
            this.bannersList = [];
            for (var i = 0; i < banners.length; i++) {
                this.bannersList.push(banners[i]);
            }

            // this.timer = setTimeout(function () {
            self.next();
            // }, this.time);
        },
        next: function (isPre) {
            var self = this;
            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (isPre) {
                this.bannersList.unshift(this.bannersList.pop());
            } else {
                this.bannersList.push(this.bannersList.shift());
            }
            for (var i = 0; i < this.bannersList.length; i++) {
                this.bannersList[i].dataset.index = i + 1;
            }
            this.timer = setTimeout(function () {
                self.next();
            }, this.time);
        },
        pre: function () {
            this.next(true);
        }
    };

    _m.getDom(document);

    var _pageManager = {
        currentPage: 0,
        allPageLength: _m.pages.length,
        start: function () {
            _m.loadingContainer.classList.add('hidden');  // 加载页面隐藏

            // _m.cloudContainer.classList.remove('hidden');

            this.showPageIndex(0);
        },
        playAnimation: function (clip, args) {
            _m[clip] && _m[clip](args);
        },

        nextPage: function () {
            if (this.currentPage < this.allPageLength - 1) {
                this.showPageIndex(this.currentPage + 1);
            }
        },


        prePage: function (can) {
            // if (!_m.canNext) {
            //     return;
            // }
            if (this.currentPage === 5) {
                this.showPageIndex(4, false, can);
            }

        },

        showPageIndex: function (index, onlyShow, can) {

            if (!onlyShow) {
                this.currentPage = index;
                this.changeLayerSate();
            }

            for (var i = 0; i < _m.pages.length; i++) {
                if (index === i) {
                    _m.pages[i].classList.remove('hidden');
                    _m['page' + i] && _m['page' + i](can);  // 开始动画
                } else {
                    _m.pages[i].classList.add('hidden');
                    _m['stopPage' + i] && _m['stopPage' + i](can);
                }
            }

        },
        changeLayerSate: function () {

            if (this.currentPage === 1) {
                // 第一屏幕
                _m.loopLayer.classList.remove('hidden');
                this.playAnimation('playerRunBottom');
            }

            if (this.currentPage === 2) {
                this.playAnimation('playerRunBottom');
            }

            if (this.currentPage === 3) {
                // 人物走出屏幕后，弹出宝箱
                this.playAnimation('playerRunBottom', {to: -400});
            }


            // 下载页面
            if (this.currentPage === 4) {
                var currIndex = 'nextPage4';
                _m[currIndex] && _m[currIndex]();
            }

            if (this.currentPage === 5) {
                var currIndex = 'nextPage5';
                _m[currIndex] && _m[currIndex]();
            }

        }
    };

    return _pageManager;
})();


// 禁止滚动
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);


window.onload = function () {

    setTimeout(function () {

        if (SDW_WEB.USER_INFO.uid) {

            // 设置分享
            SDW_WEB.sdw.onSetShareOperate({
                title: '《野蛮人♂大作战》高能开启寻福之旅，Let\'s go 201發！',
                desc: '摩摩可送你新人♂福利',
                link: 'http://www.shandw.com/h5/ymr-h5/',
                imgUrl: 'http://www.shandw.com/h5/ymr-h5/images/share-icon.jpg'
            });
        }

    }, 2000);

};
