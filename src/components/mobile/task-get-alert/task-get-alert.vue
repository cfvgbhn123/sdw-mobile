<!--


-->

<template>

    <!--成就提示框-->
    <div class="task-get-container" v-show="show">

        <div class="mask" @click.stop.self="hideInfo()" v-if="show"></div>

        <template v-if="type=='1'">
            <!--缩放动画-->
            <transition name="scale2">

                <div class="task-get-info" v-if="show">

                    <div class="task-infos-container">
                        <div class="task-name">{{taskItemInfo.title || '任务名称'}}</div>
                        <div class="task-gift">获得<span class="conts-i">{{transCoins(taskItemInfo.coin || 0)}}</span>奖励
                        </div>
                    </div>

                    <slot>
                        <div class="task-get-btn"
                             @click.stop="hideInfo()">知道了
                        </div>
                    </slot>

                </div>

            </transition>
        </template>


        <template v-if="type=='2'">
            <!--缩放动画-->
            <transition name="scale2">

                <div class="task-get-info2" v-if="show">

                    <div class="task-infos-container">
                        <div class="task-gift"><span class="conts-i">{{transCoins(taskItemInfo.coin || 0)}}</span></div>
                        <div class="task-name">奖励已到账</div>
                    </div>

                    <slot>
                        <div class="task-get-btn"
                             @click.stop="hideInfo()">知道了
                        </div>
                    </slot>

                </div>

            </transition>
        </template>


    </div>

</template>

<script>

    export default {

        name: 'task-get-alert',

        data: function () {
            return {
//                show: 0
            }
        },
        props: ['taskItemInfo', 'showInfo', 'typeindex'],
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
                var self = this;
                this.showInfo = 0;
                self.$emit('closetap');
            },

            showTask: function () {
                this.showInfo = 1;
            }
        },
        computed: {
            show: function () {
                return this.showInfo || 0;
            },
            type: function () {
                return this.typeindex || '1';
            }
        }
    }

</script>

<style lang="sass">
    @import "task.scss";
</style>