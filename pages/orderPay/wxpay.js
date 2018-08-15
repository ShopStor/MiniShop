const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
Page({
  data: {
      order_id:'',//订单号
      payData:{},//支付信息
      amountStr:'',//加密金额
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    console.log(options.order_id)//订单id
    this.data.order_id = options.order_id
    this.getamountStr()
  },
  getamountStr(){//根据订单号获取支付参数(加密金额)  (微商城接口)
    var self =this
    var url = 'https://ec-api.shinho.net.cn/v1/orders/small_program_order?orderid=' + this.data.order_id
    console.log(url)
    wx.request({
      url: url,
      method: "get",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"  //post
      },
      complete: function (res) {
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        wx.hideLoading()//隐藏等待框
        console.log(res.data)
        self.data.amountStr = res.data
      }
    })
  },
  getPaydata(){//获取支付参数 (无人货架接口)
    var self = this
    var url = 'https://ec-api.shinho.net.cn/v1/orders/small_program_order?orderid=' + this.data.order_id
    console.log(url)
    wx.request({
      url: url,
      method: "get",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"  //post
      },
      complete: function (res) {
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        wx.hideLoading()//隐藏等待框
        console.log(res)
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
          // wx.redirectTo({//跳转首页
          //   url: '../index/index'
          // })
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