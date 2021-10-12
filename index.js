// node 自带包
const path = require('path');
const fs = require('fs');
const stdin = require('process').stdin;
const execPath = require('process').execPath  // 用于 pkg

// pkg 的原因导致路径需要修改
// const pathToWriteFile = path.join(__dirname)  // 使用 node 运行的写入路径
const pathToWriteFile = path.join(execPath, '..')  // 使用 pkg 打包运行的写入路径

// npm install 包
const axios = require('axios');

// 请求超时 2min
axios.defaults.timeout = 120_000

// hosts 文件地址
const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'
// 源地址
const resUrl1 = 'https://github.com/ButterAndButterfly/GithubHost/releases/download/v1/host1.txt'
// 镜像地址
const resUrl2 = 'https://hub.fastgit.org/ButterAndButterfly/GithubHost/releases/download/v1/host.txt'
// 使用说明
const README = '#\n' +
    '# author: lopo\n' +
    '# version: 1.0.0\n' +
    '#\n' +
    '# 使用方法 - 修改本机hosts文件并刷新\n' +
    '1. 打开文件资源管理器, 在路径中输入 C:\\Windows\\System32\\drivers\\etc 并回车跳转\n' +
    '2. 右键 hosts 文件, 选择打开方式 -- 记事本\n' +
    '3. 打开 github_hosts.txt 将其中的内容全部复制添加到 hosts 中并保存\n' +
    '4. win+r 打开 "运行", 并输入 cmd/powershell 打开控制台\n' +
    '5. 输入 ipconfig /flushdns 刷新 dns 缓存\n' +
    '\n# 可选\n' +
    '1. 打开搜索, 输入 "环境变量", 点击其中的 "编辑系统环境变量"\n' +
    '2. 弹出的窗口点击 "环境变量" 按钮\n' +
    '3. 在 "用户变量" 或 "系统变量" 中新建变量如下\n' +
    '    -- 变量名: HOST_PATH (!变量名不能取为 HOST, 会导致某些本机程序解析 dns 时冲突, 无法解析 localhost)\n' +
    '    -- 变量值: C:\\Windows\\System32\\drivers\\etc\n' +
    '4. 在对应的域中找到Path变量并双击打开 (用户变量中建的 HOST_PATH 就在用户变量中找 Path; 系统变量中建的 HOST_PATH 就在系统\n' +
    '变量中找 Path)\n' +
    '5. 在新的弹窗中点击新建, 输入 %HOST_PATH%\n' +
    '6. 把所有的窗口都确定掉\n' +
    '7. 此时你可以直接在 Explorer 的输入栏中直接输入 %HOST_PATH% 来打开 hosts 文件所在的目录(这一个可选就这点作用, 所以是可选 ^u^! )'

/**
 * @description 尝试请求host文件 (源地址 -> 备用)
 * @returns {Promise<string>}
 */
const requestHostFile = () => {
    return new Promise((resolve, reject) => {
        console.log('开始请求源地址...')
        axios.get(resUrl1)
            .then((res1) => {
                resolve(res1.data)
            })
            .catch((err1) => {
                console.log('请求源地址失败, 尝试请求备用地址...')
                return axios.get(resUrl2)
            })
            .then((res2) => {
                resolve(res2.data)
            })
            .catch((err) => {
                console.log('请求备用地址失败, 本次请求结束...')
                reject(err)
            })
    })
}

/**
 * @description 将 hosts数据和readme写入文件
 * @param data hosts数据
 */
const writeIntoFile = (data) => {
    // 写入 hosts
    try {
        console.log('[1/2] 写入文件中')
        fs.writeFileSync(
            path.join(pathToWriteFile, './github_hosts.txt'),
            data
        )
    } catch(e) {
        console.log(e)
        console.log('写入hosts文件出错, maybe再来一次...')
        return false
    }

    // 写入 readme
    try {
        console.log('[2/2] 写入文件中')
        fs.writeFileSync(
            path.join(pathToWriteFile, './README.txt'),
            README
        )
    } catch(e) {
        console.log('很不幸, 写入README文件出错, 所幸 github_hosts.txt 没问题, 希望你会用...')
        return false
    }

    // 结果
    console.log('全部文件写入成功...')
    return true
}

