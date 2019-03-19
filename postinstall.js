
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

//
//  ████████╗██╗   ██╗██╗██╗
//  ╚══██╔══╝██║   ██║██║██║
//     ██║   ██║   ██║██║██║
//     ██║   ██║   ██║██║██║
//     ██║   ╚██████╔╝██║███████╗
//     ╚═╝    ╚═════╝ ╚═╝╚══════╝
//

// we should only let it run when the actual template is being
// initialized when running react-native init. In this case
// .npmignore will not exist becsuse it is not published to npmjs.com.
if (fs.existsSync(path.join(__dirname, '.npmignore'))) {
  process.exit()
}

// This script is run from node_modules/react-native-template-tuil so we
// should go two directories up to get to the project root.
const projectRoot = path.join(__dirname, '..', '..')

// When publishing this package to npm we want to include the files listed below because
// npmjs.com / yarnpkg.com are using these files for their landing pages.
const templateFilesToDelete = ['README.md', 'LICENSE']
// Because we base this template on the official react-native version, there are
// some files we needed remove because we are supplying our own versions.
const projectFilesToDelete = ['.flowconfig', 'index.js', 'standard.json', 'App.js', '__tests__/App-test.js', '__tests__']

const deletePath = filePath => {
  if (!fs.existsSync(filePath)) {
    return
  }

  if (fs.lstatSync(filePath).isDirectory()) {
    fs.rmdirSync(filePath)
  } else {
    fs.unlinkSync(filePath)
  }
}

const writeFile = (filePath, data) => {
  return fs.writeFileSync(filePath, data)
}

const replaceFileContents = (filePath, searchValue, replaceValue) => {
  writeFile(filePath, fs.readFileSync(filePath, 'utf8').replace(searchValue, replaceValue))
}

// Get the android and ios project dirs
const app = require(path.join(projectRoot, 'app.json'))

const iosAppDir = path.join(projectRoot, 'ios', app.name)
const androidAppDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', app.name.toLowerCase())

// Modify the entry point to src/index instead of index.
replaceFileContents(path.join(iosAppDir, 'AppDelegate.m'), 'jsBundleURLForBundleRoot:@"index"', 'jsBundleURLForBundleRoot:@"src/index"')
replaceFileContents(path.join(androidAppDir, 'MainApplication.java'), '"index"', '"src/index"')


// Update the package.json to include standard.
const packageJson = require(path.join(projectRoot, 'package.json'))
const standardConfig = require('./standard.json')

packageJson.scripts.lint = 'standard **/*.{ts,tsx,js,jsx} | yarn snazzy && yarn tsc'
packageJson.standard = Object.assign({}, packageJson.standard, standardConfig)

writeFile(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2))

// Lets delete unneeded files / directories
templateFilesToDelete.forEach(filePath => deletePath(path.join(__dirname, filePath)))
projectFilesToDelete.forEach(filePath => deletePath(path.join(projectRoot, filePath)))


// Remove this script.
deletePath('postinstall.js')

// Make sure we are standardjs compliant
execSync('yarn standard **/*.{ts,tsx,js,jsx} --fix', {stdio: 'inherit'})
