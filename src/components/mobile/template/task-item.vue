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
*********************************************************

@param showMore 是否显示更多信息，用于区别主页和我玩过的

@event tap-game(type)
*********************************************************
"play" ---  点击到【开玩】按钮
*********************************************************

-->

<template>

    <div class="">


    </div>

</template>

<script>

    export default {
        name: 'task-item',
        data: function () {
            return {
                inputData: {
                    phone: null,
                    code: null
                },
                loginFlagV2: 1
            }
        },
//        props: ['gameItem', 'showMore'],
        methods: {},
        computed: {}
    }

</script>

<style lang="sass">

</style>