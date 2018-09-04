const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var util = require('../../utils/util.js');
//text (测试)  formal(正式)
var apiType ='formal'
Page({
  data: {
      order_id:'',//订单号
      payData:{},//支付信息
      amountStr:'',//加密金额
  },
  onLoad: function (options) {
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    console.log(uuid)
    wx.showLoading({
      title: '加载中',
    })
    console.log(options.order_id)//订单id
    this.data.order_id = options.order_id   
    this.getamountStr()
  },
  getamountStr(){//根据订单号获取支付参数(加密金额)  (微商城接口)
    var self =this
    //https://ec-api.shinho.net.cn/v1/orders/small_program_order?orderid=   测试的
    //https://api.shinshop.com/v1/orders/small_program_order?orderid=  正式的
    var url =''
    if (apiType=='text'){
      url = 'https://ec-api.shinho.net.cn/v1/orders/small_program_order?orderid=' + this.data.order_id
    }else{
      url = 'https://api.shinshop.com/v1/orders/small_program_order?orderid=' + this.data.order_id
    }
    console.log(url)
    wx.request({
      url: url,
      method: "get",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"  //post
      },
      complete: function (res) {
        // if (res == null || res.data == null) {
        //   reject(new Error('网络请求失败'))
        // }
      },
      success: function (res) {
        console.log('金额:'+res.data)
        self.data.amountStr = res.data
        self.getPaydata()
        //self.changeStatus()
      }
    })
  },
  getPaydata(){//获取支付参数 (无人货架接口)
    var self = this
    var url = textUrl+'oms/payInOnline'
    //console.log(url)
    var data = {
      uuid: wx.getStorageSync('userarg'),
      orderAmout: self.data.amountStr,
      sn: self.data.order_id
    }
    console.log(data)
    wx.request({
      url: url,
      method: "post",
      data:data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"  //post
      },
      complete: function (res) {
        // if (res == null || res.data == null) {
        //   reject(new Error('网络请求失败'))
        // }
      },
      success: function (res) {
        console.log(res)
        if (res.data.state == "success"){//参数请求成功

          //self.data.payData = res.data
          self.setData({
            payData: res.data
          })
          console.log(self.data.payData.out_trade_no)
          self.pay()
        }else{
            wx.showModal({
              title: '支付参数错误',
              content: res.data.message,
              success: function (res) {
                // if (res.confirm) {
                //   console.log('用户点击确定')
                // } else if (res.cancel) {
                //   console.log('用户点击取消')
                // }
              }
            })
        } 
      }
    })
  },
  pay(){
    var self =this
    var payData = this.data.payData
    console.log(payData)
    wx.hideLoading()//隐藏等待框
    wx.setStorageSync('wxWebView_order', self.data.order_id )
    wx.requestPayment(
      {
        'timeStamp': payData.timeStamp,
        'nonceStr': payData.nonce_str,
        'package': 'prepay_id=' + payData.prepay_id,
        'signType': 'MD5',
        'paySign': payData.paySign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          })
          self.changeStatus()//改变订单状态
        },
        'fail': function (res) {
          console.log('支付错误')
          console.log(res.errMsg)
          wx.showToast({
            title: '支付失败',
            icon: 'success',
            duration: 2000
          })
          // wx.showModal({
          //   title: '提示',
          //   content: '支付失败',
          // })
          //测试:https://ec-yii.shinho.net.cn
          //正式:https://m.shinshop.com/
          //跳转失败(正式):https://m.shinshop.com/payment-error
          // wx.redirectTo({
          //   url: '../index/wxWebView?url=' + 'https://m.shinshop.com/payment-error'
          // })
          if (apiType == 'text') {
            wx.redirectTo({
              url: '../index/wxWebView?url=' + 'https://ec-yii.shinho.net.cn/payment-error'
            })
          } else {
            wx.redirectTo({
              url: '../index/wxWebView?url=' + 'https://m.shinshop.com/payment-error'
            })
          }
        },
        'complete': function (res) {//上线注释
        }
      })
  },
  changeStatus(){//更改订单状态
    wx.showLoading({
      title: '加载中',
    })
    var self = this
    //测试   https://ec-api.shinho.net.cn/v1/orders/small_program_order?status=success&orderid=
    //var url = 'https://api.shinshop.com/v1/orders/small_program_order?status=success&orderid='+this.data.order_id

    var url = ''
    if (apiType == 'text') {
      url = 'https://ec-api.shinho.net.cn/v1/orders/small_program_order?status=success&orderid=' + this.data.order_id + '&ordersn=' + this.data.payData.out_trade_no
    } else {
      url = 'https://api.shinshop.com/v1/orders/small_program_order?status=success&orderid=' + this.data.order_id + '&ordersn=' + this.data.payData.out_trade_no
    }
    console.log('更改订单状态='+url)
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
        console.log('更改支付状态')
        //测试:https://ec-yii.shinho.net.cn
          //正式:https://m.shinshop.com/     
          //跳转成功(正式):https://m.shinshop.com/payment-success
        // wx.redirectTo({
        //   url: '../index/wxWebView?url=' + 'https://m.shinshop.com/payment-success'
        // })
        wx.hideLoading()//隐藏等待框
        if (apiType == 'text') {
          wx.redirectTo({
            url: '../index/wxWebView?url=' + 'https://ec-yii.shinho.net.cn/payment-success'
          })
        } else {
          wx.redirectTo({
            url: '../index/wxWebView?url=' + 'https://m.shinshop.com/payment-success'
          })
        }
        console.log(res)
       
      }
    })
  }
})