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

    <div class="l-game-cont">
        
        <div class="l-g-cover">

            <!--开始游戏-->
            <a @click.stop="authToGame(gameItem)" class="start-game-cover"></a>
            <img :src="gameItem.bIcon" alt="">

            <div :class="['q-code-border', {'m3plt-q-code-border': onM3plt || onM3pltGame}, {'m3plt-q-code-border': fromM3plt}]" v-show="showQCode">
                <div class="q-code-flash"></div>
                <div class="q-code-cont" ref="myCode"></div>
            </div>

        </div>
        <div class="l-g-info">

            <a class="l-g-i-title" @click.stop="gotoDetail(gameItem)">
                {{gameItem.name}}
            </a>

            <!--正常的展示星级-->
            <div class="l-g-star" v-if="iType === 'star'">
                <i :class="item" v-for="item in starLists"></i>
                <span class="s-n">{{sN}}</span>
                <span class="l-n">{{lN}}</span>
            </div>

            <!--展示我玩过的时间-->
            <div v-if="iType === 'time'" class="l-g-i-time">
                {{transDate(gameItem.time)}}
            </div>

            <!--二维码 鼠标的事件监听-->
            <div class="q-code"
                 @mouseover.self='qCodeOver()'
                 @mouseout.self='qCodeOut()'
            ></div>

        </div>

    </div>

</template>

<script>
    import CheckOpenGame from '../../../components/js/CheckOpenGame';
    var TransDate = require('../../../components/js/TransDate.js');
    import Fn from '../../../index/js/Fn';
    export default {
        name: 'l-game-item',
        data: function () {
            return {
                msg: 'i am l-game-item!',
                showQCode: false,
                hasQCode: null,
            }
        },
        props: ['gameItem', 'iType', 'games-modal', 'on-m3plt', 'from-m3plt', 'on-m3pltGame'],
        methods: {
            // 跳转详情页采用相对路径处理
            gotoDetail: function (item) {
                this.$emit('go-detail', item.id)
            },
            transDate: function (time) {
                return TransDate(time);
            },
            qCodeOver: function () {

                var self = this;
                this.showQCode = true;

                if (!self.hasQCode) {

                    var dom = self.$refs.myCode;
                    var qcode = new QRCode(dom, {
                        width: 94,
                        height: 92
                    });

                    // 梦平台二维码扫一扫，只能在口袋中打开
                    // var src = 'http://www.shandw.com/m/game/?gid=' + self.gameItem.id + '&channel=' + SDW_WEB.channel + '&from_plt=m3plt';
                    var src = CheckOpenGame.createQCode(self.gameItem.id);
                    qcode.makeCode(src);
                    self.hasQCode = true;
                }

            },
            qCodeOut: function () {
                this.showQCode = false;
            },
            checkOpenGame: Fn.checkOpenGame,
            authToGame: Fn.authToGame,
            getQuery: Fn.getQuery,
            findGame: Fn.findGame
        },
        computed: {
            /**
             * 根据数据计算星级的类型
             * @return {Array}
             */
            starLists: function () {

                var _star = this.gameItem.star || this.gameItem.vStar || 0;

                // 星级数量为 0~10 的整型
                var star = Math.max(0, _star);
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
            },
            sN: function () {
                var _star = this.gameItem.star || this.gameItem.vStar || 0;
//                this.gameItem.vStar = this.gameItem.vStar || 0;
                return _star / 2 >> 0;
            },
            lN: function () {
                var _star = this.gameItem.star || this.gameItem.vStar || 0;
//                this.gameItem.vStar = this.gameItem.vStar || 0;
                var ln = _star % 2;
                return ln === 0 ? '.0' : '.5';
            },
            gameUrl: function () {
                return 'http://www.shandw.com/pc/game/?gid=' + this.gameItem.id;
            }
        }
    }

</script>

<style lang="sass" scoped>
    @import "./game-item.scss";
</style>