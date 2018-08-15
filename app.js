//app.js
App({
  upInfomation: function () {//更新用户信息  自动获取优惠券(调用此接口后code失效)弃用
    var self =this
    console.log('用户信息更新')
    wx.getStorage(
      {
        key: 'code',//
        success: function (res) {
          console.log(res.data)
          wx.request({
            url: self.globalData.textUrl + 'user/checkRegister?code=' + res.data,
            
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"  //post
            },
            success: function (res) {
              //console.log(res)
              wx.showToast({
                title: '用户信息更新',
                duration: 1000,
              })

            }
          })
        }
      })
  },
  onLaunch: function () {
    // 展示本地存储能力
    var self = this
    var logs = wx.getStorageSync('logs') || []
    var uuid = wx.getStorageSync('userarg') || ''
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // // 登录
    // wx.login({
    //   success: function (res) {
    //     if (res.code) {
    //       wx.setStorageSync('code', res.code)
    //        console.log(res)
    //     } else {
    //       // console.log('登录失败！' + res.errMsg)
    //     }
    //   }
    // });
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
   
    // that.setData({//本地存储给data赋值
    //   uuid: uuid
    // })  https://minisuper.shinshop.com/web/
  },
 
  globalData: {
    userInfo: null,
    userTel:null,
    imgUrl: 'http://s3.cn-north-1.amazonaws.com.cn/s3-004-shinho-dubbo-prd-bjs/datas/image/adsense/',

    textUrl: 'https://minisuperuat.shinshop.com/web/',//测试域名
    smallImgUrl: 'https://minisuperuat.shinshop.com/web/imsmanager/image_',//测试

    // textUrl:'https://minisuper.shinshop.com/web/',//正式域名
    // smallImgUrl: 'https://minisuper.shinshop.com/web/imsmanager/image_',//正式
    uuid: wx.getStorageSync('userarg') || '',//wx.getStorageSync('userarg') || ''  e867964cd1bd460d9c8ecd6ed4848e5a
  }
})