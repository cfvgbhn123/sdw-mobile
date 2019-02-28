require('./index.scss');
require('../../components/initcss.scss');

// window.sdw = {};
var WindowScroll = require('../../libs/WindowScroll');

var indexData = {
    userPayToken: '',
    currentPayItem: null,
    gameList: [],
    wxUserInfo: {},
    currentPage: 'index',  // itemList-道具列表  index-充值首页  history-历史
    topText: '《怼怼三国》红包提现',
    payFrame: null,
    showPayFrame: false,  // 是否显示支付页面

    historyList: [],
    historyPage: 0,

    preLoadImg: 'images/ani.gif?nmm',

    loading: false,
    recommendList:[
        {
            gameImg:'https://img.m3guo.com/group3/M00/00/C8/wKgMHFtpFPyAaK03AAYGKpuEALw205.gif',
            name:'决战沙城',
            gameid:'1247433539'
        },
        {
            gameImg:'https://img.m3guo.com/group2/M00/00/D2/wKgMHFvFVrOASCoIAAFaITcGDCY274.png',
            name:'大圣轮回',
            gameid:'2005641418'
        },
        {
            gameImg:'http://img.m3guo.com/group4/M00/00/18/wKgMHFtVqMuAd-WxAAZStFD138g796.png',
            name:'屠龙破晓',
            gameid:'2022222027'
        },
        {
            gameImg:'https://open.shandw.com/uploads/fb7671817f97cb13ef227c8cb7a09886.png',
            name:'凡人飞仙传',
            gameid:'2072357068'
        },
        {
            gameImg:'http://img.m3guo.com/group2/M00/00/D7/wKgMHFv9ED6AbOpbAAbJ6nabPXY187.gif',
            name:'古龙群侠传2',
            gameid:'1938532554'
        },
        {
            gameImg:'http://img.m3guo.com/group4/M00/00/28/wKgMHFvlAdGAXwoNAAdC2eslStQ018.gif',
            name:'三生三世',
            gameid:'1938270411'
        },
        {
            gameImg:'http://img.m3guo.com/group3/M00/00/CC/wKgMHFuFOxqAQxR0AAcsx7aI1ck080.png',
            name:'魔域来了',
            gameid:'2089003210'
        },
        {
            gameImg:'http://img.m3guo.com/group4/M00/00/2C/wKgMHFwcsLWAcmuZAAe-vx2iylA628.gif',
            name:'战龙酒馆',
            gameid:'1954719946'
        }
    ]
};

