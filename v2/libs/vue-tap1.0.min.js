/**
 * Created by 二哲 on 15/12/6.
 */
/*
 * 不带参数指令
 * v-tap=handler
 * or
 * 带参数指令
 * v-tap=handler($index,el,$event)
 *
 * !!!新增!!!
 * 把tapObj对象注册在原生event对象上
 * event.tapObj拥有7个值
 * pageX,pageY,clientX,clientY,distanceX,distanceY,[el = > this]
 * 后面2个分别的手指可能移动的位置(以后可用于拓展手势)
 *
 * */(function(){var e={install:function(e){e.directive("tap",{isFn:!0,acceptStatement:!0,bind:function(){},update:function(c){var a=this;a.tapObj={};if("function"!==typeof c)return console.error('The param of directive "v-tap" must be a function!');a.handler=function(b){b.tapObj=a.tapObj;c.call(a,b)};this.el.addEventListener("touchstart",function(b){a.modifiers.stop&&b.stopPropagation();a.modifiers.prevent&&b.preventDefault();a.touchstart(b,a)},!1);this.el.addEventListener("touchend",function(b){a.touchend(b,a,c)},!1)},unbind:function(){},isTap:function(){if(this.el.disabled)return!1;var c=this.tapObj;this.tapObj.el=this.el;return 150>this.time&&4>Math.abs(c.distanceX)&&4>Math.abs(c.distanceY)},touchstart:function(c,a){var b=c.touches[0],d=a.tapObj;d.pageX=b.pageX;d.pageY=b.pageY;d.clientX=b.clientX;d.clientY=b.clientY;a.time=+new Date},touchend:function(c,a){var b=c.changedTouches[0],d=a.tapObj;a.time=+new Date-a.time;d.distanceX=d.pageX-b.pageX;d.distanceY=d.pageY-b.pageY;a.isTap(d)&&setTimeout(function(){a.handler(c)},30)}})}};"object"==typeof exports?module.exports=e:"function"==typeof define&&define.amd?define([],function(){return e}):window.Vue&&(window.vueTap=e,Vue.use(e))})();
