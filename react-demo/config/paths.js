'use strict';

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const projectName = process.argv[2]

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  projectName,
  // process.env.PUBLIC_URL
  process.env.PUBLIC_URL + '/' + projectName
);

const buildPath = process.env.BUILD_PATH || 'build/' + projectName;

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

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

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: indexJsList,
  appIndexHtml: indexHtmlList,
  entries,
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath,
};



module.exports.moduleFileExtensions = moduleFileExtensions;
