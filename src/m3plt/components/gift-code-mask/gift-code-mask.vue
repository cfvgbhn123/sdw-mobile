<!--游戏礼包的模板-->
<template>


    <div class="gift-code-mask">


        <div class="code-container">
            <div class="gift-close" @click.stop="hideMask()"></div>
            <div class="gift-code">{{giftCode.code}}</div>
            <div class="gift-game" @click.stop.self="gotoGame()"></div>
        </div>

    </div>

</template>

<script>
    // import tipsDialog from '../tips-dialog/tip.vue';
    import Fn from '../../index/js/Fn';
    export default {
        name: 'gift-code-mask',
        data: function () {
            return {
                msg: 'gift-code-mask.vue',
            }
        },

        props: ['gameItem', 'gift-code', 'games-modal'],
        methods: {
            hideMask: function () {
                this.$emit('hide-code');
            },
            onMouseOver: function () {
                this.$emit('on-mouse-over', 'giftListData', this.gameItem);
            },

            checkGiftState: function () {

                /* if (this.giftCode) {

                    alert(this.giftCode);

                } else {
                    alert('开始领取');
                    this.giftCode = 11

                } */

            },
            gotoGame: function () {
                this.hideMask();
                this.authToGame(this.giftCode);
            },
            checkOpenGame: Fn.checkOpenGame,
            authToGame: Fn.authToGame,
            getQuery: Fn.getQuery,
            findGame: Fn.findGame
        },
        components: {
            // tipsDialog: tipsDialog
        },
        computed: {
            giftNum: function () {

                return (this.gameItem.num / this.gameItem.count * 100).toFixed(1) + '%'
            }
        }
    }
</script>


<style lang="sass" scoped>
   .gift-code-mask {
    position: relative;
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(0, 0, 0, .6);
    top: 0;
    left: 0;
    z-index: 999999;
}
.gift-close {
    position: absolute;
    top: 25px;
    right: 50px;
    cursor: pointer;
    width: 18px;
    height: 18px;
    overflow: hidden;
    background-image: url('./imgs/gift-close.png');
}
.code-container {
  width: 452px;
  height: 392px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: url("imgs/gift-bg-cover.png") 100% no-repeat;
  background-position:  0 0;
  transform: translate3d(-50%, -50%, 0);
  .gift-code {
    position: absolute;
    width: 100%;
    height: 40px;
    line-height: 40px;
    bottom: 182px;
    left: 0;
    user-select: text;
    color: #fff;
    font-size: 15px;
    text-align: center;
  }
  .gift-game {
    position: absolute;
    bottom: 77px;
    left: 50%;
    transform: translateX(-50%);
    width: 152px;
    height: 52px;
    cursor: pointer;
  }
}
</style>