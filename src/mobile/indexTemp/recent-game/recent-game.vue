<template>
    <!--我玩过的游戏-->
    <div class="recommend-container" v-if="recommendList.length">

        <div class="recommend-list2"><b>玩过</b></div>

        <div class="recommend-list"
             v-for="item in recommendList"
             @click="checkGameSate('play',item.id,item)">
            <img :src="item.icon"  class="recommend-cover">
        </div>

        <!--更多的游戏-->
        <div class="recommend-more" @click.stop.self="goMorePage()"></div>

    </div>
</template>

<script>
    export default {
        name: "recent-game",
        props: ['recommendList'],
        methods:{
            goMorePage:function () {
                var targetUrl = SDW_PATH.MOBILE_ROOT + 'more/?channel=' + SDW_WEB.channel;

                SDW_WEB.openNewWindow({
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: false,
                    title: ''
                });


            },
            checkGameSate: function (type, id, item, btnCount) {
                if (btnCount) {
                    SDW_WEB.addCount(btnCount);
                }
                var hasLogin = SDW_WEB.USER_INFO.uid;
                // 获取游戏地址
                var targetUrl = SDW_PATH.GAME_URL(type, id);
                var openObj = {
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: '',
                };

                if (type === 'play') {

                    // 玩游戏
                    if (hasLogin) {
                        openObj = SDW_WEB._checkWebViewObject(openObj, item);
                        // 打开玩游戏的界面
                        SDW_WEB.openNewWindow(openObj);
                    } else if (SDW_WEB.onShandw) {
                        // 闪电玩登录
                        SDW_WEB.sdw.openLogin({
                            success: function () {
                            }
                        });
                    } else {
                        // 普通短信登录
                        this.__showLoginPage();
                    }
                } else {
                    // 打开游戏的详情，不需要登录*********
                    SDW_WEB.openNewWindow(openObj);
                }
            },
        }
    }
</script>

<style lang="sass">
    @import "./recent-game.scss";
</style>
