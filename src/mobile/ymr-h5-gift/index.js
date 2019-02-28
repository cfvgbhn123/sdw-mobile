/**
 * Created by CHEN-BAO-DENG on 2018/2/5 0005.
 */


require("./index.scss");

var GameGift = {

    loading: false,

    userInfo: {
        nick: '',
        fail: false,
    },

    REM_MAP: {},

    hasFinish: true,
    unLog: true,

    init: function () {
        this.getDom();
        this.setGiftBtnSate('finish');
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

    changeRem: function (px) {

        if (this.REM_MAP['' + px]) {
            return this.REM_MAP['' + px];
        } else {
            var value = px / 32 + 'rem';
            this.REM_MAP['' + px] = value;
            return value;
        }

    },

    getDom: function () {

        this.cloud1 = document.querySelector('.cloud[data-index="1-1"]');
        this.cloud2 = document.querySelector('.cloud[data-index="1-2"]');
        this.cloud3 = document.querySelector('.cloud[data-index="1-3"]');

        this.container = document.querySelector('.container');
        this.messageContainer = document.querySelector('.message-container');
        this.msgCont = document.querySelector('.msg-cont');
        this.msg = document.querySelector('.msg');
        this.okBtn = document.querySelector('.ok-btn');
        this.giftBtn = document.querySelector('.gift-btn');
        this.nick = document.querySelector('.nick');
        this.unlog = document.querySelector('.unlog');
        this.addEvent();
    },

    noPlayerMsg: '请先在个人界面添加角色信息',
    finishMsg: '恭喜你，领取成功！<\/br> <span style="font-size:12px">*游戏道具发放或存在一定延迟<\/span> ',

    addEvent: function () {

        this.initCloudAni(this.cloud1, this.cloud2, this.cloud3);

        var self = this;

        this.giftBtn.onclick = function (e) {
            e.stopPropagation();

            if (self.unLog) {
                self.dialogMessage('请登录后领取', true);
                return;
            }

            if (!self.userInfo.playerId) {
                self.dialogMessage(self.noPlayerMsg, true);
                return;
            }

            if (self.hasFinish) {
                // self.dialogMessage('你已经领取过该奖励', true);

                return;
            }

            /*领取奖励*/
            self.getGiftInfo();
            // self.dialogMessage('', true);

        };


        this.okBtn.onclick = function (e) {
            e.stopPropagation();
            self.dialogMessage('', false);
        };

        this.messageContainer.onclick = function (e) {
            e.stopPropagation();
            if (e.target === this)
                self.dialogMessage('', false);
        };


        // 切换账号
        this.unlog.onclick = function (e) {
            e.stopPropagation();
            // SDW_WEB.sdw.openLogin({})

            self.dialogMessage('请通过头像 - 管理角色信息，进行切换账号操作', true);

        }
    },


    // 获取礼包的信息
    getGiftInfo: function (preview) {

        if (this.loading) return;
        this.loading = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({

            channel: this.userInfo.channel,
            uid: this.userInfo.uid,
            token: this.userInfo.token,
            sec: this.userInfo.secheme,
            playerId: this.userInfo.playerId,
            countrycode: this.userInfo.countrycode,
            query: preview ? 1 : 0,  // 1查询；0领取
            fl: this.userInfo.fl,

        }, false, 'http://bbqzs.shandw.com/getInstallReward');


        SDW_WEB.getAjaxData(postUri, function (data) {

            self.loading = false;

            if (data.result === 1) {

                if (!preview) {

                    self.dialogMessage(self.finishMsg, true);

                    self.hasFinish = true;

                    self.setGiftBtnSate('finish');

                } else {
                    /*数据初始*/

                    if (data.isGet === 0) {
                        // 没有领取
                        self.hasFinish = false;
                        self.setGiftBtnSate('normal');

                    } else {

                        self.setGiftBtnSate('finish');
                    }
                }

            } else {

                // 领取失败
                self.dialogMessage(data.msg || '获取数据失败', true);
            }
        })

    },

    setGiftBtnSate: function (state) {

        if (state === 'finish') {
            this.giftBtn.innerText = '已领取';
            this.giftBtn.dataset.type = state;
        }


        if (state === 'normal') {
            this.giftBtn.innerText = '点击领取';
            this.giftBtn.dataset.type = 'normal';
        }

    },

    dialogMessage: function (message, show) {

        //
        // var mySequence = [
        //     {e: this.messageContainer, p: 'transition.fadeIn', o: {duration: 300}},
        //     {e: this.msgCont, p: 'transition.bounceIn', o: {duration: 600}},
        // ];
        //
        // // 调用这个自定义的序列名称 还可以在其他地方复用
        // Velocity.RunSequence(mySequence);

        // this.messageContainer.classList.remove('hidden');
        if (show) {

            this.msg.innerHTML = message || 'Default Text';
            Velocity(this.messageContainer, "transition.fadeIn", {duration: 450});


        } else {

            Velocity(this.messageContainer, "transition.fadeOut", {duration: 450});
        }


    }
};

GameGift.init();

SDW_WEB.getSdwUserData().then(function (res) {

    GameGift.userInfo = res;
    GameGift.unLog = false;
    /*设置昵称文字*/
    GameGift.nick.innerText = '角色昵称:' + (GameGift.userInfo.nick || GameGift.userInfo.uid);
    GameGift.container.classList.remove('hidden');

    if (!res.playerId) {
        GameGift.dialogMessage(GameGift.noPlayerMsg, true);
    } else {
        GameGift.getGiftInfo(true);
    }

}, function () {
    GameGift.unLog = true;
    GameGift.container.classList.remove('hidden');
    GameGift.dialogMessage('获取用户信息失败', true);
});


/*设置分享*/
window.onload = function () {

    SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo']);


    setTimeout(function () {
        /*设置分享文案*/
        SDW_WEB.sdw.onSetShareOperate({

            title: '《野蛮人♂大作战》高能开启寻福之旅，Let\'s go 201發！',
            desc: '摩摩可送你新人♂福利',
            link: 'http://www.shandw.com/h5/ymr-h5/?v' + SDW_WEB.getNow(),
            imgUrl: 'http://www.shandw.com/h5/ymr-h5/images/share-icon.jpg'
        });
    }, 1000);
};