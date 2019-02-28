<!--

Created by CHEN-BAO-DENG on 2017/2/23.

@description 【闪电玩-移动首页】 单个游戏模块

@param gameInfo {Object} 游戏的信息 => {name:''}


-->


<template>

    <div class="game-list-item">
        <div class="game-name">{{gameInfo.name}}</div>
    </div>

</template>

<script>

    export default {
        name: 'gameItem',
        data: function () {
            return {}
        },
        props: ['gameInfo'],
        methods: {
            sayHello: function () {
                alert(this.gameInfo.name);
            }
        }
    }

</script>

<!--scoped-->
<style lang="sass">

    * {
        padding: 0;
        margin: 0;
    }

    .game-list-item {
        padding: 10px 20px 10px 40px;
        box-sizing: border-box;
        border-left: 3px solid #228c69;
        background-color: #f4f4f4;
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 19px, #d2dded 20px),
        linear-gradient(to right, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 19px, #d2dded 20px);
        background-size: 20px 20px;
        margin-bottom: 10px;
        cursor: pointer;
    }

    .game-list-item:hover {
        background-color: #dbf0fa;
    }

    .game-name {
        font-size: 16px;
        color: #456dbf;
        line-height: 30px;
    }

    .flex {
        display: flex;
    }

</style>