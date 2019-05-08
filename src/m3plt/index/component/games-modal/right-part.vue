<!--
2018-6-12修改isplaying 为false时去除.right-part,slide-in-righ在梦平台不支持，会有遮罩（又还原回去了，影响3个游戏同时打开，真是日了狗了）
游戏悬浮层
-->

<template>
        <div  :class="[info.isPlaying?'right-part':'right-part slide-in-right', {'m3pltGame-right-part': info.isPlaying&&onM3pltGame}]" ref="gameBox">
            <div class="do-box do-box-1">
                <!-- <div class="close-btn" @click="closeModal()"></div> -->
                <div class="mix-btn" @click="mixModal()"></div>
            </div>
             <!-- v-if="info.gamePlayList.length" -->
            <div :class="['games-container', {'m3pltGame-games-container': onM3pltGame}]" ref="gamesCon">
                <game-container
                    :gameInfo="item"
                    :index ="i"
                    :modalInfo="info"  v-for="(item, i) in info.gamePlayList"
                    :key="item.id"
                    :container-width="conWith">
                </game-container>
                <!-- <div class="screen-box" v-for="(item, i) in info.gamePlayList" v-if="item.screen&&i===0" :key="item.id">
                    <game-container :gameInfo="item" :modalInfo="info"></game-container>
                </div>
                <div class="no-screen" v-for="(item, i) in info.gamePlayList" v-if="!info.gamePlayList[0].screen&&!item.screen" :key="item.id">
                    <game-container :gameInfo="item" :modalInfo="info" ></game-container>
                </div> -->
            </div>
            <div class="menu-container" v-if="!onM3pltGame">
                <div class="icon-box" :style="box1"  @mouseleave.self.stop="changeMenuO1">
                    <img src="../../images/download-ico.png" alt="下载APP" :class="{'img-hidden' : imgIcon1}"  @click.stop.self="changeMenuI1">
                    <div :class="['con-moveover', 'con-moveover1', {'con-moveover11': imgIcon2}]"></div>
                    <div :class="['con-moveover2', {'con-moveover22': imgIcon3}]"></div>
                </div>
                <div class="icon-box" :style="box2" @mouseleave.stop.self="changeMenuO2">
                    <img src="../../images/gift-ico.png" alt="游戏礼包" :class="{'img-hidden': imgGift1}" @click.self.stop="changeMenuI2">
                    <div :class="['con-moveover', 'con-moveover3', {'con-moveover31': imgGift2}]"></div>
                    <div class="con-moveover4" v-if="item.giftNum>0" v-for="(item,i) in info.gamePlayList" :key="item.id">
                        <img class="game-i" :src="item.icon" :alt="item.name">
                        <div class="game-n">{{item.name}}</div>
                        <div class="gift-num">（共{{item.giftNum}}款礼包）</div>
                        <div class="gift-btn" @click.self.stop="getGift(item.id, item.giftNum)">点击获取游戏礼包</div>
                    </div>
                </div>
                <div class="icon-box" :style="box3" @mouseleave.self.stop="changeMenuO3">
                    <img src="../../images/contact-ico.png" alt="联系客服" :class="{'img-hidden' : contactIcon1}" @click.self.stop="changeMenuI3">
                    <div :class="['con-moveover', 'con-moveover5', {'con-moveover51': contactIcon2}]"></div>
                    <div :class="['con-moveover6', {'con-moveover61': contactIcon3}]"></div>
                </div>
            </div>
        </div>
</template>

<script>
    var $=require('jquery');
    var gameContainer= require('./game-container.vue');
    import bus from '../../js/eventBus';
    export default {
        name: 'games-modal',
        data: function () {
            return {
                userInfo:SDW_WEB.USER_INFO,
                myGif: false,
                imgIcon1: false,
                imgIcon2: false,
                imgIcon3: false,
                imgGift1: false,
                imgGift2: false,
                contactIcon1: false,
                contactIcon2: false,
                contactIcon3: false,
                box1: "",
                box2: "",
                box3: "",
                giftNum: 0,
                conWith: 0,
                //梦平台游戏内
                onM3pltGame: SDW_WEB.onM3pltGame
            }
        },
        props: ['info'],
        components: {
            gameContainer: gameContainer,
        },
        computed: {
            //玩游戏界面刷新保持该界面
            isPlayingF: function () {
                return sessionStorage.isPlaying;
            }
        },
        methods: {
            //礼包弹窗
            getGift: function (param1, param2) {
                if(param2 == 0) return false;
                bus.$emit('gift-p-alert', param1);
            },
            closeModal:function (index) {
                this.info.isPlaying = false ;
                this.info.gamePlayList = [] ;
                sessionStorage.isPlaying = false ;
            },
            mixModal:function () {
                this.info.isPlaying = false;
                sessionStorage.isPlaying = false;
                /*最小化所有游戏*/
                for(var i = 0 ; i < this.info.gamePlayList.length ; i++){
                    this.info.gamePlayList[i].playing = false ;
                    this.info.gamePlayList[i].sOn = false ;
                }
            },
            changeMenuI1: function () {
                var self = this;
                this.imgIcon1 = true;
                this.imgIcon2 = true;
                this.imgIcon3 = true;
                self.box1 = { 
                    height: '254px'
                }
            },
            changeMenuO1: function () {
                var self = this;
                this.imgIcon1 = false;
                this.imgIcon2 = false;
                this.imgIcon3 = false;
               self.menuD1 = {
                    transform: 'translateX(500px)'
                };
                self.box1 = {
                    height: '54px'
                }
            },
            changeMenuI2: function () {
                var self = this;
                this.imgGift1 = true;
                this.imgGift2 = true;
                var i=0;
                self.info.gamePlayList.map(function(item, index){
                    if(item.giftNum>0) {
                        i++;
                    }
                });
                if(i==0) {
                    this.imgGift2 = false;
                    dialog.show('error', '游戏暂无礼包哦！', 1)
                }
                self.box2 = {
                    height: 54+189*i + 'px'
                }
            },
            changeMenuO2: function () {
                var self = this;
                this.imgGift1 = false;
                this.imgGift2 = false;
                self.box2 = {
                    height: '54px'
                }
            },
            changeMenuI3: function () {
                var self = this;
                this.contactIcon1 = true;
                this.contactIcon2 = true;
                this.contactIcon3 = true;
                self.box3 = {
                    height: '379px'
                }
            },
            changeMenuO3: function () {
                var self = this;
                this.contactIcon1 = false;
                this.contactIcon2 = false;
                this.contactIcon3 = false;
                self.box3 = {
                    height: '54px'
                }
            }
        },
        mounted: function () {
           var self=this;
           self.conWith = $(".games-container").width()>>0;
        //    document.querySelector("#myOwnTip").innerHTML = "w: "+self.conWith;
        
        },
        updated: function() {
            // console.log($(".no-screen").length, "长度3")
            //游戏布局调整
            (function () {
                //处理游戏界面适配
                var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
                var gamesContainer = $(".games-container");
                var noScreenContainer = $(".no-screen");
                var screenBox = $(".screen-box");
                var gameCon = $(".game-container");
                var screenCon = $(".screen-container");
                if(HEIGHT<880+60) {
                    gamesContainer.css({
                        height: 800 + "px"
                    });
                    noScreenContainer.css({
                        width: 380 + "px"
                    })
                    screenBox.css({
                        width: 800 + "px"
                    })
                    gameCon.css({
                        height: 633 + "px"
                    })
                    screenCon.css({
                        height: 480+ "px"
                    })
                }
            })()
        }
    }
</script>

<style lang="sass">
    @import "right.scss"
</style>