/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var path = require('path');
var BASE_CONFIG = require('../../webpack-base');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_PATH = path.resolve(__dirname, '../../../v2/mobile/myset/');

var bases = BASE_CONFIG({
    dirname: __dirname,
    buildPath: BUILD_PATH,
    entry: {
        index: './index.js',
        identify:'./identify.js',
        setPhone:'./setPhone.js'
        // show: './show.js'
    }
});


console.log(process.env.argv);

// 配置模板文件
bases.plugins.push(new HtmlWebpackPlugin({
        title: '我的设置',
        template: path.resolve(__dirname, 'index.html'), // 源模板文件
        filename: 'index.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        minify: {
            // removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
        },
        // showErrors: true,
        // inject: 'body',
         chunks: ["index"]
    })
);

bases.plugins.push(new HtmlWebpackPlugin({
        title: '实名认证',
        template: path.resolve(__dirname, 'identify.html'), // 源模板文件
        filename: 'identify.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        minify: {
            // removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
        },
        // showErrors: true,
        // inject: 'body',
        chunks: ["identify"]
    })
);

bases.plugins.push(new HtmlWebpackPlugin({
        title: '绑定手机号',
        template: path.resolve(__dirname, 'setPhone.html'), // 源模板文件
        filename: 'setPhone.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        minify: {
            // removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
        },
        // showErrors: true,
        // inject: 'body',
        chunks: ["setPhone"]
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