/**
 * Created by CHEN-BAO-DENG on 2017/3/24.
 */


function MyPlugin(options) {
    // Configure your plugin with options...
}

MyPlugin.prototype.apply = function (compiler) {
    // ...
    compiler.plugin('compilation', function (compilation) {
        console.log('The compiler is starting a new compilation...');

        compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {

            // console.log(htmlPluginData);
            // // htmlPluginData.html += 'The magic footer';
            // var newJs = [];
            // for (var i = 1; i < htmlPluginData.assets.js.length; i++) {
            //     newJs.push(htmlPluginData.assets.js[i]);
            // }
            //
            // htmlPluginData.assets.js = newJs;
            callback(null, htmlPluginData);
        });
    });

};

module.exports = MyPlugin;