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

