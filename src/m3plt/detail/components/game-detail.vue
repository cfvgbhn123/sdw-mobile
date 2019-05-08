<template>
  <div class="detail">
      <div class="t">
           <div class="left">
                <img :src="detailInfo.icon" :alt="detailInfo.name">
            </div>
            <div class="middle">
                <div class="name">{{detailInfo.name}}</div>
                <div class="sinfo">{{detailInfo.sInfo}}</div>
                <div class="btn" @click.self="authToGame(detailInfo)">开始游戏</div>
            </div>
            <div class="right">
                <span class="s-n">{{sN}}</span>
                <span class="l-n">{{lN}}</span>
                <span class="words">评分</span>
                <div>
                     <div :class="item" v-for="item in starLists"></div>
                </div>
            </div>
      </div>
        <div class="m">
            <!--  <div class="swiper-container">
                <div class="swiper-wrapper">
                    <div class="swiper-slide" v-for="(item, index) in detailInfo.img ">
                        <img :src="item" data-loaded="0" :alt="detailInfo.name+'游戏图片0'+(index+1)">
                    </div>
                </div>
                <div class="swiper-scrollbar" id="sb1"></div>
            </div> -->
            <div class="swiper-container">
                <div class="swiper-wrapper" style="transition-duration: 0ms;
                transform: translate3d(0, 0, 0);">
                    <div class="swiper-slide"  v-for="(item, index) in myImgs">
                        <img :src = "item">
                    </div>
                </div>
                <!-- Add Scrollbar -->
                <div class="swiper-scrollbar"></div>
            </div>
        </div>
        <div class="info">{{detailInfo.info}}</div>
        <div class="gift">
            <div class="title-container linear-title" style="margin-top: 30px">
                <div class="title cls-title">
                    <div class="cls-tab cls-tab-select" style="font-size: 17px; cursor: initial">礼包</div>
                </div>                              
            </div>
            <div class="gift-b" v-for="(item, i) in giftInfo">
                <div class="gift-circle">
                    <div class="gift-num-p">{{((((item.count-item.num)>>0)/item.count)*100)>>0}}%</div>
                    <div class="gift-num-circle" :data-num="(((item.count-item.num)>>0)/item.count)"></div>
                </div>
                <div class="name">{{item.name}}</div>
                <div class="des">{{item.info}}</div>
                <div class="btn" @click="getGiftCode(item)">领取</div>
            </div>
            <div v-if="giftInfo.length==0" style="color: #fff; margin-top:20px;">暂无礼包</div>
        </div>
    </div>
</template>
<script>
import Fn from '../../index/js/Fn';
export default {
  data:function() {
      return {
      }
  },
  props: ['detail-info', 'gift-info', 'img-l', 'games-modal'],
  methods: {
    getGiftCode: function (item) {
        var self =this;
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
            }else if(data.result === 0) {
                dialog.show('error', '您已经领取过礼包！', 1);
            }else if(data.result === -3) {
                dialog.show('error', '亲，领取礼包要先登录哦！', 2);
            }
        }); */
    },
    checkOpenGame: Fn.checkOpenGame,
    authToGame: Fn.authToGame,
    getQuery: Fn.getQuery,
    findGame: Fn.findGame
  },
  computed: {
       /**
     * 根据数据计算星级的类型
     * @return {Array}
     */
    starLists: function () {

        var _star = this.detailInfo.star || this.detailInfo.vStar || 0;

        // 星级数量为 0~10 的整型
        var star = Math.max(0, _star);
        star = Math.min(10, _star);

        var stars = [], pStar = star / 2 >> 0, lStar = star % 2, i;

        // 添加满星个数
        for (i = 0; i < pStar; i++) stars.push('star2');

        // 修正单颗星
        if (lStar == 1) {
            stars.push('star1');
            pStar++;
        }

        // 填补剩余的星
        for (i = pStar; i < 5; i++) stars.push('star0');

        return stars;
    },
    sN: function () {
        var _star = this.detailInfo.star || this.detailInfo.vStar || 0;
        return _star / 2 >> 0;
    },
    lN: function () {
        var _star = this.detailInfo.star || this.detailInfo.vStar || 0;
        var ln = _star % 2;
        return ln === 0 ? '.0' : '.5';
    },
    myImgs: function () {
       var temp=[];
        if(this.detailInfo.img) {
            var len = this.detailInfo.img.length;
            this.detailInfo.img.forEach(function(e, index) {
               temp.push(e);
            });
            return temp;
        }
        return temp;
    }
  },
  mounted: function () {
    var self =this;
  }
}
</script>
<style lang="sass" scoped>
@import './game-detail.scss'
</style>
