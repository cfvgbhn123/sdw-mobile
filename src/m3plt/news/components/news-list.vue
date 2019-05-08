<template>
  <div class="news-lists">
    <img class="n-list-img" :src="_newsItem.gIcon" @click.self="gotoN(_newsItem)">
    <a class="new-title" target="_blank" :href="_newsItem.link">{{_newsItem.ct}}</a>
    <div class="new-infos">{{_newsItem.sub}}</div>
    <div class="news-b-date">{{date}}</div>
    <div class="news-s-date">{{year}}</div>
</div>
</template>
<style lang="sass" scoped>
.news-lists {
    height: 100px;
    padding: 20px 0;
    border-bottom: 1px solid #2c3947;
    position: relative;
   .n-list-img {
       height: 100px;
       width: 160px;
       position: absolute;
       top: 20px;
       left: 0;
       cursor: pointer;
    }
    a:hover {
    color: #aaaaaa;
    }
    .new-title {
    height: 40px;
    line-height: 40px;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    position: absolute;
    top: 20px;
    left: 180px;
    }
    .new-infos {
    width: 670px;
    font-size: 14px;
    color: #fff;
    line-height: 25px;
    max-height: 60px;
    overflow: hidden;
    position: absolute;
    top: 65px;
    left: 180px;
    }
    .news-b-date {
    color: #9f9f9f;
    font-size: 16px;
    position: absolute;
    height: 60px;
    line-height: 60px;
    top: 30px;
    right: 0;
    }
    .news-s-date {
    color: #9f9f9f;
    font-size: 16px;
    position: absolute;
    height: 30px;
    line-height: 30px;
    bottom: 30px;
    right: 0;
    }
}
</style>
<script>
export default {
  data: function() {
      return {

      }
  },
  props: ['news-item'],
  methods: {
      gotoN: function (item) {
          window.open(item.link);
      }
  },
  computed: {
      _newsItem: function () {
          return this.newsItem;
      },
      year: function() {
          return new Date(this.newsItem.time).getFullYear();
      },
      date: function () {
          var myDate = new Date(this.newsItem.time);
          return (myDate.getMonth()+1) + "-" + myDate.getDate();
      }
  }
}
</script>
