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
    import Fn from "../../index/js/Fn";
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
                    id: self.gameItem.id,
                    uid: uid,
                    channel: SDW_WEB.channel,
                    gid: self.gameItem.gid,
                    sec: sec,
                    token: faultylabs.MD5(SDW_WEB.channel + uid + sec + token),
                    }, false, HTTP_STATIC + 'getgift');
                Fn.getAjaxData(postUri, function (data) {
                    if(data.result === 1) {
                        self.$emit("get-code", data.code, self.gameItem.gid);
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