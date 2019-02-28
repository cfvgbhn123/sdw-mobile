<!--游戏礼包的模板-->
<template>

    <div>
        <div class="alert-game-container"
             @click.stop.self="hideMask()"
             :myUrl=myUrl
             v-if="myUrl">

            <div class="code-container">
                <div class="close-btn" @click.stop.self="hideMask()"></div>
                <div class="qCode-container" ref="myCode"></div>
            </div>

        </div>
    </div>

</template>

<script>

    var CheckOpenGame = require('../js/CheckOpenGame');
    export default {

        name: 'alert-game',
        data: function () {
            return {
                msg: 'alert-game.vue'
            }
        },
        props: ['url'],
        methods: {
            hideMask: function () {
                this.$emit('hide-alert-game');
            },
        },

        computed: {
            myUrl: function () {

                if (!this.url) return '';
                
                var self = this;
                self.$nextTick(function () {

                    var dom = self.$refs.myCode;
                    var qcode = new QRCode(dom, {
                        width: 114,
                        height: 114
                    });

                    // 梦平台二维码扫一扫，只能在口袋中打开
                    var src = CheckOpenGame.createQCode(self.url);
                    qcode.makeCode(src);
                });

                return this.url;
            }
        }
    }
</script>


<style lang="sass">
    @import "./alert-game.scss";
</style>