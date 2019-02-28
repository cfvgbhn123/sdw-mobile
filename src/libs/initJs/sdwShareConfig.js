/**
 * Created by CHEN-BAO-DENG on 2017/7/17 0017.
 */


var sdwShareConfig = {

    start: function () {

        var currentPage = location.href.split('#')[0];
        var shareOption = {};
        var setShare = false;

        // 分类页面
        if (/classify/.test(currentPage)) {
            shareOption.title = '男人的E盘，女人的衣柜';
            shareOption.desc = '精品都在这里，你懂得！';
        }

        // 礼包的界面
        else if (/gift/.test(currentPage)) {
            shareOption.title = '您有一份礼包速来领取';
            shareOption.desc = '礼包剩余3%，手慢即将错过！';
        }

        // 商城的界面
        else if (/shop/.test(currentPage)) {
            shareOption.title = '教你如何获得免费的iPhone7';
            shareOption.desc = '已有189人领取了iPhone7，目前库存充足';
            shareOption.imgUrl = 'http://cdn.app.m3guo.com/img/20177/5965d75911b5f.png';
        }

        // 专题主界面
        else if (/thematic/.test(currentPage)) {
            shareOption.title = '精选游戏专题，汇聚精品游戏';
            shareOption.desc = '汇聚各类风格精品游戏，精挑细选，呈现最好的游戏专题';
        }

        // 成就任务
        else if (/task/.test(currentPage)) {
            shareOption.title = '我赚取的闪电币都够换取iPhone7啦！';
            shareOption.desc = '完成任务，赚取闪电币，各类礼品轻松拿';
            shareOption.imgUrl = 'http://cdn.app.m3guo.com/img/20177/5965d75911b5f.png';
        }

        else if (/index/.test(currentPage) || /home/.test(currentPage) || /more/.test(currentPage)) {
            setShare = true;
        }

        // 进行设置分享文案
        // console.log(shareOption, setShare);

        if (shareOption.title || setShare) {
            this.setShare(shareOption);
        }

    },

    setShare: function (option) {

        var addJsFile = function (url, callback) {
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = url;
            oHead.appendChild(oScript);
            oScript.onload = callback;
        };

        var addMeta = function (name, content) {
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oMeat = document.createElement("meta");
            oMeat.name = name;
            oMeat.content = content;
            oHead.appendChild(oMeat);
        };

        option = option || {};

        if (SDW_WEB.onShandw) {

            // 设置APP的底部工具栏按钮
            var setKey = '_setToolBar_';
            var hasSet = SDW_WEB.Store.get(setKey);

            if (!hasSet) {
                SDW_WEB.sdw.onSetToolBarOperation(['AppMessage', 'Timeline', 'QQ', 'QZone', 'Weibo', 'copyLink']);
            }

            SDW_WEB.Store.set(setKey, 1);

        }

        // 添加版本号
        var shareLinks = location.href.split('#')[0];

        if (SDW_WEB.USER_INFO && SDW_WEB.USER_INFO.uid) {

            if (shareLinks.indexOf('?') === -1) {
                shareLinks += '?' + SDW_WEB.sender_sdw_id + '=' + SDW_WEB.USER_INFO.uid
            } else {
                shareLinks += '&' + SDW_WEB.sender_sdw_id + '=' + SDW_WEB.USER_INFO.uid
            }
        }
        var tongchengChannels = ['11884','11903','11905','11909'] ;
        var busChannels = ['11906'] ;
        if(tongchengChannels.indexOf(SDW_WEB.channel) != -1){
            option.title =  option.title  || '同程游戏大厅';
            option.desc = option.desc || '千款游戏，一站畅玩！';
            option.imgUrl = option.imgUrl || 'https://img.m3guo.com/group3/M00/00/DB/wKgMHFw2vg6AbA5GAACfnqMWZ2A155.png';
        }else if(busChannels.indexOf(SDW_WEB.channel) != -1){
            option.title =  option.title  || '巴士管家游戏大厅';
            option.desc = option.desc || '千款游戏，一站畅玩！';
            option.imgUrl = option.imgUrl || 'https://img.m3guo.com/group4/M00/00/2D/wKgMHFw2vg6AfDWhAAB3LQWE4TI473.png';
        }else{
            option.title = option.title || '闪电玩-共享好游戏';
            option.desc = option.desc || '闪电玩游戏平台，千款游戏，一站畅玩！';
            option.imgUrl = option.imgUrl || 'https://www.shandw.com/app/tabicon/sdw.png';
        }

        option.link = option.link || shareLinks;
        var setShareFn = function () {

            // alert('setShareFn');
            
            // 延迟一段时间进行设置
            SDW_WEB.mySetTimer = setTimeout(function () {
                SDW_WEB.sdw.onSetShareOperate(option);
                SDW_WEB.mySetTimer = null;
            }, 50);

            addMeta('description', option.desc);
        };

        // 在微信中，如果没有wx的js，先加载微信的js，然后再调用
        if (SDW_WEB.onWeiXin && typeof wx === 'undefined') {
            addJsFile('https://res.wx.qq.com/open/js/jweixin-1.0.0.js', function () {
                setShareFn();
            });
        } else {
            setShareFn();
        }

    }
};

module.exports = sdwShareConfig;