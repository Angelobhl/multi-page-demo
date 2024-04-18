const { defineConfig } = require('@vue/cli-service')

const projectName = require('./config/project')
const glob = require('glob')

let pages = {}
glob.sync('./src/pages/' + projectName.name + '/*/index.js').forEach(filepath => {
  let fileList = filepath.split('/')
  let fileName = fileList[fileList.length - 2]
  pages[fileName] = {
    entry: `src/pages/${projectName.name}/${fileName}/index.js`,
    // 模板来源
    template: `src/pages/${projectName.name}/${fileName}/index.html`,
    // 在 dist/index.html 的输出
    filename: `${fileName}.html`,
    // 提取出来的通用 chunk 和 vendor chunk。
    chunks: ['chunk-vendors', 'chunk-common', fileName]
  }
})

module.exports = defineConfig({
  productionSourceMap: false,
  pages,
  outputDir: 'dist/' + projectName.name,
  publicPath: '/' + projectName.name,
  assetsDir: 'static',
  transpileDependencies: true
})
