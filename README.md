# 多页面应用创建方案


## React18.2篇

Step 1：创建一个基础项目

`npx create-react-app react-demo`

Step 2: 展开webpack配置

`npm run eject`

Step 3: 修改config/paths.js文件

在`const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');`下面添加\
`const projectName = process.argv[2]`

```
将
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

const buildPath = process.env.BUILD_PATH || 'build';

改成：
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  projectName,
  process.env.PUBLIC_URL + '/' + projectName
);

const buildPath = process.env.BUILD_PATH || 'build/' + projectName;
```


在`module.exports`之前添加如下代码：
```
//这里获取所有的入口文件生成对象对应所有的路径
var glob = require('glob')
function getEntries(globPath) {
  const files = glob.sync(globPath),
    entries = {};
  files.forEach(function(filepath) {
    const split = filepath.split('/');
    const name = split[split.length - 2];
    entries[name] = './' + filepath;
  });
  return entries;
}
// 如果打算使用typescript，可以将'index.js'改成'index.tsx'
const entries = getEntries('src/pages/' + projectName + '/*/index.js');

//这里将入口对象转为路径数组
function getIndexJs() {
  const indexJsList = [];
  Object.keys(entries).forEach((name) => {
    const indexjs = resolveModule(resolveApp, `src/pages/${projectName}/${name}/index`)
    indexJsList.push({
      name,
      path: indexjs
    });
  })
  return indexJsList;
}
const indexJsList = getIndexJs()

//设定页面模板路径
function getIndexHtml() {
  const indexHtmlList = {};
  Object.keys(entries).forEach((name) => {
    // const indexHtml = resolveModule(resolveApp, `src/pages/projectName/${name}/index.html`)
    const indexHtml = resolveApp(`src/pages/${projectName}/${name}/index.html`)
    indexHtmlList[name] = indexHtml;
  })
  return indexHtmlList;
}
const indexHtmlList = getIndexHtml()
```


将`module.exports`中的`appIndexJs: resolveModule(resolveApp, 'src/index')`,改成：
```
appIndexJs: indexJsList,
appIndexHtml: indexHtmlList,
entries,
```

Step 4: 修改config/webpack.config.js

在最后的`return`之前添加：
```
const entry = {};
paths.appIndexJs.forEach(e => {
  entry[e.name] = [
    isEnvDevelopment && !shouldUseReactRefresh && webpackDevClientEntry,
    e.path
  ].filter(Boolean);
});
```

`entry: paths.appIndexJs,`改成：`entry: entry,`

```
将
new HtmlWebpackPlugin(
  Object.assign(
    {},
    {
      inject: true,
      template: paths.appHtml,
    },
    isEnvProduction
      ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        }
      : undefined
  )
),
改成：

...Object.keys(paths.entries).map((name) => {
  return new HtmlWebpackPlugin(
    Object.assign(
      {},
      {
        inject: true,
        chunks: [name],
        template: paths.appIndexHtml[name],
        filename: name + '.html',
      },
      isEnvProduction
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        : undefined
    )
  );
}),
```

修改`new WebpackManifestPlugin()`的配置：
```
将
const entrypointFiles = entrypoints.main.filter(
  fileName => !fileName.endsWith('.map')
);
改成：

const entrypointFiles = {};
Object.keys(entrypoints).forEach((entry)=>{
  const files = entrypoints[entry].filter(
    fileName => !fileName.endsWith('.map')
  );
  entrypointFiles[entry]=files;
});
```

修改编译后js、css等相关的地址，添加最后一级的文件目录名`[name]`,例如：
```
'static/css/[name]/[name].[contenthash:8].css',
'static/css/[name]/[name].[contenthash:8].chunk.css',
'static/js/[name]/[name].[contenthash:8].js'
'static/js/[name]/bundle.js',
'static/js/[name]/[name].[contenthash:8].chunk.js'
'static/js/[name]/[name].chunk.js',
```

Step 5: `scripts`目录下创建`b.js`，内容如下
```
const glob = require('glob')
const path = require('path')
glob.sync(path.resolve(__dirname, '../src/pages/*/')).forEach(page => {
  try{
    let pageConfig = require(page + '/package.json')
    let projectName
    if (pageConfig.toBuild) {
      projectName = pageConfig.name
      console.log('开始编译【' + projectName + '】')
      let exec = require('child_process').execSync;
      exec('node scripts/build.js ' + projectName, {stdio: 'inherit'});
      console.log('编译【' + projectName + '】完成')
    }
  } catch(e){}
})

```

Step 6: 注释掉`scripts/build.js`和`scripts/start.js`里这段代码
```
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}
```

Step 7: `package.json`里的`scripts`处添加新命令：`"b": "node scripts/b.js"`

Step 8: 新建`.env`文件，内容如下
```
PUBLIC_URL=/build
```

### 多页面项目
在`src`下创建目录：`pages/page1/demo`，将原先`src`下的所有文件移动到`demo`目录下，把`public`里的`index.html`文件复制到`demo`目录下并删除\
可以在page1下，创建多个页面，如demo1、demo2等

在`src/pages/page1`里添加`package.json`，内容如下
```
{
  "name": "page1",
  "toBuild": true
}
```

