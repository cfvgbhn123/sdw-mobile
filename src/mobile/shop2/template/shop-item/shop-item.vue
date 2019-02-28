<template>

    <!--小类型的商品-->
    <section class="shop-item-list-container">

        <!--小单个物品（一半）-->
        <div class="shop-item"
             v-if="mtype != 1"
             :data-type="index%2==0? 'left' :''"
             :data-index="index"
             @click="checkShopItem(i)"
             v-for="(i,index) in shopList">
            <img :src='i.icon' alt="商品的图标" class="shop-icon">
            <div class="shop-title ellipsis">{{i.name}}</div>
            <div class="shop-price" :data-type="i.typeUrl">{{transMoney(i)}}</div>

            <!--显示剩余的个数-->
            <div class="shop-num">剩余<span>{{transNumMessage(i)}}</span></div>
            <!--<div class="shop-num" v-else>库存充足</div>-->

            <!--转换显示的文案-->
            <div class="can-buy" v-if="i.limit !== -1">{{transLimitMessage(i)}}</div>
        </div>

        <!--单个热购物品（长条）  抢购 -->

        <div class="hot-shop-item"
             v-if="mtype == 1"
             :data-hot="isHotType(i)"
             v-for="(i,index) in shopList">

            <img :src='i.icon' alt="商品的图标" class="hot-shop-icon">
            <div class="hot-shop-title ellipsis">{{i.name}}</div>

            <div class="hot-shop-info ellipsis shop-num" style="text-align: left">剩余<span>{{transNumMessage(i)}}</span>
            </div>

            <div class="shop-price" :data-type="i.typeUrl">{{transMoney(i)}}</div>

            <!--倒计时完成后，显示抢购按钮-->
            <div v-if="isHotType(i) === 'hot'">
                <div class="buy-btn origin btn1"
                     v-if="i._shopTimer.finish"
                     @click.self.stop="checkShopItem(i)">兑换
                </div>
                <!--&lt;!&ndash;转换显示的文案&ndash;&gt;-->
                <div class="can-buy"
                     :data-type="i._shopTimer.finish?'':'gray'">{{i._shopTimer.message}}
                </div>
            </div>

            <!--非抢购的热销-->
            <div v-if="isHotType(i) !== 'hot'">
                <div class="buy-btn origin btn1"
                     @click.self.stop="checkShopItem(i)">兑换
                </div>
            </div>

        </div>

        <!--弹窗集合-->
        <section class="shop-item-container"
                 @click.self="hiddenAlert()"
                 v-show="showAlert">

            <transition name="scale">
                <!--type: detail-->
                <div class="info-container" v-if="showAlertList.detail">
                    <!--商品详细信息-->
                    <div class="item-info-cont">
                        <img :src="alertInfo.icon" class="shop-icon">
                        <div class="shop-title ellipsis">{{alertInfo.name}}</div>
                        <div class="shop-price" :data-type="alertInfo.typeUrl">{{transMoney(alertInfo)}}</div>
                        <div class="shop-num">剩余{{transNumMessage(alertInfo)}}</div>
                    </div>

                    <!--话费 已经绑定手机-->
                    <div class="bind-phone-info"
                         v-if="alertInfo.iType===8 && bindPhone.phone">当前绑定号码：<span>{{bindPhone.phone}}</span></div>

                    <!--商品的详情介绍-->
                    <div class="item-cont" v-html="alertInfo.info"></div>

                    <!--话费 需要绑定手机-->
                    <div class="bind-phone-container" v-if="alertInfo.iType===8 && !bindPhone.phone">

                        <div class="title">绑定手机号码</div>

                        <input type="text"
                               placeholder="请输入您的手机号"
                               v-model="bindPhone.inputPhone"
                               class="code-container">
                        <div class="code-container b-b">
                            <input type="text"
                                   placeholder="请输入验证码"
                                   v-model="bindPhone.inputCode"
                                   class="code-input">
                            <div class="get-code" @click="getBindPhoneCode()">{{bindPhone.bindMsg}}</div>
                        </div>

                    </div>


                    <!--需要加上手机绑定的判断，地址填写的判断-->
                    <div class="user-confirm-btn"
                         @click="checkBuyShopItem(alertInfo)">
                        立即购买
                    </div>
                    <!--商品详细信息-->
                </div>
            </transition>

            <transition name="scale">
                <!--type:fail  购买失败的提示-->
                <div class="info-container" v-if="showAlertList.fail">
                    <div class="message-title">购买失败</div>
                    <div class="msg">{{errorMessage.message}}</div>
                    <div class="user-confirm-btn">
                        赚闪电币
                    </div>
                </div>
            </transition>

            <transition name="scale">
                <!--type:success  购买成功的提示-->
                <div class="info-container" v-if="showAlertList.success">
                    <div class="message-title">购买成功</div>
                    <div class="msg">恭喜你购买成功</div>
                    <div class="user-confirm-btn" @click.self="hiddenAlert()">
                        确定
                    </div>
                </div>
            </transition>

            <transition name="scale">
                <!--type:gameSuccess  游戏礼包购买成功-->
                <div class="info-container" v-if="showAlertList.gameSuccess">
                    <div class="message-title">购买成功</div>

                    <div class="title-msg">{{alertInfo.name}}</div>

                    <!--礼包内容-->
                    <div class="item-msg" v-html="alertInfo.sub"></div>


                    <div class="game-code-container">
                        <div class="bd-code-cont">
                            <div class="bd-code">{{myGameCode}}</div>
                        </div>

                        <button class="copy-btn"
                                @click="setCopyCode(myGameCode)"
                                :data-clipboard-text="myGameCode">一键复制
                        </button>
                    </div>

                    <div class="item-cont" v-html="alertInfo.info"></div>

                    <div class="user-confirm-btn"
                         @click.self="goToGamePage(alertInfo)">
                        开始游戏
                    </div>
                </div>
            </transition>

            <!--type:code 兑换提示框-->
            <transition name="tasks">
                <div class="task-infos" v-if="showAlertList.code">
                    <div class="task-name">恭喜，您的兑换码</div>
                    <div class="task-gift" @click.stop="showCode(codeInfo.code)"><span
                            class="conts-i">{{codeInfo.code}}</span>
                    </div>
                    <div class="desc">
                        <div class="left-container" v-html="codeInfo.info"></div>
                        <div class="right-cont" @click.stop="gotoWeixinShandw()">
                            <img src="images/icons-ewm.jpg">
                            <div>点击前往</div>
                        </div>
                    </div>
                    <section class="login-btn-v3" @click.stop='hiddenAlert()'>确 定</section>
                </div>
            </transition>


            <!--type:goods 实物订单兑换提示框-->
            <transition name="tasks">
                <div class="info-container" v-if="showAlertList.goods">
                    <div class="message-title">订单信息</div>

                    <img :src="alertInfo.icon" alt="" class="goods-icon">

                    <div class="goods-name">{{alertInfo.name}}</div>

                    <div class="info-list">

                        <div class="b-t">收货地址</div>
                        <div class="s-t">{{address}}</div>
                        <div class="s-t">{{userNick}} {{bindPhone.phone}}</div>

                        <div class="b-t">订单信息</div>
                        <div class="s-t">订单号：{{myGoodsInfo.orderId}}</div>
                        <div class="s-t">快递状态：未发货</div>
                        <div class="s-t">费用：{{myGoodsInfo.price+myGoodsInfo.priceType}}</div>

                        <div class="b-t">客服电话</div>
                        <div class="s-t">0571-56690669</div>
                    </div>

                    <div class="user-confirm-btn" @click.self="hiddenAlert()">确定</div>
                </div>
            </transition>

        </section>

    </section>


