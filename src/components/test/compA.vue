<template>

    <div class="cp-a">
        <div class='test' @click="sayHello()">hello,{{msg}}</div>
        <div class="desc">我是组件A，在.vue文件中的template中支持一个根元素</div>
        <div>{{mesFather}}</div>
        <!--<img src="../static/1.png" alt="">-->
    </div>

</template>

<script>

    export default {
        name: 'compA',
        data: function () {
            return {
                msg: 'i am compA！Click me'
            }
        },
        props: ['mesFather'],
        methods: {
            sayHello: function () {
                alert(this.msg);
            }
        }
    }

</script>

<!--scoped-->
<style scoped lang="sass">

    /*@import "../compSCSS/compB.scss";*/

    .test {
        background: #39f;
    }

    /*.cp-a {*/
        /*background: url(../static/cj-icon.png);*/
    /*}*/

</style>