<template>

    <div class="cp-b">
        <div class='test' @click="sayHello()">hello,{{msg}},click me!</div>
        <div class="desc">我是组件B-{{mesFather}}，在.vue文件中的style加入scoped，可以生成一个独立的id属性</div>
        <div class="desc">我可以复用，大家一起合伙开发，提高效率，太棒啦</div>

    </div>

</template>

<script>

    export default {
        name: 'compB',
        data: function () {
            return {
//                mesFather: '',
                msg: 'i am compB!'
            }
        },
        props: ['mesFather'],
        methods: {

            sayHello: function () {
                alert(this.mesFather);
            }

        }
    }

</script>


<style lang="sass">
    @import "../../compSCSS/compB.scss";

    .cp-b {
        /*background: url(../static/1.png);*/
    }
</style>