var indexMethods = {
    openGame:function (gid) {

        if(!gid) {
            dialog.show('error', '游戏不存在', 1);
            return ;
        } ;
        location.href = 'http://www.shandw.com/mi/game/'+gid+'.html?channel=10000';
    },
    showRequestHistory: function () {
        this.historyList = [];   // 清空数据
        this.historyPage = 0;
        this.requestHistory();
    },
    getMoney:function () {
        if (this.wxUserInfo.redPkt && this.wxUserInfo.redPkt<1) {
            dialog.show('error', '余额不足', 1);
            return;
        }

        if (this.loading) return;
        this.loading = true;

        var self = this;

        dialog.show('loading', '数据请求中');

        SDW_WEB.postAjaxData('http://platform.shandw.com/cpRedPktWithdraw',
            {
            uid: SDW_WEB.USER_INFO.uid,
            sdwcode:this.userPayToken,
            timestamp:new Date().getTime(),
            amount: this.wxUserInfo.redPkt * 100,
        },function (res) {
            self.loading = false;
            if (res.result === 1) {
                dialog.show('ok', '提现成功<br>红包到账可能存在一定程度延迟，敬请理解', 3);
            }else {
                dialog.show('error', res.msg, 1);
            }
        })

    },
    /*根据当前的userPayToken，获取对应的游戏道具列表*/
    requestGameItemList: function () {
        /*简单检测用户token*/
        if (!this.userPayToken) {
            this.currentPage = 'index';
            dialog.show('error', '请输入闪电码', 1);
            return;
        }

        if (this.loading) return;
        this.loading = true;

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            payCode: self.userPayToken,
            channel: SDW_WEB.channel,
            sdwCode:"test",

        }, false, 'http://platform.shandw.com/pageGameShopList');

        dialog.show('loading', '数据请求中');

        SDW_WEB.getAjaxData(postUri, function (res) {

            if (res.result === 1) {
                // console.log(res.list);
                self.wxUserInfo = res;
                if(self.wxUserInfo.redPkt){
                    self.wxUserInfo.redPkt = (self.wxUserInfo.redPkt / 100 ).toFixed(2) ;
                }

                self.gameList = res.list || [];

                self.gameList.forEach(function (item) {
                    item.priceStr = self.transMoney(item.productPrice);
                });

                self.topText = '《' +res.appName +'》'+ '红包提现';
                self.currentPage = 'getMoney';
                dialog.hidden();
            } else {
                self.currentPage = 'index';
                dialog.show('error', res.msg, 1);
            }

            self.loading = false;
        })

    },

    transMoney: function (num) {
        num = num * 0.01; // 分到元
        num = num.toFixed(2);
        return num;
    },

    transTime: function (time) {
        var obj = new Date(time),
            year = obj.getFullYear(),
            month = obj.getMonth() + 1,
            day = obj.getDate();

        var hour = (obj.getHours() + 24) % 12 || 12;  // 换算成24小时制
        var min = obj.getMinutes();
        var sec = obj.getSeconds();

        // + ' ' + hour + ':' + min + ':' + sec
        return year + '-' + month + '-' + day;
    },

    startBuyItem: function (item) {
        this.requestPayData(item)
    },

    sortKeys: function (obj) {
        var keys = [],
            res = [];
        for (var i in obj) {
            keys.push(i);
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            res.push(keys[i] + '=' + obj[keys[i]]);
        }
        return res.join('&');
    },

    /*根据当前的点击道具，换取支付数据*/
    requestPayData: function (item) {

        if (this.loading) return;
        this.loading = true;

        dialog.show('loading', '数据请求中');

        // 参与签名字段：pay_uid\pay_channel\pay_wxappid\pay_areaId\productId\productPrice
        // sign=md5（签名字段字母顺序key=value使用&拼接）小写

        var payData = {
            "pay_uid": this.wxUserInfo.pay_uid,
            "pay_channel": this.wxUserInfo.pay_channel,
            "pay_appId": this.wxUserInfo.pay_appId,
            "pay_areaId": this.wxUserInfo.pay_areaId || "",
            "productId": item.productId || item.productName || "",
            "productPrice": item.productPrice,
        };

        // console.log(this.sortKeys(payData));
        payData.sign = SDW_WEB.MD5(this.sortKeys(payData));
        payData.channel = SDW_WEB.channel;

        if (SDW_WEB.onWeiXin) {
            payData.uid = SDW_WEB.USER_INFO.uid;
        }

        var self = this;
        var postUri = SDW_WEB.URLS.addParam(payData, false, 'http://platform.shandw.com/pageGameShopOrder');

        SDW_WEB.getAjaxData(postUri, function (res) {

            // 隐藏提示框
            dialog.hidden();

            if (res.result === 1) {
                if (res.data) {
                    // CP产出的支付数据
                    self.startPay(res.data);
                } else {
                    dialog.show('error', '返回数据缺少data', 1);
                    console.log('返回数据[data]错误：请对照文档所给的示例');
                }
            } else if (res.result === -1) {
                // CP的错误提示文案
                dialog.show('error', res.msg, 1);
            } else {
                // 其他错误信息
                dialog.show('error', JSON.stringify(res), 1);
            }

            self.loading = false;
        });

    },

    /*开始支付*/
    startPay: function (data) {
        if (!data.wxopenid) {
            delete  data.wxopenid;
        }
        data.payChannel = '';
        // 通知iframe页面进行支付
        this.postMessage(data);
    },

    showUserHistory: function () {
        this.currentPage = 'history';
    },

    postMessage: function (data) {
        if (!this.payFrame) {
            return;
        }

        if (!SDW_WEB.onWeiXin) {
            this.showPayFrame = true;
        }

        this.payFrame.contentWindow.postMessage(JSON.stringify({
            postSdwData: true,
            data: data,
            operate: 'sdw_pay'
        }), '*');
    },

    requestHistory: function () {
        /*简单检测用户token*/
        if (!this.userPayToken) {
            dialog.show('error', '请输入闪电码', 1);
            return;
        }

        if (this.loading) return;
        this.loading = true;

        dialog.show('loading', '数据请求中');

        var self = this;
        var postUri = SDW_WEB.URLS.addParam({
            payCode: self.userPayToken,
            channel: SDW_WEB.channel,
            page: this.historyPage
        }, false, 'http://platform.shandw.com/getUserPayRecord');

        SDW_WEB.getAjaxData(postUri, function (res) {

            if (res.result === 1) {
                self.showUserHistory();
                var _list = res.list || [];
                if (_list.length) {
                    self.historyPage++;   // 页数累加
                    _list.forEach(function (item) {
                        item.timeStr = self.transTime(item.time);
                        item.priceStr = self.transMoney(item.money);
                    });
                    self.historyList = self.historyList.concat(_list);
                }
                dialog.hidden();

            } else {
                self.historyList = [];
                dialog.show('error', res.msg, 1);
            }
            self.loading = false;

        })
    },

    refreshPage: function () {
        location.reload();
    },
};


// 动态修改引导图，需要配置在前端，根据游戏id命名
if (SDW_WEB.queryParam['id']) {
    indexData.preLoadImg = 'images/' + SDW_WEB.queryParam['id'] + '.gif';
}

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    mounted: function () {
        var self = this;
        this.$nextTick(function () {
            self.payFrame = document.querySelector('#payFrame');
        });
        document.querySelector('#app').style.display = 'block';

        var allGameScroll = new WindowScroll(function () {
            if (self.currentPage === 'history') {
                _indexView.requestHistory();
            }
        }, true, 100, 30);
    }
});


SDW_WEB.getSdwUserData().then(function (userData) {
    // _indexView.loadMainData();
    console.log('获取成功');
    // _indexView.switchNav(indexData.navList[0]);
    // _indexView.requestGameItemList();
}, function (msg) {
    // 获取闪电玩用户数据失败
    console.log('获取闪电玩用户数据失败');
    SDW_WEB.USER_INFO = {};
    // _indexView.requestGameItemList();
    // _indexView.loadMainData();
    // _indexView.switchNav(indexData.navList[0]);
});

(function () {

    window.addEventListener('message', function (e) {
        if (typeof e.data === 'string') {
            try {
                var postData = JSON.parse(e.data);
                if (postData.postSdwData) {
                    var type = postData.oprate || postData.operate;
                    if (_MESSAGE_CALLBACK[type]) {
                        _MESSAGE_CALLBACK[type](postData);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }, false);

    var _MESSAGE_CALLBACK = {
        'sdw_pay_close': function () {
            _indexView.showPayFrame = false;
        }
    }
})();







