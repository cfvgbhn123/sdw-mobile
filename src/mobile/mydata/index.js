/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// document.addEventListener('touchmove', function (e) {
//     e.preventDefault();
// }, false);
require('../../components/initcss.scss');
require('./src/iosSelect.css');
require('./index.scss');
// var fastLogin = require('../../components/mobile/login/login.vue');
// var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');

var getConfigData = require('./src/mySetData.js');
SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};

var IosSelect = require('./src/iosSelect');
var now = new Date();
var nowYear = now.getFullYear();
var nowMonth = now.getMonth() + 1;
var nowDate = now.getDate();
var userSelector = {
    'constellation': '1',
    'address': {
        oneLevelId: '110000',
        twoLevelId: '110100',
        threeLevelId: '110101'
    },
    'date': {
        oneLevelId: nowYear,
        twoLevelId: nowMonth,
        threeLevelId: nowDate
    }
};

var dateData = getConfigData.get('date');
var addressData = getConfigData.get('address');

var indexData = {
    _init: false,
    _loadData: false,
    user: {
        avatar: SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png',
        uid: '',
        nick: '',
        phone: '',
        gold: 0,
        sex: 1,   // 1是男性
        city: '',
        province: '',
        address: '',
        year: 0,
        month: 0,
        day: 0,
        constellation: selectorConstellation(nowMonth, nowDate)
    }
};


var indexMethods = {

    showDateStr: function () {
        var list = [];

        if (this.user.year) {
            list.push(this.user.year);
        }

        if (this.user.month) {
            var month = this.user.month < 10 ? +'0' + this.user.month : this.user.month;
            list.push(month);
        }
        if (this.user.day) {
            var day = this.user.day < 10 ? +'0' + this.user.day : this.user.day;
            list.push(day);
        }

        if (list.length) {
            return list.join('-');
        }

        return indexData._init ? '未设置' : '';
    },

    showAddressStr: function () {

        var list = [];

        if (this.user.province) {
            list.push(this.user.province);
        }
        if (this.user.city) {
            list.push(this.user.city);
        }
        if (list.length) {
            return list.join(' ');
        }

        return indexData._init ? '未设置' : '';

    },
    showDate: function () {
        var self = this;
        var iosSelect = new IosSelect(3,
            [dateData.year, dateData.month, dateData.day],
            {
                title: '日期选择',
                itemHeight: 35,
                oneLevelId: userSelector.date.oneLevelId,
                twoLevelId: userSelector.date.twoLevelId,
                threeLevelId: userSelector.date.threeLevelId,
                showLoading: true,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    self.user.constellation = selectorConstellation(selectTwoObj.id, selectThreeObj.id);
                    self.user.year = selectOneObj.id;
                    self.user.month = selectTwoObj.id;
                    self.user.day = selectThreeObj.id;
                    userSelector.date.oneLevelId = selectOneObj.id;
                    userSelector.date.twoLevelId = selectTwoObj.id;
                    userSelector.date.threeLevelId = selectThreeObj.id;
                    self.setUserInfo();
                }
            });
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
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    self.user.province = selectOneObj.value;
                    self.user.city = selectTwoObj.value;
                    userSelector.address.oneLevelId = selectOneObj.id;
                    userSelector.address.twoLevelId = selectTwoObj.id;
                    // userSelector.address.threeLevelId = selectThreeObj.id;

                    self.setUserInfo();
                }
            });
    },

    switchSex: function (sex) {
        var self = this;
        this.user.sex = sex;
        this.$nextTick(function () {
            self.setUserInfo();
        })
    },

    /**
     * 获取个人用户信息
     */
    getMyData: function () {

        var self = this,
            getUrl = SDW_WEB.URLS.addParam({
                channel: SDW_WEB.channel,
                uid: SDW_WEB.USER_INFO.uid,
                sec: SDW_WEB.USER_INFO.secheme,
                token: SDW_WEB.USER_INFO.token,
                type: 1,
                page: 0
            }, false, HTTP_STATIC + 'userinfo');

        SDW_WEB.getAjaxData(getUrl, function (data) {

            if (data.result == 1) {

                // 修改个人的信息
                var myInfo = data.info;
                self.user.avatar = myInfo.avatar || SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png';
                self.user.uid = myInfo.id;
                self.user.nick = myInfo.nick;
                self.user.phone = myInfo.phone || '';
                self.user.sex = myInfo.sex;
                self.user.city = myInfo.city;
                self.user.province = myInfo.province;
                self.user.gold = myInfo.gold || 0; // 金币

                self.user.year = myInfo.year;
                self.user.month = myInfo.month;
                self.user.day = myInfo.day;

                indexData._init = true;
            }
        });

    },

    // 上报用户的修改信息
    setUserInfo: function () {

        var self = this;

        var postParam = {
            nick: indexData.user.nick,
            avatar: indexData.user.avatar,
            sex: indexData.user.sex,
            uid: SDW_WEB.USER_INFO.uid,
        };

        if (indexData.user.day) {
            postParam.day = indexData.user.day;
        }
        if (indexData.user.month) {
            postParam.month = indexData.user.month;
        }
        if (indexData.user.year) {
            postParam.year = indexData.user.year;
        }

        if (indexData.user.province) {
            postParam.province = indexData.user.province;
        }
        if (indexData.user.city) {
            postParam.city = indexData.user.city;
        }
        if (indexData.user.address) {
            postParam.address = indexData.user.address;
        }

        postParam.channel = SDW_WEB.channel;
        postParam.sec = SDW_WEB.USER_INFO.secheme;
        postParam.token = SDW_WEB.USER_INFO.token;

        var oSign = '',
            oSignList = ['uid', 'nick', 'avatar', 'sex', 'year', 'month', 'day', 'province', 'city', 'address'];

        for (var i = 0; i < oSignList.length; i++) {
            if (postParam[oSignList[i]]) {
                oSign += postParam[oSignList[i]];
            }
        }

        postParam.sign = SDW_WEB.MD5(oSign);

        var getUrl = SDW_WEB.URLS.addParam(postParam, true, HTTP_STATIC + 'userset');

        dialog.show('loading', '个人信息设置中...');

        var startTime = +new Date();
        SDW_WEB.getAjaxData(getUrl, function (data) {
            if (data.result == 1) {

                var dT = +new Date() - startTime;

                if (dT >= 300) {
                    dT = 0;
                } else {
                    dT = 300 - dT;
                }

                setTimeout(function () {
                    dialog.show('ok', '信息设置成功', 1);
                }, dT)
            }
        });

    }
};

