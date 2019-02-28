require('./index.scss');
require('../../components/mobile/bind-phone/bind-phone.scss');
var APP_ROOT = "https://www.shandw.com/mobile/shop/";

var bindPhone = require('../../components/mobile/bind-phone/bind-phone.vue');
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}());


var indexData = {

    tipWindow: false,
    coinTipWindow: false,
    phoneTipWindow: false,
    bindInfo: {
        bindPhoneItem: {
            title: '话费充值',
        },
        num: '0',
        showbind: '1',
        show: false,
        phone: ''
    },

    // APP_ROOT: '../index.html?showPage=2&channel=' + SDW_WEB.channel,

    // 成就助手描述的文字信息
    taskInfo: {
        code: '',
        show: 0,
        info: ''
    },

    // 用户的基本信息
    user: {
        avatar: SDW_WEB.USER_INFO.avatar,
        id: SDW_WEB.USER_INFO.id,
        nick: SDW_WEB.USER_INFO.nick,
        gold: 0,
        stamp: 0,
        luckyDrawCost: 0,
        luckyEggCost: 0
    },

    // 玩蛋模块的信息
    egg: {
        init: false,
        timer: null,
        show: 0,
        egg: [
            {
                type: 'yellow',
                state: 1,
                cz: 0
            },
            {
                type: 'red',
                state: 1,
                cz: 0
            },
            {
                type: 'blue',
                state: 1,
                cz: 0
            },
            {
                type: 'green',
                state: 1,
                cz: 0
            }
        ],
        result: {
            show: 0,
            money: 0
        },
        cz: 0,
        request: 0,
        rule: 0,
        pos: 1
    },
    // 触电抽奖
    lottery: {

        init: false,

        show: 0,
        timer: null,
        stateIndex: 0,
        items: null, // dom数组
        startTime: +new Date(),

        stamp: 0,

        // 摇奖盘的奖励信息
        lottery: [],
        result: {
            show: 0,
            // code: '23'
        },
        btnState: 'normal',
        aniObj: {
            time: 0,
            stop: 0,
            aniTime: 100,
            canplay: 1
        }

    },
    lists: []
};


