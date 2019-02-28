<!--


绑定手机提示框

bind-callback：绑定成功后的回调函数

{"result":1,"msg":"恭喜你签到成功","checkin":1,"list":[{"num":1000,"type":1,"day":1},{"num":1000,"type":1,"day":2},{"num":1000,"type":1,"day":3},{"num":1,"type":4,"day":4},{"num":1000,"type":1,"day":5},{"num":1000,"type":1,"day":6},{"num":1,"type":4,"day":7}]}

-->


<template>

    <section class="qiandao-container"
             id='qiandao-container'
             @click.stop.self="hideMask()">

        <!--签到内容框-->
        <div class="cont-info">

            <div class="tips-info" v-if="!myMoney">
                老铁，持续签到即可获得{{myMessage}}哦！
            </div>

            <div class="tips-info" v-if="myMoney">
                我的红包金额<span class="money">{{myMoney}}元</span><span class="tixian" @click.stop="goUrl()">提现</span>
            </div>


            <!--签到奖励的列表-->
            <div class="qiandao-list-container">
                <div class="qiandao-list-item"
                     :data-index="item.day"
                     v-for="item in myList">
                    <div class="ylq" v-if="item.checkin"></div>
                    <div :class="item.checkin ? 'qiandao' :''">
                        <div class="qiandao-day">
                            第{{item.day}}天
                        </div>
                        <div class="qiandao-jl">
                            <!--签到素材-->
                            <div :data-type="item.myType" class="c-icon">
                                <img :src="item.icon" alt="" v-if="item.myType === -1">
                            </div>

                            <div class="info">
                                {{item.num}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="close-btn" @click.stop.self="hideMask()" v-if="!hasActivity">确 定</div>

            <div class="close-btn" @click.stop.self="goActivity()" v-if="hasActivity">孵蛋拿钱</div>

        </div>


        <!--签到结果-->
        <div class="res-container"
             v-if="showMoneyRes || showGoldRes || showEggRes"
             @click.stop="hideResContainer()">

            <!--金币-->
            <div class="res-cont-list" v-if="showGoldRes">

                <div class="jb-container">
                    <div class="jb-cover"></div>
                </div>

                <div class="qdcj"></div>
                <div class="res-message">获得闪电币<span>{{showNum}}</span></div>

            </div>

            <!--红包-->
            <div class="res-cont-list" v-if="showMoneyRes">
                <div class="hb-container">
                    <div class="hb-cover">
                        <div class="money-data"><span>￥</span>{{showNum}}</div>
                    </div>
                </div>
                <div class="qdcj"></div>
                <div class="res-message">获得现金红包<span>{{showNum}}</span></div>
            </div>

            <!--圣诞鸡蛋-->
            <div class="res-cont-list" v-if="showEggRes">
                <div class="hb-container">
                    <div class="egg-icon" :data-type="showEggResType"></div>
                </div>
                <div class="qdcj"></div>
                <div class="res-message">获得{{'铜银金'.charAt(showEggResType - 1)}}蛋<span>1个</span></div>
            </div>


        </div>

        <!--下载APP的提示框-->
        <div class="download-app-container"
             @click.self.stop="showDownload=false"
             v-if="showDownload">

            <div class="download-app">

                <div class="close-btn"
                     @click.self.stop="showDownload=false"></div>

                <div class="title">
                    仅限在闪电玩APP提现呦！
                </div>

                <img src="images/appicon.png" class="app-icon">

                <div class="download-btn" @click.stop="downLoadApp()"><span class="d-icon"></span>下载闪电玩APP</div>

                <div class="s-tips">
                    APP环境下更有利于账户安全
                </div>

            </div>

        </div>


    </section>

</template>

<script>


    function _download() {

        function useIframe(url) {
            var ifm = document.querySelector('#download_app_ifm');

            if (ifm) {
                ifm.src = url;
            } else {
                var ifmDom = document.createElement('iframe');
                ifmDom.id = 'download_app_ifm';
                ifmDom.style.display = 'none';
                document.body.appendChild(ifmDom);
                ifmDom.src = url;
            }
        }

        if (SDW_WEB.onIOS) {
            if (SDW_WEB.onKD) {
                callKDMSGToResponse(encodeURI(JSON.stringify({
                    "responseType": 11,
                    "urlScheme": "dhShanDianWan",
                    "downLoadUrl": "https://itunes.apple.com/app/shan-dian-wan/id1177288706"
                })));

            } else {
//                useIframe('https://itunes.apple.com/app/shan-dian-wan/id1177288706');
                location.href = 'https://itunes.apple.com/app/shan-dian-wan/id1177288706';
            }
        } else {

            useIframe('http://dhurl.cn/2InyQr');
//            location.href = 'http://dhurl.cn/2InyQr';
        }
    }


    window.scrollForbFn = function (e) {
        e.preventDefault();
    };

    export default {
        name: 'qiandao-12-25',
        data: function () {
            return {
                showRes: null,
                showGoldRes: false,
                showEggRes: false,
                showMoneyRes: false,
                showDownload: false,
                showNum: '',
                showEggResType: '',
                hasActivity: false,
                myMessage: '红包',
            }
        },

        props: ['list', 'checkin', 'mymoney'],
        computed: {
            myMoney: function () {
                if (!this.mymoney) return 0;
                var numStr = this.mymoney / 100;
                return numStr;
            },

            myList: function () {

                var self = this;
                var res = [];
                for (var i = 0; i < this.list.length; i++) {
                    var item = this.list[i];

                    if (item.icon) {

                        item.myType = -1;
                        // 采用给定的素材
                        self.hasActivity = true;
                        self.myMessage = '金蛋';


                    } else {
                        item.myType = item.type
                    }

                    res[i] = item;
                }
                return res;
            },
//
//            myShow: function () {
//                return this.showmask;
//            }
        },

        watch: {
            checkin: function (nV, oV) {

                if (nV) {
                    var res = this.getResult();
                    this.showMoneyRes = (res.type === 4);
                    this.showGoldRes = (res.type === 1);
                    // flag [2017-12-19 10:49:16] 双蛋类型
                    if (res.type === 6) {
                        this.showEggRes = true;
                        this.showEggResType = res.quality;
                    }
                }

            }
        },
        methods: {

            goActivity: function () {

                var link = location.href;
                if (window._ActivityConfig) {
                    link = window._ActivityConfig.link;
                }

                SDW_WEB.openNewWindow({
                    link: link,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: ''
                });
            },

            hideResContainer: function () {
                this.showGoldRes = false;
                this.showMoneyRes = false;
                this.showEggRes = false;

                this.$nextTick(function () {

                });
            },

            hideMask: function () {
                this.$emit('hide-mask');
            },
            getResult: function () {

                // 取最后一个的签到结果
                for (var i = this.list.length - 1; i >= 0; i--) {
                    var item = this.list[i];
                    if (item.checkin) {
                        this.showRes = item;
                        this.showNum = item.num;
                        return item;
                    }
                }

                return {};
            },
            goUrl: function () {

                if (SDW_WEB.onShandw) {
                    SDW_WEB.openNewWindow({
                        title: '红包提现',
                        link: 'http://www.shandw.com/redPacket/?v=' + SDW_WEB.version,
                        isFullScreen: false,
                        showMoreBtn: true
                    })
                } else {

                    // 显示提示到闪电玩中打开
                    this.showDownload = true;
                }

            },

            downLoadApp: function () {
                _download();
            }
        }
    }

</script>


<style lang="sass">

    @import "qiandao-12-25.scss";

</style>