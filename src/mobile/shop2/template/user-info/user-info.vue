<!--
绑定手机提示框
-->

<template>

    <section class="user-info-container">

        <!--头像-->
        <div class="avatar-container" @click="goMyHome()">
            <img class="avatar" :src="user.avatar"
                 v-if="user.avatar">
        </div>

        <!--金币-->
        <div class="jinbi-container list-container"
             id="user-gold"
             :data-value="user.gold">
            {{user.gold || '0'}}
        </div>

        <!--点券-->
        <div class="dianjuan-container list-container"
             id="user-stamp"
             :data-value="user.stamp">
            {{user.stamp || '0'}}
        </div>

        <!--红包-->
        <div class="hongbao-container list-container"
             id="user-money"
             :data-value="user.redPkt">￥ {{transMoney(user.redPkt || 0)}}
        </div>

    </section>


</template>

<script>

    export default {
        name: 'user-info',
        data: function () {
            return {};
        },

        props: ['user'],
        methods: {
            transMoney: function (num) {
                return (num / 100).toFixed(2);
            },

            goMyHome: function () {
                var pageUrl = 'http://www.shandw.com/mi/home/?channel=' + SDW_WEB.channel;
                SDW_WEB.openNewWindow({
                    link: pageUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                });
            }
        },
        computed: {},
        watch: {}
    }
</script>

<style lang="sass">
    @import "user-info.scss";
</style>