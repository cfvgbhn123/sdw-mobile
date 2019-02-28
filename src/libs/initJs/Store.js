/**
 * Created by CHEN-BAO-DENG on 2017/2/7.
 *
 * 简单的localStorage和sessionStorage，数据存储管理
 *
 * ###### Store.js会在key后面加上一个标识符（STORE_CACHE_KEYS）尽量不影响其他的存储数据
 * ###### 参数[forever = true]表示读取localStorage；默认是读取sessionStorage
 *
 * 示例：
 * Store.set('localKey','your data',[true]);
 * Store.get('localKey',[true]);
 * Store.clearItem('localKey',[true]);
 * Store.getAll([true]);   ===>  {key1:value1,key2:value2}
 * Store.clearAll([true]);
 *
 */

var STORE_CACHE_KEYS = '_Store_CHEN_';

var Store = {
    CACHE_KEY: STORE_CACHE_KEYS,
    supportSession: false,
    supportLocal: false,
    supportStorage: false,
    CACHE_MAP_LOCAL: {},
    CACHE_MAP_SESSION: {},
    REG_FLAG: new RegExp(STORE_CACHE_KEYS)
};

/**
 * 存储模块初始化函数
 */
Store._init = function () {
    this.supportSession = this.supportType('sessionStorage');
    this.supportLocal = this.supportType('localStorage');
    this.supportStorage = this.supportSession && this.supportLocal;
};

/**
 * 检测浏览器是否支持Storage
 *
 *@param type {String} 需要检测的类型
 *
 *@return {Boolean}
 *
 */
Store.supportType = function (type) {
    return window[type];
};

/**
 * 进行数据存储
 *
 *@param keys      {String}   需要存储的keys
 *@param data      {Object|Array|Number|String}   需要存储的数据，可以任何类型
 *@param [forever] {Boolean}  是否存储在localStorage中
 *
 */
Store.set = function (keys, data, forever) {

    if (!this.supportStorage) return;

    keys += this.CACHE_KEY;

    var sData = JSON.stringify({
        timestamp: +new Date(),
        data: data
    });

    if (forever) {
        window.localStorage[keys] = sData;
    } else {
        window.sessionStorage[keys] = sData;
    }

};

/**
 * 提取数据
 *
 *@param keys      {String}  存储的keys
 *@param [forever] {Boolean} 是否获取localStorage的数据
 *
 *@return {Object|null} 返回数据或者是null
 *
 */
Store.get = function (keys, forever) {

    if (!this.supportStorage) return null;

    keys += this.CACHE_KEY;

    var sData = forever ? window.localStorage[keys] : window.sessionStorage[keys],
        result = sData ? JSON.parse(sData).data : null;

    return result;
};

/**
 *删除某一项数据
 *
 *@param keys      {String}  存储的keys
 *@param [forever] {Boolean} 是否删除localStorage的数据
 *
 */
Store.clearItem = function (keys, forever) {

    if (!this.supportStorage) return;

    keys += this.CACHE_KEY;

    if (forever) {
        window.localStorage.removeItem(keys);
    } else {
        window.sessionStorage.removeItem(keys);
    }
};

/**
 * 获取全部
 *
 *@param [forever] {Boolean} 是否获取localStorage的数据
 *
 *@return {Object|null} 返回所有的存储数据或者null
 *
 */
Store.getAll = function (forever) {

    if (!this.supportStorage) return null;

    var allData = {},
        store = forever ? window.localStorage : window.sessionStorage;

    for (var k in store) {

        if (store.hasOwnProperty(k)) {

            var keys = k.replace(this.REG_FLAG, '');
            var value = this.get(keys, forever);

            if (value) allData[keys] = this.get(keys, forever);
        }

    }

    return allData;
};

/**
 * 删除全部
 *
 *@param [forever] {Boolean}  是否删除localStorage的数据
 *
 */
Store.clearAll = function (forever) {

    if (!this.supportStorage) return;

    var b_store = forever ? window.localStorage : window.sessionStorage;

    for (var keys in b_store) {
        // ****只删除Store.js设置的数据，不删除其他的数据
        if (b_store.hasOwnProperty(keys) && this.REG_FLAG.test(keys)) {
            b_store.removeItem(keys);
        }
    }
};

/**
 * 尝试从缓存中获取数据
 *
 *@param keys {String}        存储的数据keys
 *@param [forever] {Boolean}  是否是localStorage的数据
 *
 *@return {Object|null} 从缓存中读取的数据
 *
 */
Store._getCache = function (keys, forever) {

    var value = null;
    if (forever && this.supportLocal) {
        value = this.CACHE_MAP_LOCAL[keys];
    }

    if (!forever && this.supportSession) {
        value = this.CACHE_MAP_SESSION[keys];
    }

    return value;
};

/**
 * 进行数据存储
 *
 *@param keys      {String}   需要存储的keys
 *@param data      {Object|Array|Number|String}   需要存储的数据，可以任何类型
 *@param [forever] {Boolean}  是否存储在localStorage中
 *
 */
Store._setCache = function (keys, data, forever) {

    if (forever && this.supportLocal) {
        this.CACHE_MAP_LOCAL[keys] = data;
    }

    if (!forever && this.supportSession) {
        this.CACHE_MAP_SESSION[keys] = data;
    }
};

/**
 * 删除缓存中的数据
 *
 *@param keys      {String}   需要存储的keys
 *@param [forever] {Boolean}  是否存储在localStorage中
 *
 */
Store._clearCache = function (keys, forever) {

    if (forever && this.supportLocal) {
        this._setCache(keys, null, forever);
    }

    if (!forever && this.supportSession) {
        this._setCache(keys, null, forever);
    }
};

Store._init();

if (typeof module == 'undefined') {
    module = {};
}

module.exports = Store;


