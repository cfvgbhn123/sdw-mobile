/*
 * @Author: cq 
 * @Date: 2017-10-09 11:17:52 
 * @Last Modified by: cq
 * @Last Modified time: 2017-12-21 10:20:16
 */
<template>
  <div class="login-container">
    <div class="login-mask"></div>
    <div class="login-choose-cont">
      <!-- 处理pc-ad -->
      <ul v-if="typeof pcAd !='undefined'&&pcAd.not" class="top-tabs" id="tabs" ref="tabs">
        <li class="subs" :class="{'select':true, 'normal': true}">手机登录</li>
      </ul>
      <ul v-else class="top-tabs" id="tabs" ref="tabs" @click.stop="switchTab">
        <li class="subs" :class="{'select':tabL.isSelect, 'normal': tabL.isNormal}" data-index=0>扫码登录</li>
        <li class="subs" :class="{'select':tabR.isSelect, 'normal': tabR.isNormal}" data-index=1>手机登录</li>
        <li v-if="isClose" id="login-close" class="sprite login-close" @click="loginClose"></li>
      </ul>
      
      <div v-if="(typeof pcAd =='undefined')||(typeof pcAd !='undefined'&&!pcAd.not)" class="subs-cont" :style="isQrcode">
        <div class="s-tips">手机扫一扫登入</div>
        <div id="ewm">
          <div id="reQ" ref='reQ'>重新生成</div>
          <i class="start-lines2 tl2"></i>
          <i class="start-lines2 tr2"></i>
          <i class="start-lines2 bl2"></i>
          <i class="start-lines2 br2"></i>
        </div>
      </div>
      <div :class="['subs-cont', phoneLogin ? 'show': 'hide', {'show': (typeof pcAd !='undefined')&&pcAd.not}]">
        <div id="loginForm">
          <input type="text" placeholder="输入手机号" v-model="myPhone">
          <input type="text" placeholder="输入验证码" v-model="myCode">
          <div id="getCode" class="codenormal" @click="getPhoneCode">{{codeTips}}</div>
        </div>
        <div id="loginBtn" class="btns" @click="goLogin">
          <span class="l">登</span>
          <span class="r">录</span>
        </div>
      </div>
      <div class="subs-cont">
        <iframe id="dh-iframe"></iframe>
      </div>
      <div class="others-login">
        <div class="others-text">其他方式登录</div>
        <ul class="login-icon" id="login-auth" @click.stop="onLogin">
          <li class="sprite qq" :class="{'mar-left': (typeof pcAd !='undefined')&&pcAd.not}" id="qq"></li>
          <li v-if="(typeof pcAd =='undefined')||(typeof pcAd !='undefined'&&!pcAd.not)" class="sprite weixin" id="weixin"></li>
          <li class="sprite weibo" id="weibo"></li>
          <li class="sprite dh" :class="{'mar-right': (typeof pcAd !='undefined')&&pcAd.not}" id="dh"></li>
        </ul>
      </div>
      <!-- 提示 -->
      <tips-dialog :mytips = "mytips"></tips-dialog>
    </div>
  </div>
