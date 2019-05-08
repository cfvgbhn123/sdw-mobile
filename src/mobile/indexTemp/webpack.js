/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var path = require('path');
var BASE_CONFIG = require('../../webpack-base');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_PATH = path.resolve(__dirname, '../../../v2/mobile/indexTemp/');

var bases = BASE_CONFIG({
    dirname: __dirname,
    buildPath: BUILD_PATH,
    entry: {
        index: './index2.js',
        bannerindex:'./bannerindex.js',
        brightindex:'./brightindex',
        jdcenter:'./jdcenter',
        geelycenter:'./geelycenter',
        test:'./test',
    }
});



// console.log(process.env.argv);

// 配置模板文件
bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'index2.html'), // 源模板文件
        filename: 'index.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks:["index"]
    })
);
bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'brightindex.html'), // 源模板文件
        filename: 'brightindex.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks: ["brightindex"]
    })
);


bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'bannerindex.html'), // 源模板文件
        filename: 'bannerindex.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks: ["bannerindex"]
    })
);


bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'jdcenter.html'), // 源模板文件
        filename: 'jdcenter.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks: ["jdcenter"]
    })
);


bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'geelycenter.html'), // 源模板文件
        filename: 'geelycenter.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks: ["geelycenter"]
    })
);

bases.plugins.push(new HtmlWebpackPlugin({
        title: '游戏中心',
        template: path.resolve(__dirname, 'test.html'), // 源模板文件
        filename: 'test.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        chunks: ["test"]
    })
);
// 进行图像文件拷贝
bases.plugins.push(
    new CopyWebpackPlugin([{
        from: __dirname + '/images/',
        to: BUILD_PATH + '/images/'
    }])
);

module.exports = bases;