<!--移动版游戏主页-单个游戏模块-->
<template>
    <!--v-show="gameInfo.playing"  style="width: 100%;height: 100%"-->
   <div class="full-game-wrapper">
        <div v-show="(((gameInfo.screen==2||gameInfo.screen==3)&&index===0&&gameInfo.playing) || ((gameInfo.screen==2||gameInfo.screen==3)&&gameInfo.sOn))"  :class="[gameInfo.playing?'full-screen-box game-box':'game-box slide-in-top', {'m3plt-screen-container': onM3pltGame}]">
            <div class="do-box do-box-2">
                <span>{{gameInfo.name}}</span>
                <div class="close-btn" @click="closeGame()"></div>
                <!-- <div class="mix-btn" @click="mixGame()" ></div> -->
                <div class="refresh-btn" @click="refreshGame"></div>
                <div class="cpy-btn" :data-clipboard-text="cpyUrl"></div>
            </div>
            <div class="full-game-container" :class="{'m3plt-full-game-container': onM3pltGame}">
                <iframe ref="gameContainer1" v-if="gameInfo.screen==2 || gameInfo.screen==3" :src="gameInfo.gameUri" frameborder="0" ></iframe>
            </div>
            <div class="code-container">
                <div class="q-code-border" v-show="showQCode">
                    <div class="q-code-flash"></div>
                    <div class="q-code-cont" ref="myCode1"></div>
                </div>
                <div class="q-code"
                        @mouseover.self="qCodeOver('1')"
                        @mouseout.self='qCodeOut()'
                ></div>
                <span :class="{'mycolor': changeColor}">手机扫码开玩</span>
            </div>
        </div>
   </div>
</template>

