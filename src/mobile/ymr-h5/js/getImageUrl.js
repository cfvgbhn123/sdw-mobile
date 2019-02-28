/**
 * Created by CHEN-BAO-DENG on 2018/1/10 0010.
 */
// js/app.js：指定确切的文件名。
//	js/*.js：某个目录所有后缀名为js的文件。
//	js/**/*.js：某个目录及其所有子目录中的所有后缀名为js的文件。
//	!js/app.js：除了js/app.js以外的所有文件。
//	*.+(js|css)：匹配项目根目录下，所有后缀名为js或css的文件。
//流 stream   管道 pipe 管道
//如果想在读取流和写入流的时候做完全的控制，可以使用数据事件。但对于单纯的文件复制来说读取流和写入流可以通过管道来传输数据。
var fs = require("fs");
var path = require("path");
/*
 * 复制目录中的所有文件包括子目录
 * @src param{ String } 需要复制的目录   例 images 或者 ./images/
 * @dst param{ String } 复制到指定的目录    例 images images/
 */


//获取当前目录绝对路径，这里resolve()不传入参数

console.log('<---------------   开始拷贝图像资源   --------------->');
console.log('<--------------------------------------------------->');

var filePath = path.resolve();

// var projectPath = require('./MT_ROOT');
// var copyFilePath = projectPath + 'resources\\';

var copy = function (src) {

    var fileList = [];
    //判断文件需要时间，则必须同步
    if (fs.existsSync(src)) {

        fs.readdir(src, function (err, files) {

            if (err) {
                console.log(err);
                return;
            }


            files.forEach(function (filename) {

                //url+"/"+filename不能用/直接连接，Unix系统是”/“，Windows系统是”\“
                var url = path.join(src, filename);
                // var dest = path.join(dst, filename);
                var dest = filename;
                // console.log(dest)
                fs.stat(path.join(src, filename), function (err, stats) {
                    if (err) throw err;

                    //是文件
                    if (stats.isFile() && checkFile(filename) && 8192 < stats.size) {
                        console.log('"' + 'images/' + dest + '",');
                        fileList.push('"' + 'images/' + dest + '"');

                        // fs.writeFile('./wfile.txt',data,{flag:'w',encoding:'utf-8',mode:'0666'},function(err){
                        //     if(err){
                        //         console.log("文件写入失败")
                        //     }else{
                        //         console.log("文件写入成功");
                        //
                        //     }
                        //
                        // })
                    }
                    // else if (stats.isDirectory()) {
                    //     exists(url, dest, copy);
                    // }
                });
            });

            console.log(fileList)

        });
    } else {
        console.log("给定的目录不存，读取不到文件");
        return;
    }
};

function exists(url, dest, callback) {
    fs.exists(dest, function (exists) {
        if (exists) {
            callback && callback(url, dest);
        } else {
            //第二个参数目录权限 ，默认0777(读写权限)
            fs.mkdir(dest, function (err) {
                // console.log(dest);
                if (err) {
                    console.log(err);
                    return;
                }
                callback && callback(url, dest);
            });
        }
    });
}

// 只筛选plist的文件图集
function checkFile(filename) {

    if (!/(jpg|png)$/.test(filename)) return false;

    return true;

    // if (/^(static|scene|leader)/.test(filename)) {
    //     return true;
    // }

}

// exports.copy = copy;
//copy("./views/","./www/");
copy('../images/');