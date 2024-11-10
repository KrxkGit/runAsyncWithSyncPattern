/**
 * 将异步函数转换为同步函数
 * @param asyncOperation 需要拦截的异步操作
 * @param func 包含异步操作函数的函数
 */
export function runAsyncWithSyncPattern(asyncOperation: Function, func: Function) {
    let originAsyncOperation = asyncOperation

    // 缓存记录
    const cache = {
        status: 'pending',
        value: null
    }

    // 封装异步操作函数
    function wrapAsyncOperation() {
        // 存在缓存，直接返回
        if (cache.status === 'fulfilled') {
            return cache.value
        } else if (cache.status === 'rejected') {
            throw cache.value
        }

        // 无缓存：发送请求
        const p = originAsyncOperation()
        p.then(resolve => {
            cache.value = resolve
            cache.status = 'fulfilled'
        }).catch(err => {
            cache.value = err
            cache.status = 'rejected'
        })

        // 中断执行
        throw p
    }

    // 改写包含异步操作的函数
    global[asyncOperation.name] = wrapAsyncOperation

    // // 运行改写后的函数
    try {
        func()
    } catch (err) {
        if (err instanceof Promise) {
            err.finally(() => {
                global[asyncOperation.name] = wrapAsyncOperation
                func()
                global[asyncOperation.name] = originAsyncOperation
            })
        }
    }

    // 修改回原函数
    global[asyncOperation.name] = originAsyncOperation
}
