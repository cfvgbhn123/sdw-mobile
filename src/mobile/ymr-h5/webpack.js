/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var path = require('path');


var webpack = require('webpack');

var path = require('path');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var BASE_CONFIG = function (option) {

    var baseConfig = {
        context: option.dirname,
        entry: option.entry,
        output: {
            path: option.buildPath,
            filename: 'js/[name].min.js?[hash:4]'  // js导出的路径
        },
        module: {

            // 规则
            rules: [
                {
                    test: /\.css$/,

                    //在原有基础上加上一个postcss的loader就可以了
                    // loaders: ['style-loader', 'css-loader', 'postcss-loader']
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader!postcss-loader'
                    })
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: path.resolve(__dirname, '../node_modules'), // 排除无用的js目录
                    include: path.resolve(__dirname)
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    // loader: 'url-loader?limit=1204&name=../images/[name].[ext]?[hash:4]'
                    loader: 'url-loader?limit=8192&name=images/[name].[ext]'
                },

                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader!postcss-loader!sass-loader'
                    })
                },
            ]
        },
        resolve: {
            // alias: {
            //     'vue$': 'vue/dist/vue.common.js'
            // }

            alias: {
                'vue$': 'vue/dist/vue.js'
            }
        },

        plugins: [
            // 文件输出的位置
            new ExtractTextPlugin("styles.css?[hash:4]")
            // new CommonsChunkPlugin('commons'),
        ]
    };


    return baseConfig;
};

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var BUILD_PATH = path.resolve(__dirname, '../../../v2/mobile/ymr-h5/');

var bases = BASE_CONFIG({
    dirname: __dirname,
    buildPath: BUILD_PATH,
    entry: {
        index: './index.js',
        // gift: './gift.js',
    }
});



// 配置模板文件
bases.plugins.push(new HtmlWebpackPlugin({
        title: '',
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

// bases.plugins.push(new HtmlWebpackPlugin({
//         title: '',
//         template: path.resolve(__dirname, 'gift.html'), // 源模板文件
//         filename: 'gift.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
//         minify: {
//             // removeAttributeQuotes: false,
//             removeComments: true,
//             removeEmptyAttributes: true,
//             removeTagWhitespace: true,
//             collapseWhitespace: true,
//             minifyCSS: true,
//             minifyJS: true,
//         },
//         // showErrors: true,
//         // inject: 'body',
//         chunks: ["gift"]
//     })
// );

// 进行图像文件拷贝
bases.plugins.push(
    new CopyWebpackPlugin([{
        from: __dirname + '/images/',
        to: BUILD_PATH + '/images/'
    }])
);

//
// bases.plugins.push(
//     new CopyWebpackPlugin([{
//         from: __dirname + '/gift-images/',
//         to: BUILD_PATH + '/images/'
//     }])
// );

module.exports = bases;