<!--开服游戏信息模板-->
<template>


    <div class="server-item-container"
         @mouseover="onMouseOver()"
    >

        <div class="server-cont-normal" v-show="!tap">
            <div class="server-g-name ellipsis">{{gameItem.name}}</div>
            <div class="server-g-info ellipsis">{{gameItem.sName}}</div>
            <div class="server-time">{{gameItem.serverDateStr}}</div>
        </div>


        <div class="server-select" v-show="tap">
            <img :src="gameItem.icon" class="s-b-icon">

            <div class="server-g-name">{{gameItem.name}}</div>
            <div class="server-g-info">{{gameItem.sName}}</div>

            <div class="server-time">{{gameItem.serverDateStr}}</div>

            <a class="start-game-btn"
               :href="gameUrl"
               @click.stop="checkOpenGame(gameItem)"
               target="_blank">开玩</a>
        </div>

    </div>

</template>

<script>

    var CheckOpenGame = require('../js/CheckOpenGame.js');

    export default {
        name: 'server-game-item',
        data: function () {
            return {
                msg: 'server-game-item.vue',
            }
        },

        props: ['gameItem', 'tap'],
        methods: {
            onMouseOver: function () {
                this.$emit('on-mouse-over', 'serverGameListData', this.gameItem);
            },
            checkOpenGame: function (item) {
                CheckOpenGame.checkOpenUrl(item);
            }
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