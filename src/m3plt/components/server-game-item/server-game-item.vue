<!--开服游戏信息模板-->
<template>


    <div class="server-item-container" @mouseover="onMouseOver()">

        <div class="server-cont-normal" v-show="!tap">
            <div class="server-g-name ellipsis">{{gameItem.name}}</div>
            <div class="server-g-info ellipsis">{{gameItem.sName}}</div>
            <div class="server-time">{{gameItem.serverDateStr}}</div>
        </div>


        <div class="server-select" v-show="tap">
            <img :src="gameItem.icon" class="s-b-icon" @click.stop="authToGame(gameItem)">

            <div class="server-g-name" @click.stop="gotoDetail(gameItem)">{{gameItem.name}}</div>
            <div class="server-g-info">{{gameItem.sName}}</div>

            <div class="server-time">{{gameItem.serverDateStr}}</div>

            <a class="start-game-btn"
               @click.stop="authToGame(gameItem)">开玩</a>
        </div>

    </div>

</template>

<script>

    var CheckOpenGame = require('../js/CheckOpenGame.js');
    import Fn from '../../index/js/Fn';
    export default {
        name: 'server-game-item',
        data: function () {
            return {
                msg: 'server-game-item.vue',
            }
        },

        props: ['gameItem', 'tap', 'games-modal'],
        methods: {
            // 跳转详情页采用相对路径处理
            gotoDetail: function (item) {
                this.$emit('go-detail', item.id)
            },
            onMouseOver: function () {
                this.$emit('on-mouse-over', 'serverGameListData', this.gameItem);
            },
            checkOpenGame: Fn.checkOpenGame,
            authToGame: Fn.authToGame,
            getQuery: Fn.getQuery,
            findGame: Fn.findGame
        },

        computed: {
            gameUrl: function () {
                var myUrl = CheckOpenGame.createMyUrl(this.gameItem);
                return myUrl;
            }
        }
    }
</script>
<style lang="sass">
    @import "./server-game-item.scss";
</style>