<!--
Created by CHEN-BAO-DENG on 2017/2/23.
@description 【闪电玩-移动首页】 底部的导航
只出现在非闪电玩APP中
-->

<template>

    <div class="footer footer-bg"
         v-if="navList.length && !onShandw">

        <div class="bottom-nav"
             v-if="item.show"
             v-for="item in navList"
             @click="checkNavState(item)"
        >
            <img :src="item.normal" alt="">
        </div>

    </div>

</template>

<script>

    var pageList = SDW_WEB._pageList;

    export default {
        name: 'main-footer',
        data: function () {
            return {
                onShandw: SDW_WEB.onShandw,
            }
        },

        props: ['type'],

        created: function () {
            // console.log(this, 'created');
        },

        methods: {
            checkNavState: function (item) {
                if (item.id != this.type) {
                    // flag [2018-01-05 13:42:17] 目前只统计首页的
                    // if (item.id === 'index') {
                    SDW_WEB.addCount('f-' + item.id);
                    // }
                    if (item.login && SDW_WEB.USER_INFO && !SDW_WEB.USER_INFO.uid) {
                        this.$emit("show-login");
                        return;
                    }
                    var tranUrl = item.url + location.search;
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
            navList: function () {
                var res = [];
                for (var i = 0; i < pageList.length; i++) {
                    var item = pageList[i];
                    if (SDW_WEB.channel == '10041' && item.id == 'rank') {
                        item.show = false;
                    }

                    if (item.id === this.type) {
                        item.normal = item.select
                    }
                    res.push(item);
                }
                return res;
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
        /*background: linear-gradient(180deg, rgba(43, 50, 61, 0), rgba(13, 14, 16, .001) 10%, rgba(43, 50, 61, 0.45) 40%, rgba(43, 50, 61, 0.66) 60%, #2b323d);*/
        background: #2b323d;
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        overflow: hidden;
        width: 100%;
        height: torem(120px);
        display: flex;
        justify-content: center;

    .bottom-nav {
        flex-grow: 1;
        display: block;
        height: torem(120px);
        position: relative;

    img {
        display: block;
        width: torem(120px);
        height: torem(120px);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    }

    }

</style>