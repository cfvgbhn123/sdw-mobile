<!--单个游戏的组件 ceshi -->


<template>


    <div class="game-list">

        <game-items :game-info="item" class="flex-50" @click.native="sayHello(item)" :data-name="item.name"
                    v-for="item in lists"></game-items>

    </div>

</template>

<script>

    import gameItem from './gameItem.vue'

    export default {
        name: 'gameItem',
        data: function () {
            return {
                lists: [
                    {name: '王座守护者---'},
                    {name: '巴拉巴拉小魔仙'},
                    {name: '精钢葫芦娃---'},
                    {name: '哇哈哈哈----'},
                    {name: '天线宝宝----'}
                ]
            }
        },
        methods: {
            mFn: function () {
                alert('say')
            },
            sayHello: function (item) {
                alert(item.name)
            }
        },
        components: {
            gameItems: gameItem,
        }
    }

</script>

<!--scoped-->
<style lang="sass">

    /*.flex-50 {*/
    /*display: inline-block;*/
    /*width: 50%;*/
    /*}*/

    .game-list {
        font-size: 0;
    }

</style>
