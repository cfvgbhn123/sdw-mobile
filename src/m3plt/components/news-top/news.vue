<template>
  <div class="news-list-item-container">
      <div class="news-item">
          <a :href="newsList.link" target="_blank">
                <span class="news-ct">{{newsList.ct}}</span>
          </a>
      </div>
       <span>{{time}}</span>
  </div>
</template>
<style lang="sass">
.news-list-item-container {
    position: relative;
    .news-item {
        line-height: 30px;
        height: 30px;
        width: 85%;
        font-size: 14px;
        overflow: hidden;
        color: #fff;
        a {
            color: #fff;
        }
    }
    >span {
        position: absolute;
        font-size: 16px;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        color: #5e6a78;
    }
}
.news-ct {
    
}
</style>
<script>
export default {
  data: function() {
      return {

      }
  },
  props: ['newsList'],
  computed: {
      time: function () {
          var date = new Date(this.newsList.time);
          return ""+(date.getMonth()+1)+"."+date.getDate();
      }
  }
}
</script>
