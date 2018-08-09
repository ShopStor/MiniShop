const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
Page({
  data: {

  },
  onLoad: function (option) {
    //console.log(JSON.stringify(option))
    // var pages = getCurrentPages()    //获取加载的页面
    // var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    // var url = currentPage.route    //当前页面url
    var padata =  wx.getStorageSync('xiaochengxu')
    console.log(padata)
    
    wx.showModal({
      title: '支付信息',
      content: JSON.stringify(padata),
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  pay(){
    var payData = this.payData
    wx.requestPayment(
      {
        'timeStamp': payData.timeStamp,
        'nonceStr': payData.nonce_str,
        'package': 'prepay_id=' + payData.prepay_id,
        'signType': 'MD5',
        'paySign': payData.paySign,
        'success': function (res) {

        },
        'fail': function (res) {
          console.log('支付错误')
          self.setData({
            backState: true
          })
          wx.redirectTo({//跳转首页
            url: '../index/index'
          })
          console.log(res.errMsg)
          wx.showModal({
            title: '提示',
            content: '支付失败',
          })
        },
        'complete': function (res) {//上线注释
        }
      })
  }

})