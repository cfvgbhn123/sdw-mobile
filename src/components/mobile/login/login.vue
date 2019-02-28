<!--

-->

<template>


    <transition name="scale21">
        <!--login-->
        <div class="login-container"
             v-if="showLogin">

            <div class='mask-v2' @click.stop.self='hidePage()'></div>

            <div v-if="show">
                <i class="sdw-logo-v2"></i>

                <div id="loginForm-v2" class="forms">

                    <div class="inpus">
                        <i class="icons-v2 phone"></i>
                        <input type="text" placeholder="输入手机号"
                               v-model="phoneLoginData.phoneNum" class="long">
                    </div>

                    <div class="inpus">
                        <i class="icons-v2 code"></i>
                        <input type="text" placeholder="输入验证码"
                               v-model="phoneLoginData.phoneCode" class="short">

                        <div id="getCode-v-2" class="codenormal" @click.stop.self="getPhoneCode()">
                            {{phoneLoginData.message}}
                        </div>
                    </div>

                    <div class="login-btn-v2" @click.stop.self="phoneLogin(0)">登<span style="width: 50px;"> </span>录
                    </div>

                </div>
            </div>


            <!--<div class="other-login-v2">其他登录方式</div>-->

            <!--&lt;!&ndash;其他登录icons&ndash;&gt;-->
            <!--<div class="other-icon-v2">-->

            <!--<i class="icons-v2 weixin"></i>-->
            <!--<i class="icons-v2 weibo"></i>-->
            <!--<i class="icons-v2 qq"></i>-->
            <!--<i class="icons-v2 dh"></i>-->
            <!--&lt;!&ndash;<img src="images/weixin-icon.png" class="icons-v2" v-tap.self.stop="chooseLoginType('wx')">&ndash;&gt;-->
            <!--&lt;!&ndash;<img src="images/weibo-icon.png" class="icons-v2" v-tap.self.stop="chooseLoginType('wb')">&ndash;&gt;-->
            <!--&lt;!&ndash;<img src="images/qq-icon.png" class="icons-v2" v-tap.self.stop="chooseLoginType('qq')">&ndash;&gt;-->
            <!--&lt;!&ndash;<img src="images/dh-icon.png" class="icons-v2" v-tap.self.stop="chooseLoginType('dh')">&ndash;&gt;-->
            <!--</div>-->

        </div>

    </transition>

</template>

