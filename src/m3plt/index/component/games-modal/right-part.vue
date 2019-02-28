<!--

游戏悬浮层
-->

<template>
        <div  :class="info.isPlaying?'right-part ':'right-part slide-in-right'" ref="gameBox">
            <div class="do-box do-box-1">
                <!-- <div class="close-btn" @click="closeModal()"></div> -->
                <div class="mix-btn" @click="mixModal()"></div>
            </div>
            <div class="games-container" v-if="info.gamePlayList.length">
                <game-container :gameInfo="item" :index ="i"  :modalInfo="info"  v-for="(item, i) in info.gamePlayList" :key="item.id"></game-container>
                <!-- <div class="screen-box" v-for="(item, i) in info.gamePlayList" v-if="item.screen&&i===0" :key="item.id">
                    <game-container :gameInfo="item" :modalInfo="info"></game-container>
                </div>
                <div class="no-screen" v-for="(item, i) in info.gamePlayList" v-if="!info.gamePlayList[0].screen&&!item.screen" :key="item.id">
                    <game-container :gameInfo="item" :modalInfo="info" ></game-container>
                </div> -->
            </div>
            <div class="menu-container">
                <div class="icon-box" :style="box1"  @mouseleave.self.stop="changeMenuO1">
                    <img src="../../images/download-ico.png" alt="下载APP" :class="{'img-hidden' : imgIcon1}"  @mouseenter.stop.self="changeMenuI1">
                    <div :class="['con-moveover', 'con-moveover1', {'con-moveover11': imgIcon2}]"></div>
                    <div :class="['con-moveover2', {'con-moveover22': imgIcon3}]"></div>
                </div>
                <div class="icon-box gift-box" :style="box2"  @mouseleave.stop.self="changeMenuO2">
                    <img src="../../images/gift-ico.png" alt="游戏礼包" :class="{'img-hidden': imgGift1}" @mouseenter.self.stop="changeMenuI2">
                    <div :class="['con-moveover', 'con-moveover3', {'con-moveover31': imgGift2}]"></div>
                    <div class="con-moveover4" v-for="(item,i) in info.gamePlayList" :key="item.id">
                        <img class="game-i" :src="item.icon" :alt="item.name">
                        <div class="game-n">{{item.name}}</div>
                        <div class="gift-num">（共{{item.giftNum}}款礼包）</div>
                        <div class="gift-btn" @click.self.stop="getGift(item.id, item.giftNum)">点击获取游戏礼包</div>
                    </div>
                </div>
                <div class="icon-box" :style="box3" @mouseleave.self.stop="changeMenuO3">
                    <img src="../../images/contact-ico.png" alt="联系客服" :class="{'img-hidden' : contactIcon1}" @mouseenter.self.stop="changeMenuI3">
                    <div :class="['con-moveover', 'con-moveover5', {'con-moveover51': contactIcon2}]"></div>
                    <div :class="['con-moveover6', {'con-moveover61': contactIcon3}]"></div>
                </div>
            </div>
        </div>
</template>

<script>
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
                setTimeout(function () {
                    self.box1 = {
                    height: '54px'
                    }
                }, 1000);
            },
            changeMenuI2: function () {
                var self = this;
                this.imgGift1 = true;
                this.imgGift2 = true;
                self.box2 = {
                    height: 54+189*(self.info.gamePlayList.length) + 'px'
                }
            },
            changeMenuO2: function () {
                var self = this;
                this.imgGift1 = false;
                this.imgGift2 = false;
                setTimeout(function () {
                    self.box2 = {
                        height: '54px'
                    }
                }, 600);
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
                setTimeout(function () {
                    self.box3 = {
                        height: '54px'
                     }
                }, 1000);
            }
        },
        mounted: function () {

        }
    }

</script>

<style lang="sass">
    @import "right.scss"
</style>