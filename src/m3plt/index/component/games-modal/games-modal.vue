<!--

游戏悬浮层
-->

<template>
<!--v-show="info.isPlaying" -->
    <div  class="games-modal"  >

        <div  :class="info.isPlaying?'right-part ':'right-part slide-in-right'" >
            <div class="do-box do-box-1">
                <div class="mix-btn" @click="mixModal()"></div>
                <div class="close-btn" @click="closeModal()"></div>
            </div>
            <div class="games-container" v-if="info.gamePlayList.length" >
                <game-container :gameInfo="item" :modalInfo="info" class="game-box" v-for="item in info.gamePlayList" ></game-container>

            </div>
            <div class="menu-container">
                <!--<div class="icon-box"><img src="../../images/add-ico.png" alt="" @click = "collectGame()"></div>-->
                <div class="icon-box"><img src="../../images/download-ico.png" alt=""></div>
                <div class="icon-box"><img src="../../images/gift-ico.png" alt=""></div>
                <div class="contact-box"></div>
            </div>
        </div>
    </div>


</template>

<script>

    var gameContainer= require('./game-container.vue');

    export default {
        name: 'games-modal',
        data: function () {
            return {
                userInfo:SDW_WEB.USER_INFO,
            }
        },
        props: ['info'],
        components: {gameContainer:gameContainer},
        methods: {
            closeModal:function (index) {
                this.info.isPlaying = false ;
                this.info.gamePlayList = [] ;
                sessionStorage.isPlaying = false ;

            },
            mixModal:function () {
                this.info.isPlaying = false ;
                sessionStorage.isPlaying = false ;
            },
            findGame:function (id,arr) {
                for(var i=0;i<arr.length;i++){
                    if(id == arr[i].id){
                        return i+1 ;
                    }
                };
                return  false;
            },
            openGame:function (index) {
                this.info.isPlaying = true ;
                sessionStorage.isPlaying = true ;
                this.info.gamePlayList[index].playing  = true ;
            },
        },


    }

</script>

<style lang="sass">
</style>