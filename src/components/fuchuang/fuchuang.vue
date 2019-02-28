<template>

    <div>

        <div id="my-menu">

            <div id="menu-btn"></div>

            <!--弹幕的大框-->
            <div class="barrage-cont" :style="{width:pageWidth+'px'}" id="barrage-cont" v-show="barrageFlag">

                <!--<div class="barrage-text">这个游戏真魔性</div>-->
            </div>
        </div>


        <!--浮窗的主节点-->
        <div id="my-fuchuang" class="{{fchidden ? 'mainhidden' : ''}}">

            <div id="mask" v-tap.self="fchiddenFn(1)" class="{{fchidden ? 'maskhidden' : ''}}"></div>

            <div id="my-fuchuang-container" class="{{fchidden ? 'fchidden' : ''}}">

                <!--我的信息-->
                <div id="my-top-cont">

                    <img :src="myAvatar" class="my-icon">
                    <div class="my-nick">{{myNick}}</div>

                    <div class="my-golds">
                        {{myGold}}
                        <img src="http://www.shandw.com/libs/fuchuang/images/jinbi-icon.png" class="jinbi-icon">
                        <img src="http://www.shandw.com/libs/fuchuang/images/jinbi-line.png" class="jinbi-line">
                    </div>

                    <div id="sc-cont" v-tap.self="showEwmFn(1)">收藏订阅</div>

                </div>

                <!--顶部的导航-->
                <div id="top-nav-cont">

                    <div class="t-navs" v-for="item in navs"
                         :style="{width: 100/navs.length+'%'}"
                         v-tap.stop="tabNav(item,$index)">

                        <img :src="item.icons[item.tap]" class="nav-icon">
                        <div class="nav-title {{item.tap == 0 ? 'nav-title-normal' : 'nav-title-select' }}">{{item.title}}
                        </div>

                        <div class="gifts-num" v-if="item.title == '我的礼包' && myGifts>0">{{myGifts}}</div>

                    </div>

                </div>

                <!--二维码-->
                <div class="nav-cont-page" :style="{height:pagesHeight+'px'}"
                     v-show="showEwm" v-tap.self="showEwmFn(0)" id="guanzhu-i">
                    <img src="http://www.shandw.com/libs/fuchuang/images/guanzhu-icon.png" class="guanzhu-icon">
                </div>


                <!--放到桌面-->
                <div class="nav-cont-page" :style="{height:pagesHeight+'px'}" v-show="navsTap['放到桌面']">

                    <div id="my-zm-s" class="scroll-cont" :style="{height:pagesHeight+'px'}">
                        <div class="scrolls">
                            <img src="http://www.shandw.com/libs/fuchuang/images/zhuomian-bg.jpg" class="zhuomian-bg">
                            <div class="zm-tips" v-show="browserTips">{{browserTips}}</div>

                            <img :src="appType" style="width: 100%">
                        </div>
                    </div>


                </div>

                <!--我的礼包-->
                <div class="nav-cont-page" :style="{height:pagesHeight+'px'}" v-show="navsTap['我的礼包']">

                    <div id="my-lb-s" class="scroll-cont" :style="{height:pagesHeight+'px'}">
                        <div class="scrolls">

                            <div class="lb-tips">领取后复制礼包激活码，在游戏中使用</div>

                            <div class="gift-list" v-for="item in giftLists" v-if="giftLists.length">

                                <div class="g-2-conts">
                                    <div class="g-title">{{item.title}}</div>
                                    <div class="g-des">{{item.des}}</div>

                                    <div class="bars">
                                        <div class="subs" :style="{width:item.num+'%'}"></div>
                                    </div>
                                    <div class="synum" v-if="item.code == ''">剩余{{100-item.num}}%</div>
                                    <div class="synum" v-else>已领取{{item.code}}</div>
                                </div>

                                <div class="get-gifts" v-tap.self.stop="giftBtnFn(item)">{{item.code == '' ? '领取' : '复制'}}
                                </div>

                            </div>
                            <div v-if="!giftLists.length" class="no-text">
                                <img src="http://www.shandw.com/libs/fuchuang/images/sorry.png" class="sorry-img">
                                <div class="no-tips">该游戏没有礼包喔~</div>
                            </div>
                        </div>
                    </div>


                </div>

                <!--我的游戏-->
                <div class="nav-cont-page" :style="{height:pagesHeight+'px'}" v-show="navsTap['我的游戏']">

                    <div id="my-gm-s" class="scroll-cont" :style="{height:pagesHeight+'px'}">
                        <div class="scrolls">

                            <div class="lb-tips">最近玩过</div>

                            <div class="zj-conts">
                                <div class="game-list-h" v-for="item in zuijinLists | limitBy 4" v-tap="goToGames(item)">
                                    <img :src="item.icon" class="g-icon-h">
                                    <div class="g-title-h">{{item.title}}</div>
                                    <div class="g-time-h">{{item.time}}</div>
                                </div>
                            </div>


                            <div class="lb-tips">热游推荐</div>

                            <div class="game-list" v-for="item in tuijianLists | limitBy 6">
                                <img :src="item.icon" class="g-icon">
                                <div class="g-1-cont">
                                    <div class="g-title">{{item.title}}</div>
                                    <div class="tags" v-if="item.gift">礼</div>
                                </div>
                                <div class="g-des">{{item.des}}</div>
                                <div class="go-game" v-tap.self="goToGames(item)">进入</div>
                            </div>

                        </div>
                    </div>

                </div>

                <!--世界聊天-->
                <div class="nav-cont-page" :style="{height:pagesHeight+'px'}" v-show="navsTap['世界聊天']" id="kf-cont">


                    <div class="tanmu-icon tanmu-icon-{{barrageFlag?'on':'off'}}" @click.self.stop="changeBarrage()"></div>

                    <!--聊天的内容-->
                    <div class="chat-container scroll-cont" :style="{height:(pagesHeight-chatHeight)+'px'}" id="my-zm-kf">

                        <div class="scrolls">

                            <template v-for="item in chatsLists">

                                <!--其他人聊天的模板-->
                                <div class="chat-lists chat-{{item.isMe ? 'me' :'other'}}-lists" v-if="!item.isTime">

                                    <img src="http://q.qlogo.cn/qqapp/101359011/B07209FA689CD359455037F81761F2F4/100"
                                         class="chat-avatar">
                                    <img src="http://www.shandw.com/mobile/images/man.png" class="chat-sex">

                                    <div class="chat-user" v-if="!item.isMe">{{item.userName}}</div>
                                    <div class="chat-bubble chat-{{item.isMe ? 'me' :'other'}}">
                                        {{item.chatMsg}}
                                    </div>

                                </div>

                                <div v-else class="chat-timer">{{item.isTime}}</div>

                            </template>

                        </div>

                    </div>


                    <div class="chat-input-container">
                        <div id="chat-input" @click.self="showUserInput()">
                            {{ userInputsMsg? '[草稿] '+userInputsMsg : '和大家聊聊天吧~'}}
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!--聊天输入框-->
        <div id="outer-chat-cont" v-show="userInputWindow">

            <div class="mask" v-tap.self="cancelInput()"></div>

            <div class="inputs-container">

                <div class="btn cancel" v-tap.self="cancelInput()">取消</div>
                <h2>世界聊天</h2>
                <div class="btn ok" v-tap.self="sendUserChatMsg()">发送</div>

                <textarea name="user-inputs" id="user-input" maxlength="30" placeholder="最多可输入32个字符哦..."
                          v-model="userInputsMsg"></textarea>

            </div>

        </div>
    </div>

</template>

<script>

    export default {
        name: 'compA',
        data: function () {
            return {
                msg: 'i am compA！Click me'
            }
        },
        props: ['mesFather'],
        methods: {
            sayHello: function () {
                alert(this.msg);
            }
        }
    }

</script>

<!--scoped-->
<style scoped lang="sass">

    /*@import "../compSCSS/compB.scss";*/

    .test {
        background: #39f;
    }

    .cp-a {
        background: url(../static/cj-icon.png);
    }

</style>