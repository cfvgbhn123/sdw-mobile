/**
 * Created by CHEN-BAO-DENG on 2017/3/22.
 */


var LoginAPI = {

    HTTP_USER_STATIC: '',

    /**
     * 检查手机号是否正确
     * @param phone
     * @return {boolean}
     */
    checkPhone: function (phone) {
        return /^1\d{10}$/.test(phone);
    },

    /**
     * 检查验证码是否正确
     * @param code
     * @return {boolean}
     */
    checkCode: function (code) {
        return /^\d+$/.test(code);
    },

    getCode: function (option, callback) {


    }

};

module.exports = LoginAPI;