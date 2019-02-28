
export default {
    /**
     * @param value {object} 获取的值
     * @param target {object} 赋给目标值
     */
    APP: {
        guid: "d"
    },
    checkUsrData: function(value, target) {
        value.nick = target.nick;
        value.avatar = target.avatar;
    }
}