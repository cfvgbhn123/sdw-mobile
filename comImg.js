/**
 * Created by CHEN-BAO-DENG on 2018/3/14 0014.
 */


var images = require("images");

images("./test.jpg")                     //加载图像文件
    // .size(400)                          //等比缩放图像到400像素宽
    // .draw(images("logo.png"), 10, 10)   //在(10,10)处绘制Logo
    .save("./test2.jpg", {               //保存图片到文件,图片质量为50
        quality : 50
    });