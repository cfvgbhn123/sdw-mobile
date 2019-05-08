
require('./index.scss');
require('../../components/initcss.scss');
var myDataView = new Vue({
    el: '#app',
    data: {
        hasTelInfo:null,
        tel:null,
        code:{
            val:null,
            time:60
        },
        errorTip:null,
        id:SDW_WEB.USER_INFO.uid,
    },

    methods: {
        getTelInfo:function () {
            var self = this,
                getUrl = SDW_WEB.URLS.addParam({
                    uid: SDW_WEB.USER_INFO.uid,
                }, false, HTTP_STATIC + 'queryBindingPhone');

            SDW_WEB.getAjaxData(getUrl, function (data) {
               // console.log(data);
                if (data.result === 1) {
                    self.hasTelInfo = false ;

                }else if(data.result === 2 ){
                    self.hasTelInfo = true ;
                    self.tel = data.data.phone.replace(/^(.{3})(?:\d+)(.{4})$/,"$1****$2") ;
                    self.id = data.data.uid;
                }
                else{
                    dialog.show('error',data.msg,1);
                }
            })
        },
        bindTel:function () {
            if(!this.checkPhone() ){
                return null ;
            }
            var _t = this ;
            var data ={
                time:this.backTime,
                channel:SDW_WEB.channel,
                uid:SDW_WEB.USER_INFO.uid,
                fl:SDW_WEB.USER_INFO.fl,
                sec:new Date().getTime(),
                phone:this.tel,
                otoken:SDW_WEB.USER_INFO.otoken,
            };
            data.token = SDW_WEB.MD5("" + data.channel + data.uid + data.sec + data.time+ this.code.val) ;
            var str = SDW_WEB.URLS.addParam(data,false,HTTP_USER_STATIC+'checkcode') ;
            var offset = /^\d{6}$/.test(this.code.val) || /^\d{4}$/.test(this.code.val);
            if(!offset){
                this.errorTip = '验证码错误' ;
                return ;
            }
            this.errorTip = null ;
            SDW_WEB.getAjaxData(str,function (res) {
                if(res.result === 1 ){
                    _t.hasTelInfo = true ;
                    _t.tel =_t.tel.replace(/^(.{3})(?:\d+)(.{4})$/,"$1****$2") ;
                    dialog.show('ok', '绑定成功',1);
                }else{
                    dialog.show('error', res.msg,1);
                }
            })

        },
        getCode:function () {
            var _t = this ;
            if(!this.checkPhone()){
                return null ;
            }
            this.errorTip = null ;
            var data ={
                time:new Date().getTime(),
                channel:SDW_WEB.channel,
                uid:SDW_WEB.USER_INFO.uid,
                fl:SDW_WEB.USER_INFO.fl,
                sec:SDW_WEB.USER_INFO.secheme,
                phone:this.tel,
                otoken:SDW_WEB.USER_INFO.otoken,
            };
            data.token = SDW_WEB.MD5("" + data.channel + data.uid + data.sec +  data.phone + data.time + data.otoken) ;
            var str = SDW_WEB.URLS.addParam(data,false,HTTP_USER_STATIC+'getcode') ;

            SDW_WEB.getAjaxData(str,function (res) {
                if(res.result === 1 ){
                    dialog.show('ok', '验证码已发送',1);
                    if(_t.code.time < 60) return ;
                    _t.interver() ;
                    _t.backTime = res.time ;
                }else{
                    dialog.show('error', res.msg,1);
                }
            })
        },
        interver:function () {
            var _t = this ;
            var time = setInterval(function () {
                _t.code.time -- ;
                if(_t.code.time < 1){
                    clearInterval(time) ;
                    _t.code.time = 60 ;
                }
            },1000)
        },
        checkPhone:function (){
            if(!(/^1[345678]\d{9}$/.test(this.tel))){
                this.errorTip = '手机号格式有误';
                return false;
            }
            return true ;
        },
    },
    mounted: function () {
        var t= this ;
        if(SDW_WEB.onShandw){
            SDW_WEB.getSdwUserData().then(function (userData) {
                t.getTelInfo() ;
            }, function (msg) {
                // 获取闪电玩用户数据失败
                if (SDW_WEB.onShandw)
                    SDW_WEB.sdw.openLogin({
                        success: function () {

                        }
                    })
            });
        }else{
            this.getTelInfo() ;
        }


    },
    components: {}
});