var methods = {
    bindPhoneCallback: function (data) {
        var self = this;
        dialog.hidden();
        self.$nextTick(function () {
            self.$refs.taskgetalert.showInfo = 1;
            self.user.phone = data.myPhoneStr;
        });
    },

    showCountMsg: function (item) {

        if (item.limit == -1 || item.count == -1 || item.count - item.sell > 0) {
            return '库存充足';
        }

        // if (item.count - item.sell > 0) {
        //     return '库存充足';
        // }

        return '售罄';

    },

    gotoWeixinShandw: function () {

        location.href = SDW_WEB.SDW_WEIXIN_URL;

    },

    gotoMyexcPage: function () {

        var pageUrl = SDW_PATH.MOBILE_ROOT + 'myexc/?channel=' + SDW_WEB.channel;

        SDW_WEB.openNewWindow({
            link: pageUrl,
            isFullScreen: false,
            showMoreBtn: false,
            title: '我的兑换记录'
        });

    },

    // 跳转到任务的界面
    gotoAppMain: function (target) {

        if (SDW_WEB.onShandw) {

            // SDW_WEB.sdw.closeWindow();
            // 切换到成就的
            SDW_WEB.sdw.switchTab(target);

        } else {

            location.href = SDW_PATH.MOBILE_ROOT + target + '/?channel=' + SDW_WEB.channel;
        }

    },

    showCode: function () {
        prompt('您的兑换码', this.lottery.result.code);
    },

    // 转换金币
    transCoins: function (coin) {

        if (coin < 10000) return coin;

        if (coin < 100000000) {
            var big = coin / 10000 >> 0;
            var small = (coin % 10000) + '';
            return big + '.' + small[0] + '万';
        }

        if (coin < 10000000000) {
            var big = coin / 100000000 >> 0;
            var small = (coin % 100000000) + '';

            return big + '.' + small[0] + '亿';
        }
    },

    // 加载商城列表
    loadList: function () {

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme
        }, false, HTTP_STATIC + 'shop');

        SDW_WEB.getAjaxData(postUri, function (data) {

            if (data.result == 1) {

                // flag [2017-11-10 19:19:56] 处理物品的货币类型
                for (var i = 0; i < data.list.length; i++) {
                    var _item = data.list[i];
                    if (_item.pType === 3) {
                        _item.typeUrl = 'images/stamp-icon.png';
                    } else if (_item.pType === 1) {
                        _item.typeUrl = 'images/gold-icon.png';
                    }
                }
                var list = _shopRoot.lists.concat(data.list);
                _shopRoot.lists = list;
                _shopRoot.bindInfo.phone = data.phone;
                _shopRoot.user.gold = data.gold;
                _shopRoot.user.stamp = data.stamp || 0;

                // 每次砸蛋或者摇奖的闪电币
                _shopRoot.user.luckyDrawCost = data.luckyDrawCost;
                _shopRoot.user.luckyEggCost = data.luckyEggCost;

                var texts = [];

                // 兑换的玩家名单
                if (data.uilist.length) {

                    var userMaps = {};
                    for (var i = 0; i < data.ulist.length; i++) {
                        if (!userMaps[data.ulist[i].id])
                            userMaps[data.ulist[i].id] = data.ulist[i].nick;
                    }

                    for (var i = 0; i < data.uilist.length; i++)
                        texts.push('玩家 ' + (userMaps[data.uilist[i].uid] || data.uilist[i].uid) + '，兑换了' + data.uilist[i].name);
                } else {

                    // 随机生成玩家的奖励列表
                    texts = createUidListResult();
                }

                var myText = new scrollText({
                    id: 'cbd',
                    texts: texts
                });

                myText.init();

                self.lottery.lottery = data.luckyDrawItem;

            } else {
                dialog.show('error', data.msg, 1);
            }


        });

    },

    showCode: function (code) {

        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.setClipboard(code);
            dialog.show('ok', '兑换码已复制', 1);
        } else {
            window.prompt('兑换码', code);
        }

    },

    gotoPage: function (type) {
        this.tipWindow = false;
        this.openGame(type);
        this.$nextTick(function () {

        })
    },
    // 兑换物品
    click: function (item, e) {

        if (item == 'charge') {
            this.charge(this.bindInfo.item);
            this.phoneTipWindow = false;
            return;
        }
        var checkState = this.checkPayState(item);
        var self = this;

        // 判断金币的数量

        if (checkState == true) {

            // dialog.show('loading', '兑换中...');

            // 兑换请求
            /* alert(item.iType == 8)*/
            if (item.iType == 8) {
                if (this.bindInfo.phone) {
                    this.bindInfo.num = item.rmb;
                    this.bindInfo.item = item;
                    this.bindInfo.show = true;

                } else {
                    this.phoneTipWindow = true;
                }

                return;
            } else {
                this.charge(item);
            }


        } else if (checkState == 3) {
            self.tipWindow = true;
            // dialog.show('error', checkState, 1);
        } else {
            dialog.show('error', checkState, 1);
        }
    },

    charge: function (item) {
        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            token: SDW_WEB.USER_INFO.token,
            sec: SDW_WEB.USER_INFO.secheme,
            id: item.id,
            num: 1
        }, false, HTTP_STATIC + 'shopping');

        SDW_WEB.getAjaxData(postUri, function (data) {
            if (data.result == 1) {

                // 修正已经购买的次数
                if (item.pType == 3)
                    _shopRoot.user.stamp -= item.gold;
                if (item.pType == 1)
                    _shopRoot.user.gold -= item.gold;

                item.buy++;
                item.sell++;

                // 显示兑换码（界面）或者是【兑换成功】
                if (data.code) {
                    dialog.hidden();
                    self.taskInfo.show = 1;
                    self.taskInfo.code = data.code;
                    self.taskInfo.info = item.info;
                } else {
                    self.bindInfo.show = false;
                    dialog.show('ok', data.msg, 1);
                }

                self.showCountMsg(item);
            } else {
                dialog.show('error', data.msg, 1);
            }

        });
    },

    /**
     * 检测物品是否可购买
     * @param item {Object}     需要校验的物品信息
     * @return {Boolean|String} 返回是否可购买|提示错误的信息
     */
    checkPayState: function (item) {

        // count	总个数，负数表示不限
        // sell	    已经销售的个数
        // limit	每个人最多购买个数
        // perBuy	每个人每次最多购买个数

        /**检查物品的个数**/
        if (item.limit !== -1 && item.count >= 0 && (item.count - item.sell <= 0)) return '该物品已经兑完';

        /**检查用户购买的次数**/
        if (item.limit >= 0 && item.limit <= item.buy) return '购买次数达到上限';

        /**检查支付类型，判断货币是否充足**/
        switch (item.pType) {
            case 1: /**金币**/
                if (this.user.gold >= item.gold) return true;
                else return '您的金币不足';
            case 2: /**钻石**/
            case 3: /**点券**/

                if (this.user.stamp >= item.gold) return true;
                else return 3;
            case 4: /**人民币**/

        }
    },

    // 关闭页面
    closePage: function (type, e) {
        // if (e.target == e.tapObj.el) {

        if (type == 'result') {
            this.lottery.result.show = 0;
            this.egg.result.show = 0;

            this.closePage('games', e);
            //this.initEgg();
            clearInterval(this.egg.timer);

        } else if (type == 'games') {

            // if (this.lottery.btnState == 'light') return;
            this.egg.show = 0;
            this.lottery.show = 0;
            this.egg.rule = 0;
        }

        this.egg.pos = 1;
        // }
    },

    // 初始化砸蛋的功能
    initEgg: function () {

        var self = this;
        if (this.egg.init) {

            this.egg.result.show = 0;
            this.egg.cz = 0;
            this.egg.request = 0;
            this.egg.timer = null;
            this.egg.pos = 1;
            this.egg.egg.forEach(function (item) {
                item.state = 1;
            });

            var eggCz = document.querySelector('#egg-cz');
            eggCz.className = 'egg-cz-0';

            setTimeout(function () {
                _shopRoot.egg.pos = 0;
            }, 20);


            // 显示砸蛋
            this.egg.show = 1;
        } else {
            loadEggImagesRes(function () {
                self.initEgg();
            });
        }

    },
    eggAnimation: function (item) {

        item.state = 2;

        _shopRoot.egg.timer = setInterval(function () {
            if (item.state == 5) {
                item.state = 4;
            } else {
                item.state++;
            }
        }, 220);

    },

    // 开始活动
    openGame: function (type) {
        // dialog.show('ok', '功能研发中，敬请期待', 1);
        type == 'egg' && this.initEgg();
        type == 'lottery' && this.initLotteryFn();
        // type == 'lottery' && dialog.show('ok', '敬请期待', 1);
        // this[type].show = 1;
    },

    scale: function (scale, e) {
        e.target.style.opacity = scale;
        //e.target.style.webkitTransform = 'scale(' + scale + ')';
    },

    // 砸蛋
    eggFn: function (item, index, e) {

        if (this.egg.request) return;

        if (this.user.gold < this.user.luckyEggCost) {

            this.coinTipWindow = 1;
            // dialog.show('error', '您的闪电币不足！', 1);
            return;
        }

        var self = this;

        this.egg.cz = index;

        var eggCz = document.querySelector('#egg-cz');
        eggCz.className = 'egg-cz-' + index;

        setTimeout(function () {
            _shopRoot.eggAnimation(item);
        }, 450);

        this.egg.request = 1;

        // 砸蛋请求
        setTimeout(function () {

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'luckyegg');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result == 1) {
                    _shopRoot.egg.result.money = data.stamps + '点券';
                    _shopRoot.egg.result.show = 1;

                    // 修正用户的金币数量
                    _shopRoot.user.gold -= self.user.luckyEggCost;
                    _shopRoot.user.stamp += data.stamps;

                } else {
                    dialog.show('error', data.msg, 1);
                }

            });


        }, 1200);
    },

    // 初始化摇奖
    initLotteryFn: function () {

        var self = this, lottery = this.lottery;

        if (lottery.init) {

            lottery.btnState = 'normal';
            lottery.stateIndex = 0;

            // 根据请求回来的数据进行处理
            var t = Math.max(0, 40);
            var n = /^\+?[1-9][0-9]*$/.test(t / 8 + '') ? t / 8 : t / 8 + 1;

            lottery.aniObj.time = n * 8;
            lottery.aniObj.stop = 0;  // 设置停止的位置INDEX
            lottery.aniObj.aniTime = 100;
            lottery.aniObj.canplay = 1;

            !lottery.items && (lottery.items = document.querySelectorAll('.lottery-items'));


            var lIS = document.querySelector('.lottery-items-select');
            if (lIS) {
                lIS.classList.remove('lottery-items-select');
            }


            setTimeout(function () {
                lottery.show = 1;
            }, 100);


        } else {

            loadLotteryImagesRes(function () {
                self.initLotteryFn();
            })
        }

    },

    // 触电的按钮操作
    lotteryBtnClick: function (state, e) {
        // e.stopPropagation();

        var self = this;

        if (this.lottery.btnState === 'light') return;

        this.lottery.btnState = state;


        // 请求响应的数据，开启动画
        if (state === 'light') {

            if (this.user.gold < this.user.luckyDrawCost) {

                e.stopPropagation();

                self.lottery.btnState = 'normal';

                // setTimeout(function () {
                self.coinTipWindow = 1;
                // }, 0);
                self.$nextTick(function () {

                });

                return;
            }

            var postUri = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                token: SDW_WEB.USER_INFO.token,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme
            }, false, HTTP_STATIC + 'luckydraw');

            SDW_WEB.getAjaxData(postUri, function (data) {

                if (data.result === 1) {
                    self.lottery.aniObj.stop = data.index - 1;  // 设置停止的位置INDEX

                    var item = self.lottery.lottery[data.index - 1];
                    self.lottery.result.icon = item.item;
                    self.lottery.result.name = item.name;

                    // 需要修正的金币和点券
                    self.lottery.stamp = data.stamps || 0;
                    // self.user.glod -= data.glod;

                    self.lottery.result.code = data.code;
                } else {
                    dialog.show('error', data.msg, 1);
                }
            });


            setTimeout(function () {
                _shopRoot.lottery.startTime = +new Date();
                _shopRoot.lottery.items[_shopRoot.lottery.stateIndex].classList.add('lottery-items-select');
                _shopRoot.lottery.timer = requestAnimationFrame(_shopRoot.lotteryLight);
            }, 120 + 150 + 800);
        }
    },

    // 触电旋转动画
    lotteryLight: function () {

        var self;
        var lot = this.lottery;
        if (lot.btnState == 'normal') return;

        var now = +new Date();

        if (now - lot.startTime >= lot.aniObj.aniTime) {
            lot.startTime = now;

            // 删除上一个选中的样式
            lot.items[lot.stateIndex % 8].classList.remove('lottery-items-select');

            // 添加下一个选中的样式
            lot.stateIndex++;
            lot.items[lot.stateIndex % 8].classList.add('lottery-items-select');

            // 判断是否减缓速度
            if (lot.aniObj.time < lot.stateIndex) {

                lot.aniObj.aniTime = 150 + Math.min(150, (lot.stateIndex - lot.aniObj.time + 1) * 2.1 * 40);

                // 终止动画，显示奖励
                if (lot.aniObj.stop <= lot.stateIndex - 40) {

                    lot.aniObj.canplay = 0;

                    // 延迟显示动画
                    setTimeout(function () {

                        // 修正玩家的金币和点券
                        _shopRoot.user.gold -= _shopRoot.user.luckyDrawCost;
                        _shopRoot.user.stamp += lot.stamp;

                        lot.result.show = 1;

                    }, lot.aniObj.aniTime * 3);

                }
            }
        }

        if (lot.aniObj.canplay)
            lot.timer = requestAnimationFrame(this.lotteryLight);
    }
};

