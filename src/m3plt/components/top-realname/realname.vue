<template>
<div class="realname-box">
    <tips-dialog :mytips="mytips"></tips-dialog>
    <div class="close-btn iconfont icon-guanbi" @click.stop="closeRealName"></div>
    <div class="contaner-form">
        <div class="realname-content">
            <span class="title">实名认证</span>
            <form class="form-class" v-model="form" ref="form">
                <div class="form-item">
                    <input type="text" :disabled="isDisabled" class="cel-input" v-model="form.idCard" placeholder="请输入身份证号码"  @blur="checkIdCard" />
                    <span class="input-icon iconfont icon-Id"></span>
                    <span v-if="cardMessage" class="err-tips">{{cardMessage}}</span>
                </div>
                <div class="form-item">
                    <input type="text" :disabled="isDisabled" class="cel-input" v-model="form.realName" placeholder="请输入身份证姓名" @blur="checkName" />
                    <span class="input-icon iconfont icon-yonghu"></span>
                    <span v-if="nameMessage" class="err-tips">{{nameMessage}}</span>
                </div>   
                <div class="cel-input button" @click="submitConfirm" v-if="!isDisabled">提交认证</div>        
                <div class="cel-input button disable" :disabled="isDisabled" v-else>{{btnMsg}}</div>        
            </form> 
            <a href="http://inews.shandw.com/a8fef536369e4eabb3091af5b77e444a.html" target="_blank" class="link">防沉迷系统说明</a>
            <span class="tips">*本平台承诺绝不对外公开、透露或编辑此信息</span>
            <span class="tips">*身份信息只能提交一次，不可修改，慎重填写</span>
        </div>
    </div>
