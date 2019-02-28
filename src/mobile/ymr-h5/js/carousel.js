function Banner() {
    var json = [
        { //tu1
            translateX: '42',
            translateY: '140',
            transform: 'scale(0.8)',
            zIndex: 6,
            opacity: 0.2
        },
        { // tu2
            translateX: '112',
            translateY: '90',
            transform: 'scale(0.9)',
            zIndex: 8,
            opacity: 0.6
        },
        {  //tu3
            translateX: '180',
            translateY: '60',
            transform: 'scale(1)',
            zIndex: 10,
            opacity: 1
        },
        { // tu4
            translateX: '282',
            translateY: '90',
            transform: 'scale(0.9)',
            zIndex: 8,
            opacity: 0.6
        },
        { // tu5
            translateX: '406',
            translateY: '140',
            transform: 'scale(0.8)',
            zIndex: 6,
            opacity: 0.2
        }
    ];
    var jieliu = true;

    function px2rem(px, designWidth) {
        // if( !designWidth ){
        //     designWidth = parseInt(hotcss.designWidth , 10);
        // }

        return parseInt(px, 10) / 32;
    }

    var carouselDom = document.querySelectorAll('.carousel ul li');

    function addCss() {
        for (var i in json) {
            var translateX = px2rem(json[i].translateX, 750) + 'rem';
            var translateY = px2rem(json[i].translateY / 2, 750) + 'rem';
            var translate = 'translate(' + translateX + ',' + translateY + ')';
            carouselDom[i].style.zIndex = json[i].zIndex;
            carouselDom[i].style.webKitTransform = carouselDom[i].style.transform = json[i].transform + translate;
            carouselDom[i].style.opacity = json[i].opacity;
            carouselDom[i].style.transition = 'transform 0.5s ease-in-out 0s';
            carouselDom[i].style.webKitTransition = '-webkit-transform 0.5s ease-in-out 0s';
        }
    }


    addCss();
    function cycle() {
        if (jieliu) {
            json.push(json.shift());
            addCss();
        }
    }


    setInterval(function () {
        cycle();
    }, 3000);

}

module.exports = Banner;