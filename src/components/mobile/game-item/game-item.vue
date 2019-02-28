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

@event tap-game(type,id)
*********************************************************
"play" ---  点击到【开玩】按钮
*********************************************************

-->

<template>

    <div class="game-list-item" @click.stop="checkAuth('detail',gameItem.id)">

        <!--游戏的封面信息-->
        <div class="game-cover-info">
            <img :data-src="gameItem.cover" data-loaded="0" class="game-list-cover">
            <div class="game-title">{{gameItem.title}}</div>
        </div>

        <template v-if="showMore">

            <div class="tag-list">
                <i class="tags" :class="item"
                   v-for="item in gameItem.tags"></i>
                <!--<i class="tags"></i>-->
            </div>

        </template>
        <!--显示我玩过的时间-->
        <template v-else>

            <div class="game-play-time">{{transDate(gameItem.time)}}</div>

        </template>

        <!--游戏的其他更多信息-->
        <div class="game-more-info">

            <template v-if="showMore">
                <div class="game-info">
                    <!--游戏星级-->
                    <span class="star-list">
                <i :class="item" v-for="(item, index) in starLists"></i>
            </span>

                    <!--玩游戏的人数-->
                    <span class="light-num">{{transformQuantity(gameItem.quantity)}}</span>人在玩
                </div>

                <div class="game-desc">{{gameItem.desc}}</div>
            </template>

            <!--开始玩游戏按钮-->
            <div class="game-btn" @click.self.stop="checkAuth('play',gameItem.id,gameItem.url)" v-if="showMore">开玩</div>
            <div class="game-btn larger" @click.self.stop="checkAuth('play',gameItem.id,gameItem.url)" v-if="!showMore">
                开玩
            </div>
        </div>

    </div>

</template>

<script>

    export default {
        name: 'game-item',
        data: function () {
            return {
                msg: 'i am compB!'
            }
        },
        props: ['gameItem', 'showMore'],
        methods: {

            /**
             * 转换时间
             * @param date
             */
            transDate: function (date) {

                var NOW_TIME = +new Date();

                var obj = new Date(date), dT = NOW_TIME - date, year = obj.getFullYear(), month = obj.getMonth() + 1,
                    day = obj.getDate();

                if (dT < 24 * 60 * 60 * 1000) {

                    // 显示时间形式   25秒前  |  16分钟前  |  1小时前
                    if (dT < 60 * 60 * 1000) {

                        if (dT < 1000 * 10) return '刚刚玩过';

                        if (dT < 60 * 1000) return (dT / 1000 >> 0) + '秒前玩过';

                        return (dT / ( 60 * 1000) >> 0) + '分钟前玩过';

                    }

                    return (dT / ( 60 * 60 * 1000) >> 0) + '小时前玩过';

                }

                if (month < 10) month = '0' + month;
                if (day < 10) day = '0' + day;

                return month + '.' + day + '玩过';
            },

            /**
             * 点击【开完】进行授权校验
             */
            checkAuth: function (type, id, url) {
//                alert('checkAuth' + url);
                this.$emit("tap-game", type, id, url);
            },

            /**
             * 转换人数显示
             * @param num
             */
            transformQuantity: function (num) {

                if (num < 10000) return num;

                if (num < 100000000) {
                    var res = (num / 10000).toFixed(1).split('.');
                    if (res[1] == '0') {
                        return res[0] + '万';
                    }
                    return res[0] + '.' + res[1] + '万';
                }

                if (num < 10000000000) {
                    var res = (num / 100000000).toFixed(1).split('.');
                    if (res[1] == '0') {
                        return res[0] + '亿';
                    }
                    return res[0] + '.' + res[1] + '亿';
                }
            }
        },
        computed: {
            /**
             * 根据数据计算星级的类型
             * @return {Array}
             */
            starLists: function () {

                // 星级数量为 0~10 的整型
                var star = Math.max(0, this.gameItem.star >> 0);
                star = Math.min(10, star);

                var stars = [], pStar = star / 2 >> 0, lStar = star % 2, i;

                // 添加满星个数
                for (i = 0; i < pStar; i++) stars.push('star2');

                // 修正单颗星
                if (lStar == 1) {
                    stars.push('star1');
                    pStar++;
                }

                // 填补剩余的星
                for (i = pStar; i < 5; i++) stars.push('star0');

                return stars;
            }
        }
    }

</script>

<style lang="sass">
    @import "./game-item.scss";
</style>