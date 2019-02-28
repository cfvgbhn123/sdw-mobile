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


    <div class="game-long-container" @click="checkAuth('',gameItem.id,gameItem.url)">

        <!--游戏的icon-->
        <img :src="gameItem.icon" class="long-icon">

        <!--游戏的名称 & 相应的标签-->
        <div class="g-long-name">
            <span class="g-l-name">{{gameItem.name}}</span>

            <!--根据tip字段来显示标签-->
            <span class="g-l-tag" v-for="i in tags" :class="i.cl">{{i.type}}</span>
            <!--<span class="g-l-tag g-l-blue">首发</span>-->
            <!--<span class="g-l-tag g-l-yellow">礼</span>-->
        </div>

        <!--游戏信息-->
        <div class="g-long-info">
            <span class="g-l-type">{{gameItem.type}}</span>
            <span class="g-l-play"><i class="s-g-l">{{transPvNum(gameItem.vPv)}}</i>人在玩</span>
        </div>

        <!--游戏的描述-->
        <div class="g-long-desc">{{gameItem.sub}}</div>

        <!--玩游戏按钮-->
        <div class="game-btn g-l-right" @click.self.stop="checkAuth('play',gameItem.id,gameItem)">开玩</div>

    </div>

</template>

<script>

    export default {
        name: 'long-game-item',
        data: function () {
            return {
                msg: 'long-game-item.vue'
            }
        },
        props: ['gameItem'],
        methods: {
            /**
             * 点击【开完】进行授权校验
             */
            checkAuth: function (type, id, item) {
                this.$emit("tap-game", type, id, item);
            },

            transPvNum: function (num) {

                num = num || 0;

                var big, small;

                if (num < 10000) return num;

                if (num < 100000000) {
                    big = num / 10000 >> 0;
                    small = (num % 10000) + '';

                    if (small == 0) {
                        return big + '万';
                    }

                    return big + '.' + small[0] + '万';
                }


                if (num < 10000000000) {
                    big = num / 100000000 >> 0;
                    small = (num % 100000000) + '';

                    if (small == 0) {
                        return big + '亿';
                    }

                    return big + '.' + small[0] + '亿';
                }

            }

        },
        computed: {
            tags: function () {

                var colorMap = {
                    '热门': 'g-l-5',
                    '精品': 'g-l-3',
                    '礼包': 'g-l-4',
                    '最新': 'g-l-1',
                    '独家': 'g-l-2',
                    '首发': 'g-l-6',
                    '删档': 'g-l-7',
                    '限号': 'g-l-8',
                    '封测': 'g-l-9',
                };

                var res = [];

                if (this.gameItem.tip) {
                    var _tags = this.gameItem.tip.split(',');
                    for (var i = 0; i < _tags.length; i++) {
                        res.push({
                            type: _tags[i],
                            cl: colorMap[_tags[i]]
                        });
                    }
                }

                if (this.gameItem.gift) {
                    res.push({
                        type: '礼包',
                        cl: 'g-l-4'
                    });
                }

                return res;
            }
        }
    }

</script>

<style lang="sass">

    @import "./long-game-item.scss";
</style>