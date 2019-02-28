<!--游戏礼包的模板-->
<template>


    <div class="gift-code-mask"
         @click.stop="hideMask()"
    >


        <div class="code-container">

        </div>


    </div>

</template>

<script>
    export default {
        name: 'gift-code-mask',
        data: function () {
            return {
                msg: 'gift-code-mask.vue',
                giftCode: null,
            }
        },

        props: ['gameItem'],
        methods: {
            hideMask: function () {

            },
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
    @import "./gift-code-mask.scss";
</style>