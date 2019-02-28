<!--

移动版游戏主页-单个游戏模块第二版本

@param gameItem {Object}
*********************************************************
id:           游戏的id
cover:        游戏的封面
title:        游戏的名称
star:         游戏的星级
quantity:     游戏的活跃
desc:         游戏的描述
time:         游戏的时间（showMore为false，显示我玩过的时间）
*********************************************************

@param showMore 是否显示更多信息，用于区别主页和我玩过的

@event tap-game(type,id)
*********************************************************
"play" ---  点击到【开玩】按钮
*********************************************************

-->

<template>

    <div class="small-game-t"
         @click.stop="checkAuth('play',gameItem.id,gameItem)">
        
        <!--<img :src="gameItem.icon" class="s-g-t-icon" @click.self.stop="checkAuth('',gameItem.id,gameItem.url)">-->
        <img :src="gameItem.icon" class="s-g-t-icon">
        <div class="s-g-t-name">{{gameItem.name}}</div>
        <!--<div class="game-btn" @click.self.stop="checkAuth('play',gameItem.id,gameItem)">开玩</div>-->
    </div>


</template>

<script>

    export default {
        name: 'small-game-item',
        data: function () {
            return {
                msg: 'small-item.vue'
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
        }
    }

</script>

<style lang="sass">
    @import "./small-game-item.scss"
</style>