var myDataView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {}
});


if (SDW_WEB.onShandw) {
    SDW_WEB.getSdwUserData().then(function () {
        myDataView.getMyData();
    });

} else {
    myDataView.getMyData();
}


// 判断星座
function selectorConstellation(month, date) {
    if (month == 1 && date >= 20 || month == 2 && date <= 18) {
        return "水瓶座";
    }
    if (month == 2 && date >= 19 || month == 3 && date <= 20) {
        return "双鱼座";
    }
    if (month == 3 && date >= 21 || month == 4 && date <= 19) {
        return "白羊座";
    }
    if (month == 4 && date >= 20 || month == 5 && date <= 20) {
        return "金牛座";
    }
    if (month == 5 && date >= 21 || month == 6 && date <= 21) {
        return "双子座";
    }
    if (month == 6 && date >= 22 || month == 7 && date <= 22) {
        return "巨蟹座";
    }
    if (month == 7 && date >= 23 || month == 8 && date <= 22) {
        return "狮子座";
    }
    if (month == 8 && date >= 23 || month == 9 && date <= 22) {
        return "处女座";
    }
    if (month == 9 && date >= 23 || month == 10 && date <= 22) {
        return "天秤座";
    }
    if (month == 10 && date >= 23 || month == 11 && date <= 21) {
        return "天蝎座";
    }
    if (month == 11 && date >= 22 || month == 12 && date <= 21) {
        return "射手座";
    }
    if (month == 12 && date >= 22 || month == 1 && date <= 19) {
        return "摩羯座";
    }
}
