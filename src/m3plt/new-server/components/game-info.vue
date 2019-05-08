<template>
    <div class="game-server" v-show="gameInfo.show">
        <div class="game-img">
            <img :src="gameInfo.bIcon || gameInfo.icon" :alt="gameInfo.name" @click.self="authToGame(gameInfo)">
            <div class="ser-time" v-if="!gameInfo.new">{{gameInfo.serverDateStr}}</div>
            <div class="new-time" v-else>{{gameInfo.serverDateStr}}</div><!--  | <span style="color: #fe8731">提醒</span> -->
            <div :class="['q-code-border', {'m3plt-code-border': onM3plt || onM3pltGame}, {'m3plt-code-border': fromM3plt}]" v-show="showQCode">
                <div class="q-code-flash"></div>
                <div class="q-code-cont" ref="myCode"></div>
            </div>
        </div>
        <div class="game-info">
            <div class="game-t">
                <div @click.stop="gotoDetail(gameInfo)">{{gameInfo.name}}</div>
                <div>{{gameInfo.sName}}</div>
            </div>
            <div class="q-code"
                @mouseover.self='qCodeOver()'
                @mouseout.self='qCodeOut()'
            ></div>
        </div>
    </div>
</template>
<script>
import Fn from '../../index/js/Fn';
var CheckOpenGame = require('../../components/js/CheckOpenGame');
export default {
  data:function() {
      return {
          showQCode: false,
          hasQCode: null,
      }
  },
  props: ['game-info', 'gamesModal', 'on-m3plt', 'from-m3plt', 'on-m3pltGame'],
  methods: {
      // 跳转详情页采用相对路径处理
    gotoDetail: function (item) {
        var id = item.id || item.gid;
        this.$emit('go-detail', id)
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
            // var src = CheckOpenGame.createQCode(self.gameItem.gid);
            var src = CheckOpenGame.createQCode(self.gameInfo.id);
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
  }
}
</script>
<style lang="sass" scoped>
    @import "./game.scss"
</style>