<script>

    export default {
        name: 'fast-login',
        data: function () {
            return {
//                maskType: SDW_WEB.onIOS ? 'ios-mask' : 'and-mask',
                loginFlagV2: 1,
                phoneLoginData: {
                    getCodeFlag: false,
                    phoneNum: '',
                    phoneCode: '',
                    RES_TIME: '',
                    timerHand: null,
                    message: '获取验证码'
                },
                tapTimer: null
            }
        },
        props: ['show'],
        methods: {

            hidePage: function () {

                if (!/home/.test(location.href)) {
                    this.show = 0;
                }

            },
            forbidScroll: function (e) {
//                e.stopPropagation();
                e.preventDefault();
            },

            /**
             * 验证码倒计时
             */
            timers: function () {

                var self = this, TIMES_ALL = 60;

                var codeBtn = document.querySelector('#getCode-v-2');
                codeBtn.className = 'codetimer';

                self.codeMessage = (TIMES_ALL--) + '秒后获取';

                self.timerHand = setInterval(function () {
                    if (TIMES_ALL <= 0) {
                        clearInterval(self.timerHand);
                        codeBtn.className = 'codenormal';
                        self.phoneLoginData.message = '获取验证码';
                        self.phoneLoginData.getCodeFlag = false;
                    } else {
                        self.phoneLoginData.message = (TIMES_ALL--) + '秒后获取';
                    }

                }, 1000);
            },

            chooseLoginType: function () {

            },

            // 获取手机验证码
            getPhoneCode: function () {

                var self = this, _data = this.phoneLoginData, channel = SDW_WEB.channel;

                // console.log(_data.getCodeFlag);
                if (_data.getCodeFlag) return;

                if (/^1\d{10}$/.test(_data.phoneNum)) {

                    _data.getCodeFlag = true;

//                    var visitorToken = self.isVisitor ? '&vst=1&vsttoken=' + visitorMode.visitorToken : '';

                    var times = (+new Date()) / 1000 >> 0;
                    var date = new Date().Format("yyyyMMdd");

//                    console.log("SDW" + date + channel + SDW_WEB.guid + _data.phoneNum + times);

                    var sign = SDW_WEB.MD5("SDW" + date + channel + SDW_WEB.guid + _data.phoneNum + times);

                    var TEL_URL = HTTP_USER_STATIC + 'telcode?channel=' + channel +
                        '&phone=' + _data.phoneNum +
                        '&time=' + times +
                        '&sign=' + sign;

                    dialog.show('loading', '验证码获取中...');

                    SDW_WEB.getAjaxData(TEL_URL, function (data) {

                        if (data.result == 1) {

                            _data.RES_TIME = data.time;
                            _data.getCodeFlag = true;
                            self.timers();

//                            if (data.phone == 1) {
//
//                                dialog.hidden();
//                                // 此手机已经登录过
//                                self.tipWindow = 1;
//
//                            } else {
                            dialog.show('ok', '验证码已发送', 1);

                            document.querySelector('.short').focus();

//                            }

                        } else {

                            _data.getCodeFlag = false;
                            dialog.show('error', data.msg, 1);

                        }

                    }, false);

                } else {
                    dialog.show('error', '请输入正确的手机号', 1);
                }
            },

            // 手机登录
            phoneLogin: function (isVisitor) {

                var self = this, _data = this.phoneLoginData, channel = SDW_WEB.channel;

                if (/^1\d{10}$/.test(_data.phoneNum)) {

                    if (/^\d+$/.test(_data.phoneCode)) {

                        var visitorToken = isVisitor ? '&vst=1&vsttoken=' + visitorMode.visitorToken : '';

                        var TEL_URL = HTTP_USER_STATIC + 'telcheck?channel=' + channel +
                            '&phone=' + _data.phoneNum +
                            '&time=' + _data.RES_TIME +
                            '&sign=' + SDW_WEB.MD5(channel + SDW_WEB.guid + _data.phoneNum + _data.RES_TIME + _data.phoneCode)
                            + visitorToken;

                        dialog.show('loading', '登录中...');

                        // 手机登录授权
                        SDW_WEB.getAjaxData(TEL_URL, function (data) {

//                            console.log('LOGIN==>', data);

                            if (data.result == 1) {
                                // 登录成功
                                // v2版本的用户数据  id => uid
                                var v2UserData = {
                                    uid: data.id,
                                    otoken: data.token,
                                    nick: data.nick,
                                    sex: data.sex,
                                    avatar: data.avatar,
                                    city: data.city,
                                    fl: data.fl
                                };

                                SDW_WEB.Store.set(SDW_WEB.localItem, v2UserData, true);
                                localStorage.setItem(window.DATAITEM, JSON.stringify(v2UserData));

                                dialog.show('ok', '登录成功', 1);

                                v2UserData.secheme = +new Date();
                                v2UserData.token = SDW_WEB.MD5('' + SDW_WEB.channel + v2UserData.uid + v2UserData.secheme + v2UserData.otoken);

                                SDW_WEB.USER_INFO = v2UserData;

                                self.$emit("login-ok");

                                self.show = 0;
                            } else {
                                dialog.show('error', data.msg, 1);
                            }

                        }, false);


                    } else dialog.show('error', '请输入正确的验证码', 1);

                } else dialog.show('error', '请输入正确的手机号', 1);
            }
        },
        computed: {
            showLogin: function () {
                return this.show || false;
            }
        },
        watch: {
            showLogin: function (curV) {

                // 出现登录框，禁止滚动

                var self = this;

                if (curV) {

                    this.tapTimer && clearTimeout(this.tapTimer);

                    this.tapTimer = setTimeout(function () {
                        document.addEventListener('touchmove', self.forbidScroll, false);
                    }, 200);

                } else {

                    this.tapTimer && clearTimeout(this.tapTimer);
                    document.removeEventListener('touchmove', self.forbidScroll, false);

                }

            }
        }
    }

</script>

<style lang="sass">
    @import "./login.scss";
</style>