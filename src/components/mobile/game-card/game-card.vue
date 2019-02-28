<template>

    <div class="my-game-item">
        <!--游戏的封面-->

        <div class="game-cover" @click.stop='checkGameSate("play",item.id,item)'>
            <div class="game-play-time">{{transDate(item.time)}}</div>
            <!--<img :src="item.bIcon" alt="">-->
            <img :data-src="item.bIcon" data-loaded="0">
        </div>

        <div class="game-title" @click.stop='checkGameSate("",item.id,item)'>{{item.name}}</div>


        <!--游戏的其他详细数据【需要具体的展现】-->
        <div class="game-data-info"
             :data-length="infoList.length"

             v-if="transGameInfo()">
            <div class="data-type"
                 v-for="i in infoList"
                 :data-index="i.type">{{i.value}}
            </div>

        </div>
    </div>

</template>

<script>

    /**
     * 没有【暂无数据】：-1
     * 段位：1
     * 胜率：2
     * 局数：3
     * 战斗力：4
     * 等级：5
     * 关卡：6
     * 积分：7
     * 星星：8
     * 金币速度：9
     */

        // 游戏关系类型对应表（后台给出）
    var gameTypeMap = {
            0: null,
            1: [
                {
                    type: 5, /*对应的icon类型*/
                    _key: 'level' /*读取数据的字段*/
                }, {
                    type: 4,
                    _key: 'power'
                }
            ],
            2: [
                {
                    type: 6,
                    _key: 'level'
                }
            ],
            3: [
                {
                    type: 5,
                    _key: 'level'
                }
            ],
            4: [
                {
                    type: 7,
                    _key: 'level'
                }
            ],
            5: [
                {
                    type: 9,
                    _key: 'level'
                }
            ],
            6: [
                {
                    type: 8,
                    _key: 'level'
                }
            ]
        };

    export default {
        name: 'game-card',
        data: function () {
            return {
                infoList: []
            };
        },
        props: ['item'],
        methods: {
            transGameInfo: function () {
                var result = [];
                var v = gameTypeMap[this.item.scoleType];
                var flag = false;
                /*最终是true的话，表示有1个或2个数据*/

                if (v) {
                    // 生成标签数据
                    for (var i = 0; i < v.length; i++) {
                        var item = {};

                        item.type = v[i].type;
                        item.value = this.item[v[i]._key];

                        var _f = !!item.value;  // false 表示没有数据, true表示有数据

                        if (_f) {
                            result.push(item);
                        }

                        flag = flag || _f;
                    }
                }

                if (result.length === 0 || !flag) {
                    result = [{
                        type: -1,
                        value: '暂无数据'
                    }];
                }

                this.infoList = result;
                
                this.$nextTick(function () {
//                    console.log(this.infoList)
                });

                return true;
            },

            // 跳转到相应的页面处理
            goLink: function (link) {
                var openObj = {
                    link: link,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                };
                SDW_WEB.openNewWindow(openObj);
            },

            /**
             * 检查游戏的状态
             * @param type
             * @param id
             */
            checkGameSate: function (type, id, item) {

                var hasLogin = SDW_WEB.USER_INFO.uid;
                var targetUrl = SDW_PATH.GAME_URL(type, id);

                var openObj = {
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                };

                if (type === 'play') {

                    // flag [2017-11-01 16:58:19]
//                    if (item && item.screen) {
//                        openObj.landscape = true;
//                        targetUrl += '&screen=' + item.screen;
//                        openObj.link = targetUrl;
//                    }

                    openObj = SDW_WEB._checkWebViewObject(openObj, item);

                    // 玩游戏
                    if (hasLogin) {
                        // 打开玩游戏的界面
                        SDW_WEB.openNewWindow(openObj);
                    } else if (SDW_WEB.onShandw) {
                        // 闪电玩登录
                        SDW_WEB.sdw.openLogin({
                            success: function () {
                            }
                        });
                    } else {
                        // 普通短信登录
                        this.__showLoginPage();
                    }

                } else {
                    // 打开游戏的详情，不需要登录*********
                    SDW_WEB.openNewWindow(openObj);
                }
            },

            playGame: function () {


            },

            transDate: function (date) {

                if (!date) return null;

                var NOW_TIME = +new Date();

                var obj = new Date(date), dT = NOW_TIME - date,
                    year = obj.getFullYear(), month = obj.getMonth() + 1,
                    day = obj.getDate();

                if (dT < 24 * 60 * 60 * 1000) {

                    // 显示时间形式   25秒前  |  16分钟前  |  1小时前
                    if (dT < 60 * 60 * 1000) {

                        if (dT < 1000 * 10) return '刚刚玩过';

                        if (dT < 60 * 1000) return (dT / 1000 >> 0) + '秒前玩过';

                        return (dT / ( 60 * 1000) >> 0) + '分前玩过';

                    }

                    return (dT / ( 60 * 60 * 1000) >> 0) + '时前玩过';
                }


//                if (month < 10) month = '0' + month;
//                if (day < 10) day = '0' + day;

                return year + '/' + month + '/' + day + '玩过';
            }
        },
        computed: {}
    }

</script>


<style lang="sass">
    @import "./game-card.scss";
</style>