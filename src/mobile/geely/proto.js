/**
 * Created by Administrator on 2017/2/6.
 *
 * 当聊天消息超过多少条，需要清除先前的聊天记录，释放资源
 */
var socketFrame = require('../../libs/SocketFrame');
var URLS = require('../../libs/URLS');
var MATH = require('../../libs/MATH');

var INSTRUCT_MODULE = {}, MESSAGE_ID = 1;
var PRE_DATE = {};
// 检测是否支持聊天的基本功能
var CHECK_SUPPORT_CHAT = (function () {

    // support Buffer;
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
})();

var params = URLS.queryUrl();
params.uid = params.uid || MATH.selectFrom(555555, 63698523);

// 支持聊天功能的（protobuf && arrayBuffer）
if (CHECK_SUPPORT_CHAT) {

    var ProtoBuf = dcodeIO.ProtoBuf;
    var PROTO_FILE = ProtoBuf.loadProtoFile("ld_client_messenger.proto");
    // 指令模块
    INSTRUCT_MODULE[2010] = PROTO_FILE.build("SimpleMessage");
    INSTRUCT_MODULE[2011] = PROTO_FILE.build("SimpleMessageACK");
    var MUTIL_INSTRUCT = PROTO_FILE.build('SimpleMessageMutil');

    // ------------------------------------- **********  WebSocket 对应的函数 ********** --------------------------------

    var ws = new WebSocket('ws://192.168.110.148:8200/?uid=' + params.uid + '&token=123&sec=987&appid=123');

    function OPEN_FN() {
        ws.binaryType = 'arraybuffer';

        console.log('您已经加入，尽情聊天吧');

        // 监听消息
        ws.onmessage = MESSAGE_FN;
    }

    function MESSAGE_FN(e) {

        // 数据源解析
        var result = socketFrame.parseSendFrame(e.data); // Object
        var module_data = INSTRUCT_MODULE[result.instructions].decode(result.data);

        switch (result.instructions) {
            case 2010:
                parseInstruction_2010(module_data);
                break;
            case 2011:
                console.log('确认指令INSTRUCT', result.instructions, module_data);
                break;
        }
    }

    function CLOSE_FN(e) {
        // CHAT_ROOT.append('<div class="system-msg add">链接被关闭</div>');
        console.log('CLOSE:', e);
    }

    function ERROR_FN(e) {
        // CHAT_ROOT.append('<div class="system-msg add">链接发生了错误</div>');
        console.log('ERROR:', e);
    }

    ws.onopen = OPEN_FN;
    ws.onerror = ERROR_FN;
    ws.onclose = CLOSE_FN;

    // ------------------------------------- **********  WebSocket 对应的函数 ********** --------------------------------

} else {

    // 不支持聊天环境
    // CHAT_ROOT.append('<div class="system-msg add">当前环境暂不支持聊天功能，请升级</div>');
    dialog.show('error', '当前环境暂不支持聊天功能', 1);
}


// 解析2010的指令
function parseInstruction_2010(module_data) {

    var domHtml;
    // 解析聊天时间 ==> 基于服务器时间
    parseDate(module_data.time);

    if (module_data.sender == params.uid) {
        domHtml = '<div class="msg-cont float-right"><div class=" msg gray-bubble clear-both">' + module_data.content + '</div></div>';
    } else {
        domHtml = '<div class="msg-cont"><div class="user-text">' + module_data.sender + '</div><div class=" msg blue-bubble clear-both">' + module_data.content + '</div></div>';
    }

}

// 解析时间
function parseDate(date) {

    date = date * 1000;

    var oDate = new Date(date),
        h = oDate.getHours(), m = oDate.getMinutes();

    if (PRE_DATE.h != h || PRE_DATE.m != m) {

        PRE_DATE.h = h;
        PRE_DATE.m = m;
    }

    oDate = null;
}

function logResultInfo(result) {
    console.log("\n\n使用ld_client_messenger." + socketFrame.INSTRUCT[result.instructions] + '进行解析...');
    console.log('received_frame(ArrayBuffer=>Unit8Array): ');
    socketFrame.showData(result.origin, true);
    console.log('\n', result, '\n\n======================================================');
}

// 发送单消息的结构
function sendMessageFormInput() {

    var chatMsg = $('#chat-msg')[0], msg = chatMsg.value;

    if (!msg) return;

    var module_buffer = build_2010_Unit(params.uid, msg, true);
    var send_frame = socketFrame.createSendFrame(2010, MESSAGE_ID++, 123/*appid*/, new Uint8Array(module_buffer));

    ws.send(send_frame.buffer);
    chatMsg.value = '';
}

// 构建单个消息结构
function build_2010_Unit(uid, msg, buffer) {
    var module = new INSTRUCT_MODULE[2010]();
    var time = +new Date() / 1000 >> 0;

    module.setSender(parseInt(uid));
    module.setContent(msg);
    module.setTime(time);

    if (buffer) {
        return module.toArrayBuffer();
    }

    return module;
}

// 发送多消息的结构
function sendMessagesFormInput() {

    var chatMsg = $('#chat-msg')[0];
    var msg = chatMsg.value;

    if (!msg) return;

    var module1 = build_2010_Unit(params.uid, '1234567');
    var module2 = build_2010_Unit(params.uid, 'hahaha');

    var module = new MUTIL_INSTRUCT();
    module.setCount(2);
    module.setExtraMsg([module1, module2]);

    var buffer = module.toArrayBuffer();
    var send_frame = socketFrame.createSendFrame(2010, MESSAGE_ID++, 123/*appid*/, new Uint8Array(buffer));

    ws.send(send_frame.buffer);
}




