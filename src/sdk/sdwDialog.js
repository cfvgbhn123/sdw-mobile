/**
 * Created by CHEN-BAO-DENG on 2019/5/23 0023.
 */

var toastManage ={
    init:function () {
        var toast = document.createElement('div');
        toast.className = 'toast-container';
        toast.innerHTML =
            '<div class="dialog-icon"></div>'+
            '<div class="dialog-title"></div>' +
            '<div class="dialog-msg"></div>' +
            '<div class="btn-container">' +
            '</div>' ;
        /*+'<div class="dialog-btn btn-cancel">取消</div><div class="dialog-btn">确定</div>'*/
        if (document.body) {
            toast.style.display = 'none';
            document.body.appendChild(toast);
            toastManage.container = document.querySelector('.toast-container');
            toastManage.msg = document.querySelector('.dialog-msg');
            toastManage.icon = document.querySelector('.dialog-icon');
            toastManage.title = document.querySelector('.dialog-title');
            toastManage.btnCtl = document.querySelector('.btn-container');
        }
    },
    hidden: function (time) {
        time = time || 0;
        toastManage.timer = setTimeout(function () {
            toastManage.container.style.visibility = 'hidden';
            toastManage.container.style.opacity = '0';
            toastManage.timer = null;
        }, time);
    },
    show:function (options) {
        if(!options) return ;
        toastManage.title.innerHTML = options.title || '';
        toastManage.msg.innerHTML = options.msg || '';
        toastManage.icon.className = 'dialog-icon '+'icon-'+options.icon ;
        if(options.icon){
           // toastManage.icon.className = 'dialog-icon '+'icon-'+options.icon ;
            toastManage.btnCtl.style.display = 'none';
        }else{
            //toastManage.icon.style.display = 'none' ;
            toastManage.btnCtl.style.display = 'flex';
        }
        if(options.autoHide){
            setTimeout(toastManage.hidden,options.autoHide);
        }
        toastManage.btnCtl.innerHTML = '' ;
        var confirmbtn = document.createElement('div') ;
        confirmbtn.className = 'dialog-btn' ;
        confirmbtn.innerHTML = '确定';
        confirmbtn.onclick = function () {
            toastManage.hidden ();
            options.callback && options.callback() ;
        }
        toastManage.btnCtl.appendChild(confirmbtn);
        if(options.btn){
            var cancelbtn = document.createElement('div') ;
            cancelbtn.className = 'dialog-btn' ;
            cancelbtn.innerHTML = options.btn;
            cancelbtn.onclick = toastManage.hidden ;
            toastManage.btnCtl.appendChild(cancelbtn);
        }
        toastManage.container.style.display = 'block';
        toastManage.container.style.visibility = 'visible';
        toastManage.container.style.opacity = '1';
        toastManage.container.style.height = 'auto';
    },
} ;



module.exports = toastManage;