</template>
<style lang="sass" scoped>
@import './assets/icons.css';
.login-container {
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(0, 0, 0, .6);
  top: 0;
  left: 0;
  visibility: hidden;
  opacity: 0;
  transition: .34s;
  z-index: 99999999998;
  .login-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .login-choose-cont {
    width: 470px;
    height: 480px;
    background: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
  .top-tabs {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
  }
  .top-tabs .subs {
    flex-grow: 1;
    line-height: 60px;
    text-align: center;
    cursor: pointer;
    font-size: 17px;
  }
  .select {
    background: #fff;
    color: #000;
  }
  .normal {
    background: #f0f0f0;
    color: #969696;
  }
  #login-close {
    position: absolute;
    //width: 60px;
    //height: 60px;
    top: 0;
    border: 16px solid #3e4143;
    right: -60px;
    background-color: #3e4143;
    transition: 0.2s;
    cursor: pointer;
  }
  #login-close:hover {
    border: 16px solid #ff3831;
    background-color: #ff3831;
  }
  .subs-cont {
    width: 100%;
    height: 256px;
    display: none;
  }
  .start-lines2 {
    width: 20px;
    height: 20px;
    position: absolute;
  }
  $lineColor: #ff6644;
  .tl2 {
    border-left: 2px solid $lineColor;
    border-top: 2px solid $lineColor;
    top: -17px;
    left: -17px;
  }
  .tr2 {
    border-right: 2px solid $lineColor;
    border-top: 2px solid $lineColor;
    top: -17px;
    right: -17px;
  }
  .bl2 {
    border-left: 2px solid $lineColor;
    border-bottom: 2px solid $lineColor;
    bottom: -17px;
    left: -17px;
  }
  .br2 {
    border-right: 2px solid $lineColor;
    border-bottom: 2px solid $lineColor;
    bottom: -17px;
    right: -17px;
  }
  .others-login {
    width: 360px;
    margin: 0 auto;
    position: absolute;
    left: 55px;
    bottom: 26px;
  }
  .others-text {
    width: 210px;
    height: 20px;
    font-size: 18px;
    color: #b7b6b6;
    line-height: 20px;
    position: relative;
    text-align: center;
    margin: 0 auto;
    background: #fff;
  }
  .others-text:after {
    content: '';
    width: 360px;
    height: 1px;
    background: #e0e0e0;
    position: absolute;
    top: 10px;
    left: -75px;
    z-index: -1;
  }
  .login-icon {
    margin-top: 20px;
    width: 360px;
    height: 68px;
    display: flex;
    justify-content: space-between;
    //justify-content: space-around;
    li {
      cursor: pointer;
    }
  }
  .s-tips {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #b7b6b6;
    font-size: 17px;

  }
  #reQ {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .8);
    cursor: pointer;
    color: #fff;
    line-height: 160px;
    text-align: center;
  }
  #ewm {
    width: 170px;
    height: 170px;
    border: 15px solid #fff;
    display: block;
    margin: 0 auto;
    position: relative;
  }
  #ewm img {
    display: block;
    width: 100%;
    height: 100%;
  }
  #loginForm {
    width: 360px;
    margin: 0 auto;
    margin-top: 30px;
    position: relative;
    input {
      width: 100%;
      display: block;
      height: 20px;
      line-height: 20px;
      font-size: 18px;
      padding-top: 30px;
      padding-bottom: 10px;
      border: none;
      outline: none;
      color: #333333;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 10px;

    }
    #getCode {
      height: 50px;
      font-size: 17px;
      line-height: 50px;
      border-radius: 6px;
      position: absolute;
      padding: 0 20px;
      right: -10px;
      bottom: -10px;
      color: #676767;
      background: #f0f0f0;
      cursor: pointer;
      border: 10px solid #fff;
    }
  }
  #loginBtn {
    width: 360px;
    height: 55px;
    line-height: 55px;
    color: #fff;
    font-size: 22px;
    font-weight: bold;
    background: #ff6644;
    text-align: center;
    margin: 0 auto;
    border-radius: 5px;
    margin-top: 37px;
    cursor: pointer;

    .l {
      margin-right: 15px;
    }
    .r {
      margin-left: 15px;
    }
  }
}
.icon-ok {
  background-image: url('../../index/images/ok.png');
}

.icon-error {
  background-image: url(../../index/images/error.png);
}

