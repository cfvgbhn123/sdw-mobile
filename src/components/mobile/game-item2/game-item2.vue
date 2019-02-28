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

    <!--<div class="game-list-item" @click.stop="checkAuth('detail',gameItem.id)">-->
    <div class="game-list-item"
         @click.stop="checkAuth('play',gameItem.id,gameItem)">

        <!--游戏的封面信息-->
        <div class="game-cover-info">
            <img :data-src="gameItem.img" data-loaded="0" class="game-list-cover">
        </div>

        <div class="tag-list">
            <i class="tags" :class="item.cl"
               v-for="item in tags"></i>
        </div>

        <!--游戏的其他更多信息-->
        <div class="game-more-info">

            <div class="g-name">{{gameItem.name}}</div>

            <div class="game-desc">{{gameItem.sub}}</div>
            <!--开始玩游戏按钮-->
            <!--<div class="game-btn" @click.self.stop="checkAuth('play',gameItem.id,gameItem)">开玩</div>-->
        </div>

    </div>

</template>

<script>

    export default {
        name: 'game-item',
        data: function () {
            return {
                msg: 'game-item.vue'
            }
        },
        props: ['gameItem', 'showMore'],
        methods: {
            /**
             * 点击【开完】进行授权校验
             */
            checkAuth: function (type, id, item) {
                this.$emit("tap-game", type, id, item);
            }
        },
        computed: {
            tags: function () {
                var res = [], _tags = this.gameItem.tip.split(',');

                // 大标签的样式对应
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

                if (this.gameItem.gift) {
                    res.push({
                        type: '礼包',
                        cl: 'g-l-4'
                    });
                }

                for (var i = 0; i < _tags.length; i++) {
                    res.push({
                        type: _tags[i],
                        cl: colorMap[_tags[i]]
                    });
                }

                return res;
            }
        }
    }

</script>

<style lang="sass">
    @import "./game-item2.scss";
</style>