</template>

<script>

    var HTO_SHOP_TIMER = function (option) {
        this.start = option.start;
        this.end = option.end;
        this.timer = null;
        this.message = '';
        this.finish = false;

        this.getNow = function () {

            return (+new Date()) + SDW_WEB.SERVER_TIME_DEL;  // 本地与服务端的时间差
            // return (+new Date());
        };

        var self = this;
        /*now start end*/
        this.stepFn = function () {
            var now = self.getNow();
            if (now <= self.start) {
                self.message = self.transTimeMessage(now, self.start, '开始');
            } else if (now >= self.end) {
                self.message = '抢购已经结束';
                self.finish = false;
            } else {
                /*抢购进行中*/
                self.message = self.transTimeMessage(now, self.end);
                self.finish = true;
            }
            self.timer = setTimeout(self.stepFn, 500);
        };

        /*倒计时*/
        this.transTimeMessage = function (now, end, msg) {
            var timeList = [];
            var endObj = new Date(end);

            var eY = endObj.getFullYear();
            var eM = endObj.getMonth() + 1;
            var eD = endObj.getDate();
            var eH = endObj.getHours();
            var eMs = endObj.getMinutes();
            var eS = endObj.getSeconds();
            var nowObj = new Date(now);
            var nY = nowObj.getFullYear();
            var nM = nowObj.getMonth() + 1;
            var nD = nowObj.getDate();
            if (eY === nY && eM === nM && eD === nD) {
                timeList.push('今日');
            } else {
                timeList.push(eY + '-' + eM + '-' + eD);
            }
            timeList.push(' ');
            timeList.push(eH + ':' + eMs + ':' + eS);
            timeList.push(msg || '结束');
            return timeList.join('');
        };

        this.stepFn();
    };

    export default {
        name: 'shop-item',
        data: function () {
            return {
                page: 0,
                allScroll: null,
                address: '',  // 用户的收货地址
                userNick: '',
                bindPhone: {
                    phone: '',
                    inputPhone: '',
                    inputCode: '',
                    bindTimer: null,
                    bindMsg: '获取验证码',
                    bindStartTimer: 0
                },
                myGameCode: '',  // 我的游戏礼包
                showAlertList: {
                    'detail': false,
                    'fail': false,
                    'success': false,
                    'gameSuccess': false,
                    'code': false,   // 虚拟道具的兑换码
                    'goods': false, // 实物订单
                },
                myGoodsInfo: {},
                bindInfo: {},
                codeInfo: {},
                shopList: [],
                loading: false,
                /*弹窗的物品*/
                alertInfo: {},
                errorMessage: {
                    message: '',
                    type: -1,
                }
            };
        },


        mounted: function () {
            var self = this;

            this.$on('getShopList', function (data) {
                this.getShopList(data);
            });

            var clipboard = new Clipboard('.copy-btn');

            // if (this.mtype == 1) {
            //
            //     // setTimeout(function () {
            //     //
            //     // }, 200);
            //
            //     // alert(this.scrollenable)
            // }


        },
        // created: function () {
        //
        // },
        props: ['mtype', 'mpage', 'scrollenable'],
        methods: {

            updateAddress: function () {
                var user = SDW_WEB.USER_INFO.shopInfo;
                this.address = user.receivingArea + user.receivingAddress;
                this.bindPhone.phone = user.phone;
                this.userNick = user.contact;
            },

            checkPhone: function (phone) {
                return /\d{11}/.test(phone)
            },

            getBindPhoneCode: function () {

                var self = this;
                if (!this.checkPhone(this.bindPhone.inputPhone)) {
                    return dialog.show('error', '请输入手机号', 1);
                }

                /*请求验证码*/
                var sec = +new Date();
                var time = +new Date();
                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    uid: SDW_WEB.USER_INFO.uid,
                    token: SDW_WEB.MD5('' + SDW_WEB.channel + SDW_WEB.USER_INFO.uid + sec + this.bindPhone.inputPhone + time + SDW_WEB.USER_INFO.otoken),
                    phone: this.bindPhone.inputPhone,
                    sec: sec,
                    time: time
                }, false, HTTP_USER_STATIC + 'getcode');
                dialog.show('loading', '验证码获取中...');
                SDW_WEB.getAjaxData(postUri, function (data) {
                    if (data.result === 1) {
                        // success
                        dialog.show('ok', '验证码已发送', 1);

                        // self.bindTime = data.time.length == 10 ? data.time : data.time / 1000 >> 0;
                        self.bindPhone.bindTime = data.time;

                        self.bindPhone.bindStartTimer = 60;

                        self.bindPhone.bindTimer = setInterval(function () {

                            if (self.bindPhone.bindStartTimer <= 1) {
                                // 终止倒计时
                                clearInterval(self.bindPhone.bindTimer);
                                self.bindPhone.bindStartTimer = 0;
                                self.bindPhone.bindMsg = '获取验证码';
                                self.bindPhone.bindTimer = null;
                            } else {
                                self.bindPhone.bindMsg = (self.bindPhone.bindStartTimer--) + '秒后获取';
                            }

                        }, 1000);

                    } else {
                        dialog.show('error', data.msg, 1);
                    }
                })

            },

            // 绑定手机的确认检查
            bindPhoneCheck: function (callback) {

                if (!this.checkPhone(this.bindPhone.inputPhone)) {
                    return window.dialog.show('error', '请输入正确的手机号', 1);
                }

                if (!/\d+/.test(this.bindPhone.inputCode)) {
                    return window.dialog.show('error', '请输入正确的验证码', 1);
                }


                dialog.show('loading', '手机绑定中...');

                var self = this;

                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    uid: SDW_WEB.USER_INFO.uid,
                    token: SDW_WEB.MD5('' + SDW_WEB.channel + SDW_WEB.USER_INFO.uid + SDW_WEB.USER_INFO.secheme + self.bindPhone.bindTime + self.bindPhone.inputCode),
                    sec: SDW_WEB.USER_INFO.secheme,
                    time: self.bindPhone.bindTime
                }, false, HTTP_USER_STATIC + 'checkcode');

                SDW_WEB.getAjaxData(postUri, function (data) {

                    if (data.result == 1) {
                        // var pStr = self.bindMyPhone.substring(0, 3) + '****' + self.bindMyPhone.substring(7);
                        // data.myPhoneStr = pStr;
                        SDW_WEB.USER_INFO.shopInfo.phone = self.bindPhone.inputPhone; // 修正绑定后的手机号

                        dialog.show('ok', '手机绑定成功', 1);

                        callback && callback();

                    } else {
                        dialog.show('error', data.msg, 1);
                    }
                });

            },

            isHotType: function (item) {
                if (item.hst > 0) return "hot";
                return false;
            },


            transMoney: function (item) {
                if (item.pType === 4 || item.pType === 7) {
                    // 现金
                    return (item.price / 100).toFixed(2);
                }
                return item.price;
            },


            goToGamePage: function (item) {
                /*跳转到游戏*/
                /*跳转到记录*/

                var targetUrl = SDW_PATH.GAME_URL('play', item.appId);

                var openObj = {
                    link: targetUrl,
                    isFullScreen: false,
                    showMoreBtn: true,
                    title: '',
                };

                var openObj = SDW_WEB._checkWebViewObject(openObj, item);
                // 打开玩游戏的界面
                SDW_WEB.openNewWindow(openObj);
            },

            /*复制文案*/
            setCopyCode: function (text) {
                if (SDW_WEB.onShandw) {
                    SDW_WEB.sdw.setClipboard(text);
                }

                dialog && dialog.show('ok', '复制成功', 1);
            },

            transNumMessage: function (item) {

                // 首先判断是否购买完成
                if (item.count === item.sell) {
                    return '0%';
                }

                // if (item.limit === -1) {
                //     return '100%';
                // }

                return ((item.count - item.sell) / item.count * 100).toFixed(0) + '%';
            },

            transLimitMessage: function (item) {

                if (item.limit === -1) {
                    /*无限够次数*/
                    return '不限购'
                }
                return '限购'
            },

            // 获取商品的列表
            getShopList: function () {
                // return;

                if (this.loading) return;
                this.loading = true;
                var self = this;
                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    token: SDW_WEB.USER_INFO.token,
                    uid: SDW_WEB.USER_INFO.uid,
                    sec: SDW_WEB.USER_INFO.secheme,
                    shopType: this.mtype,
                    page: this.page
                }, false, HTTP_STATIC + 'shopswitch');

                // dialog.show('loading', '数据加载中...');

                SDW_WEB.getAjaxData(postUri, function (data) {


                    self.page++;
                    self.loading = false;
                    if (data.result === 1) {

                        self.createList(data.shopItems);
                        dialog.hidden();

                    } else {
                        dialog.show('hidden', data.msg, 1);
                    }
                    self.$nextTick(function () {
                        // 变更是否是一屏
                        var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                        var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                        window.oneScreen = (scrollHeight <= clientHeight);
                    })
                })
            },

            /*请求商城数据  data--list*/
            createList: function (data) {

                data = data || [];

                for (var i = 0; i < data.length; i++) {
                    var _item = data[i];

                    // 兑换的币种
                    if (_item.pType === 3) {
                        _item.typeUrl = 'stamp';
                    } else if (_item.pType === 1) {
                        _item.typeUrl = 'gold';
                    } else if (_item.pType === 4 || _item.pType === 7) {
                        _item.typeUrl = 'money';
                    }

                    // 抢购的物品
                    if (typeof _item.hst !== 'undefined' && _item.hst > 0) {
                        /*倒计时*/
                        // console.log(new Date(_item.hst))
                        // console.log(new Date(_item.et))
                        _item._shopTimer = new HTO_SHOP_TIMER({
                            start: _item.hst,
                            end: _item.et,
                        });
                    }
                }

                this.shopList.push.apply(this.shopList, data);

                if (data.length === 0) {
                    this.loading = true;  // 没有更多的数据了
                }
            },

            /*显示商品详情*/
            checkShopItem: function (item, isHot) {
                /*读取用户信息*/
                var user = SDW_WEB.USER_INFO.shopInfo;
                this.bindPhone.phone = user.phone;
                this.alertInfo = item;
                this.hiddenAlert();
                this.showAlertList.detail = true;
            },

            /*校验用户是否满足购买条件*/
            checkBuyShopItem: function (item) {
                var canPay = this.checkPayState(item);
                var self = this;

                // console.log(canPay);

                /*达到可购买的条件，足够的钱*/
                if (canPay === true) {
                    var user = SDW_WEB.USER_INFO.shopInfo;
                    if (item.iType === 8 && !user.phone) {
                        /*手机话费，判断是否需要绑定  对输入框进行校验*/
                        if (!this.checkPhone(this.bindPhone.inputPhone)) {
                            return dialog.show('error', '请输入绑定的手机号', 1);
                        }
                        if (!this.bindPhone.inputCode) {
                            return dialog.show('error', '请输入验证码', 1);
                        }
                        /*进行绑定操作*/
                        this.bindPhoneCheck(function () {
                            self.checkBuyShopItem(item);
                        });
                        return;
                    }

                    else if (item.iType === 3 && !user.receivingAddress) {
                        /*绑定邮寄地址*/
                        dialog.show('error', '您还没有绑定收获地址，请前往【我】-【设置】内添加收获地址', 1);
                        return;
                    }
                    this.charge(item);

                } else {

                    if (canPay === 4 || canPay === 7) {
                        /*现金不足*/
                        return dialog.show('error', '您的现金红包不足', 1);
                    }
                    if (canPay === 1) {
                        /*现金不足*/
                        return dialog.show('error', '您的闪电币不足', 1);
                    }

                    if (canPay === 3) {
                        /*现金不足*/
                        return dialog.show('error', '您的点券不足', 1);
                    }

                    // 次数达到上限等提示
                    dialog.show('error', canPay, 1)
                }
            },
            charge: function (item) {

                this.hiddenAlert();

                var self = this;
                var postUri = SDW_WEB.URLS.addParam({
                    channel: SDW_WEB.channel,
                    uid: SDW_WEB.USER_INFO.uid,
                    token: SDW_WEB.USER_INFO.token,
                    sec: SDW_WEB.USER_INFO.secheme,
                    id: item.id,
                    num: 1
                }, false, HTTP_STATIC + 'shopping');

                dialog.show('loading', '正在兑换中...');
                SDW_WEB.getAjaxData(postUri, function (data) {
                    if (data.result == 1) {

                        /*通知父组件修改用户的信息*/
                        var user = {};
                        if (data.stamp) {
                            user.stamp = data.stamp;
                        }
                        if (data.redPkt) {
                            user.redPkt = data.redPkt;
                        }
                        if (data.gold) {
                            user.gold = data.gold;
                        }

                        self.$emit('change-user-info', user);

                        dialog.hidden();

                        // // 修正已经购买的次数
                        // if (item.pType == 3)
                        //     _shopRoot.user.stamp -= item.gold;
                        // if (item.pType == 1)
                        //     _shopRoot.user.gold -= item.gold;
                        //

                        item.buy++;
                        item.sell++;


                        /*iType (物品发放方式（1游戏礼包CDK,2 cdk码，3实物,4.虚拟物品，8、话费）)*/

                        if (item.iType === 2) {
                            // cdk
                            self.codeInfo.code = data.code;
                            self.codeInfo.info = self.alertInfo.info; // 需要获取之前的
                            // 显示流量兑换码的信息界面
                            self.showAlertList.code = true;
                        } else if (item.iType === 8) {
                            // 虚拟商品，展示获取码（流量）
                            // if (data.code) {
                            //
                            // } else {
                            // 显示购买成功界面（通用）
                            // self.showAlertList.success = true;
                            dialog.show('ok', '恭喜您充值成功', 1);
                            // }

                        } else if (item.iType === 1) {
                            // 游戏礼包
                            self.showAlertList.gameSuccess = true;
                            self.myGameCode = data.code;  // 我的游戏礼包

                        } else if (item.iType === 3) {
                            // 实物道具
                            self.updateAddress();

                            function transType(type) {
                                if (type === 1) {
                                    return '闪电币'
                                }
                                if (type === 3) {
                                    return '点券'
                                }
                                if (type === 4) {
                                    return '现金'
                                }
                                if (type === 7) {
                                    return '红包'
                                }
                            }

                            function transPrice(p, type) {
                                if (type === 4 || type === 7) {
                                    return (p / 100).toFixed(2);
                                }
                                return p;
                            }

                            self.myGoodsInfo = {
                                orderId: data.orderId,
                                price: transPrice(item.price, item.pType),
                                priceType: transType(item.pType)
                            };


                            self.showAlertList.goods = true;

                        } else {
                            // 显示购买成功界面（通用）
                            self.showAlertList.success = true;
                        }

                    } else {
                        dialog.show('error', data.msg, 1);
                    }

                });
            },

            checkPayState: function (item) {

                // count	总个数，负数表示不限
                // sell	    已经销售的个数
                // limit	每个人最多购买个数
                // perBuy	每个人每次最多购买个数

                var userGold = parseInt(document.querySelector('#user-gold').dataset.value) || 0;
                var userStamp = parseInt(document.querySelector('#user-stamp').dataset.value) || 0;
                var userMoney = parseInt(document.querySelector('#user-money').dataset.value) || 0;

                /**检查物品的个数**/
                if (item.limit !== -1 && item.count >= 0 && (item.count - item.sell <= 0)) return '该物品已经兑完';

                /**检查用户购买的次数**/
                if (item.limit >= 0 && item.limit <= item.buy) return '购买次数达到上限';

                /**检查支付类型，判断货币是否充足**/
                switch (item.pType) {
                    case 1: /**金币**/
                        if (userGold >= item.gold) return true;
                        else return 1;
                    case 2: /**钻石**/
                    case 3: /**点券**/
                        if (userStamp >= item.gold) return true;
                        else return 3;
                    case 4: /**人民币**/
                        if (userMoney >= item.price) return true;
                        else return 4;
                    case 7: /**人民币**/
                        if (userMoney >= item.price) return true;
                        else return 7;

                }

                return 'checkPayState';
            },

            hiddenAlert: function () {
                for (var i in this.showAlertList) {
                    if (this.showAlertList.hasOwnProperty(i)) {
                        this.showAlertList[i] = false;
                    }
                }
            }
        },

        computed: {
            showAlert: function () {
                var show = false;
                for (var i in this.showAlertList) {
                    if (this.showAlertList.hasOwnProperty(i)) {
                        show = show || this.showAlertList[i]
                    }
                }
                return show;
            }
        },
        watch: {}
    }

</script>

<style lang="sass">
    @import "shop-item.scss";
</style>