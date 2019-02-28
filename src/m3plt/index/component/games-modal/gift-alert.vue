<template>
  <div class="gift-p-container" :style="giftMask" v-if = "giftPAlert">
      <div class="gift-p-box">
          <div class="close-g" @click.self.stop="closeGift"></div>
          <div class="gift-t">
              <img :src="giftInfo.imgUrl" :alt="giftInfo.title">
              <span>{{giftInfo.title}}</span>
          </div>
          <div class="gift-l" v-for="(item, i) in giftInfo.gifts" :key="item.id"> 
            <div class="gift-l-t">
                <span>{{item.name}}</span>
                <span>{{item.num}}人已经领取</span>
                <div class="gift-l-i">{{item.info}}</div>
            </div>
            <div class="gift-btn1" v-if="!giftCode[i]" @click.self.stop="getGiftP(item,i)">领取</div>
            <div class="gift-btn2" v-else>
                <div>{{giftCode[i]}}</div>
                <div>双击复制礼包码</div>
            </div>
          </div>
      </div>
  </div>
</template>
<style lang="sass" scoped>
.gift-p-container {
    position: fixed;
    top: 0;
    left: 0!important;
    background: rgba(1, 0, 0, .5);
    z-index: 10000;
    .gift-p-box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 570px;
        height: 500px;
        background: url('../../images/gift-p.png') 100% no-repeat;
        overflow: auto;
        .close-g {
            position: absolute;
            top: 0;
            right: 0;
            width: 40px;
            height: 40px;
            background: url("../../images/close-g.png") center/16px 16px no-repeat;
            cursor: pointer;
        }
        .gift-t {
            position: relative;
            margin: 0 30px 0 40px;
            line-height: 109px;
            border-bottom: 1px solid #e5e5e5;
            font-size: 18px;
            font-weight: bold;
            img {
                vertical-align: middle;
                width: 81px;
                height: 81px;
                border-radius: 2px;
            }
            span {
                position: absolute;
                left: 97px;
                top: 30px;
                line-height: initial;
            }
        }
        .gift-l {
            position: relative;
            height: 90px;
            margin: 0 30px 0 40px;
            border-bottom: 1px solid #e5e5e5;
            .gift-l-t {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            }
            span:nth-child(1) {
                font-size: 18px;
                font-weight: bold;
            }
            span:nth-child(2) {
                font-size: 14px;
                font-weight: bold;
                color: #fe9047;
            }
            .gift-l-i {
                margin-top: 14px;
                font-size: 14px;
                color: #a0a9b3;
            }
            .gift-btn1 {
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                width: 64px;
                line-height: 31px;
                border: 1px solid #ff7222;
                border-radius: 13px;
                color: #ff7222;
                font-size: 15px;
                text-align: center;
                cursor: pointer;
            }
            .gift-btn2 {
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                color: #99a4b0;
                font-size: 15px;
                text-align: center;
                div:nth-child(1) {
                    line-height: 30px;
                    border: 1px solid #99a4b0;
                    border-radius: 13px;
                    user-select: text;
                }
                div:nth-child(2) {
                    font-size: 14px;
                }
            }
        }
    }
}
</style>
<script>
import bus from '../../js/eventBus';
var $ = require('../../libs/jquery-3.1.0.min');
export default {
  data() {
      return {
        giftMask: "",
        giftPAlert: false,
        giftInfo: {
            title: "",
            imgUrl: "",
            gifts: []
        },
        checkBtn: true,
        giftCode: {}
    }
  },
  methods: {
      getGiftP: function (item, index) {
        var self =this;
        this.checkBtn = false;
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
        SDW_WEB.getAjaxData(postUri, function (data) {
            if(data.result === 1) {
                //储存礼包码
                self.$set(self.giftCode, ''+index, data.code)
            }if(data.result === 0) {
                // self.$emit("got-code", '您已经领取过礼包！');
            }
        });
      },
      closeGift: function () {
          this.giftPAlert = false;
          this.giftInfo.gifts.splice(0, this.giftInfo.gifts.length);
          this.giftCode = {};
      }
  },
  mounted: function () {
    var self = this;
    self.giftMask = {
        width: APP.width + 'px',
        height: APP.height + 'px'
    };
    bus.$on('gift-p-alert', function (params) {
        self.giftPAlert = true;
        $.ajax({
            url: 'https://platform.shandw.com/gameinfo?gid='+params,
            success: function (data) {
                var dataT = (typeof data === "object") ? data : JSON.parse(data);
                self.giftInfo.title = dataT.info.name;
                self.giftInfo.imgUrl = dataT.info.icon;
                dataT.gift.forEach(function(el) {
                    self.giftInfo.gifts.push(el);
                });
            }
        })
    })
  }
}
</script>