</div>
</template>
<style lang="sass" scoped>
.realname-box {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
    width: 660px;
    height: 460px;
    background: rgb(31, 199, 185);
    background: linear-gradient(to right, #1fc7b9 0%,  #40e38d 100%);
    background-size: 100% 100%;
    z-index: 80;
    .close-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 40px;
        cursor: pointer;
        z-index: 30;
        font-size: 40px;
        color: #999;
    }
    .contaner-form{
        width:100%;
        height:100%;
        background: #fff;
        position: absolute;
        left: 10px;
        top: -10px;
        .realname-content{
            width:354px;
            margin: 40px auto 0;
            text-align: center;
            .title{
                font-size: 22px;
                color: #333333;
                font-familay: "Microsoft YaHei";
            }
            .form-item {
                position: relative;
                .input-icon{
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    top: 37px;
                    left: 20px;
                    display: block;
                    color: #999;
                }
                .input-icon:after{
                    content: "|";
                    font-size: 22px;
                    font-weight: 100;
                    line-height: 14px;
                    color: #999999;
                    padding-left: 5px;
                }
                .err-tips {
                    position: absolute;
                    top: 75px;
                    left: 25px;
                    color: #ef4134;
                    font-size: 12px;
                }
                .err-tips:before{
                    content: "x";
                    width: 12px;
                    height:12px;
                    line-height: 12px;
                    display: inline-block;
                    margin-right: 5px;
                    background: #ef4134;
                    border-radius: 50%;
                    color: #ffffff;
                }
            }
            .cel-input {
                width: 100%;
                height: 50px;
                margin: 20px 0 10px;
                line-height: 50px;
                border: 1px solid #999;
                border-radius: 25px;
                text-indent: 50px;
                font-size: 14px;
            }
            .cel-input:focus {
                border: 1px solid #1fc7b9;
                outline: none;
            }
            .button {
                background: linear-gradient(to right, #1fc7b9 0%,  #40e38d 100%);
                border-color: linear-gradient(to right, #1fc7b9 0%,  #40e38d 100%);
                box-shadow: 1px 1px 1px 1px #3cc384;
                color: #FFF;
                border: 0;
                font-size: 18px;
                text-align: center;
                text-indent: 0;
                cursor: pointer;
            }
            .disable {
                background: #ddd;
                background: linear-gradient(to right, #ddd 0%,  #ddd 100%);
                border-color: linear-gradient(to right, #ddd 0%,  #ddd 100%);
                box-shadow: 1px 1px 1px 1px #ddd;
            }
            .link,.tips{
                display:block;
                width:100%;
                line-height: 30px;
                text-align: center;
            }
            .link{
                color: #26cdb0;
                text-decoration: underline;
            }
            .link:before {
                content: '!';
                width: 12px;
                height: 12px;
                display: inline-block;
                margin-right: 5px;
                border: 1px solid #26cdb0;
                border-radius: 50%;
                line-height: 12px;
            }
            .tips {
                color: #999;
            }
            
        }
    }
}
// @media screen and (max-width: 1600px) {
//     .realname-box {
//         width: 760px;
//         height: 470px;
//     }
// }
// @media screen and (max-width: 1200px) {
//     .realname-box {
//         width: 532px;
//         height: 329px;
//     }
// }

</style>

<script>
import tipsDialog  from '../tips-dialog/tip.vue';
export default {
  data: function(){
      return {
        form: {
            idCard: "",
            realName: ""
        },
        mytips: {
            ok: true,
            error: false,
            isShow: false,
            autoHidden: true,
            ct: "success"
        },
        btnMsg: "提交认证",
        cardMessage: "",
        nameMessage: "",
        isDisabled: false,
        postInfo:{}
      }
  },
  props: {
      realInfo: {
          type: Object,
          default: null
      }
  },
  created(){
      this.getUserInfo();
  },
  components: {
      tipsDialog
  },
  methods: {
      closeRealName: function () {
          this.$emit("close-realname");
      },
      submitConfirm: function(){
          this.isDisabled = true;
          
          let flag = this.checkIdCard() && this.checkName()
          var self = this
          if(flag){
              this.postInfo.name = this.form.realName;
              this.postInfo.idcard = this.form.idCard;
              var postUri = SDW_WEB.URLS.addParam(this.postInfo, false, HTTP_STATIC + 'accessRealName');
              SDW_WEB.getAjaxData(postUri,function(data){
                  if(data.result == 1){
                    self.isDisabled = false;
                    self.mytips.isShow = true;
                    self.mytips.ct = "认证成功";
                    setTimeout(function(){
                        self.getUserInfo();
                        self.closeRealName();
                    },1000)
                  }else{
                    self.isDisabled = false;
                    self.mytips.isShow = true;
                    self.mytips.ct = data.msg;
                  }
              })
          }else{
              console.log("false")
          }   
      },
      getUserInfo: function(){
        this.postInfo = {
            channel: SDW_WEB.channel,
            uid: SDW_WEB.USER_INFO.uid || SDW_WEB.USER_INFO.id,
            token: SDW_WEB.USER_INFO.token || SDW_WEB.USER_INFO.otoken,
            sec: SDW_WEB.USER_INFO.secheme,
            fl: SDW_WEB.USER_INFO.fl
        }
        var postUri = SDW_WEB.URLS.addParam(this.postInfo, false, HTTP_STATIC + 'queryAccessRealName');
        var self = this;
        SDW_WEB.getAjaxData(postUri, function(data){
            if(data.result == 1){ // 未认证
                self.isDisabled = false
            }else if(data.result == 2){ //已认证
                self.isDisabled = true;
                self.form.idCard = data.data.idcard.replace(data.data.idcard.substr(4,12), "******");
                self.form.realName = data.data.name;
                self.btnMsg = "已认证";
            }
        })
        
      },
      checkIdCard: function(){
          // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X  
        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
          if(!this.form.idCard){
              this.cardMessage = "身份证号码不能为空";
              return false;
          }else if(!reg.test(this.form.idCard)){
              this.cardMessage = "请输入正确的身份证号码"
              return false;
          }else{
              this.cardMessage = ""
              return true;
          }
      },
      checkName: function(){
          if(!this.form.realName){
              this.nameMessage = "真实姓名不能为空";
              return false;
          }else{
              this.nameMessage = ""
              return true;
          }
      }
  }
}
</script>
<style>
@font-face {font-family: "iconfont";
    src: url('//at.alicdn.com/t/font_1114915_iv2rq2lvcc.eot?t=1553825757199'); /* IE9 */
    src: url('//at.alicdn.com/t/font_1114915_iv2rq2lvcc.eot?t=1553825757199#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAOsAAsAAAAACEAAAANdAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDHAqEBINFATYCJAMQCwoABCAFhG0HPhstBxHVm53IfibYthLyh23h0EgfSWeCCHXZ7Eq+KHLyAIwdE3UEXDt+t+YcsFERqiRnxxb9Q54K6aXpIADOxtSWQJhKvLKrN/QlQAek6lohq4AdxncAaKfcZtSEnDF6w9hNBA3xeQjgyUIhpFadRq1wWMBpAsig/n274zIObEO14BBiFddaZAEBTmfqNWA+/3n5SglxoAQGcG6zPrV7Ue1DyQ8PzYRoAp0oBjSdDzBuAgMUAixIv8pAD0xUKITBewdbygAOh8JUS+U+PIwiRXUUg4P/8kBQDEgMUJkAQClFby4MYQkEPpSTQOHDQyMPibcnO8ADa4EHCjHTHxYMsUxJkqRInpiYIVFG9l0+cdesVL36LJu1Y0Lq3r2WTNg5O23f3ktn756YZvT9+63v3Wv14EGbhw/bimRsnUK9mTX32vh7D7KI/Vujkxy5lUnX3i6d9PjdrGbdnTKtwqUrJ6xI5Zetmrg6Ld4B3ZYtS7v5Yd1tl4QKXb2ffcKFXMWlS1L5nrWo5UFSYHyBAjPTZU83owAIrkiXQsgL9LQrKGlz7CFry+rdZPw47QIZ48d2Uxm1Shd5Z+PHdROoPK9V/NkxunWTjkpZaGvqMZLKytaURVKasvwTxiiUTfHxzavvSf4k+f7q7avnvO3zk5ULLqa6uIB2jU7d+9/9ievc8QZNm+5LlV2qVSNZtepkT7WvaaHlhFs30Y7K/rYNUpMwDPAi001fQWSmmBoA5rV++s3HUbr8kBZdk1b678LHHHh0ecNznogs3ZX/Cnnop66yAmBNNXBa6yKsWqCIpSV/7SwFPB6IpEgKXkxhTK0oaciROgEljsxgcOTCWmIhCAgpBTEcVcFTkLo3h6RkBAax8UABpkogJGM/KEk4D4ZkXMda4nMISMN3iJFMDHjaSMp7huQRN+4OjErQgv5DNNQ55JadqL6jHxvFaTVnvpGHmIYyK/LlC3bIU1wwfHwl4sAxtXCWXoZNQ9AzJTSSBZF+n+eu6osyQ+1kx4FRCVrQf4iGOkf7y67w/Xf0Y6O4oaMn/UYe4uZQZkUH7MXQdeq4lYOHj69EnHqSY2rhLPuwgQWCvvqohEayMCDX73Oll+tqyJY3tW94AvCAz1lRMWIlYNV3VJ2Oqz91Poyzm51MAAAAAA==') format('woff2'),
    url('//at.alicdn.com/t/font_1114915_iv2rq2lvcc.woff?t=1553825757199') format('woff'),
    url('//at.alicdn.com/t/font_1114915_iv2rq2lvcc.ttf?t=1553825757199') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
    url('//at.alicdn.com/t/font_1114915_iv2rq2lvcc.svg?t=1553825757199#iconfont') format('svg'); /* iOS 4.1- */
  }
  
  .iconfont {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .icon-guanbi:before {
    content: "\e633";
  }
  
  .icon-yonghu:before {
    content: "\e638";
  }
  
  .icon-Id:before {
    content: "\e6d7";
  }
  
</style>