// 加载砸蛋的资源
function loadEggImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var all = 5 * 4, loadLen = 0;
    var eggs = ['yellow', 'blue', 'green', 'red'];
    eggs.forEach(function (item) {
        for (var i = 1; i < 6; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/egg-' + item + '-' + i + '.png';
            img.onload = loaded;
        }
    });

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.egg.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}

// 加载触电的资源
function loadLotteryImagesRes(callback) {

    dialog.show('loading', '初始化...');
    // 预加载砸蛋的图片素材，此处可优化，使用精灵图片，定位；；；；需要花点时间

    var imgRes = ['blue-node', 'cl-bottom', 'cl-left', 'cl-right',
        'lottery-border-1', 'lottery-border-2', 'red-node',
        'lottery-btn-bottom', 'lottery-btn-click', 'lottery-btn-light',
        'lottery-btn-normal', 'line-blue', 'line-red'];

    var all = imgRes.length + 16, loadLen = 0;

    imgRes.forEach(function (item) {
        for (var i = 1; i < 16; i++) {
            var img = new Image();
            img.src = APP_ROOT + 'images/' + item + '.png';
            img.onload = loaded;
        }
    });

    for (var i = 1; i < 16; i++) {
        var img = new Image();
        img.src = APP_ROOT + 'images/light' + i + '.png';
        img.onload = loaded;
    }

    function loaded() {
        loadLen++;
        if (loadLen == all) {
            _shopRoot.lottery.init = true;
            dialog.hidden();
            callback && callback();
        }
    }
}


