(function ($) {

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
        // 用户的基本信息
        user : {
            avatar: '',
            id    : 102829069,
            nick  : 'CBD-TTF',
            gold  : null
        },
        lists: []
    };

    var methods = {

        loadList  : function () {

            var sec = GUID();
            var url = HTTP_STATIC + 'tasklt?channel=' + channel + '&token=' + faultylabs.MD5(channel + USER_DATA.id + sec + USER_DATA.token) + '&uid=' + USER_DATA.id + '&sec=' + sec;

            getData(url, function (data) {

                var list = _shopRoot.lists.concat(data.list);
                _shopRoot.lists = list;
                _shopRoot.user.gold = data.gold;

            }, function (data) {
                alert(data.msg);
            });
        },
        finishTask: function (item, e) {

            if (item.flag == 2) return;

            var sec = GUID();
            var url = HTTP_STATIC + 'taskaw?channel=' + channel + '&token=' + faultylabs.MD5(channel + USER_DATA.id + sec + USER_DATA.token) + '&uid=' + USER_DATA.id + '&sec=' + sec + '&tid=' + item.id;

            getData(url, function (data) {

                item.flag = 2;
                _shopRoot.user.gold = data.gold;

            }, function (data) {
                alert(data.msg);
            });
        }

    };

    var _shopRoot = new Vue({
        el     : '#shop-root',
        data   : indexData,
        methods: methods
    });

    _shopRoot.loadList();


})(Zepto);