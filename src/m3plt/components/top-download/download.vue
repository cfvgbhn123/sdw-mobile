<template>
  <div class="download-container"> <!-- @click.stop="closeDialog" -->
    <div class="download-wrap" :style="bg">
      <div class="download-top">
        <a class="btn btn1" :href="goto1" target="_blank"></a>
        <a class="btn btn2" :href="goto2" target="_blank"></a>
      </div>
    </div>
  </div>
</template>
<script>
var HEIGHT = document.documentElement.clientHeight || document.body.clientHeight;
var WIDTH = document.documentElement.clientWidth || document.body.clientWidth;
export default {
  data: function() {
    return {
      bg: {
        "width": WIDTH + "px",
        "height": HEIGHT + "px",
        "overflow": "auto"
      },
      goto1: "https://itunes.apple.com/app/shan-dian-wan/id1177288706",
      goto2: "http://www.shandw.com/app/download/"
    }
  },
  methods: {
    /* closeDialog: function () {
      this.$emit("close-dialog")
    } */
  }
}
</script>
<style lang="sass" scoped>
.download-container {
  position: fixed;
  top: 80px;
  left: 0;
  background: #151d27;
  z-index: 30;
  .download-wrap {
    .download-top {
      position: relative;
      width: 1920px;
      height: 970px;
      margin: 0 auto;
      background: url('./img/bg.png') 0 0/100% 100% no-repeat;
        .btn {
        position: absolute;
        width: 281px;
        height: 83px;
        background: transparent;
        outline: none;
        cursor: pointer;
      }
      .btn1 {
        top: 612px;
        left: 481px;
      }
      .btn2 {
        top: 715px;
        left: 481px;
      }
    }
  }
  
}
</style>