/**
 * Created by CBD on 2017/2/6.
 *
 * 简单的URL地址管理
 *
 *###### 参数[decode = true]表示使用decodeURIComponent；默认不使用
 *###### 参数[encode = true]表示使用encodeURIComponent；默认不使用
 *
 * 示例：
 * URLS.queryUrl([decode], [url])
 * URLS.param(params, [encode])
 * URLS.addParam(params, [encode], [url])
 * URLS.encodeURI(uri)
 * URLS.decodeURI(uri)
 * URLS.replaceState(url)
 *
 */

var URLS = {
    URL_MAP: {}
};

/**
 * 获取url的参数，生成参数键值对
 *
 * @param  [decode] {Boolean}  是否decodeURIComponent，默认否
 * @param  [url]    {String}   需要截取参数的url，默认读取浏览器的当前地址
 *
 * @return {Object}
 *
 * URLS.queryUrl(true,'https://www.shandw.com/?a=1&b=2#c=3') ===> {a:1,b:2}
 *
 */
URLS.queryUrl = function (decode, url) {


    function replacePos(strObj, pos, replacetext) {
        var str = strObj.substr(0, pos - 1) + replacetext + strObj.substring(pos, strObj.length);
        return str;
    }

    url = url || location.search || '';

    var fI = url.indexOf('?');
    var lI = url.lastIndexOf('?');

    // 连接上有不合法的？（例如2个？，把最后一个去掉），【留坑】，用正则
    if (fI !== -1 && lI !== -1 && fI !== lI) {
        url = replacePos(url, lI + 1, '&');
    }

    // console.log(fI, lI, url);

    url = url.indexOf('#') !== -1 ? url.split('#')[0] : url;
    url = url.indexOf('?') !== -1 ? url.split('?')[1] : url;

    if (this.URL_MAP[url]) return this.URL_MAP[url];

    var params = {}, items = url.length ? url.split('&') : [],
        item, name, value;

    for (var i = 0; i < items.length; i++) {
        item = items[i].split('=');
        name = decode ? this.decodeURI(item[0]) : item[0];
        value = decode ? this.decodeURI(item[1]) : item[1];

        if (name.length) params[name] = value;
    }

    this.URL_MAP[url] = params;

    return params;
};

/**
 * 将参数序列化
 *
 * @param  params   {Object}  参数的键值对
 * @param  [encode] {Boolean} 是否encodeURI，默认否
 *
 * @return {String}
 *
 * URLS.param({a:1,b:2}) ===> a=1&b=2
 *
 */
URLS.param = function (params, encode) {

    if (typeof params !== 'object') {
        params = {};
    }

    var paramList = [];
    for (var i in params) {


        // if (params.hasOwnProperty(i) && (typeof params[i] !== 'undefined' && params[i] !== '')) {

        if (params.hasOwnProperty(i)) {
            var item = encode ? this.encodeURI(params[i]) : params[i];
            paramList.push(i + '=' + item);
        }
    }

    return paramList.join('&');
};

/**
 * 往url地址后添加参数
 *
 * @param  params   {Object}  参数的键值对
 * @param  [encode] {Boolean} 是否encodeURI
 * @param  [url]    {String}  需要添加参数的网址，默认是当前地址
 *
 * @return {String} 添加参数后的地址
 *
 * URLS.addParam({a:1,b:2},false,'https://www.shandw.com/') ===> https://www.shandw.com/?a=1&b=2
 *
 */
URLS.addParam = function (params, encode, url) {

    var oParam = this.param(params, encode);

    url = url || location.href || '';

    if (url.indexOf('?') == -1) {
        return url + '?' + oParam;
    }

    return url + '&' + oParam;
};

/**
 * 变更URL地址状态，页面不跳转
 *
 * @param  url {String}  需要替换当前的URL地址
 *
 */
URLS.replaceState = function (url) {
    if (arguments.length == 0) return;
    history.replaceState && history.replaceState({}, "", url);
};

/**
 * 编码URI
 *
 *@param uri {String} 需要编码的URI
 *
 *@return {String}    编码后的URI
 *
 */
URLS.encodeURI = function (uri) {

    // if(typeof uri === 'undefined'){
    //     uri = ''
    // }
    // uri = uri || '';

    return encodeURIComponent(uri);
};

/**
 * 解码URI
 *
 *@param uri {String} 需要解码的URI
 *
 *@return {String}    解码后的URI
 *
 */
URLS.decodeURI = function (uri) {
    uri = uri || '';
    return decodeURIComponent(uri);
};

/**
 * 裁切地址参数
 * @param url
 * @return {*}
 */
URLS.spliceParam = function (url) {
    url = url || location.href;
    if (url.indexOf('?') !== -1) {
        return url.split('?')[1];
    }
    return '';
};

module.exports = URLS;