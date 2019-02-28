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

    <div class="task-item ">

        <div class="task-title">{{taskItem.title}}</div>

        <slot name="recharge"></slot>

        <!--奖励-->
        <p class="task-gold-container">
            <span class="task-text">奖励</span>
            <span class="task-gold">{{transCoins(taskItem.coin)}}</span>
        </p>

        <!--任务按钮-->
        <slot name="task-btn"></slot>

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
        props: ['taskItem'],
        methods: {
            // 转换金币
            transCoins: function (coin) {
                var big, small;

                if (coin < 10000) return coin;

                if (coin < 100000000) {
                    big = coin / 10000 >> 0;
                    small = (coin % 10000) + '';

                    if (small == 0) {
                        return big + '万';
                    }

                    return big + '.' + small[0] + '万';
                }

                if (coin < 10000000000) {
                    big = coin / 100000000 >> 0;
                    small = (coin % 100000000) + '';

                    if (small == 0) {
                        return big + '亿';
                    }

                    return big + '.' + small[0] + '亿';
                }
            },
            chooseLoginType: function () {

            },
            sayHello: function () {
                alert('TASK_ITEM:HELLO')
            },
            clickBtn: function () {
                this.$emit("btn-click");
            }
        },
        computed: {}
    }

</script>

<style lang="sass">
    @import "task.scss";
</style>