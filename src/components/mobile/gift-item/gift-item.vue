<!--

移动版游戏主页-单个游戏模块

@param gameItem {Object}
*********************************************************
id:           游戏的id
cover:        游戏的封面
title:        游戏的名称
star:         游戏的星级
quantity:     游戏的活跃
desc:         游戏的描述
time:         游戏的时间（showMore为false，显示我玩过的时间）
********************************************************

-->

<template>

    <div class="gift-item">

        <div class="gift-container-info">
            <div class="gift-title">{{giftItem.name}}</div>

            <div class="gift-desc">{{giftItem.info}}</div>

            <slot name="gift-line"></slot>

        </div>


        <slot name="gift-btn"></slot>
    </div>

</template>

<script>

    export default {
        name: 'gift-item',
        data: function () {
            return {}
        },
        props: ['giftItem'],
        methods: {},
        computed: {}
    }

</script>

<style lang="sass">

    @import "gift-item.scss";

</style>