/**
 * @description 循环尝试请求数据, 返回结果
 * @returns {Promise<string>}
 */
const getResult = () => {
    return new Promise(async (resolve, reject) => {
        console.log('即将开始请求(最多重试9次, 每次请求超时时间为2min), 可随时使用Ctrl+C中断退出...')
        for(let i = 1; i < 11; i ++) {
            let flag = false

            console.log(`[${i}/10] 开始第${i}次请求...`)
            await requestHostFile()
                .then((res) => {
                    flag = true
                    console.log(`[${i}/10] 第${i}次请求成功...`)
                    resolve(res)
                })
                .catch((err) => {
                    console.log(`[${i}/10] 第${i}次请求失败, 即将重试...`)
                })

            if(flag) break
        }
    })
}

/**
 * @description 读取本机当前的 hosts 文件
 * @returns {Promise<string>}
 */
const getOldHosts = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.readFileSync(
                hostsPath,
                {
                    encoding: 'utf-8'
                }
            ))
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * @description 更新某一片段
 * @param oldHosts 旧的全部
 * @param newParam 新的替换片段
 * @returns {string} 新的全部
 */
const updateSpecificStr = (oldHosts, newParam) => {
    let startIndex = oldHosts.indexOf('# GitHub Start')
    let endIndex = oldHosts.indexOf('# GitHub End') + 12

    // 之前没有 -- 附加
    if(startIndex === -1) {
        return oldHosts + '\n\n' + newParam
    }
    // 之前有 -- 替换
    else {
        return oldHosts.slice(0, startIndex) + newParam + oldHosts.slice(endIndex, oldHosts.length)
    }
}

/**
 * @description 直接修改本机的 hosts
 */
const writeHosts = async (newHostsParam) => {
    await getOldHosts()
        .then((oldHosts) => {
            let newHosts = updateSpecificStr(oldHosts, newHostsParam)
            return Promise.resolve(newHosts)
        })
        .then((newHosts) => {
            console.log('正在写入...')
            try {
                fs.writeFileSync(
                    hostsPath,
                    newHosts,
                    {
                        encoding: 'utf-8'
                    }
                )
                console.log('写入结束, hosts 更新完成...')
            } catch (e) {
                console.log('写入 hosts 文件出错, 请参照 README.txt 手动进行修改......')
            }
        })
        .catch((err) => {
            console.log('此程序无操作权限, 请参照 README.txt 手动进行修改...')
        })
}

/**
 * @description 2选1
 */
const select1or2 = (newHostsParam) => {
    console.log('请选择并输入 a 或 b:\n')
    console.log('a. 尝试自动修改 hosts')
    console.log('b. 自行手动修改 hosts')

    stdin.setRawMode(false)
    stdin.setEncoding('utf-8')
    stdin.resume()
    stdin.on('data', (chunk) => {
        let select = chunk.slice(0, -2)
        if(select === 'a') {
            writeHosts(newHostsParam)
                .then(() => {
                    anyKeyToExist()
                    // stdin.emit('end')
                })
        }
        else if(select === 'b') {
            console.log('请查看README.txt文档进行修改(已经会改的可忽略此文件)')
            stdin.emit('end')
        }
        else {
            console.log('请输入正确的选项')
        }
    })
}

/**
 * @description 按任意键退出
 */
const anyKeyToExist = () => {
    console.log('按任意键退出...')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.once('data', (chunk) => {
        stdin.emit('end')
    })
}

// 主函数
;(() => {
    getResult()
        .then(async (hostsData) => {
            // 写入结果和使用方法
            let result = writeIntoFile(hostsData)

            if(result) {  // 成功 - 2选1
                select1or2(hostsData)
            }
            else {  // 失败 - 直接退出
                anyKeyToExist()
            }
        })
        .catch(() => {
            // 失败 - 直接退出
            anyKeyToExist()
        })
})()

