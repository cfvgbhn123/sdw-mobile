var adManage = {
    bannerSetting:null,
    initAd:function(options){
        sdw.dialogManage&&sdw.dialogManage.init();
        adManage.bannerSetting = options || {};
        if( sdw.params.channel == '12319' || options.channel == '12319'){
            sdw.dynamicLoadCss('https://www.shandw.com/libs/css/styles.css?v='+new Date().getTime());
            var mask = document.createElement('div');
            var closebtn = document.createElement('div');
            var intro = document.createElement('div');
            intro.className = 'intro-container';
            intro.innerHTML = '<img src="" />'+
                '<div class="intro-txt"> '+
                '<div class="txt-1"></div>' +
                '<div class="txt-2"></div>'+
                '</div><div class="intro-btn">查看</div>';
            mask.className = 'mask-view' ;
            closebtn.className = 'close-btn';
            closebtn.innerHTML = '关闭视频';
            mask.appendChild(closebtn);mask.appendChild(intro);
            closebtn.onclick = function () {
                console.log('点击关闭按钮');
                sdw.dialogManage.show({
                    'title':'是否关闭视频',
                    'msg':'观看完整视频才能获得奖励哦',
                    btn:'取消',
                    callback:function () {
                        console.log('关闭弹窗');
                        //adManage.video.pause();
                        if(adManage.video){
                            adManage.videoView.style.display = 'none' ;
                            adManage.videoView.removeChild(adManage.video) ;
                            adManage.video = null ;
                        }

                    }});
            };
            intro.onclick = function () {
                if(adManage && adManage.adInfo && adManage.adInfo.clickUrl)
                    window.parent.postMessage(JSON.stringify({
                        postSdwData: true,
                        link: adManage.adInfo.clickUrl,
                        operate: 'to_competition'
                    }), '*');
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
                    "pid": "ali_uc_game_h",
                    "template_id": "ali448x252",
                    "image_size":'448x252',
                    "os": sdw.app.onIOS?'ios':"android",
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
            adManage.initIntro();
            adManage.adInfo.vedioUrl = null ;
            return ;
        };
        var adInfo =   adManage.getAdInfo().then(function (state) {
            if(state  == 1){
                adManage.initVideo(options);
                adManage.initIntro();
            }else{
                sdw.dialogManage.hidden();
                options&&options.playFail&&options.playFail('超出广告播放次数') ;
            }
        }) ;
    },
    initIntro:function () {
        var img = document.querySelector('.intro-container img');
        var title = document.querySelector('.intro-container .txt-1');
        var desc  = document.querySelector('.intro-container .txt-2');
        if(adManage.adInfo){
            img.src = 'http://r1.ykimg.com/051600005CCA5219ADA7B2ABC10DC7BB' || adManage.adInfo.imgUrl;
            if(adManage.adInfo.title){
                var info = adManage.adInfo.title.split('|');
                title.innerHTML = info[0] || '这就是街舞';
                desc.innerHTML = info[0] || '' ;
            }

        }
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
        adManage.video.style.width = '100%' ;
        adManage.video.style.height ='100%';
        adManage.video.autoplay = 'autoplay';
        adManage.video.preload = 'preload';
        //adManage.video.controls = 'controls';
        //adManage.video.enterFullScreen && adManage.video.enterFullScreen() ;
        if (adManage.video.requestFullScreen) {
            adManage.video.requestFullScreen();
        } else if (adManage.video.mozRequestFullScreen) {
            adManage.video.mozRequestFullScreen();
        } else if (adManage.video.webkitRequestFullScreen) {
            adManage.video.webkitRequestFullScreen();
        } else if (adManage.video.msRequestFullscreen) {
            adManage.video.msRequestFullscreen();
        }
        adManage.video.play() ;
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
            options&&options.playComplete&&options.playComplete() ;
            adManage.videoView.removeChild(adManage.video) ;
            adManage.video = null ;

        };
        adManage.video.onerror = function () {
            sdw.dialogManage.hidden();
            adManage.videoView.style.display = 'none' ;
            options&&options.playFail&&options.playFail('视频播放碰到了点问题') ;
            adManage.videoView.removeChild(adManage.video) ;
            adManage.video = null ;

        };
        document.getElementsByTagName('body')[0].appendChild(adManage.videoView);

    },
    displayBanner:function (options) {
        if(adManage.adInfo && adManage.adInfo.imgUrl){
            var img = new Image() ;
            img.src = adManage.adInfo.feedbackUrl ;
            options.displayComplete && options.displayComplete({
                banner:{
                    icon:adManage.adInfo.imgUrl,
                    link:adManage.adInfo.clickUrl,
                },
                title:adManage.adInfo.title?adManage.adInfo.title.split('|')[0]:''
            }) ;
            adManage.adInfo.imgUrl = null ;
            return ;
        };
        var adInfo =   adManage.getAdInfo(options).then(function (state) {
            if(state  == 1){
                var img  = new Image() ;
                img.src = adManage.adInfo.feedbackUrl ;
                options.displayComplete && options.displayComplete({
                    banner:{
                        icon:adManage.adInfo.imgUrl,
                        link:adManage.adInfo.clickUrl,
                    },
                    title:adManage.adInfo.title?adManage.adInfo.title.split('|')[0]:''
                }) ;
            }else{
                options&&options.displayFail&&options.displayFail('超出广告播放次数') ;
                return false ;
            }
        }) ;

    },
};

module.exports = adManage;