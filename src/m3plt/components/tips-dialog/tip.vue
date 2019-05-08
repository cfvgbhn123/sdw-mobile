<template>
  <div class="tips-container" :style="isShow ? '':'display:none'">
      <div class="tip-box">
          <div class="icon" :class="{'iconOK':ok, 'iconError': error}"></div>
          <div class="ct" :class="{'ct-center': !(ok||error)}">{{content}}</div>
      </div>
  </div>
</template>
<style lang="sass" scoped>
.tips-container {
    position: absolute;
    z-index: 20;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 120px;
    font-size: 16px;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, .8);
    border-radius: 5px;
    transition: .34s;
    .icon {
        margin: 8px auto;
        width: 55px;
        height: 55px;
        background-size: 100%;
    }
    .iconOK {
        background: url('../../index/images/ok.png');
    }
    .iconError {
        background: url('../../index/images/error.png');
    }
    .ct {
        padding-top: 5px;
        text-align: center;
        color: #fff;
    }
    .ct-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
@keyframes mytips
{
  0%   {background: rgba(0, 0, 0, .4);display: block;}
  100% {background: rgba(0, 0, 0, .8);display: block;}
}
</style>
<script>
export default {
 /*  name: 'tips-dialog', */
  data: function() {
      return {

      }
  },
  props: ['mytips'],
  computed: {
      ok: function () {
          var temp = this.mytips || {};
          return temp.ok;
      },
      error: function () {
        var temp = this.mytips || {};
        return temp.error;
      },
      content: function () {
          var temp = this.mytips || {};
          return temp.ct;
      },
      isShow: function() {
          var temp = this.mytips || {};
          if(this.mytips.autoHidden) {
              setTimeout(function() {
                  temp.isShow = false;
              }, 2000);
          }
          return temp.isShow;
      }
  }
}
</script>
