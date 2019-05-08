<template>


    <div class="gift-item" v-show="giftItem.show">

        <div class="gift-top-info">

            <div class="start-game-cover" @click.stop="authToGame(gameItem)"></div>
            <img :src="giftItem.myGameCover" class="gift-bg">

            <div class="gift-game-name ellipsis" @click.stop="gotoDetail(gameItem)">{{giftItem.myGameName}}</div>
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
    import Fn from '../../../index/js/Fn';
    export default {
        name: 'gift-list-item',
        data: function () {
            return {
                msg: 'i am gift-list-item!',
                more: true,
                showLen: 2,
                giftCode: ""
            }
        },
        props: ['giftItem','game-item', 'gamesModal'],
        methods: {
            // 跳转详情页采用相对路径处理
            gotoDetail: function (item) {
                var id = item.id || item.gid;
                this.$emit('go-detail', id)
            },
            showMoreGift: function () {
                this.more = false;
                this.showLen = 9999;
            },
            checkGiftState: function (item) {
                var self = this;
               /*  if (this.giftCode) {

                    alert(this.giftCode);

                } else {
                    alert('开始领取');
                    this.giftCode = 11

                } */
                var sec = APP.guid;
                var token = SDW_WEB.USER_INFO.otoken;
                var uid = SDW_WEB.USER_INFO.uid || SDW_WEB.USER_INFO.id
                var postUri = SDW_WEB.URLS.addParam({
                    id: item.id,
                    uid: uid,
                    channel: SDW_WEB.channel,
                    gid: item.gid,
                    sec: sec,
                    token: faultylabs.MD5(SDW_WEB.channel + uid + sec + token),
                    }, false, HTTP_STATIC + 'getgift');
                Fn.getAjaxData(postUri, function (data) {
                    if(data.result === 1) {
                        self.$emit("get-code", data.code, item.gid);
                    }else if(data.result === 0) {
                        dialog.show('error', '您已经领取过礼包！', 1);
                    }else if(data.result === -3) {
                        dialog.show('error', '亲，领取礼包要先登录哦！', 2);
                    }
                });
                /* SDW_WEB.getAjaxData(postUri, function (data) {
                    if(data.result === 1) {
                        self.$emit("get-code", data.code);
                    }if(data.result === 0) {
                        self.$emit("got-code", '您已经领取过礼包！');
                    }
                }); */
            },
            checkOpenGame: Fn.checkOpenGame,
            authToGame: Fn.authToGame,
            getQuery: Fn.getQuery,
            findGame: Fn.findGame,
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