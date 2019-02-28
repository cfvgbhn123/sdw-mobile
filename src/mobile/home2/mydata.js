/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

// document.addEventListener('touchmove', function (e) {
//     e.preventDefault();
// }, false);
require('../../components/initcss.scss');
require('./index.scss');
// var fastLogin = require('../../components/mobile/login/login.vue');
// var sdwFooter = require('../../components/mobile/main-footer/main-footer.vue');
var homeView;

SDW_WEB.USER_INFO = SDW_WEB.USER_INFO || {};

var indexData = {
    user: {
        avatar: SDW_WEB.USER_INFO.avatar || 'https://www.shandw.com/mobile/images/phdavatar.png',
        uid: '-1',
        nick: '闪电玩用户',
        phone: '11111111111',
        gold: 0,
        sex: 1
    }
};

var indexMethods = {};

var homeView = new Vue({
    el: '#app',
    data: indexData,
    methods: indexMethods,
    components: {}
});

if (SDW_WEB.onShandw) {
    SDW_WEB.getSdwUserData().then(function () {
        // homeView.getMyData();
    });

} else {

    // homeView.getMyData();
}
