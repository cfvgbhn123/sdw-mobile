var adManage = {
    bannerSetting:null,
    initAd:function(options){
        sdw.dialogManage&&sdw.dialogManage.init();
        adManage.bannerSetting = options || {};
        if( sdw.params.channel == '12319' || options.channel == '12319'){
            sdw.dynamicLoadCss('https://www.shandw.com/libs/css/styles.css');
            var mask = document.createElement('div');
            var closebtn = document.createElement('div');
            mask.className = 'mask-view' ;
            closebtn.className = 'close-btn';
            mask.appendChild(closebtn);
            closebtn.onclick =function () {
                console.log('点击关闭按钮');
                sdw.dialogManage.show({
                    'title':'是否关闭视频',
                    'msg':'观看完整视频才能获得奖励哦',
                    btn:'取消',
                    callback:function () {
                        console.log('关闭弹窗');
                        adManage.videoView.style.display = 'none' ;
                        adManage.video.pause();
                    }});
            };
            adManage.videoView = mask;
            adManage.closebtn = closebtn;
            return {
                code:'200',
                msg:'广告支持'
            } ;
        }else{
            return {
                code:'101',
                msg:'当前渠道不支持广告'
            } ;
        }
    },

    getAdInfo:function () {
       // options = options || {} ;
        adManage.bannerSetting =adManage.bannerSetting || {} ;
        var self = this ;
        return new Promise(function (resolve,reject) {
            var uid = sdw.params.uid ||  adManage.bannerSetting.uid;
            sdw.postAjaxData(
                'https://platform.shandw.com/youKuTraffic',
                JSON.stringify({
                    "bid": sdw._MD5(String(new Date().getTime())),// "0bb3de1800005cccf79ae34100004e8e",
                    "pid": "uc_youxi_test",
                    "template_id": "uc_test",
                    "image_size": self.bannerSetting.imgsize || "200x200",
                    "os": "android",
                    "is_test":1,
                    "imei":sdw._MD5(uid),
                }),
                function(res) {
                    if (res.result == 1 && res.data.httpStatusCode == 200) {
                        var adData = res.data.model.materialResultDTO;
                        if (adData) {
                            adManage.adInfo = adData;
                            adManage.state = 1 ;
                            resolve(adManage.state);
                        } else {
                            adManage.state = -1 ;
                            resolve(adManage.state);
                        }
                    } else {
                        adManage.state = -2 ;
                        resolve(adManage.state);
                    }
                }
            );
        })

    },
    playRewardVideo:function (options) {
        //sdw.dialogMessage({type:'loading',msg:'视频加载中',fn:'show'}) ;
        sdw.dialogManage.show({
            msg:'视频加载中',
            icon:'loading',
        });
        //return ;
        if(adManage.adInfo && adManage.adInfo.vedioUrl){
            adManage.initVideo(options);
            adManage.adInfo.vedioUrl = null ;
            return ;
        };
        var adInfo =   adManage.getAdInfo().then(function (state) {
            if(state  == 1){
                adManage.initVideo(options);
            }else{
                sdw.dialogMessage({fn:'hidden'}) ;
                options&&options.playFail&&options.playFail('超出广告播放次数') ;
            }
        }) ;
    },
    initVideo:function (options) {
        var img  = new Image() ;
        img.src = adManage.adInfo.feedbackVedioUrl ;
        adManage.video = document.createElement('video') ;
        adManage.video.className =  'ad-container';
        var oldNode = document.querySelector('.ad-container') ;
        if(oldNode) adManage.videoView.removeChild(oldNode);
        adManage.videoView.appendChild(adManage.video);
        adManage.video.src = adManage.adInfo.vedioUrl ;
        adManage.video.style.width = adManage.adInfo.vedioWidth+'px' ;
        adManage.video.style.height = adManage.adInfo.vedioHeight+'px';
        adManage.video.autoplay = 'autoplay';
        adManage.video.controls = 'controls';
        adManage.videoView.style.display = 'block' ;
        adManage.video.oncanplay = function () {
            sdw.dialogManage.hidden();
            adManage.video.play() ;
        }
        // adManage.video.onstalled =function () {
        //     options&&options.playFail&&options.playFail('视频播放碰到了点问题呀') ;
        // }
        adManage.video.onended = function () {
            adManage.videoView.style.display = 'none' ;
            adManage.videoView.removeChild(adManage.video) ;
            options&&options.playComplete&&options.playComplete() ;
        };
        adManage.video.onerror = function () {
            sdw.dialogManage.hidden();
            adManage.videoView.style.display = 'none' ;
            adManage.videoView.removeChild(adManage.video) ;
            options&&options.playFail&&options.playFail('视频播放碰到了点问题') ;
        };
        document.getElementsByTagName('body')[0].appendChild(adManage.videoView);

    },
    displayBanner:function (options) {
        if(adManage.adInfo && adManage.adInfo.imgUrl){
            var img = new Image() ;
            img.src = adManage.adInfo.feedbackUrl ;
            options.displayComplete && options.displayComplete({
                imgUrl:adManage.adInfo.imgUrl,
                clickUrl:adManage.adInfo.clickUrl,
            }) ;
            adManage.adInfo.imgUrl = null ;
            return ;
        };
        var adInfo =   adManage.getAdInfo(options).then(function (state) {
            if(state  == 1){
                var img  = new Image() ;
                img.src = adManage.adInfo.feedbackUrl ;
                options.displayComplete && options.displayComplete({
                    imgUrl:adManage.adInfo.imgUrl,
                    clickUrl:adManage.adInfo.clickUrl,
                }) ;
            }else{
                options&&options.displayFail&&options.displayFail('超出广告播放次数') ;
                return false ;
            }
        }) ;

    },
};

module.exports = adManage;