
import { transformSync, build } from 'esbuild'
import { getExt } from './utils'

const cacheModules = new Map()

const cachePath = `/node_modules/.vite/deps`

export type Js = 'jsx' | 'tsx' | 'js' | 'ts'

export const transformJs = async (inputCode: string, fileType: Js) => {
  const { code, importedNodeModules } = transformImportModules(inputCode)

  const ret = transformSync(code, {
    loader: fileType,
    sourcemap: true,
  })

  await buildesm(importedNodeModules).catch(err => {
    console.log('err: ', err);
  })
  return ret.code
}

export const transformSvg = (filePath: string) => {
  return `export default "${filePath}"`
}

export const transformCss = (inputCode: string) => {
  return `
    const style = document.createElement('style')
    style.innerHTML = \`${inputCode}\`
    document.head.appendChild(style);
  `
}

const getModuleEntry = (moduleName: string) => {
  const modulePath = `${process.cwd()}/node_modules/${moduleName}`
  const fileName = require(`${modulePath}/package.json`).main
  return {
    fileName,
    filePath: `${modulePath}/${fileName}`,
  }
}

const buildesm = async (modules: string[]) => {
  const entryPoints = modules.map(name => {
    const { filePath } = getModuleEntry(name)
    return filePath
  })

  await build({
    entryPoints: entryPoints,
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: `${process.cwd()}/${cachePath}`,
    treeShaking: true,
    metafile: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify("development") // 默认开发模式
    }
  })
}

const transformImportModules = (code: string) => {
  const importRegex = /import\s+[\w\*\s,]*from\s*['"]([\w\*\/\.\-]+)['"]/g;

  const importedNodeModules: string[] = []
  const newCode = code.replace(importRegex, (...args) => {
    const moduleName: string = args[1]
    const fileType = getExt(moduleName)

    // 相对路径
    if (moduleName.startsWith(".")) {
      if (fileType === "svg") {
        return args[0].replace(/\.svg/, ".svg?import")
      }
      return args[0]
    }

    // 判断是否需要编译
    if (!cacheModules.has(moduleName)) {
      importedNodeModules.push(moduleName)
      cacheModules.set(moduleName, true)
    }

    const { fileName } = getModuleEntry(moduleName)

    const newName = `${cachePath}/${moduleName}`
    return args[0].replace(/\s+/g, ' ')
      .replace(`from "${moduleName}"`, `from "${newName}/${fileName}"`)
      .replace(`from '${moduleName}'`, `from '${newName}/${fileName}'`)
  })

  return {
    code: newCode,
    importedNodeModules,
  }
}