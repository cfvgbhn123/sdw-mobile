<!--

移动版游戏主页-单个游戏模块


-->

<template>
    <!--v-show="gameInfo.playing" -->
   <div>
       <div v-show="((gameInfo.screen&&index===0&&gameInfo.playing) || (gameInfo.screen&&gameInfo.sOn))"  :class="gameInfo.playing?'screen-box game-box':'game-box slide-in-top'"  ref="gameBox">
       <div class="do-box do-box-2">
           <span>{{gameInfo.name}}</span>
           <div class="close-btn" @click="closeGame()"></div>
           <!-- <div class="mix-btn" @click="mixGame()" ></div> -->
           <div class="refresh-btn" @click="refreshGame()"></div>
           <div class="cpy-btn" :data-clipboard-text="cpyUrl"></div>
       </div>
       <div class="game-container screen-container">
           <iframe ref="gameContainer" :src="gameInfo.gameUri" frameborder="0" ></iframe>
       </div>
       <div class="code-container">
           <div class="q-code-border" v-show="showQCode">
               <div class="q-code-flash"></div>
               <div class="q-code-cont" ref="myCode"></div>
           </div>
           <div class="q-code"
                @mouseover.self='qCodeOver()'
                @mouseout.self='qCodeOut()'
           ></div>
           <span :class="{'mycolor': changeColor}">手机扫码开玩</span>
       </div>
   </div>
   <div v-show="((!modalInfo.gamePlayList[0].screen&&!gameInfo.screen&&gameInfo.playing) || (!gameInfo.screen&&gameInfo.sOn))"  :class="gameInfo.playing?'no-screen game-box':'game-box slide-in-top'"  ref="gameBox" >
       <div class="do-box do-box-2" >
           <span>{{gameInfo.name}}</span>
           <div class="close-btn" @click="closeGame()"></div>
           <!-- <div class="mix-btn" @click="mixGame()" ></div> -->
           <div class="refresh-btn" @click="refreshGame()"></div>
           <div class="cpy-btn" :data-clipboard-text="cpyUrl"></div>
       </div>
       <div class="game-container">
           <iframe ref="gameContainer" :src="gameInfo.gameUri" frameborder="0" ></iframe>
       </div>
       <div class="code-container">
           <div class="q-code-border" v-show="showQCode">
               <div class="q-code-flash"></div>
               <div class="q-code-cont" ref="myCode"></div>
           </div>
           <div class="q-code"
                @mouseover.self='qCodeOver()'
                @mouseout.self='qCodeOut()'
           ></div>
           <span :class="{'mycolor': changeColor}">手机扫码开玩</span>
       </div>
   </div>
   </div>
</template>

<script>

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
                cpyUrl: ""
            }
        },
        props: ['gameInfo', 'index', 'modalInfo'],

        methods: {
            refreshGame:function () {
                var newUri = this.changeURLPar(this.gameInfo.gameUri,'mySec',new Date().getTime());
                this.gameInfo.gameUri = newUri ;
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

            qCodeOver: function () {

                var self = this;
                this.showQCode = true;

                if (!self.hasQCode) {

                    var dom = self.$refs.myCode;
                    var qcode = new QRCode(dom, {
                        width: 75,
                        height: 75
                    });

                    // 梦平台二维码扫一扫，只能在口袋中打开
                    var src = CheckOpenGame.createQCode(self.gameInfo.id);
                    console.log('src',src);
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
            }
        },
        mounted: function() {
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
        }
    }
</script>

<style lang="sass">
    @import "right.scss"
</style>