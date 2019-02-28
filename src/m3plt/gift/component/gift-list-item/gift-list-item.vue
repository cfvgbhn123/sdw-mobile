<template>


    <div class="gift-item" v-show="giftItem.show">

        <div class="gift-top-info">

            <a :href="gameUrl" target="_blank" class="start-game-cover"></a>
            <img :src="giftItem.myGameCover" class="gift-bg">

            <div class="gift-game-name ellipsis">{{giftItem.myGameName}}</div>
            <div class="gift-game-info ellipsis">{{giftItem.myGameSub}}</div>
        </div>

        <div class="g-l-container">

            <div class="gift-list"
                 v-if="idx<showLen"
                 v-for="(i,idx) in giftItem.gifts">
                <div class="gift-name ellipsis">{{i.name}}</div>
                <div class="gift-i">已领取<span> {{(i.num / i.count * 100).toFixed(1) + '%'}}</span></div>
                <div class="gift-info">{{i.info}}</div>
                <div class="gift-game-btn" @click.stop="checkGiftState(i)">领取</div>
            </div>

        </div>


        <div class="show-more-btn"
             @click.stop="showMoreGift()"
             v-if="showMoreBtn">更多礼包<span class="more-icon"></span>
        </div>

    </div>


</template>

<script>

    export default {
        name: 'gift-list-item',
        data: function () {
            return {
                msg: 'i am gift-list-item!',
                more: true,
                showLen: 2,
            }
        },
        props: ['giftItem'],
        methods: {

            showMoreGift: function () {
                this.more = false;
                this.showLen = 9999;
            }
        },

        computed: {

            gameUrl: function () {
                return 'http://www.shandw.com/pc/game/?gid=' + this.giftItem.gid;
            },
            
            showMoreBtn: function () {
                return this.giftItem.gifts.length > 2 && this.more;
            }
        }
    }

</script>

<style lang="sass">
    @import "./gift-list-item.scss";
</style>