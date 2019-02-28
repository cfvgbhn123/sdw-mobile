<!--开服游戏信息模板-->
<template>

    <div class="server-item-container">

        <img :src="gameItem.icon" class="s-b-icon">

        <div class="server-g-name">{{gameItem.name}}</div>
        <div class="server-g-info">{{gameItem.sName}}</div>

        <div class="server-time">{{gameItem.serverDateStr}}</div>

        <div class="game-btn g-l-right" @click.self.stop="checkAuth('play',gameItem.appId,gameItem)">开玩</div>

    </div>

</template>

<script>
    export default {
        name: 'server-game-item',
        data: function () {
            return {
                msg: 'server-game-item.vue'
            }
        },
        props: ['gameItem'],
        methods: {
            /**
             * 点击【开完】进行授权校验
             */
            checkAuth: function (type, id, item) {
                this.$emit("tap-game", type, id, item);
            }
        },
    }
</script>


<style lang="sass">
    @import "./server-game-item.scss";
</style>