import {runAsyncWithSyncPattern} from "./AsyncConverter";

/**
 * @description 异步工作
 */
function asyncWork() {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve('Work Done')
        }, 2000)
    })
}

// 将全局调用挂载到 global 对象，以支持改写
global[asyncWork.name] = asyncWork

/**
 * @description 完成核心工作
 * @note 由于 doCoreWork 会在 global.asyncWork 完成时被重新调用，故要求 doCoreWork 在 asyncWork 未完成前五副作用
 */
function doCoreWork() {
    console.info('Helper Start')
    console.info(global.asyncWork())
    console.info('Helper End')
}

/**
 * @description 测试函数
 */
function test() {
    console.info('test Start')

    runAsyncWithSyncPattern(asyncWork, doCoreWork)

    console.info('test End')
    // process.exit(0)
}

test()

