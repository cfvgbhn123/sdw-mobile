require('./index.scss');
require('../../components/initcss.scss');

var WindowScroll = require('../../libs/WindowScroll');

// var HTTP_STATIC = 'http://192.168.218.117:9061/';

var indexData = {
    showIndex: 1,
    navList: [{
        title: '商城兑换记录',
        index: 1,
        show: 'normal',
        page: 0,
        loading: false,
        data: [],
        method: 'usei'
    }, {
        title: '闪电币记录',
        index: 2,
        show: 'normal',
        loading: false,
        page: 0,
        data: [],
        method: 'ucci'
    }],
    showAlertList: {
        gameSuccess: false,
        code: false,
        goods: false,
    },
    myGameCode: '',   // 游戏礼包
    myGoodsInfo: {}, // 实物道具
    codeInfo: {},
    alertInfo: {},
};

var methods = {

    gotoWeixinShandw: function () {
        location.href = SDW_WEB.SDW_WEIXIN_URL;
    },

    /*复制文案*/
    setCopyCode: function (text) {

        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.setClipboard(text);
        }

        dialog && dialog.show('ok', '复制成功', 1);
    },

    showShopItem: function (item) {

        /*iType (物品发放方式（1游戏礼包CDK,2 cdk码，3实物,4.虚拟物品，8、话费）)*/

        this.alertInfo = item;

        if (item.iType === 3) {
            /*实物兑换*/
            // item.typeUrl = 'stamp';
            this.showAlertList.goods = true;

            this.myGoodsInfo.address = item.address;
            this.myGoodsInfo.userNick = item.contact;
            this.myGoodsInfo.expressNo = item.expressNo;
            this.myGoodsInfo.phone = item.phone;
            this.myGoodsInfo.orderId = item._id;

            function transType(type) {
                if (type === 1) {
                    return '闪电币'
                }
                if (type === 3) {
                    return '点券'
                }
                if (type === 4) {
                    return '现金'
                }
                if (type === 7) {
                    return '红包'
                }
            }

            function transPrice(p, type) {
                if (type === 4 || type === 7) {
                    return (p / 100).toFixed(2);
                }
                return p;
            }

            this.myGoodsInfo.price = transPrice(item.price, item.pType);
            this.myGoodsInfo.priceType = transType(item.pType);

        } else if (item.iType === 1) {

            /*游戏礼包*/
            this.showAlertList.gameSuccess = true;
            this.myGameCode = item.key;

        } else if (item.iType === 2) {

            /*虚拟道具*/
            // if (item.key) {
            this.showAlertList.code = true;
            this.codeInfo.code = item.key;
            this.codeInfo.info = item.msg;
            // }

        }

    },

    /*隐藏弹窗*/
    hiddenAlert: function () {
        for (var i in this.showAlertList) {
            if (this.showAlertList.hasOwnProperty(i)) {
                this.showAlertList[i] = false;
            }
        }
    },

    goToGamePage: function (item) {
        /*跳转到游戏*/
        /*跳转到记录*/

        var targetUrl = SDW_PATH.GAME_URL('play', item.appid);

        var openObj = {
            link: targetUrl,
            isFullScreen: false,
            showMoreBtn: true,
            title: '',
        };


        var openObj = SDW_WEB._checkWebViewObject(openObj, item);
        // 打开玩游戏的界面
        SDW_WEB.openNewWindow(openObj);
    },

    /*导航栏切换*/
    switchNavList: function (item) {

        document.body.scrollTop = document.documentElement.scrollTop = 0;

        for (var i = 0; i < this.navList.length; i++) {
            var _item = this.navList[i];
            if (item.index === _item.index) {
                _item.show = 'show';
                this.showIndex = item.index;
                if (_item.page === 0) {
                    this.getShopList(_item.index);
                }
            } else {
                _item.show = 'normal';
            }
        }
    },


    // 商品兑换记录
    getShopList: function (index) {

        var d = this.navList[index - 1];
        if (d.loading) return;
        d.loading = true;

        var self = this;

        var postUri = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            token: SDW_WEB.USER_INFO.token,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            page: d.page++
        }, false, HTTP_STATIC + d.method);

        // alert(postUri);
        SDW_WEB.getAjaxData(postUri, function (data) {


            if (data.result === 1) {
                /*追加*/
                data.list = data.list || [];
                for (var i = 0; i < data.list.length; i++) {

                    var _item = data.list[i];

                    if (_item.key) {
                        _item._mInfo = '兑换码' + _item.key; // 礼包码
                    }

                    // 兑换的币种
                    _item.gold = _item.gold || _item.coin || _item.stamp;
                    _item.pType = _item.pType || _item.type;

                    if (_item.pType === 3) {
                        _item.typeUrl = 'stamp';
                    } else if (_item.pType === 1) {
                        _item.typeUrl = 'gold';

                    } else if (_item.pType === 4 || _item.pType === 7) {
                        /*金钱 分 ==> 元*/
                        _item.typeUrl = 'money';
                        _item.gold = (_item.gold / 100).toFixed(2);
                    }


                    // 订单号状态
                    if (_item.expressNo) {
                        _item._mInfo = '快递单号' + _item.expressNo;
                    } else if (_item.iType === 3) {
                        _item._mInfo = '快递暂未发货';
                    }

                    d.data.push(data.list[i]);
                }

                d.loading = false;

                if (data.list.length === 0) {
                    d.loading = true;
                }

            }
        })
    },

    transTime: function (time) {
        var oDate = new Date(time);

        var year = oDate.getFullYear();
        var month = oDate.getMonth() + 1;
        var day = oDate.getDate();

        return year + '.' + month + '.' + day;
    }

};

var _vue = new Vue({
    el: '#shop-root',
    data: indexData,
    methods: methods,

    mounted: function () {
        var self = this;
        var clipboard = new Clipboard('.copy-btn');
        /*加载更多*/
        var allGameScroll = new WindowScroll(function () {
            // alert('getShopList')
            // self.currentRef.$emit('getShopList');  // 发送请求
            self.getShopList(self.showIndex);
        }, true, 200, 5);
    },
    computed: {
        showAlert: function () {
            var show = false;
            for (var i in this.showAlertList) {
                if (this.showAlertList.hasOwnProperty(i)) {
                    show = show || this.showAlertList[i]
                }
            }
            return show;
        }
    },
});

// var scroll = new WindowScroll(function () {
//     _shopRoot.loadList(currPage++)
// }, true);
//
// if (SDW_WEB.onShandw) {
//
//     SDW_WEB.getSdwUserData().then(function (res) {
//         _shopRoot.loadList(currPage++);
//     })
//
// } else {
//     _shopRoot.loadList(currPage++);
// }


SDW_WEB.getSdwUserData().then(function (userData) {

    _vue.switchNavList({
        index: 1
    });

    // mainSetShare();
}, function (msg) {
    // 获取闪电玩用户数据失败
    if (SDW_WEB.onShandw)
        SDW_WEB.sdw.openLogin({
            success: function () {

            }
        })
});




