/*
 * @Author: cq 
 * @Date: 2017-09-27 11:27:10 
 * @Last Modified by: cloud
 * @Last Modified time: 2019-04-03 21:25:13
 */
<!-- 首页顶部 -->
<template>
  <div class="top-info-container">
    <div class="left"></div>
      <div class="middle">
          <a :href="home" ><span class="colSpace" @click="gotoTop">首页</span></a>
          <span class="colSpace" @click="getDownload">下载APP</span>
          <span class="colSpace" @click.stop="getGift">礼包</span>
          <!-- <span class="colSpace" @click="getConDialog">联系客服</span> -->
          <span class="colSpace" @click="showRealDialog">实名认证</span>
          <span class="colSpace" @click="getConDialog">客服&商务</span>
          <!-- <span>保存桌面</span> -->
     </div>
     <!-- <transition name="fade">
        <div class="contact-container" :style="realNameContainer">
            <top-realname @close-realname="closeRealName"></top-realname>
        </div>
    </transition> -->
    <div class="realname-container" :style="realNameContainer" v-if="isShowRealName">
        <top-realname @close-realname="closeRealName" :realInfo="realInfo"></top-realname>
    </div>
      <div class="right"><!-- :style='rightR' -->
          <img v-if="usrInfo.avatar&&usrInfo.avatar!='undefined'" :src='usrInfo.avatar' alt="用户图像">
          <img v-else src='../../index/images/d-avatar.png' alt="用户图像">
          <span v-if='usrInfo.nick'>
              <span>{{usrInfo.nick}}</span>
              <span> | </span>
              <span @click.stop="unLogin">退出</span>
          </span>
          <span v-else @click="login"  :style='rightR1'>登录</span>
      </div>
  </div>
</template>
<style lang="sass" scoped>
.top-info-container {
    position: relative;
    width: 100%;
    height: 80px;
    background: #151c24;
    .left {
        position: absolute;
        top: 50%;
        margin-top: -18px;
        width: 239px;
        height: 36px;
        background: url('./img/logo.png');
    }
    .middle {
        a {
            color: #5e6a78;
        }
        margin: 0 214px 0 324px;
        height: 100%;
        line-height: 80px;
        color: #5e6a78;
        font-size: 17px;
        span:hover {
            color: #d5d6d7;
        }
    }
    .right {
        position: absolute;
        top: 0;
        right: 0;
        line-height: 80px;
        color: #5e6a78;
        font-size: 15px;
        text-align: right;
       img {
           vertical-align: middle;
           width: 34px;
           height: 34px;
           border-radius: 17px;
       } 
       >span {
          
           margin-left: 20px;
           :nth-child(3) {
            display: inline-block;
            border-width: 4px;
            cursor: pointer;
           }
       }
    }
}
.colSpace {
    cursor: pointer;
    display: inline-block;
    margin-right: 35px;
}
.realname-container{
    position: fixed;
    top: 0;
    left: 0;
    visibility: hidden;
    opacity: 0;
    background-color: rgba(10, 14, 18, .6);
    z-index: 1000
}
</style>
<script>
// var topRealname = require('../components/top-realname/realname.vue');
import topRealname from '../top-realname/realname.vue'
import bus from '../../index/js/eventBus';
    export default {
        data: function() {
            return {
              home: APP.APP_ROOT,
              realNameContainer: {
                display:'none'
                },
                isShowRealName: false,
                realInfo: {}
            }
        },
        components: {
            topRealname
        },
        computed: {
           rightR: function () {
               if(!this.usrInfo.nick) {
                   console.log('未登录');
                   return {
                        width: '90px'
                   }
               }
           },
           rightR1: function(){
                if(!this.usrInfo.nick) {
                   return {
                        cursor: 'pointer'
                   }
               }
           }
        },
        props: ['usr-info'],
        methods: {
            login: function () {
                var self = this;
                self.$emit("login-dialog", "", "");
                bus.$emit("get-qrcode");
            },
            unLogin: function () {
               localStorage.clear();
               sessionStorage.clear();
                // SDW_WEB.Store.clearAll();
                window.location.reload();
            },
            getDownload: function () {
                this.$emit("download-dialog");
            },
            getRealNameDialog: function () {
                // this.$emit("realname-dialog");
            },
            showRealDialog: function () {
                this.isShowRealName = true;
                var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
                var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
                this.realNameContainer = {
                    width: WIDTH+'px',
                    height: HEIGHT+'px',
                    visibility: 'visible',
                    opacity: 1,
                    display: "block"
                };
                //关闭下载界面
                // this.downloadApp = false;
            },
            closeRealName: function () {
                this.isShowRealName = false;
                this.realNameContainer={
                    display: 'none'
                };
            },
            getConDialog: function () {
                this.$emit("contact-serv");
            },
            getGift: function () {
                this.$emit("gift-page");
            },
            //首页打开下载页面后，点击首页菜单关闭下载界面
            gotoTop: function () {
                this.$emit("close-d-top");
            }
        }
    }
</script>