function scrollText(config) {
    this.id = config.id || 'undefined';
    this.scroll_width = document.documentElement.clientWidth * 0.86 >> 0;
    this.current_scroll_width = 0;
    this.current_index = 0;
    this.textArry = config.texts || [];
    this.isLoop = config.isLoop || true;
    this.text_dom_width = 0;
    this.delTime = config.delTime || 1000;
}

scrollText.prototype.init = function () {

    if (this.id == 'undefined' || this.textArry.length == 0) return;

    document.querySelector('#' + this.id).innerHTML = "<div class='scroll-texts-cont'><div class='text'></div></div>";
    this.text_dom = document.querySelector('#' + this.id + ' .text');

    this.start();
};

scrollText.prototype.start = function () {
    if (this.current_index == this.textArry.length) {
        if (this.isLoop) this.current_index = 0;
        else return;
    }

    this.text_dom.innerHTML = this.textArry[this.current_index] + '';

    this.text_dom.style.transform = 'translate3d(' + this.scroll_width + 'px,0,0)';
    this.text_dom.style.webkitTransform = 'translate3d(' + this.scroll_width + 'px,0,0)';
    this.text_dom.style.display = 'block';

    this.text_dom_width = this.text_dom.offsetWidth;
    this.current_scroll_width = this.scroll_width;

    requestAnimationFrame(this.timerFn.bind(this));
    this.current_index++;

};

