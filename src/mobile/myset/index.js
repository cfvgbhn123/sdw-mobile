/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */


var getConfigData = require('./src/mySetData.js');
var addressData = getConfigData.get('address');
require('./src/iosSelect.css');
var IosSelect = require('./src/iosSelect');

var userSelector = {
    'address': {
        oneLevelId: '110000',
        twoLevelId: '110100',
        threeLevelId: '110101'
    }
};

// document.addEventListener('touchstart', function (e) {
//
// }, false);
//
// document.addEventListener('touchmove', function (e) {
//     e.stopPropagation();
//     e.preventDefault();
// }, false);

require('./index.scss');
require('../../components/initcss.scss');


// var HTTP_STATIC = 'http://192.168.218.117:9061/';

var methods = {
    goapp: function () {
        SDW_WEB.sdw.createDesktop({
            isSet: false,
            // 下载地址
            link: 'https://itunes.apple.com/app/shan-dian-wan/id1177288706'
        })
    },
    clearAppCache: function () {
        if (SDW_WEB.onShandw) {
            SDW_WEB.sdw.clearAPPCache();
            dialog.show('loading', '缓存清理中...', 1);
            setTimeout(function () {
                dialog.show('ok', '缓存清理成功', 1);
            }, 500);
        } else {
            dialog.show('ok', '缓存清理成功', 1);
        }
    },
    // 退出登录
    unloadUser: function () {
        SDW_WEB._refreshUserData();
        if (!SDW_WEB.onShandw) {
            var url = 'http://www.shandw.com/mi/index/?channel=' + SDW_WEB.channel;
            if (location.replace) {
                location.replace(url);
            } else {
                location.href = url;
            }
        }
    },


    /*获取玩家的地址信息*/
    getAddressInfo: function () {
        var self = this, getUrl = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            token: SDW_WEB.USER_INFO.token,
        }, false, HTTP_STATIC + 'shopaddress');
        dialog.show('loading', '地址获取中...');
        SDW_WEB.getAjaxData(getUrl, function (data) {
            if (data.result === 1) {

                self.city = data.receivingArea || '';
                self.contact = data.contact || '';
                self.phone = data.phone || '';
                self.address = data.address || '';

                self.showType = 'address';

                dialog.hidden();
            }
        })
    },

    updateAddressInfo: function () {

        /*检查填写*/

        if (!this.contact) {
            return dialog.show('error', '请填写收货人', 1);
        }

        if (!this.phone) {
            return dialog.show('error', '请填写手机号', 1);
        }

        if (!this.address) {
            return dialog.show('error', '请填写详细地址', 1);
        }

        if (!this.city) {
            return dialog.show('error', '请选择所在地区', 1);
        }

        var self = this, getUrl = SDW_WEB.URLS.addParam({
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid,
            sec: SDW_WEB.USER_INFO.secheme,
            token: SDW_WEB.USER_INFO.token,
            phone: this.phone,
            contact: this.contact,
            area: this.province + this.city,
            address: this.address,
        }, false, HTTP_STATIC + 'upshopaddress');

        dialog.show('loading', '地址更新...');

        SDW_WEB.getAjaxData(getUrl, function (data) {
            if (data.result === 1) {
                dialog.show('ok', '地址更新成功', 1);
            } else {
                dialog.show('error', data.msg, 1);
            }
        })

    },

    showMyAddress: function () {
        this.getAddressInfo();
    },


    showAddress: function () {
        var self = this;

        var iosSelect = new IosSelect(2,
            [addressData.province, addressData.city],
            {
                title: '地址选择',
                itemHeight: 35,
                relation: [1, 1],
                oneLevelId: userSelector.address.oneLevelId,
                twoLevelId: userSelector.address.twoLevelId,
                // threeLevelId: userSelector.address.threeLevelId,
                callback: function (selectOneObj, selectTwoObj) {
                    self.province = selectOneObj.value;
                    self.city = selectTwoObj.value;
                    userSelector.address.oneLevelId = selectOneObj.id;
                    userSelector.address.twoLevelId = selectTwoObj.id;
                }
            });
    },
};


var myDataView = new Vue({
    el: '#app',
    data: {
        showgoapp: SDW_WEB.onShandw && SDW_WEB.onIOS,
        contact: '',
        phone: '',
        province: '',
        city: '',
        address: '',
        showType: 'normal',
    },
    methods: methods,
    mounted: function () {
    },
    computed: {
        myAddressText: function () {
            var res = this.province + this.city;
            if (!res) {
                return '请选择地址';
            }
            return res;
        }
    },
    components: {}
});


SDW_WEB.getSdwUserData().then(function (userData) {

    // _shopRoot.myInit();
    // mainSetShare();
}, function (msg) {
    // 获取闪电玩用户数据失败
    if (SDW_WEB.onShandw)
        SDW_WEB.sdw.openLogin({
            success: function () {

            }
        })
});