<template>
<div class="contact-box">
    <div class="close-btn" @click.stop="closeContact"></div>
</div>
</template>
<style lang="sass" scoped>
.contact-box {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
    width: 760px;
    height: 470px;
    background-image: url('./img/top-contact.png');
    background-size: 100% 100%;
    .close-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 60px;
        height: 60px;
        cursor: pointer;
    }
}
@media screen and (max-width: 1600px) {
    .contact-box {
        width: 760px;
        height: 470px;
    }
}
@media screen and (max-width: 1200px) {
    .contact-box {
        width: 532px;
        height: 329px;
    }
}
</style>
<script>
export default {
  data: function(){
      return {

      }
  },
  methods: {
      closeContact: function () {
          this.$emit("close-contact");
      }
  },
  mounted: function () {
  },
}
</script>
