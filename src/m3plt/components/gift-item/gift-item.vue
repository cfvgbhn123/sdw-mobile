<!--游戏礼包的模板-->
<template>


    <div class="gift-item-container"
         @mouseover="onMouseOver()"
    >

        <div class="gift-cont-normal" v-show="!tap">
            <div class="gift-g-info ellipsis">{{gameItem.name}}</div>
            <div class="gift-time">已领取<span>{{giftNum}}</span></div>
        </div>


        <div class="gift-select" v-show="tap">

            <img :src="gameItem.icon" class="s-b-icon">

            <div class="gift-g-name ellipsis">{{gameItem.myGameName}}</div>
            <div class="gift-g-info ellipsis">{{gameItem.name}}</div>
            <div class="gift-time ellipsis">已领取<span>{{giftNum}}</span></div>

            <div class="gift-game-btn" @click.stop="checkGiftState()">领取</div>
        </div>

    </div>

</template>

<script>
    export default {
        name: 'gift-game-item',
        data: function () {
            return {
                msg: 'gift-game-item.vue',
                giftCode: null,
            }
        },

        props: ['gameItem', 'tap'],
        methods: {
            onMouseOver: function () {
                this.$emit('on-mouse-over', 'giftListData', this.gameItem);
            },

            checkGiftState: function () {

                if (this.giftCode) {

                    alert(this.giftCode);

                } else {
                    alert('开始领取');
                    this.giftCode = 11

                }

            }
        },
        computed: {
            giftNum: function () {

                return (this.gameItem.num / this.gameItem.count * 100).toFixed(1) + '%'
            }
        }
    }
</script>


<style lang="sass">
    @import "./gift-item.scss";
</style>