### 单入口spa项目
安装router库\
`npm install react-router-dom`

在`src`下创建目录：`pages/page2/index`，并在当前目录下创建一个spa项目

在`src/pages/page2`里添加`package.json`，内容如下
```
{
  "name": "page2",
  "toBuild": true
}
```

### 本地调试
`npm run start [项目名]`，例如：
```
// src/pages/page1
npm run start page1

// src/pages/page2
npm run start page2
```
本地访问方式：
```
// 多页面项目
http://localhost:3000/build/page1/demo.html

// 单入口spa项目
http://localhost:3000/build/page2
http://localhost:3000/build/page2/helloWorld
```

### 打包编译
`npm run b`\
pages下每个字目录下的`package.json`中的`toBuild`控制着当前项目是否进行编译、
不参与编译的，将会从已编译的`build`目录中删除

### 发布
将`build`整个目录发送到目标服务器即可\
由于编译后可能会有项目删除，建议覆盖，不要替换

如果想要修改`build`这个文件夹的名字，需要修改两处：\
1. `config/paths.js`里`const buildPath = process.env.BUILD_PATH || 'build/' + projectName;`处的`build`
2. Step 8添加的文件`.env`里的`PUBLIC_URL`

### nginx配置
```
// http://host.com/build/page1/demo.html
// http://host.com/build/page2
// http://host.com/build/page2/helloWorld
location ~* ^/build/([_\-a-zA-Z0-9]+)/.* {
    root 服务器目录;
    try_files $uri $uri/ /build/$1/index.html = 404;
}
```

### 如果线上地址不需要build这一级，可做如下修改

删除`.env`文件

`config/paths.js`中`process.env.PUBLIC_URL + '/' + projectName`改成`process.env.PUBLIC_URL`

```
// nginx配置
// http://host.com/page1/demo.html
// http://host.com/page2
// http://host.com/page2/helloWorld
location ~* ^/([_\-a-zA-Z0-9]+)/.* {
    root 服务器目录/build;
    try_files $uri $uri/ /$1/index.html = 404;
}
```

### 特点
1. 把小型项目放在一个项目里，每次新增一个小项目，不需要重新创建自动发布配置、nginx重定向配置
2. 适用于项目体量小的、亦或是活动页面需求多的
3. 所有项目都归属于一个站点的


## VUE3 (webpack)篇

Step 1：创建一个基础项目

`vue create vue-webpack-demo`

Step 2: 修改`vue.config.js`

改成如下
```
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

```

Step 3: 创建`config/build.js`文件，内容如下
```
let fs = require('fs')

const glob = require('glob')
const path = require('path')
glob.sync(path.resolve(__dirname, '../src/pages/*/')).forEach(page => {
  try{
    let pageConfig = require(page + '/package.json')
    let projectName
    if (pageConfig.toBuild) {
      projectName = pageConfig.name
      console.log('开始编译【' + projectName + '】')
      fs.writeFileSync('./config/project.js', `exports.name = '${projectName}'`)
      let exec = require('child_process').execSync;
      exec('npm run build', {stdio: 'inherit'});
      console.log('编译【' + projectName + '】完成')
    }
  } catch(e){}
})

```

Step 5: 创建`config/project.js`文件，内容如下
```
exports.name = ''
```

Step 6: `package.json`新增命令:
```
"b": "node config/build.js",
"d": "node config/dev.js"
```

### 多页面项目
在`src`下创建目录：`pages/page1/demo`，将原先`src`下的所有文件移动到`demo`目录下，把`public`里的`index.html`文件复制到`demo`目录下并删除\
可以在page1下，创建多个页面，如demo1、demo2等

在`src/pages/page1`里添加`package.json`，内容如下
```
{
  "name": "page1",
  "toBuild": true
}
```

### 本地调试
`npm run d [项目名]`，例如：
```
// src/pages/page1
npm run d page1

// src/pages/page2
npm run d page2
```
本地访问方式：
```
// 多页面项目
http://localhost:8080/page1/demo.html

// 单入口spa项目
http://localhost:8080/page2
http://localhost:8080/page2/helloWorld
```

### 单入口spa项目
安装router库\
`npm install vue-router@4`

在`src`下创建目录：`pages/page2/index`，并在当前目录下创建一个spa项目

在`src/pages/page2`里添加`package.json`，内容如下
```
{
  "name": "page2",
  "toBuild": true
}
```

### 打包编译
`npm run b`\
pages下每个字目录下的`package.json`中的`toBuild`控制着当前项目是否进行编译、
不参与编译的，将会从已编译的`build`目录中删除

### 发布
将`dist`整个目录发送到目标服务器即可\
由于编译后可能会有项目删除，建议覆盖，不要替换

如果想要修改`dist`这个文件夹的名字，需要修改：`vue.config.js`里`outputDir`处的`dist`

### nginx配置
```
// http://host.com/page1/demo.html
// http://host.com/page2
// http://host.com/page2/helloWorld
location ~* ^/([_\-a-zA-Z0-9]+)/.* {
    root 服务器目录/dist;
    try_files $uri $uri/ /$1/index.html = 404;
}
```