<script>
    var $=require('jquery');
   var CheckOpenGame = require('../../../components/js/CheckOpenGame.js');
    import Clipboard from '../../libs/clipboard.min.js';
    export default {
        name: 'game-container',
        data: function () {
            return {
                playing:true,
                showQCode: false,
                hasQCode: null,
                changeColor: false,
                cpyUrl: "",
                //梦平台游戏内
                onM3pltGame: SDW_WEB.onM3pltGame
            }
        },
        props: ['gameInfo', 'index', 'modalInfo', 'container-width'],

        methods: {
            refreshGame:function (e) {
                var gameCon = this.$refs.gameContainer1 || this.$refs.gameContainer2;
                var newUri = this.changeURLPar(this.gameInfo.gameUri,'mySec',new Date().getTime());
                // this.gameInfo.gameUri = newUri ;
                gameCon.contentWindow.location.replace(newUri);
            },
            mixGame:function () {
                var _t = this ;
                this.gameInfo.playing  = false ;
                setTimeout(function(){
                    _t.$refs.gameBox.style.width = '0px' ;
                    /*_t.$refs.gameBox.style.margin = '0' ;*/
                },500);
                /*判断屏幕上是否还有游戏在玩*/
                var palyingCount  = 0 ;
                for(var i = 0 ;i < this.modalInfo.gamePlayList.length;i++ ){
                    if(this.modalInfo.gamePlayList[i].playing) {
                        palyingCount++ ;
                    }
                }
                if(!palyingCount){
                    this.modalInfo.isPlaying = false ;
                    sessionStorage.isPlaying = false ;
                }
                sessionStorage.collect = JSON.stringify({
                    data:this.modalInfo.gamePlayList,
                })
            },
            closeGame:function () {
                var index = this.findGame(this.gameInfo.id,this.modalInfo.gamePlayList);
                if(index){
                    this.modalInfo.gamePlayList.splice(index-1,1);
                }
                //关闭全屏游戏后判断第一个游戏是否全屏
                if(this.modalInfo.gamePlayList[0]&&this.modalInfo.gamePlayList[0].screen !=2) {
                    //1非全屏游戏
                    this.modalInfo.isFull = false;
                }else {
                    //2全屏游戏
                }
                /*判断屏幕上是否还有游戏在玩*/
                var palyingCount  = 0 ;
                for(var i = 0 ;i < this.modalInfo.gamePlayList.length;i++ ){
                    if(this.modalInfo.gamePlayList[i].playing) {
                        palyingCount++ ;
                    }
                }
                if(!palyingCount){
                    this.modalInfo.isPlaying = false ;
                    sessionStorage.isPlaying = false ;
                }
                sessionStorage.collect = JSON.stringify({
                    data:this.modalInfo.gamePlayList,
                });
            },

            qCodeOver: function (param) {

                var self = this;
                this.showQCode = true;

                if (!self.hasQCode) {

                    var dom = param=='1' ? self.$refs.myCode1 : self.$refs.myCode2;
                    var qcode = new QRCode(dom, {
                        width: 94,
                        height: 92
                    });

                    // 梦平台二维码扫一扫，只能在口袋中打开
                    var src = CheckOpenGame.createQCode(self.gameInfo.id);
                    qcode.makeCode(src);
                    self.hasQCode = true;
                }
                 self.changeColor = true;
            },
            qCodeOut: function () {
                this.showQCode = false;
                this.changeColor = false;
            },
            findGame:function (id,arr) {
                for(var i=0;i<arr.length;i++){
                    if(id == arr[i].id){
                        return i+1 ;
                    }
                };
                return  false;
            },
            checkOpenGame: function (item) {

                item.playing = true ;
                this.gamesModal.isPlaying = true ;
                sessionStorage.isPlaying = true ;
                /*对列表中已存在的游戏不进行操作*/
                if(!this.findGame(item.id,this.gamesModal.gamePlayList) ){
                    if(this.gamesModal.gamePlayList.length < 3){
                        this.gamesModal.gamePlayList.unshift(item) ;
                    }else{
                        this.gamesModal.gamePlayList.pop();// 移除最後一元素*/
                        this.gamesModal.gamePlayList.unshift(item) ;
                    }
                }
                if(!this.findGame(item.id,this.gamesModal.gameIconlist)){
                    if(this.gamesModal.gameIconlist.length < 3){
                        this.gamesModal.gameIconlist.unshift(item) ;
                    }else{
                        this.gamesModal.gameIconlist.pop();// 移除最後一元素*/
                        this.gamesModal.gameIconlist.unshift(item) ;
                    }
                }

            },
            changeURLPar:function (destiny, par, par_value){
                var pattern = par+'=([^&]*)';
                var replaceText = par+'='+par_value;
                if (destiny.match(pattern))
                {
                    var tmp = '/\\'+par+'=[^&]*/';
                    tmp = destiny.replace(eval(tmp), replaceText);
                    return (tmp);
                }
                else
                {
                    if (destiny.match('[\?]'))
                    {
                        return destiny+'&'+ replaceText;
                    }
                    else
                    {
                        return destiny+'?'+replaceText;
                    }
                }
                return destiny+'\n'+par+'\n'+par_value;
            }
        },
        computed: {
            /**
             * 根据数据计算星级的类型
             * @return {Array}
             */

            gameUrl: function () {
                var myUrl = CheckOpenGame.createMyUrl(this.gameItem);
                return myUrl;
            },
            fromM3plt: function () {
                return SDW_WEB.queryParam['from'] === 'm3plt';
            }
        },
        mounted: function() {
            var self = this;
            this.cpyUrl = SDW_PATH.GAME_URL('play', this.gameInfo.id);
            //粘贴复制游戏地址
            var cpy = new Clipboard('.cpy-btn');
            cpy.on('success', function(e) {
                // console.info('Text:', e.text);
                dialog.show('ok', "游戏地址复制成功", 2);
                e.clearSelection();
            });
            cpy.on('error', function(e) {
                // console.error('Action:', e.action);
                dialog.show('error', "抱歉您的浏览器不支持该功能", 2);
            });
        },
        updated: function() {

        }
    }

</script>

<style lang="sass">
    @import "right.scss"
</style>