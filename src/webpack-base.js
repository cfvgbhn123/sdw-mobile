/**
 * Created by CHEN-BAO-DENG on 2017/2/23.
 */

var webpack = require('webpack');

var path = require('path');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

function getBaseConfig(option) {

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
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            sass: ExtractTextPlugin.extract({
                                loader: 'css-loader!postcss-loader!sass-loader',
                                // loader: 'css-loader!autoprefixer-loader?browsers=last 4 version!sass-loader',
                                fallbackLoader: 'vue-style-loader'
                            })
                        }
                    }
                },
                {
                    test: /\.css$/,

                    //在原有基础上加上一个postcss的loader就可以了
                    // loaders: ['style-loader', 'css-loader', 'postcss-loader']
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader!postcss-loader'
                    })
                    // loaders: ['style-loader', 'css-loader?importLoaders=1', 'autoprefixer-loader']
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: path.resolve(__dirname, '../node_modules'), // 排除无用的js目录
                    include: path.resolve(__dirname)
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    // loader: 'url-loader?limit=1204&name=../images/[name].[ext]?[hash:4]'
                    loader: 'url-loader?limit=8192&name=images/[name].[ext]?[hash:4]'
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
        ],
        // postcss: function () {
        //     return [require('autoprefixer'), require('postcss-write-svg')];
        // }
    };


    return baseConfig;
}


module.exports = getBaseConfig;

