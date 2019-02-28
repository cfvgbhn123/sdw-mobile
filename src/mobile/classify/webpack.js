/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var path = require('path');
var BASE_CONFIG = require('../../webpack-base');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_PATH = path.resolve(__dirname, '../../../v2/mobile/classify/');

var bases = BASE_CONFIG({
    dirname: __dirname,
    buildPath: BUILD_PATH,
    entry: {
        index: './index.js',
        search: './search.js',
        server: './server.js'
    }
});


// 配置模板文件
bases.plugins.push(new HtmlWebpackPlugin({
        title: '分类',
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

// 配置模板文件
bases.plugins.push(new HtmlWebpackPlugin({
        title: '搜索',
        template: path.resolve(__dirname, 'search.html'), // 源模板文件
        filename: 'search.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        minify: {
            // removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
        },
        chunks: ["search"]
    })
);

bases.plugins.push(new HtmlWebpackPlugin({
        title: '开服列表',
        template: path.resolve(__dirname, 'server.html'), // 源模板文件
        filename: 'server.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        minify: {
            // removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
        },
        chunks: ["server"]
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