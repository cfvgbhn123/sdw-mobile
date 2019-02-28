<!--

Created by CHEN-BAO-DENG on 2017/2/23.

@description 【闪电玩-移动首页】 底部的导航

只出现在非闪电玩APP中

@param index {Number} 导航的索引 => index=1
@param showBg {Boolean} 是否显示背景色

-->

<template>

    <div :class="footerClass" v-if="navList.length && !onShandw">
        <div class="bottom-nav"
             v-if="item.show"
             v-for="(item,index) in navList"
             v-tap.self.stop="{methods:checkNavState,item:item,index:index}"
        >
            <i :class="item.icon"></i>
            <p class="title" v-if="!item.select">{{item.title}}</p>
            <i class="light" v-if="item.select"></i>
        </div>
    </div>

</template>

<script>

    export default {
        name: 'gameItem',
        data: function () {
            return {
//                navList: []
                onShandw: SDW_WEB.onShandw
            }
        },
        props: ['index', 'background'],
        methods: {
            checkNavState: function (params) {

                var pageMap = {
                    0: 'index/',
                    1: 'rank/',
                    2: 'task/',
                    3: 'home/'
                };

                // flag [2018-01-05 13:42:17] 目前只统计首页的
                if (/index\//.test(location.href)) {
                    SDW_WEB.addCount('f-' + params.index);
                }

                if (this.index == params.index) {

                } else {
                    var idx = params.index;

                    // 需要登录
                    if (idx != 0 && !SDW_WEB.USER_INFO.uid) {
                        this.$emit("show-login", idx);
                        return;
                    }

                    var tranUrl = SDW_PATH.MOBILE_ROOT + pageMap[idx] + location.search;

                    if (!/v=/.test(tranUrl)) {
                        if (tranUrl.indexOf('?') === -1) {
                            tranUrl += '?v=' + SDW_WEB.version;
                        } else {
                            tranUrl += '&v=' + SDW_WEB.version;
                        }
                    }

                    location.href = tranUrl;
                }

            }
        },
        computed: {

            footerClass: function () {
                if (this.background) {
                    return 'footer footer-bg'
                }
                return 'footer'
            },
            navList: function () {

                var index = parseInt(this.index) || 0;
                var titles = ['首页', '排行', '成就', '我'];
                var icons = ['icon icon-main', 'icon icon-rank', 'icon icon-task', 'icon icon-me'];
                var result = [];


                for (var i = 0; i < titles.length; i++) {
                    var item = {};
                    item.title = titles[i];
                    item.icon = icons[i];
                    item.select = (i == index);

                    if (item.select) {
                        item.icon += ' icon-select';
                    }

                    item.show = true;

                    // 烟草隐藏排行
                    if (SDW_WEB.channel == '10041' && item.title == '排行') {
                        item.show = false;
                    }
                    result.push(item);
                }

                return result;
            }
        }
    }

</script>

<!--scoped-->
<style lang="sass" rel="stylesheet/scss" type="text/css">

    @function torem($px) {
        @return $px / 32px * 1rem;
    }

    * {
        padding: 0;
        margin: 0;
    }

    .footer-bg {
        background: linear-gradient(180deg, rgba(43, 50, 61, 0), rgba(13, 14, 16, .001) 10%, rgba(43, 50, 61, 0.45) 40%, rgba(43, 50, 61, 0.66) 60%, #2b323d)
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        overflow: hidden;
        width: 100%;
        height: torem(130px);
        display: flex;
        justify-content: center;

    .bottom-nav {
        flex-grow: 1;
        display: block;
        height: torem(130px);
        position: relative;
    }

    .icon {
        transform-origin: 50%;
        display: block;
        width: torem(100px);
        height: torem(87px);
        position: absolute;
        top: torem(15px);
        left: 50%;
        transform: translateX(-50%) scale(0.7);
    }

    .light {
        display: block;
        width: torem(127px);
        height: torem(57px);
        background: url(img/selectlight.png) 0 0 /100%;
        position: absolute;
        bottom: torem(-5px);
        left: 50%;
        transform: translateX(-50%);
    }

    .icon-select {
        transform: translateX(-50%) scale(0.9);
    }

    .icon-main {
        background: url(img/subgame.png) 0 0 /100%;
    }

    .icon-rank {
        background: url(img/subph.png) 0 0 /100%;
    }

    .icon-task {
        background: url(img/cj-icon.png) 0 0 /100%;
    }

    .icon-me {
        background: url(img/subme.png) 0 0 /100%;
    }

    .title {
        position: absolute;
        bottom: torem(10px);
        width: 100%;
        font-size: torem(18px);
        height: torem(20px);
        line-height: torem(20px);
        text-align: center;
        color: #fff;
    }

    }

</style>