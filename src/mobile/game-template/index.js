/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */
require('./index.scss');
require('../../components/initcss.scss');


var OS = {}, u = navigator.userAgent;
OS.onMobile = !!u.match(/AppleWebKit.*Mobile.*/);

var WIDTH = OS.onMobile ? (document.documentElement.clientWidth || document.body.clientWidth) : 450;
var fontSize = WIDTH / 375 * 16;
document.documentElement.style.fontSize = fontSize + 'px';


// 配置下载的按钮
window.onload = function () {

    document.title = gameConfig.title;

    // 下载按钮的设置


    // 评论图片的配置
    var imageListContainer = document.querySelector('.image-list-container');
    for (var i = 0; i < gameConfig.imageList.length; i++) {
        var img = document.createElement('img');
        img.src = gameConfig.imageList[i];
        imageListContainer.appendChild(img);
    }

    // 创建轮播图
    createBanner(gameConfig.bannerList);

    // 创建图片链接按钮
    var btnImg = document.querySelector('#btnImg');
    btnImg.src = gameConfig.btnImg.btn;
    btnImg.onclick = function (e) {
        location.href = gameConfig.btnImg.link;
    };

    function createBanner(list) {
        var banner = list || [];

        var TEMP_HTML = '<img src=D_IMG class="swiper-slide slider-img" data-index=D_INDEX data-loaded="5">';
        var allInners = '';

        banner.forEach(function (item, index) {
            var inners = TEMP_HTML.replace(/D_IMG/, item).replace(/D_INDEX/, index);
            allInners += inners;
        });

        document.querySelector('#bannercont').innerHTML = allInners;

        setTimeout(function () {

            var config = {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                loop: gameConfig.bannerLoop,
                autoplayDisableOnInteraction: false,
                coverflow: {
                    rotate: 45,
                    stretch: 0,
                    depth: 300,
                    modifier: 1,
                    slideShadows: true
                }
            };


            if (gameConfig.bannerAutoPlay) {
                config.autoplay = gameConfig.bannerAutoPlay;
            }
            new Swiper('.banner-conatiner', config);

        }, 30);

    }

};

