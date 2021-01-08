import {getUrlParam} from './until'
// const sid = parseInt(getUrlParam('sid')) || 1
let domian = ""

// #ifdef APP-PLUS
    if(process.env.NODE_ENV === 'development'){
        domian = "https://red-crm.dev.xizi.com"
    }else{
        domian = "https://red-crm.hzdahongniang.com"

    }
// #endif

const request = (options, aid) => {
    return new Promise((resolve, reject) => {
        const method = options.method || 'GET'
        // let url = `${options.url}?sid=${sid}` || ''
        let url = `${domian}${(options.other && options.other.length>0)?options.url+options.other:options.url}`

        const data = {...options.data} || {}
        const showLoading = typeof(options.showLoading)=="undefined"?false:options.showLoading
        const showMessage = typeof(options.showMessage)=="undefined"?false:options.showMessage

        if(showLoading) {
            uni.showLoading()
        }
        uniRequest({
            url,
            method,
            data,
            showMessage
        }).then((res) => {
            if(showLoading) {
                uni.hideLoading()
            }
            resolve(res)
        }).catch((err) => {
            console.log('err', err)

            if(showLoading) {
                uni.hideLoading()
            }
            reject({
                code: err.code,
                msg: err.msg
            })
        })
    })
    
    
}

const uniRequest = (options) => {
    return new Promise((resolve, reject) => {
        uni.request({
            ...options,
            success: async (res) => {
                let statusCode =  res.statusCode
                const status = await statusChecked(res.statusCode)
                if(status){
                    const {
                        data,
                        code,
                        msg,
                        message
                    } = res.data
                    if(code == 0){

                        if(options.method == "POST" && options.showMessage){
                            uni.showToast({
                                title: msg || message,
                                icon: 'none',
                                mask: true,
                                complete: () => {
                                    // setTimeout(() => {
                                    resolve(data) 
                                    // }, 1500)
                                }
                            })
                        }else{
                            resolve(data)
                            
                        }
                    }else{

                        if(code == '20001') {
                            uni.reLaunch({
                                url: '/pages/index/index'
                            })
                        }else if(code == '20005'){
                            uni.reLaunch({
                                url: '/pages/client/select'
                            })
                        }
                       
                        uni.showToast({
                            title: msg || message,
                            icon: 'none'
                        })

                        reject({
                            code,
                            msg: msg || message
                        })
                    }
                }else{
                    uni.showToast({
                        title: statusCode==403?"请登录~":res.data.msg || "网络异常，请稍后重试~",
                        icon: 'none'
                    })

                    reject({
                        code: '-1',
                        msg: '网络异常，请稍后重试~'
                    })
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: statusCode==403?"请登录~":"网络异常，请稍后重试",
                    icon: 'none'
                })
                
                
                reject({
                    code: '-1',
                    msg: '网络异常，请稍后重试'
                })
            }
        })
    })
}

// 状态码检查
const statusChecked = (code) => {
    switch (code) {
        case 200:
            return true
        case 403:

            uni.reLaunch({
                url: '/pages/index/index',
                complete: (e) => {
                    console.log(e)
                }
            })
            
        return false
        case 401:
            setTimeout(() => {
                uni.reLaunch({
                    url: '/pages/client/select'
                })
            }, 500)
            
        return false
        default:
            return false
    }
}


export default request