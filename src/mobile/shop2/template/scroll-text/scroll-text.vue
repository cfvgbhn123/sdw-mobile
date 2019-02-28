<!--
绑定手机提示框
-->

<template>

    <section class="news-tips-container">
        <!--<img src="images/laba.png" class="laba">-->
        <div class="laba"></div>
        <div class='scroll-cont' ref="scroll"></div>
    </section>


</template>

<script>

    function scrollTextFn(config) {

        this.id = config.id || 'undefined';
        this.el = config.el;
        this.scroll_width = document.documentElement.clientWidth * 0.86 >> 0;
        this.current_scroll_width = 0;
        this.current_index = 0;
        this.textArry = config.texts || [];
        this.isLoop = config.isLoop || true;
        this.text_dom_width = 0;
        this.delTime = config.delTime || 1000;
    }

    scrollTextFn.prototype.init = function () {

        if (this.textArry.length == 0) return;

        this.el.innerHTML = "<div class='scroll-texts-cont'><div class='text'></div></div>";

        this.text_dom = this.el.querySelector('.text');

        this.start();
    };

    scrollTextFn.prototype.start = function () {
        if (this.current_index == this.textArry.length) {
            if (this.isLoop) this.current_index = 0;
            else return;
        }

        this.text_dom.innerHTML = this.textArry[this.current_index] + '';

        this.text_dom.style.transform = 'translate3d(' + this.scroll_width + 'px,0,0)';
        this.text_dom.style.webkitTransform = 'translate3d(' + this.scroll_width + 'px,0,0)';
        this.text_dom.style.display = 'block';

        this.text_dom_width = this.text_dom.offsetWidth;
        this.current_scroll_width = this.scroll_width;

        requestAnimationFrame(this.timerFn.bind(this));
        this.current_index++;

    };

    scrollTextFn.prototype.timerFn = function () {
        if (this.current_scroll_width > -(this.text_dom_width + 20)) {
            this.current_scroll_width--;
            this.text_dom.style.transform = 'translate3d(' + this.current_scroll_width + 'px,0,0)';
            this.text_dom.style.webkitTransform = 'translate3d(' + this.current_scroll_width + 'px,0,0)';
            requestAnimationFrame(this.timerFn.bind(this));
        } else {
            this.text_dom.style.display = 'none';
            setTimeout(this.start.bind(this), this.delTime);
        }
    };

    export default {
        name: 'user-info',
        data: function () {
            return {};
        },

        mounted: function () {
            this.$on('start', function (texts) {
                this.start(texts);
            });
        },
        // created: function () {
        //
        // },
        props: ['text'],
        methods: {
            start: function (texts) {
                // console.log('start1111');
                // var texts = ['hfjhdsfhdksj', 'hdsjkfhsdjkhfjkd', 'hggdsjkfdsjk'];
                this.$nextTick(function () {
                    var myText = new scrollTextFn({
                        el: this.$refs.scroll,
                        texts: texts
                    });
                    myText.init();
                });
            },
        },
        computed: {},
        watch: {}
    }

</script>

<style lang="sass">

    @import "scroll-text.scss";

</style>