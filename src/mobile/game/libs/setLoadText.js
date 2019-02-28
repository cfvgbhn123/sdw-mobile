/**
 * Created by CHEN-BAO-DENG on 2017/12/7 0007.
 */


var setLoadText = {

    default: ['我是默认的加载文案...'],
    auth: ['我是游戏授权完成后的文案...'],
    loaded: ['我是游戏加载完成后的文案...'],

    setText: function (type) {
        if (this[type]) {
            console.log(this[type][0]);
        }
    }

};

module.exports = setLoadText;