scrollText.prototype.timerFn = function () {
    if (this.current_scroll_width > -(this.text_dom_width + 20)) {
        this.current_scroll_width--;
        this.text_dom.style.transform = 'translate3d(' + this.current_scroll_width + 'px,0,0)';
        this.text_dom.style.webkitTransform = 'translate3d(' + this.current_scroll_width + 'px,0,0)';
        requestAnimationFrame(this.timerFn.bind(this));
    } else {
        this.text_dom.style.display = 'none';
        setTimeout(this.start.bind(this), this.delTime);
    }
};

var goodsList = ['10MB流量', '30MB流量', '100MB流量'];

function selectFrom(low, up) {
    var t = up - low + 1;
    return (Math.random() * t + low) >> 0;
}

//1820004649
function createOldUid() {
    var uid = '182****';
    uid += selectFrom(100, 999);
    return uid;
}

function createUidList(num) {

    var list = [];
    for (var i = 0; i < num; i++) {

        var uid = createOldUid();
        var goods = goodsList[selectFrom(0, goodsList.length - 1)];

        list.push('玩家 ' + uid + '，兑换了' + goods);
    }

    return list;
}

function randomNum(list, num, slice) {

    num = num || 5;
    list = list || [];
    slice = slice || list.length;

    while (num--) {

        list = list.sort(function () {
            return Math.random() - 0.5;
        });
    }

    return list.slice(0, slice);
}

function createUidListResult() {

    var randomLists = createUidList(30);
    return randomNum(randomLists, 3);

}

var _shopRoot = new Vue({
    el: '#shop-root',
    data: indexData,
    methods: methods,
    components: {
        bindPhone: bindPhone,
    }
});


if (SDW_WEB.onShandw) {

    SDW_WEB.getSdwUserData().then(function (res) {
        _shopRoot.user.avatar = SDW_WEB.USER_INFO.avatar || 'http://www.shandw.com/pc/images/mandef.png';
        _shopRoot.user.id = SDW_WEB.USER_INFO.id;
        _shopRoot.user.nick = SDW_WEB.USER_INFO.nick;
        _shopRoot.loadList();
    }, function () {

        SDW_WEB.sdw.openLogin({
            success: function () {

            }
        })

    });

    // 设置APP的底部工具栏按钮
    // SDW_WEB.sdw.onSetToolBarOperation(['QQ', 'Timeline', 'AppMessage', 'QZone', 'Weibo']);

} else {
    _shopRoot.loadList();
}


