const createThemeColorReplacerPlugin = require('./plugin.config')
const vueConfig = {
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    // if prod, add externals
    // externals: isProd ? assetsCDN.externals : {}
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // "primary-color": "orange"
        },
        javascriptEnabled: true
      }
    }
  },
  runtimeCompiler: true
};
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
module.exports = vueConfig;
