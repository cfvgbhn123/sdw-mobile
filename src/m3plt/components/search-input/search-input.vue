<!--

移动版游戏主页-单个游戏模块

@param gameItem {Object}
*********************************************************
id:           游戏的id
cover:        游戏的封面
title:        游戏的名称
star:         游戏的星级
quantity:     游戏的活跃
desc:         游戏的描述
time:         游戏的时间（showMore为false，显示我玩过的时间）
*********************************************************

@param showMore 是否显示更多信息，用于区别主页和我玩过的

@event tap-game(type,id)
*********************************************************
"play" -  点击到【开玩】按钮
*********************************************************

-->

<template>

    <!--搜索游戏-->
    <div class="search-input-container">
        <input type="text" placeholder="搜索游戏名称" class="input-search" v-model="searchKey" @keyup.8.stop.self ="clearB">

        <!--清除搜索的icon-->
        <div class="clear-search-btn" @click.stop.self="clearAllSearchList()"  v-show="searchKey"></div>

        <!--开始查找游戏-->
        <div class="search-btn" @click.stop.self="searchGame()"></div>
        <tips-dialog :mytips="mytips"></tips-dialog>
    </div>

</template>

<script>
    import tipsDialog from '../tips-dialog/tip.vue';
    export default {
        name: 'search-input',
        data: function () {
            return {
                msg: 'i am search-input.',
                searchKey: '',
                mytips: {
                    ok: false,
                    error: true,
                    ct: "",
                    isShow: false
                },
            }
        },
        props: [],
        methods: {
            // 清除搜索内容
            clearAllSearchList: function () {
                this.searchKey = '';
            },
            searchGame: function () {
                if(!this.searchKey) {
                    /* this.mytips = {
                        ok: false,
                        error: true,
                        ct: "请输入需要搜索的内容",
                        isShow: true,
                        autoHidden: true
                    } */
                    dialog.show('error', '请输入需要搜索的内容', 1);
                    return false;
                }
                this.$emit("search-btn-fn", this.searchKey);
            },
            clearB: function () {
                if(SDW_WEB.onM3pltGame || SDW_WEB.onM3plt) {
                    if(this.searchKey) {
                        this.searchKey = this.searchKey.slice(0, this.searchKey.length-1);
                    }
                }
            }
        },
        computed: {},
        components: {
            tipsDialog: tipsDialog
        }
    }

</script>

<style lang="sass">
    @import "./index.scss";
</style>