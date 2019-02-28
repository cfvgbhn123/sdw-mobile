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

    <!--成就提示框-->
    <div class="task-info-container" v-show="show">

        <div class="mask" v-tap.stop="{methods:hideInfo}" v-if="show"></div>

        <transition name="fade">

            <div class="task-infos" v-if="show">

                <div class="task-name">{{taskItemInfo.title}}</div>
                <div class="task-gift">奖励<span class="conts-i">{{transCoins(taskItemInfo.coin)}}</span></div>
                <div class="desc" v-html="taskItemInfo.info"></div>

                <slot>
                    <div class="login-btn-v3"
                         v-tap.stop="{methods:hideInfo}">知道了
                    </div>
                </slot>

            </div>

        </transition>


    </div>

</template>

<script>

    export default {
        name: 'task-info',
        data: function () {
            return {
//                show: 0
            }
        },
        props: ['taskItemInfo', 'showInfo'],
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

            hideInfo: function () {
                this.showInfo = 0;
            },
            showTask: function () {
                this.showInfo = 1;
            }
        },
        computed: {
            show: function () {
                return this.showInfo || 0;
            }
        }
    }

</script>

<style lang="sass">
    @import "task.scss";
</style>