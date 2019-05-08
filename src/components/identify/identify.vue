<template>
    <div class="identify-container">
        <div class="ico_close"></div>
        <div class="title">实名认证</div>
        <div class="ipt-container">
            <input type="text" class="ipt ipt-id" placeholder="身份证号" v-model="id">
            <input type="text" class="ipt ipt-name" placeholder="真实姓名" v-model="name">
            <div class="tip-error" >
                <p v-if="errorTip"><i></i>{{errorTip}}</p>
            </div>
            <div class="long-btn" @click="identify()">提交认证</div>
        </div>
        <div class="shuoming">
            <a href="http://inews.shandw.com/a8fef536369e4eabb3091af5b77e444a.html"><i></i>防沉迷系统说明</a>
        </div>
        <p class="txt-tip">
            *本平台承诺绝不对外公开、透露或编辑次信息。
        </p>
        <p class="txt-tip">
            *身份信息只能提交一次，不可修改，慎重填写；
        </p>
    </div>
</template>

<script>
    export default {
        name: "identify-container",
        data:function () {
            return {
                id:null,
                name:null,
                errorTip:null
            }
        },
        props:[],
        methods:{
            getIdInfo:function () {
                var self = this,
                    getUrl = SDW_WEB.URLS.addParam({
                        uid: SDW_WEB.USER_INFO.uid,
                    }, false, HTTP_STATIC + 'queryAccessRealName');

                SDW_WEB.getAjaxData(getUrl, function (data) {
                    //console.log(data);
                    if (data.result === 1) {
                        self.hasIdInfo = false ;

                    }else if(data.result === 2 ){
                        self.hasIdInfo = true ;
                        self.name = data.data.name ;
                        self.id = data.data.idcard.replace(/^(.{4})(?:\d+)(.{4})$/,"$1******$2")
                    }
                    else{
                        dialog.show('error',data.msg,1);
                    }
                })
            },
            identify:function () {
                var self = this;
                var checkIdResult = this.cidInfo(String(this.id)) ;
                if(checkIdResult){
                    this.errorTip = checkIdResult;
                    return ;
                }
                if(!this.name){
                    this.errorTip = '请填写真实姓名';
                    return ;
                }
                this.errorTip = null;
                dialog.show('loading', '正在认证...');
                var postUri = SDW_WEB.URLS.addParam({
                    userid:SDW_WEB.USER_INFO.uid,
                    name:this.name,
                    idcard:this.id,
                    regip:returnCitySN.cip,
                },false,'https://platform.shandw.com/accessRealName');
                SDW_WEB.getAjaxData(postUri,function (data) {
                    dialog.hidden();
                    if (data.result === 1) {
                        dialog.show('ok','认证成功',1);
                    }else{
                        dialog.show('error',data.msg,1);
                    }
                });
            },
            cidInfo:function(sId){
                var aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"}
                var iSum=0
                var info=""
                if(!/^\d{17}(\d|x)$/i.test(sId))return '身份证号格式有误';
                console.log(sId);
                sId=sId.replace(/x$/i,"a");
                if(aCity[parseInt(sId.substr(0,2))]==null) return "非法地区";
                sBirthday=sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2));
                var d=new Date(sBirthday.replace(/-/g,"/"));

                if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate())) return "非法生日";

                for(var i = 17;i>=0;i --) iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11)
                if(iSum%11!=1) return "非法证号";
                //if(!this.IsAdult(d)) return "未成年不支持认证";
                return false ;
                // return aCity[parseInt(sId.substr(0,2))]+","+sBirthday+","+(sId.substr(16,1)%2?"男":"女")
            },
        },
        mounted:function () {
           // console.log('4444444');
        }
    }
</script>

<style scoped lang="sass">
    @import "identify.scss";
</style>