.icon-loading {
  background-image: url(../../index/images/loading.png);
}
.qq {
    width: 65px;
    height: 65px;
    background-position: -293px -343px;
}
.weixin {
    width: 65px;
    height: 65px;
    background-position: -301px -276px;
}
.weibo {
    width: 65px;
    height: 65px;
    background-position: -435px -289px;
}
.dh {
    width: 65px;
    height: 65px;
    background-position: -427px -356px;
}
li {
    list-style: none;
}
.sprite {
    display: inline-block;
    overflow: hidden;
    background-repeat: no-repeat;
    background-image: url('../../index/images/icons.png');
}
.hide {
  display: none!important;
}
.show {
  display: block!important;
}
.mar-left {
  margin-left: 30px;
}
.mar-right {
  margin-right: 30px;
}
</style>
<script>
import tipsDialog from '../tips-dialog/tip.vue';
import bus from '../../index/js/eventBus';
import Fn from '../../index/js/Fn';
import CheckInfo from '../../index/js/check';
export default {
  data: function() {
    return {
      isQrcode: "display: block",
      hasQrcode: "",
      tabL: {
        isSelect: true,
        isNormal: false
      },
      tabR: {
        isSlect: false,
        isNormal: true
      },
      phoneLogin: false,
     /*  tipContent: "提示", */
     /*  myTips: {
        visibility: 'visible',
        opacity: 1
      }, */
      myPhone: '',
      myCode: '',
      getCodeFlag: 0,
      mytips: {
        ok: false,
        error: true,
        ct: "",
        isShow: false
      },
      RES_TIME: "",
      timer: null,
      codeTips: '获取验证码',
      isClose: true
    }
  },
  computed: {

  },
  props: ['app', 'pc-ad'],
  methods: {
    onLogin: function(e) {
      if (e.target.id === "dh") {
        var self = this;
        var t = (+new Date()) / 1000 >> 0;
        var postUri = SDW_WEB.URLS.addParam({
          channel: SDW_WEB.channel,
          appid: 1396987728,
          token: faultylabs.MD5('SDW' + 1396987728 + this.app.guid + t),
          callbackurl: encodeURIComponent('http://www.shandw.com/login/dhlogin.html?channel=' + SDW_WEB.channel)
        }, false, HTTP_USER_STATIC + 'dhlogin');
        SDW_WEB.getAjaxData(postUri, function(data) {
          // self.src = data.loginurl + "?token=" + data.token + "&time=" + data.time + "&regurl=" + encodeURIComponent('http://www.shandw.com/login/dhlogin.html?channel=' + SDW_WEB.channel) + "&denycallbackurl=" + encodeURIComponent('http://www.shandw.com/login/dhlogin.html?channel=' + SDW_WEB.channel);
          var src = data.loginurl + "?token=" + data.token + "&time=" + data.time + "&regurl=" + encodeURIComponent('http://www.shandw.com/login/dhlogin.html?channel=' + SDW_WEB.channel) + "&denycallbackurl=" + encodeURIComponent('http://www.shandw.com/login/dhlogin.html?channel=' + SDW_WEB.channel);
          sessionStorage['DH_AUTH_URL'] = location.href;
          self.$emit("on-login", e.target.id, src);
        });
      } else {
        console.log("授权登录", e.target.id);
        this.$emit("on-login", e.target.id);
      }
    },
    loginClose: function(params) {
      this.$emit("login-close", "loginClose");
    },
    createQ: function() {
      if (!APP.qrcode) {
        APP.qrcode = new QRCode(document.querySelector('#ewm'), {
          width: 160,
          height: 160
        });
      }
      var gid = SDW_WEB.URLS.queryUrl['gid'] || 1;
      var src = 'http://www.shandw.com/pc/auth/qAuth.html?channel=' + SDW_WEB.channel +
        '&unitid=' + SDW_WEB.guid +
        // '&unitid=' +'df1cbe3efd7486d280306abe62cccda1' +
        '&gid=' + gid +
        '&os=' + APP.os +
        '&w=' + APP.width +
        '&h=' + APP.height +
        '&m=' + (+new Date());
      APP.qrcode.clear();
      APP.qrcode.makeCode(src);
      this.qLoginData();
      //显示二维码
      if (this.$refs.tabs.childNodes[0].className.indexOf('subs select') > -1) {
        // this.isQrcode = true;
      }
      this.$refs.reQ.style.display = 'none';
    },
    qLoginData: function() {
      var self = this;
      // 等待扫描中...
      var t = +new Date() / 1000 >> 0;
      var postUri = SDW_WEB.URLS.addParam({
        channel: SDW_WEB.channel,
        unitid: SDW_WEB.guid,
        token: faultylabs.MD5(SDW_WEB.guid + t + 'b30e0224d659cfac' + SDW_WEB.guid + SDW_WEB.channel),
        t: t,
        os: APP.os,
        tg: 0,
        w: APP.width,
        h: APP.height
      }, false, HTTP_USER_STATIC + 'pcauthget');
      // 等待服务端的验证；
      Fn.getAjaxData(postUri, function(data) {
        if(data.result === 1) {
          self.loginSuccessFn(data);
        }
      })
    },
    loginSuccessFn: function(data) {
      _indexView.loginShow = {
        'visibility': 'hidden',
        'opacity': 0
      };
      var usrInfo = {
        avatar: data.avatar,
        fl: data.fl,
        nick: data.nick,
        otoken: data.token,
        sex: data.sex,
        uid: data.id,
        day: data.day,
        month: data.month,
        result: data.result,
        secheme: +new Date(),
        year: data.year
      }
      usrInfo.token = faultylabs.MD5('' + SDW_WEB.channel + usrInfo.uid + usrInfo.secheme + usrInfo.otoken)
      SDW_WEB.USER_INFO = usrInfo;
      //登录信息
      var USER_DATA = {
        nick: usrInfo.nick || usrInfo.uid,
        avatar: usrInfo.avatar
      };
      CheckInfo.checkUsrData(_indexView.usrInfo, USER_DATA);
      SDW_WEB.Store.set(SDW_WEB.localItem, usrInfo, true);
      //获取用户游戏信息
      Fn.getMyData({
        channel: SDW_WEB.channel,
        uid: usrInfo.uid,
        sec: usrInfo.secheme,
        token: usrInfo.token,
        type: 1,
        flag: 1
      }, 'pltmain', function(data) {
        // 获取我最近玩过的
        _indexView.myGameListData = data.recent.splice(0, 4);
      });
      //打开游戏授权后直接登录
      APP.loginCallback&&APP.loginCallback();
    },
    switchTab: function(e) {
      var self = this;
      var index = parseInt(e.target.dataset.index);
      switch (index) {
        case 0:
          self.tabL = {
            isSelect: true,
            isNormal: false
          };
          self.tabR = {
            isSlect: false,
            isNormal: true
          };
          self.phoneLogin = false;
          self.isQrcode = "display: block";
          break;
        case 1:
          self.tabL = {
            isSelect: false,
            isNormal: true
          };
          self.tabR = {
            isSlect: true,
            isNormal: false
          };
          self.phoneLogin = true;
          self.isQrcode = "display: none";
          break;
      }
    },
    //获取验证码
    getPhoneCode: function () {
      var self = this;
      if (this.getCodeFlag) return;
      
      if (/^\d{11}$/.test(this.myPhone)) {
          self.getCodeFlag = true;
          var times = (+new Date()) / 1000 >> 0;
          var date = new Date().Format("yyyyMMdd");
          var TEL_URL = HTTP_USER_STATIC + 'telcode';
          self.mytips = {
            ok: false,
            error: false,
            ct: "验证码获取中...",
            isShow: true,
            autoHidden: true
          };
          Fn.getMyData({
              imei: SDW_WEB.guid,
              phone: self.myPhone,
              channel: SDW_WEB.channel,
              time: times,
              sign: faultylabs.MD5("SDW" + date + SDW_WEB.channel + SDW_WEB.guid + self.myPhone + times)
          }, 'telcode', function (data) {
              self.RES_TIME = data.time;
              // 验证码获取，启动倒计时
              self.codeTimer();
          }, HTTP_USER_STATIC);
      } else {
          // dialog.show('error', '请输入正确的手机号', 1);
          self.mytips = {
            ok: false,
            error: false,
            ct: "请输入正确的手机号",
            isShow: true,
            autoHidden: true
          };
      }
    },
    // 执行登录
    goLogin: function () {
      var self = this;
      // 校验手机号
      if (/^\d{11}$/.test(this.myPhone)) {

          if (/\b(\d+)$/.test(this.myCode)) {
              var TEL_URL = HTTP_USER_STATIC + 'telcheck';

                Fn.getMyData({
                  imei: SDW_WEB.guid,
                  phone: self.myPhone,
                  channel: SDW_WEB.channel,
                  time: self.RES_TIME,
                  sign: faultylabs.MD5(SDW_WEB.channel + SDW_WEB.guid + self.myPhone + self.RES_TIME + RegExp.$1)
                },'telcheck', function (data) {
                  self.mytips = {
                    ok: false,
                    error: false,
                    ct: "",
                    isShow: true,
                    autoHidden: true
                };
                if(data.result === 1) {
                  self.mytips.ct = "登录成功";
                  self.loginSuccessFn(data);
                }else {
                  self.mytips.ct = data.msg;
                }
              }, HTTP_USER_STATIC);
          } else {
              self.mytips = {
                ok: false,
                error: false,
                ct: "输入正确的验证码",
                isShow: true,
                autoHidden: true
              };
          }
        } else {
            self.mytips = {
              ok: false,
              error: false,
              ct: "请输入正确的手机号",
              isShow: true,
              autoHidden: true
            };
        }

    },
    codeTimer: function () {
      var self = this;
      clearInterval(self.timer);
      var time = 60;
      self.timer = setInterval(function () {
          time--;
          if (time <= 0) {
              clearInterval(this.timer);
              self.codeTips = '获取验证码';
              self.getCodeFlag = 0;
          } else {
              self.codeTips = time + '秒后重新获取';
          }
      }, 1000);
    },
  },
  components: {
    tipsDialog: tipsDialog
  },
  mounted: function() {
    var self = this;
    bus.$on("get-qrcode", function() {
      if((typeof self.pcAd !='undefined')&&self.pcAd.not) return false;
      self.createQ();
    });
    bus.$on("no-close", function() {
      // self.isClose = false;
    });
  },
}
</script>
