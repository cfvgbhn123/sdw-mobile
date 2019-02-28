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

    <div class="loading-container">
        <div class="loading-more">
            <i class="icon-loading"></i>
            <span class="loading-text">努力加载中...</span>
        </div>
    </div>

</template>

<script>

    export default {
        name: 'task-item',
        data: function () {
            return {}
        },
//        props: ['gameItem', 'showMore'],
        methods: {},
        computed: {}
    }

</script>

<style lang="sass" rel="stylesheet/scss">

    @function torem($px) {
        @return $px / 32px * 1rem;
    }

    @function topx($px) {
        @return $px / 32px * 16px;
    }

    .loading-container {
        text-align: center;
    }

    .loading-more {
        margin: torem(20px) auto;
        margin-top: torem(40px);
        height: torem(60px);
        line-height: torem(60px);
        text-align: center;
        display: inline-block;
        color: #8d9cb4;

        .icon-loading {
            margin-top: torem(10px);
            float: left;
            width: torem(40px);
            height: torem(40px);
            display: inline-block;
        }

        .loading-text {
            margin-left: torem(25px);
            font-size: torem(30px);
            float: left;
            display: inline-block;
            height: torem(60px);
        }
    }


</style>