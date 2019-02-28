require('./index.scss');
require('../../components/initcss.scss');

var indexData={};
var indexMethods={};

var _indexView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    mounted: function () {
        // var self = this;
        // this.$nextTick(function () {
        //     self.payFrame = document.querySelector('#payFrame');
        // });
        // document.querySelector('#app').style.display = 'block';
        //
        // var allGameScroll = new WindowScroll(function () {
        //     if (self.currentPage === 'history') {
        //         _indexView.requestHistory();
        //     }
        // }, true, 100, 30);
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








