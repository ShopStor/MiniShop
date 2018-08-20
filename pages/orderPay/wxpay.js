const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var util = require('../../utils/util.js');

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
   
    console.log(this.data.order_id.substring(0, 2))//截取2位
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
    var url = textUrl+'/oms/payInOnline'
    console.log(url)
    var data = {
      uuid: wx.getStorageSync('userarg'),
      orderAmout: self.data.amountStr,
      sn: self.data.order_id.substring(0, 2)
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

          self.data.payData = res.data
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
          wx.showModal({
            title: '提示',
            content: '支付失败',
          })
          //测试:https://ec-yii.shinho.net.cn
          //正式:https://m.shinshop.com/
          wx.redirectTo({
            url: '../index/wxWebView?url=' + 'https://ec-yii.shinho.net.cn/payment-error'
          })
        },
        'complete': function (res) {//上线注释
        }
      })
  },
  changeStatus(){//更改订单状态
    var self = this
    var url = 'https://ec-api.shinho.net.cn/v1/orders/small_program_order?status=success&orderid='+this.data.order_id
    //console.log('更改订单状态='+url)
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
        wx.redirectTo({
          url: '../index/wxWebView?url=' + 'https://ec-yii.shinho.net.cn/payment-success?order_id=' + self.data.order_id
        })
        console.log(res)
       
      }
    })
  }
})