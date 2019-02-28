/**
 * Created by CHEN-BAO-DENG on 2017/2/9.
 *
 * 用于闪电玩webSocket的发送帧处理库（基于protobuf.js  https://github.com/dcodeIO/ProtoBuf.js/）
 *
 * ###### toUint8Array中的参数revers，为了结合protobuf的格式，务必填写true
 * ###### proto的配置文件，注意只能使用javascript中支持的格式
 *
 *
 */
var SocketFrame = {
    // 指令映射
    INSTRUCT: {
        2010: 'SimpleMessage',      // 聊天数据结构
        2011: 'SimpleMessageACK'    // 服务端确认收到指令
    },

    // 指令字节长度定义
    INSTRUCT_ID_LEN: 4,
    RECEIVER_ID_LEN: 4,
    MESSAGE_ID_LEN: 4
};

/**
 * 根据参数生成发送帧
 *
 * @param instructions {Number}     指令的id
 * @param messageID    {Number}     消息的id
 * @param receiverID   {Number}     接受对象的id
 * @param buffer       {Uint8Array} 需要发送的数据
 *
 * @return {Uint8Array|null} 返回封装后的发送帧
 *
 */
SocketFrame.createSendFrame = function (instructions, messageID, receiverID, buffer) {

    if (arguments.length != 4) return null;

    var buffer_byteLength = 0;
    if (buffer.constructor == Uint8Array) {
        buffer_byteLength = buffer.byteLength;
    }

    // 指令长度+消息ID长度+接收者ID长度+包体长度
    var bLen = this.INSTRUCT_ID_LEN + this.MESSAGE_ID_LEN + this.RECEIVER_ID_LEN + buffer_byteLength;

    var d1 = this.toUint8Array(new Uint16Array([bLen]), true);
    var d2 = this.toUint8Array(new Uint32Array([instructions]), true);
    var d3 = this.toUint8Array(new Uint32Array([messageID]), true);
    var d4 = this.toUint8Array(new Uint32Array([receiverID]), true);

    return this.concatBuffer(d1, d2, d3, d4, buffer);
};

/**
 * 解析接收到的数据帧
 *
 * @param buffer {ArrayBuffer}  buffer数据
 *
 * @return {Object|null} 返回数据集合
 *
 */
SocketFrame.parseSendFrame = function (buffer) {

    if (buffer.constructor != ArrayBuffer) return null;

    var data_8 = new Uint8Array(buffer);

    var result = {};

    result.origin = data_8;
    result.byteLength = this.subBufferToU_16(data_8, 0, 2)/*return int*/;
    result.instructions = this.subBufferToU_32(data_8, 2, 6)/*return int*/;
    result.messageID = this.subBufferToU_32(data_8, 6, 10);
    result.receiverID = this.subBufferToU_32(data_8, 10, 14);

    // 剔除前面的14个字节
    var buf = buffer.slice(14);
    result.data = new Uint8Array(buf);

    return result;
};

/**
 * 将Uint8Array数据进行裁剪，返回裁剪后的数据
 *
 * @param data_8    {Uint8Array}  数据
 * @param offset    {Number}      开始的位置
 * @param end       {Number}      结束的位置
 *
 * @return {Uint32Array} 返回源数据
 *
 */
SocketFrame.subBufferToU_32 = function (data_8, offset, end) {
    // 截取部分数据
    var sub = data_8.subarray(offset, end).reverse();
    var nBuf = new Uint8Array(sub);
    return new Uint32Array(nBuf.buffer)[0];
};


SocketFrame.subBufferToU_16 = function (data_8, offset, end) {
    // 截取部分数据
    var sub = data_8.subarray(offset, end).reverse();
    var nBuf = new Uint8Array(sub);
    return new Uint16Array(nBuf.buffer)[0];
};

/**
 * 进行Uint8Array数据拼接
 *
 * @param [data_8] {Uint8Array} 需要拼接的buffer
 *
 * @return {Uint8Array}
 *
 */
SocketFrame.concatBuffer = function (data_8) {
    var index = 0, len = 0, i;

    for (i = 0; i < arguments.length; i++) {
        len += arguments[i].byteLength;
    }

    var result = new Uint8Array(len);

    for (i = 0; i < arguments.length; i++) {
        for (var j = 0; j < arguments[i].byteLength; j++) {
            result[index++] = arguments[i][j];
        }
    }

    return result;
};

/**
 * 将Uint16Array,Uint32Array,Uint8Array转成Uint8Array类型
 *
 * @param data     {Uint16Array|Uint32Array|Uint8Array} 需要拼接的buffer
 * @param [revers] {Boolean} 是否需要进行数据逆置，默认否
 *
 * @return {Uint8Array}
 *
 */
SocketFrame.toUint8Array = function (data, revers) {

    if (data.constructor == Uint8Array) {
        return revers ? data.reverse() : data;
    }

    if (data.constructor == Uint16Array || Uint32Array) {
        var result = new Uint8Array(data.buffer);

        if (revers) {
            result = result.reverse();
        }

        return result;
    }

    return null;
};


/**
 * 在控制台显示数据信息
 *
 * @param data   {Uint16Array|Uint32Array|Uint8Array} 数据
 * @param [slic] {Boolean}   数据格式分割
 *
 */
SocketFrame.showData = function (data, slic) {
    if (!data) return;

    if (slic) {
        var oLen = data.subarray(0, 2).toString();
        var oInstructions = data.subarray(2, 6).toString();
        var oMessage = data.subarray(6, 10).toString();
        var oReceiver = data.subarray(10, 14).toString();
        var oData = data.subarray(14, data.byteLength).toString();

        var result = [oLen, oInstructions, oMessage, oReceiver, oData];
        console.log('data[' + data.byteLength + '] ', result.join(' | '));
    } else {
        console.log('data[' + data.byteLength + '] ', data.toString());
    }

};

if (typeof module == 'undefined') {
    module = {};
}
module.exports = SocketFrame;

