<template>
    <div :class="info.isPlaying?'left-part':'left-part slide-in-left'">
        <div class="user" @click.stop = "unLogin">
            <img :src=" usrInfo.avatar ||'imgs/avatar.png'" alt="">
            <p> 切换账号</p>
        </div>
        <div class="list-box">
            <div class="game-list" >
                <!--class="game-item"-->
                <div :class="info.isPlaying?'game-item':'game-item slide-in-left'"
                     v-for="(item,i) in info.gamePlayList"
                     v-if="info.gamePlayList"
                     @click="openAllGames(i)" :key="item.id">
                    <img :src ="item.icon" class="game-img">
                    <div class="game-name">{{item.name}}</div>
                    <div class="screen-f" v-if="item.screen">横屏</div>
                </div>
                <div class="game-item addIcon" v-if="info.gamePlayList.length===1" v-for="i in [1,2]" @click="mixModal"></div>
                <div class="game-item addIcon" v-if="info.gamePlayList.length===2" @click="mixModal"></div>
            </div>
        </div>
    </div>
</template>
<script>
import bus from '../../js/eventBus';
    export default {
        name: 'games-modal',
        data: function () {
            return {
                userInfo:SDW_WEB.USER_INFO,
            }
        },
        props: ['info', 'usrInfo'],
        computed: {
            //玩游戏界面刷新保持该界面
            isPlayingF: function () {
                console.log(this.info)
                return sessionStorage.isPlaying;
            }
        },
        methods: {
            openGame:function (index) {
                this.info.isPlaying = true ;
                sessionStorage.isPlaying = true ;
                /*document.querySelectorAll('.game-box')[index].style.margin = 'auto' ;*/
                // document.querySelectorAll('.game-box')[index].style.width = '475px' ;
                this.info.gamePlayList[index].playing  = true ;

            },
            /*打开全部游戏*/
            openAllGames:function (i) {
                //点击横屏游戏只打开横屏
                if(this.info.gamePlayList[i].screen) {
                    this.info.gamePlayList[i].sOn = true;
                    this.info.gamePlayList[i].playing = true;
                    for(var x = 0 ;x < this.info.gamePlayList.length ; x++){
                        if(x !== i) {
                            this.info.gamePlayList[x].sOn = false ;
                            this.info.gamePlayList[x].playing = false;
                        } 
                    }
                }else {
                    for(var x = 0 ;x < this.info.gamePlayList.length ; x++){
                        if(this.info.gamePlayList[x].screen) {
                             this.info.gamePlayList[x].sOn = false ;
                             this.info.gamePlayList[x].playing = false;
                        } else {
                            this.info.gamePlayList[x].sOn = true ;
                            this.info.gamePlayList[x].playing = true;
                        }
                    }
                }
                /* for(var x = 0 ;x < this.info.gamePlayList.length ; x++){
                    this.info.gamePlayList[x].playing = true ;
                    // document.querySelectorAll('.game-box')[x].style.width = '475px' ;
                } */
                this.info.isPlaying = true ;
                sessionStorage.isPlaying = true ;
                sessionStorage.collect = JSON.stringify({
                    data:this.info.gamePlayList
                });
                //横屏游戏存在时，把点击游戏放在数组第一位  此种方式切换回导致游戏刷新
                /* var first = this.info.gamePlayList[i]
                var temp = {
                    gameUri: first.gameUri,
                    icon: first.icon,
                    id: first.id,
                    name:first.name,
                    playing: first.playing,
                    screen: first.screen
                };
                this.info.gamePlayList.splice(i, 1);
                this.info.gamePlayList.unshift(temp); */
            },
            unLogin: function () {
                localStorage.clear();
                sessionStorage.clear();
                var self = this;
                self.$emit("login-dialog", "", "unloginPlay");
                bus.$emit("get-qrcode");
                //游戏页面切换账号不允许关闭登录框
                bus.$emit("no-close");
                //玩游戏界面切换账号后刷新
                APP.unLoginCallback = function () {
                    window.location.reload();
                }
            },
            //点击+按钮最小化
            mixModal:function () {
                this.info.isPlaying = false ;
                sessionStorage.isPlaying = false ;
                /*最小化所有游戏*/
                for(var i = 0 ; i < this.info.gamePlayList.length ; i++){
                    this.info.gamePlayList[i].playing = false ;
                }
            },
        },
        mounted: function () {
        }

    }

</script>

<style lang="sass">
    @import "left.scss"
</style>