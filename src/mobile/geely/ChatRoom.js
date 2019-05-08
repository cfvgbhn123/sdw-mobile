/**
 * Created by CHEN-BAO-DENG on 2017/3/4.
 *
 * 基于protobuf，websocket的聊天室
 *
 * var chat = new ChatRoom = {
 *      url:'ws://',
 *      messageFn:function(instructions,data){},  // 参数instructions表示指令，data是指令对应的结构体
 *
 * }
 *
 *
 */

var socketFrame = require('../../libs/SocketFrame');

function ChatRoom(option) {

    this.MESSAGEID = 1;
    this._init(option);
}

/**
 *
 * @param option
 * @private
 */
ChatRoom.prototype._init = function (option) {

    var self = this;

    if (this.checkSuppBuffer()) {

        this.INSTRUCT_MODULE = {};

        this.ProtoBuf = dcodeIO.ProtoBuf;
        this.PROTO_FILE = this.ProtoBuf.loadProtoFile("ld_client_messenger.proto");
        // 指令模块
        this.INSTRUCT_MODULE[2010] = this.PROTO_FILE.build("SimpleMessage");
        this.INSTRUCT_MODULE[2011] = this.PROTO_FILE.build("SimpleMessageACK");
        this.MUTIL_INSTRUCT = this.PROTO_FILE.build('SimpleMessageMutil');


        // 创建一个ws对象
        this.ws = new WebSocket(option.url);

        this.ws.onopen = function () {

            self.ws.binaryType = 'arraybuffer';

            option.openFn && option.openFn();
            self.ws.onmessage = function (e) {

                // 数据源解析
                var result = socketFrame.parseSendFrame(e.data); // Object
                var module_data = self.INSTRUCT_MODULE[result.instructions].decode(result.data);

                // 传入指令，以及指令相对应的数据结构
                option.messageFn && option.messageFn(result.instructions, module_data);
            }
        };

        this.ws.onerror = option.errorFn || function () {
            };
        this.ws.onclose = option.closeFn || function () {
            };

    } else {

        console.log('[ChatRoom]: not Support!');
    }
};

/**
 * 根据指令，编译消息体，发送信息
 * @param instructions
 * @param option
 */
ChatRoom.prototype.sendMessage = function (instructions, option) {

    var module_buffer = this['build_' + instructions + '_Unit'](option.uid, option.msg, option.buffer);

    var send_frame = socketFrame.createSendFrame(instructions, this.MESSAGEID++, 123/*appid*/, new Uint8Array(module_buffer));

    this.ws.send(send_frame.buffer);
};

/**
 * 构建2010指令
 * @param uid
 * @param msg
 * @param buffer
 * @return {*}
 */
ChatRoom.prototype.build_2010_Unit = function (uid, msg, buffer) {

    var module = new this.INSTRUCT_MODULE[2010]();
    var time = +new Date() / 1000 >> 0;

    module.setSender(parseInt(uid));
    module.setContent(msg);
    module.setTime(time);

    if (buffer) {
        return module.toArrayBuffer();
    }

    return module;
};

/**
 * 检查是否支持ArrayBuffer
 * @return {boolean}
 */
ChatRoom.prototype.checkSuppBuffer = function () {
    var supportBuffer = true;
    var args = ['Uint8Array', 'Uint16Array', 'Uint32Array', 'WebSocket'];
    for (var i = 0; i < args.length; i++) {
        if (!window[args[i]]) {
            supportBuffer = false;
        }
    }

    // support protoBuf;
    var supportProtoBuf = typeof dcodeIO != 'undefined' && dcodeIO.ProtoBuf;

    return supportBuffer && supportProtoBuf;
};


// window.ChatRoom = ChatRoom;
module.exports = ChatRoom;