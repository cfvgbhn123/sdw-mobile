
require('./index.scss');
require('../../components/initcss.scss');
var myDataView = new Vue({
    el: '#app',
    data: {
        id:null,
        name:null,
        hasIdInfo:null,
        errorTip:null,
    },

    methods: {
        getIdInfo:function () {
            var self = this,
                getUrl = SDW_WEB.URLS.addParam({
                uid: SDW_WEB.USER_INFO.uid,
            }, false, HTTP_STATIC + 'queryAccessRealName');

            SDW_WEB.getAjaxData(getUrl, function (data) {
                console.log(data);
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
                //regip:returnCitySN.cip,
            },false,'https://platform.shandw.com/accessRealName');
            SDW_WEB.getAjaxData(postUri,function (data) {
                    dialog.hidden();
                    if (data.result === 1) {
                        self.hasIdInfo = true ;
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
        IsAdult:function (birthday){
            //DateTime now = DateTime.Now;
            var now = new Date() ;
            if (now.getFullYear() - birthday.getFullYear() < 18)//如果年份小于18，直接返回false，未成年
            {
                return false;
            }
            else if (now.getFullYear() - birthday.getFullYear() == 18)//如果年份差等于18，则比较月份
            {
                if (now.getMonth() > birthday.getMonth())//年份等于18时，当前月份小于出生月份，则返回false，未成年
                {
                    return false;
                }
                else if (now.getMonth() == birthday.getMonth()) //如果月份也相等，则比较日期
                {
                    if (now.getDate() > birthday.getDate()) //年份等于18，月份相等时，如果当前日期小于出生日期，则返回false，未成年
                    {
                        return false;
                    }
                }
            }
            return true;
        },
    },
    mounted: function () {
        var self = this ;//.getIdInfo();
        if(SDW_WEB.onShandw){
            SDW_WEB.getSdwUserData().then(function (userData) {
               self.getIdInfo();
            }, function (msg) {
                // 获取闪电玩用户数据失败
                if (SDW_WEB.onShandw)
                    SDW_WEB.sdw.openLogin({
                        success: function () {

                        }
                    })
            });
        }else{
           this.getIdInfo();
        }



    },
    components: {}
});


